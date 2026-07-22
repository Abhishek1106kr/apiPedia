"use client";

import type { ApiEntry } from "@/types/api";

interface HomeViewProps {
  apis: ApiEntry[];
  filteredApis: ApiEntry[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  placeholder: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectApi: (api: ApiEntry, subTab?: string) => void;
}

export default function HomeView({
  apis,
  filteredApis,
  searchQuery,
  onSearchQueryChange,
  placeholder,
  searchInputRef,
  onSelectApi,
}: HomeViewProps) {
  return (
    <div className="flex flex-col space-y-10 py-6 max-w-4xl mx-auto w-full">

      {/* Visual Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none font-sans">
          apiPedia
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          Developer intelligence platform for APIs. Speed over marketing fluff.
        </p>
      </div>

      {/* Centralized Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          className="w-full bg-surface border border-border hover:border-accent/50 focus:border-accent rounded-xl pl-12 pr-16 py-3.5 text-sm text-white outline-none placeholder-zinc-500 font-sans transition-all shadow-lg"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500 bg-surface-2 border border-border px-2 py-0.5 rounded shadow">
            Press /
          </span>
        </div>
      </div>

      {/* SEARCH RESULTS CONDITIONAL GRID */}
      {searchQuery !== "" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Found {filteredApis.length} matching APIs</span>
            <button onClick={() => onSearchQueryChange("")} className="hover:text-white">Clear search</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApis.map((api) => (
              <div
                key={api.id}
                onClick={() => onSelectApi(api)}
                className="bg-surface border border-border hover:border-accent/60 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white select-none"
                    style={{ backgroundColor: api.logoColor }}
                  >
                    {api.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{api.name}</h3>
                      {api.verified && (
                        <span className="bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-1 truncate">{api.tagline}</p>
                  </div>
                </div>

                {/* Stats Metrics Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-[10px] font-mono text-zinc-400">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 uppercase text-[9px]">Uptime</span>
                    <span className="font-bold text-emerald-500">{api.vitals.uptime}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 uppercase text-[9px]">Latency</span>
                    <span className="font-bold text-white">{api.vitals.latency}ms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 uppercase text-[9px]">Auth Model</span>
                    <span className="font-semibold text-zinc-300 truncate">{api.vitals.authType.split(" ")[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // DASHBOARD METRIC LISTINGS (NO MARKETING COPY)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

          {/* Columns grid */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Popular Vitals</h3>
              <div className="space-y-2">
                {apis.slice(0, 4).map((api) => (
                  <div
                    key={api.id}
                    onClick={() => onSelectApi(api)}
                    className="flex items-center justify-between p-2.5 bg-surface-2/40 border border-border/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                      <span className="text-xs font-bold text-white">{api.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] font-mono">
                      <span className="text-zinc-500">Latency: <span className="text-white font-bold">{api.vitals.latency}ms</span></span>
                      <span className="text-emerald-500 font-semibold">{api.vitals.uptime}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Trending Channels</h3>
              <div className="space-y-2">
                {apis.slice(4, 7).map((api) => (
                  <div
                    key={api.id}
                    onClick={() => onSelectApi(api)}
                    className="flex items-center justify-between p-2.5 bg-surface-2/40 border border-border/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                      <span className="text-xs font-bold text-white">{api.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {api.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columns grid 2 */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Documentation Leaderboard</h3>
              <div className="space-y-2">
                {[...apis].sort((a, b) => b.vitals.docsScore - a.vitals.docsScore).slice(0, 4).map((api) => (
                  <div
                    key={api.id}
                    onClick={() => onSelectApi(api)}
                    className="flex items-center justify-between p-2.5 bg-surface-2/40 border border-border/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                      <span className="text-xs font-bold text-white">{api.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent font-bold">
                      {api.vitals.docsScore}/10 DX
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Warning Lists */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500 font-mono">Integration Friction Warnings</h3>
              <div className="space-y-2">
                {[...apis].sort((a, b) => b.painIndex.githubIssues - a.painIndex.githubIssues).slice(0, 3).map((api) => (
                  <div
                    key={api.id}
                    onClick={() => onSelectApi(api, "pain")}
                    className="flex items-center justify-between p-2.5 bg-surface-2/40 border border-rose-500/20 rounded-lg hover:border-rose-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-white">{api.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">
                      {api.painIndex.githubIssues} active bugs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
