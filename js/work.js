// ═══════════════════════════════════════════════════════════════════════════
// WORK.JS — Work page functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager } from './main.js';

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
// WORK GRID
// ─────────────────────────────────────────────────────────────────────────────

function renderWorkGrid() {
  const projects = contentManager.getProjects();
  const grid = document.getElementById('work-grid');
  
  if (!grid || !projects.length) return;
  
  grid.innerHTML = projects.map(project => `
    <a href="project.html?id=${project.id}" class="work-card">
      <div class="work-card__media">
        <img 
          src="${project.thumbnail_url || 'https://placehold.co/800x450/1a1a1a/ff1b6b?text=' + encodeURIComponent(project.title)}" 
          alt="${project.title}"
          loading="lazy"
        />
      </div>
      <div class="work-card__overlay">
        <span class="work-card__type">${project.type}</span>
        <h3 class="work-card__title">${project.title}</h3>
      </div>
    </a>
  `).join('');
}


