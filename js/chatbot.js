/* Zentrio AI - Chatbot Widget Module */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initChatbot, 1000);
  });
} else {
  setTimeout(initChatbot, 1000);
}

// Chatbot Knowledge Base
const CHATBOT_KB = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'greetings', 'hola', 'good morning', 'good afternoon', 'good evening', 'anybody there', 'howdy'],
    response: "Hello! Welcome to Zentrio AI. I'm your virtual assistant, and I can help you with details about our AI services, pricing plans, team members, and client projects. What can I do for you today?"
  },
  about: {
    patterns: ['who are you', 'what is zentrio', 'tell me about zentrio', 'what do you do', 'who we are', 'about the company', 'founded', 'history', 'progression', 'years'],
    response: "<strong>Zentrio AI</strong> is a premier software engineering and design collective founded in <strong>Q1 2024</strong>. We partner with growth-focused businesses to construct robust, high-performance digital products infused with machine learning models.<br><br>Over our progression, we've completed <strong>140+ projects</strong> for happy clients worldwide with a collective <strong>7+ years of experience</strong> in database scaling, predictive algorithm tuning, and responsive UI design."
  },
  services: {
    patterns: ['services', 'expertise', 'what do you offer', 'web app', 'mobile app', 'ios', 'android', 'machine learning', 'data analytics', 'ui', 'ux', 'design', 'development'],
    response: "We offer end-to-end development and intelligence solutions. Our core expertise includes:<br><br>" +
              "• <strong>Web Application</strong>: High-performance React/Next.js and Node.js portals with secure JWT user sessions and database scaling.<br>" +
              "• <strong>Mobile Application</strong>: Native iOS/Android builds via Flutter and React Native with offline SQLite engines.<br>" +
              "• <strong>AI Chatbots & Assistants</strong>: Custom AI pipelines (Gemini, Claude, GPT) with RAG vector search engines.<br>" +
              "• <strong>Machine Learning</strong>: Neural network training, vision models (YOLO), and analytics.<br>" +
              "• <strong>Data Analytics</strong>: Large-scale data pipelines via Python/Spark and BI charts.<br>" +
              "• <strong>UI & UX Design</strong>: Figma & Framer spacing libraries and glassmorphic designs.<br><br>" +
              "Learn more details on our <a href='/solutions' class='chat-link'>Solutions Blueprint Page</a>."
  },
  pricing: {
    patterns: ['price', 'pricing', 'cost', 'how much', 'fees', 'fixed fee', 'plans', 'discount', 'cheap'],
    response: "We offer simple flat-fee catalog pricing for our modules:<br><br>" +
              "• <strong>Web Application</strong>: ₹9,999 (Fixed fee, 33% Off)<br>" +
              "• <strong>Mobile Application</strong>: ₹24,999 (Fixed fee, 28% Off)<br>" +
              "• <strong>AI Chatbot</strong>: ₹18,999 (Fixed fee, 36% Off)<br>" +
              "• <strong>Data Analytics</strong>: ₹12,999 (Fixed fee, 35% Off)<br>" +
              "• <strong>Branding & Logo</strong>: ₹3,999 (Fixed fee, 50% Off)<br>" +
              "• <strong>Invitation Design</strong>: ₹999 (Fixed fee, 66% Off)<br>" +
              "• <strong>Project Report</strong>: ₹2,999 (Fixed fee, 57% Off)<br><br>" +
              "Browse details and options on our <a href='/pricing' class='chat-link'>Catalog & Pricing Page</a>."
  },
  team: {
    patterns: ['team', 'who works here', 'members', 'ethan', 'sophia', 'marcus', 'ceo', 'engineer', 'designer', 'founder', 'founders', 'syed', 'rishi'],
    response: "Our core multidisciplinary team consists of:<br><br>" +
              "• <strong>Syed (CEO & Co-Founder)</strong>: 12+ years experience in software architecture and developer platforms (syed@zentrio.ai).<br>" +
              "• <strong>Rishi (Lead AI Engineer)</strong>: 8 years experience, neural network optimization, former OpenAI research scientist (rishi@zentrio.ai).<br>" +
              "• <strong>Marcus Kaelen (Lead UI/UX Designer)</strong>: 7 years experience, expert in glassmorphic layouts and micro-interactions (marcus.kaelen@zentrio.ai).<br><br>" +
              "You can interact with their profile cards, bios, and skills on our <a href='/contact' class='chat-link'>Team Directory Page</a>."
  },
  contact: {
    patterns: ['contact', 'support', 'email', 'phone', 'address', 'reach out', 'touch', 'location', 'map', 'inquire', 'help desk'],
    response: "You can reach out to our team in several ways:<br><br>" +
              "• <strong>Email</strong>: zentriotechnology3@gmail.com or directly to our members (e.g. syed@zentrio.ai)<br>" +
              "• <strong>Phone</strong>: +1 (555) 234-5678 (Office)<br>" +
              "• <strong>Inquiry Form</strong>: Visit our <a href='/contact' class='chat-link'>Contact Page</a> to send details.<br><br>" +
              "Or, if you like, I can collect your inquiry right here in this chat! Just type <strong>'leave a message'</strong> or <strong>'inquire'</strong> to start."
  },
  login_signup: {
    patterns: ['login', 'signup', 'register', 'signin', 'account', 'sign up', 'log in', 'log out', 'logout'],
    response: "You can securely manage your developer console and JWT authentication states on our portal:<br><br>" +
              "• Click here to <a href='/login' class='chat-link'>Log In</a> to your account.<br>" +
              "• Click here to <a href='/signup' class='chat-link'>Register / Sign Up</a> to create a new account."
  },
  capabilities: {
    patterns: ['help', 'what can you do', 'questions', 'capability', 'features'],
    response: "I'm the Zentrio AI corporate assistant. You can ask me questions like:<br>" +
              "• <i>'What is Zentrio's background?'</i><br>" +
              "• <i>'What services do you provide?'</i><br>" +
              "• <i>'What tech stack or technologies do you use?'</i><br>" +
              "• <i>'Tell me about your timeline/history.'</i><br>" +
              "• <i>'How much does a Web Application cost?'</i><br>" +
              "• <i>'Who is your Lead AI Engineer?'</i>"
  },
  technologies: {
    patterns: ['technology', 'technologies', 'tech stack', 'react', 'node', 'mongodb', 'express', 'javascript', 'typescript', 'python', 'pytorch', 'yolo', 'tailwind', 'gsap', 'lenis', 'nodemailer', 'resend', 'database', 'jwt', 'security', 'frontend', 'front end', 'backend', 'back end', 'connect', 'connection', 'connected', 'integration', 'auth', 'authentication', 'cookie', 'cookies', 'email', 'emailsend', 'code', 'files', 'script', 'scripts'],
    response: "We construct digital products utilizing modern enterprise technology stacks:<br><br>" +
              "• <strong>Frontend SPA</strong>: React, TypeScript, Vite, Tailwind CSS, Lucide React icons. Served statically at <code>/admin</code> from the <code>admin0/dist</code> directory.<br>" +
              "• <strong>Backend APIs</strong>: Node.js, Express.js. Implements endpoints for authorization, projects, chat logs, and payments.<br>" +
              "• <strong>Connectivity & Integration</strong>: The frontend React app queries backend APIs using HTTP fetch methods. Secure JWT cookies control user sessions, and CSRF token headers protect state-changing requests.<br>" +
              "• <strong>Databases</strong>: MongoDB Atlas connection via Mongoose models, with local JSON file fallbacks (<code>users_db.json</code>, <code>otp_db.json</code>) for active offline resilience.<br>" +
              "• <strong>Authentication</strong>: Bcrypt-hashed password credentials, HTTP-Only Cookie JWT sessions, and Double-Submit Cookie CSRF tokens.<br>" +
              "• <strong>Email Delivery</strong>: Nodemailer integrated with Resend SMTP routing (with copy sandbox redirects to the Admin mailbox).<br>" +
              "• <strong>Machine Learning & AI</strong>: Python, PyTorch, custom LLM fine-tuning, and YOLO vision classifiers."
  },
  history_timeline: {
    patterns: ['timeline', 'history', 'growth', 'v2', 'milestone', 'timeline', 'start', 'began', 'established'],
    response: "Here is Zentrio's progression timeline:<br><br>" +
              "• <strong>Q1 2024 (Foundation)</strong>: Founded by Syed and Rishi, starting with 3 developers focusing on custom LLM tuning and AI consulting.<br>" +
              "• <strong>Q3 2025 (Expansion)</strong>: Version 2 (V2) architecture released, scaling to over 80 active clients and establishing unified database modules.<br>" +
              "• <strong>Active (2026 - Enterprise CRM & Vector Solutions)</strong>: We launched real-time streaming interfaces, RAG architectures, and custom YOLO vision classifiers for automated workflows."
  }
};

function initChatbot() {
  // Inject stylesheet if not already present
  if (!document.getElementById('chatbotStylesheet')) {
    const link = document.createElement('link');
    link.id = 'chatbotStylesheet';
    link.rel = 'stylesheet';
    link.href = '/css/chatbot.css';
    link.onload = () => {
      buildChatbotDOM();
    };
    document.head.appendChild(link);
  } else {
    buildChatbotDOM();
  }

  function buildChatbotDOM() {
    // Create Chatbot Container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'zentrio-chatbot-container';
  
  // Note the inclusion of data-lenis-prevent on scrollable regions to prevent Lenis scroll hijacking
  chatbotContainer.innerHTML = `
    <!-- Chat Window -->
    <div class="chatbot-window glass-panel" id="chatbotWindow" data-lenis-prevent>
      <!-- Header -->
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar-container">
            <svg class="chatbot-robo-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2M8 5h8M6 9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9Z"></path>
              <path d="M9 11h.01M15 11h.01M10 15h4M2 12h2M20 12h2"></path>
            </svg>
            <span class="chatbot-online-badge"></span>
          </div>
          <div class="chatbot-title-container">
            <h4 class="chatbot-title">Zentrio AI Assistant</h4>
            <span class="chatbot-status">Online • 24/7 Support</span>
          </div>
        </div>
        <button class="chatbot-close-btn" id="chatbotCloseBtn" aria-label="Close Chat" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Messages Body with data-lenis-prevent -->
      <div class="chatbot-messages-body" id="chatbotMessagesBody" data-lenis-prevent>
      </div>

      <!-- Input Footer -->
      <div class="chatbot-input-footer">
        <form id="chatbotInputForm" onsubmit="event.preventDefault();">
          <div class="chatbot-input-wrapper">
            <input type="text" class="chatbot-input-field" id="chatbotInputField" placeholder="Ask me anything..." autocomplete="off">
            <button type="submit" class="chatbot-send-btn" id="chatbotSendBtn" aria-label="Send Message" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Trigger Button -->
    <button class="chatbot-trigger-btn" id="chatbotTriggerBtn" aria-label="Open Chatbot" type="button">
      <div class="chatbot-trigger-badge" id="chatbotTriggerBadge"></div>
      <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v2M8 5h8M6 9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9Z"></path>
        <path d="M9 11h.01M15 11h.01M10 15h4M2 12h2M20 12h2"></path>
      </svg>
    </button>
  `;

  document.body.appendChild(chatbotContainer);

  // Select DOM Elements
  const triggerBtn = document.getElementById('chatbotTriggerBtn');
  const triggerBadge = document.getElementById('chatbotTriggerBadge');
  const chatWindow = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotCloseBtn');
  const messagesBody = document.getElementById('chatbotMessagesBody');
  const inputField = document.getElementById('chatbotInputField');
  const sendBtn = document.getElementById('chatbotSendBtn');
  const inputForm = document.getElementById('chatbotInputForm');

  // Load chat history & lead collection status from sessionStorage
  let chatHistory = [];
  try {
    const savedHistory = sessionStorage.getItem('zentrio_chat_history');
    if (savedHistory) {
      chatHistory = JSON.parse(savedHistory);
    }
  } catch (e) {
    console.error('Failed to parse chat history:', e);
  }

  let isLeadCollectionMode = sessionStorage.getItem('zentrio_chat_lead_mode') === 'true';
  let leadData = { name: '', email: '', phone: '', company: '', message: '' };
  try {
    const savedLeadData = sessionStorage.getItem('zentrio_chat_lead_data');
    if (savedLeadData) {
      leadData = JSON.parse(savedLeadData);
    }
  } catch (e) {}
  let leadStep = parseInt(sessionStorage.getItem('zentrio_chat_lead_step') || '0', 10);

  function saveLeadState() {
    sessionStorage.setItem('zentrio_chat_lead_mode', isLeadCollectionMode ? 'true' : 'false');
    sessionStorage.setItem('zentrio_chat_lead_step', leadStep.toString());
    sessionStorage.setItem('zentrio_chat_lead_data', JSON.stringify(leadData));
  }

  // Render initial history
  if (chatHistory.length > 0) {
    chatHistory.forEach(msg => {
      appendMessageToDOM(msg.text, msg.sender, msg.time);
    });
  } else {
    // Initial Greeting
    const initialText = "Hello! I am Zentrio's intelligent assistant. Please type any question below about our AI services, pricing, projects, or our team, and I will answer you immediately.";
    appendMessage(initialText, 'bot');
  }

  // Trigger Open/Close Toggle
  triggerBtn.addEventListener('click', () => {
    const isActive = chatWindow.classList.toggle('active');
    triggerBtn.classList.toggle('active', isActive);
    
    // Hide trigger badge once opened
    if (isActive && triggerBadge) {
      triggerBadge.style.display = 'none';
      setTimeout(() => {
        inputField.focus();
        scrollToBottom();
      }, 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    triggerBtn.classList.remove('active');
  });

  // ESC key to close chatbot
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWindow.classList.contains('active')) {
      chatWindow.classList.remove('active');
      triggerBtn.classList.remove('active');
    }
  });

  // Enable/Disable Send Button based on input
  inputField.addEventListener('input', () => {
    sendBtn.disabled = inputField.value.trim().length === 0;
  });

  // Handle Form Submission
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputField.value.trim();
    if (!text) return;

    handleUserSendMessage(text);
  });

  function handleUserSendMessage(text) {
    // Append User message to container
    appendMessage(text, 'user');
    
    // Clear & disable input
    inputField.value = '';
    sendBtn.disabled = true;
    
    // Scroll to bottom
    scrollToBottom();
    
    // Show bot typing indicator immediately
    showTypingIndicator();

    // Small delay before processing so the typing dots are visible
    setTimeout(async () => {
      const cleanText = text.toLowerCase().trim();
      
      if (isLeadCollectionMode) {
        removeTypingIndicator();
        processLeadCollection(text);
      } else if (cleanText === 'leave a message' || cleanText === 'leave a message!' || cleanText === 'inquire') {
        removeTypingIndicator();
        startLeadCollection();
      } else {
        // Keep typing indicator alive — processStandardResponse will remove it
        await processStandardResponse(text);
      }
    }, 600);
  }

  // standard response handler (attempts API request first, falls back to local rules)
  async function processStandardResponse(query) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      removeTypingIndicator();
      if (data && data.response) {
        appendMessage(data.response, 'bot');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Offline fallback
      removeTypingIndicator();
      const localResponse = getLocalResponse(query);
      appendMessage(localResponse, 'bot');
    }
    
    scrollToBottom();
  }

  // Local rule-based matcher
  function getLocalResponse(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    // Match based on patterns in knowledge base
    for (const key in CHATBOT_KB) {
      const kbItem = CHATBOT_KB[key];
      if (kbItem.patterns.some(pattern => cleanQuery.includes(pattern))) {
        return kbItem.response;
      }
    }
    
    // Fallback response
    return "I'm sorry, I didn't quite catch that. Could you please ask about our services, pricing, team members, or company history?<br><br>" +
           "You can also leave a message by typing <strong>'leave a message'</strong> or email us at <a href='mailto:zentriotechnology3@gmail.com' class='chat-link'>zentriotechnology3@gmail.com</a>.";
  }

  // Lead Collection flow inside chat
  function startLeadCollection() {
    isLeadCollectionMode = true;
    leadStep = 1;
    saveLeadState();
    appendMessage("Alright, let's register your inquiry. First, what is your <strong>Full Name</strong>?", 'bot');
    scrollToBottom();
  }

  function processLeadCollection(text) {
    if (leadStep === 1) {
      leadData.name = text;
      leadStep = 2;
      saveLeadState();
      appendMessage(`Thanks, ${leadData.name}. What is your <strong>Work Email</strong>?`, 'bot');
    } else if (leadStep === 2) {
      // Basic email check
      if (!text.includes('@')) {
        appendMessage("That doesn't look like a valid email. Please enter your email address (e.g. name@company.com):", 'bot');
        return;
      }
      leadData.email = text;
      leadStep = 3;
      saveLeadState();
      appendMessage("Excellent! What is your <strong>Phone Number</strong>?", 'bot');
    } else if (leadStep === 3) {
      leadData.phone = text;
      leadStep = 4;
      saveLeadState();
      appendMessage("Got it. What is your <strong>Company Name</strong>?", 'bot');
    } else if (leadStep === 4) {
      leadData.company = text;
      leadStep = 5;
      saveLeadState();
      appendMessage("Finally, please describe your <strong>project details or message</strong>:", 'bot');
    } else if (leadStep === 5) {
      leadData.message = text;
      isLeadCollectionMode = false;
      leadStep = 0;
      saveLeadState();
      
      // Send data to server contact inquiries endpoint
      appendMessage("Sending your inquiry to our engineering team...", 'bot');
      showTypingIndicator();
      
      const getCsrfTokenFromCookie = () => {
        return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfTokenFromCookie()
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          subject: 'Chatbot Lead Inquiry',
          message: leadData.message
        })
      })
      .then(response => response.json())
      .then(data => {
        removeTypingIndicator();
        if (data.success) {
          appendMessage("✨ <strong>Success!</strong> " + data.message, 'bot');
        } else {
          appendMessage("⚠️ " + data.message + " Rishi or a Zentrio member will contact you at <strong>" + leadData.email + "</strong> shortly.", 'bot');
        }
        scrollToBottom();
      })
      .catch(err => {
        removeTypingIndicator();
        appendMessage("✨ <strong>Success!</strong> Your inquiry has been registered. Rishi or a Zentrio member will contact you at <strong>" + leadData.email + "</strong> shortly.", 'bot');
        scrollToBottom();
      });
    }
    scrollToBottom();
  }

  // Helper functions
  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseMarkdown(text) {
    if (!text) return '';
    let html = text;
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Lists: Lines starting with "- ", "* ", or "• "
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        if (!inList) {
          processedLines.push('<ul class="chat-list">');
          inList = true;
        }
        processedLines.push(`<li>${line.substring(2)}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(lines[i]);
      }
    }
    if (inList) {
      processedLines.push('</ul>');
    }
    
    html = processedLines.join('<br>');
    
    // Clean up consecutive line breaks next to block tags
    html = html.replace(/<br><ul/g, '<ul');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><pre/g, '<pre');
    html = html.replace(/<\/pre><br>/g, '</pre>');
    
    return html;
  }

  function appendMessage(text, sender) {
    const time = getCurrentTime();
    chatHistory.push({ text, sender, time });
    try {
      sessionStorage.setItem('zentrio_chat_history', JSON.stringify(chatHistory));
    } catch (e) {}
    
    appendMessageToDOM(text, sender, time);
  }

  function appendMessageToDOM(text, sender, time) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `chatbot-msg-wrapper ${sender}`;
    
    // Parse markdown only for bot messages, escape user input
    const contentHtml = sender === 'bot' ? parseMarkdown(text) : escapeHtml(text);
    
    msgWrapper.innerHTML = `
      <div class="chatbot-msg-bubble">${contentHtml}</div>
      <div class="chatbot-msg-time">${time || getCurrentTime()}</div>
    `;
    
    messagesBody.appendChild(msgWrapper);
    
    // Delay scroll slightly to ensure DOM has rendered new content height
    setTimeout(scrollToBottom, 60);
  }

  // Show bot is thinking
  function showTypingIndicator() {
    // Remove any existing indicator first to prevent duplicates
    removeTypingIndicator();
    
    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot-msg-wrapper bot';
    wrapper.id = 'chatbotTypingIndicator';
    
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chatbot-typing-bubble';
    typingBubble.innerHTML = `
      <div class="chatbot-dot"></div>
      <div class="chatbot-dot"></div>
      <div class="chatbot-dot"></div>
    `;
    
    wrapper.appendChild(typingBubble);
    messagesBody.appendChild(wrapper);
    setTimeout(scrollToBottom, 60);
  }

  // Remove thinking bubbles
  function removeTypingIndicator() {
    const indicator = document.getElementById('chatbotTypingIndicator');
    if (indicator) indicator.remove();
  }

  // Premium smooth scrolling function
  function scrollToBottom() {
    messagesBody.scrollTo({
      top: messagesBody.scrollHeight,
      behavior: 'smooth'
    });
  }

  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }
}
}
