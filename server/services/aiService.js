/**
 * Zentrio AI Multi-Tier Provider Service
 * High-Performance, Multi-Provider Fallback AI Engine
 * Compatible with Groq, Gemini, OpenRouter, NVIDIA & Local KB Fallbacks
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// Clean thinking tags emitted by reasoning models (e.g., qwen, deepseek, gpt-oss)
function cleanResponse(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Universal Multi-Provider AI Completion Engine
 */
async function generateAiCompletion({ messages = [], systemPrompt = '', temperature = 0.2, maxTokens = 1024, timeoutMs = 4000 }) {
  // 1. Try Groq (Ultra-fast, high accuracy)
  const groqKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (groqKey) {
    const groqModels = [
      'groq/compound-mini',
      'openai/gpt-oss-20b',
      'qwen/qwen3.6-27b',
      'openai/gpt-oss-120b',
      'groq/compound'
    ];

    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    for (const model of groqModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens
          })
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            const cleaned = cleanResponse(data.choices[0].message.content);
            if (cleaned) return cleaned;
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Continue to next model on timeout/error
      }
    }
  }

  // 2. Try Google Gemini API (Free tier from Google AI Studio)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || GEMINI_API_KEY;
  if (geminiKey) {
    const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const userPrompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

    for (const model of geminiModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens }
          })
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            const text = data.candidates[0].content.parts.map(p => p.text).join('\n');
            const cleaned = cleanResponse(text);
            if (cleaned) return cleaned;
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
      }
    }
  }

  // 3. Try OpenRouter API (Free models tier)
  const openrouterKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
  if (openrouterKey) {
    const openrouterModels = [
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'deepseek/deepseek-r1:free'
    ];

    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    for (const model of openrouterModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens
          })
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            const cleaned = cleanResponse(data.choices[0].message.content);
            if (cleaned) return cleaned;
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
      }
    }
  }

  // 4. Try NVIDIA NIM API
  const nvKey = process.env.NVIDIA_API_KEY || NVIDIA_API_KEY;
  if (nvKey) {
    const nvModels = ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'];
    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    for (const model of nvModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens
          })
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            const cleaned = cleanResponse(data.choices[0].message.content);
            if (cleaned) return cleaned;
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
      }
    }
  }

  return null;
}

module.exports = {
  generateAiCompletion,
  cleanResponse
};
