import { getEdgePayload, getLensPayload, getNodePayload } from "../../lib/bundle";

function centerOutOrder(items) {
  const ordered = [...items];
  const slots = new Array(ordered.length);
  let left = Math.floor((ordered.length - 1) / 2);
  let right = left + 1;

  ordered.forEach((item, index) => {
    if (index === 0) {
      slots[left] = item;
      return;
    }
    if (index % 2 === 1) {
      slots[right] = item;
      right += 1;
      return;
    }
    left -= 1;
    slots[left] = item;
  });

  return slots.filter(Boolean);
}

function distributeValues(count, start, end) {
  if (count <= 1) {
    return [(start + end) / 2];
  }
  return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
}

function rankCompanies(companies) {
  return [...companies].sort((a, b) => {
    if ((b.inDegree ?? 0) !== (a.inDegree ?? 0)) {
      return (b.inDegree ?? 0) - (a.inDegree ?? 0);
    }
    if ((b.dependencyDegree ?? 0) !== (a.dependencyDegree ?? 0)) {
      return (b.dependencyDegree ?? 0) - (a.dependencyDegree ?? 0);
    }
    return a.displayName.localeCompare(b.displayName);
  });
}

function relationshipClass(edge) {
  if (edge.predicate === "FABRICATES_FOR") {
    return "kind-foundry";
  }
  if (edge.predicate === "PACKAGES_FOR") {
    return "kind-packaging";
  }
  if (edge.predicate === "LICENSES_IP_TO") {
    return "kind-ip";
  }
  if (edge.itemCode?.startsWith("TOOL.")) {
    return "kind-tool";
  }
  return "kind-supply";
}

function buildStagePositions(model, companies) {
  const positions = new Map();
  const visibleStageIds = new Set(companies.map((company) => company.displayStage));
  const stages = model.stages.filter(
    (stage) => stage.connectedCompanies.length || visibleStageIds.has(stage.id)
  );
  const maxStageCount = Math.max(
    1,
    ...stages.map(
      (stage) => companies.filter((company) => company.displayStage === stage.id).length
    )
  );
  const height = Math.max(620, maxStageCount * 84 + 170);
  const width = Math.max(1560, ...(stages.map((stage) => stage.x + 120)));

  for (const stage of stages) {
    const stageCompanies = rankCompanies(
      companies.filter((company) => company.displayStage === stage.id)
    );
    if (!stageCompanies.length) {
      continue;
    }
    const orderedCompanies = centerOutOrder(stageCompanies);
    const yValues = distributeValues(orderedCompanies.length, 106, height - 96);
    orderedCompanies.forEach((company, index) => {
      positions.set(company.id, { x: stage.x, y: yValues[index] });
    });
  }

  return {
    width,
    height,
    positions,
    stages: stages.map((stage) => ({
      id: stage.id,
      label: stage.label,
      shortLabel: stage.shortLabel,
      color: stage.color,
      x: stage.x,
    })),
  };
}

function buildNodeClasses(company, state) {
  const classes = [`stage-${company.displayStage}`];
  if (state.hubIds.has(company.id)) {
    classes.push("is-hub");
  }
  if (state.selectedNodeId === company.id) {
    classes.push("is-selected");
  } else if (state.neighborIds.has(company.id)) {
    classes.push("is-neighbor");
  }
  if (state.spotlightIds.has(company.id)) {
    classes.push("is-spotlight");
  }
  if (state.focusIds && !state.focusIds.has(company.id)) {
    classes.push("is-muted");
  }
  if (!company.connected) {
    classes.push("is-unlinked");
  }
  return classes.join(" ");
}

function buildEdgeClasses(edge, state) {
  const classes = [relationshipClass(edge)];
  const inFocus = !state.focusIds || (state.focusIds.has(edge.source.id) && state.focusIds.has(edge.target.id));
  if (!inFocus) {
    classes.push("is-muted");
  }
  if (state.selectedEdgeId === edge.id) {
    classes.push("is-selected");
  } else if (state.spotlightEdgeIds.has(edge.id)) {
    classes.push("is-spotlight");
  }
  return classes.join(" ");
}

export function buildV2Scene(model, workspace) {
  const { activeLens, selectedNodeId, selectedEdgeId } = workspace;
  const lensPayload = getLensPayload(model, activeLens);
  const nodePayload = selectedNodeId ? getNodePayload(model, selectedNodeId) : null;
  const edgePayload = selectedEdgeId ? getEdgePayload(model, selectedEdgeId) : null;
  const selectedCompany = selectedNodeId ? model.companyById.get(selectedNodeId) : null;

  let visibleIds = lensPayload?.relatedIds
    ? new Set(lensPayload.relatedIds)
    : new Set(model.connectedCompanies.map((company) => company.id));

  if (selectedCompany && !selectedCompany.connected && !activeLens) {
    visibleIds = new Set([selectedCompany.id]);
  }

  if (nodePayload?.neighborhoodIds) {
    for (const nodeId of nodePayload.neighborhoodIds) {
      visibleIds.add(nodeId);
    }
  }

  if (edgePayload?.neighborhoodIds) {
    for (const nodeId of edgePayload.neighborhoodIds) {
      visibleIds.add(nodeId);
    }
  }

  const visibleCompanies = [...visibleIds]
    .map((nodeId) => model.companyById.get(nodeId))
    .filter(Boolean);
  const layout = buildStagePositions(model, visibleCompanies);
  const focusIds = nodePayload?.neighborhoodIds ?? edgePayload?.neighborhoodIds ?? lensPayload?.relatedIds ?? null;
  const spotlightIds = new Set([
    ...(lensPayload?.spotlightIds ?? []),
    ...(selectedNodeId ? [selectedNodeId] : []),
    ...(edgePayload?.cameraIds ?? []),
  ]);
  const spotlightEdgeIds = edgePayload?.edgeIds ?? nodePayload?.edgeIds ?? lensPayload?.edgeIds ?? new Set();
  const neighborIds = new Set([...(nodePayload?.neighborhoodIds ?? [])]);
  if (selectedNodeId) {
    neighborIds.delete(selectedNodeId);
  }
  const hubIds = new Set(model.hubCompanies.map((company) => company.id));

  const nodes = visibleCompanies.map((company) => ({
    group: "nodes",
    data: {
      id: company.id,
      label: company.displayName,
      stage: company.displayStage,
      stageLabel: company.displayStageLabel,
      country: company.countryName,
      degree: company.dependencyDegree,
      shape: company.displayStageShape,
      fill: company.displayStageColor,
      border: company.displayStageBorderColor,
      size: Math.max(74, Math.min(136, 74 + company.dependencyDegree * 10 + (hubIds.has(company.id) ? 12 : 0))),
    },
    position: layout.positions.get(company.id) ?? { x: layout.width / 2, y: layout.height / 2 },
    classes: buildNodeClasses(company, {
      selectedNodeId,
      focusIds,
      spotlightIds,
      neighborIds,
      hubIds,
    }),
  }));

  const visibleEdges = model.dependencyEdges.filter(
    (edge) => visibleIds.has(edge.source.id) && visibleIds.has(edge.target.id)
  );
  const edges = visibleEdges.map((edge) => ({
    group: "edges",
    data: {
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id,
      label: edge.relationshipLabel,
      itemLabel: edge.itemLabel,
    },
    classes: buildEdgeClasses(edge, {
      selectedEdgeId,
      focusIds,
      spotlightEdgeIds,
    }),
  }));

  const spacerIds = ["v2-spacer-left", "v2-spacer-right", "v2-spacer-top", "v2-spacer-bottom"];
  const spacerElements = [
    { id: spacerIds[0], x: -420, y: layout.height / 2 },
    { id: spacerIds[1], x: layout.width + 920, y: layout.height / 2 },
    { id: spacerIds[2], x: layout.width / 2, y: -220 },
    { id: spacerIds[3], x: layout.width / 2, y: layout.height + 230 },
  ].map((node) => ({
    group: "nodes",
    data: {
      id: node.id,
      label: "",
      size: 1,
      shape: "ellipse",
      fill: "rgba(0,0,0,0)",
      border: "rgba(0,0,0,0)",
    },
    position: { x: node.x, y: node.y },
    classes: "is-spacer",
  }));

  const cameraIds =
    edgePayload?.cameraIds ??
    nodePayload?.cameraIds ??
    lensPayload?.cameraIds ??
    visibleCompanies.map((company) => company.id);
  const cameraPadding = edgePayload ? 170 : selectedNodeId ? 146 : activeLens ? 126 : 104;

  return {
    elements: [...nodes, ...edges, ...spacerElements],
    width: layout.width,
    height: layout.height,
    stages: layout.stages,
    cameraIds: [...cameraIds, ...spacerIds],
    cameraPadding,
    cameraKey: `${model.bundle.run_id ?? "demo"}:stageflow:${activeLens?.type ?? "flow"}:${activeLens?.id ?? ""}:${selectedNodeId ?? ""}:${selectedEdgeId ?? ""}`,
  };
}

export function resolveV2Mode(workspace) {
  if (workspace.selectedNodeId) {
    return "company";
  }
  if (workspace.selectedEdgeId) {
    return "trace";
  }
  if (workspace.activeLens?.type === "scenario") {
    return "scenario";
  }
  if (workspace.activeLens?.type === "country") {
    return "corridor";
  }
  if (workspace.activeLens) {
    return "focus";
  }
  return "overview";
}
