function renderCompanyButton(company, onSelectCompany) {
  return (
    <button key={company.id} type="button" className="v3-inspector-link" onClick={() => onSelectCompany(company.id)}>
      <strong>{company.displayName}</strong>
      <span>
        {company.displayStageLabel ?? company.flowLaneLabel} • {company.countryName}
      </span>
    </button>
  );
}

function renderEdgeButton(edge) {
  return (
    <div key={edge.id} className="v3-inspector-link v3-inspector-link-static">
      <strong>
        {edge.source.displayName} {"->"} {edge.target.displayName}
      </strong>
      <span>
        {edge.relationshipLabel} • {edge.itemLabel}
      </span>
    </div>
  );
}

function renderSourceButton(source) {
  const label = source.label ?? source.source_id ?? source.url ?? "Source";
  return (
    <a
      key={`${label}-${source.url ?? ""}`}
      className="v3-inspector-link v3-inspector-link-static"
      href={source.url ?? "#"}
      target={source.url ? "_blank" : undefined}
      rel={source.url ? "noreferrer" : undefined}
    >
      <strong>{label}</strong>
      <span>{source.url ?? "Saved in the snapshot."}</span>
    </a>
  );
}

export default function V3Inspector({
  isOpen,
  payload,
  viewMode,
  onClose,
  onClearSelection,
  onSelectCompany,
  onSelectStage,
  onOpenCompanyView,
}) {
  return (
    <aside className={`v3-inspector ${isOpen ? "is-open" : "is-closed"}`}>
      <div className="v3-inspector-inner">
        <div className="v3-inspector-toolbar">
          <span className="v3-panel-kicker">{viewMode}</span>
          <button type="button" className="v3-text-button" onClick={onClose}>
            Close
          </button>
        </div>

        <header className="v3-inspector-header">
          <span className="v3-panel-kicker">{payload?.strap ?? "Overview"}</span>
          <h2>{payload?.title ?? "Semiconductor capability map"}</h2>
          <p>{payload?.summary}</p>
        </header>

        <div className="v3-inspector-actions">
          {payload?.kind === "stage" ? (
            <button type="button" className="v3-chip-button" onClick={() => onOpenCompanyView?.()}>
              Show companies
            </button>
          ) : null}
          {payload?.kind === "company" ? (
            <button type="button" className="v3-chip-button" onClick={onClearSelection}>
              Clear focus
            </button>
          ) : null}
        </div>

        {payload?.whyItMatters ? (
          <section className="v3-inspector-section">
            <span className="v3-panel-kicker">Role</span>
            <p>{payload.whyItMatters}</p>
          </section>
        ) : null}

        {payload?.cards?.length ? (
          <section className="v3-inspector-grid">
            {payload.cards.map((card) => (
              <div key={`${card.label}-${card.value}`} className="v3-inspector-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </section>
        ) : null}

        {payload?.badges?.length ? (
          <div className="v3-badge-row">
            {payload.badges.map((badge) => (
              <span key={badge} className="v3-badge">
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        {payload?.upstreamStages?.length ? (
          <section className="v3-inspector-section">
            <span className="v3-panel-kicker">Upstream</span>
            <div className="v3-stage-pill-row">
              {payload.upstreamStages.map((stage) => (
                <button key={stage.id} type="button" className="v3-stage-pill" onClick={() => onSelectStage(stage.id)}>
                  {stage.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {payload?.downstreamStages?.length ? (
          <section className="v3-inspector-section">
            <span className="v3-panel-kicker">Downstream</span>
            <div className="v3-stage-pill-row">
              {payload.downstreamStages.map((stage) => (
                <button key={stage.id} type="button" className="v3-stage-pill" onClick={() => onSelectStage(stage.id)}>
                  {stage.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {payload?.companies?.length ? (
          <section className="v3-inspector-section">
            <span className="v3-panel-kicker">Examples</span>
            <div className="v3-inspector-list">
              {payload.companies.slice(0, 8).map((company) => renderCompanyButton(company, onSelectCompany))}
            </div>
          </section>
        ) : null}

        {payload?.related
          ? Object.entries(payload.related).map(([title, companies]) => (
              <section key={title} className="v3-inspector-section">
                <span className="v3-panel-kicker">{title}</span>
                <div className="v3-inspector-list">
                  {companies.slice(0, 6).map((company) => renderCompanyButton(company, onSelectCompany))}
                </div>
              </section>
            ))
          : null}

        {payload?.edgeGroups?.map((group) => (
          <section key={group.title} className="v3-inspector-section">
            <span className="v3-panel-kicker">{group.title}</span>
            <div className="v3-inspector-list">{group.edges.slice(0, 6).map(renderEdgeButton)}</div>
          </section>
        ))}

        {payload?.sourceFooting?.length ? (
          <section className="v3-inspector-section">
            <span className="v3-panel-kicker">Sources</span>
            <div className="v3-inspector-list">{payload.sourceFooting.slice(0, 6).map(renderSourceButton)}</div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
