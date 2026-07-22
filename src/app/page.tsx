"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "./data";
import { useApis } from "@/hooks/useApis";
import type { ApiEntry, PlaygroundResponseState } from "@/types/api";
import CommandPalette from "@/components/CommandPalette";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import Header from "@/components/Header";
import HomeView from "@/components/HomeView";
import CategoriesView from "@/components/CategoriesView";
import BenchmarksView from "@/components/BenchmarksView";
import CompareView from "@/components/CompareView";
import DocsHubView from "@/components/DocsHubView";
import Footer from "@/components/Footer";
import ApiDetailPage from "@/components/api-detail/ApiDetailPage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const PLACEHOLDERS = [
  "Search Stripe...",
  "Search OpenAI models...",
  "Search GitHub endpoints...",
  "Search Clerk capabilities...",
  "Search Payments...",
  "Search Authentication...",
  "Search twilio messages...",
];

export default function ApiPediaApp() {
  // Real catalog data from server/ (GET /api/apis) — replaces the
  // hardcoded mock array. A freshly-published entry can have empty
  // vitals/dna/painIndex/analytics/endpoints until ingestion and
  // monitoring populate them for real; the detail-tab components each
  // handle that with an explicit "no data yet" state rather than crashing.
  const { data: apis, isLoading: apisLoading, error: apisError } = useApis();

  // Navigation & Page State
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'categories' | 'benchmarks' | 'compare' | 'docs'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Page State
  const [selectedApi, setSelectedApi] = useState<ApiEntry | null>(null);
  const [detailSubTab, setDetailSubTab] = useState("overview");
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);

  // Playground State
  const [playgroundHeaders, setPlaygroundHeaders] = useState("Authorization: Bearer sk_test_apipedia\nContent-Type: application/json");
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState<PlaygroundResponseState | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponseTime, setPlaygroundResponseTime] = useState(0);

  // Keyboard indicators / Command Palette State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");
  const [keyboardModalOpen, setKeyboardModalOpen] = useState(false);

  // Subtle inline AI assistant output states (Instead of floating chatbot)
  const [inlineAiExplanation, setInlineAiExplanation] = useState("");
  const [inlineAiLoading, setInlineAiLoading] = useState(false);

  // Rotating placeholder values
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Ref for search bar focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to select an endpoint and reset playground state
  const selectEndpoint = useCallback((api: ApiEntry | null, index: number) => {
    setSelectedEndpointIndex(index);
    if (api && api.endpoints && api.endpoints[index]) {
      const endpoint = api.endpoints[index];
      if (endpoint.method === "POST" && endpoint.params) {
        const bodyObj: Record<string, unknown> = {};
        endpoint.params.forEach((p) => {
          bodyObj[p.name] = p.type === "integer" ? 2000 : p.type === "array" ? ["card"] : "usd";
        });
        setPlaygroundBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setPlaygroundBody("");
      }
    } else {
      setPlaygroundBody("");
    }
    setPlaygroundResponse(null);
    setInlineAiExplanation("");
  }, []);

  const selectApi = useCallback((api: ApiEntry | null, subTab?: string) => {
    setSelectedApi(api);
    setDetailSubTab(subTab ?? "overview");
    selectEndpoint(api, 0);
  }, [selectEndpoint]);

  // Effect for rotating search placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useKeyboardShortcuts({
    selectedApi,
    commandPaletteOpen,
    searchInputRef,
    setActiveTab,
    selectApi,
    setDetailSubTab,
    setCommandPaletteOpen,
    setKeyboardModalOpen,
  });

  // Perform Simulated API Request in Playground
  const handlePlaygroundSend = () => {
    if (!selectedApi) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    const endpoint = selectedApi.endpoints[selectedEndpointIndex] || selectedApi.endpoints[0];
    const duration = Math.floor((selectedApi.vitals.latency ?? 100) + (Math.random() * 40 - 20));

    setTimeout(() => {
      setPlaygroundLoading(false);
      setPlaygroundResponseTime(duration);
      setPlaygroundResponse({
        status: endpoint.response.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-ratelimit-limit": selectedApi.vitals.rateLimit,
          "x-ratelimit-remaining": "99",
          "server": "apiPedia Edge Gateway",
        },
        body: endpoint.response.body,
      });
    }, 800);
  };

  // Inline AI Assistant action simulator
  const handleAiAction = (actionType: string) => {
    if (!selectedApi) return;
    setInlineAiLoading(true);
    setInlineAiExplanation("");

    const endpoint = selectedApi.endpoints[selectedEndpointIndex] || selectedApi.endpoints[0];

    setTimeout(() => {
      setInlineAiLoading(false);
      switch (actionType) {
        case "explain":
          setInlineAiExplanation(
            `🚀 **AI Explanation (${selectedApi.name} - ${endpoint.path})**:\n` +
            `This endpoint handles payment state transitions. When a request is dispatched, ${selectedApi.name} matches internal keys and returns payment intent references. Ensure you save the \`client_secret\` on client integrations to confirm credentials.`
          );
          break;
        case "debug":
          setInlineAiExplanation(
            `🔧 **AI Debug Diagnostic**:\n` +
            `Payload structure matches ${selectedApi.name}'s active API contracts. Webhook keys are valid. Headers contain standard authorization schemas. No error signatures predicted.`
          );
          break;
        case "practices":
          setInlineAiExplanation(
            `💡 **Developer Best Practices**:\n` +
            `1. Always use **Idempotency Keys** to prevent double-charging.\n` +
            `2. Validate webhook headers locally using HMAC signatures.\n` +
            `3. Store environment configuration in environment variables (\`env\`), never hardcode secret tokens.`
          );
          break;
        case "explain_error":
          setInlineAiExplanation(
            `⚠️ **AI Error Diagnosis**:\n` +
            `Most failures on this endpoint arise from mixing live and test keys. Make sure client checkout keys mirror backend keys.`
          );
          break;
        default:
          setInlineAiExplanation("AI action successfully evaluated.");
      }
    }, 500);
  };

  const catalog = useMemo(() => apis ?? [], [apis]);

  // Dynamic filter lists
  const filteredApis = catalog.filter((api) => {
    const matchesSearch =
      searchQuery === "" ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.endpoints.some((e) => e.path.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || api.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Direct actions from CLI Command Palette
  const handleCommandPaletteSelect = (api: ApiEntry) => {
    selectApi(api);
    setCommandPaletteOpen(false);
    setSearchQuery("");
  };

  // Copy helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans antialiased min-h-screen">

      <Header
        activeTab={activeTab}
        hasSelectedApi={Boolean(selectedApi)}
        onLogoClick={() => { setSelectedApi(null); setActiveTab("home"); setSearchQuery(""); }}
        onNavClick={(tab) => { setSelectedApi(null); setActiveTab(tab); }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenKeyboardModal={() => setKeyboardModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-6">

        {selectedApi ? (
          <ApiDetailPage
            api={selectedApi}
            detailSubTab={detailSubTab}
            onSubTabChange={(tab) => { setDetailSubTab(tab); setInlineAiExplanation(""); }}
            onBack={() => setSelectedApi(null)}
            onCopyText={handleCopyText}
            selectedEndpointIndex={selectedEndpointIndex}
            onSelectEndpoint={(index) => selectEndpoint(selectedApi, index)}
            playgroundHeaders={playgroundHeaders}
            onPlaygroundHeadersChange={setPlaygroundHeaders}
            playgroundBody={playgroundBody}
            onPlaygroundBodyChange={setPlaygroundBody}
            onPlaygroundSend={handlePlaygroundSend}
            playgroundLoading={playgroundLoading}
            playgroundResponse={playgroundResponse}
            playgroundResponseTime={playgroundResponseTime}
            inlineAiLoading={inlineAiLoading}
            inlineAiExplanation={inlineAiExplanation}
            onAiAction={handleAiAction}
          />
        ) : apisLoading && activeTab !== "docs" ? (
          <div className="flex-1 flex items-center justify-center py-24 text-sm text-zinc-500 font-mono">
            Loading API catalog...
          </div>
        ) : apisError && activeTab !== "docs" ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-2 text-center">
            <p className="text-sm text-rose-400 font-mono">Could not reach the API catalog.</p>
            <p className="text-xs text-zinc-500 max-w-md">
              {apisError instanceof Error ? apisError.message : "Unknown error"} — is the backend running at{" "}
              {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}?
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-8">
            {activeTab === "home" && (
              <HomeView
                apis={catalog}
                filteredApis={filteredApis}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                searchInputRef={searchInputRef}
                onSelectApi={selectApi}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesView
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                filteredApis={filteredApis}
                onSelectApi={selectApi}
              />
            )}

            {activeTab === "benchmarks" && <BenchmarksView apis={catalog} />}

            {activeTab === "compare" && <CompareView apis={catalog} />}

            {activeTab === "docs" && <DocsHubView />}
          </div>
        )}

      </main>

      <CommandPalette
        open={commandPaletteOpen}
        query={commandPaletteQuery}
        onQueryChange={setCommandPaletteQuery}
        onClose={() => setCommandPaletteOpen(false)}
        apis={catalog}
        onSelectApi={handleCommandPaletteSelect}
        quickNavCommands={[
          { label: "Go to Benchmark Matrix", target: () => { setActiveTab("benchmarks"); setSelectedApi(null); setCommandPaletteOpen(false); } },
          { label: "Go to Compare panel", target: () => { setActiveTab("compare"); setSelectedApi(null); setCommandPaletteOpen(false); } },
          { label: "Go to API Categories", target: () => { setActiveTab("categories"); setSelectedApi(null); setCommandPaletteOpen(false); } },
          { label: "Go to API Reference Docs", target: () => { setActiveTab("docs"); setSelectedApi(null); setCommandPaletteOpen(false); } },
        ]}
      />

      <KeyboardShortcutsModal
        open={keyboardModalOpen}
        onClose={() => setKeyboardModalOpen(false)}
      />

      <Footer />

    </div>
  );
}
