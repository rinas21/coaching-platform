"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { ChevronRightIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type BlogPost = {
  documentId?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  publish_date?: string;
  featured_image?: unknown;
  featuredImage?: unknown;
  cover?: unknown;
  image?: unknown;
  author?: { name?: string };
};

function resolveBlogCardImage(post: BlogPost): string | null {
  return (
    getStrapiMediaUrl(post.featured_image) ||
    getStrapiMediaUrl(post.featuredImage) ||
    getStrapiMediaUrl(post.cover) ||
    getStrapiMediaUrl(post.image) ||
    null
  );
}

function formatDate(value?: string): string {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function HorizontalBlogGallery({ posts }: { posts: BlogPost[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [transitionData, setTransitionData] = useState<{
    rect: DOMRect;
    imageSrc: string;
    title: string;
    slug: string;
  } | null>(null);

  // Reset transition state if the user navigates back
  useEffect(() => {
    const handlePopState = () => setTransitionData(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (transitionData && transitionData.slug) {
      gsap.to(".page-transition-overlay", {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          router.push(`/blog/${transitionData.slug}`);
          // Fallback to clear state after a delay in case component doesn't unmount immediately
          setTimeout(() => setTransitionData(null), 2000);
        },
      });
    }
  }, [transitionData, router]);

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string, imageSrc: string | null, title: string) => {
    e.preventDefault();
    if (!imageSrc) {
      router.push(`/blog/${slug}`);
      return;
    }
    const cardElement = e.currentTarget.closest(".blog-card");
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      setTransitionData({ rect, imageSrc, title, slug });
    } else {
      router.push(`/blog/${slug}`);
    }
  };

  useGSAP(
    () => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      const cards = gsap.utils.toArray(".blog-card") as HTMLElement[];
      if (!cards.length) return;

      const totalScroll = Math.max(0, wrapper.scrollWidth - window.innerWidth);
      if (totalScroll === 0) return;

      gsap.to(wrapper, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top top", // Pins exactly when the section hits the top
          end: () => `+=${totalScroll}`, // Scroll duration equals horizontal scroll distance
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="h-[100svh] md:h-screen overflow-hidden flex items-center relative -mx-6 w-[100vw]"
      style={{ left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw" }}
    >
      <div ref={scrollWrapperRef} className="flex h-full items-center px-[5vw] lg:px-[10vw]">
        {posts.map((post, index) => {
          const title = post.title || "Untitled post";
          const slug = post.slug;
          const imageSrc = resolveBlogCardImage(post);

          if (!slug) return null;

          return (
            <div
              key={post.documentId || slug || index}
              className="blog-card relative shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[32vw] h-[65vh] mr-6 md:mr-12 lg:mr-16 rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl bg-white border border-white/10"
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 400px"
                />
              ) : (
                <div className="w-full h-full bg-cream-brand/30 flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest text-brown-brand/50 font-bold">Image Missing</span>
                </div>
              )}

              {/* Overlay with modern gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-brand via-navy-brand/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700 pointer-events-none" />

              {/* Card Content */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none">
                <div className="transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-4 pointer-events-auto">

                  <div className="mb-4">
                    <span className="inline-block text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      {formatDate(post.publish_date)} {post.author?.name ? `• ${post.author.name}` : ""}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-white mb-6 leading-tight transition-colors duration-300 line-clamp-3">
                    <Link
                      href={`/blog/${slug}`}
                      className="before:absolute before:inset-0"
                      onClick={(e) => handleCardClick(e, slug, imageSrc, title)}
                    >
                      {title}
                    </Link>
                  </h2>

                  <div className="overflow-hidden pt-2 h-10">
                    <span className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-cream-brand transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      Read Article <ChevronRightIcon size={16} />
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Transition Overlay */}
      {transitionData && (
        <div
          className="page-transition-overlay fixed z-[9999] overflow-hidden pointer-events-none"
          style={{
            top: transitionData.rect.top,
            left: transitionData.rect.left,
            width: transitionData.rect.width,
            height: transitionData.rect.height,
            borderRadius: "3rem",
          }}
        >
          <Image
            src={transitionData.imageSrc}
            alt={transitionData.title}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 bg-navy-brand/30" />
        </div>
      )}
    </div>
  );
}
