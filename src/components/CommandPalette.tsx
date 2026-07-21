"use client";

import type { ApiEntry } from "@/types/api";

interface QuickNavCommand {
  label: string;
  target: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  apis: ApiEntry[];
  onSelectApi: (api: ApiEntry) => void;
  quickNavCommands: QuickNavCommand[];
}

export default function CommandPalette({
  open,
  query,
  onQueryChange,
  onClose,
  apis,
  onSelectApi,
  quickNavCommands,
}: CommandPaletteProps) {
  if (!open) return null;

  const matchedApis = apis.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-[#121417] border border-[#24272C] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">

        {/* Header / Input */}
        <div className="p-3 border-b border-[#24272C] flex items-center space-x-3">
          <span className="text-zinc-500">⌘</span>
          <input
            type="text"
            autoFocus
            className="flex-1 bg-transparent border-none text-xs text-white placeholder-zinc-500 outline-none"
            placeholder="Search APIs, command routes, or directories..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <span
            onClick={onClose}
            className="text-[10px] text-zinc-500 hover:text-white cursor-pointer font-mono"
          >
            [ESC]
          </span>
        </div>

        {/* Results body */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          <span className="text-[10px] text-zinc-500 font-mono pl-2 block my-1">APIs matched</span>
          {matchedApis.map((api) => (
            <div
              key={api.id}
              onClick={() => onSelectApi(api)}
              className="p-2.5 hover:bg-[#181B20] border border-transparent hover:border-[#24272C] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: api.logoColor }}></div>
                <span className="text-white font-semibold">{api.name}</span>
                <span className="text-zinc-500 text-[10px] font-mono">({api.category})</span>
              </div>
              <span className="text-[10px] text-zinc-500 group-hover:text-[#4F8CFF] font-mono">Open API intelligence ➔</span>
            </div>
          ))}

          <span className="text-[10px] text-zinc-500 font-mono pl-2 block my-2">Quick Navigation Shortcuts</span>
          {quickNavCommands.map((cmd) => (
            <div
              key={cmd.label}
              onClick={cmd.target}
              className="p-2.5 hover:bg-[#181B20] border border-transparent hover:border-[#24272C] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all text-zinc-300 hover:text-white"
            >
              <span>{cmd.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono">CMD route</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
