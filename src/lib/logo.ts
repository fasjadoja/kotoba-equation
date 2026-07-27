/**
 * The brand mark: two offset bars inside a rounded square. The bars read as an
 * equals sign that has been nudged out of alignment — an equation made of words
 * rather than numbers. Geometry is defined on a 32×32 grid and shared by the
 * SVG component and the canvas renderer so both stay identical.
 */
export const MARK_GRID = 32;

const MARK_RADIUS = 9;
const BAR_HEIGHT = 3.6;
const BAR_WIDTH = 13;
const TOP_BAR = { x: 6.5, y: 11 };
const BOTTOM_BAR = { x: 12.5, y: 17.4 };

export const MARK_PATHS = {
  radius: MARK_RADIUS,
  barHeight: BAR_HEIGHT,
  barWidth: BAR_WIDTH,
  bars: [TOP_BAR, BOTTOM_BAR],
} as const;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

/** Gold lockup printed for supporters, in place of the flat accent fill. */
export function supporterGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, "#E9CD7E");
  gradient.addColorStop(0.45, "#C9A227");
  gradient.addColorStop(1, "#8C6A12");
  return gradient;
}

export const SUPPORTER_INK = "#A98220";

/** Draws the mark with its top-left corner at (x, y). */
export function drawLogoMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accent: string | CanvasGradient,
  onAccent: string,
) {
  const k = size / MARK_GRID;
  ctx.fillStyle = accent;
  roundedRect(ctx, x, y, size, size, MARK_RADIUS * k);
  ctx.fillStyle = onAccent;
  for (const bar of MARK_PATHS.bars) {
    roundedRect(
      ctx,
      x + bar.x * k,
      y + bar.y * k,
      BAR_WIDTH * k,
      BAR_HEIGHT * k,
      (BAR_HEIGHT / 2) * k,
    );
  }
}
