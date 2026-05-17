import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const actions = [
      'api::blog-post.blog-post.find',
      'api::blog-post.blog-post.findOne',
      'api::blog-post.blog-post.count',
      'api::event.event.find',
      'api::event.event.findOne',
      'api::item-sale.item-sale.find',
      'api::item-sale.item-sale.findOne',
      'api::site-setting.site-setting.find',
      'api::site-setting.site-setting.findOne',
      'api::service.service.find',
      'api::service.service.findOne',
      'api::team-member.team-member.find',
      'api::team-member.team-member.findOne',
      'api::testimonial.testimonial.find',
      'api::testimonial.testimonial.findOne',
    ];

    const db = strapi.db.connection;
    const now = db.fn.now();

    for (const action of actions) {
      let perm = await db('up_permissions').select(['id']).where({ action }).first();

      if (!perm) {
        const inserted = await db('up_permissions')
          .insert({
            action,
            created_at: now,
            updated_at: now,
            published_at: now,
          })
          .returning('id');

        const id =
          typeof inserted?.[0] === 'object'
            ? (inserted[0] as any).id
            : (inserted?.[0] as any);

        perm = { id };
      }

      const link = await db('up_permissions_role_lnk')
        .select(['id'])
        .where({ permission_id: perm.id, role_id: publicRole.id })
        .first();

      if (!link) {
        await db('up_permissions_role_lnk').insert({
          permission_id: perm.id,
          role_id: publicRole.id,
        });
      }
    }
  },
};
