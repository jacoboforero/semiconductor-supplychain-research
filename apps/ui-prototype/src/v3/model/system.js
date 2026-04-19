import { getNodePayload } from "../../lib/bundle";

export const V3_STAGE_META = [
  {
    id: "design_stack",
    label: "Design Stack",
    strap: "Upstream branch",
    summary: "EDA, IP, and design firms define what reaches manufacturing.",
    detail:
      "This branch turns architecture, IP, and design tooling into manufacturing-ready intent. It sits upstream of physical production, but it is a parallel branch rather than the first box in a line.",
    color: "#6bc5d3",
    tint: "rgba(107, 197, 211, 0.14)",
    shortLabel: "Design",
    layout: {
      left: "16%",
      top: "27%",
      width: "clamp(188px, 15vw, 228px)",
    },
    companyLayout: {
      left: "16%",
      top: "28%",
      width: "clamp(188px, 15vw, 228px)",
    },
  },
  {
    id: "materials_and_chemicals",
    label: "Materials & Chemicals",
    strap: "Upstream branch",
    summary: "Process chemicals, gases, and consumables feed wafer manufacturing.",
    detail:
      "This branch covers direct fab consumables and process materials. It converges with the other input branches rather than flowing through them in sequence.",
    color: "#7fd0a1",
    tint: "rgba(127, 208, 161, 0.15)",
    shortLabel: "Materials",
    layout: {
      left: "16%",
      top: "48%",
      width: "clamp(188px, 15vw, 228px)",
    },
    companyLayout: {
      left: "16%",
      top: "58%",
      width: "clamp(188px, 15vw, 228px)",
    },
  },
  {
    id: "wafers_and_substrates",
    label: "Wafers & Substrates",
    strap: "Upstream branch",
    summary: "Wafer and substrate suppliers provide the physical base for fabrication.",
    detail:
      "This branch represents the physical surfaces and substrates that manufacturing depends on. It is a peer upstream branch, not a middle step in a linear pipeline.",
    color: "#7aa6e8",
    tint: "rgba(122, 166, 232, 0.15)",
    shortLabel: "Wafers",
    layout: {
      left: "29%",
      top: "67%",
      width: "clamp(188px, 15vw, 228px)",
    },
    companyLayout: {
      left: "33%",
      top: "74%",
      width: "clamp(188px, 15vw, 228px)",
    },
  },
  {
    id: "masks_and_reticles",
    label: "Masks & Reticles",
    strap: "Convergence input",
    summary: "Mask creation turns chip intent into lithography-ready patterning inputs.",
    detail:
      "Masks and reticles matter because design intent becomes something the fab can physically use. This is one of the clearest bridges between the design branch and manufacturing.",
    color: "#f2a86a",
    tint: "rgba(242, 168, 106, 0.15)",
    shortLabel: "Masks",
    layout: {
      left: "45.5%",
      top: "83%",
      width: "clamp(176px, 13.2vw, 212px)",
    },
    companyLayout: {
      left: "48.2%",
      top: "84.2%",
      width: "clamp(176px, 13.2vw, 212px)",
    },
  },
  {
    id: "production_tooling",
    label: "Production Tooling",
    strap: "Upstream branch",
    summary: "Toolmakers enable fabrication, inspection, and process control at scale.",
    detail:
      "Tooling is not a later step after materials. It is a parallel enabling branch that converges with design and physical inputs.",
    color: "#c3d56b",
    tint: "rgba(195, 213, 107, 0.15)",
    shortLabel: "Tooling",
    layout: {
      left: "43%",
      top: "33%",
      width: "clamp(194px, 15.5vw, 232px)",
    },
    companyLayout: {
      left: "43%",
      top: "38%",
      width: "clamp(194px, 15.5vw, 232px)",
    },
  },
  {
    id: "wafer_fabrication",
    label: "Wafer Fabrication",
    strap: "Main convergence",
    summary: "Design, materials, masks, wafers, and tooling converge in the fab.",
    detail:
      "This is the main convergence point in the map. It is where multiple upstream branches become manufacturing reality.",
    color: "#f2b074",
    tint: "rgba(242, 176, 116, 0.17)",
    shortLabel: "Wafer Fab",
    layout: {
      left: "62%",
      top: "52%",
      width: "clamp(204px, 16vw, 242px)",
    },
    companyLayout: {
      left: "62%",
      top: "53%",
      width: "clamp(204px, 16vw, 242px)",
    },
  },
  {
    id: "packaging_and_test",
    label: "Packaging & Test",
    strap: "Output conversion",
    summary: "Processed wafers become usable chip output through assembly and test.",
    detail:
      "This is the second major convergence point. It bridges fabrication output and downstream availability.",
    color: "#c78fe1",
    tint: "rgba(199, 143, 225, 0.16)",
    shortLabel: "Packaging",
    layout: {
      left: "79%",
      top: "61%",
      width: "clamp(194px, 15vw, 232px)",
    },
    companyLayout: {
      left: "79%",
      top: "63%",
      width: "clamp(194px, 15vw, 232px)",
    },
  },
  {
    id: "downstream_delivery",
    label: "Downstream Delivery",
    strap: "Demand pull",
    summary: "Product-side demand pulls the system toward finished chip output.",
    detail:
      "This branch is where the supply chain becomes visible to product-side demand without trying to model the full electronics stack.",
    color: "#ee8f9f",
    tint: "rgba(238, 143, 159, 0.15)",
    shortLabel: "Delivery",
    layout: {
      left: "92.9%",
      top: "46%",
      width: "clamp(178px, 13.2vw, 214px)",
    },
    companyLayout: {
      left: "92.9%",
      top: "42%",
      width: "clamp(178px, 13.2vw, 214px)",
    },
  },
];

export const V3_STAGE_CONNECTIONS = [
  { id: "design-to-fab", from: "design_stack", to: "wafer_fabrication", kind: "primary" },
  { id: "materials-to-fab", from: "materials_and_chemicals", to: "wafer_fabrication", kind: "primary" },
  { id: "wafers-to-fab", from: "wafers_and_substrates", to: "wafer_fabrication", kind: "primary" },
  { id: "masks-to-fab", from: "masks_and_reticles", to: "wafer_fabrication", kind: "primary" },
  { id: "tooling-to-fab", from: "production_tooling", to: "wafer_fabrication", kind: "primary" },
  { id: "fab-to-packaging", from: "wafer_fabrication", to: "packaging_and_test", kind: "primary" },
  { id: "packaging-to-downstream", from: "packaging_and_test", to: "downstream_delivery", kind: "primary" },
  { id: "design-to-masks", from: "design_stack", to: "masks_and_reticles", kind: "secondary", label: "Tapeout" },
  {
    id: "fab-to-downstream",
    from: "wafer_fabrication",
    to: "downstream_delivery",
    kind: "secondary",
    label: "Integrated release",
  },
];

export const V3_STAGE_GROUPS = [
  {
    id: "physical_inputs",
    label: "Physical inputs",
    left: "9%",
    top: "32%",
    width: "34%",
    height: "56%",
  },
  {
    id: "convergence",
    label: "Primary convergence",
    left: "52%",
    top: "38%",
    width: "16%",
    height: "28%",
  },
];

const REPRESENTATIVE_LIMITS = {
  design_stack: 4,
  materials_and_chemicals: 2,
  wafers_and_substrates: 3,
  masks_and_reticles: 2,
  production_tooling: 3,
  wafer_fabrication: 4,
  packaging_and_test: 3,
  downstream_delivery: 4,
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

function sortCompanies(companies) {
  return [...companies].sort(
    (a, b) =>
      (b.dependencyDegree ?? 0) - (a.dependencyDegree ?? 0) ||
      (b.outDegree ?? 0) - (a.outDegree ?? 0) ||
      a.displayName.localeCompare(b.displayName)
  );
}

function sortEdges(edges) {
  return [...edges].sort(
    (a, b) =>
      (b.source.dependencyDegree ?? 0) +
        (b.target.dependencyDegree ?? 0) -
        ((a.source.dependencyDegree ?? 0) + (a.target.dependencyDegree ?? 0)) ||
      a.source.displayName.localeCompare(b.source.displayName) ||
      a.target.displayName.localeCompare(b.target.displayName)
  );
}

function collectSourcesForCompanies(companies) {
  return dedupeSources(companies.flatMap((company) => company.dependencyEdges.flatMap((edge) => edge.sources ?? [])));
}

export function getV3StageIdForCompany(company) {
  const roles = new Set(company.roleCodes ?? []);
  switch (company.displayStage) {
    case "design_enablement":
      return "design_stack";
    case "materials_and_chemicals":
      return "materials_and_chemicals";
    case "wafers_and_substrates":
      return "wafers_and_substrates";
    case "masks_and_reticles":
      return "masks_and_reticles";
    case "manufacturing_equipment":
      return "production_tooling";
    case "wafer_fabrication":
      return "wafer_fabrication";
    case "packaging_and_test":
      return "packaging_and_test";
    case "device_companies":
      if (
        roles.has("ROLE.IDM") ||
        roles.has("ROLE.MEMORY_MANUFACTURER") ||
        roles.has("ROLE.ANALOG_POWER_MANUFACTURER")
      ) {
        return "wafer_fabrication";
      }
      return "downstream_delivery";
    default:
      return "downstream_delivery";
  }
}

function buildStageLinkCounts(model) {
  const counts = new Map();
  const increment = (fromStageId, toStageId) => {
    const key = `${fromStageId}->${toStageId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  for (const edge of model.dependencyEdges) {
    const fromStageId = getV3StageIdForCompany(edge.source);
    const toStageId = getV3StageIdForCompany(edge.target);
    increment(fromStageId, toStageId);
  }

  return counts;
}

function buildMapStages(model, stageLinkCounts) {
  return V3_STAGE_META.map((meta) => {
    const companies = sortCompanies(model.companies.filter((company) => getV3StageIdForCompany(company) === meta.id));
    const connectedCompanies = companies.filter((company) => company.connected);
    const relationships = connectedCompanies.reduce((count, company) => count + company.dependencyDegree, 0);
    const incomingLinks = V3_STAGE_CONNECTIONS.filter((connection) => connection.to === meta.id).reduce(
      (sum, connection) => sum + (stageLinkCounts.get(`${connection.from}->${connection.to}`) ?? 0),
      0
    );
    const outgoingLinks = V3_STAGE_CONNECTIONS.filter((connection) => connection.from === meta.id).reduce(
      (sum, connection) => sum + (stageLinkCounts.get(`${connection.from}->${connection.to}`) ?? 0),
      0
    );

    return {
      ...meta,
      companies,
      connectedCompanies,
      representativeCompanies: connectedCompanies.slice(0, REPRESENTATIVE_LIMITS[meta.id] ?? 3),
      relationships,
      incomingLinks,
      outgoingLinks,
      sourceFooting: collectSourcesForCompanies(connectedCompanies),
      topHub: connectedCompanies[0] ?? null,
    };
  });
}

export function buildV3Model(model) {
  const stageLinkCounts = buildStageLinkCounts(model);
  const mapStages = buildMapStages(model, stageLinkCounts);
  const mapStageById = new Map(mapStages.map((stage) => [stage.id, stage]));
  const mapConnections = V3_STAGE_CONNECTIONS.map((connection) => ({
    ...connection,
    evidenceCount: stageLinkCounts.get(`${connection.from}->${connection.to}`) ?? 0,
  }));

  return {
    ...model,
    mapStages,
    mapStageById,
    mapConnections,
    mapGroups: V3_STAGE_GROUPS,
  };
}

function relatedStageIds(v3Model, stageId, direction) {
  return uniqueById(
    v3Model.mapConnections
      .filter((connection) => (direction === "in" ? connection.to === stageId : connection.from === stageId))
      .map((connection) => v3Model.mapStageById.get(direction === "in" ? connection.from : connection.to))
  );
}

export function buildV3OverviewPayload(v3Model) {
  return {
    kind: "overview",
    strap: "Supply chain map",
    title: "Semiconductor supply chain",
    summary:
      "Parallel upstream branches converge in wafer fabrication, then move through packaging and test toward downstream demand.",
    whyItMatters: "Use this view to understand the structure before opening categories or companies.",
    cards: [
      { label: "Catalog companies", value: v3Model.metrics.catalogCompanies },
      { label: "Linked companies", value: v3Model.metrics.connectedCompanies },
      { label: "Cited links", value: v3Model.metrics.relationships },
      { label: "Map categories", value: v3Model.mapStages.length },
    ],
    companies: v3Model.hubCompanies,
  };
}

export function buildV3StagePayload(v3Model, stageId) {
  const stage = v3Model.mapStageById.get(stageId);
  if (!stage) {
    return buildV3OverviewPayload(v3Model);
  }

  return {
    kind: "stage",
    strap: stage.strap,
    title: stage.label,
    summary: stage.summary,
    whyItMatters: stage.detail,
    cards: [
      { label: "Linked companies", value: stage.connectedCompanies.length },
      { label: "Shown here", value: stage.representativeCompanies.length },
      { label: "Incoming links", value: stage.incomingLinks },
      { label: "Outgoing links", value: stage.outgoingLinks },
    ],
    badges: [stage.shortLabel],
    companies: stage.connectedCompanies.slice(0, 8),
    upstreamStages: relatedStageIds(v3Model, stage.id, "in"),
    downstreamStages: relatedStageIds(v3Model, stage.id, "out"),
    sourceFooting: stage.sourceFooting.slice(0, 6),
  };
}

export function buildV3CompanyPayload(v3Model, companyId) {
  const payload = getNodePayload(v3Model, companyId);
  if (!payload) {
    return buildV3OverviewPayload(v3Model);
  }
  const company = v3Model.companyById.get(companyId);
  const stageId = company ? getV3StageIdForCompany(company) : null;
  const stage = stageId ? v3Model.mapStageById.get(stageId) : null;
  return {
    ...payload,
    badges: stage ? [stage.label, ...payload.badges] : payload.badges,
  };
}

function companyFocusSet(company) {
  if (!company) {
    return new Set();
  }
  return new Set([
    company.id,
    ...company.upstreamCompanies.map((item) => item.id),
    ...company.downstreamCompanies.map((item) => item.id),
  ]);
}

export function buildRepresentativeScene(v3Model, { selectedStageId = null, selectedCompanyId = null } = {}) {
  const visibleByStage = new Map(
    v3Model.mapStages.map((stage) => [stage.id, [...stage.representativeCompanies]])
  );
  const selectedCompany = selectedCompanyId ? v3Model.companyById.get(selectedCompanyId) : null;
  const focusedIds = companyFocusSet(selectedCompany);

  if (selectedStageId && v3Model.mapStageById.has(selectedStageId)) {
    visibleByStage.set(
      selectedStageId,
      v3Model.mapStageById.get(selectedStageId).connectedCompanies.slice(0, 8)
    );
  }

  if (selectedCompany) {
    const stageId = getV3StageIdForCompany(selectedCompany);
    const current = visibleByStage.get(stageId) ?? [];
    visibleByStage.set(stageId, uniqueById([selectedCompany, ...current]).slice(0, 8));

    const neighbors = uniqueById([...selectedCompany.upstreamCompanies, ...selectedCompany.downstreamCompanies]);
    for (const neighbor of neighbors) {
      const neighborStageId = getV3StageIdForCompany(neighbor);
      const next = visibleByStage.get(neighborStageId) ?? [];
      visibleByStage.set(neighborStageId, uniqueById([neighbor, ...next]).slice(0, 6));
    }
  }

  const visibleCompanyIds = new Set(
    [...visibleByStage.values()].flatMap((companies) => companies.map((company) => company.id))
  );

  const visibleEdges = sortEdges(
    v3Model.dependencyEdges.filter(
      (edge) => visibleCompanyIds.has(edge.source.id) && visibleCompanyIds.has(edge.target.id)
    )
  ).slice(0, selectedCompany ? 24 : 18);

  return {
    stages: v3Model.mapStages.map((stage) => ({
      ...stage,
      visibleCompanies: sortCompanies(visibleByStage.get(stage.id) ?? []),
      isSelected: stage.id === selectedStageId,
      containsSelectedCompany: selectedCompany ? getV3StageIdForCompany(selectedCompany) === stage.id : false,
    })),
    visibleEdges,
    focusedIds,
    selectedCompanyId,
  };
}
