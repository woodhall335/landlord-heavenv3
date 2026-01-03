import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  // Allow localhost for development
  allowedDevOrigins: ['localhost:5000', 'localhost:3000'],
  // Exclude PDF libraries from webpack bundling to avoid ESM/CJS conflicts
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse', 'canvas'],
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
