"use client";

import type { ApiEntry, PlaygroundResponseState } from "@/types/api";

interface PlaygroundTabProps {
  api: ApiEntry;
  selectedEndpointIndex: number;
  onSelectEndpoint: (index: number) => void;
  headers: string;
  onHeadersChange: (headers: string) => void;
  body: string;
  onBodyChange: (body: string) => void;
  onSend: () => void;
  loading: boolean;
  response: PlaygroundResponseState | null;
  responseTime: number;
  inlineAiLoading: boolean;
  inlineAiExplanation: string;
  onAiAction: (actionType: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export default function PlaygroundTab({
  api,
  selectedEndpointIndex,
  onSelectEndpoint,
  headers,
  onHeadersChange,
  body,
  onBodyChange,
  onSend,
  loading,
  response,
  responseTime,
  inlineAiLoading,
  inlineAiExplanation,
  onAiAction,
  onCopyText,
}: PlaygroundTabProps) {
  const endpoint = api.endpoints[selectedEndpointIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-[#24272C] rounded-xl overflow-hidden bg-[#121417]">

      {/* Left Column: Editor & Params */}
      <div className="flex flex-col border-r border-[#24272C] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Interactive Sandbox</h3>
          <div className="flex space-x-1.5">
            <button
              onClick={() => onAiAction("explain")}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-400 hover:text-white px-2 py-1 rounded text-[10px] font-medium transition-colors"
              title="Explain endpoint rules"
            >
              ✨ Explain Endpoint
            </button>
            <button
              onClick={() => onAiAction("practices")}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-400 hover:text-white px-2 py-1 rounded text-[10px] font-medium transition-colors"
              title="Suggest Best Practices"
            >
              💡 Best Practices
            </button>
          </div>
        </div>

        {/* Endpoint Path & Method Selection */}
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Endpoint & Method</label>
          <div className="flex space-x-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              endpoint?.method === "POST"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {endpoint?.method}
            </span>
            <select
              className="flex-1 bg-[#181B20] border border-[#24272C] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
              value={selectedEndpointIndex}
              onChange={(e) => onSelectEndpoint(parseInt(e.target.value))}
            >
              {api.endpoints.map((e, idx) => (
                <option key={idx} value={idx}>{e.path}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Headers Input */}
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Headers</label>
          <textarea
            rows={2}
            className="w-full bg-[#181B20] border border-[#24272C] rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-[#4F8CFF] resize-none"
            value={headers}
            onChange={(e) => onHeadersChange(e.target.value)}
          />
        </div>

        {/* Body Input (only for POST requests) */}
        {endpoint?.method === "POST" && (
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Request Body (JSON)</label>
            <textarea
              rows={6}
              className="w-full flex-1 bg-[#181B20] border border-[#24272C] rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-[#4F8CFF] resize-y"
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
            />
          </div>
        )}

        {/* Execute Sandbox Request Button */}
        <button
          onClick={onSend}
          disabled={loading}
          className="w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-colors disabled:opacity-50"
        >
          {loading ? "DISPATCHING REQUEST..." : "RUN SANDBOX QUERY"}
        </button>

        {/* Inline AI output container */}
        {(inlineAiLoading || inlineAiExplanation) && (
          <div className="p-4 bg-[#181B20]/60 border border-[#24272C] rounded-lg text-xs space-y-2 relative">
            {inlineAiLoading ? (
              <div className="text-zinc-500 animate-pulse font-mono">AI compiling analysis...</div>
            ) : (
              <div className="text-zinc-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                {inlineAiExplanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Code Generators & Responses */}
      <div className="flex flex-col p-6 space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Live Sandbox Output</h3>

        {/* Code Generator Snippets */}
        <div className="space-y-2 flex flex-col flex-1">
          <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Autogenerated Integration Client</label>
          <div className="bg-[#181B20] border border-[#24272C] rounded-lg overflow-hidden flex flex-col flex-1 max-h-[300px]">
            <div className="bg-[#121417] px-3 py-1.5 border-b border-[#24272C] flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-mono">Python Code Example</span>
              <button
                onClick={() => onCopyText(endpoint?.codeExamples.python || "", "Python Code")}
                className="text-zinc-500 hover:text-white text-[10px] font-mono"
              >
                [Copy Code]
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre select-all bg-[#0B0D10]/50 flex-1">
              {endpoint?.codeExamples.python}
            </pre>
          </div>
        </div>

        {/* API response output box */}
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">API response payload</label>
          <div className="bg-[#181B20] border border-[#24272C] rounded-lg p-4 flex flex-col flex-1 justify-center min-h-[180px] font-mono text-xs">
            {response ? (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] border-b border-[#24272C] pb-2 text-zinc-500">
                  <span>STATUS: <span className="text-emerald-500 font-bold">{response.status} OK</span></span>
                  <span>LATENCY: <span className="text-white font-bold">{responseTime}ms</span></span>
                </div>
                <pre className="flex-1 text-[11px] text-emerald-400 overflow-auto whitespace-pre select-all bg-[#0B0D10]/50 p-2.5 rounded border border-[#24272C]/40">
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-10">
                No request dispatched yet. Click &quot;RUN SANDBOX QUERY&quot; above to fetch simulated live endpoints.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
