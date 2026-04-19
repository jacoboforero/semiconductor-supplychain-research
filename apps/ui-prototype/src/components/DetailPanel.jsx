import { getEdgePayload, getLensPayload, getNodePayload } from "../lib/bundle";

function renderCompanyLink(company, onSelectNode) {
  if (!company) {
    return null;
  }
  return (
    <button key={company.id} type="button" className="detail-link" onClick={() => onSelectNode(company.id)}>
      <strong>{company.displayName}</strong>
      <span>
        {company.flowLaneLabel} | {company.countryName}
      </span>
    </button>
  );
}

function renderEdgeLink(edge, onSelectEdge) {
  if (!edge) {
    return null;
  }
  return (
    <button key={edge.id} type="button" className="detail-link edge-link" onClick={() => onSelectEdge(edge.id)}>
      <strong>
        {edge.source.displayName} {"->"} {edge.target.displayName}
      </strong>
      <span>
        {edge.relationshipLabel} | {edge.itemLabel}
      </span>
    </button>
  );
}

export default function DetailPanel({
  model,
  activeLens,
  selectedNodeId,
  selectedEdgeId,
  onActivateLens,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
}) {
  const edgePayload = selectedEdgeId ? getEdgePayload(model, selectedEdgeId) : null;
  const nodePayload = selectedNodeId ? getNodePayload(model, selectedNodeId) : null;
  const lensPayload = getLensPayload(model, activeLens);
  const payload = edgePayload ?? nodePayload ?? lensPayload;
  const topHub = model.hubCompanies[0];
  const topLane = model.lanes.find((lane) => lane.connectedCompanies.length);
  const topScenario = "foundry-core";

  if (!payload) {
    return (
      <aside className="detail-panel">
        <div className="detail-header">
          <span className="panel-kicker">Workspace Briefing</span>
          <h2>Keep the canvas primary.</h2>
          <p>Use a path, a lane, or a hub to narrow the flow. This panel should only sharpen what the graph reveals.</p>
        </div>

        <div className="detail-grid">
          <div className="metric-card">
            <span>Flow companies</span>
            <strong>{model.metrics.connectedCompanies}</strong>
          </div>
          <div className="metric-card">
            <span>Dependency lines</span>
            <strong>{model.metrics.relationships}</strong>
          </div>
          <div className="metric-card">
            <span>Countries in flow</span>
            <strong>{model.metrics.countries}</strong>
          </div>
          <div className="metric-card">
            <span>Catalog companies</span>
            <strong>{model.metrics.catalogCompanies}</strong>
          </div>
        </div>

        <section className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">Best first paths</span>
            <h3>Start with a visible corridor</h3>
          </div>
          <div className="detail-list">
            <button type="button" className="detail-link" onClick={() => onActivateLens({ type: "scenario", id: topScenario })}>
              <strong>Foundry Core</strong>
              <span>Open the main concentration corridor first</span>
            </button>
            {topLane ? (
              <button type="button" className="detail-link" onClick={() => onActivateLens({ type: "lane", id: topLane.id })}>
                <strong>{topLane.label}</strong>
                <span>{topLane.connectedCompanies.length} connected companies in this step of the chain</span>
              </button>
            ) : null}
            {topHub ? renderCompanyLink(topHub, onSelectNode) : null}
          </div>
        </section>
      </aside>
    );
  }

  const relatedGroups = payload.related
    ? Object.entries(payload.related)
        .map(([group, items]) => ({ group, items: items ?? [] }))
        .filter((entry) => entry.items.length)
    : [];

  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <span className="panel-kicker">{payload.strap}</span>
        <h2>{payload.title}</h2>
        <p>{payload.summary}</p>
        {selectedNodeId || selectedEdgeId ? (
          <button className="text-button" type="button" onClick={onClearSelection}>
            Clear selection
          </button>
        ) : null}
      </div>

      <div className="detail-grid">
        {payload.cards.map((card) => (
          <div key={`${card.label}-${card.value}`} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      {payload.badges?.length ? (
        <section className="detail-section">
          <div className="source-chips">
            {payload.badges.map((badge) => (
              <span key={badge} className="source-chip">
                {badge}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {payload.whyItMatters ? (
        <section className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">Why it matters</span>
            <h3>Interpretation</h3>
          </div>
          <p className="detail-copy">{payload.whyItMatters}</p>
        </section>
      ) : null}

      {payload.companies?.length ? (
        <section className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">Companies</span>
            <h3>Open a node</h3>
          </div>
          <div className="detail-list">{payload.companies.map((company) => renderCompanyLink(company, onSelectNode))}</div>
        </section>
      ) : null}

      {payload.edgeGroups?.length
        ? payload.edgeGroups.map((group) => (
            <section key={group.title} className="detail-section">
              <div className="section-heading">
                <span className="panel-kicker">Relationships</span>
                <h3>{group.title}</h3>
              </div>
              <div className="detail-list">{group.edges.map((edge) => renderEdgeLink(edge, onSelectEdge))}</div>
            </section>
          ))
        : null}

      {payload.facilities?.length ? (
        <section className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">Facilities</span>
            <h3>Known operator footprint</h3>
          </div>
          <div className="detail-list">
            {payload.facilities.map((facility) => (
              <div key={facility.id} className="detail-link static">
                <strong>{facility.facilityName}</strong>
                <span>{facility.facilityTypeCode ?? "Facility"}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {relatedGroups.map((group) => (
        <section key={group.group} className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">{group.group}</span>
            <h3>{group.group}</h3>
          </div>
          <div className="detail-list">{group.items.map((item) => renderCompanyLink(item, onSelectNode))}</div>
        </section>
      ))}

      {payload.sourceFooting?.length ? (
        <section className="detail-section">
          <div className="section-heading">
            <span className="panel-kicker">Traceability</span>
            <h3>Current source footing</h3>
          </div>
          <div className="source-chips">
            {payload.sourceFooting.map((source) =>
              source.url ? (
                <a key={`${source.source_id ?? source.label}-${source.url}`} className="source-chip source-link" href={source.url} target="_blank" rel="noreferrer">
                  {source.label ?? source.source_id}
                </a>
              ) : (
                <span key={source.source_id ?? source.label} className="source-chip">
                  {source.label ?? source.source_id}
                </span>
              )
            )}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
