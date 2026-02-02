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
  
  // Update video or poster image
  const mediaContainer = document.getElementById('project-video');
  const heroContainer = document.getElementById('project-hero');
  
  if (mediaContainer) {
    if (project.video_id) {
      // Show video embed
      const embedUrl = createVideoEmbed(project.video_type, project.video_id);
      mediaContainer.innerHTML = `
        <iframe 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
      mediaContainer.classList.add('project-page__media--video');
      if (heroContainer) heroContainer.classList.add('project-page__hero--video');
    } else if (project.thumbnail_url) {
      // Show poster image instead - detect orientation on load
      const posterUrl = convertGoogleDriveUrl(project.thumbnail_url);
      const img = document.createElement('img');
      img.src = posterUrl;
      img.alt = `${project.title} poster`;
      img.className = 'project-page__poster-image';
      
      img.onload = function() {
        const isPortrait = img.naturalHeight > img.naturalWidth;
        
        if (isPortrait && heroContainer) {
          // Portrait: apply two-column layout
          heroContainer.classList.add('project-page__hero--portrait');
          mediaContainer.classList.add('project-page__media--portrait');
        } else if (heroContainer) {
          // Landscape: keep stacked layout
          heroContainer.classList.add('project-page__hero--landscape');
          mediaContainer.classList.add('project-page__media--landscape');
        }
      };
      
      mediaContainer.innerHTML = '';
      mediaContainer.appendChild(img);
      mediaContainer.classList.add('project-page__media--poster');
    } else {
      // Hide container if neither video nor poster
      mediaContainer.style.display = 'none';
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
  
  // Update nominations (displayed above description with laurel styling)
  const nominationsSection = document.getElementById('project-nominations');
  if (nominationsSection) {
    const nominations = project.nominations;
    
    if (nominations && nominations.trim()) {
      // Split by newlines and filter empty lines
      const nominationsList = nominations.split('\n').filter(n => n.trim());
      
      nominationsSection.innerHTML = `
        <div class="project-page__nominations">
          ${nominationsList.map(nomination => `
            <div class="project-page__nomination">
              <div class="nomination__laurel nomination__laurel--left">
                <svg viewBox="0 0 40 80" fill="currentColor">
                  <path d="M38 40c0-8-4-15-10-20 2-4 2-9 0-13-4 6-10 10-18 10 0 6 2 11 6 15-4 4-6 9-6 15s2 11 6 15c-4 4-6 9-6 15 8 0 14-4 18-10 2-4 2-9 0-13 6-5 10-12 10-20z"/>
                </svg>
              </div>
              <span class="nomination__text">${nomination.trim()}</span>
              <div class="nomination__laurel nomination__laurel--right">
                <svg viewBox="0 0 40 80" fill="currentColor">
                  <path d="M2 40c0-8 4-15 10-20-2-4-2-9 0-13 4 6 10 10 18 10 0 6-2 11-6 15 4 4 6 9 6 15s-2 11-6 15c4 4 6 9 6 15-8 0-14-4-18-10-2-4-2-9 0-13-6-5-10-12-10-20z"/>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      nominationsSection.style.display = 'block';
    } else {
      nominationsSection.style.display = 'none';
    }
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


