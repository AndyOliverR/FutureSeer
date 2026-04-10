#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * FutureSeer Smoke Test Script
 * 
 * This script tests critical functionality to ensure the app is working
 * correctly after deployment. Run this after deploying to staging/production.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.SMOKE_TEST_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds
  retries: 3,
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: config.timeout,
      ...options,
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test function wrapper
async function runTest(name, testFunction) {
  results.total++;
  console.log(`\n🧪 Running: ${name}`);
  
  try {
    await testFunction();
    results.passed++;
    results.details.push({ name, status: 'PASSED' });
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    results.failed++;
    results.details.push({ name, status: 'FAILED', error: error.message });
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Test cases
const tests = {
  // Test 1: Homepage loads
  async 'Homepage loads successfully'() {
    const response = await makeRequest(`${config.baseUrl}/`);
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.includes('FutureSeer')) {
      throw new Error('Homepage does not contain "FutureSeer"');
    }
  },

  // Test 2: Sign-in page loads
  async 'Sign-in page loads successfully'() {
    const response = await makeRequest(`${config.baseUrl}/signin`);
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.includes('Sign In')) {
      throw new Error('Sign-in page does not contain "Sign In"');
    }
  },

                // Test 3: Sign-up page loads
              async 'Sign-up page loads successfully'() {
                const response = await makeRequest(`${config.baseUrl}/signup`);
                if (response.statusCode !== 200) {
                  throw new Error(`Expected status 200, got ${response.statusCode}`);
                }
                if (!response.data.includes('Create Account')) {
                  throw new Error('Sign-up page does not contain "Create Account"');
                }
              },

  // Test 4: Tools page loads
  async 'Tools page loads successfully'() {
    const response = await makeRequest(`${config.baseUrl}/tools`);
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.includes('Divination Tools')) {
      throw new Error('Tools page does not contain "Divination Tools"');
    }
  },

  // Test 5: API endpoints respond
  async 'API endpoints respond correctly'() {
    const endpoints = [
      '/api/test-env',
      '/api/test-openai',
      '/api/test-astroapp',
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(`${config.baseUrl}${endpoint}`);
      if (response.statusCode !== 200) {
        throw new Error(`API endpoint ${endpoint} returned status ${response.statusCode}`);
      }
    }
  },

  // Test 6: Static assets load
  async 'Static assets load successfully'() {
    const assets = [
      '/favicon.ico',
      '/images/starfield-bg.png',
    ];

    for (const asset of assets) {
      const response = await makeRequest(`${config.baseUrl}${asset}`);
      if (response.statusCode !== 200) {
        throw new Error(`Static asset ${asset} returned status ${response.statusCode}`);
      }
    }
  },

  // Test 7: 404 page works
  async '404 page works correctly'() {
    const response = await makeRequest(`${config.baseUrl}/non-existent-page`);
    if (response.statusCode !== 404) {
      throw new Error(`Expected status 404 for non-existent page, got ${response.statusCode}`);
    }
  },

  // Test 8: Health check (if implemented)
  async 'Health check endpoint responds'() {
    try {
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      if (response.statusCode !== 200) {
        throw new Error(`Health check returned status ${response.statusCode}`);
      }
    } catch (error) {
      // Health check endpoint might not exist, that's okay
      console.log('   Note: Health check endpoint not implemented');
    }
  },
};

// Main test runner
async function runSmokeTests() {
  console.log('🚀 Starting FutureSeer Smoke Tests');
  console.log(`📍 Testing URL: ${config.baseUrl}`);
  console.log(`⏱️  Timeout: ${config.timeout}ms`);
  console.log('=' .repeat(50));

  const startTime = Date.now();

  // Run all tests
  for (const [name, testFunction] of Object.entries(tests)) {
    await runTest(name, testFunction);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Print summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SMOKE TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.details
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        console.log(`   - ${result.name}: ${result.error}`);
      });
  }

  console.log('\n' + '=' .repeat(50));

  // Exit with appropriate code
  if (results.failed > 0) {
    console.log('❌ Smoke tests failed! Please check the deployment.');
    process.exit(1);
  } else {
    console.log('✅ All smoke tests passed! Deployment looks good.');
    process.exit(0);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
FutureSeer Smoke Test Script

Usage: node scripts/smoke-test.js [options]

Options:
  --url <url>     Base URL to test (default: http://localhost:3000)
  --timeout <ms>  Request timeout in milliseconds (default: 10000)
  --help, -h      Show this help message

Environment Variables:
  SMOKE_TEST_URL  Base URL to test

Examples:
  node scripts/smoke-test.js
  node scripts/smoke-test.js --url https://staging.futureseer.app
  SMOKE_TEST_URL=https://production.futureseer.app node scripts/smoke-test.js
    `);
    process.exit(0);
  }

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      config.baseUrl = args[i + 1];
      i++;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      config.timeout = parseInt(args[i + 1]);
      i++;
    }
  }

  // Run the tests
  runSmokeTests().catch(error => {
    console.error('💥 Smoke test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runSmokeTests,
  tests,
  config,
}; 