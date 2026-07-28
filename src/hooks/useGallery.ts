"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GALLERY_LIMIT,
  fetchLatest,
  galleryEnabled,
  publish,
  subscribeToInserts,
  type GalleryItem,
} from "@/lib/gallery";
import type { FormulaConfig } from "@/lib/types";

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(galleryEnabled);

  useEffect(() => {
    if (!galleryEnabled) return;
    let active = true;
    void fetchLatest().then((latest) => {
      if (!active) return;
      setItems(latest);
      setLoading(false);
    });
    const unsubscribe = subscribeToInserts((item) => {
      setItems((previous) =>
        [item, ...previous.filter((existing) => existing.id !== item.id)].slice(
          0,
          GALLERY_LIMIT,
        ),
      );
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const share = useCallback(async (config: FormulaConfig) => {
    if (!galleryEnabled) return false;
    return publish(config);
  }, []);

  return { items, loading, enabled: galleryEnabled, share };
}
