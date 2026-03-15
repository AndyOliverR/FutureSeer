/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  // Use webpack instead of Turbopack (project has custom webpack config)
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
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
      };
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