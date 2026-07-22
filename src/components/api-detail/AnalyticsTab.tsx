"use client";

import type { ApiEntry } from "@/types/api";

interface AnalyticsTabProps {
  api: ApiEntry;
}

function buildLinePoints(values: number[], min: number, max: number) {
  const delta = max - min;
  return values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * 100;
      const y = 40 - ((val - min) / delta) * 35;
      return { x, y };
    });
}

export default function AnalyticsTab({ api }: AnalyticsTabProps) {
  const latencyPts = api.analytics.latency;
  const latencyMin = Math.min(...latencyPts) - 10;
  const latencyMax = Math.max(...latencyPts) + 10;
  const latencyPoints = buildLinePoints(latencyPts, latencyMin, latencyMax);
  const latencyCoords = latencyPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const uptimePts = api.analytics.uptime;
  const uptimePoints = buildLinePoints(uptimePts, 99.8, 100.05);
  const uptimeCoords = uptimePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Historical Latency Chart */}
      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Historical Latency (ms)</h3>

        <div className="h-48 border-b border-l border-[#24272C]/80 relative flex items-end p-2">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <polyline points={latencyCoords} fill="none" stroke="#4F8CFF" strokeWidth="1.5" />
            {latencyPoints.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r="1.5" fill="#4F8CFF" />
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
          {api.analytics.labels.map((l, idx) => (
            <span key={idx}>{l}</span>
          ))}
        </div>
      </div>

      {/* Uptime Status Timeline */}
      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Uptime Status Timeline</h3>

        <div className="h-48 border-b border-l border-[#24272C]/80 relative flex items-end p-2">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <polyline points={uptimeCoords} fill="none" stroke="#10B981" strokeWidth="1.5" />
            {uptimePoints.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r="1.5" fill="#10B981" />
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
          {api.analytics.labels.map((l, idx) => (
            <span key={idx}>{l}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
