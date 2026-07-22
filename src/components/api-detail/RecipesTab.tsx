"use client";

import type { ApiEntry } from "@/types/api";

interface RecipesTabProps {
  api: ApiEntry;
  onCopyText: (text: string, label: string) => void;
}

export default function RecipesTab({ api, onCopyText }: RecipesTabProps) {
  if (api.recipes.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-zinc-500 text-sm">
        No community recipes yet for {api.name}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {api.recipes.map((recipe, idx) => (
        <div key={idx} className="bg-surface border border-border rounded-xl p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
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
              className="bg-surface-2 border border-border hover:bg-border text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono"
            >
              [Copy Recipe]
            </button>
          </div>

          {/* Schematic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ASCII / SVG Architecture Diagrams */}
            <div className="bg-surface-2 border border-border rounded-lg p-5 font-mono text-[10px] text-zinc-400 overflow-auto whitespace-pre">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Integration Flow Architecture</div>
              {recipe.diagram}
            </div>

            {/* Source code block */}
            <div className="bg-surface-2 border border-border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>production-integration.js</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre select-all bg-background/40 flex-1">
                {recipe.code}
              </pre>
            </div>

          </div>

        </div>
      ))}
    </div>
  );
}
