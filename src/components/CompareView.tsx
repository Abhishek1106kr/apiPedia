"use client";

import { useEffect, useState } from "react";
import type { ApiEntry, MetricRow, SortBy } from "@/types/api";
import {
  METRIC_GROUPS,
  checkIsRowIdentical,
  getMetricClassifications,
  sortComparedApis,
} from "@/app/utils";

interface CompareViewProps {
  apis: ApiEntry[];
}

// Quick-difference blurb per known API id. Falls back to the tagline for any
// API not covered here — see docs/00-master-prompt.md §1 on labeling
// simulated content until Phase 6's AI engine generates this for real.
const QUICK_DIFFERENCE_BY_ID: Record<string, string> = {
  stripe: "Best SDK ecosystem and developer documentation rating. Strongest p95 performance metrics.",
  openai: "Advanced LLM APIs with high token density but moderate latency overheads.",
  github: "DevOps infrastructure integrations featuring very high commit activity and community scale.",
  clerk: "Fastest overall integration setup and Edge middleware token caching profiles.",
  twilio: "Direct telecom carrier queue bindings, but higher pricing scales.",
  razorpay: "Optimized local UPI checkout ledger integration workflows and flexible rates.",
  paypal: "Deep global merchant ledger settlements, but legacy API integration wrappers.",
  anthropic: "High context token cache support and reasoning compliance pipelines.",
  auth0: "Broad SAML SSO and custom script extensions, with high enterprise pricing tiers.",
};

export default function CompareView({ apis }: CompareViewProps) {
  const [comparedApiIds, setComparedApiIds] = useState<string[]>(["stripe", "razorpay"]);
  const [compareSearchQueries, setCompareSearchQueries] = useState<string[]>(["Stripe", "Razorpay"]);
  const [activeSearchDropdownSlot, setActiveSearchDropdownSlot] = useState<number | null>(null);
  const [pinnedMetricKeys, setPinnedMetricKeys] = useState<string[]>([]);
  const [hideIdentical, setHideIdentical] = useState(false);
  const [metricSearchQuery, setMetricSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("health");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Matches the previous global Escape handler's behavior of closing this
  // dropdown from anywhere on the page, not just while the input is focused.
  useEffect(() => {
    if (activeSearchDropdownSlot === null) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSearchDropdownSlot(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeSearchDropdownSlot]);

  const comparedApis = comparedApiIds
    .map((id) => apis.find((a) => a.id === id))
    .filter((a): a is ApiEntry => Boolean(a));
  const sortedComparedApis = sortComparedApis(comparedApis, sortBy);

  const handleExportCsv = (rows: ApiEntry[], groups: typeof METRIC_GROUPS, hideIdenticalRowCheck: boolean) => {
    let csv = "Category,Metric," + rows.map((a) => a.name).join(",") + "\n";
    Object.entries(groups).forEach(([groupName, metricRows]) => {
      metricRows.forEach((row) => {
        if (hideIdenticalRowCheck && checkIsRowIdentical(row, rows)) return;
        const vals = rows.map((a) => `"${String(row.get(a)).replace(/"/g, '""')}"`);
        csv += `"${groupName}","${row.label}",` + vals.join(",") + "\n";
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "apipedia_comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMarkdown = (rows: ApiEntry[], groups: typeof METRIC_GROUPS, hideIdenticalRowCheck: boolean) => {
    let md = `| Category | Metric | ` + rows.map((a) => a.name).join(" | ") + " |\n";
    md += `| --- | --- | ` + rows.map(() => "---").join(" | ") + " |\n";
    Object.entries(groups).forEach(([groupName, metricRows]) => {
      metricRows.forEach((row) => {
        if (hideIdenticalRowCheck && checkIsRowIdentical(row, rows)) return;
        const vals = rows.map((a) => String(row.get(a)));
        md += `| ${groupName} | ${row.label} | ` + vals.join(" | ") + " |\n";
      });
    });
    navigator.clipboard.writeText(md);
    alert("Markdown comparison table copied to clipboard!");
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportShare = (rows: ApiEntry[]) => {
    const ids = rows.map((a) => a.id).join(",");
    const url = `${window.location.origin}${window.location.pathname}?compare=${ids}`;
    navigator.clipboard.writeText(url);
    alert(`Comparison share link copied to clipboard: ${url}`);
  };

  const renderMetricCell = (row: MetricRow, api: ApiEntry, cls: string) => {
    const rawVal = row.get(api);
    return (
      <div key={api.id} className="px-4 border-r border-[#24272C]/40 last:border-r-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={`font-semibold ${
            cls === "best" ? "text-emerald-400" : cls === "weakest" ? "text-amber-400" : cls === "missing" ? "text-zinc-600" : "text-white"
          }`}>{String(rawVal)}</span>

          {cls === "best" && (
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1 py-0.25 rounded text-[8px] font-mono scale-90">Best</span>
          )}
          {cls === "weakest" && (
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.25 rounded text-[8px] font-mono scale-90">Weakest</span>
          )}
        </div>

        {row.type && cls !== "missing" && (
          <div className="w-full bg-[#181B20] h-1 rounded overflow-hidden">
            {(() => {
              const numeric = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
              const min = row.min ?? 0;
              const max = row.max ?? 100;
              const pct = Math.max(0, Math.min(100, ((numeric - min) / (max - min)) * 100));
              return (
                <div
                  className={`h-full ${cls === "best" ? "bg-emerald-500" : cls === "weakest" ? "bg-amber-500" : "bg-[#4F8CFF]"}`}
                  style={{ width: `${pct}%` }}
                />
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">

      {/* Header */}
      <div className="border-b border-[#24272C] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Compare APIs</h2>
          <p className="text-zinc-500 text-xs mt-1 font-mono">Search, select and compare any APIs instantly.</p>
        </div>
      </div>

      {/* API Search Selector Boxes */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {comparedApiIds.map((apiId, slotIdx) => {
            const activeApi = apis.find((a) => a.id === apiId);
            return (
              <div key={slotIdx} className="relative space-y-1 bg-[#121417] border border-[#24272C] p-3 rounded-lg flex flex-col justify-between">
                <label className="text-[9px] text-zinc-500 font-mono font-semibold uppercase tracking-wider">Slot {slotIdx + 1}</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-[#181B20] border border-[#24272C] focus:border-[#4F8CFF] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none placeholder-zinc-500 font-sans"
                    placeholder="Search API..."
                    value={compareSearchQueries[slotIdx] !== undefined ? compareSearchQueries[slotIdx] : (activeApi ? activeApi.name : "")}
                    onFocus={() => {
                      setActiveSearchDropdownSlot(slotIdx);
                      const newQueries = [...compareSearchQueries];
                      newQueries[slotIdx] = "";
                      setCompareSearchQueries(newQueries);
                    }}
                    onChange={(e) => {
                      const newQueries = [...compareSearchQueries];
                      newQueries[slotIdx] = e.target.value;
                      setCompareSearchQueries(newQueries);
                    }}
                  />
                  {/* Dropdown overlay */}
                  {activeSearchDropdownSlot === slotIdx && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#121417] border border-[#24272C] rounded-lg shadow-2xl z-30 max-h-60 overflow-y-auto p-1.5 space-y-1">
                      {apis
                        .filter((a) => a.name.toLowerCase().includes((compareSearchQueries[slotIdx] || "").toLowerCase()))
                        .map((api) => (
                          <div
                            key={api.id}
                            onClick={() => {
                              const newIds = [...comparedApiIds];
                              newIds[slotIdx] = api.id;
                              setComparedApiIds(newIds);

                              const newQueries = [...compareSearchQueries];
                              newQueries[slotIdx] = api.name;
                              setCompareSearchQueries(newQueries);

                              setActiveSearchDropdownSlot(null);
                            }}
                            className="p-2 hover:bg-[#181B20] border border-transparent hover:border-[#24272C] rounded-md cursor-pointer flex items-center justify-between text-xs transition-all"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: api.logoColor }}></div>
                              <span className="text-white font-semibold">{api.name}</span>
                              {api.verified && (
                                <span className="bg-[#4F8CFF]/10 text-[#4F8CFF] px-1 py-0.5 rounded text-[8px] font-mono">✓</span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">{api.vitals.healthScore}% Health</span>
                          </div>
                        ))}
                      {apis.filter((a) => a.name.toLowerCase().includes((compareSearchQueries[slotIdx] || "").toLowerCase())).length === 0 && (
                        <div className="p-3 text-center text-zinc-500 text-xs">No matching APIs</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add another API button */}
          {comparedApiIds.length < 5 && (
            <button
              onClick={() => {
                const unusedApi = apis.find((a) => !comparedApiIds.includes(a.id)) || apis[0];
                setComparedApiIds([...comparedApiIds, unusedApi.id]);
                setCompareSearchQueries([...compareSearchQueries, unusedApi.name]);
              }}
              className="bg-[#121417]/40 hover:bg-[#121417] border border-dashed border-[#24272C] hover:border-[#4F8CFF]/60 text-zinc-500 hover:text-[#4F8CFF] rounded-lg p-3 flex flex-col items-center justify-center space-y-1 text-xs font-semibold font-mono transition-all h-full min-h-[66px]"
            >
              <span>+ Add another API</span>
            </button>
          )}
        </div>

        {/* Chips indicating compared APIs */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          {comparedApiIds.map((apiId, idx) => {
            const api = apis.find((a) => a.id === apiId);
            if (!api) return null;
            return (
              <div key={apiId} className="flex items-center space-x-1.5 bg-[#121417] border border-[#24272C] px-3 py-1 rounded-full text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: api.logoColor }}></span>
                <span className="text-zinc-300 font-medium">{api.name}</span>
                {comparedApiIds.length > 2 && (
                  <button
                    onClick={() => {
                      const newIds = comparedApiIds.filter((id) => id !== apiId);
                      setComparedApiIds(newIds);
                      const newQueries = compareSearchQueries.filter((_, qIdx) => qIdx !== idx);
                      setCompareSearchQueries(newQueries);
                    }}
                    className="text-zinc-500 hover:text-white pl-1 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI generated Quick Difference summaries */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider">Quick Differences Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedComparedApis.map((api) => {
            const desc = QUICK_DIFFERENCE_BY_ID[api.id] ?? api.tagline;
            return (
              <div key={api.id} className="bg-[#121417] border border-[#24272C] p-3 rounded-lg space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: api.logoColor }}></div>
                  <span>{api.name}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Filters & Settings Row */}
      <div className="bg-[#121417] border border-[#24272C] rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Search metrics */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              className="w-full bg-[#181B20] border border-[#24272C] hover:border-zinc-500 focus:border-[#4F8CFF] rounded-lg pl-3 pr-8 py-1.5 text-xs text-white outline-none placeholder-zinc-500 font-sans"
              placeholder="Search Metrics... (e.g. Latency)"
              value={metricSearchQuery}
              onChange={(e) => setMetricSearchQuery(e.target.value)}
            />
          </div>

          {/* Sorting dropdown */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-zinc-500 font-mono">Sort columns:</span>
            <select
              className="bg-[#181B20] border border-[#24272C] text-xs text-white p-1.5 rounded-lg outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="health">Health Score</option>
              <option value="latency">Latency</option>
              <option value="sdk">SDK Quality</option>
              <option value="docs">Documentation</option>
              <option value="popularity">Popularity</option>
              <option value="community">Community Stars</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>

          {/* Hide Identical and star toggles */}
          <div className="flex items-center space-x-6 text-xs font-mono">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-zinc-400 hover:text-white">
              <input
                type="checkbox"
                className="rounded border-[#24272C] bg-[#181B20] text-[#4F8CFF] focus:ring-0"
                checked={hideIdentical}
                onChange={(e) => setHideIdentical(e.target.checked)}
              />
              <span>Hide identical values</span>
            </label>
          </div>

          {/* Export group */}
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <button
              onClick={() => handleExportCsv(sortedComparedApis, METRIC_GROUPS, hideIdentical)}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-2.5 py-1.5 rounded"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportMarkdown(sortedComparedApis, METRIC_GROUPS, hideIdentical)}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-2.5 py-1.5 rounded"
            >
              Markdown
            </button>
            <button
              onClick={handleExportPdf}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-2.5 py-1.5 rounded"
            >
              PDF
            </button>
            <button
              onClick={() => handleExportShare(sortedComparedApis)}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-300 px-2.5 py-1.5 rounded"
            >
              Share
            </button>
          </div>

        </div>

        {/* Quick Categories Navigation Filters */}
        <div className="flex flex-wrap gap-1.5 border-t border-[#24272C]/40 pt-3">
          {Object.keys(METRIC_GROUPS).map((groupName) => (
            <button
              key={groupName}
              onClick={() => {
                const el = document.getElementById(`metric-group-${groupName}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="bg-[#181B20] hover:bg-[#24272C] border border-[#24272C] text-zinc-400 hover:text-white px-2.5 py-1 rounded text-[10px] font-mono transition-colors"
            >
              {groupName}
            </button>
          ))}
        </div>

      </div>

      {/* Dynamic Comparison Grid Table with Horizontal Scroll */}
      <div className="border border-[#24272C] rounded-xl overflow-x-auto w-full bg-[#121417] shadow-xl">

        <div
          className="flex flex-col divide-y divide-[#24272C]"
          style={{ minWidth: `${225 + sortedComparedApis.length * 200}px` }}
        >

          {/* Header Row */}
          <div
            className="grid items-center bg-[#181B20] text-xs font-mono font-semibold"
            style={{ gridTemplateColumns: `225px repeat(${sortedComparedApis.length}, minmax(200px, 1fr))` }}
          >
            <div className="p-4 border-r border-[#24272C] text-zinc-500 uppercase font-bold sticky left-0 bg-[#181B20] z-20">Metric Name</div>
            {sortedComparedApis.map((api) => (
              <div key={api.id} className="p-4 flex items-center space-x-2 border-r border-[#24272C] last:border-0 justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: api.logoColor }}></div>
                  <span className="text-white font-bold">{api.name}</span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{api.category}</span>
              </div>
            ))}
          </div>

          {/* PINNED METRICS GROUP (If any) */}
          {pinnedMetricKeys.length > 0 && (
            <div className="flex flex-col bg-[#1c222c]/20 border-b border-[#24272C]">
              <div
                className="grid bg-[#1c222c]/40 text-[9px] font-mono font-bold text-[#4F8CFF] uppercase border-b border-[#24272C] tracking-wider py-1.5"
                style={{ gridTemplateColumns: `225px repeat(${sortedComparedApis.length}, minmax(200px, 1fr))` }}
              >
                <div className="px-4 sticky left-0 bg-[#1c222c] z-10">★ Pinned Metrics</div>
              </div>

              {Object.entries(METRIC_GROUPS).flatMap(([, rows]) => rows).filter((row) => pinnedMetricKeys.includes(row.key)).map((row) => {
                const classifications = getMetricClassifications(row, sortedComparedApis);
                return (
                  <div
                    key={`pinned-${row.key}`}
                    className="grid items-center hover:bg-[#181B20]/25 transition-colors py-2.5 text-xs font-mono"
                    style={{ gridTemplateColumns: `225px repeat(${sortedComparedApis.length}, minmax(200px, 1fr))` }}
                  >
                    <div className="px-4 pr-2 border-r border-[#24272C]/60 sticky left-0 bg-[#121417] z-10 flex items-center justify-between">
                      <span className="text-zinc-300 font-semibold">{row.label}</span>
                      <button
                        onClick={() => setPinnedMetricKeys((prev) => prev.filter((k) => k !== row.key))}
                        className="text-amber-500 hover:text-zinc-500 pl-1 text-[11px]"
                      >
                        ★
                      </button>
                    </div>
                    {sortedComparedApis.map((api) => renderMetricCell(row, api, classifications[api.id]))}
                  </div>
                );
              })}
            </div>
          )}

          {/* METRICS GROUPS COLLAPSIBLE SECTIONS */}
          {Object.entries(METRIC_GROUPS).map(([groupName, rows]) => {
            const isCollapsed = collapsedGroups[groupName];

            const visibleRows = rows.filter((row) => {
              const matchesSearch = row.label.toLowerCase().includes(metricSearchQuery.toLowerCase());
              const matchesIdentical = !hideIdentical || !checkIsRowIdentical(row, sortedComparedApis);
              return matchesSearch && matchesIdentical;
            });

            if (visibleRows.length === 0) return null;

            return (
              <div key={groupName} id={`metric-group-${groupName}`} className="flex flex-col">

                {/* Group Header */}
                <div
                  onClick={() => setCollapsedGroups((prev) => ({ ...prev, [groupName]: !isCollapsed }))}
                  className="grid bg-[#181B20]/60 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider py-2.5 cursor-pointer border-b border-[#24272C] select-none hover:bg-[#181B20] transition-colors"
                  style={{ gridTemplateColumns: `225px repeat(${sortedComparedApis.length}, minmax(200px, 1fr))` }}
                >
                  <div className="px-4 sticky left-0 bg-[#181B20] z-10 flex items-center space-x-1.5">
                    <span>{isCollapsed ? "[+]" : "[-]"}</span>
                    <span>{groupName}</span>
                  </div>
                </div>

                {/* Rows */}
                {!isCollapsed && visibleRows.map((row) => {
                  const isPinned = pinnedMetricKeys.includes(row.key);
                  const classifications = getMetricClassifications(row, sortedComparedApis);
                  return (
                    <div
                      key={row.key}
                      className="grid items-center hover:bg-[#181B20]/25 border-b border-[#24272C]/40 last:border-b-0 py-2.5 text-xs font-mono transition-colors"
                      style={{ gridTemplateColumns: `225px repeat(${sortedComparedApis.length}, minmax(200px, 1fr))` }}
                    >
                      <div className="px-4 pr-2 border-r border-[#24272C]/60 sticky left-0 bg-[#121417] z-10 flex items-center justify-between">
                        <span className="text-zinc-400">{row.label}</span>
                        <button
                          onClick={() => {
                            if (isPinned) {
                              setPinnedMetricKeys((prev) => prev.filter((k) => k !== row.key));
                            } else {
                              setPinnedMetricKeys((prev) => [...prev, row.key]);
                            }
                          }}
                          className={`pl-1 text-[11px] transition-colors ${isPinned ? "text-amber-500" : "text-zinc-600 hover:text-zinc-300"}`}
                        >
                          ★
                        </button>
                      </div>
                      {sortedComparedApis.map((api) => renderMetricCell(row, api, classifications[api.id]))}
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}
