import {
  COUNTRY_NAMES,
  DISPLAY_STAGE_META,
  DISPLAY_STAGE_ORDER,
  FLOW_LANE_META,
  FLOW_LANE_ORDER,
  SOURCE_LABELS,
} from "../config/constants";
import { getScenarioById } from "../config/scenarios";

const COMPANY_DISPLAY_NAME_OVERRIDES = {
  "siemens-eda": "Siemens EDA",
};

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function dedupeSources(sources) {
  const seen = new Set();
  return (sources ?? []).filter((source) => {
    if (!source) {
      return false;
    }
    const key = `${source.source_id ?? ""}:${source.url ?? ""}:${source.label ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function connectedRank(a, b) {
  return (
    (b.inDegree ?? 0) - (a.inDegree ?? 0) ||
    (b.dependencyDegree ?? 0) - (a.dependencyDegree ?? 0) ||
    a.displayName.localeCompare(b.displayName)
  );
}

function companyRank(a, b) {
  return (
    (b.dependencyDegree ?? 0) - (a.dependencyDegree ?? 0) ||
    (b.outDegree ?? 0) - (a.outDegree ?? 0) ||
    a.displayName.localeCompare(b.displayName)
  );
}

function formatCountryName(countryCode) {
  if (!countryCode) {
    return "Unknown";
  }
  return COUNTRY_NAMES[countryCode] ?? countryCode;
}

function roleSummary(company) {
  return company.roleLabels.length ? company.roleLabels.join(", ") : "Role not mapped";
}

function summarizeCompany(company) {
  if (!company.connected) {
    return `${company.displayName} is present in the curated company universe, but the current public dependency slice does not yet connect it into the visible flow graph.`;
  }
  return `${company.displayName} sits in ${company.displayStageLabel ?? company.flowLaneLabel ?? "the dependency map"}, based in ${
    company.countryName
  }, with ${company.inDegree} visible upstream links and ${company.outDegree} downstream handoffs.`;
}

function summarizeEdge(edge) {
  if (edge.notes) {
    return edge.notes;
  }
  return `${edge.source.displayName} ${edge.relationshipLabel.toLowerCase()} ${edge.target.displayName} through ${
    edge.itemLabel ?? "an unnamed dependency"
  }.`;
}

function collectSourceFooting(edges) {
  return dedupeSources(edges.flatMap((edge) => edge.sources));
}

function expandCompanyIds(model, seedIds, depth = 1) {
  const visited = new Set(seedIds);
  let frontier = [...seedIds];
  for (let level = 0; level < depth; level += 1) {
    const next = [];
    for (const currentId of frontier) {
      for (const edge of model.dependencyEdgesByNodeId.get(currentId) ?? []) {
        const neighborId = edge.source.id === currentId ? edge.target.id : edge.source.id;
        if (visited.has(neighborId)) {
          continue;
        }
        visited.add(neighborId);
        next.push(neighborId);
      }
    }
    frontier = next;
  }
  return visited;
}

function edgeIdsForCompanyIds(model, companyIds) {
  return new Set(
    model.dependencyEdges
      .filter((edge) => companyIds.has(edge.source.id) && companyIds.has(edge.target.id))
      .map((edge) => edge.id)
  );
}

function buildCountryModel(companies) {
  const byCountry = new Map();
  for (const company of companies) {
    const countryCode = company.countryCode ?? "UNKNOWN";
    if (!byCountry.has(countryCode)) {
      byCountry.set(countryCode, []);
    }
    byCountry.get(countryCode).push(company);
  }

  return [...byCountry.entries()]
    .map(([countryCode, entries]) => {
      const connectedCompanies = entries.filter((company) => company.connected).sort(connectedRank);
      return {
        id: `country:${countryCode}`,
        countryCode,
        displayName: formatCountryName(countryCode === "UNKNOWN" ? null : countryCode),
        allCompanies: [...entries].sort(companyRank),
        connectedCompanies,
      };
    })
    .sort(
      (a, b) =>
        b.connectedCompanies.length - a.connectedCompanies.length ||
        b.allCompanies.length - a.allCompanies.length ||
        a.displayName.localeCompare(b.displayName)
    );
}

function buildLaneModel(companies) {
  return FLOW_LANE_ORDER.map((laneId) => {
    const laneMeta = FLOW_LANE_META[laneId];
    const laneCompanies = companies.filter((company) => company.flowLane === laneId);
    const connectedCompanies = laneCompanies.filter((company) => company.connected).sort(companyRank);
    return {
      id: laneId,
      ...laneMeta,
      companies: laneCompanies.sort(companyRank),
      connectedCompanies,
      topHub: connectedCompanies[0] ?? null,
      countries: uniqueById(connectedCompanies.map((company) => company.country)),
    };
  }).filter((lane) => lane.companies.length);
}

function buildStageModel(companies) {
  return DISPLAY_STAGE_ORDER.map((stageId) => {
    const stageMeta = DISPLAY_STAGE_META[stageId];
    const stageCompanies = companies.filter((company) => company.displayStage === stageId);
    const connectedCompanies = stageCompanies.filter((company) => company.connected).sort(companyRank);
    return {
      id: stageId,
      ...stageMeta,
      companies: stageCompanies.sort(companyRank),
      connectedCompanies,
      topHub: connectedCompanies[0] ?? null,
      countries: uniqueById(connectedCompanies.map((company) => company.country)),
    };
  }).filter((stage) => stage.companies.length);
}

function resolveDisplayStage({ flowLane, roleCodes, segmentCodes }) {
  const roles = new Set(roleCodes ?? []);
  const segments = new Set(segmentCodes ?? []);

  if (roles.has("ROLE.EDA_VENDOR") || roles.has("ROLE.IP_VENDOR")) {
    return "design_enablement";
  }
  if (segments.has("SEG.MATERIALS") || roles.has("ROLE.CHEMICALS_SUPPLIER") || roles.has("ROLE.SPECIALTY_GASES_SUPPLIER")) {
    return "materials_and_chemicals";
  }
  if (segments.has("SEG.WAFERS_SUBSTRATES") || roles.has("ROLE.WAFER_MANUFACTURER") || roles.has("ROLE.SUBSTRATE_MANUFACTURER")) {
    return "wafers_and_substrates";
  }
  if (segments.has("SEG.MASKS_RETICLES") || roles.has("ROLE.PHOTOMASK_SUPPLIER")) {
    return "masks_and_reticles";
  }
  if (segments.has("SEG.MANUFACTURING_EQUIPMENT") || roles.has("ROLE.EQUIPMENT_SUPPLIER")) {
    return "manufacturing_equipment";
  }
  if (roles.has("ROLE.FOUNDRY")) {
    return "wafer_fabrication";
  }
  if (roles.has("ROLE.OSAT") || roles.has("ROLE.PACKAGING_SPECIALIST") || roles.has("ROLE.TEST_SERVICE")) {
    return "packaging_and_test";
  }
  if (
    roles.has("ROLE.FABLESS") ||
    roles.has("ROLE.IDM") ||
    roles.has("ROLE.MEMORY_MANUFACTURER") ||
    roles.has("ROLE.ANALOG_POWER_MANUFACTURER")
  ) {
    return "device_companies";
  }
  if (segments.has("SEG.DESIGN_SOFTWARE")) {
    return "design_enablement";
  }
  if (segments.has("SEG.FRONTEND_MANUFACTURING")) {
    return "wafer_fabrication";
  }
  if (segments.has("SEG.BACKEND_MANUFACTURING")) {
    return "packaging_and_test";
  }
  if (flowLane === "design_enablement") {
    return "design_enablement";
  }
  if (flowLane === "wafer_fabrication") {
    return "wafer_fabrication";
  }
  if (flowLane === "packaging_and_test") {
    return "packaging_and_test";
  }
  return "device_companies";
}

function findCompanyByName(model, name) {
  return model.companies.find((company) => company.displayName === name) ?? null;
}

function buildLensPayloadFromCompanies(model, companies, config) {
  const seedCompanies = uniqueById(companies).filter(Boolean);
  if (!seedCompanies.length) {
    return null;
  }
  const seedIds = new Set(seedCompanies.map((company) => company.id));
  const relatedIds = expandCompanyIds(model, seedIds, config.depth ?? 1);
  const relatedEdges = model.dependencyEdges.filter(
    (edge) => relatedIds.has(edge.source.id) && relatedIds.has(edge.target.id)
  );
  const relatedCompanies = [...relatedIds].map((id) => model.companyById.get(id)).filter(Boolean);
  const countries = uniqueById(relatedCompanies.map((company) => company.country));
  return {
    kind: config.kind,
    title: config.title,
    strap: config.strap,
    summary: config.summary,
    whyItMatters: config.whyItMatters ?? null,
    cards: [
      { label: "Focus companies", value: seedCompanies.length },
      { label: "Visible companies", value: relatedCompanies.length },
      { label: "Relationships", value: relatedEdges.length },
      { label: "Countries", value: countries.length },
    ],
    companies: relatedCompanies.sort(companyRank).slice(0, 8),
    edgeGroups: [
      {
        title: "Representative relationships",
        edges: relatedEdges.slice(0, 8),
      },
    ],
    sourceFooting: collectSourceFooting(relatedEdges),
    relatedIds,
    edgeIds: edgeIdsForCompanyIds(model, relatedIds),
    spotlightIds: seedIds,
    cameraIds: [...seedIds],
  };
}

export function normalizeBundle(bundle) {
  if (!bundle || !Array.isArray(bundle.nodes) || !Array.isArray(bundle.edges)) {
    throw new Error("Snapshot is missing nodes or edges.");
  }
  return bundle;
}

export function buildBundleModel(bundle) {
  const nodes = bundle.nodes.map((node) => ({
    ...node,
    id: node.node_id,
    nodeType: node.node_type,
    displayName: node.display_name,
  }));
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const facilityNodes = nodes
    .filter((node) => node.nodeType === "Facility")
    .map((node) => ({
      ...node,
      facilityName: node.properties?.facility_name ?? node.displayName,
      facilityTypeCode: node.properties?.facility_type_code ?? null,
    }));
  const facilityById = new Map(facilityNodes.map((facility) => [facility.id, facility]));

  const companies = nodes
    .filter((node) => node.nodeType === "Company")
    .map((node) => {
      const companySlug = node.properties?.identifiers?.other?.[0] ?? null;
      const countryCode = node.properties?.hq_country_code ?? null;
      const countryName = formatCountryName(countryCode);
      const flowLane = node.properties?.flow_lane ?? "output_companies";
      const flowLaneLabel = node.properties?.flow_lane_label ?? FLOW_LANE_META[flowLane]?.label ?? "Output Companies";
      const roleCodes = node.properties?.role_codes ?? [];
      const roleLabels = node.properties?.role_labels ?? [];
      const segmentCodes = node.properties?.segment_codes ?? [];
      const segmentLabels = node.properties?.segment_labels ?? [];
      const displayStage = resolveDisplayStage({ flowLane, roleCodes, segmentCodes });
      const displayStageMeta = DISPLAY_STAGE_META[displayStage] ?? DISPLAY_STAGE_META.device_companies;
      return {
        ...node,
        displayName: COMPANY_DISPLAY_NAME_OVERRIDES[companySlug] ?? node.displayName,
        companySlug,
        countryCode,
        countryName,
        flowLane,
        flowLaneLabel,
        roleCodes,
        roleLabels,
        segmentCodes,
        segmentLabels,
        displayStage,
        displayStageLabel: displayStageMeta.label,
        displayStageShortLabel: displayStageMeta.shortLabel,
        displayStageShape: displayStageMeta.shape,
        displayStageColor: displayStageMeta.color,
        displayStageBorderColor: displayStageMeta.borderColor,
        facilities: [],
        dependencyInEdges: [],
        dependencyOutEdges: [],
        dependencyEdges: [],
        connected: false,
        dependencyDegree: 0,
        inDegree: 0,
        outDegree: 0,
      };
    });
  const companyById = new Map(companies.map((company) => [company.id, company]));

  for (const edge of bundle.edges) {
    if (edge.edge_type !== "OPERATES_FACILITY") {
      continue;
    }
    const company = companyById.get(edge.source_node_id);
    const facility = facilityById.get(edge.target_node_id);
    if (company && facility) {
      company.facilities.push(facility);
    }
  }

  const dependencyEdges = bundle.edges
    .filter((edge) => edge.edge_type === "SUPPLIES_TO")
    .map((edge) => {
      const source = companyById.get(edge.source_node_id);
      const target = companyById.get(edge.target_node_id);
      if (!source || !target) {
        return null;
      }
      const sources = dedupeSources(Array.isArray(edge.properties?.sources) ? edge.properties.sources : []);
      return {
        ...edge,
        id: edge.edge_id,
        source,
        target,
        relationshipLabel: edge.properties?.predicate_label ?? "Dependency",
        predicate: edge.properties?.predicate ?? edge.edge_type,
        itemLabel: edge.properties?.item_label ?? edge.properties?.item_code ?? "Unspecified",
        itemCode: edge.properties?.item_code ?? null,
        stageLabel: edge.properties?.stage_label ?? null,
        stageCode: edge.properties?.stage_code ?? null,
        notes: edge.properties?.notes ?? "",
        relationshipId: edge.properties?.relationship_id ?? edge.edge_id,
        sources,
        confidencePercent: edge.confidence != null ? Math.round(edge.confidence * 100) : null,
      };
    })
    .filter(Boolean);

  const dependencyEdgesByNodeId = new Map();
  for (const company of companies) {
    dependencyEdgesByNodeId.set(company.id, []);
  }
  for (const edge of dependencyEdges) {
    edge.summary = summarizeEdge(edge);
    edge.source.dependencyOutEdges.push(edge);
    edge.target.dependencyInEdges.push(edge);
    edge.source.dependencyEdges.push(edge);
    edge.target.dependencyEdges.push(edge);
    edge.source.connected = true;
    edge.target.connected = true;
    dependencyEdgesByNodeId.get(edge.source.id)?.push(edge);
    dependencyEdgesByNodeId.get(edge.target.id)?.push(edge);
  }

  for (const company of companies) {
    company.upstreamCompanies = uniqueById(company.dependencyInEdges.map((edge) => edge.source)).sort(companyRank);
    company.downstreamCompanies = uniqueById(company.dependencyOutEdges.map((edge) => edge.target)).sort(companyRank);
    company.inDegree = company.upstreamCompanies.length;
    company.outDegree = company.downstreamCompanies.length;
    company.dependencyDegree = company.inDegree + company.outDegree;
    company.country = {
      id: `country:${company.countryCode ?? "UNKNOWN"}`,
      countryCode: company.countryCode,
      displayName: company.countryName,
    };
    company.summary = summarizeCompany(company);
  }

  const connectedCompanies = companies.filter((company) => company.connected).sort(companyRank);
  const companiesByName = new Map(companies.map((company) => [company.displayName, company]));
  const countries = buildCountryModel(companies);
  const countryById = new Map(countries.map((country) => [country.id, country]));
  const countryByCode = new Map(countries.map((country) => [country.countryCode, country]));
  const lanes = buildLaneModel(companies);
  const laneById = new Map(lanes.map((lane) => [lane.id, lane]));
  const stages = buildStageModel(companies);
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const hubCompanies = [...connectedCompanies].sort(connectedRank).slice(0, 8);

  const searchEntries = companies
    .map((company) => ({
      id: company.id,
      label: company.displayName,
      kind: "Company",
      meta: `${company.displayStageLabel} | ${company.countryName}${company.connected ? "" : " | Catalog only"}`,
      searchText: `${company.displayName} ${company.displayStageLabel} ${company.countryName} ${roleSummary(company)}`.toLowerCase(),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    bundle,
    nodes,
    nodesById,
    companies,
    companyById,
    companiesByName,
    dependencyEdges,
    dependencyEdgesByNodeId,
    edgeById: new Map(dependencyEdges.map((edge) => [edge.id, edge])),
    lanes,
    laneById,
    stages,
    stageById,
    countries,
    countryById,
    countryByCode,
    hubCompanies,
    connectedCompanies,
    searchEntries,
    metrics: {
      catalogCompanies: companies.length,
      connectedCompanies: connectedCompanies.length,
      relationships: dependencyEdges.length,
      countries: countries.filter((country) => country.connectedCompanies.length).length,
      facts: bundle.summary?.claim_count ?? dependencyEdges.length,
    },
    sourceLabels: (bundle.source_keys ?? []).map((key) => SOURCE_LABELS[key] ?? key),
  };
}

export function findSearchMatches(model, query, limit = 8) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }
  return model.searchEntries
    .map((entry) => {
      const startsWith = entry.label.toLowerCase().startsWith(needle) ? 100 : 0;
      const metaMatch = entry.meta.toLowerCase().includes(needle) ? 8 : 0;
      const index = entry.searchText.indexOf(needle);
      return {
        ...entry,
        score: startsWith + metaMatch + (index === -1 ? 0 : Math.max(0, 40 - index)),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getNode(model, nodeId) {
  return model.companyById.get(nodeId) ?? null;
}

export function getEdge(model, edgeId) {
  return model.edgeById.get(edgeId) ?? null;
}

export function collectNeighborhood(model, nodeId, depth = 1) {
  return expandCompanyIds(model, new Set([nodeId]), depth);
}

export function getLensPayload(model, activeLens) {
  if (!activeLens) {
    return null;
  }

  if (activeLens.type === "stage") {
    const stage = model.stageById.get(activeLens.id);
    if (!stage || !stage.connectedCompanies.length) {
      return null;
    }
    return buildLensPayloadFromCompanies(model, stage.connectedCompanies, {
      kind: "stage",
      title: stage.label,
      strap: "Supply-chain stage",
      summary: `${stage.description} Use this view to trace who currently anchors this stage and where those dependencies converge next.`,
      depth: 1,
    });
  }

  if (activeLens.type === "lane") {
    const lane = model.laneById.get(activeLens.id);
    if (!lane || !lane.connectedCompanies.length) {
      return null;
    }
    return buildLensPayloadFromCompanies(model, lane.connectedCompanies, {
      kind: "lane",
      title: lane.label,
      strap: "Flow step",
      summary: `${lane.description} Use this lens to inspect who feeds into this step and where it hands off next.`,
      depth: 1,
    });
  }

  if (activeLens.type === "country") {
    const country = model.countryById.get(activeLens.id);
    if (!country || !country.connectedCompanies.length) {
      return null;
    }
    return buildLensPayloadFromCompanies(model, country.connectedCompanies, {
      kind: "country",
      title: country.displayName,
      strap: "Country corridor",
      summary: `${country.displayName} currently anchors ${country.connectedCompanies.length} dependency-connected companies in the public flow map.`,
      depth: 1,
    });
  }

  if (activeLens.type === "scenario") {
    const scenario = getScenarioById(activeLens.id);
    const companies = scenario.companyNames.map((name) => findCompanyByName(model, name)).filter(Boolean);
    return buildLensPayloadFromCompanies(model, companies, {
      kind: "scenario",
      title: scenario.title,
      strap: scenario.strap,
      summary: scenario.summary,
      whyItMatters: scenario.whyItMatters,
      depth: 2,
    });
  }

  return null;
}

export function getNodePayload(model, nodeId) {
  const company = getNode(model, nodeId);
  if (!company) {
    return null;
  }
  const neighborhoodIds = collectNeighborhood(model, company.id, 1);
  const neighborhoodEdges = company.dependencyEdges;
  return {
    kind: "company",
    strap: company.displayStageLabel ?? company.flowLaneLabel ?? "Company",
    title: company.displayName,
    summary: company.summary,
    cards: [
      { label: "Country", value: company.countryName },
      { label: "Stage", value: company.displayStageLabel ?? "Unmapped" },
      { label: "Upstream", value: company.inDegree },
      { label: "Downstream", value: company.outDegree },
    ],
    badges: [...company.roleLabels, ...company.segmentLabels],
    facilities: company.facilities,
    edgeGroups: [
      {
        title: "Receives from",
        edges: company.dependencyInEdges,
      },
      {
        title: "Feeds into",
        edges: company.dependencyOutEdges,
      },
    ].filter((group) => group.edges.length),
    related: {
      "Upstream suppliers": company.upstreamCompanies,
      "Downstream dependents": company.downstreamCompanies,
    },
    sourceFooting: collectSourceFooting(neighborhoodEdges),
    neighborhoodIds,
    edgeIds: new Set(company.dependencyEdges.map((edge) => edge.id)),
    cameraIds: [company.id, ...company.upstreamCompanies.map((item) => item.id), ...company.downstreamCompanies.map((item) => item.id)],
  };
}

export function getEdgePayload(model, edgeId) {
  const edge = getEdge(model, edgeId);
  if (!edge) {
    return null;
  }
  return {
    kind: "edge",
    strap: edge.relationshipLabel,
    title: `${edge.source.displayName} -> ${edge.target.displayName}`,
    summary: edge.summary,
    cards: [
      { label: "Item", value: edge.itemLabel },
      { label: "Stage", value: edge.stageLabel ?? "Not specified" },
      { label: "Confidence", value: edge.confidencePercent != null ? `${edge.confidencePercent}%` : "Not set" },
      { label: "Sources", value: edge.sources.length },
    ],
    companies: [edge.source, edge.target],
    sourceFooting: edge.sources,
    edgeIds: new Set([edge.id]),
    neighborhoodIds: new Set([edge.source.id, edge.target.id]),
    cameraIds: [edge.source.id, edge.target.id],
  };
}
