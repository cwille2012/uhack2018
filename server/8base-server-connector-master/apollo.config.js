require('dotenv').config()
module.exports = {
    client: {
      service: {
        name: '8base',
        url: process.env.GRAPHQL_HOST,
      },
      includes: [
        "src/**/*.{ts,tsx,js,jsx,graphql}"
      ]
    },
  };