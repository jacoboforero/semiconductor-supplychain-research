import cytoscape from "cytoscape";

const style = [
  {
    selector: "core",
    style: {
      "selection-box-color": "#d57a49",
      "selection-box-opacity": 0.05,
      "selection-box-border-color": "#d57a49",
      "active-bg-opacity": 0.03,
      "active-bg-color": "#d57a49",
    },
  },
  {
    selector: "node",
    style: {
      label: "data(label)",
      shape: "data(shape)",
      "background-color": "data(fill)",
      "border-color": "data(border)",
      "font-family": "Avenir Next, Helvetica Neue, sans-serif",
      "font-size": 11,
      color: "#eef3f8",
      "text-wrap": "wrap",
      "text-max-width": 142,
      "text-background-color": "rgba(7, 12, 18, 0.92)",
      "text-background-opacity": 0.72,
      "text-background-padding": 6,
      "text-margin-y": 46,
      "text-border-radius": 10,
      "text-valign": "bottom",
      "text-halign": "center",
      "overlay-opacity": 0,
      width: "data(size)",
      height: 44,
      "border-width": 1.6,
      "border-color": "rgba(255,255,255,0.12)",
      opacity: 0.96,
      "shadow-blur": 18,
      "shadow-color": "rgba(4, 8, 14, 0.72)",
      "shadow-opacity": 0.26,
    },
  },
  {
    selector: "node.is-unlinked",
    style: {
      opacity: 0.42,
      "border-style": "dashed",
    },
  },
  {
    selector: "node.is-hub",
    style: {
      height: 52,
      "border-width": 2.4,
    },
  },
  {
    selector: "node.is-selected",
    style: {
      "border-width": 3,
      "shadow-blur": 28,
      "shadow-color": "#ffd4b1",
      "shadow-opacity": 0.38,
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
      "shadow-blur": 20,
      "shadow-color": "#f4b184",
      "shadow-opacity": 0.24,
    },
  },
  {
    selector: "node.is-muted",
    style: {
      opacity: 0.14,
    },
  },
  {
    selector: "node.is-spacer",
    style: {
      label: "",
      width: 1,
      height: 1,
      opacity: 0,
      "events": "no",
      "overlay-opacity": 0,
    },
  },
  {
    selector: "edge",
    style: {
      width: 2.2,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.9,
      "target-arrow-color": "rgba(215, 181, 159, 0.64)",
      "line-color": "rgba(180, 193, 210, 0.28)",
      opacity: 0.62,
      "overlay-opacity": 0,
      "line-opacity": 0.8,
    },
  },
  {
    selector: "edge.kind-foundry",
    style: {
      "line-color": "rgba(240, 176, 116, 0.68)",
      "target-arrow-color": "rgba(240, 176, 116, 0.82)",
      width: 2.5,
    },
  },
  {
    selector: "edge.kind-packaging",
    style: {
      "line-color": "rgba(201, 149, 216, 0.62)",
      "target-arrow-color": "rgba(201, 149, 216, 0.78)",
      width: 2.5,
    },
  },
  {
    selector: "edge.kind-ip",
    style: {
      "line-color": "rgba(124, 197, 200, 0.6)",
      "target-arrow-color": "rgba(124, 197, 200, 0.76)",
    },
  },
  {
    selector: "edge.kind-tool",
    style: {
      "line-color": "rgba(167, 198, 106, 0.56)",
      "target-arrow-color": "rgba(167, 198, 106, 0.74)",
    },
  },
  {
    selector: "edge.is-selected",
    style: {
      width: 3.2,
      opacity: 0.94,
      "line-color": "#ffd4b1",
      "target-arrow-color": "#ffd4b1",
    },
  },
  {
    selector: "edge.is-spotlight",
    style: {
      opacity: 0.82,
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

function fitToIds(cy, ids, padding = 72, animate = true) {
  const targets = (ids ?? []).map((id) => cy.getElementById(id)).filter((element) => element && element.length);
  if (!targets.length) {
    cy.animate({ fit: { padding }, duration: animate ? 420 : 0 });
    return;
  }
  cy.animate(
    {
      fit: {
        eles: targets,
        padding,
      },
      duration: animate ? 420 : 0,
    },
    { easing: "ease-in-out" }
  );
}

export function createCytoscapeAdapter({
  container,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onZoomChange,
}) {
  const cy = cytoscape({
    container,
    elements: [],
    style,
    userPanningEnabled: true,
    userZoomingEnabled: true,
    minZoom: 0.34,
    maxZoom: 2.8,
    wheelSensitivity: 0.14,
    motionBlur: true,
    textureOnViewport: true,
  });

  cy.on("tap", "node", (event) => {
    onSelectNode?.(event.target.id());
  });

  cy.on("tap", "edge", (event) => {
    onSelectEdge?.(event.target.id());
  });

  cy.on("tap", (event) => {
    if (event.target === cy) {
      onClearSelection?.();
    }
  });

  const updateZoom = () => onZoomChange?.(cy.zoom());
  cy.on("zoom", updateZoom);
  cy.on("render", updateZoom);

  return {
    setScene(scene) {
      cy.batch(() => {
        cy.elements().remove();
        cy.add(scene.elements);
        cy.layout({ name: "preset", fit: false, padding: 40, animate: false }).run();
      });
    },
    fit(ids, options = {}) {
      fitToIds(cy, ids, options.padding, options.animate);
    },
    zoomIn() {
      cy.zoom(cy.zoom() * 1.16);
    },
    zoomOut() {
      cy.zoom(cy.zoom() / 1.16);
    },
    destroy() {
      cy.destroy();
    },
  };
}
