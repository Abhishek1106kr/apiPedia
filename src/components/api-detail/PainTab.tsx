"use client";

import type { ApiEntry } from "@/types/api";

interface PainTabProps {
  api: ApiEntry;
  onExplainError: () => void;
}

export default function PainTab({ api, onExplainError }: PainTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Pain Stats & Indicators */}
      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-6 h-fit">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Community Pain Metrics</h3>

        <div className="space-y-4 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">GitHub Issues:</span>
            <span className="text-white font-semibold">{api.painIndex.githubIssues}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">StackOverflow:</span>
            <span className="text-white font-semibold">{api.painIndex.stackoverflowQuestions} threads</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">Discord Mentions:</span>
            <span className="text-white font-semibold">{api.painIndex.discordMentions}/day</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">Reddit Sentiment:</span>
            <span className="text-zinc-300 font-semibold">{api.painIndex.redditActivity}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#24272C]">
            <span className="text-zinc-500">Learning Curve:</span>
            <span className="text-zinc-300 font-semibold">{api.painIndex.learningDifficulty}</span>
          </div>
        </div>

        <div className="p-4 bg-[#181B20] border border-[#24272C] rounded-lg text-[10px] text-zinc-500 leading-relaxed font-mono">
          Metrics aggregated using real-time scraping of public channels. Last update: 2026-07-16.
        </div>
      </div>

      {/* Complaints & Confusing Endpoints */}
      <div className="md:col-span-2 space-y-6">

        {/* Top Complaints */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Top Integration Complaints</h3>
          <ul className="space-y-3 text-xs leading-relaxed text-zinc-400">
            {api.painIndex.topComplaints.map((comp, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <span className="text-rose-500 font-mono">#</span>
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confusing Endpoints list */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Most Confusing Endpoints</h3>
          <div className="space-y-3 text-xs">
            {api.painIndex.confusingEndpoints.map((ep, idx) => (
              <div key={idx} className="p-3.5 bg-[#181B20] border border-[#24272C] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-semibold">{ep.path}</span>
                  <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono">
                    Confusing State Handshake
                  </span>
                </div>
                <p className="text-zinc-500 font-sans leading-normal">{ep.complexity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Errors & Remedies */}
        <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Troubleshooting & AI Diagnostics</h3>
          <div className="space-y-3 text-xs font-mono">
            {api.painIndex.commonErrors.map((err, idx) => (
              <div key={idx} className="p-3 bg-[#181B20] border border-[#24272C] rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-[#24272C] pb-1.5">
                  <span className="text-zinc-300 font-semibold">Error: <span className="text-rose-500">{err.code}</span></span>
                  <button
                    onClick={onExplainError}
                    className="bg-[#121417] border border-[#24272C] hover:border-[#4F8CFF] text-[9px] px-1.5 py-0.5 rounded text-zinc-400 hover:text-white"
                  >
                    ✨ Explain Error
                  </button>
                </div>
                <p className="text-zinc-500 text-[11px]">{err.description}</p>
                <div className="p-2.5 bg-[#0B0D10]/50 border border-[#24272C]/40 rounded text-zinc-400 font-sans leading-relaxed text-[11px]">
                  <strong className="text-emerald-500 font-mono uppercase text-[9px] block mb-0.5">AI Fix:</strong>
                  {err.remedy}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
