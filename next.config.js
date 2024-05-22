/**  @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Read the ALLOWED_ORIGINS environment variable and convert it to an array
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : []

    // Create the Access-Control-Allow-Origin headers
    const corsHeaders = allowedOrigins.map((origin) => ({
      key: 'Access-Control-Allow-Origin',
      value: origin
    }))

    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          ...corsHeaders, // Include the dynamically created CORS headers
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ]
  },

  images: {
    domains: ['res.cloudinary.com']
  }
}

module.exports = nextConfig
