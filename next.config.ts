import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Allow images to be fetched by email clients (Outlook proxy, etc.)
  async headers() {
    return [
      {
        source: '/:path*.png',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
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
      // True duplicate SEO landing URLs -> canonical SEO landing pages
      {
        source: '/eviction-notice',
        destination: '/eviction-notice-template',
        permanent: true,
      },
      {
        source: '/eviction-notice-uk',
        destination: '/eviction-notice-template',
        permanent: true,
      },
      {
        source: '/joint-tenancy-agreement-england',
        destination: '/joint-tenancy-agreement-template',
        permanent: true,
      },

      // Money claim canonicalization
      {
        source: '/mcol-money-claim-online',
        destination: '/money-claim-online-mcol',
        permanent: true,
      },
      {
        source: '/money-claim-rent-arrears',
        destination: '/money-claim-unpaid-rent',
        permanent: true,
      },
      {
        source: '/claim-rent-arrears-tenant',
        destination: '/money-claim-unpaid-rent',
        permanent: true,
      },
      {
        source: '/how-to-sue-tenant-for-unpaid-rent',
        destination: '/money-claim-unpaid-rent',
        permanent: true,
      },

      // Tenancy agreement pillar consolidation (jurisdiction-specific)
      {
        source: '/tenancy-agreement',
        destination: '/assured-shorthold-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/assured-shorthold-tenancy-agreement',
        destination: '/assured-shorthold-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/ast-tenancy-agreement-template',
        destination: '/assured-shorthold-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/ast-template-england',
        destination: '/assured-shorthold-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/england',
        destination: '/assured-shorthold-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/premium-tenancy-agreement',
        destination: '/products/ast',
        permanent: true,
      },
      {
        source: '/occupation-contract-template-wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/standard-occupation-contract-wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/joint-occupation-contract-wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/renting-homes-wales-written-statement',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/fixed-term-periodic-occupation-contract-wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/update-occupation-contract-wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/wales',
        destination: '/wales-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/scottish-tenancy-agreement-template',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/prt-template-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/prt-tenancy-agreement-template-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/private-residential-tenancy-agreement-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/joint-prt-tenancy-agreement-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/update-prt-tenancy-agreement-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/scotland-prt-model-agreement-guide',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/common-prt-tenancy-mistakes-scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreement-northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreement-template-northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/fixed-term-tenancy-agreement-northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/joint-tenancy-agreement-northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/update-tenancy-agreement-northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/ni-private-tenancy-agreement',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
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
