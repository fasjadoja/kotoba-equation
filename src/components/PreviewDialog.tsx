"use client";

import { useEffect, useState } from "react";
import { CloseIcon, CopyIcon, SaveIcon, ZoomInIcon, ZoomOutIcon } from "./icons";

const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3];

type Props = {
  src: string;
  width: number;
  height: number;
  sizeLabel: string;
  canCopy: boolean;
  saveLabel: string;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
};

/** Full-screen look at the exported image, at fit or at real pixel size. */
export default function PreviewDialog({
  src,
  width,
  height,
  sizeLabel,
  canCopy,
  saveLabel,
  onCopy,
  onDownload,
  onClose,
}: Props) {
  // null keeps the image fitted to the window; a number is a fixed pixel ratio.
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const step = (direction: 1 | -1) => {
    const current = zoom ?? 1;
    const index = ZOOMS.findIndex((value) => value >= current - 0.001);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, index + direction))];
    setZoom(next);
  };

  const controlClass =
    "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/25 px-2.5 py-1.5 text-[12px] font-medium text-white/90 transition hover:border-white/60 hover:text-white";
  const closeClass =
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-fg shadow-lg transition hover:bg-white/90";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="プレビューを拡大"
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="px-3 py-2.5 sm:px-5"
        onClick={(event) => event.stopPropagation()}
      >
        {/* The close button keeps its own row so the zoom controls can never
            push it out of reach on a narrow screen. */}
        <div className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/70">
            {sizeLabel}・{width} × {height}px
            {zoom !== null && `（${Math.round(zoom * 100)}%）`}
          </span>
          <button onClick={onClose} className={closeClass}>
            <CloseIcon size={15} />
            閉じる
          </button>
        </div>
        <div className="scroll-row mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
          <button onClick={() => step(-1)} aria-label="縮小" className={controlClass}>
            <ZoomOutIcon size={14} />
          </button>
          <button onClick={() => step(1)} aria-label="拡大" className={controlClass}>
            <ZoomInIcon size={14} />
          </button>
          <button onClick={() => setZoom(null)} className={controlClass}>
            全体
          </button>
          <button onClick={() => setZoom(1)} className={controlClass}>
            実寸
          </button>
          {canCopy && (
            <button onClick={onCopy} className={controlClass}>
              <CopyIcon size={14} />
              コピー
            </button>
          )}
          <button onClick={onDownload} className={controlClass}>
            <SaveIcon size={14} />
            {saveLabel}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 ${zoom === null ? "flex items-center justify-center overflow-hidden" : "overflow-auto"} p-3 sm:p-6`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="生成された画像の拡大表示"
          onClick={(event) => {
            event.stopPropagation();
            setZoom(zoom === null ? 1 : null);
          }}
          style={
            zoom === null
              ? undefined
              : { width: width * zoom, maxWidth: "none", height: "auto" }
          }
          className={`mx-auto rounded-lg shadow-2xl ${
            zoom === null
              ? "max-h-full w-auto max-w-full cursor-zoom-in object-contain"
              : "cursor-zoom-out"
          }`}
        />
      </div>

      <div
        className="px-3 pb-4 pt-1 text-center sm:pb-5"
        onClick={(event) => event.stopPropagation()}
      >
        <button onClick={onClose} className={`${closeClass} w-full sm:w-auto`}>
          <CloseIcon size={15} />
          閉じて編集に戻る
        </button>
        <p className="mt-2 text-[11px] text-white/50">
          画像をタップで実寸／全体を切り替え。Esc または背景をタップしても閉じられます。
        </p>
      </div>
    </div>
  );
}
