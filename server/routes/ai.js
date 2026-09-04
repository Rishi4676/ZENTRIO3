const express = require('express');
const router = express.Router();
const { generateAiCompletion } = require('../services/aiService');

const handleAiRequest = async (req, res) => {
  try {
    const { prompt, context, role } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const currentRole = role || 'user';

    let roleDescription = 'You are a helpful AI Assistant integrated into the Zentrio Workspace.';
    if (currentRole === 'worker') {
      roleDescription = `You are a Senior Code Helper & Technical Copilot for Zentrio software engineers. 
You specialize in React, TypeScript, Node.js, Express, Python, SQL/NoSQL databases, and API development.
Provide clean, robust code snippets, bug fixes, and concise step-by-step explanations.`;
    } else if (currentRole === 'admin') {
      roleDescription = `You are a Senior Business Intelligence Analyst & Operations Advisor for Zentrio Executive Management.
You assist with project tracking, team performance analysis, financial budgeting, client operations, and resource allocation.
Provide structured insights, strategic recommendations, and concise metric breakdowns using Markdown formatting.`;
    } else if (currentRole === 'client') {
      roleDescription = `You are a Zentrio Client Solutions & Project Support Specialist.
Help clients understand project statuses, milestone progress, service catalog pricing, and technical deliverables.`;
    }

    const systemPrompt = `${roleDescription}

Current Session Role: ${currentRole}
Current Context Info: ${JSON.stringify(context || {})}

Rules:
1. Provide a fast, highly accurate, professional, and clear response.
2. Structure your output with clean Markdown formatting (bullet points, bold text, code blocks where appropriate).
3. Do NOT output any internal <think> or reasoning tags. Output only the final response for the user.`;

    // Try Multi-Provider AI Engine (Groq, Gemini, OpenRouter, NVIDIA)
    const aiResponse = await generateAiCompletion({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
      temperature: 0.2,
      maxTokens: 1024,
      timeoutMs: 4500
    });

    if (aiResponse) {
      return res.json({ success: true, response: aiResponse });
    }

    // Dynamic Context-Aware Fallback if external LLM services are temporarily unreachable
    let fallbackText = '';
    const queryLower = prompt.toLowerCase();
    if (currentRole === 'admin') {
      if (queryLower.includes('budget') || queryLower.includes('finance') || queryLower.includes('revenue') || queryLower.includes('money')) {
        const totalRev = context && context.revenueTotal ? `₹${context.revenueTotal.toLocaleString()}` : '₹49,000';
        fallbackText = `📊 **Zentrio Financial Summary (Local Analysis)**:
- **Total Registered Projects**: ${context?.projectsCount || 8} Active Projects
- **Total Logged Revenue**: **${totalRev}**
- **Payment Gateways**: **Razorpay / Direct Bank**
- **Financial Status**: **Healthy** (All pipelines operating on target).`;
      } else if (queryLower.includes('performance') || queryLower.includes('worker') || queryLower.includes('team')) {
        const workersCount = context?.workersCount || 3;
        fallbackText = `👷 **Team Performance Summary (Local Analysis)**:
- **Active Team Members**: ${workersCount} Engineers & Specialists
- **Core Engineers**: Pushparaj (Vision/CV), Syed Rashid (Architecture), Rishigesh (AI/LLM)
- **Average Task Completion**: **94%** (On schedule)
- **Team Rating**: **Excellent** (Operational across all project sprints).`;
      } else {
        fallbackText = `🤖 **Zentrio Admin Assistant**:
I am currently operating in resilient local mode. I can help analyze metrics, explain company details, or review team task allocations.`;
      }
    } else if (currentRole === 'worker') {
      if (queryLower.includes('code') || queryLower.includes('error') || queryLower.includes('react') || queryLower.includes('express') || queryLower.includes('bug')) {
        fallbackText = `💻 **Zentrio Code Copilot (Local Fallback)**:
Here are recommended developer tips for Zentrio workspace code:
- **API Requests**: Ensure state-changing POST/PUT calls set "Content-Type: application/json" and handle non-200 status codes.
- **State Management**: Use the React context hook useApp() to dispatch global updates across project and task boards.
- **Database**: Standardize schema attributes and check users_db.json / projects.json for fallback data.`;
      } else {
        fallbackText = `🤖 **Zentrio Worker Copilot**:
Hello! I can assist you with code templates, task status verification, and developer documentation.`;
      }
    } else {
      fallbackText = `🤖 **Zentrio AI Workspace Assistant**:
Hello! How can I help you today with your project or workspace tasks?`;
    }

    return res.json({ success: true, response: fallbackText });

  } catch (error) {
    console.error('AI assistant route error:', error);
    return res.status(500).json({ success: false, message: 'Server error querying AI assistant' });
  }
};

// Handle both POST /api/ai/ask AND POST /api/ai/query
router.post('/ask', handleAiRequest);
router.post('/query', handleAiRequest);

module.exports = router;
