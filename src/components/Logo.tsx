import { useId } from "react";
import {
  BRAND_FROM,
  BRAND_TO,
  MARK_BARS,
  MARK_HEIGHT,
  MARK_WIDTH,
} from "@/lib/logo";

export function LogoMark({
  width = 37,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  const gradientId = useId();
  return (
    <svg
      width={width}
      height={(width * MARK_HEIGHT) / MARK_WIDTH}
      viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_FROM} />
          <stop offset="1" stopColor={BRAND_TO} />
        </linearGradient>
      </defs>
      {MARK_BARS.map((points) => (
        <polygon key={points} points={points} fill={`url(#${gradientId})`} />
      ))}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark width={30} />
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        ことばの方程式
      </span>
    </span>
  );
}
