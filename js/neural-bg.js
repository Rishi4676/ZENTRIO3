/**
 * Zentrio AI Cinematic Neural Background Animation Component
 * High-Performance, Procedural, GPU-friendly Canvas Renderer
 * UPGRADED: Added Active Synapse Signals, Rotating Gyro Core Rings, and Twinkle Nodes
 */
class ZentrioNeuralBackground {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas with id "${canvasId}" not found. Creating a fallback canvas.`);
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    
    // Core parameters (Exposed settings)
    this.options = {
      opacity: options.opacity !== undefined ? options.opacity : 0.8,
      speed: options.speed !== undefined ? options.speed : 0.45,
      glow: options.glow !== undefined ? options.glow : 15,
      particleCount: options.particleCount !== undefined ? options.particleCount : 65,
      coreRadius: options.coreRadius !== undefined ? options.coreRadius : 130,
      corePulseSpeed: options.corePulseSpeed !== undefined ? options.corePulseSpeed : 0.001,
      maxDistance: options.maxDistance !== undefined ? options.maxDistance : 135,
      interactive: options.interactive !== undefined ? options.interactive : true,
      mobileOptimized: options.mobileOptimized !== undefined ? options.mobileOptimized : true,
      prefersReducedMotion: false
    };

    this.particles = [];
    this.pulses = []; // Flowing active signal pulses
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.time = 0;
    this.isMobile = false;

    // Check system preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.options.prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      this.options.prefersReducedMotion = e.matches;
      this.handleMotionPreference();
    });

    this.init();
  }

  init() {
    this.detectDevice();
    this.resize();
    this.setupEventListeners();
    this.createParticles();
    this.handleMotionPreference();
    this.animate();
  }

  detectDevice() {
    this.isMobile = window.innerWidth < 768;
    if (this.options.mobileOptimized && this.isMobile) {
      this.activeParticleCount = Math.floor(this.options.particleCount * 0.45);
      this.activeMaxDistance = this.options.maxDistance * 0.75;
      this.activeSpeed = this.options.speed * 0.5;
      this.maxPulses = 3; // Minimal signals on mobile to save CPU
    } else {
      this.activeParticleCount = this.options.particleCount;
      this.activeMaxDistance = this.options.maxDistance;
      this.activeSpeed = this.options.speed;
      this.maxPulses = 12; // Premium dense streams on desktop
    }
  }

  handleMotionPreference() {
    if (this.options.prefersReducedMotion) {
      this.canvas.style.opacity = (this.options.opacity * 0.4).toString();
      this.activeSpeed = 0.03; 
    } else {
      this.canvas.style.opacity = this.options.opacity.toString();
    }
  }

  resize() {
    this.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.mouse.x = this.width / 2;
    this.mouse.y = this.height / 2;
    this.mouse.targetX = this.width / 2;
    this.mouse.targetY = this.height / 2;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
    
    if (this.options.interactive) {
      window.addEventListener('mousemove', (e) => {
        // Adjust coordinates relative to the canvas bounding rect
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.targetX = e.clientX - rect.left;
        this.mouse.targetY = e.clientY - rect.top;
      });

      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.targetX = e.touches[0].clientX - rect.left;
          this.mouse.targetY = e.touches[0].clientY - rect.top;
        }
      }, { passive: true });
    }
  }

  handleResize() {
    this.resize();
    this.detectDevice();
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    this.pulses = [];
    
    for (let i = 0; i < this.activeParticleCount; i++) {
      const depth = i % 3; 
      let size, alpha, baseSpeed;

      if (depth === 0) {
        // Far: small stars
        size = Math.random() * 0.8 + 0.5;
        alpha = Math.random() * 0.18 + 0.12;
        baseSpeed = 0.35;
      } else if (depth === 1) {
        // Midground: connection nodes
        size = Math.random() * 1.6 + 1.2;
        alpha = Math.random() * 0.4 + 0.25;
        baseSpeed = 0.75;
      } else {
        // Foreground: blurred bokeh nodes
        size = Math.random() * 4.5 + 3.0;
        alpha = Math.random() * 0.14 + 0.06;
        baseSpeed = 1.15;
      }

      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * baseSpeed * this.activeSpeed,
        vy: (Math.random() - 0.5) * baseSpeed * this.activeSpeed,
        size: size,
        alpha: alpha,
        depth: depth,
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02
      });
    }
  }

  drawCore() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Core Pulse
    const pulseFactor = Math.sin(this.time * this.options.corePulseSpeed) * 0.08 + 1.0;
    const radius = this.options.coreRadius * pulseFactor;

    // 1. Radial Ambient Glow background
    const grad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(0, 223, 216, 0.16)');
    grad.addColorStop(0.35, 'rgba(99, 102, 241, 0.09)');
    grad.addColorStop(0.7, 'rgba(139, 92, 246, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Gyroscopic Rotating Tech Rings (Premium visual upgrade)
    if (!this.isMobile && !this.options.prefersReducedMotion) {
      this.ctx.lineWidth = 1.0;
      
      // Ring 1 (Dashed, Cyan, Clockwise)
      this.ctx.strokeStyle = 'rgba(0, 223, 216, 0.18)';
      this.ctx.setLineDash([8, 25, 2, 25]);
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 0.45, this.time * 0.003, this.time * 0.003 + Math.PI * 2);
      this.ctx.stroke();

      // Ring 2 (Dashed, Indigo, Counter-Clockwise)
      this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
      this.ctx.setLineDash([12, 16, 3, 16]);
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 0.65, -this.time * 0.002, -this.time * 0.002 + Math.PI * 2);
      this.ctx.stroke();

      // Reset line dashes for normal lines
      this.ctx.setLineDash([]);
    }
  }

  animate() {
    this.time++;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw glowing gyroscopic core
    this.drawCore();

    // 2. Interpolate mouse positions
    if (this.options.interactive && !this.isMobile) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    }

    // 3. Connect nodes (Synapse mesh logic)
    const activeSynapses = [];
    this.ctx.lineWidth = 0.85;

    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      if (p1.depth === 0) continue; // Far layers don't connect

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        if (p2.depth === 0) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.activeMaxDistance) {
          const lineAlpha = (1 - (dist / this.activeMaxDistance)) * 0.15;
          
          const lineGrad = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          lineGrad.addColorStop(0, `rgba(0, 223, 216, ${lineAlpha})`);
          lineGrad.addColorStop(1, `rgba(99, 102, 241, ${lineAlpha})`);

          this.ctx.strokeStyle = lineGrad;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();

          // Save valid synapses to potentially send energy pulse packets
          activeSynapses.push({ p1, p2, dist });
        }
      }
    }

    // 4. Update and Draw Flowing Signal Pulses (Premium active flow upgrade)
    if (!this.options.prefersReducedMotion) {
      // Spawn new pulses periodically if current pulse count is below max
      if (this.pulses.length < this.maxPulses && activeSynapses.length > 0 && Math.random() < 0.04) {
        const synapse = activeSynapses[Math.floor(Math.random() * activeSynapses.length)];
        this.pulses.push({
          from: synapse.p1,
          to: synapse.to || synapse.p2,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012, // Linear movement factor
          size: Math.random() * 1.5 + 1.2
        });
      }

      // Render and update active pulses
      for (let k = this.pulses.length - 1; k >= 0; k--) {
        const pulse = this.pulses[k];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1.0) {
          // Remove finished pulses
          this.pulses.splice(k, 1);
          continue;
        }

        // Interpolate current coordinate position along the synapse line
        const pX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const pY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        // Apply visual parallax coordinates to pulse point matching its source nodes
        let pulseParallaxX = 0;
        let pulseParallaxY = 0;
        if (this.options.interactive && !this.isMobile) {
          const factor = (pulse.from.depth + 1) * 12;
          pulseParallaxX = ((this.mouse.x - (this.width / 2)) / factor);
          pulseParallaxY = ((this.mouse.y - (this.height / 2)) / factor);
        }

        // Draw flowing photon glow dot
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(pX + pulseParallaxX, pY + pulseParallaxY, pulse.size, 0, Math.PI * 2);
        
        // Add subtle drop shadow glow on desktop for high fidelity
        if (!this.isMobile && this.options.glow > 0) {
          this.ctx.shadowColor = '#00dfd8';
          this.ctx.shadowBlur = 8;
        }
        
        this.ctx.fill();
        
        // Reset shadow config immediately to avoid drawing lag
        this.ctx.shadowBlur = 0;
      }
    }

    // 5. Update and Draw Twinkling Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move particle
      p.x += p.vx;
      p.y += p.vy;

      // Mouse Parallax factor
      let parallaxX = 0;
      let parallaxY = 0;
      if (this.options.interactive && !this.isMobile) {
        const factor = (p.depth + 1) * 12;
        parallaxX = ((this.mouse.x - (this.width / 2)) / factor);
        parallaxY = ((this.mouse.y - (this.height / 2)) / factor);
      }

      // Wrap boundaries
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;

      // Organic twinkling scale math (Twinkle upgrade)
      let twinkleAlpha = p.alpha;
      if (!this.options.prefersReducedMotion) {
        const osc = Math.sin(this.time * p.pulseSpeed + p.angle);
        twinkleAlpha = p.alpha * (osc * 0.25 + 0.75); //Twinkles size scaling
      }

      const drawX = p.x + parallaxX;
      const drawY = p.y + parallaxY;

      this.ctx.beginPath();

      if (p.depth === 2 && this.options.glow > 0 && !this.isMobile) {
        // Blur bokeh glow circles
        const bokeh = this.ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.size * 1.8);
        bokeh.addColorStop(0, `rgba(0, 223, 216, ${twinkleAlpha})`);
        bokeh.addColorStop(0.5, `rgba(139, 92, 246, ${twinkleAlpha * 0.25})`);
        bokeh.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = bokeh;
        this.ctx.arc(drawX, drawY, p.size * 2.2, 0, Math.PI * 2);
      } else {
        // Normal nodes
        this.ctx.fillStyle = p.depth === 1 
          ? `rgba(0, 223, 216, ${twinkleAlpha})` // Cyan connecting nodes
          : `rgba(99, 102, 241, ${twinkleAlpha})`; // Indigo far background stars
        this.ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
      }

      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  updateOptions(newOptions = {}) {
    if (newOptions.opacity !== undefined) {
      this.options.opacity = newOptions.opacity;
      this.handleMotionPreference();
    }
    if (newOptions.speed !== undefined) {
      this.options.speed = newOptions.speed;
      this.detectDevice();
    }
    if (newOptions.glow !== undefined) {
      this.options.glow = newOptions.glow;
    }
    if (newOptions.particleCount !== undefined) {
      this.options.particleCount = newOptions.particleCount;
      this.detectDevice();
      this.createParticles();
    }
  }

  exportLoop(durationSeconds = 20, callback) {
    const stream = this.canvas.captureStream(30);
    const options = { 
      mimeType: 'video/webm;codecs=vp9', 
      videoBitsPerSecond: 6000000 
    };
    
    let recorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      recorder = new MediaRecorder(stream, { videoBitsPerSecond: 4000000 });
    }
    
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zentrio-neural-bg.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (callback) callback(url);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), durationSeconds * 1000);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.handleResize());
  }
}
