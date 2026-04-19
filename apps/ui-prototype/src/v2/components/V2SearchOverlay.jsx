export default function V2SearchOverlay({
  query,
  onQueryChange,
  onOpenSearch,
  onClearQuery,
  searchResults,
  onSelectSearchResult,
}) {
  return (
    <div className="v2-search-overlay">
      <input
        className="v2-search-input"
        type="text"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
          onOpenSearch();
        }}
        onFocus={onOpenSearch}
        placeholder="Search a company"
      />
      {query ? (
        <button type="button" className="v2-search-clear" onClick={onClearQuery} aria-label="Clear search">
          x
        </button>
      ) : null}
      {query && searchResults.length ? (
        <div className="v2-search-results">
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              className="v2-search-result"
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
