import type { Core } from '@strapi/strapi';

const config = (): Core.Config.Plugin => ({
  // Disable Strapi Cloud plugin to remove Marketplace branding/icon in admin.
  cloud: {
    enabled: false,
  },
  // Enable custom order verification plugin
  'order-verification': {
    enabled: true,
    resolve: './src/plugins/strapi-plugin-order-verification',
  },
});

export default config;
