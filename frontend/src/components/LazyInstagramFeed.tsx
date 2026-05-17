"use client";

import dynamic from "next/dynamic";

const InstagramFeed = dynamic(() => import("@/components/InstagramFeed"), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-cream-brand/30" />,
});

export default function LazyInstagramFeed() {
  return <InstagramFeed />;
}
