# Isabelle Denham Portfolio — Design Plan

## Project Overview

**Client**: Isabelle Denham  
**Profession**: Film Director  
**Website Type**: Professional Portfolio  
**Pages**: Home, Work, Contact + Hidden Admin Page  
**Content Management**: JSON-based with external media hosting (Google Drive / YouTube)

---

## Design Analysis (Reference Images)

### Visual Language Observed

- **Aesthetic**: Minimal, modern, cinematic, professional
- **Theme**: Dark mode with high contrast
- **Layout**: Generous whitespace, asymmetric compositions, editorial feel
- **Mood**: Sophisticated, confident, industry-professional

### Key Design Patterns

1. **Navigation**: Fixed top nav with logo/name left, links right, clean horizontal rule separator
2. **Hero**: Full-bleed video/media with minimal overlay content
3. **Typography**: Bold condensed headings, clean body text
4. **Buttons**: Solid accent for primary CTA, outlined white for secondary
5. **Cards**: Video thumbnails with gradient overlays for text legibility
6. **Vertical Text**: Rotated section labels as decorative wayfinding elements

---

## Color System

```css
:root {
  /* Core Palette */
  --bg-primary: #0a0a0a; /* Deep black - main background */
  --bg-secondary: #141414; /* Slightly lighter - cards/sections */
  --bg-elevated: #1a1a1a; /* Elevated surfaces */

  /* Text */
  --text-primary: #ffffff; /* Main headings, high emphasis */
  --text-secondary: #a0a0a0; /* Body text, descriptions */
  --text-muted: #666666; /* Captions, hints */

  /* Accent */
  --accent-primary: #ff1b6b; /* Hot pink - CTAs, highlights */
  --accent-hover: #ff3d7f; /* Lighter pink for hover states */
  --accent-glow: rgba(255, 27, 107, 0.3); /* Glow effect */

  /* Utility */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-visible: rgba(255, 255, 255, 0.2);
}
```

---

## Typography

### Font Stack

**Primary Headings**: `"Syne"` (Google Fonts)

- Bold, geometric, condensed feel
- Modern and distinctive without being generic
- Weights: 700, 800

**Body/UI**: `"Outfit"` (Google Fonts)

- Clean, modern, highly legible
- Complements Syne well
- Weights: 300, 400, 500, 600

**Alternative Option**: Use the provided `Bubble Garden` font for accent/decorative elements only (logo mark, special callouts) as it's quite playful and may contrast nicely with the sharp dark theme.

### Type Scale

```css
/* Headings */
--h1: clamp(3.5rem, 8vw, 7rem); /* Hero/page titles */
--h2: clamp(2.5rem, 5vw, 4.5rem); /* Section headings */
--h3: clamp(1.5rem, 3vw, 2rem); /* Subsection/card titles */

/* Body */
--body-lg: 1.125rem; /* Lead paragraphs */
--body: 1rem; /* Standard body */
--body-sm: 0.875rem; /* Captions, meta */

/* Line Heights */
--leading-tight: 1.1;
--leading-normal: 1.5;
--leading-relaxed: 1.7;
```

---

## Page Structures

### 1. HOME PAGE (`index.html`)

#### Hero Section

- **Height**: 85vh minimum
- **Content**: Full-width embedded video (showreel or featured work)
- **Navigation**: Fixed top, transparent initially, solid on scroll
  - Left: "Isabelle Denham" with pink accent mark (diamond or custom shape)
  - Right: Work | About | Contact links
- **Bottom Left**: "About me ↓" scroll hint (subtle, animated)
- **Bottom Right**: Two CTAs
  - "View all work" — solid pink button
  - "Contact me" — outlined white button

#### About Section

- **Layout**: Two-column asymmetric grid
- **Left Column** (40%):
  - Large "About Me" heading (left-aligned, bold)
  - 2-3 lines of bio text
  - Subtle reveal animation on scroll
- **Right Column** (60%):
  - Large portrait image (`izzy.jpg` - the professional teal top photo)
  - Slight parallax or scale effect on scroll
  - Rounded corners (subtle, 8-12px)

#### My Work Section

- **Layout**: Vertical label + centered carousel
- **Left Rail**: "My Work" rotated 90° vertically (decorative)
- **Center**: Large video embed (16:9 aspect ratio)
  - Title bottom-left of video
  - "More Info" link bottom-right (pink text)
  - Vertical scroll/snap between 3 featured projects
- **Below Carousel**: "View full portfolio" CTA button (centered)

**Featured Projects for Home**:

1. The Fringe (fringe.jpeg)
2. Couch 44 (couch 44.jpg)
3. Peridition (Peridition.png)

#### Footer

- **Background**: Slightly elevated (#141414)
- **Content**:
  - "Let's create something." — Large heading
  - Email: contact@isabelledenham.com (or placeholder)
  - Social links: Vimeo, Instagram, LinkedIn (icon row)
- **Copyright**: Small text at bottom

---

### 2. WORK PAGE (`work.html`)

#### Header

- Same navigation as home
- Horizontal rule below nav

#### Content

- **Title**: "Selected Work" — Large left-aligned heading
- **Grid**: 2-column responsive grid
  - Gap: 24-32px
  - Cards maintain 16:9 aspect ratio

#### Project Cards

- **Thumbnail**: Video poster image (plays on hover)
- **Overlay**: Bottom gradient (transparent to black 70%)
- **Title**: Positioned bottom-left inside card
- **Interaction**:
  - Hover: Video plays (muted, looped)
  - Click: Navigate to project detail page

#### Project Data (Managed via JSON)

Projects are stored in the `projects` array in `content.json`. Each project has:

| Field       | Type    | Description                                      |
| ----------- | ------- | ------------------------------------------------ |
| id          | string  | URL-safe identifier (e.g., "fringe", "couch-44") |
| title       | string  | Display title                                    |
| subtitle    | string  | Optional subtitle                                |
| type        | string  | Category (Documentary, Short Film, etc.)         |
| year        | string  | Year of release                                  |
| role        | string  | Director's role(s)                               |
| thumbnail   | string  | Google Drive image URL                           |
| videoType   | string  | "youtube" or "googledrive"                       |
| videoId     | string  | YouTube video ID or Google Drive file ID         |
| description | string  | Full project description                         |
| credits     | array   | Optional array of {role, name} objects           |
| featured    | boolean | Show on homepage featured section                |
| order       | number  | Display order in work grid                       |

**Initial Projects** (to be populated with Google Drive/YouTube links):

| ID         | Title          | Type        | Featured |
| ---------- | -------------- | ----------- | -------- |
| fringe     | The Fringe     | Documentary | ✓        |
| couch-44   | Couch 44       | TV Series   | ✓        |
| peridition | Peridition     | Music Video | ✓        |
| 48-hours   | 48 Hours       | Short Film  |          |
| cranker    | Cranker        | Documentary |          |
| experiment | The Experiment | Short Film  |          |

#### Project Detail Page (`project.html?id=xxx`)

Single template page that dynamically loads content based on URL parameter.

**URL Structure**: `project.html?id=fringe`, `project.html?id=couch-44`, etc.

**Layout**:

- Navigation (same as other pages)
- Back link: "← Back to all work" (top left, below nav)
- Large video embed (center, max-width 900px, 16:9 aspect ratio)
- Project title (large, below video)
- Project subtitle (if exists)
- Meta row: Type • Year • Role
- Description paragraph
- Credits section (if provided in JSON)

**Dynamic Loading**:

```javascript
// On page load, extract project ID from URL
const projectId = new URLSearchParams(window.location.search).get("id");
const project = contentManager.getProjectById(projectId);

// If project not found, redirect to work page
if (!project) window.location.href = "work.html";
```

---

### 3. CONTACT PAGE (`contact.html`)

#### Header

- Same navigation

#### Content Section

- **Heading**: "LET'S CREATE" — Bold, centered, uppercase
- **Subtitle**: "For inquiries, collaborations, or just to say hello." — Centered, muted text

#### Contact Form

- **Layout**: Centered, max-width 700px
- **Fields**:
  - Row 1: Name (50%) | Email (50%)
  - Row 2: Subject (100%)
  - Row 3: Message textarea (100%, 150px min-height)
- **Styling**:
  - Background: #141414
  - Border: 1px solid var(--border-subtle)
  - Focus: Pink accent border + subtle glow
  - Border-radius: 8px
- **Submit Button**: Full-width pink button "SEND MESSAGE"

#### Alternative Contact

- "Or reach out directly" — Muted text
- Email link: Large, clickable
- Social icons row (Vimeo, Instagram, LinkedIn)

#### Footer

- "© 2024 Isabelle Denham. All Rights Reserved."

---

## Content Management System (Supabase + Vercel)

### Architecture Overview

All website content is stored in **Supabase** (PostgreSQL database) and served to all visitors. The hidden admin page allows Isabelle to update content which is immediately visible to everyone.

**Hosting Strategy**:

- **Frontend**: Vercel (static site hosting)
- **Database**: Supabase (PostgreSQL with REST API)
- **Images**: Google Drive with public sharing links
- **Videos**: YouTube embeds OR Google Drive video links

**Why Supabase?**

- ✅ Free tier (500MB database, unlimited API requests)
- ✅ Real-time updates — changes visible immediately to all visitors
- ✅ Proper authentication for admin access
- ✅ No server management required
- ✅ REST API works directly from browser
- ✅ Row Level Security for data protection

### JSON Data Structure

```json
{
  "siteInfo": {
    "name": "Isabelle Denham",
    "tagline": "Film Director",
    "logo": {
      "text": "Isabelle Denham",
      "accentIcon": "diamond"
    }
  },

  "contact": {
    "email": "hello@isabelledenham.com",
    "formEndpoint": "https://formspree.io/f/YOUR_FORM_ID",
    "social": {
      "vimeo": "https://vimeo.com/isabelledenham",
      "instagram": "https://instagram.com/isabelledenham",
      "linkedin": "https://linkedin.com/in/isabelledenham"
    }
  },

  "home": {
    "hero": {
      "videoType": "youtube",
      "videoId": "YOUTUBE_VIDEO_ID",
      "videoPoster": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "scrollHint": "About me"
    },
    "about": {
      "heading": "About Me",
      "bio": "I craft compelling narratives that resonate with audiences. With a passion for visual storytelling, my work explores the human condition through emotionally driven and visually distinct filmmaking.",
      "portrait": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "portraitAlt": "Isabelle Denham - Film Director"
    },
    "featuredWorkIds": ["fringe", "couch-44", "peridition"]
  },

  "footer": {
    "heading": "Let's create something.",
    "copyright": "© 2024 Isabelle Denham. All Rights Reserved."
  },

  "workPage": {
    "heading": "Selected Work",
    "subheading": "A collection of films, documentaries, and visual stories."
  },

  "contactPage": {
    "heading": "LET'S CREATE",
    "subheading": "For inquiries, collaborations, or just to say hello.",
    "formLabels": {
      "name": "Name",
      "email": "Email",
      "subject": "Subject",
      "message": "Your Message",
      "submit": "SEND MESSAGE"
    },
    "directContact": "Or reach out directly"
  },

  "projects": [
    {
      "id": "fringe",
      "title": "The Fringe",
      "subtitle": "A Story of Two Artists",
      "type": "Documentary",
      "year": "2024",
      "role": "Director / Editor",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "youtube",
      "videoId": "YOUTUBE_VIDEO_ID",
      "description": "An intimate documentary following two emerging artists as they navigate the Adelaide Fringe Festival, exploring themes of creativity, vulnerability, and artistic expression.",
      "credits": [
        { "role": "Director", "name": "Isabelle Denham" },
        { "role": "Cinematographer", "name": "John Smith" },
        { "role": "Editor", "name": "Isabelle Denham" }
      ],
      "featured": true,
      "order": 1
    },
    {
      "id": "couch-44",
      "title": "Couch 44",
      "subtitle": "CTV+ Original Series",
      "type": "TV Series",
      "year": "2023",
      "role": "Director",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "youtube",
      "videoId": "YOUTUBE_VIDEO_ID",
      "description": "A comedy series exploring the lives of six friends sharing a house in inner-city Adelaide. Commissioned by CTV+.",
      "credits": [],
      "featured": true,
      "order": 2
    },
    {
      "id": "peridition",
      "title": "Peridition",
      "subtitle": "",
      "type": "Music Video",
      "year": "2023",
      "role": "Director / Cinematographer",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "googledrive",
      "videoId": "GOOGLE_DRIVE_FILE_ID",
      "description": "A visually poetic music video exploring connection and letting go, shot entirely in natural light.",
      "credits": [],
      "featured": true,
      "order": 3
    },
    {
      "id": "48-hours",
      "title": "48 Hours",
      "subtitle": "",
      "type": "Short Film",
      "year": "2023",
      "role": "Director / Writer",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "youtube",
      "videoId": "YOUTUBE_VIDEO_ID",
      "description": "Created for the 48 Hour Film Project, this short explores the tension between two strangers trapped together.",
      "credits": [],
      "featured": false,
      "order": 4
    },
    {
      "id": "cranker",
      "title": "Cranker",
      "subtitle": "If These Walls Could Talk",
      "type": "Documentary",
      "year": "2022",
      "role": "Director",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "youtube",
      "videoId": "YOUTUBE_VIDEO_ID",
      "description": "A documentary exploring the street art scene and the stories hidden within urban walls.",
      "credits": [],
      "featured": false,
      "order": 5
    },
    {
      "id": "experiment",
      "title": "The Experiment",
      "subtitle": "",
      "type": "Short Film",
      "year": "2022",
      "role": "Director / Cinematographer",
      "thumbnail": "https://drive.google.com/uc?export=view&id=GOOGLE_DRIVE_FILE_ID",
      "videoType": "googledrive",
      "videoId": "GOOGLE_DRIVE_FILE_ID",
      "description": "An experimental short film exploring perception and reality through unconventional cinematography.",
      "credits": [],
      "featured": false,
      "order": 6
    }
  ]
}
```

### Google Drive Image URL Format

To use Google Drive images, follow these steps:

1. **Upload image to Google Drive**
2. **Right-click → Share → Anyone with the link can view**
3. **Copy the sharing link** (e.g., `https://drive.google.com/file/d/FILE_ID/view`)
4. **Extract the FILE_ID** and use this format:

```
https://drive.google.com/uc?export=view&id=FILE_ID
```

**Example**:

- Sharing link: `https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view`
- Direct image URL: `https://drive.google.com/uc?export=view&id=1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

### Google Drive Video Embed Format

For Google Drive videos:

```
https://drive.google.com/file/d/FILE_ID/preview
```

### YouTube Video Embed Format

For YouTube videos, only the video ID is needed:

- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

The site will construct the embed URL automatically:

```
https://www.youtube.com/embed/VIDEO_ID?autoplay=0&rel=0
```

---

## Hidden Admin Page (`/admin.html`)

### Access Control

- **URL**: `/admin.html` (not linked anywhere on the public site)
- **Authentication**: Supabase Auth (email/password login)
- **Security**: Row Level Security ensures only authenticated admin can edit

### Admin Page Features

#### 1. Content Editor Interface

- Visual form-based editor for all database content
- Section tabs: Site Info | Home | Work | Contact | Projects
- Live preview of changes

#### 2. Project Management

- Add new project button
- Drag-to-reorder projects
- Delete project (with confirmation)
- Edit individual project details

#### 3. Media Management

- Instructions for Google Drive image/video setup
- URL validator (checks if links are accessible)
- Thumbnail preview for images

#### 4. Save Functionality

- **Save**: Writes directly to Supabase — changes visible to all visitors immediately
- **Export JSON**: Downloads current content as backup file
- **No localStorage** — all data lives in the cloud database

### Admin Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 Isabelle Denham Portfolio — Admin                      │
├─────────────────────────────────────────────────────────────┤
│  [Site Info] [Home] [Work Page] [Contact] [Projects]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PROJECTS                           [+ Add Project]  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ☰ The Fringe          Documentary  2024  [Edit]    │   │
│  │  ☰ Couch 44            TV Series    2023  [Edit]    │   │
│  │  ☰ Peridition          Music Video  2023  [Edit]    │   │
│  │  ☰ 48 Hours            Short Film   2023  [Edit]    │   │
│  │  ☰ Cranker             Documentary  2022  [Edit]    │   │
│  │  ☰ The Experiment      Short Film   2022  [Edit]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  EDIT PROJECT: The Fringe                           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Title:     [The Fringe                        ]    │   │
│  │  Subtitle:  [A Story of Two Artists            ]    │   │
│  │  Type:      [Documentary              ▼]            │   │
│  │  Year:      [2024]                                  │   │
│  │  Role:      [Director / Editor                 ]    │   │
│  │                                                     │   │
│  │  Thumbnail URL (Google Drive):                      │   │
│  │  [https://drive.google.com/uc?export=view&id=...]   │   │
│  │  [Preview] ✓ Valid                                  │   │
│  │                                                     │   │
│  │  Video Type: (●) YouTube  ( ) Google Drive          │   │
│  │  Video ID:   [dQw4w9WgXcQ                      ]    │   │
│  │                                                     │   │
│  │  Description:                                       │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ An intimate documentary following two         │  │   │
│  │  │ emerging artists as they navigate...          │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  ☑ Featured on Home Page                           │   │
│  │                                                     │   │
│  │  [Save Project]  [Delete]  [Cancel]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [💾 Save All]  [📥 Export JSON]  [📤 Import JSON]  [↺ Reset] │
└─────────────────────────────────────────────────────────────┘
```

### Supabase Database Schema

```sql
-- Site settings (single row table)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Isabelle Denham',
  tagline TEXT DEFAULT 'Film Director',
  contact_email TEXT,
  form_endpoint TEXT,
  social_vimeo TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  hero_video_type TEXT DEFAULT 'youtube',
  hero_video_id TEXT,
  hero_poster_url TEXT,
  about_heading TEXT DEFAULT 'About Me',
  about_bio TEXT,
  about_portrait_url TEXT,
  footer_heading TEXT DEFAULT 'Let''s create something.',
  footer_copyright TEXT,
  work_page_heading TEXT DEFAULT 'Selected Work',
  work_page_subheading TEXT,
  contact_page_heading TEXT DEFAULT 'LET''S CREATE',
  contact_page_subheading TEXT,
  featured_project_ids TEXT[], -- Array of project IDs
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY, -- e.g., 'fringe', 'couch-44'
  title TEXT NOT NULL,
  subtitle TEXT,
  type TEXT NOT NULL, -- 'Documentary', 'Short Film', etc.
  year TEXT,
  role TEXT,
  thumbnail_url TEXT,
  video_type TEXT DEFAULT 'youtube', -- 'youtube' or 'googledrive'
  video_id TEXT,
  description TEXT,
  credits JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public website)
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);

-- Only authenticated admin can write
CREATE POLICY "Admin write access" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON projects
  FOR ALL USING (auth.role() = 'authenticated');
```

### Supabase Authentication (Admin Login)

```javascript
// supabase-client.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin login
async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

// Check if logged in
async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Logout
async function adminLogout() {
  await supabase.auth.signOut();
  window.location.href = "/admin.html";
}
```

### Security — Row Level Security (RLS)

**Supabase provides proper server-side security**:

- ✅ **Public visitors**: Can only READ content (SELECT)
- ✅ **Authenticated admin**: Can READ, INSERT, UPDATE, DELETE
- ✅ **No client-side hacks** — security enforced at database level
- ✅ **Anon key is safe to expose** — RLS protects the data

**Admin account setup**:

1. Go to Supabase Dashboard → Authentication → Users
2. Create a user with Isabelle's email
3. She logs in via the admin page with email/password

### Content Manager (Supabase Version)

```javascript
// content-manager.js
import { supabase } from "./supabase-client.js";

class ContentManager {
  constructor() {
    this.settings = null;
    this.projects = [];
  }

  // Load all content from Supabase
  async loadContent() {
    const [settingsRes, projectsRes] = await Promise.all([
      supabase.from("site_settings").select("*").single(),
      supabase.from("projects").select("*").order("display_order"),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (projectsRes.error) throw projectsRes.error;

    this.settings = settingsRes.data;
    this.projects = projectsRes.data;

    return { settings: this.settings, projects: this.projects };
  }

  // Update site settings
  async updateSettings(updates) {
    const { error } = await supabase
      .from("site_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", this.settings.id);

    if (error) throw error;
    Object.assign(this.settings, updates);
  }

  // Create project
  async createProject(project) {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    this.projects.push(data);
    return data;
  }

  // Update project
  async updateProject(id, updates) {
    const { error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    const index = this.projects.findIndex((p) => p.id === id);
    if (index !== -1) Object.assign(this.projects[index], updates);
  }

  // Delete project
  async deleteProject(id) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  // Reorder projects
  async reorderProjects(orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from("projects")
        .update({ display_order: update.display_order })
        .eq("id", update.id);
    }
  }

  // Getters
  getProjects() {
    return this.projects;
  }

  getFeaturedProjects() {
    const ids = this.settings?.featured_project_ids || [];
    return ids
      .map((id) => this.projects.find((p) => p.id === id))
      .filter(Boolean);
  }

  getProjectById(id) {
    return this.projects.find((p) => p.id === id);
  }

  getSettings() {
    return this.settings;
  }

  // Export for backup
  exportJSON() {
    const content = {
      settings: this.settings,
      projects: this.projects,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-backup-${Date.now()}.json`;
    a.click();
  }
}

// Global instance
export const contentManager = new ContentManager();
```

---

## Dynamic Content Loading

All content is fetched from Supabase when pages load. Data is cached in memory for the session to minimize API calls.

### Initialization Pattern (All Pages)

```javascript
// main.js - Run on every page
import { contentManager } from "./content-manager.js";

async function initializeSite() {
  try {
    // Show loading state
    document.body.classList.add("loading");

    // Load all content from Supabase (cached for session)
    await contentManager.loadContent();

    // Remove loading state
    document.body.classList.remove("loading");

    // Trigger page-specific rendering
    document.dispatchEvent(new Event("content-ready"));
  } catch (error) {
    console.error("Failed to load content:", error);
    // Show error state or fallback content
  }
}

document.addEventListener("DOMContentLoaded", initializeSite);
```

### Work Page — Dynamic Grid Population

```javascript
// work.js
import { contentManager } from "./content-manager.js";

function renderWorkGrid() {
  const projects = contentManager.getProjects();

  const grid = document.getElementById("work-grid");
  grid.innerHTML = projects
    .map(
      (project) => `
    <a href="project.html?id=${project.id}" class="work-card">
      <div class="work-card__media">
        <img 
          src="${project.thumbnail_url}" 
          alt="${project.title}"
          loading="lazy"
        />
      </div>
      <div class="work-card__overlay">
        <span class="work-card__type">${project.type}</span>
        <h3 class="work-card__title">${project.title}</h3>
      </div>
    </a>
  `
    )
    .join("");
}

// Wait for content to be loaded from Supabase
document.addEventListener("content-ready", renderWorkGrid);
```

### Project Detail Page — Dynamic Content

Instead of multiple static HTML files, use a single `project.html` template:

```javascript
// project.js

function renderProjectPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const project = contentManager.getProjectById(projectId);

  if (!project) {
    window.location.href = "work.html";
    return;
  }

  // Update page content
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-subtitle").textContent = project.subtitle;
  document.getElementById("project-type").textContent = project.type;
  document.getElementById("project-year").textContent = project.year;
  document.getElementById("project-role").textContent = project.role;
  document.getElementById("project-description").textContent =
    project.description;

  // Render video embed
  const videoContainer = document.getElementById("project-video");
  if (project.videoType === "youtube") {
    videoContainer.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${project.videoId}?rel=0" 
        frameborder="0" 
        allowfullscreen
      ></iframe>
    `;
  } else if (project.videoType === "googledrive") {
    videoContainer.innerHTML = `
      <iframe 
        src="https://drive.google.com/file/d/${project.videoId}/preview" 
        frameborder="0" 
        allowfullscreen
      ></iframe>
    `;
  }

  // Update page title
  document.title = `${project.title} — Isabelle Denham`;
}

document.addEventListener("DOMContentLoaded", renderProjectPage);
```

### Home Page — Dynamic Featured Projects

```javascript
// home.js

function renderFeaturedWork() {
  const featured = contentManager.getFeaturedProjects();
  const carousel = document.getElementById("featured-carousel");

  carousel.innerHTML = featured
    .map(
      (project, index) => `
    <div class="featured-slide ${
      index === 0 ? "active" : ""
    }" data-index="${index}">
      <div class="featured-slide__video">
        ${getVideoEmbed(project)}
      </div>
      <div class="featured-slide__info">
        <h3 class="featured-slide__title">${project.title}</h3>
        <a href="project.html?id=${project.id}" class="featured-slide__link">
          More Info
        </a>
      </div>
    </div>
  `
    )
    .join("");
}

function getVideoEmbed(project) {
  if (project.videoType === "youtube") {
    return `<iframe src="https://www.youtube.com/embed/${project.videoId}?rel=0" 
            frameborder="0" allowfullscreen></iframe>`;
  }
  return `<iframe src="https://drive.google.com/file/d/${project.videoId}/preview" 
          frameborder="0" allowfullscreen></iframe>`;
}
```

### Contact Page — Dynamic Details

```javascript
// contact.js

function renderContactPage() {
  const contact = contentManager.getContact();
  const pageContent = contentManager.content.contactPage;

  // Update text content
  document.getElementById("contact-heading").textContent = pageContent.heading;
  document.getElementById("contact-subheading").textContent =
    pageContent.subheading;
  document.getElementById("direct-email").href = `mailto:${contact.email}`;
  document.getElementById("direct-email").textContent = contact.email;

  // Update form endpoint
  document.getElementById("contact-form").action = contact.formEndpoint;

  // Update social links
  document.getElementById("social-vimeo").href = contact.social.vimeo;
  document.getElementById("social-instagram").href = contact.social.instagram;
  document.getElementById("social-linkedin").href = contact.social.linkedin;
}
```

---

## Component Specifications

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: white;
  padding: 14px 32px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 30px var(--accent-glow);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 14px 32px;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### Navigation

- Height: 80px
- Logo: "Isabelle Denham" with pink diamond/accent before name
- Links: 14px, uppercase, letter-spacing 0.1em
- Active state: Pink color
- Mobile: Hamburger menu (slide-in from right)

### Video Cards

- Aspect ratio: 16:9 enforced via `aspect-ratio` or padding hack
- Border-radius: 8px
- Overflow: hidden
- Gradient overlay: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)`
- Hover scale: 1.02 with smooth transition

### Form Inputs

- Background: var(--bg-secondary)
- Border: 1px solid var(--border-subtle)
- Padding: 16px 20px
- Font-size: 16px (prevents iOS zoom)
- Placeholder: var(--text-muted)
- Focus: border-color var(--accent-primary), subtle glow

---

## Animation & Interaction

### Page Load

- Staggered fade-in for hero elements (0.1s delay increments)
- Nav slides down from top (0.5s ease-out)

### Scroll Animations

- Sections fade-in + slight translate-up on enter viewport
- About image: subtle parallax (slower scroll rate)
- "My Work" vertical text: sticky positioning while in section

### Hover States

- Buttons: Color shift + glow
- Video cards: Scale 1.02, play video
- Links: Pink color transition
- Nav links: Underline animation (expand from center)

### Micro-interactions

- Form focus: Input border animates color
- Scroll hint: Gentle bounce animation
- Social icons: Scale up on hover

---

## Responsive Breakpoints

```css
/* Mobile First */
--mobile: 0px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1440px;
```

### Mobile Adaptations (< 768px)

- Navigation: Hamburger menu
- Hero: 100vh, stacked CTAs
- About: Single column, image above text
- Work grid: Single column
- Contact form: Single column inputs

### Tablet Adaptations (768px - 1024px)

- Work grid: 2 columns maintained
- About: Tighter gap, smaller image

---

## Assets Inventory

### Images — To Be Uploaded to Google Drive

The following local images should be uploaded to Google Drive and their URLs added to Supabase:

| Local File     | Google Drive Folder | Supabase Field                           |
| -------------- | ------------------- | ---------------------------------------- |
| izzy.jpg       | /portraits/         | `site_settings.about_portrait_url`       |
| Isabelle.jpg   | /portraits/         | Backup portrait option                   |
| 48-Hours.png   | /thumbnails/        | `projects.thumbnail_url` (id=48-hours)   |
| Cranker.jpeg   | /thumbnails/        | `projects.thumbnail_url` (id=cranker)    |
| Experiment.png | /thumbnails/        | `projects.thumbnail_url` (id=experiment) |
| fringe.jpeg    | /thumbnails/        | `projects.thumbnail_url` (id=fringe)     |
| Peridition.png | /thumbnails/        | `projects.thumbnail_url` (id=peridition) |
| couch 44.jpg   | /thumbnails/        | `projects.thumbnail_url` (id=couch-44)   |

### Google Drive Folder Structure (Recommended)

```
Portfolio Assets/
├── portraits/
│   ├── headshot-main.jpg      → About section
│   └── headshot-alt.jpg       → Backup
├── thumbnails/
│   ├── fringe-thumb.jpg
│   ├── couch44-thumb.jpg
│   ├── peridition-thumb.jpg
│   ├── 48hours-thumb.jpg
│   ├── cranker-thumb.jpg
│   └── experiment-thumb.jpg
└── misc/
    └── hero-poster.jpg        → Video poster fallback
```

### Fonts Available (Local)

| File                      | Usage                          |
| ------------------------- | ------------------------------ |
| Bubble Garden Bold.ttf    | Logo accent (optional)         |
| Bubble Garden Regular.ttf | Decorative elements (optional) |

### External Fonts (Google Fonts)

- Syne: 700, 800
- Outfit: 300, 400, 500, 600

---

## File Structure

```
/
├── index.html              # Home page
├── work.html               # Work portfolio page (dynamic grid)
├── project.html            # Single project detail template (dynamic)
├── contact.html            # Contact page
├── admin.html              # Hidden admin page (password protected)
│
├── style.css               # Main stylesheet
├── admin.css               # Admin page styles
│
├── js/
│   ├── supabase-client.js  # Supabase client initialization
│   ├── content-manager.js  # ContentManager class (Supabase operations)
│   ├── main.js             # Shared functionality (nav, animations, init)
│   ├── home.js             # Home page specific logic
│   ├── work.js             # Work grid population
│   ├── project.js          # Project detail page logic
│   ├── contact.js          # Contact page logic
│   └── admin.js            # Admin panel functionality + auth
│
├── assets/
│   └── fonts/
│       ├── Bubble Garden Bold.ttf
│       └── Bubble Garden Regular.ttf
│
└── [No local images - all hosted on Google Drive]
```

### Key Architectural Changes

1. **Supabase database** — All content stored in cloud PostgreSQL

   - Changes visible to all visitors immediately
   - Proper authentication for admin access
   - No localStorage or client-side storage

2. **Single `project.html` template** replaces multiple static project pages

   - Uses URL parameter: `project.html?id=fringe`
   - Content loaded dynamically from Supabase

3. **No local image storage** — All images hosted on Google Drive

   - Reduces repository size
   - Allows client to update images without code access
   - Fallback images should be included for development

4. **Modular JavaScript (ES6 Modules)** — Separated by page/function

5. **Admin page with Supabase Auth** — Secure email/password login

---

## Technical Implementation Notes

### Content Management System (Supabase)

**Storage Architecture**:

- **Database**: Supabase PostgreSQL (cloud-hosted)
- **API**: Supabase REST API (auto-generated from schema)
- **Authentication**: Supabase Auth (email/password for admin)
- **Security**: Row Level Security (RLS) policies

**Why Supabase?**

- ✅ Free tier is generous (500MB database, unlimited API requests)
- ✅ Content changes visible to ALL visitors immediately
- ✅ Proper authentication (not client-side hacks)
- ✅ Works seamlessly with Vercel hosting
- ✅ No server to manage — fully managed service
- ✅ Backup/export functionality built-in

**Data Flow**:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Visitor   │───▶│   Vercel    │───▶│  Supabase   │
│   Browser   │◀───│   (Static)  │◀───│  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
                                             ▲
┌─────────────┐                              │
│   Admin     │──────────────────────────────┘
│   (Isabelle)│  (Authenticated write access)
└─────────────┘
```

**Environment Variables (Vercel)**:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

These are safe to expose — RLS protects the data.

### Video Handling

- **YouTube embeds**: Use `youtube-nocookie.com` for privacy-enhanced mode
- **Google Drive embeds**: Use `/preview` endpoint in iframe
- **Poster images**: Load from Google Drive, show while video loads
- **Responsive aspect ratio**: Maintain 16:9 via CSS `aspect-ratio` property

```javascript
// Video embed helper
function createVideoEmbed(videoType, videoId) {
  const urls = {
    youtube: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
    googledrive: `https://drive.google.com/file/d/${videoId}/preview`,
  };
  return urls[videoType] || "";
}
```

### Google Drive Image Considerations

**Pros**:

- Free hosting
- Client can manage without developer
- Unlimited (within Drive storage limits)

**Cons**:

- Slightly slower than CDN
- May require CORS handling for some operations
- Link format must be correct or images won't display

**Image URL Validation**:

```javascript
function validateGoogleDriveUrl(url) {
  const pattern = /drive\.google\.com\/uc\?export=view&id=[a-zA-Z0-9_-]+/;
  return pattern.test(url);
}
```

### Form Submission

- **Recommended**: Formspree (free tier: 50 submissions/month)
- **Setup**: Create account at formspree.io, get form endpoint
- **Store endpoint in JSON**: Allows client to update without code changes
- Include honeypot field for spam prevention
- Client-side validation before submission

### Performance

- Lazy load images below the fold (`loading="lazy"`)
- Use intersection observer for scroll animations
- Preload critical fonts (Syne, Outfit)
- Defer non-critical JavaScript

### Accessibility

- Proper heading hierarchy (h1 → h2 → h3)
- Alt text loaded from JSON (each image has alt property)
- Keyboard navigation support
- Focus visible states
- Reduced motion media query for animations
- Skip to content link for screen readers

### Browser Support

- Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Fetch API: Required for Supabase calls (all modern browsers)
- ES6 Modules: Required for JavaScript architecture
- CSS aspect-ratio: Supported in all modern browsers
- CSS clamp(): Supported in all modern browsers
- No IE11 support required

### Supabase Setup Steps

1. **Create Supabase project** at supabase.com
2. **Run database migrations** (SQL schema provided above)
3. **Enable Row Level Security** on both tables
4. **Create admin user** in Authentication → Users
5. **Copy project URL and anon key** to environment variables
6. **Seed initial data** via Supabase dashboard or SQL

---

## Implementation Priority

### Phase 1: Core Structure + Supabase Setup

1. **Supabase project setup** (database, auth, RLS policies)
2. HTML structure for all pages (including admin.html)
3. CSS custom properties and base styles
4. Typography system
5. Navigation component
6. **`supabase-client.js`** — Supabase initialization
7. **`content-manager.js`** — ContentManager class with Supabase operations

### Phase 2: Home Page (Dynamic)

1. Hero section with dynamic video embed
2. About section with JSON-loaded content
3. My Work carousel with featured projects from JSON
4. Footer with dynamic contact info

### Phase 3: Work Page + Project Detail (Dynamic)

1. Grid layout populated from projects array
2. Video card components
3. Hover interactions
4. **Single `project.html` template** loading content via URL param
5. Video embed handling (YouTube + Google Drive)

### Phase 4: Contact Page (Dynamic)

1. Form layout and styling
2. Dynamic form endpoint from JSON
3. Dynamic social links
4. Form validation
5. Success/error states

### Phase 5: Admin Panel

1. Password gate UI
2. Content editor tabs (Site Info, Home, Work, Contact, Projects)
3. Project CRUD interface (Create, Read, Update, Delete)
4. Drag-to-reorder functionality
5. Save to localStorage
6. Export/Import JSON functionality
7. Reset to default option

### Phase 6: Polish

1. Animations and transitions
2. Responsive refinements
3. Admin page mobile responsiveness
4. Performance optimization
5. Cross-browser testing

---

## Content Setup Guide (For Client)

### Initial Setup — Google Drive Configuration

1. **Create a folder** in Google Drive named "Portfolio Assets"
2. **Create subfolders**: `thumbnails`, `portraits`, `misc`
3. **Upload images** to appropriate folders
4. **For each image**:
   - Right-click → Share → Change to "Anyone with the link"
   - Copy link, extract FILE_ID, construct URL:
     ```
     https://drive.google.com/uc?export=view&id=YOUR_FILE_ID
     ```

### Video Setup

**For YouTube videos**:

1. Upload video to YouTube (can be unlisted)
2. Copy video ID from URL: `youtube.com/watch?v=VIDEO_ID`

**For Google Drive videos**:

1. Upload video to Google Drive
2. Share → Anyone with the link
3. Copy FILE_ID for embed URL

### Admin Page Usage

1. Navigate to `yoursite.com/admin.html`
2. Enter password
3. Edit content using the visual interface
4. Click "Save All" to apply changes
5. **Always export JSON backup** after major changes

---

## Content Checklist (To Be Provided by Client)

### Required Content

- [ ] Bio text for About section (2-3 sentences)
- [ ] Professional headshot (upload to Google Drive)
- [ ] Showreel or hero video (YouTube or Google Drive)
- [ ] Contact email address
- [ ] Form endpoint (Formspree, etc.)

### Social Media Links

- [ ] Vimeo profile URL
- [ ] Instagram profile URL
- [ ] LinkedIn profile URL

### For Each Project

- [ ] Project title
- [ ] Type (Documentary, Short Film, Music Video, TV Series, etc.)
- [ ] Year
- [ ] Role(s)
- [ ] Description (2-3 sentences)
- [ ] Thumbnail image (upload to Google Drive)
- [ ] Video (YouTube link or Google Drive)
- [ ] Whether to feature on homepage

### Admin Access (Supabase Auth)

- [ ] Admin email address (for login)
- [ ] Choose admin password
- [ ] Document credentials securely

### Supabase Project

- [ ] Create Supabase account/project
- [ ] Note project URL and anon key for Vercel env vars

---

_Design plan created: December 2024_  
_Ready for development implementation_
