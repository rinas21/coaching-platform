"use client";

import React from "react";
import Link from "next/link";

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_BOOKING_URL || "https://wa.me/94770000000";


export default function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-3 pointer-events-none group">
      {/* Tooltip/Label */}
      <div className="bg-white/90 backdrop-blur-sm text-navy-brand text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-black/5 opacity-0 translate-y-2 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 mr-2 sm:mr-0">
        Chat with us
      </div>

      {/* Button */}
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact us on WhatsApp"
        className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-xl shadow-amber-400/30 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto overflow-hidden border-[3px] border-amber-400"
      >
        {/* Amber pulse ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-400 group-hover:opacity-40"></div>

        {/* Robin mascot */}
        <div className="relative z-10 w-full h-full bg-[url('/assets/robin.png')] bg-cover bg-center bg-no-repeat">

        </div>
      </Link>
    </div>
  );
}