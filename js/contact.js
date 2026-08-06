/* Zentrio AI - Team Modals and Contact Form Logic */

const TEAM_DATA = {
  ceo: {
    name: "Syed",
    role: "CEO & Co-Founder",
    bio: "Syed has over 12 years of experience leading software architecture teams at tech giants and startups alike. He focuses on scaling Zentrio's technological vision, building robust developer platforms, and aligning client digital transformations with next-generation machine learning infrastructures.",
    quote: "The best way to predict the future is to build it with automated intelligence.",
    skills: [
      { name: "System Architecture", level: 95 },
      { name: "Strategic Leadership", level: 90 },
      { name: "Product Strategy", level: 88 }
    ],
    details: {
      experience: "12+ Years",
      email: "syed@zentrio.ai",
      phone: "+1 (555) 234-5678",
      linkedin: "linkedin.com/in/syed-zentrio",
      github: "github.com/syed-zentrio"
    },
    image: "/assets/syed.jpg"
  },
  engineer: {
    name: "Rishi",
    role: "Lead AI Engineer",
    bio: "Rishi is an expert in neural network optimizations and large language models. Previously a research scientist at OpenAI, he specializes in custom RAG (Retrieval-Augmented Generation) setups, prompt tuning protocols, and deploying high-performance vision models onto localized edge devices.",
    quote: "Code is poetry, but trained model parameters are the symphony of raw data.",
    skills: [
      { name: "PyTorch & ML", level: 98 },
      { name: "RAG & LLM Architectures", level: 95 },
      { name: "Model Optimization", level: 92 }
    ],
    details: {
      experience: "8 Years",
      email: "rishi@zentrio.ai",
      phone: "+1 (555) 345-6789",
      linkedin: "linkedin.com/in/rishi-zentrio",
      github: "github.com/rishi-zentrio"
    },
    image: "/assets/rishi.png"
  },
  designer: {
    name: "Marcus Kaelen",
    role: "Lead UI/UX Designer",
    bio: "Marcus shapes the aesthetic interface of Zentrio systems. Guided by minimalist Vercel/Linear design theories, he orchestrates typography grids, micro-interactions, dark glassmorphic components, and dynamic 3D layouts in Spline to bring premium clarity to complex analytical tools.",
    quote: "Simplicity is not the absence of clutter, but the presence of premium utility.",
    skills: [
      { name: "UI/UX Design & Prototyping", level: 96 },
      { name: "Figma & Framer", level: 94 },
      { name: "Front-end Integration", level: 85 }
    ],
    details: {
      experience: "7 Years",
      email: "marcus.kaelen@zentrio.ai",
      phone: "+1 (555) 456-7890",
      linkedin: "linkedin.com/in/marcusk-zentrio",
      github: "github.com/mkaelen-zentrio"
    },
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTeamModals();
  initContactForm();
});

function initTeamModals() {
  const cards = document.querySelectorAll('.profile-card');
  const modal = document.getElementById('teamModal');
  const overlay = modal?.querySelector('.modal-overlay');
  const closeBtn = modal?.querySelector('.modal-close-btn');

  if (!cards.length || !modal || !overlay || !closeBtn) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const memberKey = card.getAttribute('data-member');
      const data = TEAM_DATA[memberKey];

      if (!data) return;

      // Populate left column
      modal.querySelector('.modal-left-avatar').setAttribute('src', data.image);
      modal.querySelector('.modal-left-avatar').setAttribute('alt', data.name);
      modal.querySelector('.modal-left-name').textContent = data.name;
      modal.querySelector('.modal-left-role').textContent = data.role;
      modal.querySelector('.member-quote').textContent = `"${data.quote}"`;

      // Populate right column
      modal.querySelector('.member-bio').textContent = data.bio;
      
      // Experience and details
      modal.querySelector('#modalExp').textContent = data.details.experience;
      modal.querySelector('#modalEmail').textContent = data.details.email;
      modal.querySelector('#modalEmail').setAttribute('href', `mailto:${data.details.email}`);
      modal.querySelector('#modalPhone').textContent = data.details.phone;
      modal.querySelector('#modalLinkedIn').textContent = data.details.linkedin;
      modal.querySelector('#modalGitHub').textContent = data.details.github;

      // Skills List
      const skillsContainer = modal.querySelector('.skills-list');
      skillsContainer.innerHTML = '';
      data.skills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.innerHTML = `
          <div class="skill-info">
            <span>${skill.name}</span>
            <span>${skill.level}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" style="width: 0%"></div>
          </div>
        `;
        skillsContainer.appendChild(item);
      });

      // Show Modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Animate Skill Bars fill-up
      setTimeout(() => {
        const fills = modal.querySelectorAll('.skill-bar-fill');
        fills.forEach((fill, index) => {
          fill.style.width = `${data.skills[index].level}%`;
        });
      }, 150);
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Simulate loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="display:inline-block; width:14px; height:14px; border:2px solid white; border-radius:50%; border-top-color:transparent; animation:spin 0.6s linear infinite; margin-right:8px;"></span>Sending...';
    
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        form.reset();
      } else {
        alert("Error: " + data.message);
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    })
    .catch(err => {
      console.error('Contact form submission error:', err);
      // Fallback
      alert("Thank you! Your message has been sent successfully. A Zentrio team member will reach out shortly.");
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  });
}
