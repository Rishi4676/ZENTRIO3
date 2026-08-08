const express = require('express');
const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

// Knowledge Base Data mapping
const SERVER_KB = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'greetings', 'hola', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    response: "Hello! Welcome to Zentrio AI. I'm your virtual assistant, and I can help you with details about our AI services, pricing plans, team members, and client projects. What can I do for you today?"
  },
  about: {
    patterns: ['who are you', 'what is zentrio', 'tell me about zentrio', 'what do you do', 'who we are', 'about the company', 'founded', 'history', 'progression', 'years'],
    response: "<strong>Zentrio AI</strong> is a premier software engineering and design collective founded in <strong>Q1 2024</strong>. We partner with growth-focused businesses to construct robust, high-performance digital products infused with machine learning models.<br><br>Over our progression, we've completed <strong>15+ projects</strong> for happy clients worldwide with a collective <strong>2+ years of experience</strong> in database scaling, predictive algorithm tuning, and responsive UI design."
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
              "Learn more details on our <a href='/projects' class='chat-link'>Selected Engagements Page</a>."
  },
  pricing: {
    patterns: ['price', 'pricing', 'cost', 'how much', 'fees', 'fixed fee', 'plans', 'discount', 'cheap'],
    response: "We offer simple flat-fee catalog pricing for our modules:<br><br>" +
              "• <strong>Web Application</strong>: ₹9,999 (Fixed fee, 33% Off)<br>" +
              "• <strong>Mobile Application</strong>: ₹15,000 (Fixed fee, 25% Off)<br>" +
              "• <strong>AI Chatbot</strong>: ₹18,999 (Fixed fee, 36% Off)<br>" +
              "• <strong>Data Analytics</strong>: ₹12,999 (Fixed fee, 35% Off)<br>" +
              "• <strong>Branding & Logo</strong>: ₹2,000 (Fixed fee, 50% Off)<br>" +
              "• <strong>Invitation Design</strong>: ₹999 (Fixed fee, 66% Off)<br>" +
              "• <strong>Project Report</strong>: ₹1,500 (Fixed fee, 50% Off)<br>" +
              "• <strong>Machine Learning</strong>: ₹20,000 (Fixed fee, 33% Off)<br><br>" +
              "Browse details and options on our <a href='/pricing' class='chat-link'>Catalog & Pricing Page</a>."
  },
  team: {
    patterns: ['team', 'who works here', 'members', 'ethan', 'sophia', 'marcus', 'ceo', 'engineer', 'designer', 'founder', 'founders', 'syed', 'rishi'],
    response: "Our core multidisciplinary team consists of:<br><br>" +
              "• <strong>Syed (Co-Founder)</strong>: 2 years experience in software architecture and developer platforms (syed@zentrio.ai).<br>" +
              "• <strong>Rishi (CEO)</strong>: 2 years experience, AI Engineer, expert in neural networks and optimization (rishi@zentrio.ai).<br>" +
              "• <strong>Pushpa (Co-Founder)</strong>: 2 years experience, expert in Python and computer vision (pushpa@zentrio.ai).<br><br>" +
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

// Chatbot query handler
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const cleanQuery = query.toLowerCase().trim();
    
    // First: Check if the query is a simple greeting
    if (SERVER_KB.greetings.patterns.some(pattern => cleanQuery === pattern)) {
      return res.status(200).json({ success: true, response: SERVER_KB.greetings.response });
    }

    // Second: If Groq API Key is present, query Groq for fast Llama response
    if (process.env.GROQ_API_KEY) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: `You are the official AI Assistant for Zentrio AI, a premier software engineering and design collective founded in Q1 2024.
Zentrio AI constructs robust, high-performance digital products infused with machine learning models.
Here are the core details of Zentrio AI:
- Founded: Q1 2024.
- Progression Timeline:
  * Q1 2024: Founded (3 developers, AI consulting & model tuning).
  * Q3 2025: V2 Architecture Release (scaled to over 80 clients, deployed custom LLM integration nodes globally).
  * Active (2026): Enterprise CRM & Vector Solutions (pioneering real-time streaming interfaces, RAG architectures, custom YOLO vision classifiers).
- Experience / Stats: 7+ collective years experience, 140+ projects completed, 99% happy clients.
- Services & Pricing Catalog:
  * Web Application (React/Next.js/Node.js, secure JWT user DB, APIs): ₹9,999 (Fixed fee, 33% Off from ₹14,999).
  * Mobile Application (iOS/Android Flutter/React Native, SQLite sync, push notifications): ₹24,999 (Fixed fee, 28% Off from ₹34,999).
  * AI Chatbot (Custom assistants, Gemini/Claude routing, RAG search engines): ₹18,999 (Fixed fee, 36% Off from ₹29,999).
  * Data Analytics (BI charts, data pipelines Spark/Python): ₹12,999 (Fixed fee, 35% Off from ₹19,999).
  * Branding & Logo (Vector logos, Figma design components library, brand book): ₹3,999 (Fixed fee, 50% Off from ₹7,999).
  * Invitation Design (RSVP database, layouts, PDF exports): ₹999 (Fixed fee, 66% Off from ₹2,999).
  * Project Report (LaTeX specifications template, comments parser, PDF/MD): ₹2,999 (Fixed fee, 57% Off from ₹6,999).
- Core Team:
  * Syed: CEO & Co-Founder. 12+ years experience. Email: syed@zentrio.ai.
  * Rishi: Lead AI Engineer. 8 years experience, former OpenAI research scientist, LLM/RAG specialist. Email: rishi@zentrio.ai.
  * Marcus Kaelen: Lead UI/UX Designer. 7 years experience, expert in glassmorphic layouts and micro-interactions. Email: marcus.kaelen@zentrio.ai.
- Contact: Email zentriotechnology3@gmail.com, Phone +1 (555) 234-5678, or visit /contact.

Rules:
1. If the user asks about Zentrio AI, answer accurately using the facts above.
2. If the user asks general questions (e.g. coding, general knowledge, math), answer them completely and intelligently using Groq model capabilities.
3. Keep responses highly engaging, concise, and structured.
4. Format URLs/Links using HTML anchors with target="_self" or normal links, like: '<a href="/pricing" class="chat-link">Catalog & Pricing Page</a>' so they render beautifully in the UI.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.2,
            max_tokens: 1024
          })
        });

        clearTimeout(timeoutId);

        const data = await groqResponse.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return res.status(200).json({ success: true, response: data.choices[0].message.content });
        }
      } catch (apiErr) {
        clearTimeout(timeoutId);
        console.error('Groq API failed or timed out, trying NVIDIA fallback:', apiErr.message);
      }
    }

    // Third: If NVIDIA key is present, try LLM API with 3.5s timeout
    if (process.env.NVIDIA_API_KEY) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const nvResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              {
                role: 'system',
                content: `You are the official AI Assistant for Zentrio AI, a premier software engineering and design collective founded in Q1 2024.
Zentrio AI constructs robust, high-performance digital products infused with machine learning models.
Here are the core details of Zentrio AI:
- Founded: Q1 2024.
- Progression Timeline:
  * Q1 2024: Founded (3 developers, AI consulting & model tuning).
  * Q3 2025: V2 Architecture Release (scaled to over 80 clients, deployed custom LLM integration nodes globally).
  * Active (2026): Enterprise CRM & Vector Solutions (pioneering real-time streaming interfaces, RAG architectures, custom YOLO vision classifiers).
- Experience / Stats: 7+ collective years experience, 140+ projects completed, 99% happy clients.
- Services & Pricing Catalog:
  * Web Application (React/Next.js/Node.js, secure JWT user DB, APIs): ₹9,999 (Fixed fee, 33% Off from ₹14,999).
  * Mobile Application (iOS/Android Flutter/React Native, SQLite sync, push notifications): ₹24,999 (Fixed fee, 28% Off from ₹34,999).
  * AI Chatbot (Custom assistants, Gemini/Claude routing, RAG search engines): ₹18,999 (Fixed fee, 36% Off from ₹29,999).
  * Data Analytics (BI charts, data pipelines Spark/Python): ₹12,999 (Fixed fee, 35% Off from ₹19,999).
  * Branding & Logo (Vector logos, Figma design components library, brand book): ₹3,999 (Fixed fee, 50% Off from ₹7,999).
  * Invitation Design (RSVP database, layouts, PDF exports): ₹999 (Fixed fee, 66% Off from ₹2,999).
  * Project Report (LaTeX specifications template, comments parser, PDF/MD): ₹2,999 (Fixed fee, 57% Off from ₹6,999).
- Core Team:
  * Syed: CEO & Co-Founder. 12+ years experience. Email: syed@zentrio.ai.
  * Rishi: Lead AI Engineer. 8 years experience, former OpenAI research scientist, LLM/RAG specialist. Email: rishi@zentrio.ai.
  * Marcus Kaelen: Lead UI/UX Designer. 7 years experience, expert in glassmorphic layouts and micro-interactions. Email: marcus.kaelen@zentrio.ai.
- Contact: Email zentriotechnology3@gmail.com, Phone +1 (555) 234-5678, or visit /contact.

Rules:
1. If the user asks about Zentrio AI, answer accurately using the facts above.
2. If the user asks general questions (e.g. coding, general knowledge, math), answer them completely and intelligently using Llama-3 capabilities.
3. Keep responses highly engaging, concise, and structured.
4. Format URLs/Links using HTML anchors with target="_self" or normal links, like: '<a href="/pricing" class="chat-link">Catalog & Pricing Page</a>' so they render beautifully in the UI.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.2,
            max_tokens: 1024
          })
        });

        clearTimeout(timeoutId);

        const data = await nvResponse.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return res.status(200).json({ success: true, response: data.choices[0].message.content });
        }
      } catch (apiErr) {
        clearTimeout(timeoutId);
        console.error('NVIDIA NIM API failed or timed out, falling back to local KB:', apiErr.message);
      }
    }

    // Fallback: local keyword matching
    let botResponse = null;
    for (const key in SERVER_KB) {
      const kbItem = SERVER_KB[key];
      if (kbItem.patterns.some(pattern => cleanQuery.includes(pattern))) {
        botResponse = kbItem.response;
        break;
      }
    }

    if (!botResponse) {
      botResponse = "I'm sorry, I didn't quite catch that. Could you please rephrase or ask about our services, pricing, team members, or how to contact us?<br><br>" +
                    "You can also email us directly at <a href='mailto:zentriotechnology3@gmail.com' class='chat-link'>zentriotechnology3@gmail.com</a>.";
    }

    return res.status(200).json({ success: true, response: botResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing chat' });
  }
});

module.exports = router;
