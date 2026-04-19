import { FLOW_LANE_META, FLOW_LANE_ORDER } from "../config/constants";
import { getEdgePayload, getLensPayload, getNodePayload } from "./bundle";

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

function buildFlowPositions(companies) {
  const positions = new Map();
  const lanes = [];
  const visibleByLane = new Map(
    FLOW_LANE_ORDER.map((laneId) => [laneId, companies.filter((company) => company.flowLane === laneId)])
  );
  const maxLaneCount = Math.max(1, ...[...visibleByLane.values()].map((entries) => entries.length));
  const height = Math.max(520, maxLaneCount * 74 + 118);

  for (const laneId of FLOW_LANE_ORDER) {
    const laneMeta = FLOW_LANE_META[laneId];
    const laneCompanies = rankCompanies(visibleByLane.get(laneId) ?? []);
    if (!laneCompanies.length) {
      continue;
    }
    const orderedCompanies = centerOutOrder(laneCompanies);
    const yValues = distributeValues(orderedCompanies.length, 94, height - 84);
    orderedCompanies.forEach((company, index) => {
      positions.set(company.id, { x: laneMeta.x, y: yValues[index] });
    });
    lanes.push({
      id: laneId,
      label: laneMeta.label,
      shortLabel: laneMeta.shortLabel,
      color: laneMeta.color,
      x: laneMeta.x,
    });
  }

  return {
    width: 1320,
    height,
    positions,
    lanes,
  };
}

function buildNodeClasses(company, state) {
  const classes = [`lane-${company.flowLane}`];
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

export function buildGraphScene(model, activeLens, selectedNodeId, selectedEdgeId) {
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
  const layout = buildFlowPositions(visibleCompanies);
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
      lane: company.flowLane,
      laneLabel: company.flowLaneLabel,
      country: company.countryName,
      degree: company.dependencyDegree,
      size: Math.max(76, Math.min(132, 76 + company.dependencyDegree * 10 + (hubIds.has(company.id) ? 12 : 0))),
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

  const cameraIds =
    edgePayload?.cameraIds ??
    nodePayload?.cameraIds ??
    lensPayload?.cameraIds ??
    visibleCompanies.map((company) => company.id);
  const cameraPadding = edgePayload ? 132 : selectedNodeId ? 110 : activeLens ? 86 : 58;

  return {
    elements: [...nodes, ...edges],
    width: layout.width,
    height: layout.height,
    lanes: layout.lanes,
    cameraIds,
    cameraPadding,
    cameraKey: `${model.bundle.run_id ?? "demo"}:${activeLens?.type ?? "flow"}:${activeLens?.id ?? ""}:${selectedNodeId ?? ""}:${selectedEdgeId ?? ""}`,
  };
}
