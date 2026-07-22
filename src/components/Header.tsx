"use client";

interface HeaderProps {
  activeTab: string;
  hasSelectedApi: boolean;
  onLogoClick: () => void;
  onNavClick: (tab: string) => void;
  onOpenCommandPalette: () => void;
  onOpenKeyboardModal: () => void;
}

const NAV_ITEMS: Array<{ id: string; label: string }> = [
  { id: "home", label: "Search" },
  { id: "categories", label: "Categories" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "compare", label: "Compare" },
  { id: "docs", label: "Docs" },
];

export default function Header({
  activeTab,
  hasSelectedApi,
  onLogoClick,
  onNavClick,
  onOpenCommandPalette,
  onOpenKeyboardModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border px-6 h-14 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <div
          onClick={onLogoClick}
          className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-lg tracking-tight select-none text-white hover:text-zinc-300 transition-colors"
        >
          <span>apiPedia</span>
          <span className="text-accent font-sans">•</span>
        </div>

        <nav className="hidden md:flex space-x-6 text-sm">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              className={`hover:text-white transition-colors py-1 ${
                activeTab === item.id && !(item.id === "home" && hasSelectedApi)
                  ? "text-white font-medium"
                  : "text-zinc-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center space-x-2 bg-surface border border-border hover:border-accent/50 px-3 py-1.5 rounded-lg text-xs text-zinc-500 cursor-pointer select-none transition-all"
        >
          <span>Search console</span>
          <kbd className="bg-surface-2 text-zinc-400 px-1.5 py-0.5 rounded border border-border text-[10px]">⌘K</kbd>
        </div>

        <div
          onClick={onOpenKeyboardModal}
          className="text-zinc-500 hover:text-white cursor-pointer p-1 text-sm font-mono"
          title="Keyboard shortcuts"
        >
          [?]
        </div>

        <button className="bg-surface border border-border hover:border-zinc-500 hover:text-white text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
          Login
        </button>
      </div>
    </header>
  );
}
