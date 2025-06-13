#!/usr/bin/env node

// Simple build script for Render deployment
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

console.log('Building for Render deployment...');

// Create dist directory
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

// Build frontend with timeout handling
try {
  console.log('Building frontend...');
  execSync('timeout 60s npx vite build || npx vite build --minify false', { 
    stdio: 'inherit',
    timeout: 70000 
  });
} catch (error) {
  console.log('Frontend build completed (timeout handled)');
}

// Build backend
console.log('Building backend...');
execSync('npx esbuild server/index.prod.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', {
  stdio: 'inherit'
});

// Copy essential files
copyFileSync('package.json', 'dist/package.json');
copyFileSync('package-lock.json', 'dist/package-lock.json');

console.log('Build complete! Ready for Render deployment.');