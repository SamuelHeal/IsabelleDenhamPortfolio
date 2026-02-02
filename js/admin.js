// ═══════════════════════════════════════════════════════════════════════════
// ADMIN.JS — Admin panel functionality
// ═══════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase-client.js';
import { contentManager } from './content-manager.js';

// Convert Google Drive share links to direct image URLs
function convertGoogleDriveUrl(url) {
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

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

let currentUser = null;
let activePanel = 'site';
let editingProject = null;

// Supabase Edge Function URL
const SUPABASE_URL = "https://pandxectpkqgzwdordmp.supabase.co";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/download-video`;

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in
  const session = await supabase.getSession();
  
  if (session) {
    currentUser = session;
    await initAdmin();
  } else {
    showLogin();
  }
  
  // Setup event listeners
  setupAuthListeners();
  setupNavigation();
  setupProjectListeners();
  setupVideoImport();
  setupColorPicker();
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('admin').classList.remove('active');
}

function showAdmin() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin').classList.add('active');
}

function setupAuthListeners() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('login-password');
  
  // Password visibility toggle
  passwordToggle?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    const eyeIcon = document.getElementById('password-eye-icon');
    const eyeOffIcon = document.getElementById('password-eye-off-icon');
    
    if (isPassword) {
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'block';
    } else {
      eyeIcon.style.display = 'block';
      eyeOffIcon.style.display = 'none';
    }
  });
  
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
      await supabase.signIn(email, password);
      currentUser = await supabase.getSession();
      await initAdmin();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
  
  logoutBtn?.addEventListener('click', async () => {
    await supabase.signOut();
    currentUser = null;
    showLogin();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

async function initAdmin() {
  try {
    await contentManager.loadContent();
    showAdmin();
    populateSiteSettings();
    populateHomeSettings();
    populateWorkSettings();
    populateContactSettings();
    renderProjectsList();
  } catch (error) {
    console.error('Failed to init admin:', error);
    showAlert('error', 'Failed to load content. Please refresh the page.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav__item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      switchPanel(panel);
    });
  });
}

function switchPanel(panelName) {
  activePanel = panelName;
  
  // Update nav
  document.querySelectorAll('.sidebar-nav__item').forEach(item => {
    item.classList.toggle('active', item.dataset.panel === panelName);
  });
  
  // Update panels
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${panelName}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POPULATE FORMS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ACCENT_COLOR = '#d4a574';

function populateSiteSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('site-name').value = settings.site_name || '';
  document.getElementById('site-tagline').value = settings.tagline || '';
  document.getElementById('contact-email').value = settings.contact_email || '';
  document.getElementById('form-endpoint').value = settings.form_endpoint || '';
  document.getElementById('social-instagram').value = settings.social_instagram || '';
  document.getElementById('social-linkedin').value = settings.social_linkedin || '';
  document.getElementById('footer-heading').value = settings.footer_heading || '';
  document.getElementById('footer-copyright').value = settings.footer_copyright || '';
  
  // Accent color
  const accentColor = settings.accent_color || DEFAULT_ACCENT_COLOR;
  updateColorPicker(accentColor);
}

function updateColorPicker(color) {
  const colorInput = document.getElementById('accent-color');
  const colorSwatch = document.getElementById('color-swatch');
  const colorValue = document.getElementById('color-value');
  
  if (colorInput) colorInput.value = color;
  if (colorSwatch) colorSwatch.style.backgroundColor = color;
  if (colorValue) colorValue.textContent = color.toUpperCase();
  
  // Apply live preview to admin page
  applyAdminAccentColor(color);
}

function applyAdminAccentColor(hexColor) {
  // Parse hex to RGB
  const rgb = hexToRgb(hexColor);
  if (!rgb) return;
  
  // Generate hover color (lighter version)
  const hoverColor = adjustLightness(hexColor, 15);
  
  // Apply to admin CSS custom properties
  const root = document.documentElement;
  root.style.setProperty('--admin-accent', hexColor);
  root.style.setProperty('--admin-accent-hover', hoverColor);
  root.style.setProperty('--admin-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--admin-accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
}

// Color utility functions
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function adjustLightness(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  l = Math.min(1, Math.max(0, l + percent / 100));
  
  let r2, g2, b2;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1/3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

function setupColorPicker() {
  const colorInput = document.getElementById('accent-color');
  const resetBtn = document.getElementById('reset-color-btn');
  
  // Update preview when color changes
  colorInput?.addEventListener('input', (e) => {
    updateColorPicker(e.target.value);
  });
  
  // Reset to default
  resetBtn?.addEventListener('click', () => {
    updateColorPicker(DEFAULT_ACCENT_COLOR);
  });
}

function populateHomeSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('hero-video-type').value = settings.hero_video_type || 'youtube';
  document.getElementById('hero-video-id').value = settings.hero_video_id || '';
  document.getElementById('hero-video-mobile').value = settings.hero_video_mobile || '';
  document.getElementById('hero-poster-url').value = settings.hero_poster_url || '';
  document.getElementById('about-heading').value = settings.about_heading || '';
  document.getElementById('about-bio').value = settings.about_bio || '';
  document.getElementById('about-portrait-url').value = settings.about_portrait_url || '';
  
  // Preview portrait
  updatePreview('about-portrait-url', 'portrait-preview');
}

function populateWorkSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('work-heading').value = settings.work_page_heading || '';
  document.getElementById('work-subheading').value = settings.work_page_subheading || '';
}

function populateContactSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('contact-heading').value = settings.contact_page_heading || '';
  document.getElementById('contact-subheading').value = settings.contact_page_subheading || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

window.saveSiteSettings = async function() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  try {
    await contentManager.updateSettings({
      site_name: document.getElementById('site-name').value,
      tagline: document.getElementById('site-tagline').value,
      contact_email: document.getElementById('contact-email').value,
      form_endpoint: document.getElementById('form-endpoint').value,
      social_instagram: document.getElementById('social-instagram').value,
      social_linkedin: document.getElementById('social-linkedin').value,
      footer_heading: document.getElementById('footer-heading').value,
      footer_copyright: document.getElementById('footer-copyright').value,
      accent_color: document.getElementById('accent-color').value
    });
    showAlert('success', 'Site settings saved!');
  } catch (error) {
    showAlert('error', 'Failed to save: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
};

window.saveHomeSettings = async function() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  try {
    await contentManager.updateSettings({
      hero_video_type: document.getElementById('hero-video-type').value,
      hero_video_id: document.getElementById('hero-video-id').value,
      hero_video_mobile: document.getElementById('hero-video-mobile').value,
      hero_poster_url: document.getElementById('hero-poster-url').value,
      about_heading: document.getElementById('about-heading').value,
      about_bio: document.getElementById('about-bio').value,
      about_portrait_url: document.getElementById('about-portrait-url').value
    });
    showAlert('success', 'Home settings saved!');
  } catch (error) {
    showAlert('error', 'Failed to save: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
};

window.saveWorkSettings = async function() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  try {
    await contentManager.updateSettings({
      work_page_heading: document.getElementById('work-heading').value,
      work_page_subheading: document.getElementById('work-subheading').value
    });
    showAlert('success', 'Work page settings saved!');
  } catch (error) {
    showAlert('error', 'Failed to save: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
};

window.saveContactSettings = async function() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  try {
    await contentManager.updateSettings({
      contact_page_heading: document.getElementById('contact-heading').value,
      contact_page_subheading: document.getElementById('contact-subheading').value
    });
    showAlert('success', 'Contact page settings saved!');
  } catch (error) {
    showAlert('error', 'Failed to save: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────

function setupProjectListeners() {
  // Add project button
  document.getElementById('add-project-btn')?.addEventListener('click', () => {
    editingProject = null;
    clearProjectForm();
    document.getElementById('modal-title').textContent = 'Add New Project';
    document.getElementById('project-modal').classList.add('active');
  });
  
  // Close modal
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-project')?.addEventListener('click', closeModal);
  
  // Save project
  document.getElementById('save-project')?.addEventListener('click', saveProject);
  
  // Delete project
  document.getElementById('delete-project')?.addEventListener('click', deleteProject);
  
  // Preview thumbnail
  document.getElementById('project-thumbnail')?.addEventListener('change', () => {
    updatePreview('project-thumbnail', 'thumbnail-preview');
  });
  
  // Export button
  document.getElementById('export-btn')?.addEventListener('click', () => {
    contentManager.exportJSON();
    showAlert('success', 'Backup exported!');
  });
  
  // Add award button
  document.getElementById('add-award-btn')?.addEventListener('click', () => {
    addAwardEntry();
  });
}

function renderProjectsList() {
  const projects = contentManager.getProjects();
  const container = document.getElementById('projects-list');
  
  if (!container) return;
  
  if (projects.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--admin-text-muted);">
        No projects yet. Click "Add Project" to create your first one.
      </div>
    `;
    return;
  }
  
  container.innerHTML = projects.map(project => {
    const thumbnailUrl = project.thumbnail_url 
      ? convertGoogleDriveUrl(project.thumbnail_url)
      : 'https://placehold.co/80x45/161b22/8b949e?text=No+Image';
    
    return `
      <div class="project-item" data-id="${project.id}">
        <div class="project-item__drag">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm8-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <img 
          class="project-item__thumb" 
          src="${thumbnailUrl}" 
          alt="${project.title}"
          onerror="this.src='https://placehold.co/80x45/161b22/8b949e?text=No+Image'"
        >
        <div class="project-item__info">
          <div class="project-item__title">${project.title}</div>
          <div class="project-item__meta">
            <span>${project.type}</span>
            <span>${project.year}</span>
            ${project.featured ? '<span class="project-item__featured">★ Featured</span>' : ''}
          </div>
        </div>
        <div class="project-item__actions">
          <button class="btn btn--secondary btn--sm" onclick="editProject('${project.id}')">Edit</button>
        </div>
      </div>
    `;
  }).join('');
}

window.editProject = function(projectId) {
  const project = contentManager.getProjectById(projectId);
  if (!project) return;
  
  editingProject = project;
  
  document.getElementById('modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value = project.id;
  document.getElementById('project-title').value = project.title;
  document.getElementById('project-subtitle').value = project.subtitle || '';
  document.getElementById('project-type').value = project.type;
  document.getElementById('project-year').value = project.year || '';
  document.getElementById('project-role').value = project.role || '';
  document.getElementById('project-status').value = project.status || '';
  document.getElementById('project-thumbnail').value = project.thumbnail_url || '';
  document.getElementById('project-video-type').value = project.video_type || 'youtube';
  document.getElementById('project-video-id').value = project.video_id || '';
  document.getElementById('project-description').value = project.description || '';
  populateAwards(project.awards || project.nominations || []);
  document.getElementById('project-featured').checked = project.featured || false;
  document.getElementById('project-show-border').checked = project.show_home_border || false;
  
  updatePreview('project-thumbnail', 'thumbnail-preview');
  
  document.getElementById('delete-project').classList.remove('hidden');
  document.getElementById('project-modal').classList.add('active');
};

function clearProjectForm() {
  document.getElementById('project-id').value = '';
  document.getElementById('project-title').value = '';
  document.getElementById('project-subtitle').value = '';
  document.getElementById('project-type').value = 'Documentary';
  document.getElementById('project-year').value = new Date().getFullYear();
  document.getElementById('project-role').value = '';
  document.getElementById('project-status').value = '';
  document.getElementById('project-thumbnail').value = '';
  document.getElementById('project-video-type').value = 'youtube';
  document.getElementById('project-video-id').value = '';
  document.getElementById('project-description').value = '';
  clearAwards();
  document.getElementById('project-featured').checked = false;
  document.getElementById('project-show-border').checked = false;
  document.getElementById('thumbnail-preview').innerHTML = '';
  document.getElementById('delete-project').classList.add('hidden');
}

async function saveProject() {
  const btn = document.getElementById('save-project');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  const projectData = {
    id: document.getElementById('project-id').value || generateSlug(document.getElementById('project-title').value),
    title: document.getElementById('project-title').value,
    subtitle: document.getElementById('project-subtitle').value,
    type: document.getElementById('project-type').value,
    year: document.getElementById('project-year').value,
    role: document.getElementById('project-role').value,
    status: document.getElementById('project-status').value || null,
    thumbnail_url: document.getElementById('project-thumbnail').value,
    video_type: document.getElementById('project-video-type').value,
    video_id: document.getElementById('project-video-id').value,
    description: document.getElementById('project-description').value,
    awards: getAwardsData(),
    featured: document.getElementById('project-featured').checked,
    show_home_border: document.getElementById('project-show-border').checked
  };
  
  try {
    if (editingProject) {
      await contentManager.updateProject(editingProject.id, projectData);
      showAlert('success', 'Project updated!');
    } else {
      await contentManager.createProject(projectData);
      showAlert('success', 'Project created!');
    }
    
    renderProjectsList();
    closeModal();
  } catch (error) {
    showAlert('error', 'Failed to save project: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Project';
  }
}

async function deleteProject() {
  if (!editingProject) return;
  
  if (!confirm(`Are you sure you want to delete "${editingProject.title}"? This cannot be undone.`)) {
    return;
  }
  
  try {
    await contentManager.deleteProject(editingProject.id);
    showAlert('success', 'Project deleted!');
    renderProjectsList();
    closeModal();
  } catch (error) {
    showAlert('error', 'Failed to delete project: ' + error.message);
  }
}

function closeModal() {
  document.getElementById('project-modal').classList.remove('active');
  editingProject = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AWARDS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

let awardCounter = 0;

function addAwardEntry(awardData = null) {
  const container = document.getElementById('awards-list');
  if (!container) return;
  
  const entryId = `award-${awardCounter++}`;
  const entry = document.createElement('div');
  entry.className = 'award-entry';
  entry.id = entryId;
  
  entry.innerHTML = `
    <div class="award-entry__fields">
      <div class="award-entry__row">
        <div class="award-entry__field award-entry__field--name">
          <input type="text" class="form-input form-input--sm award-name" placeholder="Award name (e.g., Best Short Film)" value="${awardData?.name || ''}">
        </div>
        <div class="award-entry__field award-entry__field--source">
          <input type="text" class="form-input form-input--sm award-source" placeholder="Source (e.g., Sundance)" value="${awardData?.source || ''}">
        </div>
        <div class="award-entry__field award-entry__field--status">
          <select class="form-select form-select--sm award-status">
            <option value="nominated" ${awardData?.status === 'nominated' ? 'selected' : ''}>Nominated</option>
            <option value="won" ${awardData?.status === 'won' ? 'selected' : ''}>Won</option>
          </select>
        </div>
        <button type="button" class="btn btn--ghost btn--icon award-remove" onclick="removeAwardEntry('${entryId}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(entry);
}

window.removeAwardEntry = function(entryId) {
  const entry = document.getElementById(entryId);
  if (entry) {
    entry.remove();
  }
};

function getAwardsData() {
  const container = document.getElementById('awards-list');
  if (!container) return [];
  
  const entries = container.querySelectorAll('.award-entry');
  const awards = [];
  
  entries.forEach(entry => {
    const name = entry.querySelector('.award-name')?.value?.trim();
    const source = entry.querySelector('.award-source')?.value?.trim();
    const status = entry.querySelector('.award-status')?.value || 'nominated';
    
    if (name) {
      awards.push({ name, source, status });
    }
  });
  
  return awards;
}

function populateAwards(awards) {
  const container = document.getElementById('awards-list');
  if (!container) return;
  
  // Clear existing entries
  container.innerHTML = '';
  awardCounter = 0;
  
  // If awards is a string (legacy format), convert to array
  if (typeof awards === 'string' && awards.trim()) {
    const lines = awards.split('\n').filter(n => n.trim());
    lines.forEach(line => {
      const parts = line.trim().split(' - ');
      const name = parts[0] || line.trim();
      const source = parts[1] || '';
      addAwardEntry({ name, source, status: 'nominated' });
    });
  } else if (Array.isArray(awards)) {
    awards.forEach(award => addAwardEntry(award));
  }
}

function clearAwards() {
  const container = document.getElementById('awards-list');
  if (container) {
    container.innerHTML = '';
    awardCounter = 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

function setupVideoImport() {
  const uploadBtn = document.getElementById('upload-video-btn');
  const mobileUploadBtn = document.getElementById('upload-mobile-video-btn');
  const videoTypeSelect = document.getElementById('hero-video-type');
  
  // Upload button click handlers
  uploadBtn?.addEventListener('click', () => uploadVideoFile('desktop'));
  mobileUploadBtn?.addEventListener('click', () => uploadVideoFile('mobile'));
  
  // Update hint text based on video type
  videoTypeSelect?.addEventListener('change', updateVideoHint);
  
  // Initial hint update
  updateVideoHint();
}

function updateVideoHint() {
  const videoType = document.getElementById('hero-video-type')?.value;
  const hintEl = document.getElementById('video-id-hint');
  
  if (!hintEl) return;
  
  const hints = {
    'supabase': 'For Supabase: just the filename (e.g., hero-video.mp4)',
    'youtube': 'For YouTube: the video ID from the URL (e.g., dQw4w9WgXcQ)',
    'googledrive': 'For Google Drive: the file ID from the share URL'
  };
  
  hintEl.textContent = hints[videoType] || hints['supabase'];
}

async function uploadVideoFile(type = 'desktop') {
  const isMobile = type === 'mobile';
  const fileInput = document.getElementById(isMobile ? 'mobile-video-file-input' : 'video-file-input');
  const progressEl = document.getElementById(isMobile ? 'mobile-upload-progress' : 'upload-progress');
  const progressFill = document.getElementById(isMobile ? 'mobile-upload-progress-fill' : 'upload-progress-fill');
  const progressText = document.getElementById(isMobile ? 'mobile-upload-progress-text' : 'upload-progress-text');
  const uploadBtn = document.getElementById(isMobile ? 'upload-mobile-video-btn' : 'upload-video-btn');
  
  const file = fileInput?.files?.[0];
  
  if (!file) {
    showAlert('error', `Please select a ${isMobile ? 'mobile ' : ''}video file`);
    return;
  }
  
  // Validate file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    showAlert('error', 'Please select an MP4, WebM, or MOV file');
    return;
  }
  
  // Generate filename with timestamp to avoid conflicts
  const extension = file.name.split('.').pop();
  const prefix = isMobile ? 'hero-mobile' : 'hero-video';
  const filename = `${prefix}-${Date.now()}.${extension}`;
  
  // Show progress
  progressEl?.classList.remove('hidden', 'complete', 'error');
  if (progressFill) progressFill.style.width = '0%';
  if (progressText) progressText.textContent = 'Preparing upload...';
  if (uploadBtn) uploadBtn.disabled = true;
  
  try {
    // Show initial progress
    if (progressFill) progressFill.style.width = '10%';
    if (progressText) progressText.textContent = `Uploading ${formatFileSize(file.size)}...`;
    
    // Upload using XMLHttpRequest for progress tracking
    await uploadWithProgress(file, filename, (progress) => {
      if (progressFill) progressFill.style.width = `${Math.min(progress, 95)}%`;
      if (progressText) progressText.textContent = `Uploading... ${Math.round(progress)}%`;
    });
    
    // Complete!
    if (progressFill) progressFill.style.width = '100%';
    progressEl?.classList.add('complete');
    if (progressText) progressText.textContent = `Success! File: ${filename}`;
    
    // Update the form fields
    if (isMobile) {
      document.getElementById('hero-video-mobile').value = filename;
    } else {
      document.getElementById('hero-video-type').value = 'supabase';
      document.getElementById('hero-video-id').value = filename;
    }
    
    // Clear the file input
    fileInput.value = '';
    
    // Update the hint text
    updateVideoHint();
    
    showAlert('success', `${isMobile ? 'Mobile video' : 'Video'} uploaded! Filename: ${filename}`);
    
    // Hide progress after a few seconds
    setTimeout(() => {
      progressEl?.classList.add('hidden');
      progressEl?.classList.remove('complete');
    }, 5000);
    
  } catch (error) {
    console.error('Upload error:', error);
    progressEl?.classList.add('error');
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = `Error: ${error.message}`;
    showAlert('error', error.message);
  } finally {
    if (uploadBtn) uploadBtn.disabled = false;
  }
}

function uploadWithProgress(file, filename, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/videos/${filename}`;
    const authToken = localStorage.getItem('supabase_auth_token');
    
    xhr.open('POST', url, true);
    xhr.setRequestHeader('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbmR4ZWN0cGtxZ3p3ZG9yZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzEyNTIsImV4cCI6MjA4NTUwNzI1Mn0.-wxqrfuWl9vcwlsaOx0-lNdZaj5_G8fX58Opgzoy0gI');
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.setRequestHeader('x-upsert', 'true');
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || error.error || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });
    
    xhr.send(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function showAlert(type, message) {
  const container = document.getElementById('alerts');
  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  alert.textContent = message;
  container.appendChild(alert);
  
  setTimeout(() => alert.remove(), 5000);
}

function updatePreview(inputId, previewId) {
  const url = document.getElementById(inputId).value;
  const preview = document.getElementById(previewId);
  
  if (!url) {
    preview.innerHTML = '';
    return;
  }
  
  // Convert Google Drive URLs to direct links for preview
  const previewUrl = convertGoogleDriveUrl(url);
  
  preview.innerHTML = `
    <img 
      class="preview-image" 
      src="${previewUrl}" 
      alt="Preview"
      onerror="this.parentNode.innerHTML = '<div class=\\'preview-error\\'>Failed to load image</div>'"
    >
  `;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


