import { buildDirectionalPath, stageConnectionAnchors } from "./flowPaths";
import { useAnchorPositions } from "./useAnchorPositions";

function stagePath(connection, positions) {
  const source = positions[connection.from];
  const target = positions[connection.to];
  const anchors = stageConnectionAnchors(source, target);
  if (!anchors) {
    return null;
  }
  return buildDirectionalPath(anchors.from, anchors.to, connection.kind === "secondary" ? 0.3 : 0.42);
}

export default function V3SystemMap({ model, selectedStageId, onSelectStage }) {
  const { containerRef, registerAnchor, positions } = useAnchorPositions([
    model.mapStages.length,
    model.mapConnections.length,
    selectedStageId,
  ]);

  return (
    <section className="v3-map-canvas v3-system-map" ref={containerRef}>
      <svg className="v3-map-svg" aria-hidden="true">
        <defs>
          <marker id="v3-stage-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(249, 210, 179, 0.8)" />
          </marker>
        </defs>

        {model.mapConnections.map((connection) => {
          const path = stagePath(connection, positions);
          if (!path) {
            return null;
          }
          return (
            <g key={connection.id} className={`v3-stage-connection ${connection.kind}`}>
              <path d={path} className="v3-stage-connection-base" markerEnd="url(#v3-stage-arrow)" />
              <path d={path} className="v3-stage-connection-pulse" />
            </g>
          );
        })}
      </svg>

      {model.mapGroups.map((group) => (
        <div
          key={group.id}
          className="v3-map-group"
          style={{
            left: group.left,
            top: group.top,
            width: group.width,
            height: group.height,
          }}
        >
          <span>{group.label}</span>
        </div>
      ))}

      {model.mapStages.map((stage) => (
        <button
          key={stage.id}
          type="button"
          ref={registerAnchor(stage.id)}
          className={`v3-stage-card ${selectedStageId === stage.id ? "is-selected" : ""}`}
          style={{
            ...stage.layout,
            "--stage-color": stage.color,
            "--stage-tint": stage.tint,
          }}
          onClick={() => onSelectStage(stage.id)}
        >
          <span className="v3-stage-strap">{stage.strap}</span>
          <strong>{stage.label}</strong>
          <p>{stage.summary}</p>
          <div className="v3-stage-meta">
            <span>{stage.connectedCompanies.length} linked</span>
            <span>{stage.topHub ? `Example: ${stage.topHub.displayName}` : "Catalog only"}</span>
          </div>
        </button>
      ))}
    </section>
  );
}
