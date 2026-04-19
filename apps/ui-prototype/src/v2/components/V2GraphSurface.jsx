import { useEffect, useRef, useState } from "react";
import { createCytoscapeAdapter } from "../renderer/cytoscapeAdapter";

export default function V2GraphSurface({
  scene,
  focusPayload,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
}) {
  const containerRef = useRef(null);
  const adapterRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const adapter = createCytoscapeAdapter({
      container: containerRef.current,
      onSelectNode,
      onSelectEdge,
      onClearSelection,
      onZoomChange: setZoom,
    });
    adapterRef.current = adapter;
    return () => {
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [onSelectNode, onSelectEdge, onClearSelection]);

  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter || !scene) {
      return;
    }
    adapter.setScene(scene);
    adapter.fit(scene.cameraIds, {
      padding: scene.cameraPadding,
      animate: true,
    });
  }, [scene]);

  return (
    <div className="v2-canvas-shell">
      <div className="v2-canvas-chrome">
        <div className="v2-focus-pill">
          <span>{focusPayload?.strap ?? "Workspace"}</span>
          <strong>{focusPayload?.title ?? "Full dependency flow"}</strong>
        </div>
        <div className="v2-zoom-pill">{Math.round(zoom * 100)}%</div>
      </div>

      <div className="v2-stage-overlay" aria-hidden="true">
        {scene?.stages.map((stage) => (
          <div
            key={stage.id}
            className="v2-stage-marker"
            style={{
              left: `${(stage.x / scene.width) * 100}%`,
              width: `${Math.max(8, Math.min(14, 82 / Math.max(scene.stages.length, 1)))}%`,
              "--stage-color": stage.color,
            }}
          >
            <span>{stage.shortLabel}</span>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="v2-graph-canvas" />

      <div className="v2-canvas-controls">
        <button type="button" className="v2-graph-control" onClick={() => adapterRef.current?.zoomIn()}>
          +
        </button>
        <button type="button" className="v2-graph-control" onClick={() => adapterRef.current?.zoomOut()}>
          -
        </button>
        <button
          type="button"
          className="v2-graph-control v2-graph-control-wide"
          onClick={() => adapterRef.current?.fit(scene.cameraIds, { padding: scene.cameraPadding, animate: true })}
        >
          Fit
        </button>
      </div>
    </div>
  );
}
