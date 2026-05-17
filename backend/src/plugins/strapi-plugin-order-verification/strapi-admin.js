import { CheckCircle } from '@strapi/icons';

export default {
  register(app) {
    app.addMenuLink({
      to: '/plugins/order-verification',
      icon: CheckCircle,
      intlLabel: {
        id: 'order-verification.plugin.name',
        defaultMessage: 'Order Verification',
      },
      permissions: [],
      Component: async () => {
        const page = await import('./pages/OrderVerificationPage');
        return page.default;
      },
    });

    app.registerPlugin({
      id: 'order-verification',
      initializer: () => null,
      isReady: true,
      name: 'Order Verification',
    });
  },

  bootstrap() {},
};
