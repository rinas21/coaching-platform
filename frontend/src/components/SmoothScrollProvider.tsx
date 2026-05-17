"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef | null>(null);
  const pathname = usePathname();

  // Sync GSAP ticker with Lenis for smooth ScrollTrigger animations
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    // Prevent GSAP from causing a jump after a long frame
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    // Reset scroll position immediately
    window.scrollTo(0, 0);
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    }

    // Deferred scroll to handle Next.js App Router transition timings
    const scrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }
    }, 100);

    // Refresh ScrollTrigger after a slight delay to account for Next.js layout updates
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(refreshTimer);
    };
  }, [pathname]);

  // Handle layout shifts
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150); // debounce refresh
    });
    
    observer.observe(document.body);
    
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={false}
      options={{
        lerp: 0.12,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
