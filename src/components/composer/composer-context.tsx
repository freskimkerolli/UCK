"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ComposerPanel = "PHOTO" | "VIDEO" | "DOCUMENT" | "HISTORICAL" | "LOCATION" | "HASHTAG" | null;

interface ComposerState {
  isOpen: boolean;
  defaultCommunityId?: string;
  defaultPanel?: ComposerPanel;
  open: (opts?: { communityId?: string; panel?: ComposerPanel }) => void;
  close: () => void;
}

const ComposerContext = createContext<ComposerState | null>(null);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultCommunityId, setDefaultCommunityId] = useState<string | undefined>(undefined);
  const [defaultPanel, setDefaultPanel] = useState<ComposerPanel>(null);

  const open = useCallback((opts?: { communityId?: string; panel?: ComposerPanel }) => {
    setDefaultCommunityId(opts?.communityId);
    setDefaultPanel(opts?.panel ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, defaultCommunityId, defaultPanel, open, close }),
    [isOpen, defaultCommunityId, defaultPanel, open, close],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer() {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("useComposer must be used within ComposerProvider");
  return ctx;
}
