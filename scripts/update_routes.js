const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'server', 'routes');
fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/require\(['"]\.\.\/db['"]\)/g, "require('../database/db')");
    content = content.replace(/require\(['"]\.\.\/security['"]\)/g, "require('../middleware/security')");
    content = content.replace(/require\(['"]\.\.\/emailService['"]\)/g, "require('../services/emailService')");
    if (file === 'users.js') {
      content = content.replace("path.join(__dirname, '..')", "path.resolve(__dirname, '../../database/backups')");
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done updating routes.');
