import {
  fetchStrapi,
  getStrapiCollection,
  getStrapiMediaUrl,
} from "@/lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GsapReveal from "@/components/GsapReveal";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BlogTextChild = {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: BlogTextChild[];
};
type BlogBlock = {
  type?: string;
  level?: number;
  format?: "ordered" | "unordered";
  children?: (BlogTextChild | BlogBlock)[];
  image?: unknown;
};

type ContentSection = {
  __component: string;
  id: string;
  heading?: string;
  content?: BlogBlock[];
  image?: unknown;
  caption?: string;
  placement?: "full" | "left" | "right";
};

type BlogPostAttrs = {
  documentId?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  categories?: string;
  tags?: string;
  reading_minutes?: number;
  publish_date?: string;
  author?: { name?: string };
  featured_image?: unknown;
  featuredImage?: unknown;
  cover?: unknown;
  image?: unknown;
  body?: BlogBlock[];
  content_sections?: ContentSection[];
};

type BlogListJson = { data?: unknown[] };

type RelatedPost = {
  documentId?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  publish_date?: string;
  tags?: string;
  featured_image?: unknown;
  featuredImage?: unknown;
  cover?: unknown;
  image?: unknown;
};

function resolveBlogCover(post: BlogPostAttrs): string | null {
  const fromPrimary =
    getStrapiMediaUrl(post.featured_image) ||
    getStrapiMediaUrl(post.featuredImage) ||
    getStrapiMediaUrl(post.cover) ||
    getStrapiMediaUrl(post.image);
  if (fromPrimary) return fromPrimary;

  if (Array.isArray(post.content_sections)) {
    for (const section of post.content_sections) {
      const sectionImage = getStrapiMediaUrl(section.image);
      if (sectionImage) return sectionImage;
    }
  }
  return null;
}

function splitCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderInlineNodes(children?: (BlogTextChild | BlogBlock)[]): React.ReactNode {
  if (!Array.isArray(children)) return null;

  return children.map((child, i) => {
    if (child.type === "link") {
      return (
        <a key={i} href={(child as BlogTextChild).url} className="text-amber-brand underline decoration-amber-brand/30 hover:decoration-amber-brand transition-colors" target="_blank" rel="noopener noreferrer">
          {renderInlineNodes((child as BlogTextChild).children)}
        </a>
      );
    }

    if ("text" in child && typeof child.text === "string") {
      const content: React.ReactNode = child.text;

      let className = "";
      const textChild = child as BlogTextChild;
      if (textChild.bold) className += "font-bold ";
      if (textChild.italic) className += "italic ";
      if (textChild.underline) className += "underline ";
      if (textChild.strikethrough) className += "line-through ";

      if (className) {
        return <span key={i} className={className.trim()}>{content}</span>;
      }
      return <span key={i}>{content}</span>;
    }

    if ("children" in child && Array.isArray(child.children)) {
      return <span key={i}>{renderInlineNodes(child.children)}</span>;
    }

    return null;
  });
}

function StrapiBlocksRenderer({ blocks }: { blocks: BlogBlock[] }) {
  if (!Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <div key={i} className="mb-4">
              <p className="text-[15px] font-sans leading-relaxed text-black/80 whitespace-pre-wrap break-words">
                {renderInlineNodes(block.children)}
              </p>
            </div>
          );
        }
        if (block.type === "quote") {
          return (
            <div key={i} className="mb-6">
              <blockquote className="border-l-4 border-gray-300 pl-4 py-1 italic text-base md:text-lg font-sans text-gray-700 whitespace-pre-wrap break-words">
                {renderInlineNodes(block.children)}
              </blockquote>
            </div>
          );
        }
        if (block.type === "heading") {
          const content = renderInlineNodes(block.children);
          const level = block.level || 2;
          if (level === 1) {
            return (
              <div key={i} className="mt-8 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold font-sans text-black whitespace-pre-wrap">
                  {content}
                </h1>
              </div>
            );
          }
          if (level === 2) {
            return (
              <div key={i} className="mt-8 mb-4">
                <h2 className="text-xl md:text-2xl font-bold font-sans text-black whitespace-pre-wrap">
                  {content}
                </h2>
              </div>
            );
          }
          if (level === 3) {
            return (
              <div key={i} className="mt-6 mb-3">
                <h3 className="text-lg md:text-xl font-bold font-sans text-black whitespace-pre-wrap">
                  {content}
                </h3>
              </div>
            );
          }
          return (
            <div key={i} className="mt-6 mb-3">
              <h4 className="text-base md:text-lg font-bold font-sans text-black whitespace-pre-wrap">
                {content}
              </h4>
            </div>
          );
        }
        if (block.type === "image" && block.image) {
          const src = getStrapiMediaUrl(block.image);
          if (!src) return null;
          return (
            <div key={i} className="my-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100">
                <Image
                  src={src}
                  alt="Blog detail image"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1000px"
                />
              </div>
            </div>
          );
        }
        if (block.type === "list") {
          const Tag = block.format === "ordered" ? "ol" : "ul";
          return (
            <div key={i} className="mb-6">
              <Tag className={`list-outside space-y-2 pl-6 ${block.format === "ordered" ? "list-decimal marker:text-black" : "list-disc marker:text-black"}`}>
                {(block.children || []).map((li, j: number) => (
                  <li key={j} className="text-[15px] font-sans text-black/80 leading-relaxed pl-2 whitespace-pre-wrap break-words">
                    {renderInlineNodes((li as BlogBlock).children || [li])}
                  </li>
                ))}
              </Tag>
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const result = await fetchStrapi<BlogListJson>(
    `/blog-posts?publicationState=preview&filters[slug][$eq]=${encodeURIComponent(resolvedParams.slug)}&populate[0]=featured_image&populate[1]=author&populate[2]=content_sections.image`,
    { cache: "no-store", next: { revalidate } },
  );
  if (!result.ok) {
    notFound();
  }
  const post = getStrapiCollection<BlogPostAttrs>(result.data)[0];
  if (!post) {
    notFound();
  }

  const attrs = post;
  const categories = splitCsv(attrs.categories);
  const tags = splitCsv(attrs.tags);
  const normalizedCurrentTags = new Set(tags.map((tag) => tag.toLowerCase()));
  const imageSrc = resolveBlogCover(attrs);

  const relatedResult = await fetchStrapi<BlogListJson>(
    "/blog-posts?publicationState=preview&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publish_date&fields[4]=tags&populate[0]=featured_image&sort[0]=publish_date:desc&pagination[pageSize]=100",
    { cache: "no-store", next: { revalidate } },
  );

  const relatedPosts = relatedResult.ok
    ? getStrapiCollection<RelatedPost>(relatedResult.data)
        .filter((candidate) => candidate.slug && candidate.slug !== attrs.slug)
        .map((candidate) => {
          const candidateTags = splitCsv(candidate.tags);
          const matchCount = candidateTags.filter((tag) =>
            normalizedCurrentTags.has(tag.toLowerCase()),
          ).length;
          return { candidate, matchCount };
        })
        .filter((item) => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 3)
        .map((item) => item.candidate)
    : [];

  const formattedDate = attrs.publish_date
    ? new Intl.DateTimeFormat("en-LK", { year: "numeric", month: "long", day: "numeric" }).format(new Date(attrs.publish_date))
    : null;

  return (
    <main className="min-h-screen pt-12 pb-40">
      {/* Back Button */}
      <div className="container mx-auto px-6 mb-8">
        <GsapReveal delay={0.1} direction="up">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft size={20} />
            Back
          </Link>
        </GsapReveal>
      </div>

      <article className="container mx-auto px-6">
        {/* Header Section */}
        <header className="mb-10">
          <GsapReveal delay={0.2} direction="up">
            {categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-brand/10 text-amber-brand text-xs font-semibold tracking-wider uppercase rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-black mb-6 leading-tight">
              {attrs.title}
            </h1>
          </GsapReveal>

          <GsapReveal delay={0.3} direction="up">
            <div className="flex flex-col items-start justify-between gap-4 text-sm text-gray-600 font-sans border-b border-gray-200 pb-6">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {attrs.author?.name && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {attrs.author.name.charAt(0)}
                    </div>
                    <span className="font-medium text-black">{attrs.author.name}</span>
                  </div>
                )}

                {(formattedDate || attrs.reading_minutes) && attrs.author?.name && (
                  <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                )}

                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>{formattedDate}</span>
                  </div>
                )}

                {formattedDate && attrs.reading_minutes && (
                  <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                )}

                {attrs.reading_minutes ? (
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{attrs.reading_minutes} min read</span>
                  </div>
                ) : null}
              </div>

              {tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={`tag-${tag}`}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="text-gray-500 hover:text-black transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GsapReveal>
        </header>

        {imageSrc && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100 mb-10">
            <Image
              src={imageSrc}
              alt={attrs.title || "Blog image"}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="font-sans text-black/80">
          {/* Traditional Body (Blocks) */}
          {Array.isArray(attrs.body) && attrs.body.length > 0 && (
            <StrapiBlocksRenderer blocks={attrs.body} />
          )}

          {/* Dynamic Content Sections */}
          {Array.isArray(attrs.content_sections) && attrs.content_sections.map((section, i) => {
            if (section.__component === "blog.rich-text") {
              return (
                <div key={section.id || i} className="mb-8">
                  {section.heading && (
                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-black mt-8 mb-4 whitespace-pre-wrap">{section.heading}</h2>
                  )}
                  {section.content && <StrapiBlocksRenderer blocks={section.content} />}
                </div>
              );
            }
            if (section.__component === "blog.image-block" && section.image) {
              const src = getStrapiMediaUrl(section.image);
              if (!src) return null;
              return (
                <div key={section.id || i} className={`my-8 ${section.placement === 'left' ? 'md:w-3/4 md:mr-auto' : section.placement === 'right' ? 'md:w-3/4 md:ml-auto' : 'w-full'}`}>
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-100">
                    <Image
                      src={src}
                      alt={section.caption || "Blog image"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 800px"
                    />
                  </div>
                  {section.caption && (
                    <p className="mt-2 text-center text-sm text-gray-500 font-sans">{section.caption}</p>
                  )}
                </div>
              );
            }
            return null;
          })}

          {!attrs.body?.length && !attrs.content_sections?.length && (
            <p className="text-base font-sans text-gray-500 italic">No content available.</p>
          )}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="container max-w-[1240px] px-6 md:px-12 mt-20 md:mt-28">
          <GsapReveal direction="up">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-brand">
                Keep Reading
              </span>
              <h2 className="text-3xl md:text-5xl font-playfair font-bold text-navy-brand mt-3">
                Related Posts
              </h2>
            </div>
          </GsapReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {relatedPosts.map((related) => {
              const relatedImage = resolveBlogCover(related);
              const relatedTags = splitCsv(related.tags).slice(0, 2);
              return (
                <GsapReveal key={related.documentId || related.slug} delay={0.05} direction="up">
                  <Link
                    href={`/blog/${related.slug}`}
                    className="group block bg-white rounded-3xl overflow-hidden border border-amber-brand/15 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[16/10] bg-cream-brand/50">
                      {relatedImage ? (
                        <Image
                          src={relatedImage}
                          alt={related.title || "Related post"}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-playfair font-bold text-navy-brand mb-3 line-clamp-2">
                        {related.title || "Untitled post"}
                      </h3>
                      {related.excerpt ? (
                        <p className="text-sm font-nunito text-brown-brand/80 line-clamp-3 mb-4">
                          {related.excerpt}
                        </p>
                      ) : null}
                      {relatedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {relatedTags.map((tag) => (
                            <span
                              key={`${related.slug}-${tag}`}
                              className="rounded-full bg-navy-brand/8 text-navy-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </GsapReveal>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
