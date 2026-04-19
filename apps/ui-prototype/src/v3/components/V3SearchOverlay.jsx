export default function V3SearchOverlay({
  query,
  onQueryChange,
  onOpenSearch,
  onClearQuery,
  searchResults,
  onSelectSearchResult,
}) {
  return (
    <div className="v3-search-overlay">
      <label className="v3-search-shell">
        <span className="v3-search-label">Find a company</span>
        <input
          className="v3-search-input"
          type="text"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onOpenSearch();
          }}
          onFocus={onOpenSearch}
          placeholder="TSMC, ASML, NVIDIA, Amkor"
        />
        {query ? (
          <button type="button" className="v3-search-clear" onClick={onClearQuery} aria-label="Clear search">
            x
          </button>
        ) : null}
      </label>

      {query && searchResults.length ? (
        <div className="v3-search-results">
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              className="v3-search-result"
              onClick={() => onSelectSearchResult(result)}
            >
              <strong>{result.label}</strong>
              <span>{result.meta}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
