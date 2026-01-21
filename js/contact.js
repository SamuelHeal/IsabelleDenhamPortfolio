// ═══════════════════════════════════════════════════════════════════════════
// CONTACT.JS — Contact page functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, socialIcons } from './main.js';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE CONTACT PAGE
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('content-ready', () => {
  renderContactPage();
  initContactForm();
});

// ─────────────────────────────────────────────────────────────────────────────
// RENDER CONTACT PAGE
// ─────────────────────────────────────────────────────────────────────────────

function renderContactPage() {
  const settings = contentManager.getSettings();
  if (!settings) return;
  
  // Update heading
  const heading = document.getElementById('contact-heading');
  if (heading && settings.contact_page_heading) {
    heading.textContent = settings.contact_page_heading;
  }
  
  // Update subheading
  const subheading = document.getElementById('contact-subheading');
  if (subheading && settings.contact_page_subheading) {
    subheading.textContent = settings.contact_page_subheading;
  }
  
  // Update form action
  const form = document.getElementById('contact-form');
  if (form && settings.form_endpoint) {
    form.action = settings.form_endpoint;
  }
  
  // Update direct email
  const email = document.getElementById('direct-email');
  if (email && settings.contact_email) {
    email.href = `mailto:${settings.contact_email}`;
    email.textContent = settings.contact_email;
  }
  
  // Update social links
  const socialsContainer = document.querySelector('.contact-page__socials');
  if (socialsContainer) {
    const socials = [
      { id: 'vimeo', url: settings.social_vimeo, icon: socialIcons.vimeo },
      { id: 'instagram', url: settings.social_instagram, icon: socialIcons.instagram },
      { id: 'linkedin', url: settings.social_linkedin, icon: socialIcons.linkedin }
    ].filter(s => s.url);
    
    socialsContainer.innerHTML = socials.map(social => `
      <a href="${social.url}" class="contact-page__social" target="_blank" rel="noopener noreferrer" aria-label="${social.id}">
        ${social.icon}
      </a>
    `).join('');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────────────────────

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validate
    if (!validateForm(form)) return;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        showMessage('success', 'Message sent successfully! I\'ll get back to you soon.');
        form.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showMessage('error', 'Failed to send message. Please try again or email directly.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function validateForm(form) {
  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const message = form.querySelector('[name="message"]');
  
  let isValid = true;
  
  // Clear previous errors
  form.querySelectorAll('.error').forEach(el => el.remove());
  form.querySelectorAll('.contact-form__input, .contact-form__textarea').forEach(el => {
    el.style.borderColor = '';
  });
  
  // Validate name
  if (!name.value.trim()) {
    showFieldError(name, 'Name is required');
    isValid = false;
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showFieldError(email, 'Email is required');
    isValid = false;
  } else if (!emailRegex.test(email.value)) {
    showFieldError(email, 'Please enter a valid email');
    isValid = false;
  }
  
  // Validate message
  if (!message.value.trim()) {
    showFieldError(message, 'Message is required');
    isValid = false;
  }
  
  return isValid;
}

function showFieldError(field, message) {
  field.style.borderColor = '#ff1b6b';
  const error = document.createElement('span');
  error.className = 'error';
  error.style.cssText = 'color: #ff1b6b; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
  error.textContent = message;
  field.parentNode.appendChild(error);
}

function showMessage(type, text) {
  // Remove existing message
  const existing = document.querySelector('.form-message');
  if (existing) existing.remove();
  
  const message = document.createElement('div');
  message.className = 'form-message';
  message.style.cssText = `
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 8px;
    text-align: center;
    background: ${type === 'success' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255, 27, 107, 0.2)'};
    color: ${type === 'success' ? '#27ae60' : '#ff1b6b'};
  `;
  message.textContent = text;
  
  const form = document.getElementById('contact-form');
  form.appendChild(message);
  
  // Auto remove after 5 seconds
  setTimeout(() => message.remove(), 5000);
}


