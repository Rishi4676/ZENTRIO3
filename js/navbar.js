/* Zentrio AI - Navbar Navigation Logic */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarMenu();
  highlightActiveLink();
});

function initNavbarMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (!hamburger || !navLinks) return;

  // Toggle mobile navigation
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu on link clicks
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    // Remove active class
    link.classList.remove('active');
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize path names for accurate checking
    const normalizedHref = href === '/' ? '/' : href.replace('.html', '');
    const normalizedPath = currentPath === '/' || currentPath === '/index.html' ? '/' : currentPath.replace('.html', '');
    
    if (normalizedHref === normalizedPath) {
      link.classList.add('active');
    } else if (normalizedPath.startsWith('/projects') && normalizedHref.startsWith('/projects')) {
      link.classList.add('active');
    } else if (normalizedPath.startsWith('/solutions') && normalizedHref.startsWith('/solutions')) {
      link.classList.add('active');
    } else if (normalizedPath.startsWith('/pricing') && normalizedHref.startsWith('/pricing')) {
      link.classList.add('active');
    } else if (normalizedPath.startsWith('/contact') && normalizedHref.startsWith('/contact')) {
      link.classList.add('active');
    }
  });
}
