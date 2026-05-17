import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::team-member.team-member', ({ strapi }) => ({
	async find(ctx) {
		const query = ctx.query ?? {};
		// If no explicit sort provided, default to display_order ascending
		if (!query.sort) {
			ctx.query = { ...query, sort: ['display_order:asc'] };
		}
		return await super.find(ctx);
	},
}));