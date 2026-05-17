"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Airplay, Heart, MessageCircle } from "lucide-react";
import GsapReveal from "./GsapReveal";
import { SITE_INSTAGRAM_PROFILE_URL } from "@/lib/site-instagram";

type IgPost = {
  id: string;
  image: string;
  likes: string;
  comments: string;
  permalink: string;
  caption?: string;
};

const LAST_GOOD_POSTS_KEY = "tssg_instagram_last_good_posts";

const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || SITE_INSTAGRAM_PROFILE_URL;

/** e.g. SnapWidget / EmbedSocial “iframe src=” URL — Instagram’s own site cannot be iframed. */
const INSTAGRAM_EMBED_URL = process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URL?.trim() || "";

const STATIC_FALLBACK_POSTS: IgPost[] = [
  {
    id: "static-1",
    image: "/assets/images/instagram1.jpeg",
    likes: "250",
    comments: "15",
    permalink: SITE_INSTAGRAM_PROFILE_URL,
    caption: "Healing is a pattern of safety, resilience, and growth. Join us @thesafespaceglobal.",
  },
  {
    id: "static-2",
    image: "/assets/images/instgram2.jpeg",
    likes: "180",
    comments: "24",
    permalink: SITE_INSTAGRAM_PROFILE_URL,
    caption: "Rooted in neuroscience, guided by compassion. Insights from our weekly sessions.",
  },
  {
    id: "static-3",
    image: "/assets/images/instgram3.jpeg",
    likes: "320",
    comments: "42",
    permalink: SITE_INSTAGRAM_PROFILE_URL,
    caption: "Building blocks of executive resilience for leaders and organizations. A high-performance approach.",
  },
];

function FeedHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-12">
      <div className="max-w-[600px]">
        <GsapReveal>
          <span className="text-amber-brand font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            Stay Connected
          </span>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-6 leading-tight">
            Follow our journey on Instagram.
          </h2>
          <p className="text-lg text-brown-brand/70 font-nunito">
            Insights on executive leadership, business resilience, and enterprise scaling shared weekly. Join us @thesafespaceglobal.
          </p>
        </GsapReveal>
      </div>
      <GsapReveal delay={0.2}>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-primary flex items-center gap-3 bg-navy-brand hover:bg-amber-brand"
        >
          <Airplay size={20} />
          Follow Us
        </a>
      </GsapReveal>
    </div>
  );
}

/** Full profile grid via third-party iframe (SnapWidget, EmbedSocial, etc.). */
function InstagramIframeEmbed() {
  return (
    <section className="section bg-cream-brand/30 relative overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-6 relative z-10">
        <FeedHeader />
        <GsapReveal delay={0.15}>
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-amber-brand/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] min-h-[min(90vh,920px)]">
            <iframe
              src={INSTAGRAM_EMBED_URL}
              title="Instagram feed"
              className="block w-full min-h-[min(90vh,920px)] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write"
            />
          </div>
        </GsapReveal>
      </div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-brand/5 rounded-full blur-3xl -translate-y-1/2 -ml-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sage-brand/5 rounded-full blur-3xl -mr-48 -mb-48" />
    </section>
  );
}

function InstagramApiGrid() {
  const [posts, setPosts] = useState<IgPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fallbackAvailableRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_GOOD_POSTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const cached = parsed.filter(
        (post): post is IgPost =>
          Boolean(
            post &&
              typeof post === "object" &&
              "id" in post &&
              "image" in post &&
              "permalink" in post,
          ),
      );
      if (cached.length > 0) {
        fallbackAvailableRef.current = true;
        setPosts(cached.slice(0, 3));
      }
    } catch {
      // Ignore storage read errors and continue with live fetch.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/instagram", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          posts?: IgPost[];
          reason?: string;
        };
        if (cancelled) return;
        const list = Array.isArray(data.posts) ? data.posts : [];
        if (data.ok && list.length > 0) {
          const nextPosts = list.slice(0, 3);
          fallbackAvailableRef.current = true;
          setPosts(nextPosts);
          try {
            window.localStorage.setItem(
              LAST_GOOD_POSTS_KEY,
              JSON.stringify(nextPosts),
            );
          } catch {
            // Ignore storage write errors; UI can still use live data.
          }
          setError(null);
        } else {
          const hasFallback = fallbackAvailableRef.current;
          if (!hasFallback) {
            setPosts(STATIC_FALLBACK_POSTS);
            setError("Latest Instagram posts are unavailable. Showing highlights from our space.");
          } else {
            setError("Latest Instagram posts are unavailable. Showing previous posts.");
          }
        }
      } catch {
        if (!cancelled) {
          const hasFallback = fallbackAvailableRef.current;
          if (!hasFallback) {
            setPosts(STATIC_FALLBACK_POSTS);
            setError("Latest Instagram posts are unavailable. Showing highlights from our space.");
          } else {
            setError("Latest Instagram posts are unavailable. Showing previous posts.");
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = posts ?? [];

  return (
    <section className="section bg-cream-brand/30 relative overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-6 relative z-10">
        <FeedHeader />

        {display.length === 0 ? (
          <GsapReveal delay={0.1}>
            <div className="rounded-[2rem] border border-amber-brand/10 bg-white/80 px-8 py-12 text-center backdrop-blur-sm">
              <p className="text-lg font-nunito text-brown-brand/70">
                {error || "Loading the latest Instagram posts..."}
              </p>
            </div>
          </GsapReveal>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {display.slice(0, 3).map((post, idx) => (
            <GsapReveal key={post.id} delay={idx * 0.1} direction="up">
              <div className="relative group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-amber-brand/20 backdrop-blur-sm -rotate-2 z-20 pointer-events-none border-x border-amber-brand/10" />

                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative p-4 bg-[#fcf9f2] rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-amber-brand/5 transform transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                  style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                  }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-sm border border-navy-brand/5">
                    <Image
                      src={post.image}
                      alt={post.caption ? post.caption.slice(0, 80) : `Instagram post ${post.id}`}
                      fill
                      className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    <div className="absolute inset-0 bg-navy-brand/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold">
                      <div className="flex items-center gap-2">
                        <Heart size={20} className="fill-current" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle size={20} className="fill-current" />
                        {post.comments}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pb-2 text-center">
                    <p className="font-playfair italic text-navy-brand/60 text-sm line-clamp-2">
                      {post.caption || "From the Space"}
                    </p>
                    <div className="mt-2 w-8 h-[1px] bg-amber-brand/30 mx-auto" />
                  </div>
                </a>

                <div className="absolute -inset-1 bg-black/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </GsapReveal>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-brand/5 rounded-full blur-3xl -translate-y-1/2 -ml-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sage-brand/5 rounded-full blur-3xl -mr-48 -mb-48" />
    </section>
  );
}

export default function InstagramFeed() {
  if (INSTAGRAM_EMBED_URL) {
    return <InstagramIframeEmbed />;
  }
  return <InstagramApiGrid />;
}
