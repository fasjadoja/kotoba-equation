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

/** Gold lockup printed for supporters, in place of the brand gradient. */
export function supporterGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): CanvasGradient {
  return markGradient(ctx, x, y, width, height, "#E9CD7E", "#8C6A12");
}

export const SUPPORTER_INK = "#A98220";

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
