"use client";

import React, { useState, useEffect, useRef } from "react";
import { APIS, CATEGORIES } from "./data";

const placeholders = [
  "Search Stripe...",
  "Search OpenAI models...",
  "Search GitHub endpoints...",
  "Search Clerk capabilities...",
  "Search Payments...",
  "Search Authentication...",
  "Search twilio messages..."
];

export default function ApiPediaApp() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'categories' | 'benchmarks' | 'compare' | 'docs'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Detail Page State
  const [selectedApi, setSelectedApi] = useState(null);
  const [detailSubTab, setDetailSubTab] = useState("overview"); // 'overview' | 'playground' | 'docs' | 'dna' | 'pain' | 'recipes' | 'paths' | 'analytics'
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);

  // Compare Page State
  const [compareApi1Id, setCompareApi1Id] = useState("stripe");
  const [compareApi2Id, setCompareApi2Id] = useState("razorpay");

  // Playground State
  const [playgroundHeaders, setPlaygroundHeaders] = useState("Authorization: Bearer sk_test_apipedia\nContent-Type: application/json");
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState(null);
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
  const searchInputRef = useRef(null);

  // Helper to select an endpoint and reset playground state
  const selectEndpoint = React.useCallback((api, index) => {
    setSelectedEndpointIndex(index);
    if (api && api.endpoints && api.endpoints[index]) {
      const endpoint = api.endpoints[index];
      // Default body
      if (endpoint.method === "POST" && endpoint.params) {
        const bodyObj = {};
        endpoint.params.forEach(p => {
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

  const selectApi = React.useCallback((api) => {
    setSelectedApi(api);
    setDetailSubTab("overview");
    selectEndpoint(api, 0);
  }, [selectEndpoint]);

  // Effect for rotating search placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search input on "/"
      if (e.key === "/" && document.activeElement !== searchInputRef.current && !commandPaletteOpen) {
        e.preventDefault();
        setActiveTab("home");
        selectApi(null);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }

      // Open command palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // Escape to close overlays
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setKeyboardModalOpen(false);
      }

      // Keyboard navigation shortcuts if not in inputs
      if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        if (e.key.toLowerCase() === "g" && selectedApi?.githubUrl) {
          window.open(selectedApi.githubUrl, "_blank");
        }
        if (e.key.toLowerCase() === "d") {
          if (selectedApi) {
            setDetailSubTab("docs");
          } else {
            setActiveTab("docs");
          }
        }
        if (e.key.toLowerCase() === "p" && selectedApi) {
          setDetailSubTab("playground");
        }
        if (e.key.toLowerCase() === "c") {
          setActiveTab("compare");
          selectApi(null);
        }
        if (e.key === "?") {
          setKeyboardModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedApi, commandPaletteOpen, selectApi]);

  // State is now updated via event-based selectApi and selectEndpoint handlers to avoid cascading render lint errors.

  // Perform Simulated API Request in Playground
  const handlePlaygroundSend = () => {
    if (!selectedApi) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    
    const endpoint = selectedApi.endpoints[selectedEndpointIndex] || selectedApi.endpoints[0];
    const duration = Math.floor(selectedApi.vitals.latency + (Math.random() * 40 - 20));

    setTimeout(() => {
      setPlaygroundLoading(false);
      setPlaygroundResponseTime(duration);
      setPlaygroundResponse({
        status: endpoint.response.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-ratelimit-limit": selectedApi.vitals.rateLimit,
          "x-ratelimit-remaining": "99",
          "server": "apiPedia Edge Gateway"
        },
        body: endpoint.response.body
      });
    }, 800);
  };

  // Inline AI Assistant action simulator
  const handleAiAction = (actionType) => {
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

  // Dynamic filter lists
  const filteredApis = APIS.filter((api) => {
    const matchesSearch =
      searchQuery === "" ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.endpoints.some(e => e.path.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || api.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Direct actions from CLI Command Palette
  const handleCommandPaletteSelect = (api) => {
    selectApi(api);
    setCommandPaletteOpen(false);
    setSearchQuery("");
  };

  // Copy helpers
  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  // Compare calculation helper
  const api1 = APIS.find(a => a.id === compareApi1Id) || APIS[0];
  const api2 = APIS.find(a => a.id === compareApi2Id) || APIS[1];

  return (
    <div className="flex-1 flex flex-col bg-[#0B0D10] text-[#F4F4F5] font-sans antialiased min-h-screen">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B0D10] border-b border-[#24272C] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div 
            onClick={() => { setSelectedApi(null); setActiveTab("home"); setSearchQuery(""); }} 
            className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-lg tracking-tight select-none text-white hover:text-zinc-300 transition-colors"
          >
            <span>apiPedia</span>
            <span className="text-[#4F8CFF] font-sans">•</span>
          </div>

          <nav className="hidden md:flex space-x-6 text-sm">
            <button 
              onClick={() => { setSelectedApi(null); setActiveTab("home"); }} 
              className={`hover:text-white transition-colors py-1 ${activeTab === "home" && !selectedApi ? "text-white font-medium" : "text-zinc-400"}`}
            >
              Search
            </button>
            <button 
              onClick={() => { setSelectedApi(null); setActiveTab("categories"); }} 
              className={`hover:text-white transition-colors py-1 ${activeTab === "categories" ? "text-white font-medium" : "text-zinc-400"}`}
            >
              Categories
            </button>
            <button 
              onClick={() => { setSelectedApi(null); setActiveTab("benchmarks"); }} 
              className={`hover:text-white transition-colors py-1 ${activeTab === "benchmarks" ? "text-white font-medium" : "text-zinc-400"}`}
            >
              Benchmarks
            </button>
            <button 
              onClick={() => { setSelectedApi(null); setActiveTab("compare"); }} 
              className={`hover:text-white transition-colors py-1 ${activeTab === "compare" ? "text-white font-medium" : "text-zinc-400"}`}
            >
              Compare
            </button>
            <button 
              onClick={() => { setSelectedApi(null); setActiveTab("docs"); }} 
              className={`hover:text-white transition-colors py-1 ${activeTab === "docs" ? "text-white font-medium" : "text-zinc-400"}`}
            >
              Docs
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div 
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-[#121417] border border-[#24272C] hover:border-[#4F8CFF]/50 px-3 py-1.5 rounded-lg text-xs text-zinc-500 cursor-pointer select-none transition-all"
          >
            <span>Search console</span>
            <kbd className="bg-[#181B20] text-zinc-400 px-1.5 py-0.5 rounded border border-[#24272C] text-[10px]">⌘K</kbd>
          </div>

          <div 
            onClick={() => setKeyboardModalOpen(true)}
            className="text-zinc-500 hover:text-white cursor-pointer p-1 text-sm font-mono"
            title="Keyboard shortcuts"
          >
            [?]
          </div>

          <button className="bg-[#121417] border border-[#24272C] hover:border-zinc-500 hover:text-white text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
            Login
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        
        {/* =============================================================== */}
        {/* STATE A: API DETAILS PAGE */}
        {/* =============================================================== */}
        {selectedApi ? (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Breadcrumb & Navigation Back */}
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <span className="cursor-pointer hover:text-white" onClick={() => setSelectedApi(null)}>APIs</span>
              <span>/</span>
              <span className="text-zinc-300 font-medium">{selectedApi.name}</span>
            </div>

            {/* API Detail Header */}
            <div className="bg-[#121417] border border-[#24272C] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white" 
                  style={{ backgroundColor: selectedApi.logoColor }}
                >
                  {selectedApi.name[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">{selectedApi.name}</h1>
                    {selectedApi.verified && (
                      <span className="bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                        Verified
                      </span>
                    )}
                    <span className="text-zinc-500 text-xs font-mono bg-[#181B20] px-2 py-0.5 rounded border border-[#24272C]">
                      {selectedApi.category}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1.5 max-w-xl leading-relaxed">{selectedApi.tagline}</p>
                </div>
              </div>

              {/* Header Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a 
                  href={selectedApi.docsUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Official Docs
                </a>
                <a 
                  href={selectedApi.githubUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  GitHub
                </a>
                <button 
                  onClick={() => handleCopyText(selectedApi.baseUrl, "Base URL")}
                  className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
                >
                  <span>Copy Base URL</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Selection */}
            <div className="border-b border-[#24272C] flex space-x-1 overflow-x-auto scrollbar-none">
              {[
                { id: "overview", label: "Overview" },
                { id: "playground", label: "Playground" },
                { id: "docs", label: "Documentation" },
                { id: "dna", label: "API DNA & Intelligence" },
                { id: "pain", label: "Developer Pain Index" },
                { id: "recipes", label: "Community Recipes" },
                { id: "paths", label: "Learning Paths" },
                { id: "analytics", label: "Analytics" }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setDetailSubTab(sub.id);
                    setInlineAiExplanation("");
                  }}
                  className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-all ${
                    detailSubTab === sub.id 
                      ? "border-[#4F8CFF] text-[#4F8CFF]" 
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUB-VIEW RENDERING */}
            <div className="flex-1 min-h-[500px]">
              
              {/* SUB-TAB: OVERVIEW */}
              {detailSubTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Detailed Vitals List */}
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">Core Metrics</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      
                      {[
                        { label: "Health Score", value: `${selectedApi.vitals.healthScore}%`, detail: "Operational Status", color: "text-emerald-500" },
                        { label: "Documentation Quality", value: `${selectedApi.vitals.docsScore}/10`, detail: "Highly readable", color: "text-[#4F8CFF]" },
                        { label: "SDK Quality", value: `${selectedApi.vitals.sdkScore}/10`, detail: "Excellent coverage", color: "text-amber-500" },
                        { label: "Average Latency", value: `${selectedApi.vitals.latency}ms`, detail: "Global p50 metric", color: "text-white" },
                        { label: "Monthly Uptime", value: `${selectedApi.vitals.uptime}%`, detail: "SLA Guaranteed", color: "text-emerald-500" },
                        { label: "Security Profile", value: selectedApi.vitals.security.split(",")[0], detail: "Enterprise standard", color: "text-white" },
                        { label: "Last Sync Commit", value: selectedApi.vitals.lastUpdated, detail: "Automatic monitoring", color: "text-zinc-400" },
                        { label: "Rate Limits", value: selectedApi.vitals.rateLimit, detail: "Standard tier", color: "text-white" },
                        { label: "Authentication", value: selectedApi.vitals.authType, detail: "Key handshake", color: "text-white" }
                      ].map((item, idx) => (
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
                      <p className="text-zinc-400 text-sm leading-relaxed">{selectedApi.description}</p>
                    </div>
                  </div>

                  {/* Sidebar Metadata */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 h-fit space-y-6">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">Repository Metadata</h3>
                    
                    <div className="space-y-4 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">API Version:</span>
                        <span className="text-zinc-300 font-medium">{selectedApi.vitals.version}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">Response Format:</span>
                        <span className="text-zinc-300 font-medium">{selectedApi.vitals.responseFormat}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">Difficulty Curve:</span>
                        <span className={`font-semibold ${selectedApi.vitals.difficulty === "Easy" ? "text-emerald-500" : selectedApi.vitals.difficulty === "Medium" ? "text-amber-500" : "text-rose-500"}`}>
                          {selectedApi.vitals.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">GitHub Commits:</span>
                        <span className="text-zinc-300 font-medium">{selectedApi.vitals.commitsCount}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">SDK Maturity:</span>
                        <span className="text-zinc-300 font-medium text-right max-w-[150px] truncate">{selectedApi.dna.sdkMaturity.split(" ")[0]}</span>
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
              )}

              {/* SUB-TAB: PLAYGROUND */}
              {detailSubTab === "playground" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-[#24272C] rounded-xl overflow-hidden bg-[#121417]">
                  
                  {/* Left Column: Editor & Params */}
                  <div className="flex flex-col border-r border-[#24272C] p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Interactive Sandbox</h3>
                      <div className="flex space-x-1.5">
                        {/* Hidden AI features inside Sections */}
                        <button 
                          onClick={() => handleAiAction("explain")}
                          className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-400 hover:text-white px-2 py-1 rounded text-[10px] font-medium transition-colors"
                          title="Explain endpoint rules"
                        >
                          ✨ Explain Endpoint
                        </button>
                        <button 
                          onClick={() => handleAiAction("practices")}
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
                          selectedApi.endpoints[selectedEndpointIndex]?.method === "POST"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}>
                          {selectedApi.endpoints[selectedEndpointIndex]?.method}
                        </span>
                        <select 
                          className="flex-1 bg-[#181B20] border border-[#24272C] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
                          value={selectedEndpointIndex}
                          onChange={(e) => selectEndpoint(selectedApi, parseInt(e.target.value))}
                        >
                          {selectedApi.endpoints.map((e, idx) => (
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
                        value={playgroundHeaders}
                        onChange={(e) => setPlaygroundHeaders(e.target.value)}
                      />
                    </div>

                    {/* Body Input (only for POST requests) */}
                    {selectedApi.endpoints[selectedEndpointIndex]?.method === "POST" && (
                      <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Request Body (JSON)</label>
                        <textarea
                          rows={6}
                          className="w-full flex-1 bg-[#181B20] border border-[#24272C] rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-[#4F8CFF] resize-y"
                          value={playgroundBody}
                          onChange={(e) => setPlaygroundBody(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Execute Sandbox Request Button */}
                    <button 
                      onClick={handlePlaygroundSend}
                      disabled={playgroundLoading}
                      className="w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-colors disabled:opacity-50"
                    >
                      {playgroundLoading ? "DISPATCHING REQUEST..." : "RUN SANDBOX QUERY"}
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
                            onClick={() => handleCopyText(selectedApi.endpoints[selectedEndpointIndex]?.codeExamples.python || "", "Python Code")}
                            className="text-zinc-500 hover:text-white text-[10px] font-mono"
                          >
                            [Copy Code]
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre select-all bg-[#0B0D10]/50 flex-1">
                          {selectedApi.endpoints[selectedEndpointIndex]?.codeExamples.python}
                        </pre>
                      </div>
                    </div>

                    {/* API response output box */}
                    <div className="space-y-2 flex-1 flex flex-col">
                      <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">API response payload</label>
                      <div className="bg-[#181B20] border border-[#24272C] rounded-lg p-4 flex flex-col flex-1 justify-center min-h-[180px] font-mono text-xs">
                        {playgroundResponse ? (
                          <div className="space-y-3 flex-1 flex flex-col">
                            <div className="flex items-center justify-between text-[10px] border-b border-[#24272C] pb-2 text-zinc-500">
                              <span>STATUS: <span className="text-emerald-500 font-bold">{playgroundResponse.status} OK</span></span>
                              <span>LATENCY: <span className="text-white font-bold">{playgroundResponseTime}ms</span></span>
                            </div>
                            <pre className="flex-1 text-[11px] text-emerald-400 overflow-auto whitespace-pre select-all bg-[#0B0D10]/50 p-2.5 rounded border border-[#24272C]/40">
                              {JSON.stringify(playgroundResponse.body, null, 2)}
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
              )}

              {/* SUB-TAB: DOCUMENTATION */}
              {detailSubTab === "docs" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Column: Sidebar of endpoints */}
                  <div className="space-y-2 lg:col-span-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono pl-2">Endpoints</h3>
                    <div className="space-y-1 bg-[#121417] border border-[#24272C] rounded-lg p-2">
                      {selectedApi.endpoints.map((e, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectEndpoint(selectedApi, idx)}
                          className={`w-full text-left px-3 py-2 rounded text-xs font-mono flex items-center space-x-2 transition-colors ${
                            selectedEndpointIndex === idx 
                              ? "bg-[#181B20] border border-[#24272C] text-[#4F8CFF]" 
                              : "hover:bg-[#181B20] text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${e.method === "POST" ? "text-amber-500" : "text-emerald-500"}`}>{e.method}</span>
                          <span className="truncate">{e.path}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Endpoint Doc details */}
                  <div className="lg:col-span-3 bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-6">
                    {(() => {
                      const ep = selectedApi.endpoints[selectedEndpointIndex] || selectedApi.endpoints[0];
                      return (
                        <div className="space-y-6">
                          
                          {/* Heading */}
                          <div className="border-b border-[#24272C] pb-4 space-y-2">
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
                            <div className="border border-[#24272C] rounded-lg overflow-hidden">
                              <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-[#181B20] border-b border-[#24272C] text-zinc-500">
                                  <tr>
                                    <th className="p-3">Field</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Required</th>
                                    <th className="p-3">Description</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#24272C]">
                                  {ep.params.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-[#181B20]/40">
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
                            <div className="border border-[#24272C] rounded-lg overflow-hidden bg-[#181B20]">
                              <div className="bg-[#121417] px-4 py-2 border-b border-[#24272C] flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">JavaScript Fetch client</span>
                                <button 
                                  onClick={() => handleCopyText(ep.codeExamples.javascript || "", "Javascript SDK Code")}
                                  className="text-zinc-500 hover:text-white text-[10px] font-mono"
                                >
                                  [Copy Code]
                                </button>
                              </div>
                              <pre className="p-4 text-[11px] font-mono text-[#4F8CFF] overflow-auto whitespace-pre bg-[#0B0D10]/40">
                                {ep.codeExamples.javascript}
                              </pre>
                            </div>
                          </div>

                          {/* Response Payload Specification */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Response Schema (200 OK)</h3>
                            <pre className="p-4 bg-[#181B20] border border-[#24272C] rounded-lg text-[11px] font-mono text-emerald-400 overflow-auto max-h-[300px]">
                              {JSON.stringify(ep.response.body, null, 2)}
                            </pre>
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

              {/* SUB-TAB: API DNA & INTELLIGENCE */}
              {detailSubTab === "dna" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Radar Chart SVG Map */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-6 flex flex-col items-center space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono self-start">API DNA Dimension Vectors</h3>
                    
                    {/* SVG Render for Radar Vector */}
                    <div className="relative w-64 h-64 flex items-center justify-center bg-[#181B20] rounded-xl border border-[#24272C]/60">
                      <svg viewBox="0 0 200 200" className="w-48 h-48">
                        {/* Background pentagons */}
                        <polygon points="100,20 180,80 150,170 50,170 20,80" fill="none" stroke="#24272C" strokeWidth="1" />
                        <polygon points="100,50 160,95 137,150 63,150 40,95" fill="none" stroke="#24272C" strokeWidth="1" />
                        <polygon points="100,80 130,110 118,135 82,135 70,110" fill="none" stroke="#24272C" strokeWidth="1" />
                        
                        {/* Label connectors */}
                        <line x1="100" y1="100" x2="100" y2="20" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="100" x2="180" y2="80" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="100" x2="150" y2="170" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="100" x2="50" y2="170" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="100" x2="20" y2="80" stroke="#24272C" strokeWidth="1" strokeDasharray="3,3" />

                        {/* Radar polygon calculated dynamically from API values */}
                        {(() => {
                          const r = selectedApi.dna.radar;
                          const p1 = 100 - (r.auth * 0.8);
                          const p2x = 100 + (r.performance * 0.8) * 0.95;
                          const p2y = 100 - (r.performance * 0.8) * 0.31;
                          const p3x = 100 + (r.docs * 0.8) * 0.58;
                          const p3y = 100 + (r.docs * 0.8) * 0.81;
                          const p4x = 100 - (r.dx * 0.8) * 0.58;
                          const p4y = 100 + (r.dx * 0.8) * 0.81;
                          const p5x = 100 - (r.pricing * 0.8) * 0.95;
                          const p5y = 100 - (r.pricing * 0.8) * 0.31;

                          return (
                            <polygon 
                              points={`${100},${p1} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y} ${p5x},${p5y}`} 
                              fill="rgba(79, 140, 255, 0.15)" 
                              stroke="#4F8CFF" 
                              strokeWidth="2" 
                            />
                          );
                        })()}
                      </svg>
                      
                      {/* Labels overlays */}
                      <span className="absolute top-2 text-[9px] text-zinc-500 font-mono uppercase">Auth Quality</span>
                      <span className="absolute right-2 top-24 text-[9px] text-zinc-500 font-mono uppercase">Performance</span>
                      <span className="absolute bottom-2 right-6 text-[9px] text-zinc-500 font-mono uppercase">Docs</span>
                      <span className="absolute bottom-2 left-6 text-[9px] text-zinc-500 font-mono uppercase">DevEx</span>
                      <span className="absolute left-2 top-24 text-[9px] text-zinc-500 font-mono uppercase">Pricing</span>
                    </div>

                    <div className="grid grid-cols-5 w-full text-center text-[10px] font-mono border-t border-[#24272C] pt-4">
                      {Object.entries(selectedApi.dna.radar).map(([k, v]) => (
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
                    <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Similarity Alignment</h3>
                      <div className="space-y-3">
                        {selectedApi.dna.similarities.map((sim, idx) => (
                          <div key={idx} className="p-3 bg-[#181B20] border border-[#24272C] rounded-lg flex items-center justify-between">
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
                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-4 flex flex-col justify-between">
                        <span className="text-[9px] text-zinc-500 font-mono font-semibold uppercase">Deprecation Risk</span>
                        <span className="text-lg font-bold text-emerald-500 tracking-tight mt-1">{selectedApi.dna.deprecationRisk.split(" ")[0]}</span>
                        <span className="text-[9px] text-zinc-500 mt-1 leading-normal">Evaluated via active SDK issues</span>
                      </div>
                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-4 flex flex-col justify-between">
                        <span className="text-[9px] text-zinc-500 font-mono font-semibold uppercase">6m Breaking Prediction</span>
                        <span className="text-lg font-bold text-amber-500 tracking-tight mt-1">{selectedApi.dna.breakingChangesPredictor}%</span>
                        <span className="text-[9px] text-zinc-500 mt-1 leading-normal">Computed from evolutionary logs</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Evolution Timeline</h3>
                      <div className="relative pl-4 border-l border-[#24272C] space-y-4 text-xs">
                        {selectedApi.dna.evolutionTimeline.map((time, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot */}
                            <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full border border-[#24272C] bg-[#4F8CFF]"></div>
                            <span className="text-[10px] text-zinc-500 font-mono">{time.date}</span>
                            <p className="text-zinc-300 font-medium mt-0.5 leading-relaxed">{time.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SUB-TAB: DEVELOPER PAIN INDEX */}
              {detailSubTab === "pain" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Pain Stats & Indicators */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-6 h-fit">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Community Pain Metrics</h3>
                    
                    <div className="space-y-4 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">GitHub Issues:</span>
                        <span className="text-white font-semibold">{selectedApi.painIndex.githubIssues}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">StackOverflow:</span>
                        <span className="text-white font-semibold">{selectedApi.painIndex.stackoverflowQuestions} threads</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">Discord Mentions:</span>
                        <span className="text-white font-semibold">{selectedApi.painIndex.discordMentions}/day</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">Reddit Sentiment:</span>
                        <span className="text-zinc-300 font-semibold">{selectedApi.painIndex.redditActivity}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#24272C]">
                        <span className="text-zinc-500">Learning Curve:</span>
                        <span className="text-zinc-300 font-semibold">{selectedApi.painIndex.learningDifficulty}</span>
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
                        {selectedApi.painIndex.topComplaints.map((comp, idx) => (
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
                        {selectedApi.painIndex.confusingEndpoints.map((ep, idx) => (
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
                        {selectedApi.painIndex.commonErrors.map((err, idx) => (
                          <div key={idx} className="p-3 bg-[#181B20] border border-[#24272C] rounded-lg space-y-2">
                            <div className="flex items-center justify-between border-b border-[#24272C] pb-1.5">
                              <span className="text-zinc-300 font-semibold">Error: <span className="text-rose-500">{err.code}</span></span>
                              <button 
                                onClick={() => handleAiAction("explain_error")}
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
              )}

              {/* SUB-TAB: INTEGRATION RECIPES */}
              {detailSubTab === "recipes" && (
                <div className="space-y-6">
                  {selectedApi.recipes.map((recipe, idx) => (
                    <div key={idx} className="bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-6">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-[#24272C] pb-4">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white tracking-tight">{recipe.title}</h3>
                          <div className="flex space-x-2 text-[10px] font-mono">
                            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{recipe.framework}</span>
                            <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">{recipe.duration} build</span>
                            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">{recipe.difficulty} complexity</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCopyText(recipe.code, "Recipe Code")}
                          className="bg-[#181B20] border border-[#24272C] hover:bg-[#24272C] text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono"
                        >
                          [Copy Recipe]
                        </button>
                      </div>

                      {/* Schematic Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* ASCII / SVG Architecture Diagrams */}
                        <div className="bg-[#181B20] border border-[#24272C] rounded-lg p-5 font-mono text-[10px] text-zinc-400 overflow-auto whitespace-pre">
                          <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Integration Flow Architecture</div>
                          {recipe.diagram}
                        </div>

                        {/* Source code block */}
                        <div className="bg-[#181B20] border border-[#24272C] rounded-lg overflow-hidden flex flex-col">
                          <div className="bg-[#121417] border-b border-[#24272C] px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                            <span>production-integration.js</span>
                          </div>
                          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre select-all bg-[#0B0D10]/40 flex-1">
                            {recipe.code}
                          </pre>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* SUB-TAB: LEARNING PATHS */}
              {detailSubTab === "paths" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedApi.paths.map((path, idx) => (
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
              )}

              {/* SUB-TAB: ANALYTICS */}
              {detailSubTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Uptime Trend Chart */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Historical Latency (ms)</h3>
                    
                    {/* SVG Line Graph */}
                    <div className="h-48 border-b border-l border-[#24272C]/80 relative flex items-end p-2">
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        {/* Dynamic Polyline computed from analytics data */}
                        {(() => {
                          const pts = selectedApi.analytics.latency;
                          const min = Math.min(...pts) - 10;
                          const max = Math.max(...pts) + 10;
                          const delta = max - min;
                          const coords = pts.map((val, idx) => {
                            const x = (idx / (pts.length - 1)) * 100;
                            const y = 40 - ((val - min) / delta) * 35;
                            return `${x},${y}`;
                          }).join(" ");

                          return (
                            <>
                              <polyline points={coords} fill="none" stroke="#4F8CFF" strokeWidth="1.5" />
                              {pts.map((val, idx) => {
                                const x = (idx / (pts.length - 1)) * 100;
                                const y = 40 - ((val - min) / delta) * 35;
                                return (
                                  <circle key={idx} cx={x} cy={y} r="1.5" fill="#4F8CFF" />
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      {selectedApi.analytics.labels.map((l, idx) => (
                        <span key={idx}>{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* Uptime Status Metrics */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Uptime Status Timeline</h3>
                    
                    {/* SVG Line Graph */}
                    <div className="h-48 border-b border-l border-[#24272C]/80 relative flex items-end p-2">
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        {(() => {
                          const pts = selectedApi.analytics.uptime;
                          const min = 99.8;
                          const max = 100.05;
                          const delta = max - min;
                          const coords = pts.map((val, idx) => {
                            const x = (idx / (pts.length - 1)) * 100;
                            const y = 40 - ((val - min) / delta) * 35;
                            return `${x},${y}`;
                          }).join(" ");

                          return (
                            <>
                              <polyline points={coords} fill="none" stroke="#10B981" strokeWidth="1.5" />
                              {pts.map((val, idx) => {
                                const x = (idx / (pts.length - 1)) * 100;
                                const y = 40 - ((val - min) / delta) * 35;
                                return (
                                  <circle key={idx} cx={x} cy={y} r="1.5" fill="#10B981" />
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      {selectedApi.analytics.labels.map((l, idx) => (
                        <span key={idx}>{l}</span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-8">
            
            {/* =============================================================== */}
            {/* STATE B: LANDING VIEW / SEARCH LISTINGS */}
            {/* =============================================================== */}
            {activeTab === "home" && (
              <div className="flex flex-col space-y-10 py-6 max-w-4xl mx-auto w-full">
                
                {/* Visual Title */}
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none font-sans">
                    apiPedia
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium">
                    Developer intelligence platform for APIs. Speed over marketing fluff.
                  </p>
                </div>

                {/* Centralized Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full bg-[#121417] border border-[#24272C] hover:border-[#4F8CFF]/50 focus:border-[#4F8CFF] rounded-xl pl-12 pr-16 py-3.5 text-sm text-white outline-none placeholder-zinc-500 font-sans transition-all shadow-lg"
                    placeholder={placeholders[placeholderIndex]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-[10px] font-mono text-zinc-500 bg-[#181B20] border border-[#24272C] px-2 py-0.5 rounded shadow">
                      Press /
                    </span>
                  </div>
                </div>

                {/* SEARCH RESULTS CONDITIONAL GRID */}
                {searchQuery !== "" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>Found {filteredApis.length} matching APIs</span>
                      <button onClick={() => setSearchQuery("")} className="hover:text-white">Clear search</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredApis.map((api) => (
                        <div 
                          key={api.id}
                          onClick={() => { selectApi(api); }}
                          className="bg-[#121417] border border-[#24272C] hover:border-[#4F8CFF]/60 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
                        >
                          <div className="flex items-start space-x-3.5">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white select-none"
                              style={{ backgroundColor: api.logoColor }}
                            >
                              {api.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-[#4F8CFF] transition-colors">{api.name}</h3>
                                {api.verified && (
                                  <span className="bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-500 text-xs mt-1 truncate">{api.tagline}</p>
                            </div>
                          </div>

                          {/* Stats Metrics Row */}
                          <div className="grid grid-cols-3 gap-2 border-t border-[#24272C]/60 pt-3 text-[10px] font-mono text-zinc-400">
                            <div className="flex flex-col">
                              <span className="text-zinc-500 uppercase text-[9px]">Uptime</span>
                              <span className="font-bold text-emerald-500">{api.vitals.uptime}%</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-500 uppercase text-[9px]">Latency</span>
                              <span className="font-bold text-white">{api.vitals.latency}ms</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-500 uppercase text-[9px]">Auth Model</span>
                              <span className="font-semibold text-zinc-300 truncate">{api.vitals.authType.split(" ")[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // DASHBOARD METRIC LISTINGS (NO MARKETING COPY)
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    
                    {/* Columns grid */}
                    <div className="space-y-6">
                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Popular Vitals</h3>
                        <div className="space-y-2">
                          {APIS.slice(0, 4).map((api) => (
                            <div 
                              key={api.id}
                              onClick={() => { selectApi(api); }}
                              className="flex items-center justify-between p-2.5 bg-[#181B20]/40 border border-[#24272C]/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                                <span className="text-xs font-bold text-white">{api.name}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-[10px] font-mono">
                                <span className="text-zinc-500">Latency: <span className="text-white font-bold">{api.vitals.latency}ms</span></span>
                                <span className="text-emerald-500 font-semibold">{api.vitals.uptime}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Trending Channels</h3>
                        <div className="space-y-2">
                          {APIS.slice(4, 7).map((api) => (
                            <div 
                              key={api.id}
                              onClick={() => { selectApi(api); }}
                              className="flex items-center justify-between p-2.5 bg-[#181B20]/40 border border-[#24272C]/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                                <span className="text-xs font-bold text-white">{api.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                {api.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Columns grid 2 */}
                    <div className="space-y-6">
                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Documentation Leaderboard</h3>
                        <div className="space-y-2">
                          {[...APIS].sort((a, b) => b.vitals.docsScore - a.vitals.docsScore).slice(0, 4).map((api) => (
                            <div 
                              key={api.id}
                              onClick={() => { selectApi(api); }}
                              className="flex items-center justify-between p-2.5 bg-[#181B20]/40 border border-[#24272C]/40 rounded-lg hover:border-zinc-500 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                                <span className="text-xs font-bold text-white">{api.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#4F8CFF] font-bold">
                                {api.vitals.docsScore}/10 DX
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Developer Warning Lists */}
                      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500 font-mono">Integration Friction Warnings</h3>
                        <div className="space-y-2">
                          {[...APIS].sort((a, b) => b.painIndex.githubIssues - a.painIndex.githubIssues).slice(0, 3).map((api) => (
                            <div 
                              key={api.id}
                              onClick={() => { selectApi(api); setDetailSubTab("pain"); }}
                              className="flex items-center justify-between p-2.5 bg-[#181B20]/40 border border-rose-500/20 rounded-lg hover:border-rose-500 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs font-bold text-white">{api.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-rose-400 font-semibold">
                                {api.painIndex.githubIssues} active bugs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* =============================================================== */}
            {/* STATE C: CATEGORIES VIEW */}
            {/* =============================================================== */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#24272C] pb-4">
                  <h2 className="text-xl font-bold text-white">API Directories</h2>
                  
                  {/* Pill filters */}
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          selectedCategory === cat 
                            ? "bg-[#4F8CFF] text-white" 
                            : "bg-[#121417] border border-[#24272C] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredApis.map(api => (
                    <div
                      key={api.id}
                      onClick={() => { selectApi(api); }}
                      className="bg-[#121417] border border-[#24272C] hover:border-zinc-500 p-5 rounded-xl cursor-pointer transition-all space-y-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: api.logoColor }}>
                          {api.name[0]}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{api.name}</h3>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{api.category}</span>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{api.tagline}</p>
                      
                      <div className="pt-3 border-t border-[#24272C] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Latency: <strong className="text-white">{api.vitals.latency}ms</strong></span>
                        <span className="text-emerald-500 font-semibold">{api.vitals.uptime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STATE D: BENCHMARKS TAB */}
            {/* =============================================================== */}
            {activeTab === "benchmarks" && (
              <div className="space-y-8">
                <div className="border-b border-[#24272C] pb-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">API Benchmarks & Performance</h2>
                  <p className="text-zinc-500 text-xs mt-1 font-mono">Aggregated and verified daily by local agents.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Lowest latency Leaderboard */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 font-mono">Fastest Response (Latency)</h3>
                    <div className="space-y-3 font-mono text-xs">
                      {[...APIS].sort((a, b) => a.vitals.latency - b.vitals.latency).map((api, idx) => (
                        <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-zinc-500">#{idx + 1}</span>
                            <span className="text-white font-bold">{api.name}</span>
                          </div>
                          <span className="text-emerald-400 font-bold">{api.vitals.latency}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highest Uptime Leaderboard */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 font-mono">Highest Uptime (SLA Check)</h3>
                    <div className="space-y-3 font-mono text-xs">
                      {[...APIS].sort((a, b) => b.vitals.uptime - a.vitals.uptime).map((api, idx) => (
                        <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-zinc-500">#{idx + 1}</span>
                            <span className="text-white font-bold">{api.name}</span>
                          </div>
                          <span className="text-emerald-400 font-bold">{api.vitals.uptime}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Breaking Changes Warning */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500 font-mono">High Deprecation Index</h3>
                    <div className="space-y-3 font-mono text-xs">
                      {[...APIS].sort((a, b) => b.dna.breakingChangesPredictor - a.dna.breakingChangesPredictor).map((api, idx) => (
                        <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-rose-500/20 rounded-lg">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-zinc-500">#{idx + 1}</span>
                            <span className="text-white font-bold">{api.name}</span>
                          </div>
                          <span className="text-rose-400 font-bold">{api.dna.breakingChangesPredictor}% predicted changes</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best DX rating */}
                  <div className="bg-[#121417] border border-[#24272C] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4F8CFF] font-mono">Best Developer Experience (SDK + Docs)</h3>
                    <div className="space-y-3 font-mono text-xs">
                      {[...APIS].sort((a, b) => b.vitals.docsScore - a.vitals.docsScore).map((api, idx) => (
                        <div key={api.id} className="flex items-center justify-between p-2.5 bg-[#181B20]/50 border border-[#24272C]/40 rounded-lg">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-zinc-500">#{idx + 1}</span>
                            <span className="text-white font-bold">{api.name}</span>
                          </div>
                          <span className="text-[#4F8CFF] font-bold">{api.vitals.docsScore}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STATE E: COMPARE TAB */}
            {/* =============================================================== */}
            {activeTab === "compare" && (
              <div className="space-y-6">
                <div className="border-b border-[#24272C] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">API Comparison Matrix</h2>
                    <p className="text-zinc-500 text-xs mt-1 font-mono">Select and compare developer vitals side-by-side.</p>
                  </div>

                  {/* Comparators */}
                  <div className="flex space-x-4">
                    <select
                      className="bg-[#121417] border border-[#24272C] text-xs text-white p-2 rounded-lg outline-none"
                      value={compareApi1Id}
                      onChange={(e) => setCompareApi1Id(e.target.value)}
                    >
                      {APIS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <span className="text-zinc-500 font-mono self-center">vs</span>
                    <select
                      className="bg-[#121417] border border-[#24272C] text-xs text-white p-2 rounded-lg outline-none"
                      value={compareApi2Id}
                      onChange={(e) => setCompareApi2Id(e.target.value)}
                    >
                      {APIS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Comparison Grid Table */}
                <div className="bg-[#121417] border border-[#24272C] rounded-xl overflow-hidden shadow-lg">
                  <div className="grid grid-cols-3 bg-[#181B20] border-b border-[#24272C] p-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                    <div>Metric</div>
                    <div>{api1.name}</div>
                    <div>{api2.name}</div>
                  </div>

                  <div className="divide-y divide-[#24272C]">
                    {[
                      { label: "Category", v1: api1.category, v2: api2.category },
                      { label: "Health Score", v1: `${api1.vitals.healthScore}%`, v2: `${api2.vitals.healthScore}%` },
                      { label: "Latency (p50)", v1: `${api1.vitals.latency}ms`, v2: `${api2.vitals.latency}ms` },
                      { label: "Uptime guarantee", v1: `${api1.vitals.uptime}%`, v2: `${api2.vitals.uptime}%` },
                      { label: "Docs DX Grade", v1: `${api1.vitals.docsScore}/10`, v2: `${api2.vitals.docsScore}/10` },
                      { label: "SDK Score", v1: `${api1.vitals.sdkScore}/10`, v2: `${api2.vitals.sdkScore}/10` },
                      { label: "Authentication Type", v1: api1.vitals.authType, v2: api2.vitals.authType },
                      { label: "Rate Limits", v1: api1.vitals.rateLimit, v2: api2.vitals.rateLimit },
                      { label: "Deprecation Risk", v1: api1.dna.deprecationRisk, v2: api2.dna.deprecationRisk },
                      { label: "Migration Complexity", v1: api1.dna.migrationComplexity, v2: api2.dna.migrationComplexity }
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-4 text-xs font-mono hover:bg-[#181B20]/25 transition-colors">
                        <div className="text-zinc-500 uppercase">{row.label}</div>
                        <div className="text-white font-medium">{row.v1}</div>
                        <div className="text-white font-medium">{row.v2}</div>
                      </div>
                    ))}

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-3 p-4 text-xs">
                      <div className="text-zinc-500 uppercase font-mono">Pros & Strengths</div>
                      <div className="text-emerald-400 font-sans leading-relaxed">
                        Excellent developer feedback. Highly stable SDK environments. Minimal API updates signature drift.
                      </div>
                      <div className="text-emerald-400 font-sans leading-relaxed">
                        High scalability. Flexible custom billing logic. Rapid feature rollouts.
                      </div>
                    </div>

                    <div className="grid grid-cols-3 p-4 text-xs">
                      <div className="text-zinc-500 uppercase font-mono">Cons & Limitations</div>
                      <div className="text-rose-400 font-sans leading-relaxed">
                        Requires multi-step signatures handling. Higher processing fees for minor merchants.
                      </div>
                      <div className="text-rose-400 font-sans leading-relaxed">
                        Enterprise integrations are complex. SDK wrappers undergo active lifecycle deprecation updates.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STATE F: DOCUMENTATION TAB */}
            {/* =============================================================== */}
            {activeTab === "docs" && (
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
            )}

          </div>
        )}

      </main>

      {/* =============================================================== */}
      {/* OVERLAY: RAYCAST-STYLE GLOBAL COMMAND PALETTE */}
      {/* =============================================================== */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-xl bg-[#121417] border border-[#24272C] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">
            
            {/* Header / Input */}
            <div className="p-3 border-b border-[#24272C] flex items-center space-x-3">
              <span className="text-zinc-500">⌘</span>
              <input
                type="text"
                autoFocus
                className="flex-1 bg-transparent border-none text-xs text-white placeholder-zinc-500 outline-none"
                placeholder="Search APIs, command routes, or directories..."
                value={commandPaletteQuery}
                onChange={(e) => setCommandPaletteQuery(e.target.value)}
              />
              <span 
                onClick={() => setCommandPaletteOpen(false)}
                className="text-[10px] text-zinc-500 hover:text-white cursor-pointer font-mono"
              >
                [ESC]
              </span>
            </div>

            {/* Results body */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono pl-2 block my-1">APIs matched</span>
              {APIS
                .filter(a => a.name.toLowerCase().includes(commandPaletteQuery.toLowerCase()))
                .map(api => (
                  <div
                    key={api.id}
                    onClick={() => handleCommandPaletteSelect(api)}
                    className="p-2.5 hover:bg-[#181B20] border border-transparent hover:border-[#24272C] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: api.logoColor }}></div>
                      <span className="text-white font-semibold">{api.name}</span>
                      <span className="text-zinc-500 text-[10px] font-mono">({api.category})</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 group-hover:text-[#4F8CFF] font-mono">Open API intelligence ➔</span>
                  </div>
                ))}
              
              <span className="text-[10px] text-zinc-500 font-mono pl-2 block my-2">Quick Navigation Shortcuts</span>
              {[
                { label: "Go to Benchmark Matrix", target: () => { setActiveTab("benchmarks"); setSelectedApi(null); setCommandPaletteOpen(false); } },
                { label: "Go to Compare panel", target: () => { setActiveTab("compare"); setSelectedApi(null); setCommandPaletteOpen(false); } },
                { label: "Go to API Categories", target: () => { setActiveTab("categories"); setSelectedApi(null); setCommandPaletteOpen(false); } },
                { label: "Go to API Reference Docs", target: () => { setActiveTab("docs"); setSelectedApi(null); setCommandPaletteOpen(false); } }
              ].map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={cmd.target}
                  className="p-2.5 hover:bg-[#181B20] border border-transparent hover:border-[#24272C] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all text-zinc-300 hover:text-white"
                >
                  <span>{cmd.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">CMD route</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* OVERLAY: KEYBOARD SHORTCUTS INSTRUCTIONS CHEATSHEET */}
      {/* =============================================================== */}
      {keyboardModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121417] border border-[#24272C] rounded-xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#24272C] pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Keyboard Shortcuts Console</h3>
              <button 
                onClick={() => setKeyboardModalOpen(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                [Close]
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press /</span>
                <span className="text-white font-bold">Focus Search Field</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Cmd + K</span>
                <span className="text-white font-bold">Open Command Console</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press G</span>
                <span className="text-white font-bold">Redirect to GitHub repo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press D</span>
                <span className="text-white font-bold">Open Endpoints Reference</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press P</span>
                <span className="text-white font-bold">Navigate to playground sandbox</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press C</span>
                <span className="text-white font-bold">Redirect to Comparison Matrix</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#24272C]">
                <span className="text-zinc-500">Press ?</span>
                <span className="text-white font-bold">Open Keyboard Shortcuts Panel</span>
              </div>
            </div>

            <div className="p-3 bg-[#181B20] border border-[#24272C] rounded-lg text-[10px] text-zinc-500 leading-relaxed font-mono">
              Designed for speed. Control the entire workspace flow directly from your home row keybindings.
            </div>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <footer className="border-t border-[#24272C] py-6 text-center text-[10px] text-zinc-600 font-mono mt-12 bg-[#0B0D10]">
        apiPedia Platform © 2026. Built with Next.js & TailwindCSS v4 theme configurations.
      </footer>

    </div>
  );
}
