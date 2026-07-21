"use client";

import type { ApiEntry } from "@/types/api";

interface PathsTabProps {
  api: ApiEntry;
}

export default function PathsTab({ api }: PathsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {api.paths.map((path, idx) => (
        <div key={idx} className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#24272C] pb-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">{path.name}</h3>
              <span className="text-[10px] text-[#4F8CFF] font-mono font-semibold uppercase">{path.id} course path</span>
            </div>
            <span className="text-zinc-500 text-[10px] font-mono">0% Completed</span>
          </div>

          {/* Course Steps */}
          <div className="space-y-2.5">
            {path.steps.map((step, sIdx) => (
              <div key={sIdx} className="flex items-center space-x-3 text-xs text-zinc-400">
                <div className="w-5 h-5 rounded-full border border-[#24272C] flex items-center justify-center font-mono text-[10px] text-zinc-500">
                  {sIdx + 1}
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 py-2 rounded-lg text-xs font-semibold font-mono tracking-tight transition-colors">
            START PATH
          </button>
        </div>
      ))}
    </div>
  );
}
