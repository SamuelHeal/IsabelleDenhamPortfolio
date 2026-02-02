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
  const fromPage = urlParams.get('from');
  
  if (!projectId) {
    window.location.href = 'work.html';
    return;
  }
  
  const project = contentManager.getProjectById(projectId);
  
  if (!project) {
    window.location.href = 'work.html';
    return;
  }
  
  // Update back button based on referrer
  const backButton = document.querySelector('.project-page__back');
  if (backButton && fromPage === 'home') {
    backButton.href = 'index.html';
    backButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Home
    `;
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
  
  // Update awards (displayed in award wreath grid)
  const nominationsSection = document.getElementById('project-nominations');
  if (nominationsSection) {
    // Support both new awards array format and legacy nominations string
    let awardsList = [];
    
    if (Array.isArray(project.awards) && project.awards.length > 0) {
      awardsList = project.awards;
    } else if (project.nominations && project.nominations.trim()) {
      // Legacy format: convert plain text to awards array
      const lines = project.nominations.split('\n').filter(n => n.trim());
      awardsList = lines.map(line => {
        const parts = line.trim().split(' - ');
        return {
          name: parts[0] || line.trim(),
          source: parts[1] || '',
          status: 'nominated'
        };
      });
    }
    
    if (awardsList.length > 0) {
      nominationsSection.innerHTML = `
        <div class="project-page__nominations">
          ${awardsList.map(award => {
            const isWon = award.status === 'won';
            const statusClass = isWon ? 'project-page__nomination--won' : 'project-page__nomination--nominated';
            const statusLabel = isWon ? 'Winner' : 'Nominated';
            
            return `
            <div class="project-page__nomination ${statusClass}">
              <div class="nomination__wreath-container">
                <div class="nomination__wreath">
                  <img src="https://res.cloudinary.com/dzgjkx0pm/image/upload/v1748274197/award_ox3egn.png" alt="" aria-hidden="true" />
                </div>
                <div class="nomination__stars">
                  <span class="nomination__star nomination__star--small">★</span>
                  <span class="nomination__star nomination__star--large">★</span>
                  <span class="nomination__star nomination__star--small">★</span>
                </div>
                <div class="nomination__content">
                  <span class="nomination__status-badge">${statusLabel}</span>
                  <span class="nomination__title">${award.name.replace(/ /g, '<br />')}</span>
                </div>
              </div>
              ${award.source ? `<span class="nomination__source">${award.source}</span>` : ''}
            </div>
          `}).join('')}
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


