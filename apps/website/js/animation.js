/* Zentrio AI - GSAP and Canvas Animations */

document.addEventListener('DOMContentLoaded', () => {
  initGSAPHeroEntrance();
  initMouseParallax();
  initAnimatedCounters();
});

// 1. Particle Canvas System
function initHeroParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Set canvas size
  function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
  const connectionDistance = 120;
  
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.baseColor = 'rgba(139, 92, 246, 0.4)'; // Light purple
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor;
      ctx.fill();
    }

    update() {
      // Bounds check
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Gently push away
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }

      this.x += this.vx;
      this.y += this.vy;
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lines
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const opacity = (1 - (dist / connectionDistance)) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// 2. GSAP Entrance Timeline
function initGSAPHeroEntrance() {
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    tl.to('.hero-badge', { y: 0, opacity: 1, duration: 1 })
      .to('.hero h1', { y: 0, opacity: 1, duration: 1.2 }, '-=0.7')
      .to('.hero-subtitle', { y: 0, opacity: 1, duration: 1 }, '-=0.9')
      .to('.hero-ctas', { y: 0, opacity: 1, duration: 0.8 }, '-=0.8')
      .to('.hero-visual', { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }, '-=1.1')
      .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.4');
  } else {
    // If GSAP didn't load, use CSS transition class fallback
    const elements = ['.hero-badge', '.hero h1', '.hero-subtitle', '.hero-ctas', '.hero-visual', '.scroll-indicator'];
    elements.forEach((el, index) => {
      const domEl = document.querySelector(el);
      if (domEl) {
        setTimeout(() => {
          if (el === '.hero-visual') {
            domEl.style.transform = 'scale(1)';
          } else {
            domEl.style.transform = 'translateY(0)';
          }
          domEl.style.opacity = '1';
          domEl.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }, index * 150);
      }
    });
  }
}

// 3. Mouse Parallax Effect on grid background
function initMouseParallax() {
  const gridOverlay = document.querySelector('.grid-overlay');
  const shapes = document.querySelectorAll('.shape');
  
  if (!gridOverlay && shapes.length === 0) return;
  if (typeof gsap === 'undefined') return;

  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) - 0.5;
    const mouseY = (e.clientY / window.innerHeight) - 0.5;

    if (gridOverlay) {
      // Perspective tilting
      gsap.to(gridOverlay, {
        rotationY: mouseX * 8,
        rotationX: 60 - (mouseY * 8),
        x: mouseX * 30,
        y: mouseY * 30,
        duration: 1,
        ease: 'power2.out'
      });
    }

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 20;
      gsap.to(shape, {
        x: mouseX * speed,
        y: mouseY * speed,
        duration: 1.5,
        ease: 'power2.out'
      });
    });
  });
}

// 4. Custom IntersectionObserver Scroll Reveal (AOS Alternative)
// Note: initScrollReveals has been moved to js/app.js to run globally across all pages.

// 5. Statistics Counter Animation
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-number');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endValue = parseInt(target.getAttribute('data-target'), 10);
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        let startTime = null;

        function updateCounter(currentTime) {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          // Ease-out calculation
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = Math.floor(easeProgress * endValue);
          
          target.textContent = `${prefix}${currentValue}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            target.textContent = `${prefix}${endValue}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => observer.observe(el));
}
