import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { FLOW_LANE_META, FLOW_LANE_ORDER } from "../config/constants";

const legendItems = FLOW_LANE_ORDER.map((laneId) => ({
  key: laneId,
  label: FLOW_LANE_META[laneId].shortLabel,
  marker: FLOW_LANE_META[laneId].marker,
}));

const style = [
  {
    selector: "core",
    style: {
      "selection-box-color": "#d57a49",
      "selection-box-opacity": 0.06,
      "selection-box-border-color": "#d57a49",
      "active-bg-opacity": 0.04,
      "active-bg-color": "#d57a49",
    },
  },
  {
    selector: "node",
    style: {
      label: "data(label)",
      "font-family": "Avenir Next, Helvetica Neue, sans-serif",
      "font-size": 12,
      color: "#eef3f8",
      "text-wrap": "wrap",
      "text-max-width": 148,
      "text-background-color": "rgba(12, 17, 24, 0.94)",
      "text-background-opacity": 0.92,
      "text-background-padding": 5,
      "text-margin-y": -10,
      "text-border-radius": 10,
      "text-valign": "top",
      "text-halign": "center",
      "overlay-opacity": 0,
      width: 112,
      height: 52,
      "border-width": 1.4,
      "border-color": "rgba(255,255,255,0.12)",
      opacity: 0.96,
      "shadow-blur": 18,
      "shadow-color": "rgba(0,0,0,0.18)",
      "shadow-opacity": 0.28,
    },
  },
  {
    selector: "node.is-hub",
    style: {
      width: 120,
      height: 58,
      "border-width": 2.2,
    },
  },
  {
    selector: "node.is-selected",
    style: {
      "border-width": 3,
      "shadow-blur": 28,
      "shadow-color": "#ffd4b1",
      "shadow-opacity": 0.42,
    },
  },
  {
    selector: "node.is-neighbor",
    style: {
      "border-width": 2.2,
      "border-color": "#f4d2b5",
    },
  },
  {
    selector: "node.is-spotlight",
    style: {
      "shadow-blur": 26,
      "shadow-color": "#f4b184",
      "shadow-opacity": 0.26,
    },
  },
  {
    selector: "node.is-muted",
    style: {
      opacity: 0.16,
    },
  },
  {
    selector: "node.is-unlinked",
    style: {
      width: 92,
      height: 42,
      "border-style": "dashed",
      opacity: 0.8,
    },
  },
  {
    selector: "node.lane-design_enablement",
    style: {
      shape: "round-rectangle",
      "background-color": "#4b8f98",
      "border-color": "#8fdbe0",
    },
  },
  {
    selector: "node.lane-manufacturing_inputs",
    style: {
      shape: "hexagon",
      "background-color": "#708c44",
      "border-color": "#c9e48d",
    },
  },
  {
    selector: "node.lane-wafer_fabrication",
    style: {
      shape: "diamond",
      "background-color": "#ba7441",
      "border-color": "#ffd1ab",
    },
  },
  {
    selector: "node.lane-packaging_and_test",
    style: {
      shape: "cut-rectangle",
      "background-color": "#86568f",
      "border-color": "#dcb7e7",
    },
  },
  {
    selector: "node.lane-output_companies",
    style: {
      shape: "round-rectangle",
      "background-color": "#8f4e56",
      "border-color": "#f0b7bf",
    },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.9,
      "target-arrow-color": "rgba(215, 181, 159, 0.68)",
      "line-color": "rgba(180, 193, 210, 0.3)",
      opacity: 0.6,
      "overlay-opacity": 0,
    },
  },
  {
    selector: "edge.kind-foundry",
    style: {
      "line-color": "rgba(240, 176, 116, 0.64)",
      "target-arrow-color": "rgba(240, 176, 116, 0.82)",
      width: 2.4,
    },
  },
  {
    selector: "edge.kind-packaging",
    style: {
      "line-color": "rgba(201, 149, 216, 0.62)",
      "target-arrow-color": "rgba(201, 149, 216, 0.82)",
      width: 2.4,
    },
  },
  {
    selector: "edge.kind-ip",
    style: {
      "line-color": "rgba(124, 197, 200, 0.58)",
      "target-arrow-color": "rgba(124, 197, 200, 0.8)",
    },
  },
  {
    selector: "edge.kind-tool",
    style: {
      "line-color": "rgba(167, 198, 106, 0.52)",
      "target-arrow-color": "rgba(167, 198, 106, 0.76)",
    },
  },
  {
    selector: "edge.is-selected",
    style: {
      width: 3.4,
      opacity: 0.96,
      "line-color": "#ffd4b1",
      "target-arrow-color": "#ffd4b1",
    },
  },
  {
    selector: "edge.is-spotlight",
    style: {
      opacity: 0.86,
      width: 2.8,
    },
  },
  {
    selector: "edge.is-muted",
    style: {
      opacity: 0.08,
    },
  },
];

function fitToIds(cy, ids, animate = true, padding = 92) {
  const targets = (ids ?? []).map((id) => cy.getElementById(id)).filter((element) => element && element.length);
  if (!targets.length) {
    cy.animate({ fit: { padding }, duration: animate ? 520 : 0 });
    return;
  }
  cy.animate(
    {
      fit: {
        eles: targets,
        padding,
      },
      duration: animate ? 520 : 0,
    },
    { easing: "ease-in-out" }
  );
}

export default function GraphCanvas({
  scene,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onActivateLens,
  laneHighlights,
  countryHighlights,
  hubHighlights,
  focusLabel,
  focusStrap,
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const selectNodeRef = useRef(onSelectNode);
  const selectEdgeRef = useRef(onSelectEdge);
  const clearSelectionRef = useRef(onClearSelection);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    selectNodeRef.current = onSelectNode;
    selectEdgeRef.current = onSelectEdge;
    clearSelectionRef.current = onClearSelection;
  }, [onSelectNode, onSelectEdge, onClearSelection]);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      minZoom: 0.42,
      maxZoom: 2.4,
      wheelSensitivity: 0.14,
      motionBlur: true,
      textureOnViewport: true,
    });

    cy.on("tap", "node", (event) => {
      selectNodeRef.current(event.target.id());
    });

    cy.on("tap", "edge", (event) => {
      selectEdgeRef.current(event.target.id());
    });

    cy.on("tap", (event) => {
      if (event.target === cy) {
        clearSelectionRef.current();
      }
    });

    const updateZoom = () => setZoom(cy.zoom());
    cy.on("zoom", updateZoom);
    cy.on("render", updateZoom);
    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    cy.batch(() => {
      cy.elements().remove();
      cy.add(scene.elements);
      cy.layout({ name: "preset", fit: false, padding: 40, animate: false }).run();
    });
  }, [scene.elements]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }
    fitToIds(cy, scene.cameraIds, true, scene.cameraPadding);
  }, [scene.cameraKey, scene.cameraIds, scene.cameraPadding]);

  return (
    <section className="graph-stage">
      <div className="graph-stage-header">
        <div className="graph-header-copy">
          <span className="panel-kicker">Dependency Workspace</span>
          <div className="graph-title-row">
            <h2>Follow the chain, not the metadata.</h2>
            <div className="graph-focus-pill">
              <span>{focusStrap}</span>
              <strong>{focusLabel}</strong>
            </div>
          </div>
        </div>
        <div className="graph-legend">
          {legendItems.map((item) => (
            <span key={item.key} className="graph-legend-item">
              <span className={`graph-legend-marker ${item.marker}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="graph-radar">
        <div className="graph-radar-group">
          <span className="meta-label">Flow lanes</span>
          <div className="tag-row">
            {laneHighlights.map((lane) => (
              <button key={lane.id} type="button" className="tag-button" onClick={() => onActivateLens({ type: "lane", id: lane.id })}>
                {lane.shortLabel} <small>{lane.connectedCompanies.length}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="graph-radar-group">
          <span className="meta-label">Critical junctions</span>
          <div className="tag-row">
            {hubHighlights.map((company) => (
              <button key={company.id} type="button" className="tag-button" onClick={() => onSelectNode(company.id)}>
                {company.displayName} <small>{company.inDegree}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="graph-shell">
        <div className="graph-lanes" aria-hidden="true">
          {scene.lanes.map((lane) => (
            <div key={lane.id} className="graph-lane" style={{ left: `${(lane.x / scene.width) * 100}%` }}>
              <span>{lane.shortLabel}</span>
            </div>
          ))}
        </div>
        <div ref={containerRef} className="graph-canvas" />
        <div className="graph-controls">
          <button type="button" className="graph-control" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.16)}>
            +
          </button>
          <button type="button" className="graph-control" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.16)}>
            -
          </button>
          <button
            type="button"
            className="graph-control wide"
            onClick={() => fitToIds(cyRef.current, scene.cameraIds, true, scene.cameraPadding)}
          >
            Fit
          </button>
        </div>
        <div className="zoom-pill">{Math.round(zoom * 100)}%</div>
        <div className="graph-country-strip">
          {countryHighlights.map((country) => (
            <button key={country.id} type="button" className="country-chip" onClick={() => onActivateLens({ type: "country", id: country.id })}>
              {country.displayName}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
