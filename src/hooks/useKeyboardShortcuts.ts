import { useEffect } from "react";
import type { ApiEntry } from "@/types/api";

interface UseKeyboardShortcutsOptions {
  selectedApi: ApiEntry | null;
  commandPaletteOpen: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  setActiveTab: (tab: string) => void;
  selectApi: (api: ApiEntry | null) => void;
  setDetailSubTab: (tab: string) => void;
  setCommandPaletteOpen: (updater: (prev: boolean) => boolean) => void;
  setKeyboardModalOpen: (open: boolean) => void;
}

// Global keyboard shortcut handler extracted from page.js. Per-surface
// overlays (e.g. the compare view's API search dropdown) own their own
// Escape handling locally rather than reaching back into this hook.
export function useKeyboardShortcuts({
  selectedApi,
  commandPaletteOpen,
  searchInputRef,
  setActiveTab,
  selectApi,
  setDetailSubTab,
  setCommandPaletteOpen,
  setKeyboardModalOpen,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input on "/"
      if (e.key === "/" && document.activeElement !== searchInputRef.current && !commandPaletteOpen) {
        e.preventDefault();
        setActiveTab("home");
        selectApi(null);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }

      // Open command palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // Open Compare on Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setActiveTab("compare");
        selectApi(null);
      }

      // Escape to close overlays
      if (e.key === "Escape") {
        setCommandPaletteOpen(() => false);
        setKeyboardModalOpen(false);
      }

      // Keyboard navigation shortcuts if not in inputs
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== "INPUT" && activeElement?.tagName !== "TEXTAREA") {
        if (e.key.toLowerCase() === "g" && selectedApi?.githubUrl) {
          window.open(selectedApi.githubUrl, "_blank");
        }
        if (e.key.toLowerCase() === "d") {
          if (selectedApi) {
            setDetailSubTab("docs");
          } else {
            setActiveTab("docs");
          }
        }
        if (e.key.toLowerCase() === "p" && selectedApi) {
          setDetailSubTab("playground");
        }
        if (e.key.toLowerCase() === "c") {
          setActiveTab("compare");
          selectApi(null);
        }
        if (e.key === "?") {
          setKeyboardModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedApi, commandPaletteOpen, selectApi, searchInputRef, setActiveTab, setDetailSubTab, setCommandPaletteOpen, setKeyboardModalOpen]);
}
