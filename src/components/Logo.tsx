import { MARK_GRID, MARK_PATHS } from "@/lib/logo";

export function LogoMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_GRID} ${MARK_GRID}`}
      className={className}
      aria-hidden
    >
      <rect
        width={MARK_GRID}
        height={MARK_GRID}
        rx={MARK_PATHS.radius}
        fill="currentColor"
      />
      {MARK_PATHS.bars.map((bar) => (
        <rect
          key={bar.y}
          x={bar.x}
          y={bar.y}
          width={MARK_PATHS.barWidth}
          height={MARK_PATHS.barHeight}
          rx={MARK_PATHS.barHeight / 2}
          className="fill-white"
        />
      ))}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={30} className="text-accent" />
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        ことばの方程式
      </span>
    </span>
  );
}
