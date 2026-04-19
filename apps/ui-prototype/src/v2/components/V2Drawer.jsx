function renderSourceButton(source) {
  const label = source.label ?? source.source_id ?? source.url ?? "Source";
  return (
    <div key={`${label}-${source.url ?? ""}`} className="v2-drawer-card">
      <strong>{label}</strong>
      <span>{source.url ?? "Evidence captured in the snapshot."}</span>
    </div>
  );
}

function renderCompanyButton(company, onSelectNode) {
  return (
    <button key={company.id} type="button" className="v2-drawer-link" onClick={() => onSelectNode(company.id)}>
      <strong>{company.displayName}</strong>
      <span>
        {company.displayStageLabel ?? company.flowLaneLabel} | {company.countryName}
      </span>
    </button>
  );
}

function renderEdgeButton(edge, onSelectEdge) {
  return (
    <button key={edge.id} type="button" className="v2-drawer-link" onClick={() => onSelectEdge(edge.id)}>
      <strong>
        {edge.source.displayName} {"->"} {edge.target.displayName}
      </strong>
      <span>
        {edge.relationshipLabel} | {edge.itemLabel}
      </span>
    </button>
  );
}

export default function V2Drawer({
  isOpen,
  mode,
  payload,
  metrics,
  overviewCompanies,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onClose,
}) {
  return (
    <aside className={`v2-drawer ${isOpen ? "is-open" : "is-closed"}`}>
      <div className="v2-drawer-inner">
        <div className="v2-drawer-toolbar">
          <span className="v2-drawer-kicker">{mode}</span>
          <button type="button" className="v2-text-button" onClick={onClose}>
            Close
          </button>
        </div>

        {!payload ? (
          <>
            <div className="v2-drawer-header">
              <span className="v2-drawer-kicker">Overview</span>
              <h2>Graph-first workspace</h2>
              <p>Keep the canvas primary. Use the dock to trace a stage, launch a scenario, or open a corridor.</p>
            </div>

            <div className="v2-drawer-grid">
              <div className="v2-drawer-card">
                <span>Flow companies</span>
                <strong>{metrics.connectedCompanies}</strong>
              </div>
              <div className="v2-drawer-card">
                <span>Relationships</span>
                <strong>{metrics.relationships}</strong>
              </div>
            </div>

            <section className="v2-drawer-section">
              <span className="v2-drawer-kicker">Critical junctions</span>
              <h3>Open a hub company</h3>
              <div className="v2-drawer-list">
                {overviewCompanies?.slice(0, 6).map((company) => renderCompanyButton(company, onSelectNode))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="v2-drawer-header">
              <span className="v2-drawer-kicker">{payload.strap}</span>
              <h2>{payload.title}</h2>
              <p>{payload.summary}</p>
              {payload.kind === "company" || payload.kind === "edge" ? (
                <button type="button" className="v2-text-button" onClick={onClearSelection}>
                  Clear selection
                </button>
              ) : null}
            </div>

            {payload.whyItMatters ? (
              <section className="v2-drawer-section">
                <span className="v2-drawer-kicker">Why it matters</span>
                <p>{payload.whyItMatters}</p>
              </section>
            ) : null}

            <div className="v2-drawer-grid">
              {payload.cards?.map((card) => (
                <div key={`${card.label}-${card.value}`} className="v2-drawer-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              ))}
            </div>

            {payload.badges?.length ? (
              <div className="v2-badge-row">
                {payload.badges.map((badge) => (
                  <span key={badge} className="v2-badge">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}

            {payload.related
              ? Object.entries(payload.related).map(([title, companies]) => (
                  <section key={title} className="v2-drawer-section">
                    <span className="v2-drawer-kicker">Flow neighbors</span>
                    <h3>{title}</h3>
                    <div className="v2-drawer-list">
                      {companies.slice(0, 6).map((company) => renderCompanyButton(company, onSelectNode))}
                    </div>
                  </section>
                ))
              : null}

            {payload.edgeGroups?.map((group) => (
              <section key={group.title} className="v2-drawer-section">
                <span className="v2-drawer-kicker">Relationships</span>
                <h3>{group.title}</h3>
                <div className="v2-drawer-list">
                  {group.edges.slice(0, 6).map((edge) => renderEdgeButton(edge, onSelectEdge))}
                </div>
              </section>
            ))}

            {payload.companies?.length ? (
              <section className="v2-drawer-section">
                <span className="v2-drawer-kicker">Companies</span>
                <h3>Open a node</h3>
                <div className="v2-drawer-list">
                  {payload.companies.slice(0, 6).map((company) => renderCompanyButton(company, onSelectNode))}
                </div>
              </section>
            ) : null}

            {payload.sourceFooting?.length ? (
              <section className="v2-drawer-section">
                <span className="v2-drawer-kicker">Evidence</span>
                <h3>Sources in view</h3>
                <div className="v2-drawer-list">{payload.sourceFooting.slice(0, 4).map(renderSourceButton)}</div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
