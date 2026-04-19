import { buildDirectionalPath, companyConnectionAnchors, stageConnectionAnchors } from "./flowPaths";
import { useAnchorPositions } from "./useAnchorPositions";

function relationshipClass(edge) {
  if (edge.predicate === "LICENSES_IP_TO") {
    return "kind-ip";
  }
  if (edge.predicate === "PACKAGES_FOR" || edge.predicate === "TESTS_FOR") {
    return "kind-packaging";
  }
  if (edge.itemCode?.startsWith("TOOL.")) {
    return "kind-tool";
  }
  return "kind-supply";
}

export default function V3CompanyMap({
  model,
  scene,
  selectedStageId,
  selectedCompanyId,
  onSelectStage,
  onSelectCompany,
}) {
  const dependencyKey = [
    model.mapConnections.length,
    scene.stages.map((stage) => `${stage.id}:${stage.visibleCompanies.length}`).join("|"),
    scene.visibleEdges.map((edge) => edge.id).join("|"),
    selectedStageId ?? "",
    selectedCompanyId ?? "",
  ];
  const { containerRef, registerAnchor, positions } = useAnchorPositions(dependencyKey);

  return (
    <section className="v3-map-canvas v3-company-map" ref={containerRef}>
      <svg className="v3-map-svg" aria-hidden="true">
        <defs>
          <marker
            id="v3-company-arrow"
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(249, 210, 179, 0.82)" />
          </marker>
        </defs>

        {model.mapConnections.map((connection) => {
          const source = positions[connection.from];
          const target = positions[connection.to];
          const anchors = stageConnectionAnchors(source, target);
          if (!anchors) {
            return null;
          }
          const path = buildDirectionalPath(anchors.from, anchors.to, connection.kind === "secondary" ? 0.28 : 0.4);
          return (
            <path
              key={connection.id}
              d={path}
              className={`v3-stage-connection-shell ${connection.kind}`}
              markerEnd="url(#v3-company-arrow)"
            />
          );
        })}

        {scene.visibleEdges.map((edge) => {
          const source = positions[edge.source.id];
          const target = positions[edge.target.id];
          const anchors = companyConnectionAnchors(source, target);
          if (!anchors) {
            return null;
          }
          const path = buildDirectionalPath(anchors.from, anchors.to, 0.44);
          const isFocused = !selectedCompanyId || scene.focusedIds.has(edge.source.id) || scene.focusedIds.has(edge.target.id);
          const isSelected = selectedCompanyId && (edge.source.id === selectedCompanyId || edge.target.id === selectedCompanyId);
          return (
            <g
              key={edge.id}
              className={`v3-company-edge ${relationshipClass(edge)} ${isFocused ? "" : "is-muted"} ${
                isSelected ? "is-selected" : ""
              }`}
            >
              <path d={path} className="v3-company-edge-base" markerEnd="url(#v3-company-arrow)" />
              <path d={path} className="v3-company-edge-pulse" />
            </g>
          );
        })}
      </svg>

      {scene.stages.map((stage) => (
        <section
          key={stage.id}
          ref={registerAnchor(stage.id)}
          className={`v3-stage-card v3-stage-card-company ${stage.isSelected ? "is-selected" : ""} ${
            stage.containsSelectedCompany ? "contains-selected-company" : ""
          }`}
          style={{
            ...(stage.companyLayout ?? stage.layout),
            "--stage-color": stage.color,
            "--stage-tint": stage.tint,
          }}
        >
          <button type="button" className="v3-stage-header-button" onClick={() => onSelectStage(stage.id)}>
            <span className="v3-stage-strap">{stage.strap}</span>
            <strong>{stage.label}</strong>
            <span className="v3-stage-chip">{stage.connectedCompanies.length} linked</span>
          </button>

          <div className="v3-company-chip-list">
            {stage.visibleCompanies.length ? (
              stage.visibleCompanies.map((company) => {
                const isSelected = company.id === selectedCompanyId;
                const isMuted =
                  selectedCompanyId && !scene.focusedIds.has(company.id) && company.id !== selectedCompanyId;
                return (
                  <button
                    key={company.id}
                    type="button"
                    ref={registerAnchor(company.id)}
                    className={`v3-company-chip ${isSelected ? "is-selected" : ""} ${isMuted ? "is-muted" : ""}`}
                    onClick={() => onSelectCompany(company.id)}
                    title={`${company.displayName} | ${company.countryName} | ${company.dependencyDegree} visible links`}
                  >
                    <strong>{company.displayName}</strong>
                  </button>
                );
              })
            ) : (
              <div className="v3-company-chip v3-company-chip-empty">
                <strong>No linked companies yet</strong>
                <span>Catalog coverage exists, but the relationship slice is still sparse here.</span>
              </div>
            )}
          </div>
        </section>
      ))}
    </section>
  );
}
