const http = require('http');

const endpoints = [
  '/',
  '/projects',
  '/contact',
  '/pricing',
  '/feedback',
  '/api/auth/me',
  '/background-video.mp4',
  '/logo.png',
  '/css/global.css',
  '/js/app.js'
];

async function test() {
  for (const path of endpoints) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3000${path}`, (res) => {
        console.log(`[${res.statusCode}] ${path} (${res.headers['content-type']})`);
        resolve();
      }).on('error', (err) => {
        console.error(`❌ ${path} Error: ${err.message}`);
        resolve();
      });
    });
  }
}

test();
