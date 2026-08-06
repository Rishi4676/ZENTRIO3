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
});

// Dynamic Chatbot Script Loader
function initChatbotScript() {
  const chatbotScript = document.createElement('script');
  chatbotScript.src = '/js/chatbot.js?v=' + Date.now();
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
  }, 2000);
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
