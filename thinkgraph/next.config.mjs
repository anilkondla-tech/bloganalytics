/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // mysql2 is a server-only dependency; keep it out of the client bundle.
    serverComponentsExternalPackages: ["mysql2"],
  },
};

export default nextConfig;
