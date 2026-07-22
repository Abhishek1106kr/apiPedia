"use client";

import type { ApiEntry } from "@/types/api";

interface OverviewTabProps {
  api: ApiEntry;
}

export default function OverviewTab({ api }: OverviewTabProps) {
  const metrics = [
    { label: "Health Score", value: `${api.vitals.healthScore}%`, detail: "Operational Status", color: "text-emerald-500" },
    { label: "Documentation Quality", value: `${api.vitals.docsScore}/10`, detail: "Highly readable", color: "text-[#4F8CFF]" },
    { label: "SDK Quality", value: `${api.vitals.sdkScore}/10`, detail: "Excellent coverage", color: "text-amber-500" },
    { label: "Average Latency", value: `${api.vitals.latency}ms`, detail: "Global p50 metric", color: "text-white" },
    { label: "Monthly Uptime", value: `${api.vitals.uptime}%`, detail: "SLA Guaranteed", color: "text-emerald-500" },
    { label: "Security Profile", value: api.vitals.security.split(",")[0], detail: "Enterprise standard", color: "text-white" },
    { label: "Last Sync Commit", value: api.vitals.lastUpdated, detail: "Automatic monitoring", color: "text-zinc-400" },
    { label: "Rate Limits", value: api.vitals.rateLimit, detail: "Standard tier", color: "text-white" },
    { label: "Authentication", value: api.vitals.authType, detail: "Key handshake", color: "text-white" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Detailed Vitals List */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Core Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((item, idx) => (
            <div key={idx} className="bg-[#121417] border border-[#24272C] rounded-lg p-4 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">{item.label}</span>
              <span className={`text-lg font-bold my-1 tracking-tight ${item.color}`}>{item.value}</span>
              <span className="text-[10px] text-zinc-500 font-medium">{item.detail}</span>
            </div>
          ))}
        </div>

        {/* About Section */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Platform Description</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{api.description}</p>
        </div>
      </div>

      {/* Sidebar Metadata */}
      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 h-fit space-y-6">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">Repository Metadata</h3>

        <div className="space-y-4 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">API Version:</span>
            <span className="text-zinc-300 font-medium">{api.vitals.version}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">Response Format:</span>
            <span className="text-zinc-300 font-medium">{api.vitals.responseFormat}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">Difficulty Curve:</span>
            <span className={`font-semibold ${api.vitals.difficulty === "Easy" ? "text-emerald-500" : api.vitals.difficulty === "Medium" ? "text-amber-500" : "text-rose-500"}`}>
              {api.vitals.difficulty}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">GitHub Commits:</span>
            <span className="text-zinc-300 font-medium">{api.vitals.commitsCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">SDK Maturity:</span>
            <span className="text-zinc-300 font-medium text-right max-w-[150px] truncate">{api.dna.sdkMaturity.split(" ")[0]}</span>
          </div>
        </div>

        <div className="p-4 bg-[#181B20] border border-[#24272C] rounded-lg space-y-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-[#4F8CFF]"></div>
            <span className="text-xs font-semibold text-zinc-300">Developer Experience Check</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Evaluated by compiling test suites across 6 SDK runtimes. Last audit completed on 2026-07-16.
          </p>
        </div>
      </div>
    </div>
  );
}
