import { useRef } from "react";

export default function TopBar({
  query,
  onQueryChange,
  onClearQuery,
  searchResults,
  onSelectSearchResult,
  onOpenSearch,
  onResetWorkspace,
  onLoadSnapshot,
  bundleOrigin,
  generatedAt,
  metrics,
}) {
  const fileInputRef = useRef(null);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-eyebrow">Semiconductor dependency flow workspace</div>
        <div className="brand-row">
          <div>
            <h1>Semisupply Flow</h1>
            <p>
              Start from the company graph. Move upstream into inputs, downstream into packaging, and inspect where
              the chain visibly converges.
            </p>
          </div>
          <div className="snapshot-meta">
            <span className="meta-label">Snapshot</span>
            <strong>{bundleOrigin}</strong>
            <span>{generatedAt ? new Date(generatedAt).toLocaleString() : "Built-in demo data"}</span>
            <div className="snapshot-stats">
              <span>{metrics.connectedCompanies} connected companies</span>
              <span>{metrics.relationships} visible relationships</span>
            </div>
          </div>
        </div>
      </div>

      <div className="command-bar">
        <div className="search-shell">
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={onOpenSearch}
            placeholder="Search a company in the flow or full catalog"
          />
          {query ? (
            <button className="search-clear" type="button" onClick={onClearQuery} aria-label="Clear search">
              x
            </button>
          ) : null}
          {query && searchResults.length ? (
            <div className="search-results">
              {searchResults.map((result) => (
                <button key={result.id} type="button" className="search-result" onClick={() => onSelectSearchResult(result)}>
                  <span className="search-result-title">{result.label}</span>
                  <span className="search-result-meta">{result.meta}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="command-actions">
          <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={onLoadSnapshot} />
          <button className="ghost-button" type="button" onClick={() => fileInputRef.current?.click()}>
            Load Snapshot
          </button>
          <button className="ghost-button" type="button" onClick={onResetWorkspace}>
            Reset Workspace
          </button>
        </div>
      </div>
    </header>
  );
}
