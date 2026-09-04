import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, '../../');
  const env = loadEnv(mode, rootDir, 'VITE_');
  console.log('--- LOADED ADMIN ENV ---', {
    API_KEY: env.VITE_FIREBASE_API_KEY ? 'FOUND' : 'MISSING',
    PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID
  });

  return {
    plugins: [react(), tailwindcss()],
    base: '/admin/',
    envDir: rootDir,
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || 'AIzaSyAjHTZfaJKrXwu7iGiVlYbs9HJyFeL3tpA'),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || 'zentrio3-d31e7'),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || 'zentrio3-d31e7.firebaseapp.com'),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || 'zentrio3-d31e7.firebasestorage.app'),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || '431176349642-608be1o08q405452ap7qvlnni2e7ap3c.apps.googleusercontent.com')
    },
    server: {
      host: true,
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  }
})
