const path = require('node:path');
const fs = require('node:fs');
const { createStrapi } = require('@strapi/strapi');

/**
 * Strapi loads config from `distDir/config` (compiled `.js` after `strapi build`).
 * `createStrapi()` defaults `distDir` to cwd, which points at TypeScript `config/*.ts`
 * and fails in plain Node with "extension must be one of .js,.json".
 */
function resolveStrapiDirs() {
  const appDir = path.resolve(__dirname);
  const distConfig = path.join(appDir, 'dist', 'config', 'database.js');
  if (fs.existsSync(distConfig)) {
    return { appDir, distDir: path.join(appDir, 'dist') };
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Strapi build output missing (dist/config). Run `npm run build` in the backend image before seeding.',
    );
  }
  return { appDir, distDir: appDir };
}

async function ensureSingleType(query, data) {
  const existing = await query.findOne();
  if (existing) {
    return query.update({
      where: { id: existing.id },
      data,
    });
  }

  return query.create({ data });
}

async function ensureCollectionEntry(query, where, data) {
  const existing = await query.findOne({ where });
  if (existing) {
    return query.update({
      where: { id: existing.id },
      data,
    });
  }

  return query.create({ data });
}

async function seed() {
  console.log('Seeding is disabled. No dummy data will be inserted.');
  const { appDir, distDir } = resolveStrapiDirs();
  const app = await createStrapi({ appDir, distDir }).load();

  try {
    console.log('No seed actions executed.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  }

  await app.destroy();
}

seed()
  .then(() => {
    process.exit(typeof process.exitCode === 'number' ? process.exitCode : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
