import { getSize, type FormulaConfig } from "./types";
import { getTheme } from "./themes";

export const SYSTEM_STACK =
  '-apple-system, "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';

export const WORDMARK = "FORMULA STUDIO";

const NO_LINE_START = new Set(
  "、。，．・：；！？）】』」〉》”’ゝゞーぁぃぅぇぉっゃゅょゎヵヶァィゥェォッャュョヮ!?),.:;]}".split(
    "",
  ),
);

const NO_LINE_END = new Set("（【『「〈《“‘([{".split(""));

type Part = { text: string; color: string };
type Line = { parts: Part[]; width: number };

export type RenderOptions = {
  /** CSS font-family stack used for every glyph on the canvas. */
  fontStack: string;
  /** font-weight used for the title and the formula. */
  strongWeight: string;
  /** font-weight used for the note, credit and wordmark. */
  normalWeight: string;
};

export const SYSTEM_OPTIONS: RenderOptions = {
  fontStack: SYSTEM_STACK,
  strongWeight: "600",
  normalWeight: "400",
};

function font(weight: string, size: number, stack: string) {
  return `${weight} ${size}px ${stack}`;
}

/** Character-level wrapping with basic Japanese kinsoku handling. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let current = "";

  for (const char of Array.from(text)) {
    const candidate = current + char;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      let head = current;
      let carry = char;
      if (NO_LINE_START.has(char) || NO_LINE_END.has(head[head.length - 1])) {
        const lastChar = head[head.length - 1];
        if (head.length > 1) {
          head = head.slice(0, -1);
          carry = lastChar + char;
        }
      }
      lines.push(head);
      current = carry;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  const chars = Array.from(text);
  return (
    chars.reduce((acc, char) => acc + ctx.measureText(char).width, 0) +
    tracking * Math.max(0, chars.length - 1)
  );
}

/** ctx.letterSpacing is not supported in Safari/Firefox, so tracking is drawn manually. */
function fillTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cursor = x;
  for (const char of Array.from(text)) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + tracking;
  }
}

function groupWidth(ctx: CanvasRenderingContext2D, group: Part[], gap: number): number {
  return group.reduce(
    (acc, part, index) => acc + ctx.measureText(part.text).width + (index > 0 ? gap : 0),
    0,
  );
}

/**
 * Packs "operator + operand" groups into lines. A group is never split across
 * lines, so an operator can never dangle at the end of a line. Groups wider
 * than the line are broken into character chunks as a last resort.
 */
function packGroups(
  ctx: CanvasRenderingContext2D,
  groups: Part[][],
  maxWidth: number,
  gap: number,
): Line[] {
  const fitting: Part[][] = [];
  for (const group of groups) {
    if (groupWidth(ctx, group, gap) <= maxWidth) {
      fitting.push(group);
      continue;
    }
    const [head, ...rest] = group;
    const operand = rest.length > 0 ? rest[rest.length - 1] : head;
    const operator = rest.length > 0 ? head : null;
    const operatorWidth = operator ? ctx.measureText(operator.text).width + gap : 0;
    const chunks = wrapText(ctx, operand.text, maxWidth - operatorWidth);
    chunks.forEach((chunk, index) => {
      const parts: Part[] = [];
      if (operator && index === 0) parts.push(operator);
      parts.push({ ...operand, text: chunk });
      fitting.push(parts);
    });
  }

  const lines: Line[] = [];
  let currentParts: Part[] = [];
  let currentWidth = 0;

  for (const group of fitting) {
    const width = groupWidth(ctx, group, gap);
    const additional = currentParts.length === 0 ? width : gap + width;
    if (currentParts.length > 0 && currentWidth + additional > maxWidth) {
      lines.push({ parts: currentParts, width: currentWidth });
      currentParts = [...group];
      currentWidth = width;
    } else {
      currentParts.push(...group);
      currentWidth += additional;
    }
  }

  if (currentParts.length > 0) lines.push({ parts: currentParts, width: currentWidth });
  return lines;
}

type Block =
  | {
      kind: "text";
      lines: string[];
      size: number;
      weight: string;
      color: string;
      lineHeight: number;
    }
  | { kind: "rule"; width: number; color: string; lineHeight: number }
  | { kind: "formula"; lines: Line[]; size: number; gap: number; lineHeight: number };

function blockHeight(block: Block): number {
  return block.kind === "rule" ? block.lineHeight : block.lines.length * block.lineHeight;
}

function buildBlocks(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  options: RenderOptions,
  contentWidth: number,
  unit: number,
  baseUnit: number,
): { blocks: Block[]; height: number } {
  const theme = getTheme(config.themeId);
  const { fontStack, strongWeight, normalWeight } = options;
  const blocks: Block[] = [];

  const titleSize = 52 * unit;
  ctx.font = font(strongWeight, titleSize, fontStack);
  blocks.push({
    kind: "text",
    lines: wrapText(ctx, config.resultText || "成果", contentWidth),
    size: titleSize,
    weight: strongWeight,
    color: theme.title,
    lineHeight: titleSize * 1.34,
  });

  blocks.push({
    kind: "rule",
    width: Math.min(contentWidth * 0.12, 64 * baseUnit),
    color: theme.equals,
    lineHeight: 46 * unit,
  });

  const formulaSize = 44 * unit;
  ctx.font = font(strongWeight, formulaSize, fontStack);
  const groups: Part[][] = config.elements.map((element, index) => {
    const operand: Part = { text: element.text || "———", color: theme.element };
    if (index === 0) return [operand];
    return [{ text: element.op || "×", color: theme.operator }, operand];
  });
  const gap = formulaSize * 0.38;
  blocks.push({
    kind: "formula",
    lines: packGroups(ctx, groups, contentWidth, gap),
    size: formulaSize,
    gap,
    lineHeight: formulaSize * 1.46,
  });

  if (config.subNote) {
    const noteSize = Math.max(19 * baseUnit, 19 * unit);
    ctx.font = font(normalWeight, noteSize, fontStack);
    blocks.push({
      kind: "text",
      lines: wrapText(ctx, config.subNote, contentWidth * 0.92),
      size: noteSize,
      weight: normalWeight,
      color: theme.note,
      lineHeight: noteSize * 1.7,
    });
  }

  const gaps = (blocks.length - 1) * 16 * unit;
  const height = blocks.reduce((acc, block) => acc + blockHeight(block), 0) + gaps;
  return { blocks, height };
}

export function creditText(config: FormulaConfig): string {
  if (!config.author) return "";
  return config.showCopyright
    ? `© ${new Date().getFullYear()} ${config.author}`
    : config.author;
}

export function drawFormula(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  width: number,
  height: number,
  options: RenderOptions = SYSTEM_OPTIONS,
) {
  const theme = getTheme(config.themeId);
  const { fontStack, normalWeight } = options;
  const base = Math.min(width / 1200, height / 675, width / 900);

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  const inset = Math.round(Math.min(width, height) * 0.05);
  ctx.strokeStyle = theme.frame;
  ctx.lineWidth = Math.max(1, base);
  ctx.strokeRect(inset + 0.5, inset + 0.5, width - inset * 2 - 1, height - inset * 2 - 1);

  const marginX = Math.round(width * 0.11);
  const contentWidth = width - marginX * 2;
  const edge = Math.round(Math.min(width, height) * 0.055);
  const headerY = inset + edge;
  const footerY = height - inset - edge;

  ctx.textBaseline = "middle";
  if (config.showWatermark) {
    ctx.textAlign = "left";
    ctx.fillStyle = theme.brand;
    ctx.font = font(normalWeight, 12 * base, fontStack);
    fillTracked(ctx, WORDMARK, marginX, headerY, 2.6 * base);
  }

  const availableTop = headerY + 34 * base;
  const availableBottom = footerY - 34 * base;
  const availableHeight = availableBottom - availableTop;

  let unit = base;
  let layout = buildBlocks(ctx, config, options, contentWidth, unit, base);
  while (layout.height > availableHeight && unit > base * 0.22) {
    unit -= base * 0.02;
    layout = buildBlocks(ctx, config, options, contentWidth, unit, base);
  }
  // Tall formats (1:1, 4:5, 9:16) leave a lot of vertical room; scale the block
  // up so the composition keeps the same optical weight as the 16:9 output.
  const ratio = height / width;
  const maxUnit = base * (ratio >= 1.6 ? 2.4 : ratio >= 1.25 ? 1.9 : ratio >= 0.95 ? 1.6 : 1);
  while (unit < maxUnit) {
    const next = buildBlocks(ctx, config, options, contentWidth, unit + base * 0.02, base);
    if (next.height > availableHeight * 0.72) break;
    unit += base * 0.02;
    layout = next;
  }

  let y = availableTop + Math.max(0, (availableHeight - layout.height) / 2);
  const blockGap = 16 * unit;

  layout.blocks.forEach((block, index) => {
    if (index > 0) y += blockGap;

    if (block.kind === "rule") {
      const lineY = Math.round(y + block.lineHeight / 2) + 0.5;
      ctx.strokeStyle = block.color;
      ctx.lineWidth = Math.max(1, 1.4 * base);
      ctx.beginPath();
      ctx.moveTo((width - block.width) / 2, lineY);
      ctx.lineTo((width + block.width) / 2, lineY);
      ctx.stroke();
      y += block.lineHeight;
      return;
    }

    if (block.kind === "text") {
      ctx.font = font(block.weight, block.size, fontStack);
      ctx.fillStyle = block.color;
      ctx.textAlign = "center";
      block.lines.forEach((line) => {
        ctx.fillText(line, width / 2, y + block.lineHeight / 2);
        y += block.lineHeight;
      });
      return;
    }

    ctx.font = font(options.strongWeight, block.size, fontStack);
    ctx.textAlign = "left";
    block.lines.forEach((line) => {
      let x = (width - line.width) / 2;
      line.parts.forEach((part, partIndex) => {
        if (partIndex > 0) x += block.gap;
        ctx.fillStyle = part.color;
        ctx.fillText(part.text, x, y + block.lineHeight / 2);
        x += ctx.measureText(part.text).width;
      });
      y += block.lineHeight;
    });
  });

  const credit = creditText(config);
  if (credit) {
    const creditSize = 15 * base;
    const tracking = 1.2 * base;
    ctx.font = font(normalWeight, creditSize, fontStack);
    ctx.fillStyle = theme.author;
    ctx.textAlign = "left";
    const [firstLine] = wrapText(ctx, credit, contentWidth);
    const text = firstLine ?? credit;
    fillTracked(ctx, text, width - marginX - trackedWidth(ctx, text, tracking), footerY, tracking);
  }
}

export function renderToBlob(
  config: FormulaConfig,
  options: RenderOptions = SYSTEM_OPTIONS,
  scale = 2,
): Promise<Blob | null> {
  const size = getSize(config.sizeId);
  const canvas = document.createElement("canvas");
  canvas.width = size.width * scale;
  canvas.height = size.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  drawFormula(ctx, config, canvas.width, canvas.height, options);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
