import { SCENARIOS } from "../config/scenarios";

function RailButton({ title, meta, active, onClick }) {
  return (
    <button type="button" className={`rail-button ${active ? "active" : ""}`} onClick={onClick}>
      <span className="rail-button-title">{title}</span>
      {meta ? <span className="rail-button-meta">{meta}</span> : null}
    </button>
  );
}

export default function LeftRail({ model, activeLens, onActivateLens, onSelectNode, onResetWorkspace }) {
  return (
    <aside className="left-rail">
      <section className="rail-section">
        <div className="rail-section-header">
          <span className="panel-kicker">Flow Views</span>
          <h2>Pick a path</h2>
        </div>
        <div className="quick-stack">
          <button className="hero-action solid" type="button" onClick={onResetWorkspace}>
            All visible flow
          </button>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              className={`hero-action ${activeLens?.type === "scenario" && activeLens.id === scenario.id ? "active" : ""}`}
              type="button"
              onClick={() => onActivateLens({ type: "scenario", id: scenario.id })}
            >
              {scenario.title}
            </button>
          ))}
        </div>
      </section>

      <section className="rail-section">
        <div className="rail-section-header">
          <span className="panel-kicker">Process Lanes</span>
          <h2>Step into a lane</h2>
        </div>
        <div className="rail-list">
          {model.lanes.map((lane) => (
            <RailButton
              key={lane.id}
              title={lane.label}
              meta={`${lane.connectedCompanies.length} connected companies`}
              active={activeLens?.type === "lane" && activeLens.id === lane.id}
              onClick={() => onActivateLens({ type: "lane", id: lane.id })}
            />
          ))}
        </div>
      </section>

      <section className="rail-section">
        <div className="rail-section-header">
          <span className="panel-kicker">Country Corridors</span>
          <h2>See geography through the chain</h2>
        </div>
        <div className="rail-list compact">
          {model.countries
            .filter((country) => country.connectedCompanies.length)
            .slice(0, 6)
            .map((country) => (
              <RailButton
                key={country.id}
                title={country.displayName}
                meta={`${country.connectedCompanies.length} connected companies`}
                active={activeLens?.type === "country" && activeLens.id === country.id}
                onClick={() => onActivateLens({ type: "country", id: country.id })}
              />
            ))}
        </div>
      </section>

      <section className="rail-section secondary">
        <div className="rail-section-header">
          <span className="panel-kicker">Critical Junctions</span>
          <h2>Open a hub first</h2>
        </div>
        <div className="signal-list">
          {model.hubCompanies.slice(0, 6).map((company) => (
            <button key={company.id} type="button" className="signal-chip" onClick={() => onSelectNode(company.id)}>
              <span>{company.displayName}</span>
              <small>{company.flowLaneLabel}</small>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
