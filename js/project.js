// ═══════════════════════════════════════════════════════════════════════════
// PROJECT.JS — Project detail page functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, createVideoEmbed, formatTextWithLineBreaks, convertGoogleDriveUrl } from './main.js';

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
  
  // Update video OR external link cover
  const videoContainer = document.getElementById('project-video');
  if (videoContainer) {
    // Check if this is an external URL project (cover photo links out)
    if (project.external_url) {
      const thumbnailUrl = project.thumbnail_url 
        ? convertGoogleDriveUrl(project.thumbnail_url)
        : 'https://placehold.co/1100x468/030303/f5f0e8?text=No+Image';
      
      videoContainer.classList.add('project-page__video--external');
      videoContainer.innerHTML = `
        <a href="${project.external_url}" 
           class="project-page__external-link" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Visit external website for ${project.title}">
          <img 
            src="${thumbnailUrl}" 
            alt="${project.title}" 
            class="project-page__cover"
            onerror="this.src='https://placehold.co/1100x468/030303/f5f0e8?text=No+Image'"
          >
          <div class="project-page__external-overlay">
            <div class="project-page__external-indicator">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              <span>View Project</span>
            </div>
          </div>
        </a>
      `;
    } else if (project.video_id) {
      // Standard video embed
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


