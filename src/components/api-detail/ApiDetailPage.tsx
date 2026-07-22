"use client";

import type { ApiEntry, PlaygroundResponseState } from "@/types/api";
import OverviewTab from "./OverviewTab";
import PlaygroundTab from "./PlaygroundTab";
import DocsTab from "./DocsTab";
import DnaTab from "./DnaTab";
import PainTab from "./PainTab";
import RecipesTab from "./RecipesTab";
import PathsTab from "./PathsTab";
import AnalyticsTab from "./AnalyticsTab";

const SUB_TABS: Array<{ id: string; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "playground", label: "Playground" },
  { id: "docs", label: "Documentation" },
  { id: "dna", label: "API DNA & Intelligence" },
  { id: "pain", label: "Developer Pain Index" },
  { id: "recipes", label: "Community Recipes" },
  { id: "paths", label: "Learning Paths" },
  { id: "analytics", label: "Analytics" },
];

interface ApiDetailPageProps {
  api: ApiEntry;
  detailSubTab: string;
  onSubTabChange: (tab: string) => void;
  onBack: () => void;
  onCopyText: (text: string, label: string) => void;
  selectedEndpointIndex: number;
  onSelectEndpoint: (index: number) => void;
  playgroundHeaders: string;
  onPlaygroundHeadersChange: (headers: string) => void;
  playgroundBody: string;
  onPlaygroundBodyChange: (body: string) => void;
  onPlaygroundSend: () => void;
  playgroundLoading: boolean;
  playgroundResponse: PlaygroundResponseState | null;
  playgroundResponseTime: number;
  inlineAiLoading: boolean;
  inlineAiExplanation: string;
  onAiAction: (actionType: string) => void;
}

export default function ApiDetailPage({
  api,
  detailSubTab,
  onSubTabChange,
  onBack,
  onCopyText,
  selectedEndpointIndex,
  onSelectEndpoint,
  playgroundHeaders,
  onPlaygroundHeadersChange,
  playgroundBody,
  onPlaygroundBodyChange,
  onPlaygroundSend,
  playgroundLoading,
  playgroundResponse,
  playgroundResponseTime,
  inlineAiLoading,
  inlineAiExplanation,
  onAiAction,
}: ApiDetailPageProps) {
  return (
    <div className="flex-1 flex flex-col space-y-6">

      {/* Breadcrumb & Navigation Back */}
      <div className="flex items-center space-x-2 text-xs text-zinc-500">
        <span className="cursor-pointer hover:text-white" onClick={onBack}>APIs</span>
        <span>/</span>
        <span className="text-zinc-300 font-medium">{api.name}</span>
      </div>

      {/* API Detail Header */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
            style={{ backgroundColor: api.logoColor }}
          >
            {api.name[0]}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{api.name}</h1>
              {api.verified && (
                <span className="bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  Verified
                </span>
              )}
              <span className="text-zinc-500 text-xs font-mono bg-surface-2 px-2 py-0.5 rounded border border-border">
                {api.category}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1.5 max-w-xl leading-relaxed">{api.tagline}</p>
          </div>
        </div>

        {/* Header Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-surface-2 hover:bg-border border border-border text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Official Docs
          </a>
          <a
            href={api.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-surface-2 hover:bg-border border border-border text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={() => onCopyText(api.baseUrl, "Base URL")}
            className="bg-surface-2 hover:bg-border border border-border text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <span>Copy Base URL</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Selection */}
      <div className="border-b border-border flex space-x-1 overflow-x-auto scrollbar-none">
        {SUB_TABS.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSubTabChange(sub.id)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-all ${
              detailSubTab === sub.id
                ? "border-accent text-accent"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* SUB-VIEW RENDERING */}
      <div className="flex-1 min-h-[500px]">
        {detailSubTab === "overview" && <OverviewTab api={api} />}

        {detailSubTab === "playground" && (
          <PlaygroundTab
            api={api}
            selectedEndpointIndex={selectedEndpointIndex}
            onSelectEndpoint={onSelectEndpoint}
            headers={playgroundHeaders}
            onHeadersChange={onPlaygroundHeadersChange}
            body={playgroundBody}
            onBodyChange={onPlaygroundBodyChange}
            onSend={onPlaygroundSend}
            loading={playgroundLoading}
            response={playgroundResponse}
            responseTime={playgroundResponseTime}
            inlineAiLoading={inlineAiLoading}
            inlineAiExplanation={inlineAiExplanation}
            onAiAction={onAiAction}
            onCopyText={onCopyText}
          />
        )}

        {detailSubTab === "docs" && (
          <DocsTab
            api={api}
            selectedEndpointIndex={selectedEndpointIndex}
            onSelectEndpoint={onSelectEndpoint}
            onCopyText={onCopyText}
          />
        )}

        {detailSubTab === "dna" && <DnaTab api={api} />}

        {detailSubTab === "pain" && (
          <PainTab api={api} onExplainError={() => onAiAction("explain_error")} />
        )}

        {detailSubTab === "recipes" && <RecipesTab api={api} onCopyText={onCopyText} />}

        {detailSubTab === "paths" && <PathsTab api={api} />}

        {detailSubTab === "analytics" && <AnalyticsTab api={api} />}
      </div>

    </div>
  );
}
