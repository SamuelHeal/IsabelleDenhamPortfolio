// ═══════════════════════════════════════════════════════════════════════════
// ADMIN.JS — Admin panel functionality
// ═══════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase-client.js';
import { contentManager } from './content-manager.js';

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

let currentUser = null;
let activePanel = 'site';
let editingProject = null;

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

function populateSiteSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('site-name').value = settings.site_name || '';
  document.getElementById('site-tagline').value = settings.tagline || '';
  document.getElementById('contact-email').value = settings.contact_email || '';
  document.getElementById('form-endpoint').value = settings.form_endpoint || '';
  document.getElementById('social-vimeo').value = settings.social_vimeo || '';
  document.getElementById('social-instagram').value = settings.social_instagram || '';
  document.getElementById('social-linkedin').value = settings.social_linkedin || '';
  document.getElementById('footer-heading').value = settings.footer_heading || '';
  document.getElementById('footer-copyright').value = settings.footer_copyright || '';
}

function populateHomeSettings() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  document.getElementById('hero-video-type').value = settings.hero_video_type || 'youtube';
  document.getElementById('hero-video-id').value = settings.hero_video_id || '';
  document.getElementById('hero-poster-url').value = settings.hero_poster_url || '';
  document.getElementById('about-heading').value = settings.about_heading || '';
  document.getElementById('about-bio').value = settings.about_bio || '';
  document.getElementById('about-portrait-url').value = settings.about_portrait_url || '';
  
  // Featured projects
  const featuredIds = settings.featured_project_ids || [];
  document.getElementById('featured-project-1').value = featuredIds[0] || '';
  document.getElementById('featured-project-2').value = featuredIds[1] || '';
  document.getElementById('featured-project-3').value = featuredIds[2] || '';
  
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
      social_vimeo: document.getElementById('social-vimeo').value,
      social_instagram: document.getElementById('social-instagram').value,
      social_linkedin: document.getElementById('social-linkedin').value,
      footer_heading: document.getElementById('footer-heading').value,
      footer_copyright: document.getElementById('footer-copyright').value
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
      hero_poster_url: document.getElementById('hero-poster-url').value,
      about_heading: document.getElementById('about-heading').value,
      about_bio: document.getElementById('about-bio').value,
      about_portrait_url: document.getElementById('about-portrait-url').value,
      featured_project_ids: [
        document.getElementById('featured-project-1').value,
        document.getElementById('featured-project-2').value,
        document.getElementById('featured-project-3').value
      ].filter(Boolean)
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
  
  container.innerHTML = projects.map(project => `
    <div class="project-item" data-id="${project.id}">
      <div class="project-item__drag">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm8-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      </div>
      <img 
        class="project-item__thumb" 
        src="${project.thumbnail_url || 'https://placehold.co/80x45/161b22/8b949e?text=No+Image'}" 
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
  `).join('');
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
  document.getElementById('project-thumbnail').value = project.thumbnail_url || '';
  document.getElementById('project-video-type').value = project.video_type || 'youtube';
  document.getElementById('project-video-id').value = project.video_id || '';
  document.getElementById('project-description').value = project.description || '';
  document.getElementById('project-featured').checked = project.featured || false;
  
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
  document.getElementById('project-thumbnail').value = '';
  document.getElementById('project-video-type').value = 'youtube';
  document.getElementById('project-video-id').value = '';
  document.getElementById('project-description').value = '';
  document.getElementById('project-featured').checked = false;
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
    thumbnail_url: document.getElementById('project-thumbnail').value,
    video_type: document.getElementById('project-video-type').value,
    video_id: document.getElementById('project-video-id').value,
    description: document.getElementById('project-description').value,
    featured: document.getElementById('project-featured').checked
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
  
  preview.innerHTML = `
    <img 
      class="preview-image" 
      src="${url}" 
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


