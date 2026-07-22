"use client";

import type { ApiEntry } from "@/types/api";

interface DnaTabProps {
  api: ApiEntry;
}

export default function DnaTab({ api }: DnaTabProps) {
  // Real, freshly-published catalog entries start with dna: {} — DNA
  // vectors/similarity/timeline are computed later, not typed in at
  // submission (see server/src/modules/contribution-verification/publish.ts).
  if (!api.dna.radar) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-zinc-500 text-sm">
        No API DNA data yet for {api.name}. This is computed by a separate analysis pass, not available at submission time.
      </div>
    );
  }

  const r = api.dna.radar;
  const p1 = 100 - r.auth * 0.8;
  const p2x = 100 + r.performance * 0.8 * 0.95;
  const p2y = 100 - r.performance * 0.8 * 0.31;
  const p3x = 100 + r.docs * 0.8 * 0.58;
  const p3y = 100 + r.docs * 0.8 * 0.81;
  const p4x = 100 - r.dx * 0.8 * 0.58;
  const p4y = 100 + r.dx * 0.8 * 0.81;
  const p5x = 100 - r.pricing * 0.8 * 0.95;
  const p5y = 100 - r.pricing * 0.8 * 0.31;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Radar Chart SVG Map */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono self-start">API DNA Dimension Vectors</h3>

        <div className="relative w-64 h-64 flex items-center justify-center bg-surface-2 rounded-xl border border-border/60">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            <polygon points="100,20 180,80 150,170 50,170 20,80" fill="none" stroke="#24272C" strokeWidth="1" />
            <polygon points="100,50 160,95 137,150 63,150 40,95" fill="none" stroke="#24272C" strokeWidth="1" />
            <polygon points="100,80 130,110 118,135 82,135 70,110" fill="none" stroke="#24272C" strokeWidth="1" />

            <line x1="100" y1="100" x2="100" y2="20" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="100" y1="100" x2="180" y2="80" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="100" y1="100" x2="150" y2="170" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="100" y1="100" x2="50" y2="170" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="100" y1="100" x2="20" y2="80" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />

            <polygon
              points={`${100},${p1} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y} ${p5x},${p5y}`}
              fill="rgba(79, 140, 255, 0.15)"
              stroke="#4F8CFF"
              strokeWidth="2"
            />
          </svg>

          <span className="absolute top-2 text-[9px] text-zinc-500 font-mono uppercase">Auth Quality</span>
          <span className="absolute right-2 top-24 text-[9px] text-zinc-500 font-mono uppercase">Performance</span>
          <span className="absolute bottom-2 right-6 text-[9px] text-zinc-500 font-mono uppercase">Docs</span>
          <span className="absolute bottom-2 left-6 text-[9px] text-zinc-500 font-mono uppercase">DevEx</span>
          <span className="absolute left-2 top-24 text-[9px] text-zinc-500 font-mono uppercase">Pricing</span>
        </div>

        <div className="grid grid-cols-5 w-full text-center text-[10px] font-mono border-t border-border pt-4">
          {Object.entries(api.dna.radar).map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-zinc-500 uppercase">{k}</span>
              <span className="text-white font-bold mt-0.5">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API Intelligence, Deprecation, Breaking risks */}
      <div className="space-y-6">

        {/* DNA matches */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Similarity Alignment</h3>
          <div className="space-y-3">
            {api.dna.similarities.map((sim, idx) => (
              <div key={idx} className="p-3 bg-surface-2 border border-border rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white capitalize">{sim.target} DNA match</span>
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono">
                      {sim.percentage}% similarity
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">{sim.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 font-mono font-semibold uppercase">Deprecation Risk</span>
            <span className="text-lg font-bold text-emerald-500 tracking-tight mt-1">{api.dna.deprecationRisk.split(" ")[0]}</span>
            <span className="text-[9px] text-zinc-500 mt-1 leading-normal">Evaluated via active SDK issues</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 font-mono font-semibold uppercase">6m Breaking Prediction</span>
            <span className="text-lg font-bold text-amber-500 tracking-tight mt-1">{api.dna.breakingChangesPredictor}%</span>
            <span className="text-[9px] text-zinc-500 mt-1 leading-normal">Computed from evolutionary logs</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Evolution Timeline</h3>
          <div className="relative pl-4 border-l border-border space-y-4 text-xs">
            {api.dna.evolutionTimeline.map((time, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full border border-border bg-accent"></div>
                <span className="text-[10px] text-zinc-500 font-mono">{time.date}</span>
                <p className="text-zinc-300 font-medium mt-0.5 leading-relaxed">{time.event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
