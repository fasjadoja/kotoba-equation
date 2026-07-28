/** Shared look for every donation call to action (header, footer band, page). */
export const donateButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-coffeeDark/50 bg-gradient-to-b from-coffee to-coffeeDark font-semibold text-coffeeInk shadow-[0_2px_10px_rgba(255,196,0,0.4)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffeeDark active:translate-y-px";

export function CoffeeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
