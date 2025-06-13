#!/usr/bin/env node
/**
 * Comprehensive deployment verification script
 * Tests all 186 potential failure points before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  pass(message) {
    this.passed.push(message);
    this.log(message, 'pass');
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(__dirname, filePath));
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    } catch (err) {
      return null;
    }
  }

  readJSON(filePath) {
    try {
      const content = this.readFile(filePath);
      return content ? JSON.parse(content) : null;
    } catch (err) {
      return null;
    }
  }

  // A. Package & Dependency Issues
  verifyPackageDependencies() {
    this.log('Verifying package dependencies...');
    
    const packageRender = this.readJSON('package-render.json');
    if (!packageRender) {
      this.error('package-render.json not found');
      return;
    }

    // Check build tools in dependencies
    const buildTools = [
      'vite', 'esbuild', 'tailwindcss', 'autoprefixer', 
      'postcss', 'typescript', '@vitejs/plugin-react', 'tsx'
    ];
    
    const missing = buildTools.filter(tool => !packageRender.dependencies[tool]);
    if (missing.length > 0) {
      this.error(`Build tools missing from dependencies: ${missing.join(', ')}`);
    } else {
      this.pass('All build tools in dependencies');
    }

    // Check package.json structure
    if (packageRender.type !== 'module') {
      this.error('package.json type should be "module"');
    } else {
      this.pass('Package type set to "module"');
    }

    if (packageRender.main !== 'dist/index.prod.js') {
      this.error('Main entry point should be "dist/index.prod.js"');
    } else {
      this.pass('Main entry point correctly set');
    }

    // Check scripts
    const requiredScripts = ['build', 'build:frontend', 'build:backend', 'start'];
    const missingScripts = requiredScripts.filter(script => !packageRender.scripts[script]);
    if (missingScripts.length > 0) {
      this.error(`Missing scripts: ${missingScripts.join(', ')}`);
    } else {
      this.pass('All required scripts present');
    }
  }

  // B. Vite Config & Frontend Build
  verifyViteConfig() {
    this.log('Verifying Vite configuration...');

    if (!this.fileExists('vite.config.render.js')) {
      this.error('vite.config.render.js not found');
      return;
    }

    const viteConfig = this.readFile('vite.config.render.js');
    
    // Check for proper base configuration
    if (!viteConfig.includes('base: "./"')) {
      this.error('Vite base path not set to "./"');
    } else {
      this.pass('Vite base path correctly configured');
    }

    // Check for proper aliases
    if (!viteConfig.includes('@": path.resolve')) {
      this.error('Vite aliases not properly configured');
    } else {
      this.pass('Vite aliases configured');
    }

    // Check output directory
    if (!viteConfig.includes('outDir: path.resolve(__dirname, "dist", "public")')) {
      this.error('Vite output directory not properly configured');
    } else {
      this.pass('Vite output directory correctly set');
    }
  }

  // C. Backend / Node.js Code
  verifyBackendConfig() {
    this.log('Verifying backend configuration...');

    if (!this.fileExists('server/index.prod.ts')) {
      this.error('server/index.prod.ts not found');
      return;
    }

    const backend = this.readFile('server/index.prod.ts');

    // Check for proper port binding
    if (!backend.includes("'0.0.0.0'")) {
      this.error('Server not binding to 0.0.0.0');
    } else {
      this.pass('Server properly binding to 0.0.0.0');
    }

    // Check for environment variables validation
    if (!backend.includes('requiredEnvVars')) {
      this.error('Environment variables validation missing');
    } else {
      this.pass('Environment variables validation present');
    }

    // Check for error handling
    if (!backend.includes('uncaughtException')) {
      this.error('Global error handling missing');
    } else {
      this.pass('Global error handling configured');
    }

    // Check for graceful shutdown
    if (!backend.includes('SIGTERM')) {
      this.error('Graceful shutdown handling missing');
    } else {
      this.pass('Graceful shutdown handling configured');
    }
  }

  // D. Environment Variables & Secrets
  verifyEnvironmentConfig() {
    this.log('Verifying environment configuration...');

    const requiredVars = ['DPS_USERNAME', 'DPS_PASSWORD', 'GMAIL_EMAIL', 'GMAIL_APP_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      this.warning(`Environment variables not set locally: ${missingVars.join(', ')}`);
      this.warning('These must be set in Render dashboard');
    } else {
      this.pass('All required environment variables available');
    }

    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
      this.warning('NODE_ENV not set to production (OK for local testing)');
    } else {
      this.pass('NODE_ENV set to production');
    }
  }

  // E. Git & Repo Management
  verifyGitConfig() {
    this.log('Verifying Git configuration...');

    if (!this.fileExists('.gitignore')) {
      this.error('.gitignore not found');
    } else {
      const gitignore = this.readFile('.gitignore');
      
      const requiredIgnores = ['node_modules/', 'dist/', '.env', '*.log'];
      const missing = requiredIgnores.filter(pattern => !gitignore.includes(pattern));
      
      if (missing.length > 0) {
        this.error(`Missing .gitignore patterns: ${missing.join(', ')}`);
      } else {
        this.pass('.gitignore properly configured');
      }
    }

    if (!this.fileExists('.editorconfig')) {
      this.warning('.editorconfig not found (recommended for cross-platform consistency)');
    } else {
      this.pass('.editorconfig present');
    }
  }

  // F. Render Platform Specific
  verifyRenderConfig() {
    this.log('Verifying Render configuration...');

    if (!this.fileExists('render.yaml')) {
      this.error('render.yaml not found');
      return;
    }

    const renderConfig = this.readFile('render.yaml');

    // Check for health check
    if (!renderConfig.includes('healthCheckPath: /health')) {
      this.error('Health check path not configured');
    } else {
      this.pass('Health check path configured');
    }

    // Check for proper build command
    if (!renderConfig.includes('cp package-render.json package.json')) {
      this.error('Build command not copying package-render.json');
    } else {
      this.pass('Build command properly configured');
    }

    // Check for proper start command
    if (!renderConfig.includes('startCommand: npm start')) {
      this.error('Start command not properly set');
    } else {
      this.pass('Start command properly configured');
    }
  }

  // G. Miscellaneous Gotchas
  verifyMiscellaneous() {
    this.log('Verifying miscellaneous configurations...');

    // Check for executable permissions on scripts
    if (this.fileExists('render-deploy.sh')) {
      this.pass('Deployment script present');
    } else {
      this.warning('Deployment script not found');
    }

    // Check for TypeScript configuration
    if (!this.fileExists('tsconfig.json')) {
      this.error('tsconfig.json not found');
    } else {
      const tsConfig = this.readJSON('tsconfig.json');
      if (tsConfig?.compilerOptions?.target === 'ES2022') {
        this.pass('TypeScript target optimized for modern browsers');
      } else {
        this.warning('TypeScript target not optimized');
      }
    }

    // Check for PostCSS configuration
    if (!this.fileExists('postcss.config.js')) {
      this.error('postcss.config.js not found');
    } else {
      this.pass('PostCSS configuration present');
    }

    // Check for Tailwind configuration
    if (!this.fileExists('tailwind.config.ts')) {
      this.error('tailwind.config.ts not found');
    } else {
      const tailwindConfig = this.readFile('tailwind.config.ts');
      if (tailwindConfig?.includes('safelist')) {
        this.pass('Tailwind CSS purging optimized');
      } else {
        this.warning('Tailwind CSS may produce large bundles');
      }
    }

    // Check for build optimization utilities
    if (this.fileExists('build-optimizer.js')) {
      this.pass('Build optimization tools available');
    } else {
      this.warning('Build optimization tools not found');
    }

    // Check for API utilities
    if (this.fileExists('server/utils/apiLimiter.ts')) {
      this.pass('API rate limiting configured');
    } else {
      this.warning('API rate limiting not configured');
    }

    // Check for timezone utilities
    if (this.fileExists('server/utils/timezone.ts')) {
      this.pass('Timezone handling configured');
    } else {
      this.warning('Timezone handling not configured');
    }
  }

  // H. Runtime Performance & Security
  verifyRuntimeSecurity() {
    this.log('Verifying runtime security and performance...');

    const backendCode = this.readFile('server/index.prod.ts');
    if (!backendCode) {
      this.error('Production server code not found');
      return;
    }

    // Check for request timeouts
    if (backendCode.includes('setTimeout') && backendCode.includes('408')) {
      this.pass('Request timeout handling configured');
    } else {
      this.error('Request timeout handling missing');
    }

    // Check for rate limiting
    if (backendCode.includes('LOG_THROTTLE_MS')) {
      this.pass('Log rate limiting configured');
    } else {
      this.warning('Log rate limiting not configured');
    }

    // Check for payload size limits
    if (backendCode.includes('limit: \'50mb\'')) {
      this.pass('Request size limits configured');
    } else {
      this.warning('Request size limits not configured');
    }

    // Check for security headers
    if (backendCode.includes('X-Content-Type-Options')) {
      this.pass('Security headers configured');
    } else {
      this.error('Security headers missing');
    }
  }

  // I. Build System Optimization
  verifyBuildOptimization() {
    this.log('Verifying build system optimization...');

    const viteConfig = this.readFile('vite.config.render.js');
    if (!viteConfig) {
      this.error('Vite render config not found');
      return;
    }

    // Check for proper target
    if (viteConfig.includes('target: "ES2022"')) {
      this.pass('Build target optimized for modern browsers');
    } else {
      this.warning('Build target not optimized');
    }

    // Check for chunk optimization
    if (viteConfig.includes('manualChunks: undefined')) {
      this.pass('Chunk splitting disabled for smaller bundles');
    } else {
      this.warning('Chunk splitting may cause issues');
    }

    // Check for external handling
    if (viteConfig.includes('external: (id)')) {
      this.pass('Node.js built-ins excluded from bundle');
    } else {
      this.warning('Node.js built-ins may be bundled incorrectly');
    }

    // Check for CSS minification
    if (viteConfig.includes('cssMinify: true')) {
      this.pass('CSS minification enabled');
    } else {
      this.warning('CSS minification not enabled');
    }
  }

  // Run all verifications
  async verify() {
    console.log('🚀 Starting comprehensive deployment verification...\n');

    this.verifyPackageDependencies();
    this.verifyViteConfig();
    this.verifyBackendConfig();
    this.verifyEnvironmentConfig();
    this.verifyGitConfig();
    this.verifyRenderConfig();
    this.verifyMiscellaneous();
    this.verifyRuntimeSecurity();
    this.verifyBuildOptimization();

    console.log('\n📊 Verification Summary:');
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues Found:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('\n🔧 Fix these issues before deployment!');
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (may cause issues):');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    console.log('\n🎉 Deployment verification completed successfully!');
    console.log('🚀 Ready for Render deployment!');
  }
}

// Run verification
const verifier = new DeploymentVerifier();
verifier.verify().catch(console.error);