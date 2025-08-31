/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      // Configure your build-time transforms here
    },
    root: __dirname, // Explicitly set the root directory
  },
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
    },
  ],
},

  experimental: {
    // Allow dev requests from both localhost and LAN IP
    allowedDevOrigins: ['http://localhost:3000', 'http://192.168.1.2:3000'],
  },
  // Optional: keep your headers config for other CORS needs
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // for APIs if you need to allow cross-origin requests
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
