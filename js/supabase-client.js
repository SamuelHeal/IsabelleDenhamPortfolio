// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT — Isabelle Denham Portfolio
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = "https://pandxectpkqgzwdordmp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbmR4ZWN0cGtxZ3p3ZG9yZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzEyNTIsImV4cCI6MjA4NTUwNzI1Mn0.-wxqrfuWl9vcwlsaOx0-lNdZaj5_G8fX58Opgzoy0gI";

// Simple Supabase client for browser use (no npm required)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    this.authToken = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH METHODS
  // ─────────────────────────────────────────────────────────────────────────

  async signIn(email, password) {
    const response = await fetch(
      `${this.url}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: this.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error_description || error.message || "Login failed"
      );
    }

    const data = await response.json();
    this.authToken = data.access_token;
    localStorage.setItem("supabase_auth_token", data.access_token);
    localStorage.setItem("supabase_refresh_token", data.refresh_token);
    return data;
  }

  async signOut() {
    this.authToken = null;
    localStorage.removeItem("supabase_auth_token");
    localStorage.removeItem("supabase_refresh_token");
  }

  async getSession() {
    const token = localStorage.getItem("supabase_auth_token");
    if (!token) return null;

    this.authToken = token;

    // Verify token is still valid
    try {
      const response = await fetch(`${this.url}/auth/v1/user`, {
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.signOut();
        return null;
      }

      return await response.json();
    } catch {
      this.signOut();
      return null;
    }
  }

  getAuthHeaders() {
    const token = this.authToken || localStorage.getItem("supabase_auth_token");
    return {
      ...this.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATABASE METHODS
  // ─────────────────────────────────────────────────────────────────────────

  async select(table, options = {}) {
    let url = `${this.url}/rest/v1/${table}?select=${options.select || "*"}`;

    if (options.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        url += `&${key}=eq.${encodeURIComponent(value)}`;
      }
    }

    if (options.order) {
      url += `&order=${options.order}`;
    }

    if (options.limit) {
      url += `&limit=${options.limit}`;
    }

    const response = await fetch(url, {
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch data");
    }

    return response.json();
  }

  async selectSingle(table, options = {}) {
    const data = await this.select(table, { ...options, limit: 1 });
    return data[0] || null;
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to insert data");
    }

    return response.json();
  }

  async update(table, data, eq) {
    let url = `${this.url}/rest/v1/${table}`;

    if (eq) {
      const params = Object.entries(eq)
        .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
        .join("&");
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update data");
    }

    return response.json();
  }

  async delete(table, eq) {
    let url = `${this.url}/rest/v1/${table}`;

    if (eq) {
      const params = Object.entries(eq)
        .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
        .join("&");
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete data");
    }

    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STORAGE METHODS
  // ─────────────────────────────────────────────────────────────────────────

  // Upload file to storage bucket
  async uploadFile(bucket, filename, file, options = {}) {
    const url = `${this.url}/storage/v1/object/${bucket}/${filename}`;
    
    const headers = {
      apikey: this.key,
      Authorization: `Bearer ${this.authToken || localStorage.getItem("supabase_auth_token")}`,
    };
    
    // Add upsert header if specified
    if (options.upsert) {
      headers['x-upsert'] = 'true';
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: file,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to upload file");
    }

    return response.json();
  }


  getPublicUrl(bucket, filename) {
    return `${this.url}/storage/v1/object/public/${bucket}/${filename}`;
  }
}

// Export singleton instance
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { supabase };

