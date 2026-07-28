"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { donateButtonClass } from "./DonateButton";
import { DONATE_ANCHOR, DONATE_ENABLED } from "@/lib/site";

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
        {DONATE_ENABLED && (
          <a
            href={`/#${DONATE_ANCHOR}`}
            className={`${donateButtonClass} px-4 py-2 text-[12px]`}
          >
            チップを送る
          </a>
        )}
      </div>
    </header>
  );
}
