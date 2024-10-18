import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",
      "i.imgur.com",
      "reactjs.org",
      "angular.io",
      "via.placeholder.com",
    ],
  },
  webpack: (config, options) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve("./"),
    };
    return config;
  },
};

export default nextConfig;
