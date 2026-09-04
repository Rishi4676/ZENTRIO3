const fs = require('fs');
const path = require('path');

const pagesDir = 'Z:/apps/website/pages';

const removeThemeBlock = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to remove the theme toggle container and the divider
  const regex = /\s*<div class="theme-toggle-container">[\s\S]*?<\/div>\s*<div class="divider"><\/div>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned ${filePath}`);
  }
};

const files = fs.readdirSync(pagesDir);
for (const file of files) {
  if (file.endsWith('.html')) {
    removeThemeBlock(path.join(pagesDir, file));
  }
}

// Also check index.html just in case (already clean but doesn't hurt)
removeThemeBlock('Z:/apps/website/index.html');
