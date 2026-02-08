import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Import process to ensure TypeScript recognizes Node.js process methods and properties
import process from 'process';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory.
  // We use loadEnv to pick up variables from .env, .env.local, etc.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Map the GEMINI_API_KEY found in environment files to process.env.API_KEY.
      // This ensures that new GoogleGenAI({ apiKey: process.env.API_KEY }) works in the browser.
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.GEMINI_API_KEY || ""),
    },
    envPrefix: ['VITE_', 'GEMINI_'],
  };
});