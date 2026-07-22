"use client";

import type { ApiEntry } from "@/types/api";

interface DocsTabProps {
  api: ApiEntry;
  selectedEndpointIndex: number;
  onSelectEndpoint: (index: number) => void;
  onCopyText: (text: string, label: string) => void;
}

export default function DocsTab({ api, selectedEndpointIndex, onSelectEndpoint, onCopyText }: DocsTabProps) {
  const ep = api.endpoints[selectedEndpointIndex] || api.endpoints[0];

  if (!ep) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-zinc-500 text-sm">
        No endpoints documented yet for {api.name}.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* Left Column: Sidebar of endpoints */}
      <div className="space-y-2 lg:col-span-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono pl-2">Endpoints</h3>
        <div className="space-y-1 bg-surface border border-border rounded-lg p-2">
          {api.endpoints.map((e, idx) => (
            <button
              key={idx}
              onClick={() => onSelectEndpoint(idx)}
              className={`w-full text-left px-3 py-2 rounded text-xs font-mono flex items-center space-x-2 transition-colors ${
                selectedEndpointIndex === idx
                  ? "bg-surface-2 border border-border text-accent"
                  : "hover:bg-surface-2 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className={`text-[10px] font-bold ${e.method === "POST" ? "text-amber-500" : "text-emerald-500"}`}>{e.method}</span>
              <span className="truncate">{e.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Endpoint Doc details */}
      <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="space-y-6">

          {/* Heading */}
          <div className="border-b border-border pb-4 space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                ep.method === "POST" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}>{ep.method}</span>
              <h2 className="text-lg font-bold text-white font-mono">{ep.path}</h2>
            </div>
            <p className="text-zinc-400 text-sm">{ep.description}</p>
          </div>

          {/* Parameters Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Parameters</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-2 border-b border-border text-zinc-500">
                  <tr>
                    <th className="p-3">Field</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ep.params.map((p, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/40">
                      <td className="p-3 text-white font-semibold">{p.name}</td>
                      <td className="p-3 text-zinc-400 text-[11px]">{p.type}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          p.required ? "bg-rose-500/10 text-rose-500" : "bg-zinc-800 text-zinc-500"
                        }`}>{p.required ? "true" : "false"}</span>
                      </td>
                      <td className="p-3 text-zinc-400 leading-relaxed font-sans">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-language code tabs */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Integration Code Examples</h3>
            <div className="border border-border rounded-lg overflow-hidden bg-surface-2">
              <div className="bg-surface px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">JavaScript Fetch client</span>
                <button
                  onClick={() => onCopyText(ep.codeExamples.javascript || "", "Javascript SDK Code")}
                  className="text-zinc-500 hover:text-white text-[10px] font-mono"
                >
                  [Copy Code]
                </button>
              </div>
              <pre className="p-4 text-[11px] font-mono text-accent overflow-auto whitespace-pre bg-background/40">
                {ep.codeExamples.javascript}
              </pre>
            </div>
          </div>

          {/* Response Payload Specification */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Response Schema (200 OK)</h3>
            <pre className="p-4 bg-surface-2 border border-border rounded-lg text-[11px] font-mono text-emerald-400 overflow-auto max-h-[300px]">
              {JSON.stringify(ep.response.body, null, 2)}
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
}
