/* Zentrio AI - Project Cards and Modals Dynamics */

const PROJECTS_DATA = {
  1: {
    title: "Web Application Solutions",
    category: "Web Application",
    desc: "Custom web applications, enterprise portals, SaaS platforms, dashboards and management systems.",
    longDesc: "A complete suite of web application development solutions designed for scale and responsiveness. We build customized dashboards, administrative interfaces, SaaS platforms, and customer management hubs using cutting-edge design languages and secure server integrations.",
    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Next.js", "Node.js", "Express.js", "MongoDB", "Firebase", "Vercel"],
    features: [
      "Responsive Dark Glassmorphism Dashboards",
      "Secure Cookie-based JWT Authorization Protocols",
      "Optimized NoSQL Schema and Mongoose Models",
      "Real-time Bidirectional WebSockets Communication Pipelines"
    ],
    useCases: [
      "Enterprise SaaS Customer Management Hubs",
      "Real-time Inventory Tracking & Billing Dashboards",
      "High-density Financial Overview & Analytical Portals"
    ],
    metrics: {
      timeline: "4 Months",
      client: "Synergy Corp",
      impact: "+38% Automation Rate"
    },
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  2: {
    title: "Mobile Application Solutions",
    category: "Mobile Application",
    desc: "Cross-platform and native mobile applications with offline-first capabilities.",
    longDesc: "High-performance native and hybrid mobile applications built for modern mobile operating systems. Configured with secure biometric entries, real-time push notifications, and local offline-first SQLite synchronization engines.",
    technologies: ["Flutter", "React Native", "Expo", "Android Studio", "Kotlin", "Swift", "Firebase", "Supabase"],
    features: [
      "Biometric Fingerprint and FaceID Authorization",
      "Offline-first SQL Database Synchronizations",
      "Custom Push Notification Scheduling Pipelines",
      "Native Rendering Speed Optimizations"
    ],
    useCases: [
      "On-the-go Enterprise Analytics & CRM Mobile Clients",
      "Connected IoT Sensor Tracking & Control Apps",
      "Internal Company Communication & Resource Portals"
    ],
    metrics: {
      timeline: "3.5 Months",
      client: "BioPulse Inc",
      impact: "120K+ Play Store Installs"
    },
    image: "/assets/mobile_app.jpg"
  },
  3: {
    title: "AI Chatbot Solutions",
    category: "Chatbot & AI Assistant",
    desc: "Custom AI assistants, customer support bots and RAG automation systems.",
    longDesc: "Autonomous customer assistance pipelines using Retrieval-Augmented Generation (RAG) paradigms over Large Language Models (LLMs). Securely maps manuals, API pages, and help desks into conversational nodes.",
    technologies: ["OpenAI", "Gemini", "Claude", "Ollama", "LangChain", "RAG", "Pinecone", "FAISS"],
    features: [
      "Context-aware Vector Document Index Ingestion",
      "Fallback Semantic Search Guardrails",
      "Auto-generated Citation and Page References",
      "Chat Dashboard Analytics and Prompt Tuning Toolkits"
    ],
    useCases: [
      "Customer Support Automated Ticket Deflection Nodes",
      "Internal Knowledge Base Ingestion Assistant Tools",
      "E-commerce Multi-language Interactive Product Guides"
    ],
    metrics: {
      timeline: "2 Months",
      client: "Kortex SaaS",
      impact: "74% Auto-Resolution Rate"
    },
    image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80"
  },
  4: {
    title: "Data Analytics Solutions",
    category: "Data Analytics",
    desc: "Business intelligence and advanced analytics dashboards with custom chart setups.",
    longDesc: "Large-scale data pipelines and regression model engines. Extracts logs from ERP databases, clusters values, and exposes real-time charts showing product velocities and supply optimizations.",
    technologies: ["Python", "Pandas", "NumPy", "SQL", "Tableau", "Power BI", "Apache Spark", "Excel"],
    features: [
      "Interactive SVG Data Heatmaps and Trendlines",
      "Apache Spark Cluster Ingestion Rules",
      "Automated Weekly PDF Summary Report Senders",
      "Statistical Outlier and Anomaly Warnings"
    ],
    useCases: [
      "Multi-channel Sales Velocity & Forecasting Dashboards",
      "Supply Chain Delay & Node Bottleneck Identifiers",
      "User Retention & Platform Conversion Rate Monitors"
    ],
    metrics: {
      timeline: "5 Months",
      client: "Apex Retailers",
      impact: "-18% Stockout Rate"
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  5: {
    title: "Branding & Logo Solutions",
    category: "Logo Design",
    desc: "Modern startup branding, logo assets and digital design guidelines.",
    longDesc: "Complete brand creation guidelines for startups. Covers typography grids, logo lockups, digital stationary, vector brand books, and interactive 3D elements in web browsers.",
    technologies: ["Figma", "Canva", "Illustrator", "Photoshop", "CorelDRAW", "Spline"],
    features: [
      "Procedural and Responsive SVG Vector Marks",
      "Figma Component and Color System Blueprints",
      "High-resolution Print-ready Export Files",
      "Interactive 3D Web Branding Guidelines"
    ],
    useCases: [
      "Tech Startup Brand Architecture & Assets Pack",
      "SaaS Product Identity Redesigns & Spacing Systems",
      "Digital Marketing Stationary & Vector Assets Packs"
    ],
    metrics: {
      timeline: "1.5 Months",
      client: "Nebula Corp",
      impact: "100% Original Vector Marks"
    },
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80"
  },
  6: {
    title: "Invitation Design Solutions",
    category: "Invitation Design",
    desc: "Professional digital invitations, creative event cards, and branding.",
    longDesc: "Custom high-end invite generators. Users prompt the system to render custom graphic layouts, typography hierarchies, and background gradients. Includes digital RSVP verification logs.",
    technologies: ["Canva", "Photoshop", "Illustrator", "Adobe Express", "Figma"],
    features: [
      "Automated Custom Gradient Generation Models",
      "Dynamic Spacing and Word Wrapping Layers",
      "Single-click RSVP Link Generators",
      "High-density SVG Export Configurations"
    ],
    useCases: [
      "SaaS Annual Engineering Conference Digital Invites",
      "Premium Corporate Event Interactive Cards",
      "Customer VIP Product Launch RSVP Portals"
    ],
    metrics: {
      timeline: "2 Months",
      client: "Vows & Venues",
      impact: "50K+ RSVPs Handled"
    },
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"
  },
  7: {
    title: "Documentation Solutions",
    category: "Project Report",
    desc: "Professional project reports, engineering reports, and technical documentation templates.",
    longDesc: "Engineered documentation templates converting repository structures, code comments, and database schemas into high-fidelity LaTeX PDFs. Standardizes layout structures and formats mathematical formulas.",
    technologies: ["MS Word", "Google Docs", "LaTeX", "Overleaf", "Canva Docs"],
    features: [
      "Structured LaTeX Macro Definitions",
      "Automated Code Comment Extraction Pipelines",
      "High-contrast Mathematical Formula Formats",
      "Multi-format Export (PDF, Docx, Markdown)"
    ],
    useCases: [
      "ISO 27001 Compliance Spec Documentation",
      "API Integration Development Manuals",
      "Venture Capital Funding Pitch Technical Reports"
    ],
    metrics: {
      timeline: "2.5 Months",
      client: "Zentrio Internal",
      impact: "Saved 40+ Hours/Report"
    },
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"
  },
  8: {
    title: "UI/UX Solutions",
    category: "UI & UX Design",
    desc: "Modern user experiences, wireframes, high-fidelity prototypes and layouts.",
    longDesc: "User interface prototyping systems. Establishes design guidelines, charts visual components, maps spacing guidelines, and exports high-fidelity interactive wireframes for development handover.",
    technologies: ["Figma", "Adobe XD", "Framer", "Miro", "FigJam", "Spline"],
    features: [
      "Sleek Glassmorphism Spacing Guidelines",
      "Responsive Flex Grid Prototypes",
      "High-fidelity Interaction State Diagrams",
      "Keyboard Navigation Flow Audits"
    ],
    useCases: [
      "Enterprise Finance Analytics Wireframe Handover",
      "E-commerce Multi-step Purchase Funnel Optimization",
      "SaaS Admin Layout Spacing Design System"
    ],
    metrics: {
      timeline: "3 Months",
      client: "Aurelius Labs",
      impact: "94% System Usability Score"
    },
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80"
  },
  9: {
    title: "Machine Learning Solutions",
    category: "Machine Learning",
    desc: "AI prediction systems, classification engines and intelligent automation.",
    longDesc: "Edge-based machine learning classifiers. Specializes in custom object recognition nodes (YOLO) for logistics sorting, predictive regression pipelines, and automated text summary generations.",
    technologies: ["Python", "TensorFlow", "PyTorch", "OpenCV", "YOLO", "Keras", "Scikit-Learn", "HuggingFace"],
    features: [
      "Low-latency Frame Ingestion Pipelines",
      "Fine-tuned YOLO Image Recognition Weights",
      "Secure API Wrapper Endpoint Integration",
      "Automated Model Accuracy Log Monitors"
    ],
    useCases: [
      "Logistic Conveyer Real-time Sorting Vision Engines",
      "Medical Biometric Anomaly Detection Pipelines",
      "Automated Document Data Parsing & Classification"
    ],
    metrics: {
      timeline: "6 Months",
      client: "Logix Logistics",
      impact: "99.8% Vision Accuracy"
    },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initProjectModals();
  initTiltCards();
});

function initProjectModals() {
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const overlay = modal?.querySelector('.modal-overlay');
  const closeBtn = modal?.querySelector('.modal-close-btn');

  if (!cards.length || !modal || !overlay || !closeBtn) return;

  // Open Modal on Card Click
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project-id');
      const data = PROJECTS_DATA[projectId];

      if (!data) return;

      // Populate Modal Fields
      modal.querySelector('.modal-image').setAttribute('src', data.image);
      modal.querySelector('.modal-image').setAttribute('alt', data.title);
      modal.querySelector('.project-category').textContent = data.category;
      modal.querySelector('h2').textContent = data.title;
      modal.querySelector('#modalDesc').textContent = data.longDesc;

      // Features list
      const featuresList = modal.querySelector('#modalFeatures');
      featuresList.innerHTML = '';
      data.features.forEach(feat => {
        const li = document.createElement('li');
        li.style.marginBottom = '6px';
        li.textContent = feat;
        featuresList.appendChild(li);
      });

      // Use cases list
      const useCasesList = modal.querySelector('#modalUseCases');
      useCasesList.innerHTML = '';
      data.useCases.forEach(uc => {
        const li = document.createElement('li');
        li.style.marginBottom = '6px';
        li.textContent = uc;
        useCasesList.appendChild(li);
      });

      // Metrics
      modal.querySelector('#modalTimeline').textContent = data.metrics.timeline;
      modal.querySelector('#modalClient').textContent = data.metrics.client;
      modal.querySelector('#modalImpact').textContent = data.metrics.impact;

      // Tech Stack list
      const techList = modal.querySelector('.modal-tech-list');
      techList.innerHTML = '';
      data.technologies.forEach(tech => {
        const span = document.createElement('span');
        span.className = 'modal-tech-badge';
        span.textContent = tech;
        techList.appendChild(span);
      });

      // Show Modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    });
  });

  // Close triggers
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Esc Key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Hover Tilt Effect for Project Cards
function initTiltCards() {
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top;  //y position within the element.
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation based on cursor proximity to corners (max 8 degrees tilt)
      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      
      // Dynamic cursor positioning for background radial highlights
      const glow = card.querySelector('.project-card-glow');
      if (glow) {
        glow.style.opacity = '1';
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(139, 92, 246, 0.18), transparent 50%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      
      const glow = card.querySelector('.project-card-glow');
      if (glow) {
        glow.style.opacity = '0';
      }
    });
  });
}
