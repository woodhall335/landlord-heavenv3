import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      // Legacy/old URLs that were indexed by search engines
      {
        source: '/tenancy-agreements/standard',
        destination: '/tenancy-agreements/england-wales',
        permanent: true,
      },
      {
        source: '/products/eviction-notice',
        destination: '/products/notice-only',
        permanent: true,
      },
      {
        source: '/products/rent-tracker',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/products/tenancy-agreement',
        destination: '/tenancy-agreements/england-wales',
        permanent: true,
      },
      {
        source: '/tools/section-21-validator',
        destination: '/tools/validators/section-21',
        permanent: true,
      },
      {
        source: '/tenancy-agreements',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/legal-proceedings',
        destination: '/products/complete-pack',
        permanent: true,
      },
      // Consolidate duplicate money claim product pages
      {
        source: '/products/money-claim-pack',
        destination: '/products/money-claim',
        permanent: true,
      },
      // HMO Pro is parked
      {
        source: '/hmo-pro',
        destination: '/',
        permanent: false, // temporary redirect since feature may return
      },

      // ===========================================
      // Regional Product Restrictions (January 2026)
      // Wales/Scotland complete_pack and money_claim are no longer available
      // Redirect to notice_only for these regions
      // ===========================================

      // Wales eviction/money claim wizard redirects
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'complete_pack' },
          { type: 'query', key: 'jurisdiction', value: 'wales' },
        ],
        destination: '/wizard?product=notice_only&jurisdiction=wales',
        permanent: true,
      },
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'money_claim' },
          { type: 'query', key: 'jurisdiction', value: 'wales' },
        ],
        destination: '/wizard?product=notice_only&jurisdiction=wales',
        permanent: true,
      },

      // Scotland eviction/money claim wizard redirects
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'complete_pack' },
          { type: 'query', key: 'jurisdiction', value: 'scotland' },
        ],
        destination: '/wizard?product=notice_only&jurisdiction=scotland',
        permanent: true,
      },
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'money_claim' },
          { type: 'query', key: 'jurisdiction', value: 'scotland' },
        ],
        destination: '/wizard?product=notice_only&jurisdiction=scotland',
        permanent: true,
      },

      // Northern Ireland: redirect all eviction/money claim to tenancy agreement
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'complete_pack' },
          { type: 'query', key: 'jurisdiction', value: 'northern-ireland' },
        ],
        destination: '/wizard?product=tenancy_agreement&jurisdiction=northern-ireland',
        permanent: true,
      },
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'money_claim' },
          { type: 'query', key: 'jurisdiction', value: 'northern-ireland' },
        ],
        destination: '/wizard?product=tenancy_agreement&jurisdiction=northern-ireland',
        permanent: true,
      },
      {
        source: '/wizard',
        has: [
          { type: 'query', key: 'product', value: 'notice_only' },
          { type: 'query', key: 'jurisdiction', value: 'northern-ireland' },
        ],
        destination: '/wizard?product=tenancy_agreement&jurisdiction=northern-ireland',
        permanent: true,
      },
    ];
  },
  devIndicators: false,
  // Allow localhost for development
  allowedDevOrigins: ['localhost:5000', 'localhost:3000'],
  // Exclude PDF libraries from webpack bundling (they have native dependencies)
  // NOTE: @sparticuz/chromium must NOT be in this list - it needs to be bundled for Vercel
  serverExternalPackages: [
    'pdfjs-dist',
    'pdf-parse',
    'canvas',
    'puppeteer-core',
    'puppeteer',
  ],
  experimental: {
    serverActions: {
      // Restrict to production domain and localhost for development
      allowedOrigins: [
        'localhost:5000',
        'localhost:3000',
        'landlordheaven.co.uk',
        'www.landlordheaven.co.uk',
      ],
    },
  },
  webpack: (config) => {
    // Suppress handlebars require.extensions warning (harmless)
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/handlebars\/lib\/index\.js/,
        message: /require\.extensions is not supported/,
      },
    ];

    return config;
  },
};

export default nextConfig;
