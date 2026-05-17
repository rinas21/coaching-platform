import Link from "next/link";
import GsapReveal from "@/components/GsapReveal";
import { fetchStrapi, getStrapiCollection } from "@/lib/strapi";
import HorizontalBlogGallery from "@/components/HorizontalBlogGallery";
import BlogStorySubmitForm from "@/components/BlogStorySubmitForm";
import BlogsHeroBackground from "@/components/BlogsHeroBackground";
import { ChevronRightIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BlogPost = {
  documentId?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  categories?: string;
  tags?: string;
  reading_minutes?: number;
  publish_date?: string;
  featured_image?: unknown;
  author?: { name?: string };
};

function splitCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ tag?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedTag = resolvedSearchParams?.tag?.trim();

  const result = await fetchStrapi<{ data?: BlogPost[] }>(
    "/blog-posts?publicationState=preview&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publish_date&fields[4]=categories&fields[5]=tags&fields[6]=reading_minutes&populate[0]=featured_image&populate[1]=author&sort[0]=publish_date:desc",
    { cache: "no-store", next: { revalidate } },
  );

  if (!result.ok) {
    return (
      <main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32">
        <section className="container max-w-[1240px]">
          <div className="max-w-3xl mx-auto text-center bg-white rounded-[3rem] border border-red-200 p-12">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-navy-brand mb-6">
              Blog is temporarily unavailable.
            </h1>
            <p className="text-brown-brand/70 font-nunito mb-8">
              We could not load articles from the CMS right now. Please retry shortly.
            </p>
            <Link href="/contact" className="btn-outline">
              Contact Support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const posts = getStrapiCollection<BlogPost>(result.data);
  const filteredPosts = selectedTag
    ? posts.filter((post) =>
        splitCsv(post.tags).some(
          (tag) => tag.toLowerCase() === selectedTag.toLowerCase(),
        ),
      )
    : posts;

  return (
    <main className="bg-cream-brand/30 min-h-screen px-0 pb-32 overflow-hidden -mt-32">
      {/* Hero Section */}
      <section className="hero_section relative min-h-[600px] h-[50svh] md:h-[100svh] w-full flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        <BlogsHeroBackground />
        <GsapReveal delay={0.1}>
          <div className="text-center px-6 max-w-4xl mx-auto relative z-10 mt-16">
            <span className="text-navy-brand font-bold tracking-widest uppercase text-xs mb-6 block underline decoration-navy-brand/30 underline-offset-8">
              Blog & Community Voices
            </span>
            <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-10 leading-tight">
              Words That Heal. <br /> Stories That Connect.
            </h1>
            <div className="space-y-6 text-lg hidden md:block sm:text-xl text-white/90 font-nunito leading-relaxed max-w-3xl mx-auto">
              <p>
                Welcome to the TSSG Blog a space where knowledge meets lived experience, and where clinical insight sits alongside the real, human stories of people navigating life, healing, and growth.
              </p>
              <p>
                Here you will find articles from our team, resources for everyday wellbeing, and most importantly voices from our community.
              </p>
              <p className="font-playfair italic text-xl md:text-2xl text-white mt-8">
                Because sometimes the most powerful thing you can read is knowing that someone else has been where you are.
              </p>
            </div>
          </div>
        </GsapReveal>
      </section>

      <section className="container max-w-[1240px] px-6 mt-32">
        {/* From Our Team */}
        <GsapReveal direction="up">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-xs font-bold text-amber-brand uppercase tracking-widest mb-4 block">
              Clinical Expertise
            </span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-8">
              From Our Team
            </h2>
            <p className="text-lg md:text-xl text-brown-brand/80 font-playfair italic leading-relaxed mb-12">
              Our practitioners and founder write regularly on topics that matter grounded in clinical expertise, neuroscience, and the realities of everyday life in Sri Lanka and beyond.
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left mb-12">
              {[
                "Trauma, Complex PTSD, and intergenerational patterns",
                "Child development, emotional regulation, and parenting",
                "Anxiety, burnout, and stress in modern life",
                "Nervous system science made accessible",
                "SEL, resilience, and skills for young people",
                "Mental health in schools and workplaces",
                "Behind the programmes at TSSG"
              ].map((item) => (
                <div key={item} className="flex gap-4 items-start text-[11px] md:text-xs font-bold text-navy-brand/80 uppercase tracking-widest leading-relaxed bg-white p-5 rounded-2xl border border-amber-brand/10 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-amber-brand mt-1 text-[10px]">●</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-brown-brand/70 font-nunito italic mb-8">
              New articles published regularly. Follow us on social media to stay updated.
            </p>
          </div>
        </GsapReveal>

        {/* Blog Gallery */}
        {selectedTag ? (
          <div className="mb-8 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-navy-brand/8 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy-brand">
              Filtered by tag: #{selectedTag}
              <Link href="/blog" className="text-amber-brand hover:underline">
                Clear
              </Link>
            </p>
          </div>
        ) : null}

        {filteredPosts.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center bg-white rounded-[3rem] border border-amber-brand/10 p-12 mb-32">
            <h2 className="text-3xl font-playfair font-bold text-navy-brand mb-4">
              {selectedTag ? "No posts found for this tag." : "No posts published yet."}
            </h2>
            <p className="text-brown-brand/70 font-nunito mb-8">
              {selectedTag
                ? "Try another tag or clear the filter to see all posts."
                : "Publish blog posts in Strapi to make them appear here immediately."}
            </p>
          </div>
        ) : (
          <div className="mb-32">
            <HorizontalBlogGallery posts={filteredPosts} />
          </div>
        )}

        {/* Community Voices */}
        <GsapReveal delay={0.3}>
          <div className="mb-24 bg-white rounded-[4rem] px-6 pt-12 pb-8 md:p-20 shadow-xl border border-amber-brand/10 relative overflow-hidden">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <span className="text-xs font-bold text-amber-brand uppercase tracking-widest mb-4 block">
                  Your Story Matters
                </span>
                <h3 className="text-3xl sm:text-5xl font-playfair font-bold text-navy-brand mb-8 leading-tight">
                  Community Voices
                </h3>

                <p className="text-base sm:text-lg text-brown-brand/80 font-nunito mb-6 leading-relaxed">
                  Healing is not a solo journey. And sometimes, the most powerful thing we can oﬀer each other is the truth of our own experience.
                </p>

                <p className="text-base sm:text-lg text-brown-brand/80 font-nunito mb-10 leading-relaxed">
                  We invite members of our community clients past and present, parents, young people, professionals, and anyone touched by the themes of mental health, trauma, and growth to share their stories here. <br /><br />
                  <span className="font-playfair italic text-navy-brand text-xl">Your words may be exactly what someone else needs to read today.</span>
                </p>

                <div className="space-y-10 text-brown-brand/80 font-nunito text-sm sm:text-base leading-relaxed bg-[#FDFBF7] p-8 rounded-3xl border border-amber-brand/5">
                  <div>
                    <h4 className="font-bold text-navy-brand uppercase tracking-widest text-xs mb-4">What we welcome:</h4>
                    <ul className="space-y-3">
                      {[
                        "Personal journeys with mental health, trauma, or healing",
                        "Experiences as a parent, caregiver, or educator",
                        "Stories of resilience, change, and growth",
                        "Reflections on seeking help for the first time",
                        "Cultural experiences of mental health in Sri Lanka and beyond"
                      ].map((item) => (
                        <li key={item} className="flex gap-3 items-start">
                          <span className="text-amber-brand mt-1.5 text-[8px]">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-navy-brand uppercase tracking-widest text-xs mb-4">Submission guidelines:</h4>
                    <ul className="space-y-3">
                      {[
                        "Stories can be submitted anonymously or with your name your choice",
                        "Maximum 800 words",
                        "Written in first person",
                        "Please do not include identifying details of others without their consent",
                        "Avoid detailed descriptions of self-harm, crisis episodes, or graphic content focus on the experience and the journey, not the detail"
                      ].map((item) => (
                        <li key={item} className="flex gap-3 items-start">
                          <span className="text-amber-brand mt-1.5 text-[8px]">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-amber-brand/10">
                    <p className="mb-4">
                      All submissions are reviewed by our team before publishing. We may lightly edit for clarity and length, and will always seek your approval before any changes go live.
                    </p>
                    <p className="text-xs italic text-brown-brand/60">
                      Please note: Community Voices is a storytelling space, not a crisis support channel. If you are in distress, please visit our Contact page for support resources.
                    </p>
                  </div>
                </div>

              </div>
              <div className="bg-navy-brand p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <h4 className="text-white font-playfair text-3xl font-bold mb-4 relative z-10">Submit Your Story</h4>
                <p className="text-cream-brand/70 font-nunito mb-8 relative z-10">Share your voice safely with our team.</p>
                <div className="relative z-10">
                  <BlogStorySubmitForm />
                </div>
                <div className="mt-8 text-center relative z-10">
                  <p className="text-cream-brand/50 text-xs font-nunito">Or email us directly at: <a href="mailto:hello@thesafespaceglobal.com" className="text-amber-brand hover:underline">hello@thesafespaceglobal.com</a></p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-brand/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />
          </div>
        </GsapReveal>

        {/* Resources & Content Notice */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <GsapReveal delay={0.2} direction="up" className="bg-[#F4F6F5] p-10 md:p-16 rounded-[3rem] border border-sage-brand/10">
            <h3 className="text-3xl md:text-4xl font-playfair font-bold text-navy-brand mb-6">
              Resources
            </h3>
            <p className="text-lg text-brown-brand/80 font-nunito leading-relaxed mb-8">
              A curated collection of reads, tools, and references to support your mental health journey for individuals, parents, educators, and professionals.
            </p>
            <p className="text-xs font-bold text-sage-brand tracking-widest uppercase mb-10">
              Updated regularly by the TSSG team.
            </p>
            <Link href="/resources" className="btn-primary">
              Browse Resources <ChevronRightIcon size={16} />
            </Link>
          </GsapReveal>

          <GsapReveal delay={0.3} direction="up" className="bg-[#FDFBF7] p-10 md:p-16 rounded-[3rem] border border-amber-brand/10">
            <h3 className="text-3xl md:text-4xl font-playfair font-bold text-navy-brand mb-6">
              Content Notice
            </h3>
            <p className="text-lg text-brown-brand/80 font-nunito leading-relaxed mb-6">
              Some articles and community stories on this page discuss themes including trauma, anxiety, grief, and complex mental health experiences. We have done our best to handle all content with care and sensitivity. Where relevant, individual posts carry content notices at the top.
            </p>
            <p className="text-lg text-brown-brand/80 font-playfair italic leading-relaxed mb-10">
              If anything you read brings up diﬃcult feelings, please know that support is available.
            </p>
            <Link href="/contact" className="btn-outline">
              Reach Out to Us <ChevronRightIcon size={16} />
            </Link>
          </GsapReveal>
        </div>

      </section>
    </main>
  );
}
