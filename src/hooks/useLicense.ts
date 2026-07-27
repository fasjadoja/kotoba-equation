"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "formula-studio.license";

export type LicenseState = {
  isPro: boolean;
  licenseKey: string | null;
  checking: boolean;
};

async function verify(key: string): Promise<boolean> {
  try {
    const res = await fetch("/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return false;
    const data: { valid?: boolean } = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export function useLicense() {
  const [state, setState] = useState<LicenseState>({
    isPro: false,
    licenseKey: null,
    checking: true,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setState({ isPro: false, licenseKey: null, checking: false });
      return;
    }
    let cancelled = false;
    void verify(stored).then((valid) => {
      if (cancelled) return;
      if (!valid) window.localStorage.removeItem(STORAGE_KEY);
      setState({ isPro: valid, licenseKey: valid ? stored : null, checking: false });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = useCallback(async (key: string): Promise<boolean> => {
    const valid = await verify(key);
    if (valid) {
      window.localStorage.setItem(STORAGE_KEY, key);
      setState({ isPro: true, licenseKey: key, checking: false });
    }
    return valid;
  }, []);

  const deactivate = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState({ isPro: false, licenseKey: null, checking: false });
  }, []);

  return { ...state, activate, deactivate };
}
