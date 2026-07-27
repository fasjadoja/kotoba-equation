import { ASPECTS, type FormulaConfig } from "./types";
import { getTheme } from "./themes";

export const FONT_STACK =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, -apple-system, BlinkMacSystemFont, sans-serif';

export const WATERMARK_TEXT = "Formula Studio";

type Part = { text: string; color: string };

function font(weight: string, size: number) {
  return `${weight} ${size}px ${FONT_STACK}`;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = "bold",
) {
  let size = initialSize;
  ctx.font = font(weight, size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = font(weight, size);
  }
  return size;
}

/**
 * Lays out the formula on one or more lines so long formulas stay readable.
 */
function layoutFormula(
  ctx: CanvasRenderingContext2D,
  parts: Part[],
  maxWidth: number,
  initialSize: number,
  minSize: number,
) {
  let size = initialSize;
  let lines: Part[][] = [];

  for (;;) {
    ctx.font = font("bold", size);
    lines = [[]];
    let lineWidth = 0;
    let fits = true;

    for (const part of parts) {
      const width = ctx.measureText(part.text).width;
      if (width > maxWidth) {
        fits = false;
        break;
      }
      if (lineWidth + width > maxWidth && lines[lines.length - 1].length > 0) {
        lines.push([part]);
        lineWidth = width;
      } else {
        lines[lines.length - 1].push(part);
        lineWidth += width;
      }
    }

    if (fits && lines.length <= 3) break;
    if (size <= minSize) break;
    size -= 2;
  }

  return { size, lines };
}

export function drawFormula(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  width: number,
  height: number,
) {
  const theme = getTheme(config.themeId);
  const s = Math.min(width / 1200, height / 675);

  if (theme.backgroundTo) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.background);
    gradient.addColorStop(1, theme.backgroundTo);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = theme.background;
  }
  ctx.fillRect(0, 0, width, height);

  const inset = Math.round(width * 0.027);
  ctx.strokeStyle = theme.frame;
  ctx.lineWidth = Math.max(2, 2 * s);
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  const badgeSize = 36 * s;
  const badgeX = inset * 2;
  const badgeY = height * 0.095 - badgeSize / 2;
  ctx.fillStyle = theme.badge;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 8 * s);
  ctx.fill();

  ctx.fillStyle = theme.badgeText;
  ctx.font = font("bold", 20 * s);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("×", badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  ctx.fillStyle = theme.brand;
  ctx.font = font("600", 15 * s);
  ctx.textAlign = "left";
  ctx.fillText("Formula Studio", badgeX + badgeSize + 12 * s, badgeY + badgeSize / 2);

  const contentWidth = width - inset * 4;

  const resultText = config.resultText || "成果";
  const titleSize = fitFontSize(ctx, resultText, contentWidth, 56 * s, 28 * s);
  ctx.font = font("bold", titleSize);
  ctx.fillStyle = theme.title;
  ctx.textAlign = "center";
  ctx.fillText(resultText, width / 2, height * 0.27);

  ctx.font = font("bold", 36 * s);
  ctx.fillStyle = theme.equals;
  ctx.fillText("＝", width / 2, height * 0.363);

  const parts: Part[] = [];
  config.elements.forEach((item, i) => {
    if (i > 0) {
      parts.push({ text: ` ${item.op} `, color: theme.operator });
    }
    const isLast = i === config.elements.length - 1 && config.elements.length > 1;
    parts.push({
      text: item.text || "???",
      color: isLast ? theme.highlight : theme.element,
    });
  });

  const { size: formulaSize, lines } = layoutFormula(ctx, parts, contentWidth, 48 * s, 22 * s);
  ctx.font = font("bold", formulaSize);
  const lineHeight = formulaSize * 1.35;
  const formulaCenterY = height * 0.533;
  const firstLineY = formulaCenterY - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, lineIndex) => {
    const lineWidth = line.reduce((acc, p) => acc + ctx.measureText(p.text).width, 0);
    let x = (width - lineWidth) / 2;
    const y = firstLineY + lineIndex * lineHeight;
    ctx.textAlign = "left";
    line.forEach((part) => {
      ctx.fillStyle = part.color;
      ctx.fillText(part.text, x, y);
      x += ctx.measureText(part.text).width;
    });
  });

  if (config.subNote) {
    ctx.textAlign = "center";
    const noteSize = fitFontSize(ctx, config.subNote, contentWidth, 20 * s, 13 * s, "500");
    ctx.font = font("500", noteSize);
    ctx.fillStyle = theme.note;
    ctx.fillText(config.subNote, width / 2, height * 0.711);
  }

  if (config.author) {
    ctx.textAlign = "right";
    ctx.font = font("500", 18 * s);
    ctx.fillStyle = theme.author;
    ctx.fillText(config.author, width - inset * 2, height * 0.881);
  }

  if (config.showWatermark) {
    ctx.textAlign = "left";
    ctx.font = font("600", 16 * s);
    ctx.fillStyle = theme.watermark;
    ctx.fillText(WATERMARK_TEXT, inset * 2, height * 0.881);
  }
}

export function getAspect(aspectId: FormulaConfig["aspectId"]) {
  return ASPECTS.find((a) => a.id === aspectId) ?? ASPECTS[0];
}

export function renderToBlob(
  config: FormulaConfig,
  scale: number,
): Promise<Blob | null> {
  const aspect = getAspect(config.aspectId);
  const canvas = document.createElement("canvas");
  canvas.width = aspect.width * scale;
  canvas.height = aspect.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  drawFormula(ctx, config, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
