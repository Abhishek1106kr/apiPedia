"use client";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: "Press /", description: "Focus Search Field" },
  { keys: "Cmd + K", description: "Open Command Console" },
  { keys: "Press G", description: "Redirect to GitHub repo" },
  { keys: "Press D", description: "Open Endpoints Reference" },
  { keys: "Press P", description: "Navigate to playground sandbox" },
  { keys: "Press C", description: "Redirect to Comparison Matrix" },
  { keys: "Press ?", description: "Open Keyboard Shortcuts Panel" },
];

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Keyboard Shortcuts Console</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xs font-mono"
          >
            [Close]
          </button>
        </div>

        <div className="space-y-3.5 text-xs font-mono">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className="flex justify-between py-1 border-b border-border">
              <span className="text-zinc-500">{shortcut.keys}</span>
              <span className="text-white font-bold">{shortcut.description}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-surface-2 border border-border rounded-lg text-[10px] text-zinc-500 leading-relaxed font-mono">
          Designed for speed. Control the entire workspace flow directly from your home row keybindings.
        </div>
      </div>
    </div>
  );
}
