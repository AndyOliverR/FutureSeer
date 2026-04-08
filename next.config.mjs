import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebaseAdminStubDir = path.join(__dirname, 'lib', 'stubs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/firestore',
    'firebase-admin/auth',
  ],
  // Use webpack instead of Turbopack (project has custom webpack config)
  turbopack: {},
  webpack: (config, { dev, isServer, webpack }) => {
    // In CI/sandbox, disable filesystem cache to avoid EPERM on rename
    if (process.env.CI === 'true' || process.env.DISABLE_WEBPACK_CACHE === '1') {
      config.cache = false;
    }
    // Suppress source map warnings for Firebase Admin SDK
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Invalid source map/,
      /Only conformant source maps can be used/,
    ];
    
    // Allow JSON assertions for ESM (astronomia VSOP data)
    config.module.rules.push({
      test: /\.json$/,
      type: "json",
    });
    
    // Handle astronomia imports for browser compatibility
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    
    // Optimize Firebase Admin SDK for server-side (serverExternalPackages in nextConfig already handles this;
    // only append to externals when it is an array to avoid breaking webpack when Next passes a function)
    if (isServer && Array.isArray(config.externals)) {
      config.externals.push('firebase-admin');
    }
    
    // Handle Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        net: false,
        http: false,
        https: false,
        tls: false,
      };

      // lib/firebase.ts is imported from client code; webpack still traces require('firebase-admin/*').
      // Replace with local shims (resolve.alias was unreliable with this graph; server unchanged).
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^firebase-admin\/app$/,
          path.join(firebaseAdminStubDir, 'firebase-admin-app.stub.cjs')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^firebase-admin\/firestore$/,
          path.join(firebaseAdminStubDir, 'firebase-admin-firestore.stub.cjs')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^firebase-admin\/auth$/,
          path.join(firebaseAdminStubDir, 'firebase-admin-auth.stub.cjs')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]lib[\\/]firebase-admin\.ts$/,
          path.join(firebaseAdminStubDir, 'firebase-admin.client.ts')
        )
      );
    }
    
    // Optimize development builds for faster compilation
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    // Optimize production builds for better chunk splitting and preload strategy
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create separate chunks for below-the-fold components
            featureBlocks: {
              name: 'feature-blocks',
              test: /[\\/]components[\\/]feature-blocks/,
              priority: 10,
              reuseExistingChunk: true,
            },
            stickyCTA: {
              name: 'sticky-cta',
              test: /[\\/]components[\\/]sticky-cta/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  experimental: {
    esmExternals: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Optimize on-demand entries to reduce recompilations
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Keep pages in memory longer (60 seconds)
    pagesBufferLength: 5, // Increase buffer to reduce recompilations
  },
  // Firebase Auth: when NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is the production host (e.g. futureseer.app),
  // OAuth and the auth helper must hit /__/auth/* on that host. Vercel serves the app, so proxy to the
  // default Firebase Hosting origin (see plan: Firebase Console authorized domains + GCP redirect URIs).
  async rewrites() {
    // Prefer NEXT_PUBLIC_* (Vercel/client). Fallback to Admin project id at build time so /__/auth/*
    // is never omitted if only server env vars are present. Last resort matches this repo's Firebase project.
    const projectId =
      (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim() ||
      (process.env.FIREBASE_ADMIN_PROJECT_ID || '').trim() ||
      'futureseer-7abcd5';
    return [
      {
        source: '/__/auth/:path*',
        destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
  // I Ching: canonical URL is /tools/iching; redirect /tools/i-ching so both work (no duplicate page)
  async redirects() {
    return [
      { source: '/tools/i-ching', destination: '/tools/iching', permanent: true },
    ];
  },
  // Add security headers to fix Cross-Origin-Opener-Policy warnings
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;