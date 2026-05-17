const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'blog-post',
    attributes: {
      title: { type: 'string' },
      slug: { type: 'uid', targetField: 'title' },
      body: { type: 'blocks' },
      featured_image: { type: 'media', multiple: false, required: false, allowedTypes: ['images'] },
      categories: { type: 'string' },
      tags: { type: 'string' },
      seo_metadata: { type: 'text' },
      publish_date: { type: 'date' },
      author: { type: 'relation', relation: 'manyToOne', target: 'api::team-member.team-member', inversedBy: 'articles' }
    }
  },
  {
    name: 'team-member',
    attributes: {
      name: { type: 'string' },
      credentials: { type: 'string' },
      photo: { type: 'media', multiple: false, required: false, allowedTypes: ['images'] },
      role: { type: 'string' },
      bio: { type: 'blocks' },
      articles: { type: 'relation', relation: 'oneToMany', target: 'api::blog-post.blog-post', mappedBy: 'author' }
    }
  },
  {
    name: 'service',
    attributes: {
      title: { type: 'string' },
      description: { type: 'blocks' },
      audience_category: { type: 'enumeration', enum: ['Individuals & Families', 'Children & Adolescents', 'Schools & Educators', 'Organizations & Corporates'] },
      images: { type: 'media', multiple: true, required: false, allowedTypes: ['images'] },
      process_steps: { type: 'json' }
    }
  },
  {
    name: 'event',
    attributes: {
      title: { type: 'string' },
      description: { type: 'blocks' },
      date_time: { type: 'datetime' },
      registration_link: { type: 'string' },
      featured_image: { type: 'media', multiple: false, required: false, allowedTypes: ['images'] }
    }
  }
];

const basePath = path.join(__dirname, 'backend', 'src', 'api');

models.forEach(model => {
  const modelPath = path.join(basePath, model.name);
  fs.mkdirSync(path.join(modelPath, 'controllers'), { recursive: true });
  fs.mkdirSync(path.join(modelPath, 'routes'), { recursive: true });
  fs.mkdirSync(path.join(modelPath, 'services'), { recursive: true });
  fs.mkdirSync(path.join(modelPath, 'content-types', model.name), { recursive: true });

  const controller = `import { factories } from '@strapi/strapi';\nexport default factories.createCoreController('api::${model.name}.${model.name}');`;
  fs.writeFileSync(path.join(modelPath, 'controllers', `${model.name}.ts`), controller);

  const route = `import { factories } from '@strapi/strapi';\nexport default factories.createCoreRouter('api::${model.name}.${model.name}');`;
  fs.writeFileSync(path.join(modelPath, 'routes', `${model.name}.ts`), route);

  const service = `import { factories } from '@strapi/strapi';\nexport default factories.createCoreService('api::${model.name}.${model.name}');`;
  fs.writeFileSync(path.join(modelPath, 'services', `${model.name}.ts`), service);

  const schema = {
    kind: 'collectionType',
    collectionName: model.name.replace('-', '_') + 's',
    info: {
      singularName: model.name,
      pluralName: model.name + 's',
      displayName: model.name.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())
    },
    options: {
      draftAndPublish: true
    },
    pluginOptions: {},
    attributes: model.attributes
  };
  fs.writeFileSync(path.join(modelPath, 'content-types', model.name, 'schema.json'), JSON.stringify(schema, null, 2));
});
