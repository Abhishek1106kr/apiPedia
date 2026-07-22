"use client";

import type { ApiEntry } from "@/types/api";

interface BenchmarksViewProps {
  apis: ApiEntry[];
}

export default function BenchmarksView({ apis }: BenchmarksViewProps) {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#24272C] pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">API Benchmarks & Performance</h2>
        <p className="text-zinc-500 text-xs mt-1 font-mono">Aggregated and verified daily by local agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Lowest latency Leaderboard */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 font-mono">Fastest Response (Latency)</h3>
          <div className="space-y-3 font-mono text-xs">
            {[...apis].sort((a, b) => a.vitals.latency - b.vitals.latency).map((api, idx) => (
              <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                <div className="flex items-center space-x-2.5">
                  <span className="text-zinc-500">#{idx + 1}</span>
                  <span className="text-white font-bold">{api.name}</span>
                </div>
                <span className="text-emerald-400 font-bold">{api.vitals.latency}ms</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Uptime Leaderboard */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 font-mono">Highest Uptime (SLA Check)</h3>
          <div className="space-y-3 font-mono text-xs">
            {[...apis].sort((a, b) => b.vitals.uptime - a.vitals.uptime).map((api, idx) => (
              <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                <div className="flex items-center space-x-2.5">
                  <span className="text-zinc-500">#{idx + 1}</span>
                  <span className="text-white font-bold">{api.name}</span>
                </div>
                <span className="text-emerald-400 font-bold">{api.vitals.uptime}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Breaking Changes Warning */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500 font-mono">High Deprecation Index</h3>
          <div className="space-y-3 font-mono text-xs">
            {[...apis].sort((a, b) => b.dna.breakingChangesPredictor - a.dna.breakingChangesPredictor).map((api, idx) => (
              <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-rose-500/20 rounded-lg">
                <div className="flex items-center space-x-2.5">
                  <span className="text-zinc-500">#{idx + 1}</span>
                  <span className="text-white font-bold">{api.name}</span>
                </div>
                <span className="text-rose-400 font-bold">{api.dna.breakingChangesPredictor}% predicted changes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best DX rating */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4F8CFF] font-mono">Best Developer Experience (SDK + Docs)</h3>
          <div className="space-y-3 font-mono text-xs">
            {[...apis].sort((a, b) => b.vitals.docsScore - a.vitals.docsScore).map((api, idx) => (
              <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                <div className="flex items-center space-x-2.5">
                  <span className="text-zinc-500">#{idx + 1}</span>
                  <span className="text-white font-bold">{api.name}</span>
                </div>
                <span className="text-[#4F8CFF] font-bold">{api.vitals.docsScore}/10</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
