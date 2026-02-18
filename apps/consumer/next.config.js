const { PHASE_PRODUCTION_BUILD } = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

module.exports = (phase) => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const withPWA = require("@ducanh2912/next-pwa").default({ dest: "public" });
    return withPWA(nextConfig);
  }
  return nextConfig;
};
