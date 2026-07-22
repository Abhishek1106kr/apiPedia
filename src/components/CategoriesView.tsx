"use client";

import type { ApiEntry } from "@/types/api";

interface CategoriesViewProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  filteredApis: ApiEntry[];
  onSelectApi: (api: ApiEntry) => void;
}

export default function CategoriesView({
  categories,
  selectedCategory,
  onSelectCategory,
  filteredApis,
  onSelectApi,
}: CategoriesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#24272C] pb-4">
        <h2 className="text-xl font-bold text-white">API Directories</h2>

        {/* Pill filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedCategory === cat
                  ? "bg-[#4F8CFF] text-white"
                  : "bg-[#121417] border border-[#24272C] text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredApis.map(api => (
          <div
            key={api.id}
            onClick={() => onSelectApi(api)}
            className="bg-[#121417] border border-[#24272C] hover:border-zinc-500 p-5 rounded-xl cursor-pointer transition-all space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: api.logoColor }}>
                {api.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{api.name}</h3>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{api.category}</span>
              </div>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{api.tagline}</p>

            <div className="pt-3 border-t border-[#24272C] flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Latency: <strong className="text-white">{api.vitals.latency}ms</strong></span>
              <span className="text-emerald-500 font-semibold">{api.vitals.uptime}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
