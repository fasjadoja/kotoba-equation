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
    /* A thin, quiet bar: frosted once the page moves, invisible at the top. */
    <header
      className={`sticky top-0 z-20 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-panel/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[52px] max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        {DONATE_ENABLED && (
          <a
            href={`/#${DONATE_ANCHOR}`}
            className={`${donateButtonClass} px-4 py-1.5 text-[12px]`}
          >
            チップを送る
          </a>
        )}
      </div>
    </header>
  );
}
