"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    // Initially we might want to hide the cursor completely until the mouse moves
    gsap.set([cursorDotRef.current, cursorOutlineRef.current], { opacity: 0 });

    let isVisible = false;

    const moveDotX = gsap.quickTo(cursorDotRef.current, "x", {
      duration: 0.1,
      ease: "power2.out",
    });
    const moveDotY = gsap.quickTo(cursorDotRef.current, "y", {
      duration: 0.1,
      ease: "power2.out",
    });
    const moveOutlineX = gsap.quickTo(cursorOutlineRef.current, "x", {
      duration: 0.6,
      ease: "power3.out",
    });
    const moveOutlineY = gsap.quickTo(cursorOutlineRef.current, "y", {
      duration: 0.6,
      ease: "power3.out",
    });

    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      if (!isVisible) {
        gsap.to([cursorDotRef.current, cursorOutlineRef.current], { opacity: 1, duration: 0.3 });
        isVisible = true;
      }

      moveDotX(x);
      moveDotY(y);
      moveOutlineX(x);
      moveOutlineY(y);
    };

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName?.toLowerCase() === "a" ||
        target.tagName?.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        gsap.to(cursorOutlineRef.current, {
          scale: 1.5,
          backgroundColor: "rgba(235, 179, 105, 0.1)",
          borderWidth: 0,
          duration: 0.3,
        });
        gsap.to(cursorDotRef.current, {
          scale: 0,
          duration: 0.3,
        });
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName?.toLowerCase() === "a" ||
        target.tagName?.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        gsap.to(cursorOutlineRef.current, {
          scale: 1,
          backgroundColor: "transparent",
          borderWidth: 1,
          duration: 0.3,
        });
        gsap.to(cursorDotRef.current, {
          scale: 1,
          duration: 0.3,
        });
      }
    };

    const onMouseDown = () => {
      gsap.to(cursorOutlineRef.current, {
        scale: 0.8,
        duration: 0.15,
      });
    };

    const onMouseUp = () => {
      gsap.to(cursorOutlineRef.current, {
        scale: 1,
        duration: 0.15,
      });
    };

    // Hide default cursor
    document.body.style.cursor = "none";

    // Select all potential interactive elements to add cursor style overrides
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 1024px) {
        a, button, input, textarea, select, [role="button"] {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseEnter);
    document.addEventListener("mouseout", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseEnter);
      document.removeEventListener("mouseout", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-amber-brand rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      />
      <div
        ref={cursorOutlineRef}
        className="fixed top-0 left-0 w-8 h-8 border border-amber-brand/50 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      />
    </>
  );
}
