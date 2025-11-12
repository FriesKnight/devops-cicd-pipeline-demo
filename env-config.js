// env-config.js - Environment configuration loader
// This file loads Supabase credentials safely

// For production deployment, you have two options:

// OPTION 1: GitHub Pages / Static Hosting (RECOMMENDED)
// Store secrets in repository secrets and inject during build
// See: https://docs.github.com/en/actions/security-guides/encrypted-secrets

// OPTION 2: Client-side configuration (LESS SECURE but works)
// Use placeholder values and let users configure their own Supabase instance

// Load from build-time environment variables (injected by CI/CD)
const ENV_CONFIG = {
  SUPABASE_URL: 
    typeof VITE_SUPABASE_URL !== 'undefined' 
      ? VITE_SUPABASE_URL 
      : 'https://YOUR_PROJECT.supabase.co', // Fallback to placeholder
  
  SUPABASE_ANON_KEY: 
    typeof VITE_SUPABASE_ANON_KEY !== 'undefined' 
      ? VITE_SUPABASE_ANON_KEY 
      : 'eyJhbGc...', // Fallback to placeholder
};

// Validate configuration
ENV_CONFIG.isConfigured = 
  ENV_CONFIG.SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co' &&
  ENV_CONFIG.SUPABASE_ANON_KEY !== 'eyJhbGc...';

console.log('🔧 Environment:', ENV_CONFIG.isConfigured ? 'Configured' : 'Using placeholders');
