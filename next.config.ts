import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    appIsrStatus: false,
  },
  allowedDevOrigins: ["*"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  webpack: (config, { isServer }) => {
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
