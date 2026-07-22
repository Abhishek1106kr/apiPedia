"use client";

import type { ApiEntry } from "@/types/api";

interface RecipesTabProps {
  api: ApiEntry;
  onCopyText: (text: string, label: string) => void;
}

export default function RecipesTab({ api, onCopyText }: RecipesTabProps) {
  return (
    <div className="space-y-6">
      {api.recipes.map((recipe, idx) => (
        <div key={idx} className="bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#24272C] pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">{recipe.title}</h3>
              <div className="flex space-x-2 text-[10px] font-mono">
                <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{recipe.framework}</span>
                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">{recipe.duration} build</span>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">{recipe.difficulty} complexity</span>
              </div>
            </div>
            <button
              onClick={() => onCopyText(recipe.code, "Recipe Code")}
              className="bg-[#181B20] border border-[#24272C] hover:bg-[#24272C] text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono"
            >
              [Copy Recipe]
            </button>
          </div>

          {/* Schematic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ASCII / SVG Architecture Diagrams */}
            <div className="bg-[#181B20] border border-[#24272C] rounded-lg p-5 font-mono text-[10px] text-zinc-400 overflow-auto whitespace-pre">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Integration Flow Architecture</div>
              {recipe.diagram}
            </div>

            {/* Source code block */}
            <div className="bg-[#181B20] border border-[#24272C] rounded-lg overflow-hidden flex flex-col">
              <div className="bg-[#121417] border-b border-[#24272C] px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>production-integration.js</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre select-all bg-[#0B0D10]/40 flex-1">
                {recipe.code}
              </pre>
            </div>

          </div>

        </div>
      ))}
    </div>
  );
}
