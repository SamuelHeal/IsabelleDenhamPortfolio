// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MANAGER — Isabelle Denham Portfolio
// ═══════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase-client.js';

class ContentManager {
  constructor() {
    this.settings = null;
    this.projects = [];
    this.loaded = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD CONTENT
  // ─────────────────────────────────────────────────────────────────────────

  async loadContent() {
    if (this.loaded) {
      return { settings: this.settings, projects: this.projects };
    }

    try {
      const [settings, projects] = await Promise.all([
        supabase.selectSingle('site_settings'),
        supabase.select('projects', { order: 'display_order.asc' })
      ]);

      this.settings = settings;
      this.projects = projects || [];
      this.loaded = true;

      return { settings: this.settings, projects: this.projects };
    } catch (error) {
      console.error('Failed to load content:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  getSettings() {
    return this.settings;
  }

  getProjects() {
    return this.projects;
  }

  getFeaturedProjects() {
    return this.projects.filter(p => p.featured === true);
  }

  getProjectById(id) {
    return this.projects.find(p => p.id === id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN: UPDATE METHODS
  // ─────────────────────────────────────────────────────────────────────────

  async updateSettings(updates) {
    try {
      const updated = await supabase.update('site_settings', {
        ...updates,
        updated_at: new Date().toISOString()
      }, { id: this.settings.id });

      Object.assign(this.settings, updates);
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  async createProject(project) {
    try {
      const [created] = await supabase.insert('projects', project);
      this.projects.push(created);
      return created;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(id, updates) {
    try {
      await supabase.update('projects', {
        ...updates,
        updated_at: new Date().toISOString()
      }, { id });

      const index = this.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        Object.assign(this.projects[index], updates);
      }
      return this.projects[index];
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      await supabase.delete('projects', { id });
      this.projects = this.projects.filter(p => p.id !== id);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async reorderProjects(orderedIds) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.update('projects', { display_order: i }, { id: orderedIds[i] });
      }
      
      // Update local cache
      this.projects.sort((a, b) => 
        orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to reorder projects:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT / IMPORT
  // ─────────────────────────────────────────────────────────────────────────

  exportJSON() {
    const content = {
      settings: this.settings,
      projects: this.projects,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isabelle-portfolio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  getVideoEmbedUrl(videoType, videoId) {
    if (videoType === 'youtube') {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    } else if (videoType === 'googledrive') {
      return `https://drive.google.com/file/d/${videoId}/preview`;
    }
    return '';
  }
}

// Export singleton instance
const contentManager = new ContentManager();
export { contentManager };


