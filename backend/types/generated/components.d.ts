import type { Schema, Struct } from '@strapi/strapi';

export interface BlogImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_blog_image_blocks';
  info: {
    description: 'Inline image with caption and placement';
    displayName: 'Image Block';
  };
  attributes: {
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    placement: Schema.Attribute.Enumeration<['full', 'left', 'right']> &
      Schema.Attribute.DefaultTo<'full'>;
  };
}

export interface BlogRichText extends Struct.ComponentSchema {
  collectionName: 'components_blog_rich_texts';
  info: {
    description: 'Text section for blog content';
    displayName: 'Rich Text Section';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    heading: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blog.image-block': BlogImageBlock;
      'blog.rich-text': BlogRichText;
    }
  }
}
