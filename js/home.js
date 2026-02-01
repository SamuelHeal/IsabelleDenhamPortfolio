// ═══════════════════════════════════════════════════════════════════════════
// HOME.JS — Home page specific functionality
// ═══════════════════════════════════════════════════════════════════════════

import { contentManager, formatTextWithLineBreaks, convertGoogleDriveUrl } from './main.js';

// ─────────────────────────────────────────────────────────────────────────────
// HERO VIDEO STATE
// ─────────────────────────────────────────────────────────────────────────────

let heroPlayer = null;
// Video always starts muted, user must click to unmute
let videoControls = {
  playBtn: null,
  muteBtn: null
};

// Responsive video state
let currentVideoMode = null; // 'desktop' or 'mobile'
let videoSettings = null;
const MOBILE_BREAKPOINT = 768;

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
  
  // Store settings for responsive switching
  videoSettings = settings;
  
  // Determine which video to load based on screen size
  const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT;
  const hasMobileVideo = settings.hero_video_mobile && settings.hero_video_type === 'supabase';
  
  // Set video mode and add class to hero for CSS
  currentVideoMode = (isMobileView && hasMobileVideo) ? 'mobile' : 'desktop';
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.classList.toggle('hero--mobile-video', currentVideoMode === 'mobile');
  }
  
  // Update hero video
  const videoContainer = document.getElementById('hero-video');
  if (videoContainer && settings.hero_video_id) {
    if (settings.hero_video_type === 'youtube') {
      initYouTubePlayer(settings.hero_video_id);
    } else if (settings.hero_video_type === 'googledrive') {
      initGoogleDriveVideo(settings.hero_video_id);
    } else if (settings.hero_video_type === 'supabase') {
      // Load mobile or desktop video based on current mode
      const filename = (currentVideoMode === 'mobile') 
        ? settings.hero_video_mobile 
        : settings.hero_video_id;
      initSupabaseVideo(filename, currentVideoMode === 'mobile');
    }
  }
  
  // Listen for resize to potentially switch videos (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResponsiveVideoSwitch, 250);
  });
  
  // Update scroll hint
  const scrollHint = document.querySelector('.hero__scroll-hint span');
  if (scrollHint) {
    scrollHint.textContent = 'About me';
  }
  
  // Initialize video control buttons
  initVideoControls();
}

function handleResponsiveVideoSwitch() {
  if (!videoSettings || videoSettings.hero_video_type !== 'supabase') return;
  if (!videoSettings.hero_video_mobile) return; // No mobile video to switch to
  
  const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT;
  const newMode = isMobileView ? 'mobile' : 'desktop';
  
  // Only switch if mode changed
  if (newMode !== currentVideoMode) {
    currentVideoMode = newMode;
    
    // Update hero class
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.classList.toggle('hero--mobile-video', newMode === 'mobile');
    }
    
    // Preserve playback state
    const wasPlaying = htmlVideoElement && !htmlVideoElement.paused;
    const wasMuted = htmlVideoElement ? htmlVideoElement.muted : true;
    const currentTime = htmlVideoElement ? htmlVideoElement.currentTime : 0;
    
    // Load new video
    const filename = (newMode === 'mobile') 
      ? videoSettings.hero_video_mobile 
      : videoSettings.hero_video_id;
    
    initSupabaseVideo(filename, newMode === 'mobile', {
      preserveState: true,
      wasPlaying,
      wasMuted,
      currentTime: Math.min(currentTime, 5) // Start near beginning for smooth transition
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE STORAGE VIDEO (Recommended - Most Reliable)
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://pandxectpkqgzwdordmp.supabase.co";
let htmlVideoElement = null;

function initSupabaseVideo(filename, isMobileVideo = false, preservedState = null) {
  const videoContainer = document.getElementById('hero-video');
  if (!videoContainer) return;
  
  // Construct Supabase Storage public URL
  // Format: {supabase_url}/storage/v1/object/public/{bucket}/{filename}
  const videoUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${filename}`;
  
  // Add mobile class for portrait video styling
  const videoClass = isMobileVideo ? 'hero__video--portrait' : '';
  
  videoContainer.innerHTML = `
    <video 
      id="supabase-video"
      class="${videoClass}"
      playsinline
      preload="auto"
      muted
    >
      <source src="${videoUrl}" type="video/mp4">
    </video>
  `;
  
  htmlVideoElement = document.getElementById('supabase-video');
  
  if (htmlVideoElement) {
    // Set up event listeners
    htmlVideoElement.addEventListener('loadeddata', onVideoReady);
    htmlVideoElement.addEventListener('canplay', () => {
      onVideoReady();
      
      // Restore preserved state if switching videos
      if (preservedState?.preserveState) {
        htmlVideoElement.muted = preservedState.wasMuted;
        htmlVideoElement.currentTime = preservedState.currentTime;
        if (preservedState.wasPlaying) {
          htmlVideoElement.play();
        }
        updateControlStates(preservedState.wasPlaying, preservedState.wasMuted);
      }
    });
    htmlVideoElement.addEventListener('ended', onVideoEnded);
    htmlVideoElement.addEventListener('play', () => {
      if (videoControls.playBtn) {
        videoControls.playBtn.classList.add('playing');
      }
    });
    htmlVideoElement.addEventListener('pause', () => {
      if (videoControls.playBtn) {
        videoControls.playBtn.classList.remove('playing');
      }
    });
    
    // Handle load errors
    htmlVideoElement.addEventListener('error', (e) => {
      console.error('Supabase video failed to load:', e);
      console.error('Video URL:', videoUrl);
    });
    
    // Start playback (muted for guaranteed autoplay) - unless restoring state
    if (!preservedState?.preserveState) {
      attemptAutoplay();
    }
  }
}

function onVideoReady() {
  if (videoControls.playBtn) {
    videoControls.playBtn.classList.add('playing');
  }
}

function onVideoEnded() {
  if (!htmlVideoElement) return;
  
  // Loop the video (stays muted)
  htmlVideoElement.currentTime = 0;
  htmlVideoElement.play();
}

function attemptAutoplay() {
  if (!htmlVideoElement) return;
  
  // Always start muted for consistent behavior
  htmlVideoElement.muted = true;
  htmlVideoElement.volume = 1;
  
  const playPromise = htmlVideoElement.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        updateControlStates(true, true);
        if (videoControls.muteBtn) {
          videoControls.muteBtn.classList.add('muted');
        }
      })
      .catch(err => {
        console.error('Video autoplay failed:', err);
      });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE DRIVE VIDEO (Fallback - Less Reliable)
// ─────────────────────────────────────────────────────────────────────────────

function initGoogleDriveVideo(videoId) {
  const videoContainer = document.getElementById('hero-video');
  if (!videoContainer) return;
  
  // Store video ID for fallback
  const storedVideoId = videoId;
  
  // Try the lh3.googleusercontent direct streaming URL (most reliable for media)
  const primaryUrl = `https://lh3.googleusercontent.com/d/${videoId}`;
  // Fallback URL format
  const fallbackUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;
  
  videoContainer.innerHTML = `
    <video 
      id="gdrive-video"
      playsinline
      preload="auto"
      muted
    >
      <source src="${primaryUrl}" type="video/mp4">
      <source src="${fallbackUrl}" type="video/mp4">
    </video>
  `;
  
  htmlVideoElement = document.getElementById('gdrive-video');
  
  if (htmlVideoElement) {
    // Set up event listeners
    htmlVideoElement.addEventListener('loadeddata', onGDriveVideoReady);
    htmlVideoElement.addEventListener('canplay', onGDriveVideoReady);
    htmlVideoElement.addEventListener('ended', onGDriveVideoEnded);
    htmlVideoElement.addEventListener('play', () => {
      if (videoControls.playBtn) {
        videoControls.playBtn.classList.add('playing');
      }
    });
    htmlVideoElement.addEventListener('pause', () => {
      if (videoControls.playBtn) {
        videoControls.playBtn.classList.remove('playing');
      }
    });
    
    // Handle load errors - fallback to iframe embed
    htmlVideoElement.addEventListener('error', (e) => {
      console.log('HTML5 video error, falling back to iframe embed', e);
      fallbackToIframeEmbed(storedVideoId);
    });
    
    // Also set a timeout fallback if video doesn't start loading
    setTimeout(() => {
      if (htmlVideoElement && htmlVideoElement.readyState === 0) {
        console.log('Video not loading, falling back to iframe embed');
        fallbackToIframeEmbed(storedVideoId);
      }
    }, 5000);
    
    // Try to play immediately (start muted for guaranteed autoplay)
    attemptGDriveAutoplay();
  }
}

function fallbackToIframeEmbed(videoId) {
  const videoContainer = document.getElementById('hero-video');
  if (!videoContainer) return;
  
  // Clear HTML5 video reference
  htmlVideoElement = null;
  
  // Use iframe embed with pointer-events enabled for native controls
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  
  videoContainer.innerHTML = `
    <iframe 
      id="gdrive-iframe"
      src="${embedUrl}" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;
  
  // Add class to enable pointer events on iframe
  videoContainer.classList.add('gdrive-fallback');
  
  // Hide our custom controls since we can't control iframe
  const controls = document.getElementById('video-controls');
  if (controls) {
    controls.style.display = 'none';
  }
}

function attemptGDriveAutoplay() {
  if (!htmlVideoElement) return;
  
  // Always start muted for consistent behavior
  htmlVideoElement.muted = true;
  htmlVideoElement.volume = 1;
  
  const playPromise = htmlVideoElement.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        updateControlStates(true, true);
        if (videoControls.muteBtn) {
          videoControls.muteBtn.classList.add('muted');
        }
      })
      .catch(err => {
        console.error('Video autoplay failed:', err);
      });
  }
}

function onGDriveVideoReady() {
  if (videoControls.playBtn) {
    videoControls.playBtn.classList.add('playing');
  }
}

function onGDriveVideoEnded() {
  if (!htmlVideoElement) return;
  
  // Loop the video (stays muted)
  htmlVideoElement.currentTime = 0;
  htmlVideoElement.play();
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE IFRAME API
// ─────────────────────────────────────────────────────────────────────────────

function initYouTubePlayer(videoId) {
  // Load YouTube IFrame API
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
    
    // Wait for API to load
    window.onYouTubeIframeAPIReady = () => createPlayer(videoId);
  } else {
    createPlayer(videoId);
  }
}

function createPlayer(videoId) {
  const videoContainer = document.getElementById('hero-video');
  if (!videoContainer) return;
  
  // Create placeholder div for player
  videoContainer.innerHTML = '<div id="yt-player"></div>';
  
  heroPlayer = new YT.Player('yt-player', {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      mute: 1, // Start muted to ensure autoplay works
      loop: 0, // We'll handle looping manually
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  const player = event.target;
  
  // Video starts muted and autoplaying
  if (videoControls.playBtn) {
    videoControls.playBtn.classList.add('playing');
  }
  
  // Always stay muted until user clicks unmute
  updateControlStates(true, true);
  if (videoControls.muteBtn) {
    videoControls.muteBtn.classList.add('muted');
  }
}

function onPlayerStateChange(event) {
  // YT.PlayerState.ENDED = 0 - loop the video
  if (event.data === 0) {
    heroPlayer.seekTo(0);
    heroPlayer.playVideo();
  }
  
  // Update play button state
  // YT.PlayerState.PLAYING = 1
  // YT.PlayerState.PAUSED = 2
  if (event.data === 1) {
    if (videoControls.playBtn) {
      videoControls.playBtn.classList.add('playing');
    }
  } else if (event.data === 2 || event.data === 0) {
    if (videoControls.playBtn) {
      videoControls.playBtn.classList.remove('playing');
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

function initVideoControls() {
  videoControls.playBtn = document.getElementById('video-play-btn');
  videoControls.muteBtn = document.getElementById('video-mute-btn');
  
  if (videoControls.playBtn) {
    videoControls.playBtn.addEventListener('click', togglePlayPause);
  }
  
  if (videoControls.muteBtn) {
    videoControls.muteBtn.addEventListener('click', toggleMute);
    // Add initial muted state class for correct icon display
    videoControls.muteBtn.classList.add('muted');
  }
}

function togglePlayPause() {
  // Handle YouTube player
  if (heroPlayer) {
    const state = heroPlayer.getPlayerState();
    // YT.PlayerState.PLAYING = 1
    if (state === 1) {
      heroPlayer.pauseVideo();
    } else {
      heroPlayer.playVideo();
    }
    return;
  }
  
  // Handle HTML5 video (Google Drive)
  if (htmlVideoElement) {
    if (htmlVideoElement.paused) {
      htmlVideoElement.play();
    } else {
      htmlVideoElement.pause();
    }
  }
}

function toggleMute() {
  // Remove attention indicator on first interaction
  if (videoControls.muteBtn) {
    videoControls.muteBtn.classList.remove('attention');
  }
  
  // Handle YouTube player
  if (heroPlayer) {
    if (heroPlayer.isMuted()) {
      heroPlayer.unMute();
      updateControlStates(null, false);
      if (videoControls.muteBtn) {
        videoControls.muteBtn.classList.add('sound-active');
      }
    } else {
      heroPlayer.mute();
      updateControlStates(null, true);
      if (videoControls.muteBtn) {
        videoControls.muteBtn.classList.remove('sound-active');
      }
    }
    return;
  }
  
  // Handle HTML5 video (Supabase / Google Drive)
  if (htmlVideoElement) {
    if (htmlVideoElement.muted) {
      htmlVideoElement.muted = false;
      htmlVideoElement.volume = 1;
      updateControlStates(null, false);
      if (videoControls.muteBtn) {
        videoControls.muteBtn.classList.add('sound-active');
      }
    } else {
      htmlVideoElement.muted = true;
      updateControlStates(null, true);
      if (videoControls.muteBtn) {
        videoControls.muteBtn.classList.remove('sound-active');
      }
    }
  }
}

function updateControlStates(isPlaying, isMuted) {
  if (isPlaying !== null && videoControls.playBtn) {
    if (isPlaying) {
      videoControls.playBtn.classList.add('playing');
    } else {
      videoControls.playBtn.classList.remove('playing');
    }
  }
  
  if (isMuted !== null && videoControls.muteBtn) {
    if (isMuted) {
      videoControls.muteBtn.classList.add('muted');
      videoControls.muteBtn.classList.remove('sound-active');
    } else {
      videoControls.muteBtn.classList.remove('muted');
    }
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
// FEATURED WORK SECTION — Cinema Spotlight Cards
// ─────────────────────────────────────────────────────────────────────────────

function renderFeaturedWork() {
  const featured = contentManager.getFeaturedProjects();
  const carousel = document.getElementById('featured-carousel');
  
  if (!carousel || !featured.length) {
    return;
  }
  
  carousel.innerHTML = featured.map((project, index) => {
    const thumbnailUrl = project.thumbnail_url 
      ? convertGoogleDriveUrl(project.thumbnail_url)
      : `https://placehold.co/400x600/0a0a0a/d4a574?text=${encodeURIComponent(project.title)}`;
    
    // Extract year from date if available
    const year = project.year || (project.date ? new Date(project.date).getFullYear() : null);
    
    // Create description excerpt (first 150 chars)
    const description = project.description 
      ? project.description.substring(0, 150) + (project.description.length > 150 ? '...' : '')
      : '';
    
    // Build meta items
    const metaItems = [];
    if (year) {
      metaItems.push(`<div class="spotlight-card__meta-item"><span>${year}</span></div>`);
    }
    if (project.duration) {
      metaItems.push(`<div class="spotlight-card__meta-item"><span>${project.duration}</span></div>`);
    }
    if (project.role) {
      metaItems.push(`<div class="spotlight-card__meta-item"><span class="spotlight-card__meta-label">Role:</span> <span>${project.role}</span></div>`);
    }
    
    return `
      <article class="spotlight-card" data-index="${index}">
        <div class="spotlight-card__poster">
          <a href="project.html?id=${project.id}" class="spotlight-card__poster-link">
            <img 
              src="${thumbnailUrl}" 
              alt="${project.title} poster"
              loading="lazy"
            />
          </a>
        </div>
        
        <div class="spotlight-card__content">
          <span class="spotlight-card__type">${project.type}</span>
          
          <h3 class="spotlight-card__title">
            <a href="project.html?id=${project.id}">${project.title}</a>
          </h3>
          
          ${project.subtitle ? `<p class="spotlight-card__tagline">${project.subtitle}</p>` : ''}
          
          <div class="spotlight-card__divider"></div>
          
          ${metaItems.length ? `<div class="spotlight-card__meta">${metaItems.join('')}</div>` : ''}
          
          ${description ? `<p class="spotlight-card__description">${description}</p>` : ''}
          
          <div class="spotlight-card__cta">
            <a href="project.html?id=${project.id}" class="spotlight-card__cta-btn">
              View Project
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  // Trigger scroll animations for spotlight cards
  observeSpotlightCards();
}

// Intersection Observer for spotlight cards
function observeSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card');
  
  if (!cards.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  cards.forEach(card => observer.observe(card));
}


