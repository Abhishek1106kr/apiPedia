"use client";

export default function DocsHubView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-[#24272C] pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">API Reference Hub</h2>
        <p className="text-zinc-500 text-xs mt-1 font-mono">Core schemas and architectural details for apiPedia platforms.</p>
      </div>

      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">General Architecture</h3>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans">
          apiPedia provides direct access to developers evaluating payment gateways, auth systems, and AI models.
          All data schemas are updated in real-time by scraping active repository commits and StackOverflow pipelines.
        </p>
      </div>

      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Security & Scopes</h3>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans">
          All API tokens validated on our playhouses are client-side only. We do not cache or store personal developer keys or credentials.
        </p>
      </div>
    </div>
  );
}
