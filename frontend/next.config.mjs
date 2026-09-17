/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiProxyUrl = process.env.API_PROXY_URL;
    return apiProxyUrl
      ? [{ source: '/api/:path*', destination: `${apiProxyUrl}/api/:path*` }]
      : [];
  },
};
export default nextConfig;
