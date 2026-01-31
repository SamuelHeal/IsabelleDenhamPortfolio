// ═══════════════════════════════════════════════════════════════════════════
// MAIN.JS — Shared functionality for all pages
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager } from './content-manager.js';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE SITE
// ─────────────────────────────────────────────────────────────────────────────

async function initializeSite() {
  try {
    // Load content from Supabase
    await contentManager.loadContent();
    
    // Initialize common elements
    initNavigation();
    initScrollEffects();
    populateFooter();
    
    // Hide loader
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('hidden');
    }
    
    // Dispatch event for page-specific scripts
    document.dispatchEvent(new CustomEvent('content-ready'));
    
  } catch (error) {
    console.error('Failed to initialize site:', error);
    // Show error message to user
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.innerHTML = `
        <div style="text-align: center; color: #ff1b6b;">
          <p style="margin-bottom: 1rem;">Failed to load content</p>
          <button onclick="location.reload()" class="btn btn--primary">Retry</button>
        </div>
      `;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    
    // Close on link click
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  
  // Set active link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL EFFECTS
// ─────────────────────────────────────────────────────────────────────────────

function initScrollEffects() {
  // Intersection Observer for fade-in animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  
  // Observe elements with animation classes
  document.querySelectorAll('.about__content, .about__image-wrapper, [data-animate]').forEach(el => {
    observer.observe(el);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function populateFooter() {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  // Update heading
  const heading = footer.querySelector('.footer__heading');
  if (heading && settings.footer_heading) {
    heading.textContent = settings.footer_heading;
  }
  
  // Update email
  const email = footer.querySelector('.footer__email');
  if (email && settings.contact_email) {
    email.href = `mailto:${settings.contact_email}`;
    email.textContent = settings.contact_email;
  }
  
  // Update social links
  const socialLinks = {
    'social-instagram': settings.social_instagram,
    'social-linkedin': settings.social_linkedin
  };
  
  Object.entries(socialLinks).forEach(([id, url]) => {
    const link = footer.querySelector(`#${id}`);
    if (link && url) {
      link.href = url;
    }
  });
  
  // Update copyright
  const copyright = footer.querySelector('.footer__copyright');
  if (copyright && settings.footer_copyright) {
    copyright.textContent = settings.footer_copyright;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Video embed helper
export function createVideoEmbed(videoType, videoId, autoplay = false) {
  if (videoType === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1&mute=1' : ''}`;
  } else if (videoType === 'googledrive') {
    return `https://drive.google.com/file/d/${videoId}/preview`;
  }
  return '';
}

// Convert newlines to <br> for HTML display (preserves line breaks in text)
export function formatTextWithLineBreaks(text) {
  if (!text) return '';
  // Escape HTML to prevent XSS, then convert newlines to <br>
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

// Convert Google Drive share links to direct image URLs
export function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  // Already using lh3.googleusercontent.com (direct image URL)
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }
  
  // Not a Google Drive URL
  if (!url.includes('drive.google.com')) {
    return url;
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId = null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    fileId = fileIdMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openIdMatch) {
      fileId = openIdMatch[1];
    }
  }
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  if (!fileId) {
    const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }
  }
  
  // If we found a file ID, return the direct image URL via lh3.googleusercontent.com
  // This is more reliable than the uc?export=view method which Google has restricted
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  // Return original URL if we couldn't parse it
  return url;
}

// Social icons SVG
export const socialIcons = {
  vimeo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
};

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initializeSite);

export { contentManager };


