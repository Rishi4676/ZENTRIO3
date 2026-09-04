const fs = require('fs');

let content = fs.readFileSync('Z:/apps/website/js/app.js', 'utf8');

const correctBlock = `
  container.appendChild(video);
  container.appendChild(overlay);
  document.body.prepend(container);
}

// Dynamic Chatbot Script Loader
function initChatbotScript() {
  const chatbotScript = document.createElement('script');
  chatbotScript.src = '/js/chatbot.js';
  chatbotScript.defer = true;
  document.body.appendChild(chatbotScript);
}

// Authentication Check and Navbar State Management
async function checkAuthStatus() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  // Show Portal Login by default
  updateNavbarForGuestUser();

  try {
    const response = await fetch('/api/auth/me');
`;

const lines = content.split('\n');
let newLines = [];
let insideMangled = false;

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('container.appendChild(video);')) {
    insideMangled = true;
    newLines.push(correctBlock.trim());
  }
  if (insideMangled && lines[i].includes('const response = await fetch(\'/api/auth/me\');')) {
    insideMangled = false;
    continue; // already added in correctBlock
  }
  if (!insideMangled) {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('Z:/apps/website/js/app.js', newLines.join('\n'), 'utf8');
console.log('Fixed app.js');
