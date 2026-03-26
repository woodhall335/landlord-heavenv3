/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import retiredPublicRoutes from './config/retired-public-routes.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const retiredPublicRedirects = Object.entries(retiredPublicRoutes.routeRedirects).map(
  ([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })
);

const nextConfig = {
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
      ...retiredPublicRedirects,
      // Legacy/old URLs that were indexed by search engines

      // NOTE: /section-21-vs-section-8 is now an active SEO landing page route.
      // Keep legacy /section-8-vs-section-21 page live separately, but do not
      // redirect this slug so the intent cluster can be indexed distinctly.
      {
        source: '/tools/validators/money-claim',
        destination: '/products/money-claim',
        permanent: true,
      },
      {
        source: '/tools/validators/scotland-notice-to-leave',
        destination: '/scotland-notice-to-leave-template',
        permanent: true,
      },
      {
        source: '/tools/validators/tenancy-agreement',
        destination: '/tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/premium',
        destination: '/products/ast',
        permanent: true,
      },
      {
        source: '/tools/validators/wales-notice',
        destination: '/wales-eviction-notice-template',
        permanent: true,
      },
      {
        source: '/\\$',
        destination: '/',
        permanent: true,
      },
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
        destination: '/eviction-notice',
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
        source: '/eviction-notice-uk',
        destination: '/eviction-notice-template',
        permanent: true,
      },
      {
        source: '/section-8-notice-guide',
        destination: '/section-8-notice',
        permanent: true,
      },
      {
        source: '/section-21-notice-guide',
        destination: '/section-21-notice',
        permanent: true,
      },
      {
        source: '/section-21-ban',
        destination: '/section-21-ban-uk',
        permanent: true,
      },
      {
        source: '/section-21-checklist',
        destination: '/section-21-validity-checklist',
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

      // Tenancy agreement alias consolidation (jurisdiction-specific)
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
        source: '/tenancy-agreements/scotland',
        destination: '/private-residential-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/n5b-form-guide',
        destination: '/n5b-possession-claim-guide',
        permanent: true,
      },
      {
        source: '/warrant-of-possession',
        destination: '/warrant-of-possession-guide',
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
        source: '/ni-private-tenancy-agreement',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/ni-tenancy-agreement-template-free',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      {
        source: '/tenancy-agreements/northern-ireland',
        destination: '/northern-ireland-tenancy-agreement-template',
        permanent: true,
      },
      // Final SEO closeout redirects for materially identical aliases
      {
        source: '/complete-eviction-pack-england',
        destination: '/products/complete-pack',
        permanent: true,
      },
      {
        source: '/eviction-pack-england',
        destination: '/products/complete-pack',
        permanent: true,
      },
      {
        source: '/section-21-notice-generator',
        destination: '/section-21-notice-template',
        permanent: true,
      },
      {
        source: '/section-8-notice-generator',
        destination: '/section-8-notice-template',
        permanent: true,
      },
      {
        source: '/n5b-possession-claim-form',
        destination: '/n5b-possession-claim-guide',
        permanent: true,
      },
      {
        source: '/court-bailiff-eviction-guide',
        destination: '/bailiff-eviction-process',
        permanent: true,
      },
      {
        source: '/tenant-refusing-inspection',
        destination: '/tenant-refusing-access',
        permanent: true,
      },
      {
        source: '/tenant-wont-leave',
        destination: '/tenant-refuses-to-leave-after-notice',
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
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse', 'canvas', 'puppeteer-core', 'puppeteer'],
  experimental: {
    serverActions: {
      // Restrict to production domain and localhost for development
      allowedOrigins: ['localhost:5000', 'localhost:3000', 'landlordheaven.co.uk', 'www.landlordheaven.co.uk'],
    },
  },
  webpack: (config) => {
    // Ensure `@/` imports always resolve to `src/` in all build environments,
    // but allow `@/config/*` to resolve to the repo-root `config/` directory.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@/config': path.resolve(__dirname, 'config'),
      '@': path.resolve(__dirname, 'src'),
    };

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
