const fs = require('fs');

let content = fs.readFileSync('Z:/apps/website/js/app.js', 'utf8');

// 1. Remove initTheme(); from DOMContentLoaded
content = content.replace(/\s*initTheme\(\);\s*/, '\n  ');

// 2. Remove initTheme and applyTheme function definitions
const themeFuncsRegex = /\/\/\s*Theme Management \(Dark Theme \/ Light Theme\)\s*function initTheme\(\)[\s\S]*?\}\s*function applyTheme\(theme\)[\s\S]*?\}\s*\}/;
content = content.replace(themeFuncsRegex, '');

// 3. Remove theme toggle container from updateNavbarForLoggedInUser
content = content.replace(/<div class="theme-toggle-container">[\s\S]*?<\/div>\s*<div class="divider"><\/div>/g, '');

// 4. Remove theme mode block from updateNavbarForLoggedInUser mobile
const mobileThemeBlockLoggedIn = /<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">[\s\S]*?<\/div>/g;
content = content.replace(mobileThemeBlockLoggedIn, '');

// 5. Remove re-binds of initTheme()
content = content.replace(/\s*\/\/\s*Re-bind theme button in new HTML\s*initTheme\(\);/g, '');
content = content.replace(/\s*initTheme\(\);/g, '');

fs.writeFileSync('Z:/apps/website/js/app.js', content, 'utf8');
console.log('Done!');
