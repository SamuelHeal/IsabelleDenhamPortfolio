// ═══════════════════════════════════════════════════════════════════════════
// PROJECT.JS — Project detail page functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, createVideoEmbed, formatTextWithLineBreaks } from './main.js';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE PROJECT PAGE
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('content-ready', () => {
  renderProjectPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// RENDER PROJECT
// ─────────────────────────────────────────────────────────────────────────────

function renderProjectPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  if (!projectId) {
    window.location.href = 'work.html';
    return;
  }
  
  const project = contentManager.getProjectById(projectId);
  
  if (!project) {
    window.location.href = 'work.html';
    return;
  }
  
  // Update page title
  document.title = `${project.title} — Isabelle Denham`;
  
  // Update video
  const videoContainer = document.getElementById('project-video');
  if (videoContainer && project.video_id) {
    const embedUrl = createVideoEmbed(project.video_type, project.video_id);
    videoContainer.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  }
  
  // Update text content
  const title = document.getElementById('project-title');
  if (title) title.textContent = project.title;
  
  const subtitle = document.getElementById('project-subtitle');
  if (subtitle) {
    subtitle.textContent = project.subtitle || '';
    subtitle.style.display = project.subtitle ? 'block' : 'none';
  }
  
  // Update meta
  const meta = document.getElementById('project-meta');
  if (meta) {
    meta.innerHTML = `
      <span>${project.type}</span>
      <span>${project.year}</span>
      <span>${project.role}</span>
    `;
  }
  
  // Update description (with line break support)
  const description = document.getElementById('project-description');
  if (description) {
    description.innerHTML = formatTextWithLineBreaks(project.description || '');
  }
  
  // Update credits
  const creditsSection = document.getElementById('project-credits');
  if (creditsSection) {
    const credits = project.credits || [];
    
    if (credits.length > 0) {
      creditsSection.innerHTML = `
        <h3>Credits</h3>
        <div class="project-page__credits-list">
          ${credits.map(credit => `
            <div class="project-page__credit">
              <span class="project-page__credit-role">${credit.role}:</span>
              ${credit.name}
            </div>
          `).join('')}
        </div>
      `;
      creditsSection.style.display = 'block';
    } else {
      creditsSection.style.display = 'none';
    }
  }
}


