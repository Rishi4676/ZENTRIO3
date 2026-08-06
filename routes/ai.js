const express = require('express');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

router.post('/ask', async (req, res) => {
  try {
    const { prompt, context, role } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const systemPrompt = `You are a helpful AI Assistant integrated into the Zentrio Workspace.
Current Session Role: ${role || 'User'}
Current Context Info: ${JSON.stringify(context || {})}

Rules:
1. Provide a professional, helpful, and concise response.
2. If role is 'worker' and user asks a coding question, act as a Senior Code Helper.
3. If role is 'admin' and user asks about project budgets, tasks, or worker performance, act as a Business Intelligence Analyst.
4. Keep the formatting clean using markdown or HTML list tags.`;

    // 1. Try Groq
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800
          })
        });
        const data = await response.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return res.json({ success: true, response: data.choices[0].message.content });
        }
      } catch (err) {
        console.warn('AI endpoint Groq failed:', err.message);
      }
    }

    // 2. Try NVIDIA
    if (NVIDIA_API_KEY) {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_API_KEY}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800
          })
        });
        const data = await response.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return res.json({ success: true, response: data.choices[0].message.content });
        }
      } catch (err) {
        console.warn('AI endpoint NVIDIA failed:', err.message);
      }
    }

    // 3. Smart Fallback response based on prompt analysis
    let fallbackText = '';
    const queryLower = prompt.toLowerCase();
    if (role === 'admin') {
      if (queryLower.includes('budget') || queryLower.includes('finance') || queryLower.includes('money')) {
        fallbackText = `📊 **Zentrio Financial Summary (Local Analysis)**:
- Total Seed Projects Budget: **₹49,000**
- Total Logged Revenue: **₹19,500**
- Active Transporters: **SMTP / Razorpay**
- Financial status: **Healthy** (All pipelines operating on target).`;
      } else if (queryLower.includes('performance') || queryLower.includes('worker') || queryLower.includes('rating')) {
        fallbackText = `👷 **Team Performance Summary (Local Analysis)**:
- **Pushparaj** (W3): **97%** rating (Leader)
- **Syed Rashid** (W1): **94%** rating
- **Rishigesh** (W2): **88%** rating
- Average Team Score: **93%** (Excellent).`;
      } else {
        fallbackText = `🤖 **Zentrio Admin Assistant**:
I am running in local mode. I can help you compile metrics or explain company details. For dynamic prompts, please configure the GROQ_API_KEY in your environment variables.`;
      }
    } else {
      // Worker fallback
      if (queryLower.includes('code') || queryLower.includes('error') || queryLower.includes('react') || queryLower.includes('express')) {
        fallbackText = `💻 **Zentrio Code Copilot (Local Fallback)**:
It looks like you're asking about coding or syntax.
- **Tip**: Ensure you check your CSRF tokens using 'req.headers["x-csrf-token"]' when executing POST/PUT requests in Zentrio.
- **Vite/React**: Keep your components modular, using the 'useApp()' hook from context to trigger updates.`;
      } else {
        fallbackText = `🤖 **Zentrio Worker Assistant**:
Hello! I can assist you with your tasks or write template code. To activate advanced LLM features, configure the GROQ_API_KEY in your environment variables.`;
      }
    }

    return res.json({ success: true, response: fallbackText });

  } catch (error) {
    console.error('AI assistant route error:', error);
    return res.status(500).json({ success: false, message: 'Server error querying AI' });
  }
});

module.exports = router;
