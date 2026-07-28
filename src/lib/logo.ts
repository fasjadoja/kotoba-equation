/**
 * The brand mark: two slanted bars that read as an italic equals sign — an
 * equation written with words rather than numbers. Geometry is defined on a
 * 37×12 grid and shared by the SVG component and the canvas renderer so both
 * stay identical.
 */
export const MARK_WIDTH = 37;
export const MARK_HEIGHT = 12;
export const MARK_ASPECT = MARK_WIDTH / MARK_HEIGHT;

const BAR_HEIGHT = 4.7;
const BAR_WIDTH = 28.2;
const BAR_SKEW = 3.4;
const TOP_BAR = { x: 8.8, y: 0 };
const BOTTOM_BAR = { x: 3.4, y: 7.3 };

export const BRAND_FROM = "#74B2FF";
export const BRAND_TO = "#8C65FF";
export const BRAND_INK = "#6D6BF2";

/** Corner points of one bar, clockwise from its top-left. */
function barPoints(bar: { x: number; y: number }) {
  return [
    [bar.x, bar.y],
    [bar.x + BAR_WIDTH, bar.y],
    [bar.x + BAR_WIDTH - BAR_SKEW, bar.y + BAR_HEIGHT],
    [bar.x - BAR_SKEW, bar.y + BAR_HEIGHT],
  ] as const;
}

export const MARK_BARS = [TOP_BAR, BOTTOM_BAR].map((bar) =>
  barPoints(bar)
    .map((point) => point.join(","))
    .join(" "),
);

function markGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  from: string,
  to: string,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  return gradient;
}

/**
 * Lockups unlocked by a donation. Each rank keeps the same geometry and only
 * changes the metal, so the mark still reads as the same brand.
 */
export const RANK_STYLES = {
  supporter: { from: "#E9CD7E", to: "#8C6A12", ink: "#A98220", badge: "✦ SUPPORTER" },
  premium: { from: "#FFE9A8", to: "#B8860B", ink: "#8C6A12", badge: "✦✦ PREMIUM" },
  elite: { from: "#F5F0FF", to: "#4B2E83", ink: "#4B2E83", badge: "✦✦✦ PATRON" },
} as const;

export type RankStyleId = keyof typeof RANK_STYLES;

export function rankGradient(
  ctx: CanvasRenderingContext2D,
  rank: RankStyleId,
  x: number,
  y: number,
  width: number,
  height: number,
): CanvasGradient {
  const style = RANK_STYLES[rank];
  return markGradient(ctx, x, y, width, height, style.from, style.to);
}

/** Draws the mark with its top-left corner at (x, y). */
export function drawLogoMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  fill?: string | CanvasGradient,
) {
  const k = width / MARK_WIDTH;
  ctx.fillStyle =
    fill ??
    markGradient(ctx, x, y, width, width / MARK_ASPECT, BRAND_FROM, BRAND_TO);
  for (const bar of [TOP_BAR, BOTTOM_BAR]) {
    ctx.beginPath();
    barPoints(bar).forEach(([px, py], index) => {
      const cx = x + px * k;
      const cy = y + py * k;
      if (index === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fill();
  }
}
