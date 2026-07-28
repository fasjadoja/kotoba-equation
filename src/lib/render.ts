import {
  CLOSE_BRACKET,
  OPEN_BRACKET,
  TEXT_SCALE,
  getSize,
  type FormulaConfig,
  type FormulaElement,
} from "./types";
import { getTheme } from "./themes";
import {
  MARK_ASPECT,
  SUPPORTER_INK,
  drawLogoMark,
  supporterGradient,
} from "./logo";

export const SYSTEM_STACK =
  '-apple-system, "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';

export const WORDMARK = "ことばの方程式";

const NO_LINE_START = new Set(
  "、。，．・：；！？）】』」〉》”’ゝゞーぁぃぅぇぉっゃゅょゎヵヶァィゥェォッャュョヮ!?),.:;]}".split(
    "",
  ),
);

const NO_LINE_END = new Set("（【『「〈《“‘([{".split(""));

/** `gap` is the space in front of the part, as a multiple of the base gap. */
type Part = { text: string; color: string; gap: number };
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Smallest formula size, relative to the canvas, that is still worth keeping on
 * one line. Below it a tall canvas would show a thin ribbon of tiny text, so
 * the stacked layout wins instead.
 */
const MIN_INLINE_RATIO = 0.06;

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
    (acc, part, index) =>
      acc + ctx.measureText(part.text).width + (index > 0 ? gap * part.gap : 0),
    0,
  );
}

/** Space in front of a group when it follows another group on the same line. */
function leadingGap(group: Part[]): number {
  return group.length > 0 ? group[0].gap : 1;
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
): { lines: Line[]; broken: boolean } {
  const fitting: Part[][] = [];
  let broken = false;
  for (const group of groups) {
    if (groupWidth(ctx, group, gap) <= maxWidth) {
      fitting.push(group);
      continue;
    }
    broken = true;
    const [head, ...rest] = group;
    const operand = rest.length > 0 ? rest[rest.length - 1] : head;
    const operator = rest.length > 0 ? head : null;
    const operatorWidth = operator
      ? ctx.measureText(operator.text).width + gap * operand.gap
      : 0;
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
    const additional =
      currentParts.length === 0 ? width : gap * leadingGap(group) + width;
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
  return { lines, broken };
}

type Block =
  | {
      kind: "text";
      lines: string[];
      size: number;
      weight: string;
      color: string;
      lineHeight: number;
      /** Captions may re-wrap freely; the formula may not. */
      soft?: boolean;
    }
  | { kind: "formula"; lines: Line[]; size: number; gap: number; lineHeight: number };

function blockHeight(block: Block): number {
  return block.lines.length * block.lineHeight;
}

function contentLength(config: FormulaConfig): number {
  return Array.from(
    config.resultText + config.elements.map((element) => element.text).join(""),
  ).length;
}

/**
 * Brackets sit tight against the term they belong to, every other operator
 * keeps a full gap on both sides.
 */
function elementParts(
  element: FormulaElement,
  index: number,
  colors: { element: string; operator: string },
): Part[] {
  const op = index === 0 ? element.op : element.op || "×";
  const text = element.text.trim();
  if (!op) return [{ text: text || "———", color: colors.element, gap: 1 }];

  const open = op === OPEN_BRACKET;
  const close = op === CLOSE_BRACKET;
  const parts: Part[] = [
    {
      text: op,
      color: open || close ? colors.element : colors.operator,
      gap: close ? 0 : 1,
    },
  ];
  if (text) parts.push({ text, color: colors.element, gap: open ? 0 : 1 });
  return parts;
}

function inlineGroups(config: FormulaConfig): Part[][] {
  const theme = getTheme(config.themeId);
  const colors = { element: theme.element, operator: theme.operator };
  return [
    [{ text: config.resultText || "成果", color: theme.title, gap: 1 }],
    ...config.elements.map((element, index) => {
      const parts = elementParts(element, index, colors);
      if (index > 0) return parts;
      return [
        { text: config.relation || "＝", color: theme.operator, gap: 1 },
        ...parts,
      ];
    }),
  ];
}

/**
 * A formula on one straight line always looks better, so "auto" only stacks
 * when the whole expression cannot fit on a single line at a readable size.
 */
export function resolveInline(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  options: RenderOptions,
  contentWidth: number,
  unit: number,
): boolean {
  if (config.layoutId === "inline") return true;
  if (config.layoutId === "stack") return false;
  const size = 46 * unit;
  ctx.font = font(options.strongWeight, size, options.fontStack);
  const packed = packGroups(ctx, inlineGroups(config), contentWidth, size * 0.34);
  return packed.lines.length === 1 && !packed.broken;
}

function buildBlocks(
  ctx: CanvasRenderingContext2D,
  config: FormulaConfig,
  options: RenderOptions,
  contentWidth: number,
  unit: number,
  baseUnit: number,
  inline: boolean,
): { blocks: Block[]; height: number; broken: boolean } {
  const theme = getTheme(config.themeId);
  const { fontStack, strongWeight, normalWeight } = options;
  const blocks: Block[] = [];
  let broken = false;

  const relation = config.relation || "＝";
  const result = config.resultText || "成果";
  const elementGroups = (): Part[][] =>
    config.elements.map((element, index) =>
      elementParts(element, index, { element: theme.element, operator: theme.operator }),
    );

  if (inline) {
    const inlineSize = 46 * unit;
    ctx.font = font(strongWeight, inlineSize, fontStack);
    const gap = inlineSize * 0.34;
    const packed = packGroups(ctx, inlineGroups(config), contentWidth, gap);
    broken = broken || packed.broken;
    blocks.push({
      kind: "formula",
      lines: packed.lines,
      size: inlineSize,
      gap,
      lineHeight: inlineSize * 1.42,
    });
  } else {
    const titleSize = 52 * unit;
    ctx.font = font(strongWeight, titleSize, fontStack);
    blocks.push({
      kind: "text",
      lines: wrapText(ctx, result, contentWidth),
      size: titleSize,
      weight: strongWeight,
      color: theme.title,
      lineHeight: titleSize * 1.34,
    });

    const relationSize = 34 * unit;
    blocks.push({
      kind: "text",
      lines: [relation],
      size: relationSize,
      weight: normalWeight,
      color: theme.operator,
      lineHeight: relationSize * 1.5,
    });

    const formulaSize = 44 * unit;
    ctx.font = font(strongWeight, formulaSize, fontStack);
    const gap = formulaSize * 0.38;
    const packed = packGroups(ctx, elementGroups(), contentWidth, gap);
    broken = broken || packed.broken;
    blocks.push({
      kind: "formula",
      lines: packed.lines,
      size: formulaSize,
      gap,
      lineHeight: formulaSize * 1.46,
    });
  }

  if (config.subNote) {
    // Long notes (up to 140 characters) are set smaller so they stay a caption
    // instead of competing with the formula.
    const length = Array.from(config.subNote).length;
    const noteScale = length <= 56 ? 19 : length <= 100 ? 16.5 : 14.5;
    const noteSize = Math.max(noteScale * baseUnit, noteScale * unit);
    ctx.font = font(normalWeight, noteSize, fontStack);
    blocks.push({
      kind: "text",
      lines: wrapText(ctx, config.subNote, contentWidth * 0.92),
      size: noteSize,
      weight: normalWeight,
      color: theme.note,
      soft: true,
      lineHeight: noteSize * (length <= 56 ? 1.7 : 1.55),
    });
  }

  const gaps = (blocks.length - 1) * 16 * unit;
  const height = blocks.reduce((acc, block) => acc + blockHeight(block), 0) + gaps;
  return { blocks, height, broken };
}

/** Faint dot grid inside the frame: the print-like texture of the brand. */
function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  color: string,
  inset: number,
  width: number,
  height: number,
  base: number,
) {
  const step = 22 * base;
  const radius = Math.max(0.8, 1.1 * base);
  ctx.fillStyle = color;
  for (let y = inset + step; y < height - inset; y += step) {
    for (let x = inset + step; x < width - inset; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Normalises the free-form hashtag field into a single "#a #b" line. */
export function hashtagText(config: FormulaConfig): string {
  return config.hashtags
    .split(/[\s、,]+/)
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") || tag.startsWith("＃") ? tag : `#${tag}`))
    .join(" ");
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
  drawDotGrid(ctx, theme.grid, inset, width, height, base);
  ctx.strokeStyle = theme.frame;
  ctx.lineWidth = Math.max(1, base);
  ctx.strokeRect(inset + 0.5, inset + 0.5, width - inset * 2 - 1, height - inset * 2 - 1);

  const marginRatio = clamp(0.11 * (config.marginScale || 1), 0.05, 0.2);
  const marginX = Math.round(width * marginRatio);
  const contentWidth = width - marginX * 2;
  const edge = Math.round(Math.min(width, height) * 0.055);
  const headerY = inset + edge;
  const footerY = height - inset - edge;

  ctx.textBaseline = "middle";
  if (config.showWatermark) {
    const markWidth = 30 * base;
    const markHeight = markWidth / MARK_ASPECT;
    const markY = headerY - markHeight / 2;
    const premium = config.premiumLogo;
    drawLogoMark(
      ctx,
      marginX,
      markY,
      markWidth,
      premium
        ? supporterGradient(ctx, marginX, markY, markWidth, markHeight)
        : undefined,
    );
    ctx.textAlign = "left";
    ctx.fillStyle = premium ? SUPPORTER_INK : theme.brand;
    ctx.font = font(normalWeight, 13 * base, fontStack);
    const wordX = marginX + markWidth + 9 * base;
    fillTracked(ctx, WORDMARK, wordX, headerY, 1.2 * base);
    if (premium) {
      const wordWidth = trackedWidth(ctx, WORDMARK, 1.2 * base);
      ctx.font = font(normalWeight, 9.5 * base, fontStack);
      fillTracked(
        ctx,
        "✦ SUPPORTER",
        wordX + wordWidth + 9 * base,
        headerY,
        1.6 * base,
      );
    }
  }

  const availableTop = headerY + 34 * base;
  const availableBottom = footerY - 34 * base;
  const availableHeight = availableBottom - availableTop;

  // Single line first: "auto" only stacks when one line would become too small.
  const inlineFloor = (MIN_INLINE_RATIO * Math.sqrt(width * height)) / 46;
  const inline = resolveInline(ctx, config, options, contentWidth, inlineFloor);
  const scale = clamp(config.textScale || 1, TEXT_SCALE.min, TEXT_SCALE.max);
  const build = (value: number) =>
    buildBlocks(ctx, config, options, contentWidth, value, base, inline);

  let unit = base * scale;
  let layout = build(unit);
  // Only the formula itself must stay on one line; the caption may wrap.
  const wraps = (candidate: typeof layout) =>
    inline &&
    candidate.blocks.some((block) => block.kind === "formula" && block.lines.length > 1);
  while (
    (layout.height > availableHeight || (wraps(layout) && unit > inlineFloor)) &&
    unit > base * 0.22
  ) {
    unit -= base * 0.02;
    layout = build(unit);
  }
  // Tall formats (1:1, 4:5, 9:16) leave a lot of vertical room; scale the block
  // up so the composition keeps the same optical weight as the 16:9 output.
  const ratio = height / width;
  // A handful of characters on one line would otherwise float in a large empty
  // canvas, so short inline formulas are allowed to grow further.
  const compact = inline && contentLength(config) <= 10 ? 1.8 : 1;
  const maxUnit =
    base *
    (ratio >= 1.6 ? 2.4 : ratio >= 1.25 ? 1.9 : ratio >= 0.95 ? 1.6 : 1) *
    compact *
    scale;
  while (unit < maxUnit) {
    const next = build(unit + base * 0.02);
    if (next.height > availableHeight * 0.72) break;
    // Growing may wrap between operands, but never inside one.
    if (next.broken && !layout.broken) break;
    if (wraps(next) && !wraps(layout)) break;
    unit += base * 0.02;
    layout = next;
  }

  let y = availableTop + Math.max(0, (availableHeight - layout.height) / 2);
  const blockGap = 16 * unit;

  layout.blocks.forEach((block, index) => {
    if (index > 0) y += blockGap;

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
        if (partIndex > 0) x += block.gap * part.gap;
        ctx.fillStyle = part.color;
        ctx.fillText(part.text, x, y + block.lineHeight / 2);
        x += ctx.measureText(part.text).width;
      });
      y += block.lineHeight;
    });
  });

  const footerSize = 15 * base;
  const tracking = 1.2 * base;
  ctx.font = font(normalWeight, footerSize, fontStack);
  ctx.textAlign = "left";

  const credit = creditText(config);
  let creditWidth = 0;
  if (credit) {
    // A long credit (up to 50 characters) is set smaller instead of being cut
    // off, so it never runs into the hashtags on the other side.
    const room = contentWidth * 0.58;
    let creditSize = footerSize;
    let creditTracking = tracking;
    while (
      trackedWidth(ctx, credit, creditTracking) > room &&
      creditSize > footerSize * 0.62
    ) {
      creditSize -= 0.4 * base;
      creditTracking = tracking * 0.6;
      ctx.font = font(normalWeight, creditSize, fontStack);
    }
    const [firstLine] = wrapText(ctx, credit, room);
    const text = firstLine ?? credit;
    creditWidth = trackedWidth(ctx, text, creditTracking);
    ctx.fillStyle = theme.author;
    fillTracked(ctx, text, width - marginX - creditWidth, footerY, creditTracking);
    ctx.font = font(normalWeight, footerSize, fontStack);
  }

  const hashtags = hashtagText(config);
  if (hashtags) {
    const room = contentWidth - (creditWidth > 0 ? creditWidth + 24 * base : 0);
    const [firstLine] = wrapText(ctx, hashtags, room);
    const text = firstLine ?? hashtags;
    ctx.fillStyle = theme.hashtag;
    fillTracked(ctx, text, marginX, footerY, tracking * 0.6);
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
