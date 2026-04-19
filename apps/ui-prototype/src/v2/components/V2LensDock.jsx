function LensButton({ label, meta, active, onClick }) {
  return (
    <button type="button" className={`v2-dock-button ${active ? "active" : ""}`} onClick={onClick}>
      <strong>{label}</strong>
      <span>{meta}</span>
    </button>
  );
}

export default function V2LensDock({
  activeLens,
  scenarios,
  stages,
  countries,
  onResetWorkspace,
  onActivateLens,
}) {
  return (
    <aside className="v2-lens-dock">
      <div className="v2-dock-section">
        <span className="v2-drawer-kicker">Start from flow</span>
        <LensButton
          label="Full dependency overview"
          meta="Show the entire visible company network."
          active={!activeLens}
          onClick={onResetWorkspace}
        />
      </div>

      <div className="v2-dock-section">
        <span className="v2-drawer-kicker">Trace a stage</span>
        {stages.map((stage) => (
          <LensButton
            key={stage.id}
            label={stage.shortLabel}
            meta={`${stage.connectedCompanies.length} connected companies`}
            active={activeLens?.type === "stage" && activeLens.id === stage.id}
            onClick={() => onActivateLens({ type: "stage", id: stage.id })}
          />
        ))}
      </div>

      <div className="v2-dock-section">
        <span className="v2-drawer-kicker">Watch scenarios</span>
        {scenarios.map((scenario) => (
          <LensButton
            key={scenario.id}
            label={scenario.title}
            meta={scenario.strap}
            active={activeLens?.type === "scenario" && activeLens.id === scenario.id}
            onClick={() => onActivateLens({ type: "scenario", id: scenario.id })}
          />
        ))}
      </div>

      <div className="v2-dock-section">
        <span className="v2-drawer-kicker">Country corridors</span>
        {countries.map((country) => (
          <LensButton
            key={country.id}
            label={country.displayName}
            meta={`${country.connectedCompanies.length} connected companies`}
            active={activeLens?.type === "country" && activeLens.id === country.id}
            onClick={() => onActivateLens({ type: "country", id: country.id })}
          />
        ))}
      </div>
    </aside>
  );
}
