import type { GatsbyConfig } from "gatsby";

// Load .env.development / .env.production locally. On Vercel the variables
// come from the project settings, so a missing file is fine.
try {
  process.loadEnvFile(`.env.${process.env.NODE_ENV}`);
} catch {}

const config: GatsbyConfig = {
  jsxRuntime: "automatic",
  graphqlTypegen: true,
  plugins: [
    {
      resolve: "gatsby-plugin-sass",
      // gatsby-plugin-sass still uses Sass's legacy JS API internally
      options: { sassOptions: { silenceDeprecations: ["legacy-js-api"] } },
    },
    {
      resolve: "gatsby-source-microcms",
      options: {
        apiKey: process.env.MICROCMS_API_KEY,
        serviceId: process.env.MICROCMS_SERVICE_DOMAIN,
        apis: [
          {
            endpoint: "blogs",
            type: "blog",
            query: { limit: 100, depth: 1 },
          },
        ],
      },
    },
  ],
};

export default config;
