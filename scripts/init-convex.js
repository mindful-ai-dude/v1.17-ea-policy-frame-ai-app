#!/usr/bin/env node

/**
 * This script initializes the Convex database with some sample data.
 * Run it with: node scripts/init-convex.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Initializing Convex database...');

// Check if Convex CLI is installed
try {
  execSync('npx convex --version', { stdio: 'inherit' });
} catch (error) {
  console.error('Convex CLI not found. Please install it with: npm install -g convex');
  process.exit(1);
}

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  fs.writeFileSync(
    envPath,
    `# Deployment used by \`npx convex dev\`
CONVEX_DEPLOYMENT=dev:your-deployment-id
VITE_CONVEX_URL=https://your-deployment-id.convex.cloud
`
  );
}

// Initialize Convex
console.log('Starting Convex development server...');
try {
  execSync('npx convex dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Convex development server:', error);
  process.exit(1);
}

console.log('Convex database initialized successfully!');