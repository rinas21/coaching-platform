"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function WincoreCredit() {
  const textRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;

    // A subtle glowing/pulsing effect using GSAP
    gsap.to(textRef.current, {
      color: "#ffffff",
      textShadow: "0px 0px 8px rgba(213, 170, 85, 0.8)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <p className="text-xs uppercase tracking-widest text-white font-bold">
      Designed & Developed by &nbsp;
      <a
        ref={textRef}
        className="text-amber-brand font-extrabold hover:text-white transition-colors inline-block"
        href="https://wincore.lk/?utm_source=thesafespaceglobal&utm_medium=footer&utm_campaign=credit_link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wincore.lk
      </a>
    </p>
  );
}
