"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";

function CoffeeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 2.5v2M12 2.5v2" />
    </svg>
  );
}

/** Condenses and lifts the bar once the page scrolls away from the top. */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-panel/85 shadow-[0_1px_12px_rgba(18,26,22,0.05)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <Logo />
        {SITE.donateUrl && (
          <a
            href={SITE.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3.5 py-2 text-[12px] font-semibold text-[#3B2A12] shadow-[0_2px_8px_rgba(255,169,43,0.35)] transition hover:brightness-105 active:translate-y-px"
          >
            <CoffeeIcon />
            コーヒーをおごる
          </a>
        )}
      </div>
    </header>
  );
}
