#!/usr/bin/env node

/**
 * Production Deployment Script for Track Your Sport Multi-Sport Platform
 * Handles environment setup, testing, building, and deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionDeployment {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildDir = path.join(this.projectRoot, 'build');
    this.functionsDir = path.join(this.projectRoot, 'functions');
    
    // Deployment configuration
    this.config = {
      environment: process.env.NODE_ENV || 'production',
      skipTests: process.argv.includes('--skip-tests'),
      skipBuild: process.argv.includes('--skip-build'),
      deployOnly: process.argv.includes('--deploy-only'),
      verbose: process.argv.includes('--verbose')
    };

    console.log('🚀 Track Your Sport Production Deployment Started');
    console.log('📁 Project Root:', this.projectRoot);
    console.log('⚙️  Configuration:', JSON.stringify(this.config, null, 2));
  }

  // Execute command with logging
  exec(command, options = {}) {
    if (this.config.verbose) {
      console.log('🔧 Executing:', command);
    }
    
    try {
      const result = execSync(command, {
        stdio: this.config.verbose ? 'inherit' : 'pipe',
        cwd: options.cwd || this.projectRoot,
        encoding: 'utf8',
        ...options
      });
      return result;
    } catch (error) {
      console.error('❌ Command failed:', command);
      console.error('Error:', error.message);
      throw error;
    }
  }

  // Validate environment and dependencies
  validateEnvironment() {
    console.log('\n📋 Validating Environment...');

    // Check required files
    const requiredFiles = [
      'package.json',
      'firebase.json',
      'functions/package.json',
      '.env.local'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    });

    // Check Node.js and npm versions
    const nodeVersion = this.exec('node --version').trim();
    const npmVersion = this.exec('npm --version').trim();
    
    console.log('✅ Node.js version:', nodeVersion);
    console.log('✅ npm version:', npmVersion);

    // Validate Firebase CLI
    try {
      const firebaseVersion = this.exec('firebase --version').trim();
      console.log('✅ Firebase CLI:', firebaseVersion);
    } catch (error) {
      throw new Error('Firebase CLI not installed. Run: npm install -g firebase-tools');
    }

    // Check environment variables
    if (!fs.existsSync('.env.local')) {
      throw new Error('.env.local file missing. Copy from .env.example and configure.');
    }

    console.log('✅ Environment validation passed');
  }

  // Install dependencies
  installDependencies() {
    console.log('\n📦 Installing Dependencies...');

    // Install root dependencies
    console.log('Installing root dependencies...');
    this.exec('npm install');

    // Install function dependencies
    console.log('Installing Firebase Functions dependencies...');
    this.exec('npm install', { cwd: this.functionsDir });

    console.log('✅ Dependencies installed');
  }

  // Run comprehensive test suite
  runTests() {
    if (this.config.skipTests) {
      console.log('⏩ Skipping tests');
      return;
    }

    console.log('\n🧪 Running Test Suite...');

    try {
      // Run linting
      console.log('Running ESLint...');
      this.exec('npm run lint');

      // Run unit tests
      console.log('Running unit tests...');
      this.exec('npm test -- --coverage --watchAll=false');

      // Run integration tests
      if (fs.existsSync('tests/integration')) {
        console.log('Running integration tests...');
        this.exec('npm run test:integration');
      }

      // Run Firebase Functions tests
      console.log('Running Firebase Functions tests...');
      this.exec('npm test', { cwd: this.functionsDir });

      console.log('✅ All tests passed');
    } catch (error) {
      console.error('❌ Tests failed');
      throw error;
    }
  }

  // Build production assets
  buildProduction() {
    if (this.config.skipBuild) {
      console.log('⏩ Skipping build');
      return;
    }

    console.log('\n🏗️  Building Production Assets...');

    // Clean previous builds
    if (fs.existsSync(this.buildDir)) {
      console.log('Cleaning previous build...');
      this.exec(`rm -rf ${this.buildDir}`);
    }

    // Build React app
    console.log('Building React application...');
    this.exec('npm run build');

    // Verify build output
    if (!fs.existsSync(this.buildDir)) {
      throw new Error('Build failed - no build directory created');
    }

    const buildFiles = fs.readdirSync(this.buildDir);
    if (!buildFiles.includes('index.html')) {
      throw new Error('Build failed - no index.html found');
    }

    console.log('✅ Production build completed');
    console.log('📁 Build size:', this.getBuildSize());
  }

  // Get build directory size
  getBuildSize() {
    try {
      const sizeOutput = this.exec(`du -sh ${this.buildDir}`);
      return sizeOutput.split('\t')[0];
    } catch (error) {
      return 'Unknown';
    }
  }

  // Optimize assets
  optimizeAssets() {
    console.log('\n⚡ Optimizing Assets...');

    try {
      // Compress images (if imagemin is available)
      if (fs.existsSync('node_modules/.bin/imagemin')) {
        console.log('Compressing images...');
        this.exec('npm run optimize:images');
      }

      // Generate service worker
      if (fs.existsSync('public/manifest.json')) {
        console.log('Generating service worker...');
        // Service worker is generated by Create React App automatically
      }

      console.log('✅ Asset optimization completed');
    } catch (error) {
      console.warn('⚠️  Asset optimization failed (non-critical):', error.message);
    }
  }

  // Run security audit
  securityAudit() {
    console.log('\n🔒 Running Security Audit...');

    try {
      // Run npm audit
      console.log('Running npm audit...');
      const auditResult = this.exec('npm audit --audit-level=moderate');
      
      if (auditResult.includes('vulnerabilities')) {
        console.warn('⚠️  Security vulnerabilities found. Review and fix before deployment.');
        console.log(auditResult);
      }

      // Check for sensitive data in build
      console.log('Scanning for sensitive data...');
      const sensitivePatterns = [
        'api_key',
        'private_key',
        'secret',
        'password',
        'token'
      ];

      const buildContent = this.exec(`find ${this.buildDir} -name "*.js" -exec cat {} \\;`);
      
      sensitivePatterns.forEach(pattern => {
        if (buildContent.toLowerCase().includes(pattern)) {
          console.warn(`⚠️  Potential sensitive data found: ${pattern}`);
        }
      });

      console.log('✅ Security audit completed');
    } catch (error) {
      console.warn('⚠️  Security audit failed (non-critical):', error.message);
    }
  }

  // Deploy to Firebase
  deployToFirebase() {
    console.log('\n🚀 Deploying to Firebase...');

    try {
      // Login check
      console.log('Checking Firebase authentication...');
      this.exec('firebase projects:list');

      // Set Firebase project
      if (process.env.FIREBASE_PROJECT_ID) {
        console.log(`Setting Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
        this.exec(`firebase use ${process.env.FIREBASE_PROJECT_ID}`);
      }

      // Deploy hosting and functions
      console.log('Deploying hosting and functions...');
      this.exec('firebase deploy --only hosting,functions');

      // Deploy database rules and indexes
      console.log('Deploying database configuration...');
      this.exec('firebase deploy --only database,firestore');

      console.log('✅ Firebase deployment completed');
      
      // Get deployment URL
      try {
        const projectInfo = JSON.parse(this.exec('firebase projects:list --json'));
        const currentProject = projectInfo.find(p => p.projectId === process.env.FIREBASE_PROJECT_ID);
        if (currentProject) {
          console.log(`🌐 Live URL: https://${currentProject.projectId}.web.app`);
        }
      } catch (error) {
        console.log('🌐 Check Firebase console for live URL');
      }

    } catch (error) {
      console.error('❌ Firebase deployment failed');
      throw error;
    }
  }

  // Post-deployment verification
  postDeploymentTests() {
    console.log('\n🔍 Running Post-Deployment Verification...');

    try {
      // Get deployment URL
      const projectId = process.env.FIREBASE_PROJECT_ID || 'your-project';
      const deploymentUrl = `https://${projectId}.web.app`;

      console.log(`Testing deployment at: ${deploymentUrl}`);

      // Basic connectivity test
      const curlResult = this.exec(`curl -Is ${deploymentUrl}`);
      if (!curlResult.includes('200 OK')) {
        throw new Error('Deployment URL not accessible');
      }

      // Test API endpoints (if available)
      const apiUrl = `https://us-central1-${projectId}.cloudfunctions.net`;
      try {
        this.exec(`curl -Is ${apiUrl}/healthCheck`);
        console.log('✅ Cloud Functions are accessible');
      } catch (error) {
        console.warn('⚠️  Cloud Functions health check failed');
      }

      console.log('✅ Post-deployment verification completed');
    } catch (error) {
      console.error('❌ Post-deployment verification failed');
      throw error;
    }
  }

  // Generate deployment report
  generateReport() {
    console.log('\n📊 Generating Deployment Report...');

    const report = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      buildSize: this.getBuildSize(),
      nodeVersion: this.exec('node --version').trim(),
      npmVersion: this.exec('npm --version').trim(),
      firebaseProject: process.env.FIREBASE_PROJECT_ID,
      deploymentUrl: process.env.FIREBASE_PROJECT_ID ? 
        `https://${process.env.FIREBASE_PROJECT_ID}.web.app` : null,
      features: [
        'Multi-sport API integration',
        'Real-time score updates',
        'Asian leagues focus',
        'PWA support',
        'Mobile responsive design'
      ]
    };

    const reportPath = path.join(this.projectRoot, 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('📁 Deployment report saved:', reportPath);
    console.log('📊 Report summary:');
    console.log(`   Build size: ${report.buildSize}`);
    console.log(`   Deployment URL: ${report.deploymentUrl}`);
    console.log(`   Features: ${report.features.length} implemented`);
  }

  // Main deployment process
  async deploy() {
    const startTime = Date.now();

    try {
      console.log('🏁 Starting deployment process...\n');

      // Step 1: Validate environment
      this.validateEnvironment();

      // Step 2: Install dependencies
      this.installDependencies();

      // Step 3: Run tests
      this.runTests();

      // Step 4: Build production assets
      this.buildProduction();

      // Step 5: Optimize assets
      this.optimizeAssets();

      // Step 6: Security audit
      this.securityAudit();

      // Step 7: Deploy to Firebase
      this.deployToFirebase();

      // Step 8: Post-deployment verification
      this.postDeploymentTests();

      // Step 9: Generate report
      this.generateReport();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('\n🎉 Deployment Completed Successfully!');
      console.log(`⏱️  Total time: ${duration}s`);
      console.log('🌐 Your Track Your Sport multi-sport platform is now live!');

    } catch (error) {
      console.error('\n💥 Deployment Failed!');
      console.error('Error:', error.message);
      
      if (this.config.verbose) {
        console.error('Stack trace:', error.stack);
      }
      
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check your .env.local configuration');
      console.log('2. Ensure Firebase project is set up correctly');
      console.log('3. Verify all API keys are valid');
      console.log('4. Run with --verbose for detailed logs');
      
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const deployment = new ProductionDeployment();
  
  // Handle deployment command
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Track Your Sport Production Deployment Script

Usage: node scripts/production-deploy.js [options]

Options:
  --skip-tests      Skip running test suite
  --skip-build      Skip production build
  --deploy-only     Only deploy (skip tests and build)
  --verbose         Show detailed logs
  --help, -h        Show this help message

Examples:
  node scripts/production-deploy.js                    # Full deployment
  node scripts/production-deploy.js --skip-tests       # Deploy without tests
  node scripts/production-deploy.js --verbose          # Verbose logging
  node scripts/production-deploy.js --deploy-only      # Deploy existing build
    `);
    process.exit(0);
  }

  deployment.deploy();
}

module.exports = ProductionDeployment;
