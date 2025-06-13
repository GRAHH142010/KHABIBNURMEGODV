#!/usr/bin/env node
/**
 * Build Optimization Script
 * Addresses bundler, CSS, and static asset issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildOptimizer {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.optimizations = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async optimizeBuild() {
    console.log('🚀 Starting build optimization...\n');

    await this.cleanBuildArtifacts();
    await this.optimizePackageJson();
    await this.checkAssetSizes();
    await this.validateBuildOutputs();
    await this.optimizeStaticAssets();
    
    this.printSummary();
  }

  async cleanBuildArtifacts() {
    this.log('Cleaning build artifacts...');
    
    const cleanTargets = [
      'dist/',
      'node_modules/.cache/',
      'client/dist/',
      '.vite/',
      '*.tsbuildinfo'
    ];

    for (const target of cleanTargets) {
      try {
        if (fs.existsSync(target)) {
          await fs.promises.rm(target, { recursive: true, force: true });
          this.optimizations.push(`Cleaned ${target}`);
        }
      } catch (error) {
        this.warnings.push(`Failed to clean ${target}: ${error.message}`);
      }
    }
  }

  async optimizePackageJson() {
    this.log('Optimizing package.json for production...');
    
    const packagePath = path.join(__dirname, 'package-render.json');
    if (!fs.existsSync(packagePath)) {
      this.errors.push('package-render.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verify all build dependencies are present
    const buildDeps = [
      'vite', 'esbuild', 'typescript', 'tsx',
      'tailwindcss', 'autoprefixer', 'postcss',
      '@vitejs/plugin-react'
    ];

    const missing = buildDeps.filter(dep => !packageJson.dependencies[dep]);
    if (missing.length > 0) {
      this.errors.push(`Missing build dependencies: ${missing.join(', ')}`);
    } else {
      this.optimizations.push('All build dependencies verified');
    }

    // Check for production optimizations
    if (!packageJson.scripts.postinstall) {
      packageJson.scripts.postinstall = 'echo "Production build ready"';
      this.optimizations.push('Added postinstall script');
    }

    // Ensure proper engines
    if (!packageJson.engines || !packageJson.engines.node) {
      this.warnings.push('Node.js version not specified in engines');
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async checkAssetSizes() {
    this.log('Checking asset sizes...');
    
    const assetDir = path.join(__dirname, 'attached_assets');
    if (!fs.existsSync(assetDir)) {
      this.warnings.push('attached_assets directory not found');
      return;
    }

    const files = fs.readdirSync(assetDir);
    const largeFiles = [];
    const totalSize = files.reduce((total, file) => {
      const filePath = path.join(assetDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > 10) { // Files larger than 10MB
        largeFiles.push({ file, size: sizeMB.toFixed(2) });
      }
      
      return total + stats.size;
    }, 0);

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    if (largeFiles.length > 0) {
      this.warnings.push(`Large asset files detected: ${largeFiles.map(f => `${f.file} (${f.size}MB)`).join(', ')}`);
    }
    
    if (parseFloat(totalMB) > 100) {
      this.warnings.push(`Total asset size is ${totalMB}MB - consider optimization`);
    } else {
      this.optimizations.push(`Asset size OK: ${totalMB}MB total`);
    }
  }

  async validateBuildOutputs() {
    this.log('Validating build configuration...');
    
    // Check Vite config
    const viteConfigPath = path.join(__dirname, 'vite.config.render.js');
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      
      if (!viteConfig.includes('base: "./"')) {
        this.errors.push('Vite base path not set to relative');
      }
      
      if (!viteConfig.includes('minify: "esbuild"')) {
        this.warnings.push('Vite minification not optimized');
      }
      
      if (viteConfig.includes('sourcemap: true')) {
        this.warnings.push('Source maps enabled in production config');
      }
      
      this.optimizations.push('Vite configuration validated');
    }

    // Check TypeScript config
    const tsConfigPath = path.join(__dirname, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      if (tsConfig.compilerOptions.target !== 'ES2022') {
        this.warnings.push('TypeScript target not optimized for modern browsers');
      }
      
      if (!tsConfig.compilerOptions.skipLibCheck) {
        this.warnings.push('TypeScript lib checking enabled - may slow builds');
      }
      
      this.optimizations.push('TypeScript configuration validated');
    }
  }

  async optimizeStaticAssets() {
    this.log('Optimizing static assets...');
    
    const publicDir = path.join(__dirname, 'client', 'public');
    if (!fs.existsSync(publicDir)) {
      this.warnings.push('Client public directory not found');
      return;
    }

    // Check for common optimization opportunities
    const files = fs.readdirSync(publicDir, { recursive: true });
    const imageFiles = files.filter(file => 
      typeof file === 'string' && /\.(jpg|jpeg|png|svg|webp|gif)$/i.test(file)
    );
    
    if (imageFiles.length > 0) {
      this.optimizations.push(`Found ${imageFiles.length} image assets`);
      
      // Check for large images
      const largeImages = imageFiles.filter(file => {
        const filePath = path.join(publicDir, file);
        const stats = fs.statSync(filePath);
        return stats.size > 500 * 1024; // 500KB
      });
      
      if (largeImages.length > 0) {
        this.warnings.push(`Large images detected: ${largeImages.join(', ')} - consider optimization`);
      }
    }

    // Check for font files
    const fontFiles = files.filter(file => 
      typeof file === 'string' && /\.(woff|woff2|ttf|otf|eot)$/i.test(file)
    );
    
    if (fontFiles.length > 0) {
      this.optimizations.push(`Found ${fontFiles.length} font files`);
    }
  }

  printSummary() {
    console.log('\n📊 Build Optimization Summary:');
    console.log(`✅ Optimizations: ${this.optimizations.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.optimizations.length > 0) {
      console.log('\n✅ Optimizations Applied:');
      this.optimizations.forEach(opt => console.log(`  - ${opt}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('\n🔧 Fix these issues before deployment!');
      process.exit(1);
    }

    console.log('\n🎉 Build optimization completed successfully!');
  }
}

// Run optimization
const optimizer = new BuildOptimizer();
optimizer.optimizeBuild().catch(console.error);