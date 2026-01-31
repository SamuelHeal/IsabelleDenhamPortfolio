// ═══════════════════════════════════════════════════════════════════════════
// HOME.JS — Home page specific functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, createVideoEmbed, formatTextWithLineBreaks, convertGoogleDriveUrl } from './main.js';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('content-ready', () => {
  renderHero();
  renderAbout();
  renderFeaturedWork();
});

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

function renderHero() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  // Update hero video
  const videoContainer = document.getElementById('hero-video');
  if (videoContainer && settings.hero_video_id) {
    const embedUrl = createVideoEmbed(settings.hero_video_type, settings.hero_video_id, true);
    videoContainer.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  }
  
  // Update scroll hint
  const scrollHint = document.querySelector('.hero__scroll-hint span');
  if (scrollHint) {
    scrollHint.textContent = 'About me';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT SECTION
// ─────────────────────────────────────────────────────────────────────────────

function renderAbout() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  // Update heading
  const heading = document.getElementById('about-heading');
  if (heading && settings.about_heading) {
    heading.textContent = settings.about_heading;
  }
  
  // Update bio (with line break support)
  const bio = document.getElementById('about-bio');
  if (bio && settings.about_bio) {
    bio.innerHTML = formatTextWithLineBreaks(settings.about_bio);
  }
  
  // Update portrait (with Google Drive URL conversion)
  const portrait = document.getElementById('about-portrait');
  if (portrait && settings.about_portrait_url) {
    portrait.src = convertGoogleDriveUrl(settings.about_portrait_url);
    portrait.alt = `${settings.site_name} - Portrait`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED WORK SECTION
// ─────────────────────────────────────────────────────────────────────────────

function renderFeaturedWork() {
  const featured = contentManager.getFeaturedProjects();
  const carousel = document.getElementById('featured-carousel');
  
  if (!carousel || !featured.length) return;
  
  carousel.innerHTML = featured.map((project, index) => {
    const thumbnailUrl = project.thumbnail_url 
      ? convertGoogleDriveUrl(project.thumbnail_url)
      : `https://placehold.co/400x600/0a0a0a/d4a574?text=${encodeURIComponent(project.title)}`;
    
    return `
      <a href="project.html?id=${project.id}" class="featured-poster" data-index="${index}">
        <div class="featured-poster__media">
          <img 
            src="${thumbnailUrl}" 
            alt="${project.title}"
            loading="lazy"
          />
        </div>
        <div class="featured-poster__overlay">
          <span class="featured-poster__type">${project.type}</span>
          <h3 class="featured-poster__title">${project.title}</h3>
          <span class="featured-poster__cta">
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


