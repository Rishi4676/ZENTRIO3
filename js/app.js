/* Zentrio AI - Global App Script */

document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen(); // Show welcome splash loader first!
  initTheme();
  checkAuthStatus();
  initButtonRipples();
  initLenisScroll();
  initScrollReveals(); // Register scroll reveals globally!
  initChatbotScript(); // Dynamically inject the chatbot widget!
  initPortalDropdown(); // Initialize portal dropdown logic!
  initLoginInterceptor(); // Intercept actions for guest users!
  initGlobalBackgroundVideo(); // Inject background video across all pages!
  initGlobalConstellation(); // Initialize the dynamic site-wide background animation!
});

// Dynamic Site-Wide Background Video Loader
function initGlobalBackgroundVideo() {
  if (document.getElementById('globalBgVideoContainer')) return;

  const container = document.createElement('div');
  container.id = 'globalBgVideoContainer';
  container.className = 'global-bg-video-container';

  const video = document.createElement('video');
  video.className = 'global-bg-video';
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');

  const source1 = document.createElement('source');
  source1.src = '/background-video.mp4';
  source1.type = 'video/mp4';
  video.appendChild(source1);

  const source2 = document.createElement('source');
  source2.src = '/assets/background-video.mp4';
  source2.type = 'video/mp4';
  video.appendChild(source2);

  const source3 = document.createElement('source');
  source3.src = '/background%20video.mp4';
  source3.type = 'video/mp4';
  video.appendChild(source3);
  container.appendChild(video);

  const overlay = document.createElement('div');
  overlay.className = 'global-bg-overlay';
  container.appendChild(overlay);

  document.body.prepend(container);

  // Attempt autoplay safely
  video.play().catch(err => {
    console.warn('Background video autoplay restricted:', err);
  });
}

// Dynamic Chatbot Script Loader
function initChatbotScript() {
  const chatbotScript = document.createElement('script');
  chatbotScript.src = '/js/chatbot.js';
  chatbotScript.defer = true;
  document.body.appendChild(chatbotScript);
}

// Theme Management (Dark Theme / Light Theme)
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  applyTheme(savedTheme);
  
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const themeIcons = document.querySelectorAll('.theme-toggle-btn svg');
  themeIcons.forEach(icon => {
    if (theme === 'dark') {
      // Set to sun icon (to toggle to light)
      icon.innerHTML = '<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/>';
      document.body.style.backgroundColor = '#0A0A0A';
    } else {
      // Set to moon icon (to toggle to dark)
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      document.body.style.backgroundColor = '#FAFAFA';
    }
  });

  // Dynamically update CSS variables for light theme if selected
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg-primary', '#F9FAFB');
    document.documentElement.style.setProperty('--bg-secondary', '#FFFFFF');
    document.documentElement.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--bg-glass', 'rgba(249, 250, 251, 0.75)');
    document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.08)');
    document.documentElement.style.setProperty('--border-hover', 'rgba(0, 0, 0, 0.15)');
    document.documentElement.style.setProperty('--text-primary', '#111827');
    document.documentElement.style.setProperty('--text-secondary', '#4B5563');
    document.documentElement.style.setProperty('--text-muted', '#9CA3AF');
  } else {
    document.documentElement.style.setProperty('--bg-primary', '#0A0A0A');
    document.documentElement.style.setProperty('--bg-secondary', '#121212');
    document.documentElement.style.setProperty('--bg-card', 'rgba(18, 18, 18, 0.6)');
    document.documentElement.style.setProperty('--bg-glass', 'rgba(10, 10, 10, 0.65)');
    document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
    document.documentElement.style.setProperty('--border-hover', 'rgba(255, 255, 255, 0.15)');
    document.documentElement.style.setProperty('--text-primary', '#FFFFFF');
    document.documentElement.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.6)');
    document.documentElement.style.setProperty('--text-muted', 'rgba(255, 255, 255, 0.4)');
  }
}

// Authentication Check and Navbar State Management
async function checkAuthStatus() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  // Show Portal Login by default
  updateNavbarForGuestUser();

  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();

    if (data.success && data.user) {
      updateNavbarForLoggedInUser(data.user);
    } else {
      updateNavbarForGuestUser();
    }
  } catch (error) {
    updateNavbarForGuestUser();
  }
}

function updateNavbarForLoggedInUser(user) {
  window.isLoggedIn = true;
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    // Desktop Navbar actions update
    navActions.innerHTML = `
      <div class="theme-toggle-container">
        <button class="theme-toggle-btn" aria-label="Toggle Theme" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
          </svg>
        </button>
      </div>
      <div class="divider"></div>
      <div class="user-menu-container">
        <div class="user-badge" id="userBadge">
          <span class="user-avatar">${user.username.charAt(0).toUpperCase()}</span>
          <span>${user.username}</span>
        </div>
        <div class="user-dropdown" id="userDropdown">
          <button class="user-dropdown-btn" id="logoutBtn" type="button">Log out</button>
        </div>
      </div>
    `;
  }

  // Update nav-links to include Workspace link for all logged-in users (admin, worker, client)
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const hasWorkspace = navLinks.querySelector('a[href="/admin/"]');
    if (!hasWorkspace) {
      const workspaceLi = document.createElement('li');
      workspaceLi.innerHTML = '<a href="/admin/">Workspace</a>';
      const mobileActions = navLinks.querySelector('.nav-actions-mobile');
      if (mobileActions) {
        navLinks.insertBefore(workspaceLi, mobileActions);
      } else {
        navLinks.appendChild(workspaceLi);
      }
    }
  }

  // Update mobile drawer actions if exists
  const mobileActions = document.querySelector('.nav-actions-mobile');
  if (mobileActions) {
    mobileActions.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-secondary);">Theme Mode</span>
        <button class="theme-toggle-btn" aria-label="Toggle Theme" type="button" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--border-radius-sm); color: var(--text-primary); cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
          </svg>
        </button>
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom: 15px;">
        <span class="user-avatar" style="width:32px; height:32px; font-size:14px; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); border-radius: 50%; color: white; font-weight: 700;">${user.username.charAt(0).toUpperCase()}</span>
        <span style="font-weight: 500;">${user.username}</span>
      </div>
      <button class="btn btn-secondary" id="mobileLogoutBtn" style="width:100%;">Log out</button>
    `;
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', handleLogout);
    }
  }

  // Re-bind theme button in new HTML
  initTheme();
  
  // Dropdown toggle
  const userBadge = document.getElementById('userBadge');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userBadge && userDropdown) {
    userBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });
  }

  // Bind logout action
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function updateNavbarForGuestUser() {
  window.isLoggedIn = false;
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    navActions.innerHTML = `
      <div class="theme-toggle-container">
        <button class="theme-toggle-btn" aria-label="Toggle Theme" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
          </svg>
        </button>
      </div>
      <div class="divider"></div>
      <div class="portal-dropdown-container">
        <button class="portal-toggle-btn" type="button">
          Portal Login
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="portal-dropdown-menu">
          <a href="/portal/client-login" class="portal-dropdown-item">
            <div class="portal-item-icon client-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="portal-item-content">
              <div class="portal-item-title">Client Portal</div>
              <div class="portal-item-desc">Track project status & milestones</div>
            </div>
          </a>
          <a href="/portal/worker-login" class="portal-dropdown-item">
            <div class="portal-item-icon worker-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="portal-item-content">
              <div class="portal-item-title">Worker Portal</div>
              <div class="portal-item-desc">Submit engineering tasks & logs</div>
            </div>
          </a>
          <a href="/portal/admin-login" class="portal-dropdown-item divider-top">
            <div class="portal-item-icon admin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="portal-item-content">
              <div class="portal-item-title">Admin Access</div>
              <div class="portal-item-desc">Manage teams & client requests</div>
            </div>
          </a>
          <div class="portal-dropdown-footer">
            <a href="/portal/client-register" class="btn-register-link">Register New Client</a>
          </div>
        </div>
      </div>
      <a href="/signup" class="btn btn-primary btn-signup-nav">Get Started</a>
    `;
  }

  // Remove Workspace link from nav-links if guest
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const workspaceLink = navLinks.querySelector('a[href="/admin/"]');
    if (workspaceLink) {
      workspaceLink.parentElement.remove();
    }
  }

  // Update mobile drawer actions if exists
  const mobileActions = document.querySelector('.nav-actions-mobile');
  if (mobileActions) {
    mobileActions.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-secondary);">Theme Mode</span>
        <button class="theme-toggle-btn" aria-label="Toggle Theme" type="button" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--border-radius-sm); color: var(--text-primary); cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
          </svg>
        </button>
      </div>
      <div class="portal-dropdown-container" style="width: 100%;">
        <button class="portal-toggle-btn" type="button" style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: rgba(255,255,255,0.05); padding: 10px 14px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.875rem;">
          <span>Portal Login</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="portal-dropdown-menu" style="display: none; padding: 4px 0 10px 12px; border: none; background: transparent; box-shadow: none; width: 100%; position: static;">
          <a href="/portal/client-login" class="portal-dropdown-item" style="padding: 8px 0;">Client Portal</a>
          <a href="/portal/worker-login" class="portal-dropdown-item" style="padding: 8px 0;">Worker Portal</a>
          <a href="/portal/admin-login" class="portal-dropdown-item" style="padding: 8px 0;">Admin Access</a>
          <a href="/portal/client-register" class="portal-dropdown-item" style="padding: 8px 0; color: #00dfd8; font-weight:600;">Register New Client</a>
        </div>
      </div>
      <a href="/signup" class="btn btn-primary" style="width: 100%;">Get Started</a>
    `;
  }
  
  initTheme();
  initPortalDropdown();
}

async function handleLogout() {
  try {
    const getCsrfTokenFromCookie = () => {
      return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
    };
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfTokenFromCookie()
      }
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Button Click Ripple Animation
function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-signup, .btn-signup-nav');
    if (!btn) return;
    
    // Create ripple container if it doesn't exist
    let rippleContainer = btn.querySelector('.ripple-container');
    if (!rippleContainer) {
      rippleContainer = document.createElement('span');
      rippleContainer.className = 'ripple-container';
      btn.appendChild(rippleContainer);
    }
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    rippleContainer.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
}

// Smooth scrolling initialization via Lenis
function initLenisScroll() {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    
    // Bind scroll events to update navbar state
    lenis.on('scroll', (e) => {
      const header = document.querySelector('header');
      if (header) {
        if (e.scroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  } else {
    // Fallback standard scroll handler if Lenis is not loaded
    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }
}

// Global Scroll Reveals (AOS replacement)
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-init');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// Full-screen Splash Screen welcome loader logic (2 sec display)
function initSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;

  // Prevent background scrolling while splash is visible
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    // Fade out splash screen
    splash.classList.add('fade-out');
    
    // Restore scrolling
    document.body.style.overflow = '';
    
    // Completely remove splash screen from DOM after transition completes (800ms)
    setTimeout(() => {
      splash.remove();
    }, 800);
  }, 650);
}

// Initialize Portal Dropdown triggers and events (Desktop and Mobile)
function initPortalDropdown() {
  const containers = document.querySelectorAll('.portal-dropdown-container');
  
  containers.forEach(container => {
    const btn = container.querySelector('.portal-toggle-btn');
    const menu = container.querySelector('.portal-dropdown-menu');
    
    if (!btn || !menu) return;
    
    // Remove existing event listeners if any to prevent multiple binds
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close other active dropdowns
      containers.forEach(c => {
        if (c !== container) {
          c.classList.remove('active');
          const m = c.querySelector('.portal-dropdown-menu');
          if (m && window.innerWidth <= 992) {
            m.style.display = 'none';
          }
        }
      });
      
      const isActive = container.classList.toggle('active');
      
      // Mobile drawer submenu toggle logic
      if (window.innerWidth <= 992) {
        menu.style.display = isActive ? 'block' : 'none';
      }
    });
  });
  
  // Close dropdown menu when clicking outside
  document.addEventListener('click', (e) => {
    containers.forEach(c => {
      if (!c.contains(e.target)) {
        c.classList.remove('active');
        const m = c.querySelector('.portal-dropdown-menu');
        if (m && window.innerWidth <= 992) {
          m.style.display = 'none';
        }
      }
    });
  });
}

// Intercept clicks on protected actions for guest users
function initLoginInterceptor() {
  window.isLoggedIn = false; // default fallback state

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if user is logged in
    if (window.isLoggedIn) return;
    
    // Intercept signup, contact, and feedback navigation if guest
    if (href === '/signup' || href === '/contact' || href === '/feedback') {
      showLoginPromptModal(e, href);
    }
  });
}

// Display modern glassmorphic login prompt overlay
function showLoginPromptModal(e, redirectUrl) {
  e.preventDefault(); // Intercept standard transition
  
  let modal = document.getElementById('globalLoginPromptModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalLoginPromptModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="
        background: rgba(18, 18, 22, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 2.5rem 2rem;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
        transform: translateY(20px);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      ">
        <button id="closePromptBtn" style="
          position: absolute;
          top: 16px;
          right: 18px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.75rem;
          cursor: pointer;
          line-height: 1;
          transition: color 0.2s;
        " onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">&times;</button>
        
        <div style="
          width: 56px;
          height: 56px;
          background: rgba(0, 223, 216, 0.1);
          border: 1px solid rgba(0, 223, 216, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          color: #00dfd8;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        </div>
        
        <h3 style="
          font-family: 'Outfit', sans-serif;
          font-size: 1.45rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        ">Portal Login Required</h3>
        
        <p style="
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          margin-bottom: 2rem;
        ">Please log in to your portal to continue with this action.</p>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="/portal/client-login" style="
            display: block;
            width: 100%;
            padding: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 0.95rem;
            background: linear-gradient(135deg, #00dfd8 0%, #0072ff 100%);
            border: none;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 223, 216, 0.25);
            transition: opacity 0.2s, transform 0.1s;
          " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" onclick="document.getElementById('globalLoginPromptModal').style.display='none'">Login to Portal</a>
          
          <a href="/portal/client-register" style="
            display: block;
            width: 100%;
            padding: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 0.95rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.04)'; this.style.borderColor='rgba(255, 255, 255, 0.08)'" onclick="document.getElementById('globalLoginPromptModal').style.display='none'">Register Account</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close actions
    const closeModalFunc = () => {
      modal.style.opacity = '0';
      modal.firstElementChild.style.transform = 'translateY(20px)';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    };
    
    modal.querySelector('#closePromptBtn').addEventListener('click', closeModalFunc);
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) closeModalFunc();
    });
  }
  
  // Show Modal
  modal.style.display = 'flex';
  // Trigger animation reflow
  modal.offsetHeight;
  modal.style.opacity = '1';
  modal.firstElementChild.style.transform = 'translateY(0)';
}

// Global Constellation Dynamic Background Animation
function initGlobalConstellation() {
  // Disable on mobile/tablet viewports to save memory/CPU and render pages lag-free
  if (window.innerWidth < 768) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'globalQuantumCanvas';
  canvas.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-2; pointer-events:none; opacity: 0.65; transition: opacity 0.5s ease;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const connectionDistance = 140;
  
  const mouse = {
    x: null,
    y: null,
    radius: 170
  };

  // Determine count dynamically based on device size for optimization
  let particleCount = window.innerWidth < 768 ? 15 : 30;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-adjust particle count on large resizes
    const newCount = window.innerWidth < 768 ? 15 : 30;
    if (newCount !== particleCount) {
      particleCount = newCount;
      adjustParticlesCount();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // Mouse listeners
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class ConstellationParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1.5;
      this.color = Math.random() > 0.5 ? 'rgba(0, 223, 216, 0.45)' : 'rgba(99, 102, 241, 0.45)'; // Cyan or Indigo
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off screen boundaries
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse magnetic pull effect
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouse.radius * mouse.radius;

        if (distSq < radiusSq) {
          const distance = Math.sqrt(distSq);
          const force = (mouse.radius - distance) / mouse.radius;
          // Gently attract to cursor position
          this.x -= (dx / distance) * force * 0.65;
          this.y -= (dy / distance) * force * 0.65;
        }
      }
    }
  }

  function adjustParticlesCount() {
    while (particles.length < particleCount) {
      particles.push(new ConstellationParticle());
    }
    if (particles.length > particleCount) {
      particles.splice(particleCount);
    }
  }

  // Populate constellation particles
  adjustParticlesCount();

  function animateConstellation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        const limitSq = connectionDistance * connectionDistance;

        if (distSq < limitSq) {
          const dist = Math.sqrt(distSq); // Only calculate square root when within range
          const opacity = (1 - (dist / connectionDistance)) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Draw cursor vector lines
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const mouseRadiusSq = mouse.radius * mouse.radius;

        if (distSq < mouseRadiusSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - (dist / mouse.radius)) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 223, 216, ${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateConstellation);
  }

  // Run the loop
  animateConstellation();
}


