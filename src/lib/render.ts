import { getSize, type FormulaConfig } from "./types";
import { getTheme } from "./themes";

export const FONT_STACK =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, -apple-system, BlinkMacSystemFont, sans-serif';

export const WATERMARK_TEXT = "formula.studio";

const NO_LINE_START = new Set(
  "、。，．・：；！？）】』」〉》”’ゝゞーぁぃぅぇぉっゃゅょゎヵヶァィゥェォッャュョヮ!?),.:;]}"
    .split(""),
);

const NO_LINE_END = new Set("（【『「〈《“‘([{".split(""));

type Part = { text: string; color: string; isOp: boolean };
type Line = { parts: Part[]; width: number };

function font(weight: string, size: number) {
  return `${weight} ${size}px ${FONT_STACK}`;
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

function groupWidth(ctx: CanvasRenderingContext2D, group: Part[], gap: number): number {
  return group.reduce(
    (acc, part, index) => acc + ctx.measureText(part.text).width + (index > 0 ? gap : 0),
    0,
  );
}

/**
 * Packs "operator + operand" groups into lines. A group is never split across
 * lines, so an operator can never dangle at the end of a line. Groups that are
 * wider than the line are broken into character chunks as a last resort.
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
  | { kind: "text"; lines: string[]; size: number; weight: string; color: string; lineHeight: number }
  | { kind: "formula"; lines: Line[]; size: number; gap: number; lineHeight: number };

function blockHeight(block: Block): number {
  return block.lines.length * block.lineHeight;
}

function buildBlocks(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  contentWidth: number,
  unit: number,
  baseUnit: number,
): { blocks: Block[]; height: number } {
  const theme = getTheme(config.themeId);
  const blocks: Block[] = [];

  const titleSize = 54 * unit;
  ctx.font = font("bold", titleSize);
  const titleLines = wrapText(ctx, config.resultText || "成果", contentWidth);
  blocks.push({
    kind: "text",
    lines: titleLines,
    size: titleSize,
    weight: "bold",
    color: theme.title,
    lineHeight: titleSize * 1.32,
  });

  const equalsSize = Math.max(26 * baseUnit, 32 * unit);
  ctx.font = font("bold", equalsSize);
  blocks.push({
    kind: "text",
    lines: ["＝"],
    size: equalsSize,
    weight: "bold",
    color: theme.equals,
    lineHeight: equalsSize * 2.1,
  });

  const formulaSize = 46 * unit;
  ctx.font = font("bold", formulaSize);
  const groups: Part[][] = config.elements.map((element, index) => {
    const operand: Part = { text: element.text || "???", color: theme.element, isOp: false };
    if (index === 0) return [operand];
    return [{ text: element.op || "×", color: theme.operator, isOp: true }, operand];
  });
  const gap = formulaSize * 0.34;
  blocks.push({
    kind: "formula",
    lines: packGroups(ctx, groups, contentWidth, gap),
    size: formulaSize,
    gap,
    lineHeight: formulaSize * 1.42,
  });

  if (config.subNote) {
    const noteSize = Math.max(17 * baseUnit, 19 * unit);
    ctx.font = font("500", noteSize);
    blocks.push({
      kind: "text",
      lines: wrapText(ctx, config.subNote, contentWidth),
      size: noteSize,
      weight: "500",
      color: theme.note,
      lineHeight: noteSize * 1.6,
    });
  }

  const gaps = (blocks.length - 1) * 18 * unit;
  const height = blocks.reduce((acc, block) => acc + blockHeight(block), 0) + gaps;
  return { blocks, height };
}

export function drawFormula(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  width: number,
  height: number,
) {
  const theme = getTheme(config.themeId);
  const base = Math.min(width / 1200, height / 675);

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  const inset = Math.round(Math.min(width, height) * 0.045);
  ctx.strokeStyle = theme.frame;
  ctx.lineWidth = Math.max(1, base);
  ctx.strokeRect(inset + 0.5, inset + 0.5, width - inset * 2 - 1, height - inset * 2 - 1);

  const marginX = Math.round(width * 0.1);
  const contentWidth = width - marginX * 2;
  const headerY = inset + Math.round(Math.min(width, height) * 0.055);
  const footerY = height - inset - Math.round(Math.min(width, height) * 0.055);

  ctx.textBaseline = "middle";
  if (config.showWatermark) {
    ctx.textAlign = "left";
    ctx.fillStyle = theme.brand;
    ctx.font = font("600", 15 * base);
    ctx.fillText(WATERMARK_TEXT, marginX, headerY);
  }

  const availableTop = headerY + 30 * base;
  const availableBottom = footerY - 30 * base;
  const availableHeight = availableBottom - availableTop;

  let unit = base;
  let layout = buildBlocks(ctx, config, contentWidth, unit, base);
  while (layout.height > availableHeight && unit > base * 0.22) {
    unit -= base * 0.02;
    layout = buildBlocks(ctx, config, contentWidth, unit, base);
  }

  let y = availableTop + Math.max(0, (availableHeight - layout.height) / 2);
  const blockGap = 18 * unit;

  layout.blocks.forEach((block, index) => {
    if (index > 0) y += blockGap;
    if (block.kind === "text") {
      ctx.font = font(block.weight, block.size);
      ctx.fillStyle = block.color;
      ctx.textAlign = "center";
      block.lines.forEach((line) => {
        ctx.fillText(line, width / 2, y + block.lineHeight / 2);
        y += block.lineHeight;
      });
      return;
    }

    ctx.font = font("bold", block.size);
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

  if (config.author) {
    ctx.textAlign = "right";
    ctx.font = font("500", 16 * base);
    ctx.fillStyle = theme.author;
    const authorLines = wrapText(ctx, config.author, contentWidth);
    ctx.fillText(authorLines[0] ?? "", width - marginX, footerY);
  }
}

export function renderToBlob(config: FormulaConfig, scale = 2): Promise<Blob | null> {
  const size = getSize(config.sizeId);
  const canvas = document.createElement("canvas");
  canvas.width = size.width * scale;
  canvas.height = size.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  drawFormula(ctx, config, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
