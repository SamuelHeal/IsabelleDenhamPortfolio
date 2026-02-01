// ═══════════════════════════════════════════════════════════════════════════
// WORK.JS — Work page functionality with CSS columns masonry
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, convertGoogleDriveUrl } from './main.js';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE WORK PAGE
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('content-ready', () => {
  renderPageHeader();
  renderWorkGrid();
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────

function renderPageHeader() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  const heading = document.getElementById('work-heading');
  if (heading && settings.work_page_heading) {
    heading.textContent = settings.work_page_heading;
  }
  
  const subheading = document.getElementById('work-subheading');
  if (subheading && settings.work_page_subheading) {
    subheading.textContent = settings.work_page_subheading;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK GRID — Cards sized to fit their images naturally
// ─────────────────────────────────────────────────────────────────────────────

function renderWorkGrid() {
  const projects = contentManager.getProjects();
  const grid = document.getElementById('work-grid');
  
  if (!grid || !projects.length) return;
  
  grid.innerHTML = projects.map(project => {
    const thumbnailUrl = project.thumbnail_url 
      ? convertGoogleDriveUrl(project.thumbnail_url)
      : `https://placehold.co/400x600/0a0a0a/d4a574?text=${encodeURIComponent(project.title)}`;
    
    return `
      <a href="project.html?id=${project.id}" class="work-card" data-project-id="${project.id}">
        <div class="work-card__media">
          <img 
            src="${thumbnailUrl}" 
            alt="${project.title}"
            loading="lazy"
          />
        </div>
        <div class="work-card__overlay">
          <span class="work-card__type">${project.type}</span>
          <h3 class="work-card__title">${project.title}</h3>
          <span class="work-card__view">
            View Project
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </a>
    `;
  }).join('');
}


