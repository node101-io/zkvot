import path from "path";

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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
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
