const state = {
  bundle: null,
  bundleOrigin: null,
  activeView: "overview",
  activeScenarioKey: "taiwan-foundry",
  stageNodeId: null,
  profileNodeId: null,
  focusNodeId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  filter: "",
  zoom: 1,
  graphSignature: null,
  graphMetrics: null,
  pendingGraphAnchor: null,
  panSession: null,
  gestureSession: null,
  suppressGraphClick: false,
  resizeTimer: null,
};

const zoomLimits = {
  min: 0.38,
  max: 2.6,
  step: 1.18,
};

const refs = {
  fileInput: document.getElementById("bundle-file"),
  clearButton: document.getElementById("clear-button"),
  overviewView: document.getElementById("overview-view"),
  stageView: document.getElementById("stage-view"),
  profileView: document.getElementById("profile-view"),
  networkView: document.getElementById("network-view"),
  scenariosView: document.getElementById("scenarios-view"),
  viewOverviewButton: document.getElementById("view-overview-button"),
  viewStageButton: document.getElementById("view-stage-button"),
  viewProfileButton: document.getElementById("view-profile-button"),
  viewNetworkButton: document.getElementById("view-network-button"),
  viewScenariosButton: document.getElementById("view-scenarios-button"),
  overviewMetrics: document.getElementById("overview-metrics"),
  convergenceMap: document.getElementById("convergence-map"),
  overviewGuides: document.getElementById("overview-guides"),
  overviewStageGrid: document.getElementById("overview-stage-grid"),
  overviewWatchlist: document.getElementById("overview-watchlist"),
  overviewGeography: document.getElementById("overview-geography"),
  overviewOpenNetwork: document.getElementById("overview-open-network"),
  overviewOpenScenarios: document.getElementById("overview-open-scenarios"),
  stageBreadcrumbOverview: document.getElementById("stage-breadcrumb-overview"),
  stageBreadcrumbCurrent: document.getElementById("stage-breadcrumb-current"),
  stageTitle: document.getElementById("stage-title"),
  stageSummary: document.getElementById("stage-summary"),
  stageMetrics: document.getElementById("stage-metrics"),
  stageInputs: document.getElementById("stage-inputs"),
  stageOutputs: document.getElementById("stage-outputs"),
  stageRoles: document.getElementById("stage-roles"),
  stageCompanies: document.getElementById("stage-companies"),
  stageGeography: document.getElementById("stage-geography"),
  stageOpenNetwork: document.getElementById("stage-open-network"),
  stageReturnOverview: document.getElementById("stage-return-overview"),
  profileBreadcrumbOverview: document.getElementById("profile-breadcrumb-overview"),
  profileBreadcrumbParent: document.getElementById("profile-breadcrumb-parent"),
  profileBreadcrumbCurrent: document.getElementById("profile-breadcrumb-current"),
  profileKicker: document.getElementById("profile-kicker"),
  profileTitle: document.getElementById("profile-title"),
  profileSummary: document.getElementById("profile-summary"),
  profileMetrics: document.getElementById("profile-metrics"),
  profileImportance: document.getElementById("profile-importance"),
  profilePosition: document.getElementById("profile-position"),
  profileLinks: document.getElementById("profile-links"),
  profileTraceability: document.getElementById("profile-traceability"),
  profileOpenNetwork: document.getElementById("profile-open-network"),
  profileReturnOverview: document.getElementById("profile-return-overview"),
  scenarioTitle: document.getElementById("scenario-title"),
  scenarioSummary: document.getElementById("scenario-summary"),
  scenarioMetrics: document.getElementById("scenario-metrics"),
  scenarioCardList: document.getElementById("scenario-card-list"),
  scenarioFraming: document.getElementById("scenario-framing"),
  scenarioStageList: document.getElementById("scenario-stage-list"),
  scenarioCompanyList: document.getElementById("scenario-company-list"),
  scenarioGeographyList: document.getElementById("scenario-geography-list"),
  scenarioFacilityList: document.getElementById("scenario-facility-list"),
  scenarioEvidence: document.getElementById("scenario-evidence"),
  scenarioNextLinks: document.getElementById("scenario-next-links"),
  scenarioOpenNetwork: document.getElementById("scenario-open-network"),
  scenarioOpenStage: document.getElementById("scenario-open-stage"),
  metricsGrid: document.getElementById("metrics-grid"),
  guideList: document.getElementById("guide-list"),
  sourceList: document.getElementById("source-list"),
  legendList: document.getElementById("legend-list"),
  countryList: document.getElementById("country-list"),
  focusBar: document.getElementById("focus-bar"),
  graphScroll: document.getElementById("graph-scroll"),
  graphCanvas: document.getElementById("graph-canvas"),
  statusText: document.getElementById("status-text"),
  nodeSearch: document.getElementById("node-search"),
  zoomOutButton: document.getElementById("zoom-out-button"),
  zoomInButton: document.getElementById("zoom-in-button"),
  fitButton: document.getElementById("fit-button"),
  centerButton: document.getElementById("center-button"),
  zoomValue: document.getElementById("zoom-value"),
  emptyState: document.getElementById("empty-state"),
  selectionTitle: document.getElementById("selection-title"),
  selectionMeta: document.getElementById("selection-meta"),
  selectionBody: document.getElementById("selection-body"),
};

const nodeTypeColors = {
  Segment: "#52784f",
  Role: "#7a4968",
  Company: "#bc5a32",
  CompanyCluster: "#d38a62",
  Country: "#1d6f7a",
  Facility: "#887246",
  FacilityCluster: "#a68b63",
  MaterialOrItemCategory: "#4d677f",
  PolicyEntity: "#7a4968",
};

const nodeTypeLabels = {
  Segment: "Supply Chain Stage",
  Role: "Specialized Role",
  Company: "Company",
  CompanyCluster: "Grouped Companies",
  Country: "Country",
  Facility: "Facility",
  FacilityCluster: "Grouped Facilities",
  MaterialOrItemCategory: "Material or Item",
  PolicyEntity: "Policy Entity",
};

const sourceLabels = {
  curated_seed: "Curated 200-company seed set",
  gleif: "GLEIF LEI records",
  edgar: "SEC EDGAR filings",
  epa_frs: "EPA facility records",
  korea_prtr: "Korea PRTR facility records",
};

const countryNames = {
  AT: "Austria",
  CA: "Canada",
  CH: "Switzerland",
  CN: "China",
  DE: "Germany",
  FR: "France",
  GB: "United Kingdom",
  HK: "Hong Kong",
  IE: "Ireland",
  IL: "Israel",
  JP: "Japan",
  KR: "South Korea",
  LU: "Luxembourg",
  MY: "Malaysia",
  NL: "Netherlands",
  SG: "Singapore",
  TH: "Thailand",
  TW: "Taiwan",
  US: "United States",
};

const chipLabels = {
  "CHIP.LOGIC": "Logic chips",
  "CHIP.MEMORY": "Memory chips",
  "CHIP.ANALOG": "Analog chips",
  "CHIP.MIXED_SIGNAL": "Mixed-signal chips",
  "CHIP.POWER": "Power chips",
  "CHIP.SENSOR": "Sensors",
};

const guidedViewSpecs = [
  {
    label: "Start with design",
    description: "See the design side of the chain, including fabless and EDA-oriented companies.",
    match: { nodeType: "Segment", displayName: "Design and Software" },
  },
  {
    label: "See chip manufacturing",
    description: "Focus on foundries, wafers, and front-end manufacturing roles.",
    match: { nodeType: "Segment", displayName: "Front-end Manufacturing" },
  },
  {
    label: "See packaging and test",
    description: "Focus on back-end manufacturing, OSAT, packaging, and test services.",
    match: { nodeType: "Segment", displayName: "Back-end Manufacturing" },
  },
  {
    label: "See the equipment layer",
    description: "Look at the equipment providers that fabs and packaging lines depend on.",
    match: { nodeType: "Segment", displayName: "Manufacturing Equipment" },
  },
];

const stageDescriptions = {
  "Design and Software":
    "Architectures, IP, and design tooling develop in parallel with the physical manufacturing stack.",
  "Manufacturing Equipment":
    "Tools enable fabs and packaging lines to operate, making this a broad enabling layer rather than a downstream step.",
  "Materials":
    "Process chemicals, specialty gases, and consumables feed manufacturing long before finished chips appear.",
  "Wafers and Substrates":
    "Wafers and package substrates enter different points in the system and converge during fab and packaging.",
  "Masks and Reticles":
    "Photomasks translate design intent into wafer fabrication, creating an important bridge into the fab.",
  "Front-end Manufacturing":
    "Wafer fabrication is a major convergence point where design, masks, materials, tools, and wafers all have to come together.",
  "Back-end Manufacturing":
    "Packaging and test form a second major convergence point before chips can reach downstream systems.",
};

const systemStageOrder = [
  "Design and Software",
  "Manufacturing Equipment",
  "Materials",
  "Wafers and Substrates",
  "Masks and Reticles",
  "Front-end Manufacturing",
  "Back-end Manufacturing",
];

const convergenceStepDescriptions = {
  "Front-end Manufacturing":
    "Design intent, masks, wafers, tools, and process materials must all arrive together here before chips can exist physically.",
  "Back-end Manufacturing":
    "Fabricated wafers, substrates, packaging capability, and test capacity converge here before chips can ship as usable components.",
};

const stageExplorerSpecs = {
  "Design and Software": {
    summary:
      "This stage defines what the chip is supposed to become. Architectures, IP, EDA tooling, and tapeout intent are set here before the physical manufacturing stack turns that intent into wafers.",
    dependsOn: [],
    enables: ["Masks and Reticles", "Front-end Manufacturing"],
  },
  "Manufacturing Equipment": {
    summary:
      "Equipment is a horizontal enabling layer. It does not sit neatly at the end of one chain; fabs and packaging lines both depend on it to operate at all.",
    dependsOn: [],
    enables: ["Front-end Manufacturing", "Back-end Manufacturing"],
  },
  "Materials": {
    summary:
      "Specialty gases, chemicals, and consumables feed critical process steps long before finished chips exist, which makes this stage one of the most important upstream risk layers.",
    dependsOn: [],
    enables: ["Front-end Manufacturing", "Back-end Manufacturing"],
  },
  "Wafers and Substrates": {
    summary:
      "Wafers feed fabrication while substrates matter later in packaging. This stage straddles both major manufacturing junctions rather than mapping to a single downstream step.",
    dependsOn: [],
    enables: ["Front-end Manufacturing", "Back-end Manufacturing"],
  },
  "Masks and Reticles": {
    summary:
      "Masks translate design intent into something a fab can actually pattern onto a wafer, which makes this a critical bridge between the abstract design stream and physical fabrication.",
    dependsOn: ["Design and Software"],
    enables: ["Front-end Manufacturing"],
  },
  "Front-end Manufacturing": {
    summary:
      "Wafer fabrication is the first major manufacturing junction. It is where design, masks, wafers, process materials, and advanced tools all have to come together at the same time.",
    dependsOn: ["Design and Software", "Manufacturing Equipment", "Materials", "Wafers and Substrates", "Masks and Reticles"],
    enables: ["Back-end Manufacturing"],
  },
  "Back-end Manufacturing": {
    summary:
      "Packaging and test are the second major junction. This stage turns fabricated wafers into deployable chip components and often reveals a different set of concentration risks than the fab layer.",
    dependsOn: ["Front-end Manufacturing", "Manufacturing Equipment", "Materials", "Wafers and Substrates"],
    enables: ["Finished chip exposure"],
  },
};

const scenarioSpecs = [
  {
    key: "taiwan-foundry",
    title: "Taiwan foundry disruption",
    description:
      "Constrain Taiwan-centered foundry capacity at the front-end manufacturing junction and inspect how that stress propagates across upstream design demand and downstream packaging.",
    primaryStage: "Front-end Manufacturing",
    anchorCountry: "TW",
    anchorRoles: ["Foundry"],
    stageNames: ["Design and Software", "Masks and Reticles", "Materials", "Wafers and Substrates", "Front-end Manufacturing", "Back-end Manufacturing"],
    framing: [
      "This scenario starts at the first major manufacturing junction, where design, masks, wafers, materials, and advanced tools have to converge at once.",
      "Taiwan matters in this snapshot because several representative foundry companies are anchored there, concentrating conversion capacity at one geography.",
      "The scenario is most useful as a concentration and blast-radius briefing, not as a claim about verified customer-supplier links between individual firms.",
    ],
    blastRadius: [
      "Design-side demand can keep accumulating upstream even when foundry conversion capacity is impaired.",
      "Back-end manufacturing remains downstream and operationally important, but wafer shortages eventually limit what can reach packaging and test.",
      "The strategic risk comes from a narrow geography hosting several representative foundry nodes at the same fabrication junction.",
    ],
    confidenceTitle: "Structural concentration read",
    confidenceNote:
      "Grounded in the current snapshot's stage placement, foundry role mapping, Taiwan company concentration, and public source anchors. It does not assert firm-to-firm commercial dependencies.",
    networkMatch: { nodeType: "Segment", displayName: "Front-end Manufacturing" },
    companyPriority: [
      "Taiwan Semiconductor Manufacturing Company Limited",
      "United Microelectronics Corporation",
      "Powerchip Semiconductor Manufacturing Corporation",
      "Vanguard International Semiconductor",
      "WIN Semiconductors",
      "Advanced Wireless Semiconductor Company",
    ],
  },
  {
    key: "specialty-gas",
    title: "Specialty gas chokepoint",
    description:
      "Start from specialty gas suppliers inside the materials layer and trace how an upstream input bottleneck would pressure wafer fabrication and then downstream manufacturing.",
    primaryStage: "Materials",
    anchorRoles: ["Specialty Gases Supplier"],
    stageNames: ["Materials", "Front-end Manufacturing", "Back-end Manufacturing"],
    framing: [
      "Specialty gases look upstream, but they matter because they feed process steps long before finished chips appear.",
      "This scenario highlights how a narrow supplier set in the materials stage can become a hidden chokepoint for fabrication throughput.",
      "The current prototype is stronger on stage and role concentration than on plant-by-plant gas delivery paths, so the scenario should be read at that level.",
    ],
    blastRadius: [
      "Front-end manufacturing absorbs the first visible shock because specialty gases are consumed in fab process steps.",
      "Downstream packaging and test may remain staffed and ready, but their usable wafer input falls if fabrication throughput drops.",
      "The risk is upstream, but the operational effect emerges later at the manufacturing junctions.",
    ],
    confidenceTitle: "Upstream input chokepoint read",
    confidenceNote:
      "Grounded in materials-stage role mapping and representative specialty gas suppliers in the current snapshot. It does not model specific fab-by-fab gas dependencies yet.",
    networkMatch: { nodeType: "Segment", displayName: "Materials" },
    companyPriority: ["Taiyo Nippon Sanso", "SK Materials", "Air Products and Chemicals", "Air Liquide", "Linde"],
  },
  {
    key: "osat-bottleneck",
    title: "Advanced packaging or OSAT bottleneck",
    description:
      "Start from back-end manufacturing and inspect how OSAT, packaging, and test concentration could bottleneck usable chip output even after wafers are fabricated.",
    primaryStage: "Back-end Manufacturing",
    anchorRoles: ["OSAT", "Packaging Specialist", "Test Service"],
    stageNames: ["Front-end Manufacturing", "Back-end Manufacturing", "Wafers and Substrates"],
    framing: [
      "This scenario starts at the second major manufacturing junction, where fabricated wafers need packaging, substrates, assembly, and test capacity to become usable output.",
      "OSAT concentration matters because bottlenecks can appear after wafer fabrication succeeds, creating a different risk layer than foundry concentration.",
      "The current snapshot captures representative OSAT companies across a few countries, which is enough for a first concentration read even without exhaustive facility data.",
    ],
    blastRadius: [
      "Fabricated wafers can accumulate upstream if back-end capacity becomes the constraining step.",
      "Substrate and packaging-material dependence becomes more visible once the bottleneck moves from the fab to OSAT and test services.",
      "The disruption shows that manufacturing risk is not only in foundries; it can also sit in packaging and test conversion capacity.",
    ],
    confidenceTitle: "Back-end bottleneck read",
    confidenceNote:
      "Grounded in back-end manufacturing stage placement and OSAT-related role concentration in the current snapshot. It does not yet model specific package-type dependencies.",
    networkMatch: { nodeType: "Segment", displayName: "Back-end Manufacturing" },
    companyPriority: [
      "ASE Technology Holding Co., Ltd.",
      "Amkor Technology, Inc.",
      "JCET Group",
      "Powertech Technology",
      "ChipMOS Technologies",
      "King Yuan Electronics",
    ],
  },
];

refs.viewOverviewButton.addEventListener("click", () => switchProductView("overview"));
refs.viewStageButton.addEventListener("click", () => {
  if (state.stageNodeId) {
    switchProductView("stage");
  }
});
refs.viewProfileButton.addEventListener("click", () => {
  if (state.profileNodeId) {
    switchProductView("profile");
  }
});
refs.viewNetworkButton.addEventListener("click", () => switchProductView("network"));
refs.viewScenariosButton.addEventListener("click", () => switchProductView("scenarios"));
refs.overviewOpenNetwork.addEventListener("click", () => switchProductView("network"));
refs.overviewOpenScenarios.addEventListener("click", () => switchProductView("scenarios"));
refs.stageBreadcrumbOverview.addEventListener("click", () => switchProductView("overview"));
refs.stageReturnOverview.addEventListener("click", () => switchProductView("overview"));
refs.stageOpenNetwork.addEventListener("click", () => {
  if (state.stageNodeId) {
    activateNetworkFocus(state.stageNodeId);
  } else {
    switchProductView("network");
  }
});
refs.profileBreadcrumbOverview.addEventListener("click", () => switchProductView("overview"));
refs.profileBreadcrumbParent.addEventListener("click", () => {
  if (state.stageNodeId) {
    switchProductView("stage");
  } else {
    switchProductView("overview");
  }
});
refs.profileReturnOverview.addEventListener("click", () => switchProductView("overview"));
refs.profileOpenNetwork.addEventListener("click", () => {
  if (state.profileNodeId) {
    activateNetworkFocus(state.profileNodeId);
  } else {
    switchProductView("network");
  }
});
refs.scenarioOpenNetwork.addEventListener("click", () => {
  const scenario = getActiveScenarioSpec();
  if (!scenario?.networkMatch) {
    switchProductView("network");
    return;
  }
  const node = findNode(scenario.networkMatch);
  if (node) {
    activateNetworkFocus(node.node_id);
  } else {
    switchProductView("network");
  }
});
refs.scenarioOpenStage.addEventListener("click", () => {
  const scenario = getActiveScenarioSpec();
  if (!scenario?.primaryStage) {
    switchProductView("overview");
    return;
  }
  const node = findNode({ nodeType: "Segment", displayName: scenario.primaryStage });
  if (node) {
    activateStageExplorer(node.node_id);
  } else {
    switchProductView("overview");
  }
});

refs.fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files ?? [];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    validateBundle(parsed);
    state.bundle = parsed;
    state.bundleOrigin = "uploaded";
    state.activeView = "overview";
    state.stageNodeId = null;
    state.profileNodeId = null;
    state.focusNodeId = null;
    state.selectedEdgeId = null;
    state.selectedNodeId = null;
    state.filter = "";
    state.graphSignature = null;
    refs.nodeSearch.value = "";
    render();
  } catch (error) {
    window.alert(`Failed to load snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }
});

refs.clearButton.addEventListener("click", () => {
  state.activeView = "overview";
  state.stageNodeId = null;
  state.profileNodeId = null;
  state.focusNodeId = null;
  state.selectedNodeId = null;
  state.selectedEdgeId = null;
  state.filter = "";
  state.graphSignature = null;
  refs.nodeSearch.value = "";

  if (!state.bundle && window.__SEMISUPPLY_DEMO_BUNDLE__) {
    try {
      validateBundle(window.__SEMISUPPLY_DEMO_BUNDLE__);
      state.bundle = window.__SEMISUPPLY_DEMO_BUNDLE__;
      state.bundleOrigin = "demo";
    } catch (error) {
      console.error("Failed to restore bundled demo", error);
    }
  }

  render();
});

refs.nodeSearch.addEventListener("input", (event) => {
  state.filter = event.target.value.trim().toLowerCase();
  render();
});

refs.zoomOutButton.addEventListener("click", () => {
  setGraphZoom(state.zoom / zoomLimits.step);
});

refs.zoomInButton.addEventListener("click", () => {
  setGraphZoom(state.zoom * zoomLimits.step);
});

refs.fitButton.addEventListener("click", () => {
  fitCurrentGraph();
});

refs.centerButton.addEventListener("click", () => {
  centerCurrentSelection();
});

refs.graphCanvas.addEventListener("click", () => {
  if (state.suppressGraphClick) {
    state.suppressGraphClick = false;
    return;
  }
  state.selectedNodeId = state.focusNodeId;
  state.selectedEdgeId = null;
  renderInspector();
  renderGraph();
});

setupGraphNavigation();
bootstrap();

function bootstrap() {
  const demoBundle = window.__SEMISUPPLY_DEMO_BUNDLE__;
  if (demoBundle) {
    try {
      validateBundle(demoBundle);
      state.bundle = demoBundle;
      state.bundleOrigin = "demo";
    } catch (error) {
      console.error("Failed to load bundled demo", error);
    }
  }
  applyInitialRoute();
  render();
}

function applyInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view");
  const requestedScenario = params.get("scenario");
  const requestedStage = params.get("stage");
  const requestedProfile = params.get("profile");
  const requestedProfileType = params.get("profileType");
  const requestedZoom = Number(params.get("zoom"));

  if (Number.isFinite(requestedZoom) && requestedZoom > 0) {
    state.zoom = clamp(requestedZoom / 100, zoomLimits.min, zoomLimits.max);
  }

  if (requestedScenario && scenarioSpecs.some((scenario) => scenario.key === requestedScenario)) {
    state.activeScenarioKey = requestedScenario;
  }

  if (requestedProfile) {
    const profileNode = (state.bundle?.nodes ?? []).find((node) => {
      if (requestedProfileType && node.node_type !== requestedProfileType) {
        return false;
      }
      return node.display_name === requestedProfile;
    });
    if (profileNode) {
      state.profileNodeId = profileNode.node_id;
      state.focusNodeId = profileNode.node_id;
      state.selectedNodeId = profileNode.node_id;
      if (profileNode.node_type === "Company") {
        const stage = getConnectedNodes(profileNode.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })[0];
        state.stageNodeId = stage?.node_id ?? null;
      }
      state.activeView = requestedView === "network" ? "network" : "profile";
      return;
    }
  }

  if (requestedStage) {
    const stageNode = findNode({ nodeType: "Segment", displayName: requestedStage });
    if (stageNode) {
      state.stageNodeId = stageNode.node_id;
      state.focusNodeId = stageNode.node_id;
      state.selectedNodeId = stageNode.node_id;
      state.activeView = requestedView === "network" ? "network" : "stage";
      return;
    }
  }

  if (requestedView && ["overview", "network", "scenarios"].includes(requestedView)) {
    state.activeView = requestedView;
  }
}

function render() {
  renderShellViews();
  renderOverview();
  renderStageExplorer();
  renderProfileView();
  renderScenarios();
  renderSummary();
  renderGuidedViews();
  renderFocusBar();
  renderNavigation();
  renderSources();
  renderLegend();
  renderCountries();
  if (state.activeView === "network") {
    renderGraph();
    renderInspector();
    renderStatus();
  }
}

function switchProductView(view) {
  if (view === "scenarios" && !getActiveScenarioSpec()) {
    state.activeScenarioKey = scenarioSpecs[0]?.key ?? null;
  }
  if (view === "stage" && !state.stageNodeId) {
    state.activeView = "overview";
  } else if (view === "profile" && !state.profileNodeId) {
    state.activeView = state.stageNodeId ? "stage" : "overview";
  } else {
    state.activeView = view;
  }
  render();
}

function renderShellViews() {
  const isOverview = state.activeView === "overview";
  const isStage = state.activeView === "stage";
  const isProfile = state.activeView === "profile";
  const isNetwork = state.activeView === "network";
  const isScenarios = state.activeView === "scenarios";

  refs.overviewView.classList.toggle("hidden", !isOverview);
  refs.stageView.classList.toggle("hidden", !isStage);
  refs.profileView.classList.toggle("hidden", !isProfile);
  refs.networkView.classList.toggle("hidden", !isNetwork);
  refs.scenariosView.classList.toggle("hidden", !isScenarios);

  refs.viewOverviewButton.classList.toggle("active", isOverview);
  refs.viewStageButton.hidden = !state.stageNodeId;
  refs.viewStageButton.classList.toggle("active", isStage);
  refs.viewProfileButton.hidden = !state.profileNodeId;
  refs.viewProfileButton.classList.toggle("active", isProfile);
  refs.viewNetworkButton.classList.toggle("active", isNetwork);
  refs.viewScenariosButton.classList.toggle("active", isScenarios);
}

function renderOverview() {
  if (!state.bundle) {
    refs.overviewMetrics.innerHTML = "";
    refs.convergenceMap.innerHTML = "";
    refs.overviewGuides.innerHTML = "";
    refs.overviewStageGrid.innerHTML = "";
    refs.overviewWatchlist.innerHTML = "";
    refs.overviewGeography.innerHTML = "";
    return;
  }

  const metrics = [
    ["Companies", state.bundle.summary.company_count],
    ["Critical facilities", state.bundle.summary.facility_count],
    ["Supply stages", state.bundle.summary.segment_count],
    ["Countries", state.bundle.summary.country_count],
  ];

  refs.overviewMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");

  renderConvergenceMap();
  renderOverviewGuides();
  renderOverviewStageGrid();
  renderOverviewWatchlist();
  renderOverviewGeography();
}

function renderStageExplorer() {
  if (!state.bundle || !state.stageNodeId) {
    refs.stageBreadcrumbCurrent.textContent = "Stage Explorer";
    refs.stageTitle.textContent = "Stage Explorer";
    refs.stageSummary.textContent =
      "Use a stage page to understand what this part of the system does before you inspect the underlying graph.";
    refs.stageMetrics.innerHTML = "";
    refs.stageInputs.innerHTML = "";
    refs.stageOutputs.innerHTML = "";
    refs.stageRoles.innerHTML = "";
    refs.stageCompanies.innerHTML = "";
    refs.stageGeography.innerHTML = "";
    return;
  }

  const stageSummary = getSegmentSummaries().find((item) => item.node.node_id === state.stageNodeId);
  if (!stageSummary) {
    state.stageNodeId = null;
    if (state.activeView === "stage") {
      state.activeView = "overview";
    }
    render();
    return;
  }

  const stageSpec = stageExplorerSpecs[stageSummary.name] ?? {
    summary: stageDescriptions[stageSummary.name] ?? "This stage is part of the semiconductor supply chain in this snapshot.",
    dependsOn: [],
    enables: [],
  };

  refs.stageBreadcrumbCurrent.textContent = stageSummary.name;
  refs.stageTitle.textContent = stageSummary.name;
  refs.stageSummary.textContent = stageSpec.summary;

  const metrics = [
    ["Companies", stageSummary.companyCount],
    ["Roles", stageSummary.roleCount],
    ["Countries", stageSummary.countryCount],
    ["Facilities", stageSummary.facilityCount],
  ];

  refs.stageMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");

  refs.stageInputs.innerHTML = renderStageLinkCards(stageSpec.dependsOn, { emptyLabel: "This stage is upstream. It begins in parallel rather than waiting on a previous manufacturing stage." });
  refs.stageOutputs.innerHTML = renderStageLinkCards(stageSpec.enables, { emptyLabel: "This stage mainly supplies system capability rather than one single next step." });

  refs.stageInputs.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
  });
  refs.stageOutputs.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
  });

  const roleCards = stageSummary.roles
    .map((role) => {
      const companies = getConnectedNodes(role.node_id, { nodeType: "Company", edgeType: "HAS_ROLE" });
      return {
        role,
        companyCount: companies.length,
      };
    })
    .sort((left, right) => right.companyCount - left.companyCount || left.role.display_name.localeCompare(right.role.display_name))
    .slice(0, 6);

  refs.stageRoles.innerHTML = roleCards
    .map(
      ({ role, companyCount }) => `
        <article class="role-spotlight-card">
          <h3>${escapeHtml(role.display_name)}</h3>
          <p>${escapeHtml(describeRoleWithinStage(role.display_name, stageSummary.name))}</p>
          <div class="stage-meta">
            <span class="meta-pill">${escapeHtml(String(companyCount))} companies</span>
          </div>
        </article>
      `
    )
    .join("");

  const companyCards = [...stageSummary.companies]
    .sort((left, right) => left.display_name.localeCompare(right.display_name))
    .slice(0, 8)
    .map((company) => {
      const country = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
      const roles = getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })
        .map((role) => role.display_name)
        .slice(0, 3);
      return `
        <article class="company-spotlight-card">
          <h3>${escapeHtml(company.display_name)}</h3>
          <p>${escapeHtml(summarizeCompanyWithinStage(company, stageSummary.name, roles))}</p>
          <div class="stage-meta">
            ${country ? `<span class="meta-pill">${escapeHtml(country.display_name)}</span>` : ""}
            ${roles.map((role) => `<span class="meta-pill">${escapeHtml(role)}</span>`).join("")}
          </div>
          <div class="overview-actions">
            <button class="ghost-button" type="button" data-company-profile-id="${escapeHtml(company.node_id)}">Open profile</button>
          </div>
        </article>
      `;
    });

  refs.stageCompanies.innerHTML = companyCards.join("");
  refs.stageCompanies.querySelectorAll("button[data-company-profile-id]").forEach((button) => {
    button.addEventListener("click", () => openNodeProfile(button.dataset.companyProfileId));
  });

  const geographyCards = getStageCountrySummaries(stageSummary)
    .slice(0, 6)
    .map(
      (country) => `
        <article class="geo-card">
          <h3>${escapeHtml(country.name)}</h3>
          <p>${escapeHtml(`${country.companyCount} companies and ${country.facilityCount} linked facilities in this stage snapshot.`)}</p>
          <div class="geo-meta">
            <span class="meta-pill">${escapeHtml(String(country.companyCount))} companies</span>
            <span class="meta-pill">${escapeHtml(String(country.facilityCount))} facilities</span>
          </div>
        </article>
      `
    )
    .join("");

  refs.stageGeography.innerHTML = geographyCards;
}

function renderProfileView() {
  if (!state.bundle || !state.profileNodeId) {
    refs.profileBreadcrumbCurrent.textContent = "Profile";
    refs.profileKicker.textContent = "Node Profile";
    refs.profileTitle.textContent = "Profile";
    refs.profileSummary.textContent =
      "Profile pages should explain why a company or facility matters before exposing the network structure behind it.";
    refs.profileMetrics.innerHTML = "";
    refs.profileImportance.innerHTML = "";
    refs.profilePosition.innerHTML = "";
    refs.profileLinks.innerHTML = "";
    refs.profileTraceability.innerHTML = "";
    refs.profileBreadcrumbParent.textContent = state.stageNodeId ? "Stage" : "Overview";
    return;
  }

  const node = getNodeById(state.profileNodeId);
  if (!node) {
    state.profileNodeId = null;
    if (state.activeView === "profile") {
      state.activeView = state.stageNodeId ? "stage" : "overview";
    }
    render();
    return;
  }

  if (node.node_type === "Company") {
    renderCompanyProfile(node);
    return;
  }
  if (node.node_type === "Facility") {
    renderFacilityProfile(node);
    return;
  }

  refs.profileKicker.textContent = "Node Profile";
  refs.profileTitle.textContent = node.display_name;
  refs.profileSummary.textContent = `${node.display_name} is included in the prototype as ${humanizeNodeType(node.node_type).toLowerCase()}.`;
  refs.profileMetrics.innerHTML = "";
  refs.profileImportance.innerHTML = `<div class="detail-card"><p class="detail-lede">A dedicated profile layout is currently implemented for companies and facilities first.</p></div>`;
  refs.profilePosition.innerHTML = "";
  refs.profileLinks.innerHTML = "";
  refs.profileTraceability.innerHTML = "";
}

function renderScenarios() {
  if (!state.bundle) {
    refs.scenarioTitle.textContent = "Scenario Analysis";
    refs.scenarioSummary.textContent =
      "Scenario mode should explain disruption in plain language, then show where to drill into the network.";
    refs.scenarioMetrics.innerHTML = "";
    refs.scenarioCardList.innerHTML = "";
    refs.scenarioFraming.innerHTML = "";
    refs.scenarioStageList.innerHTML = "";
    refs.scenarioCompanyList.innerHTML = "";
    refs.scenarioGeographyList.innerHTML = "";
    refs.scenarioFacilityList.innerHTML = "";
    refs.scenarioEvidence.innerHTML = "";
    refs.scenarioNextLinks.innerHTML = "";
    return;
  }

  const scenario = getActiveScenarioSpec() ?? scenarioSpecs[0];
  if (!scenario) {
    return;
  }
  state.activeScenarioKey = scenario.key;
  const model = buildScenarioModel(scenario);

  refs.scenarioTitle.textContent = scenario.title;
  refs.scenarioSummary.textContent = scenario.description;
  refs.scenarioMetrics.innerHTML = [
    ["Affected stages", model.affectedStages.length],
    ["Companies in focus", model.focusCompanies.length],
    ["Geographies in play", model.geographies.length],
    ["Linked facilities", model.facilities.length],
  ]
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");

  refs.scenarioCardList.innerHTML = scenarioSpecs
    .map((scenarioSpec) => {
      const node = findNode(scenarioSpec.networkMatch ?? { nodeType: "Segment", displayName: scenarioSpec.primaryStage });
      return `
        <button class="scenario-card scenario-select-card ${scenarioSpec.key === scenario.key ? "active" : ""}" type="button" data-scenario-key="${escapeHtml(scenarioSpec.key)}">
          <h3>${escapeHtml(scenarioSpec.title)}</h3>
          <p>${escapeHtml(scenarioSpec.description)}</p>
          <div class="scenario-meta">
            <span class="meta-pill">${escapeHtml(scenarioSpec.primaryStage)}</span>
            ${
              scenarioSpec.anchorCountry
                ? `<span class="meta-pill">${escapeHtml(scenarioSpec.anchorCountry)} anchor</span>`
                : `<span class="meta-pill">${escapeHtml(joinNatural(scenarioSpec.anchorRoles ?? []) || "Role lens")}</span>`
            }
            ${node ? `<span class="meta-pill">Ready to inspect</span>` : ""}
          </div>
        </button>
      `;
    })
    .join("");

  refs.scenarioCardList.querySelectorAll("button[data-scenario-key]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeScenarioKey = button.dataset.scenarioKey;
      state.activeView = "scenarios";
      render();
    });
  });

  refs.scenarioFraming.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(model.framing[0])}</p>
    </div>
    <div class="profile-bullet-list">
      ${model.framing
        .slice(1)
        .map((item) => `<article class="profile-bullet-card"><p>${escapeHtml(item)}</p></article>`)
        .join("")}
      ${model.blastRadius.map((item) => `<article class="profile-bullet-card"><p>${escapeHtml(item)}</p></article>`).join("")}
    </div>
  `;

  refs.scenarioStageList.innerHTML = model.affectedStages
    .map(
      ({ summary, relation, description }) => `
        <button class="stage-card stage-link-card" type="button" data-stage-link-node-id="${escapeHtml(summary.node.node_id)}">
          <h3>${escapeHtml(summary.name)}</h3>
          <p>${escapeHtml(description)}</p>
          <div class="stage-meta">
            <span class="meta-pill">${escapeHtml(relation)}</span>
            <span class="meta-pill">${escapeHtml(String(summary.companyCount))} companies</span>
          </div>
        </button>
      `
    )
    .join("");

  refs.scenarioStageList.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
  });

  refs.scenarioCompanyList.innerHTML = renderScenarioCompanyCards(model.focusCompanies, scenario);
  refs.scenarioCompanyList.querySelectorAll("button[data-company-profile-id]").forEach((button) => {
    button.addEventListener("click", () => openNodeProfile(button.dataset.companyProfileId));
  });

  refs.scenarioGeographyList.innerHTML = model.geographies
    .map(
      (country) => `
        <button class="geo-card stage-link-card" type="button" data-network-node-id="${escapeHtml(country.node.node_id)}">
          <h3>${escapeHtml(country.name)}</h3>
          <p>${escapeHtml(country.description)}</p>
          <div class="geo-meta">
            <span class="meta-pill">${escapeHtml(String(country.companyCount))} companies</span>
            <span class="meta-pill">${escapeHtml(String(country.facilityCount))} facilities</span>
          </div>
        </button>
      `
    )
    .join("");

  refs.scenarioGeographyList.querySelectorAll("button[data-network-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateNetworkFocus(button.dataset.networkNodeId));
  });

  refs.scenarioFacilityList.innerHTML = renderScenarioFacilityCards(model);
  refs.scenarioFacilityList.querySelectorAll("button[data-profile-node-id]").forEach((button) => {
    button.addEventListener("click", () => openNodeProfile(button.dataset.profileNodeId));
  });

  refs.scenarioEvidence.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(`${scenario.confidenceTitle}: ${scenario.confidenceNote}`)}</p>
    </div>
    ${renderFactGrid([
      ["Primary stage", scenario.primaryStage],
      ["Anchor geography", scenario.anchorCountry ? formatCountry(scenario.anchorCountry) : "Multi-country scenario"],
      ["Anchor roles", joinNatural(scenario.anchorRoles ?? []) || "Not mapped yet"],
      ["Snapshot footing", `${model.focusCompanies.length} companies and ${model.facilities.length} linked facilities in the current slice`],
    ])}
    ${renderPillSection("Snapshot sources", model.sourcePills)}
  `;

  refs.scenarioNextLinks.innerHTML = model.nextLinks.map(({ node, description, action }) => buildProfileLinkCard(node, description, action)).join("");
  wireScenarioButtons();
}

function getActiveScenarioSpec() {
  return scenarioSpecs.find((scenario) => scenario.key === state.activeScenarioKey) ?? scenarioSpecs[0] ?? null;
}

function buildScenarioModel(scenario) {
  const stageSummaries = getSegmentSummaries();
  const stageSummaryMap = new Map(stageSummaries.map((summary) => [summary.name, summary]));
  const primaryStageSummary = stageSummaryMap.get(scenario.primaryStage) ?? null;
  const anchorCountryNode = scenario.anchorCountry
    ? findNode({ nodeType: "Country", displayName: scenario.anchorCountry })
    : null;
  const primaryCompanies = primaryStageSummary?.companies ?? [];

  const focusCompanies = rankScenarioCompanies(primaryCompanies, scenario);
  const facilities = uniqueNodesById(
    focusCompanies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }))
  );

  const affectedStages = (scenario.stageNames ?? [])
    .map((stageName, index) => {
      const summary = stageSummaryMap.get(stageName);
      if (!summary) {
        return null;
      }
      return {
        summary,
        relation: describeScenarioStageRelation(stageName, scenario.primaryStage, index),
        description: describeScenarioStageExposure(stageName, scenario.primaryStage),
      };
    })
    .filter(Boolean);

  const geographies = buildScenarioGeographies({
    scenario,
    primaryStageSummary,
    focusCompanies,
    anchorCountryNode,
  });

  const sourcePills = uniqueStrings([
    sourceLabels.curated_seed,
    ...facilities.flatMap((facility) => inferFacilitySourcePills(facility)),
    ...(state.bundle?.source_keys ?? []).map((sourceKey) => sourceLabels[sourceKey] ?? sourceKey),
  ]);

  const nextLinks = [
    primaryStageSummary
      ? {
          node: primaryStageSummary.node,
          description: "Open the stage page that explains the main junction this scenario is centered on.",
          action: "stage",
        }
      : null,
    anchorCountryNode
      ? {
          node: anchorCountryNode,
          description: "Inspect the anchor geography in the network to see surrounding concentration.",
          action: "network",
        }
      : null,
    focusCompanies[0]
      ? {
          node: focusCompanies[0],
          description: "Open a representative company profile from the scenario pressure point.",
          action: "profile",
        }
      : null,
    facilities[0]
      ? {
          node: facilities[0],
          description: "Open one of the linked facilities to see where physical grounding already exists.",
          action: "profile",
        }
      : null,
  ].filter(Boolean);

  return {
    primaryStageSummary,
    focusCompanies,
    facilities,
    geographies,
    affectedStages,
    sourcePills,
    nextLinks,
    framing: scenario.framing ?? [],
    blastRadius: scenario.blastRadius ?? [],
  };
}

function rankScenarioCompanies(companies, scenario) {
  const requiredRoles = new Set(scenario.anchorRoles ?? []);
  const priorityMap = new Map((scenario.companyPriority ?? []).map((name, index) => [name, index]));

  const filtered = companies.filter((company) => {
    const roles = getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" }).map((role) => role.display_name);
    const country = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0]?.display_name ?? null;
    const countryMatches = !scenario.anchorCountry || country === scenario.anchorCountry;
    const roleMatches = !requiredRoles.size || roles.some((role) => requiredRoles.has(role));
    return countryMatches && roleMatches;
  });

  const fallback = filtered.length
    ? filtered
    : companies.filter((company) => {
        const roles = getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" }).map((role) => role.display_name);
        return !requiredRoles.size || roles.some((role) => requiredRoles.has(role));
      });

  return [...(fallback.length ? fallback : companies)]
    .sort((left, right) => {
      const leftPriority = priorityMap.has(left.display_name) ? priorityMap.get(left.display_name) : Number.POSITIVE_INFINITY;
      const rightPriority = priorityMap.has(right.display_name) ? priorityMap.get(right.display_name) : Number.POSITIVE_INFINITY;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      const leftCountry = getConnectedNodes(left.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0]?.display_name ?? "";
      const rightCountry = getConnectedNodes(right.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0]?.display_name ?? "";
      if (scenario.anchorCountry) {
        const leftAnchor = leftCountry === scenario.anchorCountry ? 0 : 1;
        const rightAnchor = rightCountry === scenario.anchorCountry ? 0 : 1;
        if (leftAnchor !== rightAnchor) {
          return leftAnchor - rightAnchor;
        }
      }
      return left.display_name.localeCompare(right.display_name);
    })
    .slice(0, 8);
}

function buildScenarioGeographies({ scenario, primaryStageSummary, focusCompanies, anchorCountryNode }) {
  const countryMap = new Map();

  for (const company of focusCompanies) {
    const countryNode = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
    if (!countryNode) {
      continue;
    }
    const key = countryNode.display_name;
    const existing = countryMap.get(key) ?? {
      node: countryNode,
      name: countryNode.display_name,
      companyCount: 0,
      facilityCount: 0,
      description: "",
    };
    existing.companyCount += 1;
    existing.facilityCount += getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }).length;
    countryMap.set(key, existing);
  }

  if (primaryStageSummary) {
    for (const countrySummary of getStageCountrySummaries(primaryStageSummary).slice(0, 6)) {
      const countryNode = findNode({ nodeType: "Country", displayName: countrySummary.name });
      if (!countryNode || countryMap.has(countrySummary.name)) {
        continue;
      }
      countryMap.set(countrySummary.name, {
        node: countryNode,
        name: countrySummary.name,
        companyCount: countrySummary.companyCount,
        facilityCount: countrySummary.facilityCount,
        description: "",
      });
    }
  }

  const geographies = [...countryMap.values()]
    .sort((left, right) => {
      if (scenario.anchorCountry) {
        const leftAnchor = left.name === scenario.anchorCountry ? 0 : 1;
        const rightAnchor = right.name === scenario.anchorCountry ? 0 : 1;
        if (leftAnchor !== rightAnchor) {
          return leftAnchor - rightAnchor;
        }
      }
      return right.companyCount - left.companyCount || left.name.localeCompare(right.name);
    })
    .slice(0, 6);

  for (const geography of geographies) {
    geography.description =
      geography.name === scenario.anchorCountry
        ? "Anchor geography in this scenario. This is the first place to inspect concentration."
        : `${geography.companyCount} representative companies from this scenario slice are anchored here.`;
  }

  if (anchorCountryNode && !geographies.some((geography) => geography.name === anchorCountryNode.display_name)) {
    geographies.unshift({
      node: anchorCountryNode,
      name: anchorCountryNode.display_name,
      companyCount: 0,
      facilityCount: 0,
      description: "Anchor geography in this scenario. Current representative company coverage is thinner here than the product framing suggests.",
    });
  }

  return geographies.slice(0, 6);
}

function describeScenarioStageRelation(stageName, primaryStageName, index) {
  if (stageName === primaryStageName) {
    return "Primary junction";
  }
  if (index === 0) {
    return "Upstream driver";
  }
  const primaryIndex = (scenarioSpecs.find((scenario) => scenario.primaryStage === primaryStageName)?.stageNames ?? []).indexOf(primaryStageName);
  return index < primaryIndex ? "Upstream exposure" : "Downstream exposure";
}

function describeScenarioStageExposure(stageName, primaryStageName) {
  if (stageName === primaryStageName) {
    return "This is the stage where the disruption is centered in the current walkthrough.";
  }
  const spec = stageExplorerSpecs[primaryStageName];
  if (spec?.dependsOn?.includes(stageName)) {
    return "This stage feeds the disrupted junction and helps explain where upstream dependence is coming from.";
  }
  if (spec?.enables?.includes(stageName)) {
    return "This stage sits downstream and helps illustrate where operational effects would likely surface next.";
  }
  return stageDescriptions[stageName] ?? "This stage is part of the scenario path in the current walkthrough.";
}

function renderScenarioCompanyCards(companies, scenario) {
  if (!companies.length) {
    return `<div class="detail-card"><p class="detail-lede">No representative companies are mapped for this scenario slice yet.</p></div>`;
  }

  return companies
    .map((company) => {
      const country = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
      const roles = getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })
        .map((role) => role.display_name)
        .slice(0, 3);
      const segment = getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })[0];
      return `
        <article class="company-spotlight-card">
          <h3>${escapeHtml(company.display_name)}</h3>
          <p>${escapeHtml(describeScenarioCompany(company, scenario, segment?.display_name, roles))}</p>
          <div class="stage-meta">
            ${country ? `<span class="meta-pill">${escapeHtml(country.display_name)}</span>` : ""}
            ${roles.map((role) => `<span class="meta-pill">${escapeHtml(role)}</span>`).join("")}
          </div>
          <div class="overview-actions">
            <button class="ghost-button" type="button" data-company-profile-id="${escapeHtml(company.node_id)}">Open profile</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function describeScenarioCompany(company, scenario, segmentName, roles) {
  const roleText = roles.length ? joinNatural(roles) : "its mapped role";
  if (scenario.key === "taiwan-foundry") {
    return `${company.display_name} appears here as ${roleText} inside the front-end manufacturing junction, making it part of the Taiwan-centered fabrication concentration this scenario is inspecting.`;
  }
  if (scenario.key === "specialty-gas") {
    return `${company.display_name} appears here as ${roleText} in the materials layer, illustrating how an upstream input supplier can become a chokepoint before wafers are even patterned.`;
  }
  if (scenario.key === "osat-bottleneck") {
    return `${company.display_name} appears here as ${roleText} in back-end manufacturing, where packaging and test capacity determines whether finished wafers become usable chip output.`;
  }
  return `${company.display_name} appears here through ${roleText}${segmentName ? ` in ${segmentName}` : ""}.`;
}

function renderScenarioFacilityCards(model) {
  if (!model.facilities.length) {
    return `
      <div class="detail-card">
        <p class="detail-lede">Facility grounding is still sparse for this scenario.</p>
      </div>
      <div class="profile-bullet-list">
        <article class="profile-bullet-card">
          <p>This walkthrough is currently stronger on stage, role, and geography concentration than on site-level coverage.</p>
        </article>
        <article class="profile-bullet-card">
          <p>No directly linked facilities are modeled for the representative companies currently in focus.</p>
        </article>
      </div>
    `;
  }

  return model.facilities
    .map((facility) => {
      const operator = getConnectedNodes(facility.node_id, { nodeType: "Company", edgeType: "OPERATES_FACILITY" })[0];
      const country = getConnectedNodes(facility.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
      return `
        <button class="company-spotlight-card stage-link-card" type="button" data-profile-node-id="${escapeHtml(facility.node_id)}">
          <h3>${escapeHtml(facility.display_name)}</h3>
          <p>${escapeHtml(
            `${facility.display_name} is one of the few linked facilities already grounded in this prototype${operator ? ` and is associated with ${operator.display_name}` : ""}.`
          )}</p>
          <div class="stage-meta">
            ${country ? `<span class="meta-pill">${escapeHtml(country.display_name)}</span>` : ""}
            <span class="meta-pill">${escapeHtml(humanizeFacilityTypeCode(facility.properties.facility_type_code))}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function wireScenarioButtons() {
  refs.scenarioNextLinks.querySelectorAll("button[data-profile-node-id]").forEach((button) => {
    button.addEventListener("click", () => openNodeProfile(button.dataset.profileNodeId));
  });
  refs.scenarioNextLinks.querySelectorAll("button[data-network-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateNetworkFocus(button.dataset.networkNodeId));
  });
  refs.scenarioNextLinks.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
  });
}

function renderStatus() {
  if (!state.bundle) {
    refs.statusText.textContent = "Open a snapshot or use the built-in example.";
    refs.emptyState.classList.remove("hidden");
    return;
  }

  const graphView = buildGraphView();
  const originText =
    state.bundleOrigin === "uploaded"
      ? "Loaded snapshot"
      : state.bundle.summary.company_count > 80
        ? "Built-in universe"
        : "Built-in demo";
  const rawCompanyCount = graphView.rawSummary?.companyCount ?? graphView.summary.companyCount;
  const groupedCompanyCount = graphView.summary.typeCounts.get("CompanyCluster") ?? 0;

  if (state.filter) {
    refs.statusText.textContent = `${originText}: search view with ${graphView.summary.companyCount} compan${
      graphView.summary.companyCount === 1 ? "y" : "ies"
    } visible.`;
  } else if (graphView.detail?.level === "grouped") {
    refs.statusText.textContent = `${originText}: ${rawCompanyCount} companies condensed into ${groupedCompanyCount} group${
      groupedCompanyCount === 1 ? "" : "s"
    }. Zoom in for detail.`;
  } else if (graphView.focusNode) {
    refs.statusText.textContent = `${originText}: ${graphView.focusNode.display_name} in focus with ${
      graphView.summary.companyCount
    } compan${graphView.summary.companyCount === 1 ? "y" : "ies"} in view.`;
  } else if (state.bundle.summary.company_count > 80) {
    refs.statusText.textContent = `${originText}: ${state.bundle.summary.company_count} companies in view. Start with a lens, then zoom into one slice.`;
  } else {
    refs.statusText.textContent = `${originText}: ${state.bundle.summary.company_count} companies across ${state.bundle.summary.segment_count} stages. Click any item for a plain-language explanation.`;
  }

  refs.emptyState.classList.add("hidden");
}

function renderSummary() {
  if (!state.bundle) {
    refs.metricsGrid.innerHTML = "";
    return;
  }

  const metrics = [
    ["Companies", state.bundle.summary.company_count],
    ...(state.bundle.summary.facility_count ? [["Critical Facilities", state.bundle.summary.facility_count]] : []),
    ["Supply Chain Stages", state.bundle.summary.segment_count],
    ["Specialized Roles", state.bundle.summary.role_count],
    ["Countries", state.bundle.summary.country_count],
    ["Evidence-Backed Facts", state.bundle.summary.claim_count],
  ];

  refs.metricsGrid.innerHTML = metrics
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");
}

function renderGuidedViews() {
  if (!state.bundle) {
    refs.guideList.innerHTML = "";
    return;
  }

  const availableViews = guidedViewSpecs
    .map((spec) => ({ spec, node: findNode(spec.match) }))
    .filter((item) => item.node);

  refs.guideList.innerHTML = availableViews
    .map(
      ({ spec, node }) => `
        <button class="guide-button ${state.focusNodeId === node.node_id ? "active" : ""}" type="button" data-node-id="${escapeHtml(node.node_id)}">
          <strong>${escapeHtml(spec.label)}</strong>
          <span>${escapeHtml(spec.description)}</span>
        </button>
      `
    )
    .join("");

  refs.guideList.querySelectorAll("button[data-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEdgeId = null;
      state.focusNodeId = button.dataset.nodeId;
      state.selectedNodeId = button.dataset.nodeId;
      state.filter = "";
      refs.nodeSearch.value = "";
      render();
    });
  });
}

function renderFocusBar() {
  if (!state.bundle) {
    refs.focusBar.innerHTML = "";
    return;
  }

  const segmentNodes = state.bundle.nodes
    .filter((node) => node.node_type === "Segment")
    .sort((left, right) => {
      const leftCount = getConnectedNodes(left.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" }).length;
      const rightCount = getConnectedNodes(right.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" }).length;
      return rightCount - leftCount || left.display_name.localeCompare(right.display_name);
    });

  refs.focusBar.innerHTML = [
    `<button class="focus-chip ${state.focusNodeId === null && !state.filter ? "active" : ""}" type="button" data-focus-mode="overview">Overview</button>`,
    ...segmentNodes.map((node) => {
      const companyCount = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" }).length;
      return `
        <button class="focus-chip ${state.focusNodeId === node.node_id ? "active" : ""}" type="button" data-node-id="${escapeHtml(node.node_id)}">
          ${escapeHtml(node.display_name)} (${escapeHtml(String(companyCount))})
        </button>
      `;
    }),
  ].join("");

  refs.focusBar.querySelectorAll("button[data-focus-mode='overview']").forEach((button) => {
    button.addEventListener("click", () => {
      state.focusNodeId = null;
      state.selectedNodeId = null;
      state.selectedEdgeId = null;
      state.filter = "";
      state.graphSignature = null;
      refs.nodeSearch.value = "";
      render();
    });
  });

  refs.focusBar.querySelectorAll("button[data-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.focusNodeId = button.dataset.nodeId;
      state.selectedNodeId = button.dataset.nodeId;
      state.selectedEdgeId = null;
      state.filter = "";
      state.graphSignature = null;
      refs.nodeSearch.value = "";
      render();
    });
  });
}

function renderNavigation() {
  const hasBundle = Boolean(state.bundle);
  refs.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
  refs.zoomOutButton.disabled = !hasBundle || state.zoom <= zoomLimits.min + 0.01;
  refs.zoomInButton.disabled = !hasBundle || state.zoom >= zoomLimits.max - 0.01;
  refs.fitButton.disabled = !hasBundle;
  refs.centerButton.disabled = !hasBundle || !(state.selectedNodeId || state.focusNodeId);
}

function renderSources() {
  if (!state.bundle) {
    refs.sourceList.innerHTML = "";
    return;
  }

  refs.sourceList.innerHTML = state.bundle.source_keys
    .map((sourceKey) => `<span class="chip">${escapeHtml(humanizeSource(sourceKey))}</span>`)
    .join("");
}

function renderLegend() {
  if (!state.bundle) {
    refs.legendList.innerHTML = "";
    return;
  }

  const graphView = buildGraphView();
  const typeCounts = new Map();
  for (const node of state.bundle.nodes) {
    typeCounts.set(node.node_type, (typeCounts.get(node.node_type) ?? 0) + 1);
  }
  if (graphView.detail?.level === "grouped") {
    for (const [nodeType, count] of graphView.summary.typeCounts.entries()) {
      if (nodeType === "CompanyCluster" || nodeType === "FacilityCluster") {
        typeCounts.set(nodeType, count);
      }
    }
  }

  const orderedTypes = ["Segment", "Role", "Company", "CompanyCluster", "Country", "Facility", "FacilityCluster", "MaterialOrItemCategory", "PolicyEntity"];

  refs.legendList.innerHTML = orderedTypes
    .filter((nodeType) => typeCounts.has(nodeType))
    .map(
      (nodeType) => `
        <span class="legend-chip">
          <span class="legend-dot" style="background:${escapeHtml(nodeTypeColors[nodeType] ?? "#666")}"></span>
          ${escapeHtml(humanizeNodeType(nodeType))} (${escapeHtml(String(typeCounts.get(nodeType)))})
        </span>
      `
    )
    .join("");
}

function renderCountries() {
  if (!state.bundle) {
    refs.countryList.innerHTML = "";
    return;
  }

  refs.countryList.innerHTML = state.bundle.countries
    .map(
      (country) => `
        <article class="country-item">
          <strong>${escapeHtml(formatCountry(country.country_code))}</strong>
          <span>${escapeHtml(describeCountryFootprint(country))}</span>
        </article>
      `
    )
    .join("");
}

function renderConvergenceMap() {
  const segmentSummaries = getSegmentSummaries();
  const orderedSegmentSummaries = orderSegmentSummaries(segmentSummaries);
  const summaryByName = new Map(segmentSummaries.map((item) => [item.name, item]));
  const upstreamNames = [
    "Design and Software",
    "Manufacturing Equipment",
    "Materials",
    "Wafers and Substrates",
    "Masks and Reticles",
  ];
  const junctionNames = ["Front-end Manufacturing", "Back-end Manufacturing"];
  const upstreamCards = upstreamNames
    .map((name) => summaryByName.get(name))
    .filter(Boolean);
  const junctionCards = junctionNames
    .map((name) => summaryByName.get(name))
    .filter(Boolean);
  const outputs = getOutputSummaries();
  const totalCompanies = orderedSegmentSummaries.reduce((count, summary) => count + summary.companyCount, 0);
  const totalFacilities = orderedSegmentSummaries.reduce((count, summary) => count + summary.facilityCount, 0);

  refs.convergenceMap.innerHTML = `
    <div class="convergence-overview-strip">
      <span class="meta-pill">${escapeHtml(String(upstreamCards.length))} upstream streams</span>
      <span class="meta-pill">${escapeHtml(String(junctionCards.length))} manufacturing junctions</span>
      <span class="meta-pill">${escapeHtml(String(outputs.length))} output clusters</span>
      <span class="meta-pill">${escapeHtml(String(totalCompanies))} total stage placements</span>
      <span class="meta-pill">${escapeHtml(String(totalFacilities))} linked facilities</span>
    </div>
    <div class="convergence-landscape">
      <section class="convergence-column">
        <div class="convergence-column-header">
          <span class="panel-kicker">Parallel Inputs</span>
          <h3>Independent streams advance at the same time</h3>
        </div>
        <p class="convergence-column-intro">
          These capabilities do not wait in line behind one another. They develop in parallel and only become fragile once
          fabrication or packaging requires them to arrive together.
        </p>
        <div class="stream-stack">
          ${upstreamCards
            .map(
              (summary) => `
                <button class="convergence-node stream-card" type="button" data-convergence-node-id="${escapeHtml(summary.node.node_id)}">
                  <h4>${escapeHtml(summary.name)}</h4>
                  <p>${escapeHtml(stageDescriptions[summary.name] ?? "This stream feeds later manufacturing steps.")}</p>
                  <div class="stage-meta">
                    <span class="meta-pill">${escapeHtml(String(summary.companyCount))} companies</span>
                    <span class="meta-pill">${escapeHtml(String(summary.countryCount))} countries</span>
                  </div>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <div class="convergence-flow" aria-hidden="true">
        <span class="flow-label">All of these inputs have to show up together before fabrication can start.</span>
        <span class="flow-arrow"></span>
      </div>
      <section class="convergence-column convergence-junction-column">
        <div class="convergence-column-header">
          <span class="panel-kicker">Merge Points</span>
          <h3>Critical junctions turn parallel inputs into chips</h3>
        </div>
        <p class="convergence-column-intro">
          This is where upstream concentration becomes operational concentration. A missing dependency at these junctions can
          block the whole flow.
        </p>
        <div class="junction-stack">
          ${junctionCards
            .map(
              (summary, index) => `
                <button class="convergence-node junction-card" type="button" data-convergence-node-id="${escapeHtml(summary.node.node_id)}">
                  <span class="junction-step">Junction ${escapeHtml(String(index + 1))}</span>
                  <h4>${escapeHtml(summary.name)}</h4>
                  <p>${escapeHtml(convergenceStepDescriptions[summary.name] ?? stageDescriptions[summary.name] ?? "This is a critical manufacturing step.")}</p>
                  <div class="stage-meta">
                    <span class="meta-pill">${escapeHtml(String(summary.companyCount))} companies</span>
                    <span class="meta-pill">${escapeHtml(String(summary.roleCount))} roles</span>
                    <span class="meta-pill">${escapeHtml(String(summary.facilityCount))} facilities</span>
                  </div>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <div class="convergence-flow" aria-hidden="true">
        <span class="flow-label">Once those junctions hold, chip output and downstream exposure become possible.</span>
        <span class="flow-arrow"></span>
      </div>
      <section class="convergence-column convergence-output-column">
        <div class="convergence-column-header">
          <span class="panel-kicker">Outputs</span>
          <h3>Finished chip clusters emerge after both junctions succeed</h3>
        </div>
        <p class="convergence-column-intro">
          This output view stays intentionally coarse in the prototype. The point is to show that end products only appear
          after the manufacturing junctions have cleared.
        </p>
        <div class="output-stack">
          ${outputs
            .map(
              (output) => `
                <article class="output-card">
                  <h4>${escapeHtml(output.label)}</h4>
                  <p>${escapeHtml(String(output.companyCount))} mapped companies in this snapshot carry this chip focus.</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  refs.convergenceMap.querySelectorAll("button[data-convergence-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.convergenceNodeId));
  });
}

function renderOverviewGuides() {
  if (!state.bundle) {
    refs.overviewGuides.innerHTML = "";
    return;
  }

  const guides = [
    ...guidedViewSpecs,
    {
      label: "Open the full network",
      description: "Use the graph once you already know which local neighborhood or path you want to inspect.",
      match: null,
      action: "network",
    },
  ];

  refs.overviewGuides.innerHTML = guides
    .map((guide) => {
      const node = guide.match ? findNode(guide.match) : null;
      return `
        <button
          class="guide-button"
          type="button"
          data-overview-guide="${escapeHtml(guide.action ?? "focus")}"
          data-node-id="${escapeHtml(node?.node_id ?? "")}"
        >
          <strong>${escapeHtml(guide.label)}</strong>
          <span>${escapeHtml(guide.description)}</span>
        </button>
      `;
    })
    .join("");

  refs.overviewGuides.querySelectorAll("button[data-overview-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.overviewGuide === "network" || !button.dataset.nodeId) {
        switchProductView("network");
        return;
      }
      activateStageExplorer(button.dataset.nodeId);
    });
  });
}

function renderOverviewStageGrid() {
  const segmentSummaries = orderSegmentSummaries(getSegmentSummaries());
  refs.overviewStageGrid.innerHTML = segmentSummaries
    .map(
      (summary) => `
        <article class="stage-card">
          <h3>${escapeHtml(summary.name)}</h3>
          <p>${escapeHtml(stageDescriptions[summary.name] ?? "This stage is part of the semiconductor supply chain in this snapshot.")}</p>
          <div class="stage-meta">
            <span class="meta-pill">${escapeHtml(String(summary.companyCount))} companies</span>
            <span class="meta-pill">${escapeHtml(String(summary.roleCount))} roles</span>
            <span class="meta-pill">${escapeHtml(String(summary.countryCount))} countries</span>
          </div>
          <div class="overview-actions">
            <button class="ghost-button" type="button" data-stage-node-id="${escapeHtml(summary.node.node_id)}">Open stage page</button>
          </div>
        </article>
      `
    )
    .join("");

  refs.overviewStageGrid.querySelectorAll("button[data-stage-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageNodeId));
  });
}

function renderOverviewWatchlist() {
  const segmentSummaries = getSegmentSummaries();
  const roleSummaries = getRoleSummaries();
  const countries = [...(state.bundle?.countries ?? [])].sort((left, right) => {
    return right.company_count - left.company_count || left.country_code.localeCompare(right.country_code);
  });

  const broadestStage = segmentSummaries[0];
  const tightestRole = [...roleSummaries]
    .filter((item) => item.companyCount > 0)
    .sort((left, right) => left.companyCount - right.companyCount || left.name.localeCompare(right.name))[0];
  const topCountry = countries[0];
  const facilitySensitiveStage = [...segmentSummaries].sort((left, right) => {
    return right.facilityCount - left.facilityCount || right.companyCount - left.companyCount;
  })[0];

  const watchItems = [
    broadestStage
      ? {
          title: "Dense enabling stage",
          body: `${broadestStage.name} currently spans ${broadestStage.companyCount} companies in this snapshot, which makes it a useful entry point for understanding system breadth.`,
          meta: [`${broadestStage.companyCount} companies`, `${broadestStage.countryCount} countries`],
          nodeId: broadestStage.node.node_id,
        }
      : null,
    tightestRole
      ? {
          title: "Tighter specialist role",
          body: `${tightestRole.name} is linked to ${tightestRole.companyCount} companies here, which can make specialist roles easier to inspect for concentration.`,
          meta: [`${tightestRole.companyCount} companies`, `${tightestRole.segmentNames.length} stages`],
          nodeId: tightestRole.node.node_id,
        }
      : null,
    topCountry
      ? {
          title: "Geographic weight",
          body: `${formatCountry(topCountry.country_code)} anchors ${topCountry.company_count} companies in this snapshot, making it one of the fastest ways to see regional concentration.`,
          meta: [`${topCountry.company_count} companies`, `${topCountry.facility_count ?? 0} facilities`],
          nodeId: findNode({ nodeType: "Country", displayName: formatCountry(topCountry.country_code) })?.node_id ?? "",
        }
      : null,
    facilitySensitiveStage
      ? {
          title: "Facility-sensitive junction",
          body: `${facilitySensitiveStage.name} currently carries ${facilitySensitiveStage.facilityCount} linked facilities in the prototype, which makes it a good place to inspect physical chokepoints.`,
          meta: [`${facilitySensitiveStage.facilityCount} facilities`, `${facilitySensitiveStage.companyCount} companies`],
          nodeId: facilitySensitiveStage.node.node_id,
        }
      : null,
  ].filter(Boolean);

  refs.overviewWatchlist.innerHTML = watchItems
    .map(
      (item) => `
        <article class="watch-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
          <div class="watch-meta">
            ${item.meta.map((meta) => `<span class="meta-pill">${escapeHtml(meta)}</span>`).join("")}
          </div>
          <div class="overview-actions">
            <button class="ghost-button" type="button" data-watch-node-id="${escapeHtml(item.nodeId)}">Inspect in network</button>
          </div>
        </article>
      `
    )
    .join("");

  refs.overviewWatchlist.querySelectorAll("button[data-watch-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.watchNodeId) {
        activateNetworkFocus(button.dataset.watchNodeId);
      } else {
        switchProductView("network");
      }
    });
  });
}

function renderOverviewGeography() {
  const topCountries = [...(state.bundle?.countries ?? [])]
    .sort((left, right) => right.company_count - left.company_count || left.country_code.localeCompare(right.country_code))
    .slice(0, 4);

  refs.overviewGeography.innerHTML = topCountries
    .map((country) => {
      const countryName = formatCountry(country.country_code);
      const nodeId = findNode({ nodeType: "Country", displayName: countryName })?.node_id ?? "";
      return `
        <article class="geo-card">
          <h3>${escapeHtml(countryName)}</h3>
          <p>${escapeHtml(describeCountryFootprint(country))}</p>
          <div class="geo-meta">
            <span class="meta-pill">${escapeHtml(String(country.company_count))} companies</span>
            <span class="meta-pill">${escapeHtml(String(country.facility_count ?? 0))} facilities</span>
          </div>
          <div class="overview-actions">
            <button class="ghost-button" type="button" data-country-node-id="${escapeHtml(nodeId)}">Open geography slice</button>
          </div>
        </article>
      `;
    })
    .join("");

  refs.overviewGeography.querySelectorAll("button[data-country-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.countryNodeId) {
        activateNetworkFocus(button.dataset.countryNodeId);
      } else {
        switchProductView("network");
      }
    });
  });
}

function renderGraph() {
  refs.graphCanvas.innerHTML = "";

  if (!state.bundle) {
    state.graphMetrics = null;
    renderNavigation();
    return;
  }

  const graphView = buildGraphView();
  const { nodes, edges, nodeLookup } = graphView;

  if (state.selectedNodeId && !nodeLookup.has(state.selectedNodeId)) {
    state.selectedNodeId = graphView.focusNode?.node_id ?? null;
  }
  if (state.selectedEdgeId && !edges.some((edge) => edge.edge_id === state.selectedEdgeId)) {
    state.selectedEdgeId = null;
  }

  const rect = refs.graphScroll.getBoundingClientRect();
  const width = graphView.isOverview
    ? Math.max(Math.round(rect.width * 1.18), 1620)
    : Math.max(Math.round(rect.width * 1.1), 1360);
  const height = preferredGraphHeight(graphView);
  applyGraphCanvasSize(width, height, state.zoom);
  refs.graphCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const layout = buildLayout(nodes, width, height);
  renderLaneGuides(width, height, graphView);

  for (const edge of edges) {
    const source = layout.get(edge.source_node_id);
    const target = layout.get(edge.target_node_id);
    if (!source || !target) {
      continue;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", edgeClasses(edge));
    path.setAttribute("d", curvePath(source, target));
    path.dataset.edgeId = edge.edge_id;
    path.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedNodeId = null;
      state.selectedEdgeId = edge.edge_id;
      renderInspector();
      renderGraph();
    });
    refs.graphCanvas.appendChild(path);
  }

  for (const node of nodes) {
    const position = layout.get(node.node_id);
    if (!position) {
      continue;
    }

    const radius = radiusForNode(node);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", nodeClasses(node, edges));
    group.setAttribute("transform", `translate(${position.x}, ${position.y})`);
    group.dataset.nodeId = node.node_id;
    group.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedEdgeId = null;
      if (node.node_type !== "CompanyCluster" && node.node_type !== "FacilityCluster") {
        state.focusNodeId = node.node_id;
      }
      state.selectedNodeId = node.node_id;
      if (node.node_type === "Company" || node.node_type === "Facility") {
        state.profileNodeId = node.node_id;
      }
      if (node.node_type === "Segment") {
        state.stageNodeId = node.node_id;
      }
      renderInspector();
      renderGraph();
      renderStatus();
      renderGuidedViews();
      renderFocusBar();
    });
    group.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (node.node_type === "Company" || node.node_type === "Facility") {
        openNodeProfile(node.node_id);
      } else if (node.node_type === "CompanyCluster" || node.node_type === "FacilityCluster") {
        revealSemanticCluster(node.node_id);
      }
    });

    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("class", "node-halo");
    halo.setAttribute("r", String(radius + 12));
    group.appendChild(halo);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "node-core");
    circle.setAttribute("r", String(radius));
    circle.setAttribute("fill", nodeTypeColors[node.node_type] ?? "#666");
    group.appendChild(circle);

    if (shouldShowNodeLabel(node, graphView)) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(radius + 12));
      text.setAttribute("y", "4");
      text.textContent = node.display_name;
      group.appendChild(text);
    }

    refs.graphCanvas.appendChild(group);
  }

  const signature = buildGraphViewSignature(graphView, width, height);
  const bounds = computeGraphBounds(nodes, layout, graphView, width, height);
  const signatureChanged = signature !== state.graphSignature;
  state.graphSignature = signature;
  state.graphMetrics = { width, height, layout, bounds, graphView };
  renderNavigation();

  if (state.pendingGraphAnchor) {
    const { anchorGraphX, anchorGraphY, anchorClientX, anchorClientY } = state.pendingGraphAnchor;
    state.pendingGraphAnchor = null;
    requestAnimationFrame(() => {
      refs.graphScroll.scrollLeft = anchorGraphX * state.zoom - (anchorClientX - rect.left);
      refs.graphScroll.scrollTop = anchorGraphY * state.zoom - (anchorClientY - rect.top);
      clampGraphScroll(width, height, state.zoom);
      renderNavigation();
    });
  } else if (signatureChanged) {
    requestAnimationFrame(() => {
      fitGraphToBounds(bounds, {
        width,
        height,
        behavior: "smooth",
        minZoom: autoFitMinZoom(graphView),
      });
    });
  } else {
    requestAnimationFrame(() => {
      clampGraphScroll(width, height, state.zoom);
      renderNavigation();
    });
  }
}

function renderLaneGuides(width, height, graphView) {
  const hasFacilities = (graphView.summary.typeCounts.get("Facility") ?? 0) + (graphView.summary.typeCounts.get("FacilityCluster") ?? 0) > 0;
  const hasCompanyClusters = (graphView.summary.typeCounts.get("CompanyCluster") ?? 0) > 0;
  const hasFacilityClusters = (graphView.summary.typeCounts.get("FacilityCluster") ?? 0) > 0;
  const lanes = [
    { label: "Supply Chain Stage", x: width * 0.05, laneWidth: width * 0.16 },
    { label: "Specialized Role", x: width * 0.24, laneWidth: width * 0.16 },
    {
      label: hasCompanyClusters ? "Companies / Groups" : "Company",
      x: width * 0.45,
      laneWidth: width * 0.24,
    },
    ...(hasFacilities ? [{ label: hasFacilityClusters ? "Facilities / Groups" : "Facility", x: width * 0.65, laneWidth: width * 0.11 }] : []),
    { label: "Country", x: width * 0.8, laneWidth: width * 0.13 },
  ];

  for (const lane of lanes) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "lane-band");
    rect.setAttribute("x", String(lane.x));
    rect.setAttribute("y", "18");
    rect.setAttribute("width", String(lane.laneWidth));
    rect.setAttribute("height", String(height - 36));
    rect.setAttribute("rx", "24");
    refs.graphCanvas.appendChild(rect);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "lane-label");
    label.setAttribute("x", String(lane.x + lane.laneWidth / 2));
    label.setAttribute("y", "48");
    label.setAttribute("text-anchor", "middle");
    label.textContent = lane.label;
    refs.graphCanvas.appendChild(label);
  }
}

function renderInspector() {
  if (!state.bundle) {
    refs.selectionTitle.textContent = "How to use this map";
    refs.selectionMeta.textContent = "";
    refs.selectionBody.innerHTML = "<p>The built-in example will appear automatically when a snapshot is available.</p>";
    return;
  }

  if (state.selectedNodeId) {
    const node = getActiveGraphNodeById(state.selectedNodeId);
    if (node) {
      renderNodeInspector(node);
      return;
    }
  }

  if (state.selectedEdgeId) {
    const edge = state.bundle.edges.find((item) => item.edge_id === state.selectedEdgeId);
    if (edge) {
      renderEdgeInspector(edge);
      return;
    }
    const syntheticEdge = state.graphMetrics?.graphView?.edges.find((item) => item.edge_id === state.selectedEdgeId);
    if (syntheticEdge) {
      renderEdgeInspector(syntheticEdge);
      return;
    }
  }

  renderOverviewInspector();
}

function renderOverviewInspector() {
  const segmentLabels = (state.bundle?.nodes ?? [])
    .filter((node) => node.node_type === "Segment")
    .map((node) => node.display_name)
    .sort((left, right) => left.localeCompare(right));

  refs.selectionTitle.textContent = "How to use this map";
  refs.selectionMeta.textContent =
    (state.bundle?.summary.company_count ?? 0) >= 100 ? "Built-in universe overview" : "Built-in demo overview";
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">
        ${escapeHtml(describeOverviewLead())}
      </p>
    </div>
    ${renderFactGrid([
      ["Read left to right", "Stage -> role -> company -> country"],
      ["Best first click", "Use a lens above the graph or one of the guided views on the left"],
      ["Move around", "Drag or two-finger scroll to pan. Pinch or double-click to zoom where you are looking"],
      ["How this stays readable", "Broad views can collapse dense company layers into grouped nodes so you see the pattern before the full detail"],
    ])}
    <div class="detail-section">
      <h3>Included in this snapshot</h3>
      <div class="detail-pills">
        ${segmentLabels
          .map((item) => `<span class="detail-pill">${escapeHtml(item)}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function renderNodeInspector(node) {
  switch (node.node_type) {
    case "Company":
      renderCompanyInspector(node);
      return;
    case "CompanyCluster":
      renderCompanyClusterInspector(node);
      return;
    case "Role":
      renderRoleInspector(node);
      return;
    case "Segment":
      renderSegmentInspector(node);
      return;
    case "Country":
      renderCountryInspector(node);
      return;
    case "Facility":
      renderFacilityInspector(node);
      return;
    case "FacilityCluster":
      renderFacilityClusterInspector(node);
      return;
    default:
      renderGenericNodeInspector(node);
  }
}

function renderCompanyInspector(node) {
  const roles = getConnectedNodes(node.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" });
  const segments = getConnectedNodes(node.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" });
  const countries = getConnectedNodes(node.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" });
  const facilities = getConnectedNodes(node.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" });
  const chipFocus = uniqueStrings((node.properties.chip_codes ?? []).map((code) => humanizeChipCode(code)));
  const roleText = joinNatural(roles.map((item) => item.display_name));
  const segmentText = joinNatural(segments.map((item) => item.display_name));
  const countryText = joinNatural(countries.map((item) => item.display_name));
  const rolePhrase = roleText ? `${articleFor(roleText)} ${roleText}` : "a company";
  const lead = `${node.display_name} is shown here as ${rolePhrase}${
    segmentText ? ` in the ${segmentText} part of the chain` : ""
  }${countryText ? `, anchored in ${countryText}` : ""}.`;

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = "Preview";
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Primary role", roleText || "Not mapped yet"],
      ["Supply chain stage", segmentText || "Not mapped yet"],
      ["Headquarters", countryText || "Not mapped yet"],
      ["Linked facilities", String(facilities.length)],
    ])}
    ${chipFocus.length ? renderPillSection("Chip focus", chipFocus) : ""}
    <div class="detail-section">
      <h3>Best next step</h3>
      <div class="overview-actions">
        <button class="solid-button" type="button" data-profile-node-id="${escapeHtml(node.node_id)}">Open company profile</button>
      </div>
    </div>
  `;
  wireSelectionButtons();
}

function renderRoleInspector(node) {
  const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "HAS_ROLE" });
  const segments = getConnectedNodes(node.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" });
  const countries = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" }))
  );
  const graphView = state.graphMetrics?.graphView ?? buildGraphView();
  const description = node.properties.description ?? `${node.display_name} is a specialized role in the semiconductor chain.`;
  const lead = `${description} ${
    companies.length ? `${companies.length} compan${companies.length === 1 ? "y" : "ies"} in this map are linked to it.` : ""
  }`;

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = humanizeNodeType(node.node_type);
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Companies linked here", String(companies.length)],
      ["Related stage", segments.length ? joinNatural(segments.map((item) => item.display_name)) : "Not mapped yet"],
      ...(graphView.detail?.level === "grouped" ? [["Current reading mode", "Broad network view keeps companies grouped until you zoom in"]] : []),
    ])}
    ${graphView.detail?.level === "grouped" ? renderConnectionSection("Countries visible in this role", countries) : renderConnectionSection("Companies with this role", companies)}
    ${renderConnectionSection("Related supply chain stage", segments)}
  `;
  wireSelectionButtons();
}

function renderSegmentInspector(node) {
  const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" });
  const roles = getConnectedNodes(node.node_id, { nodeType: "Role", edgeType: "IN_SEGMENT" });
  const countries = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" }))
  );
  const graphView = state.graphMetrics?.graphView ?? buildGraphView();
  const groupedCompanyCount = graphView.summary.typeCounts.get("CompanyCluster") ?? 0;
  const description =
    node.properties.description ??
    `${node.display_name} represents one part of the semiconductor supply chain in this map.`;
  const lead = `${description} This stage currently includes ${companies.length} curated compan${
    companies.length === 1 ? "y" : "ies"
  } and ${roles.length} specialized roles.`;

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = humanizeNodeType(node.node_type);
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Curated companies", String(companies.length)],
      ["Specialized roles", String(roles.length)],
      ["Why it matters", "This stage helps orient the rest of the map before you drill into individual companies"],
      ...(graphView.detail?.level === "grouped" ? [["Grouped company nodes", String(groupedCompanyCount)]] : []),
    ])}
    ${graphView.detail?.level === "grouped" ? renderConnectionSection("Countries visible in this stage", countries) : renderConnectionSection("Companies in this stage", companies)}
    ${renderConnectionSection("Roles in this stage", roles)}
  `;
  wireSelectionButtons();
}

function renderCountryInspector(node) {
  const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "LOCATED_IN" });
  const facilities = getConnectedNodes(node.node_id, { nodeType: "Facility", edgeType: "LOCATED_IN" });
  const segments = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }))
  );
  const graphView = state.graphMetrics?.graphView ?? buildGraphView();
  const lead = `${node.display_name} anchors ${companies.length} company${companies.length === 1 ? "" : "ies"}${
    facilities.length ? ` and ${facilities.length} critical facilit${facilities.length === 1 ? "y" : "ies"}` : ""
  } in this demo. Use country views to spot where the chain is geographically concentrated.`;

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = humanizeNodeType(node.node_type);
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Linked companies", String(companies.length)],
      ["Linked facilities", String(facilities.length)],
      ["What to look for", "Which categories cluster in this geography and which do not"],
    ])}
    ${graphView.detail?.level === "grouped" ? renderConnectionSection("Supply stages visible here", segments) : renderConnectionSection("Companies anchored here", companies)}
    ${renderConnectionSection("Facilities anchored here", facilities)}
  `;
  wireSelectionButtons();
}

function renderFacilityInspector(node) {
  const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "OPERATES_FACILITY" });
  const countries = getConnectedNodes(node.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" });
  const stageLabels = uniqueStrings((node.properties.stage_codes ?? []).map((code) => humanizeStageCode(code)));
  const facilityType = humanizeFacilityTypeCode(node.properties.facility_type_code);
  const countryText = joinNatural(countries.map((item) => item.display_name));
  const operatorText = joinNatural(companies.map((item) => item.display_name));
  const lead = `${node.display_name} is shown here as ${articleFor(facilityType)} ${facilityType.toLowerCase()}${
    operatorText ? ` operated by ${operatorText}` : ""
  }${countryText ? ` in ${countryText}` : ""}.`;

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = "Preview";
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Facility type", facilityType],
      ["Operator", operatorText || "Not mapped yet"],
      ["Country", countryText || "Not mapped yet"],
      ["Operating status", humanizeStatus(node.properties.facility_status)],
      ["Address", node.properties.address_text ?? "Not mapped yet"],
    ])}
    ${stageLabels.length ? renderPillSection("Facility stages", stageLabels) : ""}
    <div class="detail-section">
      <h3>Best next step</h3>
      <div class="overview-actions">
        <button class="solid-button" type="button" data-profile-node-id="${escapeHtml(node.node_id)}">Open facility profile</button>
      </div>
    </div>
  `;
  wireSelectionButtons();
}

function renderCompanyClusterInspector(node) {
  const memberCount = node.properties.member_count ?? 0;
  const groupingLabel = node.display_name;
  const sampleNames = node.properties.member_names ?? [];
  const lead = `${groupingLabel} is shown here as one grouped node because you are still looking at a broad slice of the network. This metanode stands in for ${memberCount} companies so the pattern stays readable before you zoom in.`;

  refs.selectionTitle.textContent = groupingLabel;
  refs.selectionMeta.textContent = "Grouped company preview";
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Companies represented", String(memberCount)],
      ["Why it is grouped", "The current zoom level favors system pattern over every individual company node"],
      ["How to reveal detail", "Zoom in or use the button below to expand the member companies"],
    ])}
    ${sampleNames.length ? renderPillSection("Example members", sampleNames) : ""}
    <div class="detail-section">
      <h3>Best next step</h3>
      <div class="overview-actions">
        <button class="solid-button" type="button" data-reveal-cluster-id="${escapeHtml(node.node_id)}">Reveal member companies</button>
      </div>
    </div>
  `;
  wireSelectionButtons();
}

function renderFacilityClusterInspector(node) {
  const memberCount = node.properties.member_count ?? 0;
  const groupingLabel = node.display_name;
  const sampleNames = node.properties.member_names ?? [];
  const lead = `${groupingLabel} is shown here as one grouped node because the current view is still zoomed out. This metanode stands in for ${memberCount} facilities so the surrounding stage or geography pattern stays legible first.`;

  refs.selectionTitle.textContent = groupingLabel;
  refs.selectionMeta.textContent = "Grouped facility preview";
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid([
      ["Facilities represented", String(memberCount)],
      ["Why it is grouped", "The current zoom level favors pattern and concentration over every individual site marker"],
      ["How to reveal detail", "Zoom in or use the button below to expand the member facilities"],
    ])}
    ${sampleNames.length ? renderPillSection("Example members", sampleNames) : ""}
    <div class="detail-section">
      <h3>Best next step</h3>
      <div class="overview-actions">
        <button class="solid-button" type="button" data-reveal-cluster-id="${escapeHtml(node.node_id)}">Reveal member facilities</button>
      </div>
    </div>
  `;
  wireSelectionButtons();
}

function renderCompanyProfile(node) {
  const roles = getConnectedNodes(node.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" });
  const segments = orderSegmentSummaries(
    getConnectedNodes(node.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }).map((segment) => ({
      node: segment,
      name: segment.display_name,
      companyCount: getConnectedNodes(segment.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" }).length,
      roleCount: getConnectedNodes(segment.node_id, { nodeType: "Role", edgeType: "IN_SEGMENT" }).length,
      countryCount: 0,
      facilityCount: 0,
      companies: [],
      roles: [],
    }))
  ).map((summary) => summary.node);
  const countries = getConnectedNodes(node.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" });
  const facilities = getConnectedNodes(node.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" });
  const chipFocus = uniqueStrings((node.properties.chip_codes ?? []).map((code) => humanizeChipCode(code)));
  const alternateNames = uniqueStrings((node.properties.known_names ?? []).filter((name) => name !== node.display_name));
  const identifiers = formatIdentifierFacts(node.properties.identifiers ?? {});
  const primarySegment = segments[0];
  const primaryRole = roles[0];
  const countryText = joinNatural(countries.map((country) => country.display_name));
  const roleText = joinNatural(roles.map((role) => role.display_name));
  const segmentText = joinNatural(segments.map((segment) => segment.display_name));

  if (primarySegment) {
    state.stageNodeId = primarySegment.node_id;
  }

  refs.profileBreadcrumbParent.textContent = primarySegment ? primarySegment.display_name : "Overview";
  refs.profileBreadcrumbCurrent.textContent = node.display_name;
  refs.profileKicker.textContent = "Company Profile";
  refs.profileTitle.textContent = node.display_name;
  refs.profileSummary.textContent = `${node.display_name} is mapped here as ${
    roleText ? `${articleFor(roleText)} ${roleText}` : "a semiconductor company"
  }${segmentText ? ` in ${segmentText}` : ""}${countryText ? `, anchored in ${countryText}` : ""}.`;

  refs.profileMetrics.innerHTML = [
    ["Roles", roles.length],
    ["Stages", segments.length],
    ["Facilities", facilities.length],
    ["Countries", countries.length],
  ]
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");

  const importancePoints = [
    summarizeSegmentImportance(primarySegment?.display_name, primaryRole?.display_name),
    facilities.length
      ? `${node.display_name} is one of the few profiles in this prototype that already connects directly to named facilities, which makes it more useful for physical chokepoint analysis.`
      : `${node.display_name} is currently represented through roles, stage placement, and geography rather than a fully enumerated facility footprint.`,
    chipFocus.length
      ? `The current snapshot tags this company with ${joinNatural(chipFocus)}, which helps position it in downstream chip exposure.`
      : `This profile is more about the company's place in the supply chain than about a fully modeled product catalog.`,
  ].filter(Boolean);

  refs.profileImportance.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(importancePoints[0])}</p>
    </div>
    <div class="profile-bullet-list">
      ${importancePoints
        .slice(1)
        .map((item) => `<article class="profile-bullet-card"><p>${escapeHtml(item)}</p></article>`)
        .join("")}
    </div>
  `;

  refs.profilePosition.innerHTML = [
    buildProfilePositionCard("Primary role", roleText || "Not mapped yet", roles.map((role) => role.display_name)),
    buildProfilePositionCard("Supply stage", segmentText || "Not mapped yet", segments.map((segment) => segment.display_name)),
    buildProfilePositionCard("Geography", countryText || "Not mapped yet", countries.map((country) => country.display_name)),
    buildProfilePositionCard("Chip focus", chipFocus.length ? joinNatural(chipFocus) : "Not mapped yet", chipFocus),
  ].join("");

  refs.profileLinks.innerHTML = [
    primarySegment ? buildProfileLinkCard(primarySegment, "Open the stage page that explains where this company sits in the system.", "stage") : "",
    ...facilities.slice(0, 3).map((facility) =>
      buildProfileLinkCard(facility, "Open the physical site connected to this company.", "profile")
    ),
    ...countries.slice(0, 2).map((country) =>
      buildProfileLinkCard(country, "Open this country in the network to inspect geographic concentration.", "network")
    ),
    ...roles.slice(0, 3).map((role) =>
      buildProfileLinkCard(role, "Inspect this specialized role in the network.", "network")
    ),
  ]
    .filter(Boolean)
    .join("");

  refs.profileTraceability.innerHTML = `
    ${renderFactGrid([
      ["Canonical name", node.properties.canonical_name ?? node.display_name],
      ["Record status", humanizeStatus(node.properties.record_status)],
      ["Headquarters country", formatCountry(node.properties.hq_country_code) || countryText || "Not mapped yet"],
      ["Taxonomy seed", node.properties.taxonomy_seed_id ?? "Not mapped yet"],
      ...identifiers,
    ])}
    ${alternateNames.length ? renderPillSection("Known names", alternateNames) : ""}
    ${renderPillSection("Snapshot sources", inferCompanySourcePills(node, facilities))}
  `;

  wireProfileButtons();
}

function renderFacilityProfile(node) {
  const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "OPERATES_FACILITY" });
  const countries = getConnectedNodes(node.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" });
  const operator = companies[0] ?? null;
  const operatorStage = operator
    ? getConnectedNodes(operator.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })[0] ?? null
    : null;
  const facilityType = humanizeFacilityTypeCode(node.properties.facility_type_code);
  const stageLabels = uniqueStrings((node.properties.stage_codes ?? []).map((code) => humanizeStageCode(code)));
  const identifiers = formatIdentifierFacts(node.properties.identifiers ?? {});
  const countryText = joinNatural(countries.map((country) => country.display_name));

  if (operatorStage) {
    state.stageNodeId = operatorStage.node_id;
  }

  refs.profileBreadcrumbParent.textContent = operatorStage ? operatorStage.display_name : "Overview";
  refs.profileBreadcrumbCurrent.textContent = node.display_name;
  refs.profileKicker.textContent = "Facility Profile";
  refs.profileTitle.textContent = node.display_name;
  refs.profileSummary.textContent = `${node.display_name} is mapped here as ${articleFor(facilityType)} ${facilityType.toLowerCase()}${
    operator ? ` operated by ${operator.display_name}` : ""
  }${countryText ? ` in ${countryText}` : ""}.`;

  refs.profileMetrics.innerHTML = [
    ["Operators", companies.length],
    ["Countries", countries.length],
    ["Stage tags", stageLabels.length],
    ["Status", humanizeStatus(node.properties.facility_status)],
  ]
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `
    )
    .join("");

  const importancePoints = [
    `${node.display_name} matters because facilities are where supply-chain concentration becomes physical. If a site like this is disrupted, the company-level graph becomes operationally real.`,
    operator ? `${operator.display_name} is the operator currently linked to this site in the prototype.` : "The operator relationship is still sparse in the current prototype and will get stronger as facility coverage expands.",
    stageLabels.length
      ? `This site is tagged to ${joinNatural(stageLabels)}, which helps place it in the manufacturing flow without needing to inspect raw schema fields.`
      : `The site is present as physical grounding even where the stage labels are still sparse.`,
  ];

  refs.profileImportance.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(importancePoints[0])}</p>
    </div>
    <div class="profile-bullet-list">
      ${importancePoints
        .slice(1)
        .map((item) => `<article class="profile-bullet-card"><p>${escapeHtml(item)}</p></article>`)
        .join("")}
    </div>
  `;

  refs.profilePosition.innerHTML = [
    buildProfilePositionCard("Facility type", facilityType, stageLabels),
    buildProfilePositionCard("Operator", operator?.display_name ?? "Not mapped yet", operator ? [operator.display_name] : []),
    buildProfilePositionCard("Geography", countryText || "Not mapped yet", countries.map((country) => country.display_name)),
    buildProfilePositionCard("Address", node.properties.address_text ?? "Not mapped yet", [node.properties.jurisdiction_code].filter(Boolean)),
  ].join("");

  refs.profileLinks.innerHTML = [
    operator ? buildProfileLinkCard(operator, "Open the company profile connected to this site.", "profile") : "",
    operatorStage ? buildProfileLinkCard(operatorStage, "Open the stage that this facility most likely supports.", "stage") : "",
    ...countries.slice(0, 2).map((country) =>
      buildProfileLinkCard(country, "Open this geography in the network to inspect the surrounding footprint.", "network")
    ),
  ]
    .filter(Boolean)
    .join("");

  refs.profileTraceability.innerHTML = `
    ${renderFactGrid([
      ["Facility name", node.properties.facility_name ?? node.display_name],
      ["Record status", humanizeStatus(node.properties.record_status)],
      ["Operating status", humanizeStatus(node.properties.facility_status)],
      ["Country", formatCountry(node.properties.country_code) || countryText || "Not mapped yet"],
      ["Jurisdiction", node.properties.jurisdiction_code ?? "Not mapped yet"],
      ["Latitude", node.properties.latitude != null ? String(node.properties.latitude) : ""],
      ["Longitude", node.properties.longitude != null ? String(node.properties.longitude) : ""],
      ...identifiers,
    ])}
    ${stageLabels.length ? renderPillSection("Facility stage tags", stageLabels) : ""}
    ${renderPillSection("Snapshot sources", inferFacilitySourcePills(node))}
  `;

  wireProfileButtons();
}

function renderGenericNodeInspector(node) {
  const description = node.properties.description ?? `${node.display_name} is included as ${humanizeNodeType(node.node_type).toLowerCase()} in this map.`;
  const connectedNodes = getConnectedNodes(node.node_id);

  refs.selectionTitle.textContent = node.display_name;
  refs.selectionMeta.textContent = humanizeNodeType(node.node_type);
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(description)}</p>
    </div>
    ${renderFactGrid([["Connected items", String(connectedNodes.length)]])}
    ${renderConnectionSection("Connected items", connectedNodes)}
  `;
  wireSelectionButtons();
}

function renderEdgeInspector(edge) {
  const source = getActiveGraphNodeById(edge.source_node_id);
  const target = getActiveGraphNodeById(edge.target_node_id);
  const lead = humanizeRelationship(edge, source, target);
  const facts = [["Evidence-backed links", String(edge.claim_count)]];

  if (edge.properties?.supporting_edge_count) {
    facts.push(["Supporting graph edges", String(edge.properties.supporting_edge_count)]);
  }
  if (edge.properties?.raw_edge_count) {
    facts.push(["Raw source edges", String(edge.properties.raw_edge_count)]);
  }

  refs.selectionTitle.textContent = humanizeEdgeType(edge.edge_type);
  refs.selectionMeta.textContent = `${source?.display_name ?? edge.source_node_id} -> ${target?.display_name ?? edge.target_node_id}`;
  refs.selectionBody.innerHTML = `
    <div class="detail-card">
      <p class="detail-lede">${escapeHtml(lead)}</p>
    </div>
    ${renderFactGrid(facts)}
    <div class="detail-section">
      <h3>Jump to connected items</h3>
      <div class="selection-list">
        ${[source, target]
          .filter(Boolean)
          .map(
            (node) => `
              <button type="button" data-node-id="${escapeHtml(node.node_id)}">
                <strong>${escapeHtml(node.display_name)}</strong>
                <span>${escapeHtml(humanizeNodeType(node.node_type))}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
  wireSelectionButtons();
}

function renderConnectionSection(title, nodes) {
  if (!nodes.length) {
    return "";
  }

  const sortedNodes = [...nodes].sort((left, right) => left.display_name.localeCompare(right.display_name));

  return `
    <div class="detail-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="selection-list">
        ${sortedNodes
          .map(
            (node) => `
              <button type="button" data-node-id="${escapeHtml(node.node_id)}">
                <strong>${escapeHtml(node.display_name)}</strong>
                <span>${escapeHtml(humanizeNodeType(node.node_type))}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPillSection(title, items) {
  if (!items.length) {
    return "";
  }

  return `
    <div class="detail-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="detail-pills">
        ${items.map((item) => `<span class="detail-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderFactGrid(facts) {
  const filteredFacts = facts.filter(([, value]) => value && String(value).trim().length > 0);
  if (!filteredFacts.length) {
    return "";
  }

  return `
    <div class="detail-grid">
      ${filteredFacts
        .map(
          ([label, value]) => `
            <div class="detail-fact">
              <label>${escapeHtml(label)}</label>
              <div>${escapeHtml(value)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildProfilePositionCard(label, value, tags = []) {
  return `
    <article class="profile-position-card">
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(value)}</p>
      ${tags.length ? `<div class="stage-meta">${tags.map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function buildProfileLinkCard(node, description, action) {
  const actionAttribute =
    action === "profile"
      ? `data-profile-node-id="${escapeHtml(node.node_id)}"`
      : action === "stage"
        ? `data-stage-link-node-id="${escapeHtml(node.node_id)}"`
        : `data-network-node-id="${escapeHtml(node.node_id)}"`;

  return `
    <button class="profile-link-card" type="button" ${actionAttribute}>
      <h3>${escapeHtml(node.display_name)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="stage-meta">
        <span class="meta-pill">${escapeHtml(humanizeNodeType(node.node_type))}</span>
      </div>
    </button>
  `;
}

function summarizeSegmentImportance(segmentName, roleName) {
  if (!segmentName) {
    return "This profile matters because it occupies a named place in the semiconductor supply chain rather than floating as an isolated company record.";
  }
  switch (segmentName) {
    case "Design and Software":
      return `${roleName ?? "This company"} sits upstream in the design layer, where chip intent is created before physical manufacturing starts.`;
    case "Manufacturing Equipment":
      return `${roleName ?? "This company"} matters because fabs and packaging lines depend on equipment providers to operate at all.`;
    case "Materials":
      return `${roleName ?? "This company"} matters because material inputs can become hidden chokepoints long before finished chips appear.`;
    case "Wafers and Substrates":
      return `${roleName ?? "This company"} matters because wafers and substrates feed different manufacturing junctions and can constrain downstream output.`;
    case "Masks and Reticles":
      return `${roleName ?? "This company"} matters because masks are one of the clearest bridges between design intent and wafer fabrication.`;
    case "Front-end Manufacturing":
      return `${roleName ?? "This company"} sits at the first major manufacturing junction, where multiple upstream dependencies have to converge before chips can exist physically.`;
    case "Back-end Manufacturing":
      return `${roleName ?? "This company"} sits at the packaging and test junction, where fabricated wafers become usable chip components.`;
    default:
      return `${roleName ?? "This company"} matters because it occupies a real operational position in the semiconductor supply chain.`;
  }
}

function inferFacilitySourcePills(node) {
  const identifiers = node.properties.identifiers ?? {};
  const sourcePills = [];
  if (identifiers.prtr_id?.length) {
    sourcePills.push(sourceLabels.korea_prtr);
  }
  if (identifiers.frs_id?.length || identifiers.echo_id?.length) {
    sourcePills.push(sourceLabels.epa_frs);
  }
  if (!sourcePills.length) {
    sourcePills.push(...(state.bundle?.source_keys ?? []).map((sourceKey) => sourceLabels[sourceKey] ?? sourceKey));
  }
  return uniqueStrings(sourcePills);
}

function inferCompanySourcePills(node, facilities) {
  const sourcePills = [sourceLabels.curated_seed];
  if (node.properties.identifiers?.registry_number?.length) {
    sourcePills.push("Public registry identifier");
  }
  for (const facility of facilities) {
    sourcePills.push(...inferFacilitySourcePills(facility));
  }
  return uniqueStrings(sourcePills);
}

function wireProfileButtons() {
  const scope = [refs.profileLinks];
  for (const root of scope) {
    if (!root) {
      continue;
    }
    root.querySelectorAll("button[data-profile-node-id]").forEach((button) => {
      button.addEventListener("click", () => openNodeProfile(button.dataset.profileNodeId));
    });
    root.querySelectorAll("button[data-network-node-id]").forEach((button) => {
      button.addEventListener("click", () => activateNetworkFocus(button.dataset.networkNodeId));
    });
    root.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
      button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
    });
  }
}

function wireSelectionButtons() {
  refs.selectionBody.querySelectorAll("button[data-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const node = getActiveGraphNodeById(button.dataset.nodeId);
      state.selectedEdgeId = null;
      if (node?.node_type !== "CompanyCluster" && node?.node_type !== "FacilityCluster") {
        state.focusNodeId = button.dataset.nodeId;
      }
      state.selectedNodeId = button.dataset.nodeId;
      if (node?.node_type === "Company" || node?.node_type === "Facility") {
        state.profileNodeId = node.node_id;
      }
      if (node?.node_type === "Segment") {
        state.stageNodeId = node.node_id;
      }
      state.graphSignature = null;
      render();
    });
  });
  refs.selectionBody.querySelectorAll("button[data-profile-node-id]").forEach((button) => {
    button.addEventListener("click", () => openNodeProfile(button.dataset.profileNodeId));
  });
  refs.selectionBody.querySelectorAll("button[data-stage-link-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateStageExplorer(button.dataset.stageLinkNodeId));
  });
  refs.selectionBody.querySelectorAll("button[data-network-node-id]").forEach((button) => {
    button.addEventListener("click", () => activateNetworkFocus(button.dataset.networkNodeId));
  });
  refs.selectionBody.querySelectorAll("button[data-reveal-cluster-id]").forEach((button) => {
    button.addEventListener("click", () => revealSemanticCluster(button.dataset.revealClusterId));
  });
}

function buildGraphView() {
  const rawGraphView = buildRawGraphView();
  if (!state.bundle) {
    return rawGraphView;
  }

  const detail = determineSemanticDetail(rawGraphView);
  if (detail.level === "raw") {
    return {
      ...rawGraphView,
      detail,
      rawSummary: rawGraphView.summary,
    };
  }

  const aggregatedGraph = applySemanticAggregation(rawGraphView, detail);
  return {
    ...rawGraphView,
    nodes: aggregatedGraph.nodes,
    edges: aggregatedGraph.edges,
    nodeLookup: aggregatedGraph.nodeLookup,
    summary: summarizeVisibleNodes(aggregatedGraph.nodes),
    rawSummary: rawGraphView.summary,
    detail,
  };
}

function buildRawGraphView() {
  if (!state.bundle) {
    return {
      nodes: [],
      edges: [],
      nodeLookup: new Map(),
      focusNode: null,
      isOverview: true,
      isFocused: false,
      isSearch: false,
      summary: {
        companyCount: 0,
        facilityCount: 0,
        countryCount: 0,
        typeCounts: new Map(),
      },
    };
  }

  const allNodes = state.bundle.nodes;
  const allEdges = state.bundle.edges;
  const focusNode = state.focusNodeId ? getNodeById(state.focusNodeId) : null;

  let visibleNodeIds;
  if (state.filter) {
    const matchingNodes = allNodes.filter((node) => nodeMatchesFilter(node, state.filter));
    visibleNodeIds = expandNodeContext(matchingNodes.map((node) => node.node_id), 2);
  } else if (focusNode) {
    visibleNodeIds = collectFocusedContextNodeIds(focusNode);
  } else {
    visibleNodeIds = new Set(allNodes.map((node) => node.node_id));
  }

  const nodes = allNodes.filter((node) => visibleNodeIds.has(node.node_id));
  const nodeLookup = new Map(nodes.map((node) => [node.node_id, node]));
  const edges = allEdges.filter((edge) => nodeLookup.has(edge.source_node_id) && nodeLookup.has(edge.target_node_id));

  return {
    nodes,
    edges,
    nodeLookup,
    focusNode,
    isOverview: !focusNode && !state.filter,
    isFocused: Boolean(focusNode),
    isSearch: Boolean(state.filter),
    summary: summarizeVisibleNodes(nodes),
  };
}

function determineSemanticDetail(rawGraphView, zoom = state.zoom) {
  if (!state.bundle) {
    return { level: "raw", key: "empty" };
  }

  const focusNode = rawGraphView.focusNode;
  const broadContext = !focusNode || ["Segment", "Role", "Country"].includes(focusNode.node_type);
  const rawCompanyCount = rawGraphView.summary.companyCount;
  const rawFacilityCount = rawGraphView.summary.facilityCount;

  if (rawGraphView.isSearch || !broadContext) {
    return { level: "raw", key: `direct:${focusNode?.node_type ?? "overview"}` };
  }

  if (rawCompanyCount <= 18 && rawFacilityCount <= 4) {
    return { level: "raw", key: `sparse:${focusNode?.node_type ?? "overview"}` };
  }

  let companyGrouping = "segment";
  let facilityGrouping = rawFacilityCount > 4 ? "country" : null;
  let threshold = 1.14;

  if (!focusNode) {
    companyGrouping = "segment";
    threshold = 1.12;
  } else if (focusNode.node_type === "Segment") {
    companyGrouping = "role";
    threshold = 1.34;
  } else if (focusNode.node_type === "Role") {
    companyGrouping = "country";
    threshold = 1.26;
  } else if (focusNode.node_type === "Country") {
    companyGrouping = "segment";
    facilityGrouping = rawFacilityCount > 2 ? "operator" : facilityGrouping;
    threshold = 1.22;
  }

  if (zoom >= threshold) {
    return {
      level: "raw",
      key: `expanded:${focusNode?.node_type ?? "overview"}`,
      threshold,
      companyGrouping,
      facilityGrouping,
    };
  }

  return {
    level: "grouped",
    key: `grouped:${focusNode?.node_type ?? "overview"}:${companyGrouping}:${facilityGrouping ?? "none"}`,
    threshold,
    companyGrouping,
    facilityGrouping,
  };
}

function semanticDetailKeyForZoom(zoom) {
  const rawGraphView = buildRawGraphView();
  return determineSemanticDetail(rawGraphView, zoom).key;
}

function applySemanticAggregation(rawGraphView, detail) {
  const removedNodeIds = new Set();
  const syntheticNodes = [];
  const syntheticEdges = [];
  const companyGroups = buildCompanyGroups(rawGraphView, detail);
  const facilityGroups = buildFacilityGroups(rawGraphView, detail);

  for (const group of companyGroups) {
    if (group.members.length <= 1) {
      continue;
    }
    for (const member of group.members) {
      removedNodeIds.add(member.node_id);
    }
    syntheticNodes.push(createClusterNode(group));
    syntheticEdges.push(...buildClusterEdges(group, rawGraphView, detail));
  }

  for (const group of facilityGroups) {
    if (group.members.length <= 1) {
      continue;
    }
    for (const member of group.members) {
      removedNodeIds.add(member.node_id);
    }
    syntheticNodes.push(createClusterNode(group));
    syntheticEdges.push(...buildClusterEdges(group, rawGraphView, detail));
  }

  let nodes = rawGraphView.nodes.filter((node) => !removedNodeIds.has(node.node_id));
  let edges = rawGraphView.edges.filter((edge) => !removedNodeIds.has(edge.source_node_id) && !removedNodeIds.has(edge.target_node_id));

  nodes = [...nodes, ...syntheticNodes];
  edges = dedupeEdges([...edges, ...syntheticEdges]);

  const connectedNodeIds = new Set();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source_node_id);
    connectedNodeIds.add(edge.target_node_id);
  }
  if (rawGraphView.focusNode) {
    connectedNodeIds.add(rawGraphView.focusNode.node_id);
  }
  if (state.selectedNodeId) {
    connectedNodeIds.add(state.selectedNodeId);
  }

  nodes = nodes.filter((node) => connectedNodeIds.has(node.node_id));
  const nodeLookup = new Map(nodes.map((node) => [node.node_id, node]));
  edges = edges.filter((edge) => nodeLookup.has(edge.source_node_id) && nodeLookup.has(edge.target_node_id));
  nodes = applyVisibleDegrees(nodes, edges);

  return {
    nodes,
    edges,
    nodeLookup: new Map(nodes.map((node) => [node.node_id, node])),
  };
}

function buildCompanyGroups(rawGraphView, detail) {
  if (!detail.companyGrouping) {
    return [];
  }

  const companies = rawGraphView.nodes.filter((node) => node.node_type === "Company");
  const groupMap = new Map();
  for (const company of companies) {
    const grouping = describeCompanyGrouping(company, detail.companyGrouping);
    const groupKey = `${detail.companyGrouping}:${grouping.key}`;
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        clusterType: "CompanyCluster",
        groupingKind: detail.companyGrouping,
        key: groupKey,
        title: grouping.label,
        members: [],
        connectionNodeIds: new Set(),
      });
    }
    const group = groupMap.get(groupKey);
    group.members.push(company);

    for (const connectedNode of getClusterConnectionNodes(company, rawGraphView, detail, "CompanyCluster")) {
      group.connectionNodeIds.add(connectedNode.node_id);
    }
  }

  return [...groupMap.values()];
}

function buildFacilityGroups(rawGraphView, detail) {
  if (!detail.facilityGrouping) {
    return [];
  }

  const facilities = rawGraphView.nodes.filter((node) => node.node_type === "Facility");
  const groupMap = new Map();
  for (const facility of facilities) {
    const grouping = describeFacilityGrouping(facility, detail.facilityGrouping);
    const groupKey = `${detail.facilityGrouping}:${grouping.key}`;
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        clusterType: "FacilityCluster",
        groupingKind: detail.facilityGrouping,
        key: groupKey,
        title: grouping.label,
        members: [],
        connectionNodeIds: new Set(),
      });
    }
    const group = groupMap.get(groupKey);
    group.members.push(facility);

    for (const connectedNode of getClusterConnectionNodes(facility, rawGraphView, detail, "FacilityCluster")) {
      group.connectionNodeIds.add(connectedNode.node_id);
    }
  }

  return [...groupMap.values()];
}

function describeCompanyGrouping(company, groupingKind) {
  if (groupingKind === "role") {
    const role = getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })[0];
    return {
      key: role?.node_id ?? "other",
      label: role?.display_name ?? "Other companies",
    };
  }

  if (groupingKind === "country") {
    const country = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
    return {
      key: country?.node_id ?? "other",
      label: country?.display_name ?? "Other countries",
    };
  }

  const segment = getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })[0];
  return {
    key: segment?.node_id ?? "other",
    label: segment?.display_name ?? "Other companies",
  };
}

function describeFacilityGrouping(facility, groupingKind) {
  if (groupingKind === "operator") {
    const operator = getConnectedNodes(facility.node_id, { nodeType: "Company", edgeType: "OPERATES_FACILITY" })[0];
    return {
      key: operator?.node_id ?? "other",
      label: operator?.display_name ?? "Other facilities",
    };
  }

  const country = getConnectedNodes(facility.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
  return {
    key: country?.node_id ?? "other",
    label: country?.display_name ?? "Other facilities",
  };
}

function getClusterConnectionNodes(node, rawGraphView, detail, clusterType) {
  const visibleNodes = rawGraphView.nodeLookup;
  const allowedTypes = allowedClusterConnectionTypes(rawGraphView.focusNode, clusterType);
  return getConnectedNodes(node.node_id)
    .filter((connectedNode) => visibleNodes.has(connectedNode.node_id))
    .filter((connectedNode) => allowedTypes.includes(connectedNode.node_type));
}

function allowedClusterConnectionTypes(focusNode, clusterType) {
  if (clusterType === "FacilityCluster") {
    return focusNode?.node_type === "Country" ? ["Country", "Company"] : ["Company", "Country"];
  }

  if (!focusNode) {
    return ["Segment", "Country"];
  }
  if (focusNode.node_type === "Segment") {
    return ["Role", "Country"];
  }
  if (focusNode.node_type === "Role") {
    return ["Role", "Country"];
  }
  if (focusNode.node_type === "Country") {
    return ["Segment", "Country"];
  }
  return ["Segment", "Role", "Country"];
}

function createClusterNode(group) {
  const memberCount = group.members.length;
  const firstMember = group.members[0];
  const sampleNames = group.members.slice(0, 5).map((member) => member.display_name);
  const labelSuffix = group.clusterType === "FacilityCluster" ? "facilities" : "companies";

  return {
    node_id: `virtual:${group.clusterType}:${group.key}`,
    node_type: group.clusterType,
    display_name: `${group.title} ${labelSuffix} (${memberCount})`,
    degree: group.connectionNodeIds.size,
    properties: {
      member_count: memberCount,
      member_node_ids: group.members.map((member) => member.node_id),
      member_names: sampleNames,
      grouping_kind: group.groupingKind,
      grouping_label: group.title,
      sample_label: firstMember?.display_name ?? "",
    },
  };
}

function buildClusterEdges(group, rawGraphView, detail) {
  const clusterNodeId = `virtual:${group.clusterType}:${group.key}`;
  const edges = [];
  for (const connectedNodeId of group.connectionNodeIds) {
    if (!rawGraphView.nodeLookup.has(connectedNodeId)) {
      continue;
    }
    const connectedNode = rawGraphView.nodeLookup.get(connectedNodeId);
    edges.push({
      edge_id: `virtual-edge:${clusterNodeId}:${connectedNodeId}`,
      source_node_id: clusterNodeId,
      target_node_id: connectedNodeId,
      edge_type: group.clusterType === "FacilityCluster" ? "GROUPED_FACILITY_LINK" : "GROUPED_COMPANY_LINK",
      claim_count: group.members.length,
      properties: {
        member_count: group.members.length,
        grouping_kind: detail.companyGrouping ?? detail.facilityGrouping ?? "grouped",
      },
    });
  }
  return edges;
}

function dedupeEdges(edges) {
  const edgeMap = new Map();
  for (const edge of edges) {
    const key = [edge.source_node_id, edge.target_node_id, edge.edge_type].sort().join("|");
    if (!edgeMap.has(key)) {
      edgeMap.set(key, edge);
    }
  }
  return [...edgeMap.values()];
}

function applyVisibleDegrees(nodes, edges) {
  const degreeMap = new Map();
  for (const node of nodes) {
    degreeMap.set(node.node_id, 0);
  }
  for (const edge of edges) {
    degreeMap.set(edge.source_node_id, (degreeMap.get(edge.source_node_id) ?? 0) + 1);
    degreeMap.set(edge.target_node_id, (degreeMap.get(edge.target_node_id) ?? 0) + 1);
  }

  return nodes.map((node) => ({
    ...node,
    degree: degreeMap.get(node.node_id) ?? node.degree ?? 0,
  }));
}

function buildGraphViewSignature(graphView, width, height) {
  return JSON.stringify({
    focusNodeId: graphView.focusNode?.node_id ?? null,
    filter: state.filter,
    detailKey: graphView.detail?.key ?? "raw",
    width,
    height,
    nodeIds: graphView.nodes.map((node) => node.node_id),
  });
}

function summarizeVisibleNodes(nodes) {
  const typeCounts = new Map();
  for (const node of nodes) {
    typeCounts.set(node.node_type, (typeCounts.get(node.node_type) ?? 0) + 1);
  }

  return {
    companyCount: (typeCounts.get("Company") ?? 0) + (typeCounts.get("CompanyCluster") ?? 0),
    facilityCount: (typeCounts.get("Facility") ?? 0) + (typeCounts.get("FacilityCluster") ?? 0),
    countryCount: typeCounts.get("Country") ?? 0,
    typeCounts,
  };
}

function expandNodeContext(seedNodeIds, maxDepth) {
  if (!state.bundle || !seedNodeIds.length) {
    return new Set();
  }

  const adjacency = buildAdjacencyMap();
  const visited = new Set(seedNodeIds);
  const queue = seedNodeIds.map((nodeId) => ({ nodeId, depth: 0 }));

  while (queue.length) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    if (current.depth >= maxDepth) {
      continue;
    }

    for (const nextNodeId of adjacency.get(current.nodeId) ?? []) {
      if (visited.has(nextNodeId)) {
        continue;
      }
      visited.add(nextNodeId);
      queue.push({ nodeId: nextNodeId, depth: current.depth + 1 });
    }
  }

  return visited;
}

function collectFocusedContextNodeIds(focusNode) {
  switch (focusNode.node_type) {
    case "Segment":
      return collectSegmentContextNodeIds(focusNode);
    case "Role":
      return collectRoleContextNodeIds(focusNode);
    case "Country":
      return collectCountryContextNodeIds(focusNode);
    case "Company":
      return collectCompanyContextNodeIds(focusNode);
    case "Facility":
      return collectFacilityContextNodeIds(focusNode);
    default:
      return expandNodeContext([focusNode.node_id], focusDepthForNode(focusNode));
  }
}

function collectSegmentContextNodeIds(segmentNode) {
  const companies = getConnectedNodes(segmentNode.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" });
  const roles = uniqueNodesById([
    ...getConnectedNodes(segmentNode.node_id, { nodeType: "Role", edgeType: "IN_SEGMENT" }),
    ...companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })),
  ]);
  const countries = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" }))
  );
  const facilities = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }))
  );
  return new Set([segmentNode, ...companies, ...roles, ...countries, ...facilities].map((node) => node.node_id));
}

function collectRoleContextNodeIds(roleNode) {
  const companies = getConnectedNodes(roleNode.node_id, { nodeType: "Company", edgeType: "HAS_ROLE" });
  const segments = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }))
  );
  const countries = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" }))
  );
  const facilities = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }))
  );
  return new Set([roleNode, ...companies, ...segments, ...countries, ...facilities].map((node) => node.node_id));
}

function collectCountryContextNodeIds(countryNode) {
  const companies = getConnectedNodes(countryNode.node_id, { nodeType: "Company", edgeType: "LOCATED_IN" });
  const facilities = uniqueNodesById([
    ...getConnectedNodes(countryNode.node_id, { nodeType: "Facility", edgeType: "LOCATED_IN" }),
    ...companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" })),
  ]);
  const segments = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }))
  );
  const roles = uniqueNodesById(
    companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" }))
  );
  return new Set([countryNode, ...companies, ...facilities, ...segments, ...roles].map((node) => node.node_id));
}

function collectCompanyContextNodeIds(companyNode) {
  const connected = getConnectedNodes(companyNode.node_id);
  return new Set([companyNode, ...connected].map((node) => node.node_id));
}

function collectFacilityContextNodeIds(facilityNode) {
  const connected = getConnectedNodes(facilityNode.node_id);
  const operators = connected.filter((node) => node.node_type === "Company");
  const upstream = uniqueNodesById([
    ...operators.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })),
    ...operators.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })),
  ]);
  return new Set([facilityNode, ...connected, ...upstream].map((node) => node.node_id));
}

function buildAdjacencyMap() {
  const adjacency = new Map();
  for (const edge of state.bundle?.edges ?? []) {
    if (!adjacency.has(edge.source_node_id)) {
      adjacency.set(edge.source_node_id, new Set());
    }
    if (!adjacency.has(edge.target_node_id)) {
      adjacency.set(edge.target_node_id, new Set());
    }
    adjacency.get(edge.source_node_id).add(edge.target_node_id);
    adjacency.get(edge.target_node_id).add(edge.source_node_id);
  }
  return adjacency;
}

function focusDepthForNode(node) {
  switch (node.node_type) {
    case "Segment":
      return 3;
    case "Role":
    case "Country":
    case "Facility":
      return 2;
    case "Company":
      return 1;
    default:
      return 1;
  }
}

function preferredGraphHeight(graphView) {
  const groupCounts = new Map();
  for (const node of graphView.nodes) {
    groupCounts.set(node.node_type, (groupCounts.get(node.node_type) ?? 0) + 1);
  }

  const companySpacing = shouldShowCompanyLabels(graphView) ? 24 : graphView.isOverview ? 8 : 12;
  const targetHeight = Math.max(
    graphView.isOverview ? 860 : 820,
    ((groupCounts.get("Company") ?? 0) + (groupCounts.get("CompanyCluster") ?? 0)) * companySpacing + 180,
    (groupCounts.get("Country") ?? 0) * 38 + 180,
    (groupCounts.get("Role") ?? 0) * 44 + 180
  );

  if (graphView.isOverview) {
    return Math.min(targetHeight, 940);
  }
  return Math.min(targetHeight, 1220);
}

function autoFitMinZoom(graphView) {
  if (graphView.isOverview) {
    return 0.9;
  }
  if (graphView.isSearch) {
    return 0.84;
  }
  if (graphView.isFocused) {
    return 0.88;
  }
  return 0.8;
}

function shouldShowCompanyLabels(graphView) {
  return (graphView.isFocused || graphView.isSearch) && (graphView.summary.typeCounts.get("Company") ?? 0) <= 22;
}

function shouldShowNodeLabel(node, graphView) {
  if (state.selectedNodeId === node.node_id || state.focusNodeId === node.node_id) {
    return true;
  }

  switch (node.node_type) {
    case "Segment":
    case "Role":
    case "Country":
    case "CompanyCluster":
    case "FacilityCluster":
      return true;
    case "Facility":
      return graphView.isFocused || graphView.isSearch;
    case "Company":
      return shouldShowCompanyLabels(graphView);
    default:
      return false;
  }
}

function nodeMatchesFilter(node, filterValue) {
  const haystack = `${node.display_name} ${node.node_type} ${JSON.stringify(node.properties)}`.toLowerCase();
  return haystack.includes(filterValue);
}

function computeGraphBounds(nodes, layout, graphView, width, height) {
  if (!nodes.length) {
    return { minX: 0, minY: 0, maxX: width, maxY: height };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const position = layout.get(node.node_id);
    if (!position) {
      continue;
    }

    const radius = radiusForNode(node);
    const labelWidth = shouldShowNodeLabel(node, graphView) ? estimateLabelWidth(node.display_name) + radius + 24 : radius + 18;
    minX = Math.min(minX, position.x - radius - 28);
    maxX = Math.max(maxX, position.x + labelWidth);
    minY = Math.min(minY, position.y - radius - 24);
    maxY = Math.max(maxY, position.y + radius + 24);
  }

  return {
    minX: clamp(minX - 24, 0, width),
    minY: clamp(minY - 24, 0, height),
    maxX: clamp(maxX + 24, 0, width),
    maxY: clamp(maxY + 24, 0, height),
  };
}

function buildLayout(nodes, width, height) {
  const groups = {
    Segment: [],
    Role: [],
    Company: [],
    CompanyCluster: [],
    Facility: [],
    FacilityCluster: [],
    MaterialOrItemCategory: [],
    PolicyEntity: [],
    Country: [],
  };

  for (const node of nodes) {
    (groups[node.node_type] ?? groups.Company).push(node);
  }

  const top = 110;
  const bottom = height - 64;
  const coordinates = new Map();

  placeGroup(groups.Segment, coordinates, width * 0.13, top, bottom);
  placeGroup(groups.Role, coordinates, width * 0.33, top, bottom);
  placeGroup([...groups.CompanyCluster, ...groups.Company], coordinates, width * 0.57, top, bottom);
  placeGroup([...groups.FacilityCluster, ...groups.Facility], coordinates, width * 0.68, top, bottom);
  placeGroup(groups.MaterialOrItemCategory, coordinates, width * 0.73, top, bottom);
  placeGroup(groups.PolicyEntity, coordinates, width * 0.79, top, bottom);
  placeGroup(groups.Country, coordinates, width * 0.87, top, bottom);

  return coordinates;
}

function placeGroup(group, coordinates, x, top, bottom) {
  if (!group.length) {
    return;
  }

  const ordered = [...group].sort((left, right) => right.degree - left.degree || left.display_name.localeCompare(right.display_name));
  ordered.forEach((node, index) => {
    const y =
      ordered.length === 1 ? (top + bottom) / 2 : top + ((bottom - top) * index) / (ordered.length - 1);
    coordinates.set(node.node_id, { x, y });
  });
}

function curvePath(source, target) {
  const delta = Math.max(90, Math.abs(target.x - source.x) * 0.42);
  return `M ${source.x} ${source.y} C ${source.x + delta} ${source.y}, ${target.x - delta} ${target.y}, ${target.x} ${target.y}`;
}

function radiusForNode(node) {
  switch (node.node_type) {
    case "Segment":
      return 17;
    case "Role":
      return 15;
    case "Country":
      return 16;
    case "CompanyCluster":
      return clamp(13 + (node.properties?.member_count ?? 0) * 0.18, 14, 24);
    case "Facility":
      return 10;
    case "FacilityCluster":
      return clamp(11 + (node.properties?.member_count ?? 0) * 0.2, 12, 20);
    case "Company":
      return state.focusNodeId || state.filter ? 7 : 5;
    default:
      return 8;
  }
}

function nodeClasses(node, visibleEdges) {
  const selected = state.selectedNodeId === node.node_id;
  const isConnectedToSelected =
    !state.selectedNodeId ||
    visibleEdges.some(
      (edge) =>
        (edge.source_node_id === state.selectedNodeId && edge.target_node_id === node.node_id) ||
        (edge.target_node_id === state.selectedNodeId && edge.source_node_id === node.node_id)
    );

  const isDimmed = state.selectedNodeId && state.selectedNodeId !== node.node_id && !isConnectedToSelected;

  return [
    "graph-node",
    selected ? "selected" : "",
    isDimmed ? "dimmed" : "",
    node.node_type === "Company" ? "company-node" : "",
    node.node_type === "CompanyCluster" ? "company-cluster-node" : "",
    node.node_type === "Facility" ? "facility-node" : "",
    node.node_type === "FacilityCluster" ? "facility-cluster-node" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function edgeClasses(edge) {
  const selected = state.selectedEdgeId === edge.edge_id;
  const dimmed =
    state.selectedNodeId &&
    edge.source_node_id !== state.selectedNodeId &&
    edge.target_node_id !== state.selectedNodeId;
  return ["graph-edge", selected ? "selected" : "", dimmed ? "dimmed" : ""].filter(Boolean).join(" ");
}

function applyNodeFilter(nodes, filterValue) {
  if (!filterValue) {
    return nodes;
  }

  return nodes.filter((node) => nodeMatchesFilter(node, filterValue));
}

function findNode({ nodeType, displayName }) {
  return state.bundle?.nodes.find((node) => node.node_type === nodeType && node.display_name === displayName) ?? null;
}

function getNodeById(nodeId) {
  return state.bundle?.nodes.find((node) => node.node_id === nodeId) ?? null;
}

function getActiveGraphNodeById(nodeId) {
  return state.graphMetrics?.graphView?.nodeLookup.get(nodeId) ?? getNodeById(nodeId) ?? null;
}

function getConnectedNodes(nodeId, options = {}) {
  const matches = [];
  const seen = new Set();

  for (const edge of state.bundle?.edges ?? []) {
    if (options.edgeType && edge.edge_type !== options.edgeType) {
      continue;
    }

    let otherNodeId = null;
    if (edge.source_node_id === nodeId) {
      otherNodeId = edge.target_node_id;
    } else if (edge.target_node_id === nodeId) {
      otherNodeId = edge.source_node_id;
    }

    if (!otherNodeId || seen.has(otherNodeId)) {
      continue;
    }

    const otherNode = getNodeById(otherNodeId);
    if (!otherNode) {
      continue;
    }
    if (options.nodeType && otherNode.node_type !== options.nodeType) {
      continue;
    }

    seen.add(otherNodeId);
    matches.push(otherNode);
  }

  return matches;
}

function getSegmentSummaries() {
  return (state.bundle?.nodes ?? [])
    .filter((node) => node.node_type === "Segment")
    .map((node) => {
      const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "IN_SEGMENT" });
      const roles = uniqueNodesById([
        ...getConnectedNodes(node.node_id, { nodeType: "Role", edgeType: "IN_SEGMENT" }),
        ...companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Role", edgeType: "HAS_ROLE" })),
      ]);
      const countries = uniqueStrings(
        companies.flatMap((company) =>
          getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" }).map((country) => country.display_name)
        )
      );
      const facilities = uniqueStrings(
        companies.flatMap((company) =>
          getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }).map((facility) => facility.node_id)
        )
      );

      return {
        node,
        name: node.display_name,
        companyCount: companies.length,
        roleCount: roles.length,
        countryCount: countries.length,
        facilityCount: facilities.length,
        companies,
        roles,
      };
    })
    .sort((left, right) => right.companyCount - left.companyCount || left.name.localeCompare(right.name));
}

function orderSegmentSummaries(segmentSummaries) {
  return [...segmentSummaries].sort((left, right) => {
    const leftIndex = systemStageOrder.indexOf(left.name);
    const rightIndex = systemStageOrder.indexOf(right.name);
    if (leftIndex === -1 && rightIndex === -1) {
      return left.name.localeCompare(right.name);
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

function uniqueNodesById(nodes) {
  const seen = new Set();
  const uniqueNodes = [];
  for (const node of nodes) {
    if (!node || seen.has(node.node_id)) {
      continue;
    }
    seen.add(node.node_id);
    uniqueNodes.push(node);
  }
  return uniqueNodes;
}

function getRoleSummaries() {
  return (state.bundle?.nodes ?? [])
    .filter((node) => node.node_type === "Role")
    .map((node) => {
      const companies = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "HAS_ROLE" });
      const segments = uniqueNodesById([
        ...getConnectedNodes(node.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }),
        ...companies.flatMap((company) => getConnectedNodes(company.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" })),
      ]);
      return {
        node,
        name: node.display_name,
        companyCount: companies.length,
        segmentNames: segments.map((segment) => segment.display_name),
      };
    })
    .sort((left, right) => right.companyCount - left.companyCount || left.name.localeCompare(right.name));
}

function getOutputSummaries() {
  const counts = new Map();
  for (const company of state.bundle?.nodes ?? []) {
    if (company.node_type !== "Company") {
      continue;
    }
    for (const chipCode of company.properties.chip_codes ?? []) {
      counts.set(chipCode, (counts.get(chipCode) ?? 0) + 1);
    }
  }

  if (!counts.size) {
    return [
      { label: "Logic chips", companyCount: 0 },
      { label: "Memory chips", companyCount: 0 },
      { label: "Analog chips", companyCount: 0 },
      { label: "Other output", companyCount: 0 },
    ];
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 4)
    .map(([chipCode, companyCount]) => ({
      label: humanizeChipCode(chipCode),
      companyCount,
    }));
}

function renderStageLinkCards(stageNames, options = {}) {
  if (!stageNames.length) {
    return `<p class="stage-empty-copy">${escapeHtml(options.emptyLabel ?? "No linked stages yet.")}</p>`;
  }

  return stageNames
    .map((stageName) => {
      const summary = getSegmentSummaries().find((item) => item.name === stageName);
      if (!summary) {
        return `
          <article class="stage-link-card">
            <h3>${escapeHtml(stageName)}</h3>
            <p>${escapeHtml("This is a product-level output label in the current prototype, not a navigable stage node yet.")}</p>
          </article>
        `;
      }

      return `
        <button class="stage-link-card" type="button" data-stage-link-node-id="${escapeHtml(summary.node.node_id)}">
          <h3>${escapeHtml(summary.name)}</h3>
          <p>${escapeHtml(stageDescriptions[summary.name] ?? "Open this stage page to inspect the next system layer.")}</p>
          <div class="stage-meta">
            <span class="meta-pill">${escapeHtml(String(summary.companyCount))} companies</span>
            <span class="meta-pill">${escapeHtml(String(summary.countryCount))} countries</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function getStageCountrySummaries(stageSummary) {
  const countryMap = new Map();
  for (const company of stageSummary.companies) {
    const country = getConnectedNodes(company.node_id, { nodeType: "Country", edgeType: "LOCATED_IN" })[0];
    if (!country) {
      continue;
    }
    const existing = countryMap.get(country.display_name) ?? {
      name: country.display_name,
      companyCount: 0,
      facilityCount: 0,
    };
    existing.companyCount += 1;
    existing.facilityCount += getConnectedNodes(company.node_id, { nodeType: "Facility", edgeType: "OPERATES_FACILITY" }).length;
    countryMap.set(country.display_name, existing);
  }

  return [...countryMap.values()].sort((left, right) => right.companyCount - left.companyCount || left.name.localeCompare(right.name));
}

function describeRoleWithinStage(roleName, stageName) {
  if (stageName === "Front-end Manufacturing") {
    return `${roleName} is part of the fab junction where upstream inputs become patterned wafers.`;
  }
  if (stageName === "Back-end Manufacturing") {
    return `${roleName} helps move fabricated wafers through packaging, assembly, or test into usable chip output.`;
  }
  if (stageName === "Design and Software") {
    return `${roleName} shapes chip intent before the physical manufacturing stack begins.`;
  }
  return `${roleName} is one of the specialized roles that make ${stageName.toLowerCase()} operationally meaningful.`;
}

function summarizeCompanyWithinStage(company, stageName, roleNames) {
  const chipFocus = (company.properties.chip_codes ?? []).slice(0, 2).map((chipCode) => humanizeChipCode(chipCode));
  if (roleNames.length && chipFocus.length) {
    return `${company.display_name} appears here through ${roleNames.join(", ")} with ${chipFocus.join(" and ")} exposure in this snapshot.`;
  }
  if (roleNames.length) {
    return `${company.display_name} appears here through ${roleNames.join(", ")} in this snapshot.`;
  }
  if (chipFocus.length) {
    return `${company.display_name} is mapped to ${stageName.toLowerCase()} with ${chipFocus.join(" and ")} exposure in this snapshot.`;
  }
  return `${company.display_name} participates in ${stageName.toLowerCase()} in this snapshot.`;
}

function activateStageExplorer(nodeId) {
  state.selectedEdgeId = null;
  state.focusNodeId = nodeId;
  state.selectedNodeId = nodeId;
  state.stageNodeId = nodeId;
  state.filter = "";
  state.graphSignature = null;
  refs.nodeSearch.value = "";
  state.activeView = "stage";
  render();
}

function openNodeProfile(nodeId) {
  const node = getNodeById(nodeId);
  if (!node || !["Company", "Facility"].includes(node.node_type)) {
    activateNetworkFocus(nodeId);
    return;
  }

  if (node.node_type === "Company") {
    const stage = orderSegmentSummaries(
      getConnectedNodes(node.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }).map((segment) => ({
        node: segment,
        name: segment.display_name,
        companyCount: 0,
        roleCount: 0,
        countryCount: 0,
        facilityCount: 0,
        companies: [],
        roles: [],
      }))
    )[0];
    state.stageNodeId = stage?.node.node_id ?? state.stageNodeId;
  } else if (node.node_type === "Facility") {
    const operator = getConnectedNodes(node.node_id, { nodeType: "Company", edgeType: "OPERATES_FACILITY" })[0];
    const stage = operator
      ? orderSegmentSummaries(
          getConnectedNodes(operator.node_id, { nodeType: "Segment", edgeType: "IN_SEGMENT" }).map((segment) => ({
            node: segment,
            name: segment.display_name,
            companyCount: 0,
            roleCount: 0,
            countryCount: 0,
            facilityCount: 0,
            companies: [],
            roles: [],
          }))
        )[0]
      : null;
    state.stageNodeId = stage?.node.node_id ?? state.stageNodeId;
  }

  state.selectedEdgeId = null;
  state.focusNodeId = nodeId;
  state.selectedNodeId = nodeId;
  state.profileNodeId = nodeId;
  state.graphSignature = null;
  state.filter = "";
  refs.nodeSearch.value = "";
  state.activeView = "profile";
  render();
}

function revealSemanticCluster(nodeId) {
  const node = getActiveGraphNodeById(nodeId);
  const targetZoom = Math.max(state.zoom, (state.graphMetrics?.graphView.detail?.threshold ?? 1.24) + 0.18);
  if (!node) {
    setGraphZoom(targetZoom);
    return;
  }

  state.selectedEdgeId = null;
  state.selectedNodeId = state.focusNodeId;
  state.graphSignature = null;
  setGraphZoom(targetZoom);
}

function activateNetworkFocus(nodeId) {
  state.selectedEdgeId = null;
  state.focusNodeId = nodeId;
  state.selectedNodeId = nodeId;
  state.filter = "";
  state.graphSignature = null;
  refs.nodeSearch.value = "";
  state.activeView = "network";
  render();
}

function formatIdentifierFacts(identifiers) {
  const labelMap = {
    ticker: "Ticker",
    cik: "CIK",
    lei: "LEI",
    epa_echo_id: "EPA ECHO ID",
    epa_frs_id: "EPA FRS ID",
    prtr_id: "PRTR ID",
    registry_number: "Registry Number",
  };

  return Object.entries(identifiers)
    .filter(([, values]) => Array.isArray(values) && values.length)
    .map(([key, values]) => [labelMap[key] ?? key.toUpperCase(), values.join(", ")]);
}

function humanizeNodeType(nodeType) {
  return nodeTypeLabels[nodeType] ?? nodeType;
}

function humanizeSource(sourceKey) {
  return sourceLabels[sourceKey] ?? sourceKey.toUpperCase();
}

function humanizeChipCode(chipCode) {
  return chipLabels[chipCode] ?? chipCode.replace(/^CHIP\./, "").replaceAll("_", " ").toLowerCase();
}

function humanizeEdgeType(edgeType) {
  const labels = {
    HAS_ROLE: "Has role",
    IN_SEGMENT: "In supply chain stage",
    LOCATED_IN: "Located in",
    OPERATES_FACILITY: "Operates facility",
    GROUPED_COMPANY_LINK: "Grouped company relationship",
    GROUPED_FACILITY_LINK: "Grouped facility relationship",
  };
  return labels[edgeType] ?? edgeType.replaceAll("_", " ").toLowerCase();
}

function humanizeRelationship(edge, source, target) {
  const sourceName = source?.display_name ?? edge.source_node_id;
  const targetName = target?.display_name ?? edge.target_node_id;

  switch (edge.edge_type) {
    case "HAS_ROLE":
      return `${sourceName} is classified here as ${articleFor(targetName)} ${targetName}.`;
    case "IN_SEGMENT":
      return `${sourceName} sits in the ${targetName} part of the semiconductor supply chain.`;
    case "LOCATED_IN":
      return `${sourceName} is anchored here to ${targetName}.`;
    case "OPERATES_FACILITY":
      return `${sourceName} operates ${targetName}.`;
    case "GROUPED_COMPANY_LINK":
      return `${sourceName} is a grouped company node that stays connected to ${targetName} while the network is still zoomed out.`;
    case "GROUPED_FACILITY_LINK":
      return `${sourceName} is a grouped facility node that stays connected to ${targetName} while the network is still zoomed out.`;
    default:
      return `${sourceName} is connected to ${targetName} in the current map.`;
  }
}

function formatCountry(countryCode) {
  return countryNames[countryCode] ?? countryCode;
}

function describeCountryFootprint(country) {
  const companyPart = `${country.company_count} linked compan${country.company_count === 1 ? "y" : "ies"}`;
  const facilityCount = country.facility_count ?? 0;
  if (!facilityCount) {
    return companyPart;
  }
  return `${companyPart} and ${facilityCount} facilit${facilityCount === 1 ? "y" : "ies"}`;
}

function describeOverviewLead() {
  const companyCount = state.bundle?.summary.company_count ?? 0;
  const facilityCount = state.bundle?.summary.facility_count ?? 0;
  if (state.bundle?.summary.facility_count) {
    return `This snapshot shows ${companyCount} curated companies and ${facilityCount} linked facilit${
      facilityCount === 1 ? "y" : "ies"
    } across the semiconductor supply chain. The default view is condensed so you can orient yourself first, then drill into one stage, company, or country at a time.`;
  }
  return `This snapshot shows ${companyCount} curated companies across the semiconductor supply chain. The default view is condensed so you can orient yourself first, then drill into one stage, company, or country at a time.`;
}

function humanizeFacilityTypeCode(facilityTypeCode) {
  if (typeof facilityTypeCode !== "string" || !facilityTypeCode.trim()) {
    return "Facility";
  }

  const labels = {
    "FAC.FAB": "Fab",
    "FAC.OSAT": "OSAT facility",
    "FAC.PACKAGING": "Packaging facility",
    "FAC.TEST": "Test facility",
    "FAC.WAFER_PLANT": "Wafer plant",
    "FAC.SUBSTRATE_PLANT": "Substrate plant",
    "FAC.MASK_SHOP": "Mask shop",
    "FAC.CHEMICALS_PLANT": "Chemicals plant",
    "FAC.GASES_PLANT": "Gases plant",
    "FAC.RND_CENTER": "R&D center",
  };
  return labels[facilityTypeCode] ?? facilityTypeCode.replace(/^FAC\./, "").replaceAll("_", " ").toLowerCase();
}

function humanizeStageCode(stageCode) {
  if (typeof stageCode !== "string" || !stageCode.trim()) {
    return "Unspecified stage";
  }

  const labels = {
    "STAGE.DESIGN": "Design",
    "STAGE.TAPEOUT": "Tapeout",
    "STAGE.WAFER_FAB": "Wafer fab",
    "STAGE.MASKS": "Masks",
    "STAGE.WAFER_SORT": "Wafer sort",
    "STAGE.PACKAGE_ASSEMBLY": "Package assembly",
    "STAGE.PACKAGE_TEST": "Package test",
    "STAGE.FINAL_TEST": "Final test",
    "STAGE.DISTRIBUTION": "Distribution",
  };
  return labels[stageCode] ?? stageCode.replace(/^STAGE\./, "").replaceAll("_", " ").toLowerCase();
}

function humanizeStatus(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "Unknown";
  }
  const normalized = value.replaceAll("_", " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function joinNatural(items) {
  const filtered = uniqueStrings(items.filter(Boolean));
  if (!filtered.length) {
    return "";
  }
  if (filtered.length === 1) {
    return filtered[0];
  }
  if (filtered.length === 2) {
    return `${filtered[0]} and ${filtered[1]}`;
  }
  return `${filtered.slice(0, -1).join(", ")}, and ${filtered.at(-1)}`;
}

function uniqueStrings(items) {
  return [...new Set(items)];
}

function articleFor(value) {
  return /^[aeiou]/i.test(value) ? "an" : "a";
}

function setupGraphNavigation() {
  refs.graphScroll.addEventListener("pointerdown", beginGraphPan);
  refs.graphCanvas.addEventListener("dblclick", handleGraphDoubleClick);
  window.addEventListener("pointermove", continueGraphPan);
  window.addEventListener("pointerup", endGraphPan);
  window.addEventListener("pointercancel", endGraphPan);
  refs.graphScroll.addEventListener("wheel", handleGraphWheel, { passive: false });
  refs.graphScroll.addEventListener("gesturestart", handleGraphGestureStart);
  refs.graphScroll.addEventListener("gesturechange", handleGraphGestureChange);
  refs.graphScroll.addEventListener("gestureend", handleGraphGestureEnd);
  window.addEventListener("resize", handleViewportResize);
}

function beginGraphPan(event) {
  if (!state.bundle || event.button !== 0) {
    return;
  }
  if (event.target.closest(".graph-node") || event.target.closest(".graph-edge")) {
    return;
  }

  state.panSession = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: refs.graphScroll.scrollLeft,
    scrollTop: refs.graphScroll.scrollTop,
    moved: false,
  };
  refs.graphScroll.classList.add("is-dragging");
  refs.graphScroll.setPointerCapture?.(event.pointerId);
}

function continueGraphPan(event) {
  if (!state.panSession || state.panSession.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - state.panSession.startX;
  const deltaY = event.clientY - state.panSession.startY;
  if (!state.panSession.moved && Math.hypot(deltaX, deltaY) > 4) {
    state.panSession.moved = true;
  }

  refs.graphScroll.scrollLeft = state.panSession.scrollLeft - deltaX;
  refs.graphScroll.scrollTop = state.panSession.scrollTop - deltaY;
  event.preventDefault();
}

function endGraphPan(event) {
  if (!state.panSession || state.panSession.pointerId !== event.pointerId) {
    return;
  }

  if (state.panSession.moved) {
    state.suppressGraphClick = true;
  }
  refs.graphScroll.classList.remove("is-dragging");
  refs.graphScroll.releasePointerCapture?.(event.pointerId);
  state.panSession = null;
}

function handleGraphWheel(event) {
  if (!state.bundle) {
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    setGraphZoom(state.zoom * factor, {
      anchorClientX: event.clientX,
      anchorClientY: event.clientY,
    });
    event.preventDefault();
    return;
  }

  const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
  const verticalDelta = event.deltaY;
  const horizontalIntent = Math.abs(horizontalDelta) > Math.abs(verticalDelta) * 1.1;
  const graphCanScrollLeft = refs.graphScroll.scrollWidth > refs.graphScroll.clientWidth + 2;

  if (horizontalIntent && graphCanScrollLeft) {
    refs.graphScroll.scrollLeft += horizontalDelta || verticalDelta;
    event.preventDefault();
    return;
  }

  if (Math.abs(verticalDelta) > 0.5) {
    window.scrollBy({ top: verticalDelta, left: 0, behavior: "auto" });
    event.preventDefault();
  }
}

function handleGraphDoubleClick(event) {
  if (!state.bundle) {
    return;
  }

  event.preventDefault();
  const factor = event.shiftKey ? 1 / zoomLimits.step : zoomLimits.step;
  setGraphZoom(state.zoom * factor, {
    anchorClientX: event.clientX,
    anchorClientY: event.clientY,
  });
}

function handleGraphGestureStart(event) {
  if (!state.bundle) {
    return;
  }

  state.gestureSession = {
    startZoom: state.zoom,
    anchorClientX: event.clientX,
    anchorClientY: event.clientY,
  };
  event.preventDefault();
}

function handleGraphGestureChange(event) {
  if (!state.gestureSession) {
    return;
  }

  setGraphZoom(state.gestureSession.startZoom * event.scale, {
    anchorClientX: state.gestureSession.anchorClientX,
    anchorClientY: state.gestureSession.anchorClientY,
  });
  event.preventDefault();
}

function handleGraphGestureEnd(event) {
  if (!state.gestureSession) {
    return;
  }

  state.gestureSession = null;
  event.preventDefault();
}

function handleViewportResize() {
  if (!state.bundle) {
    return;
  }

  window.clearTimeout(state.resizeTimer);
  state.resizeTimer = window.setTimeout(() => {
    renderGraph();
  }, 120);
}

function setGraphZoom(nextZoom, options = {}) {
  const clampedZoom = clamp(nextZoom, zoomLimits.min, zoomLimits.max);
  if (!state.graphMetrics) {
    state.zoom = clampedZoom;
    renderNavigation();
    return;
  }

  const previousZoom = state.zoom;
  if (Math.abs(clampedZoom - previousZoom) < 0.001) {
    renderNavigation();
    return;
  }

  const containerRect = refs.graphScroll.getBoundingClientRect();
  const anchorClientX = options.anchorClientX ?? containerRect.left + containerRect.width / 2;
  const anchorClientY = options.anchorClientY ?? containerRect.top + containerRect.height / 2;
  const anchorGraphX = (refs.graphScroll.scrollLeft + (anchorClientX - containerRect.left)) / previousZoom;
  const anchorGraphY = (refs.graphScroll.scrollTop + (anchorClientY - containerRect.top)) / previousZoom;
  const previousSemanticKey = semanticDetailKeyForZoom(previousZoom);
  const nextSemanticKey = semanticDetailKeyForZoom(clampedZoom);

  state.zoom = clampedZoom;
  if (previousSemanticKey !== nextSemanticKey) {
    state.pendingGraphAnchor = {
      anchorGraphX,
      anchorGraphY,
      anchorClientX,
      anchorClientY,
    };
    state.graphSignature = null;
    render();
    return;
  }
  applyGraphCanvasSize(state.graphMetrics.width, state.graphMetrics.height, clampedZoom);

  requestAnimationFrame(() => {
    refs.graphScroll.scrollLeft = anchorGraphX * clampedZoom - (anchorClientX - containerRect.left);
    refs.graphScroll.scrollTop = anchorGraphY * clampedZoom - (anchorClientY - containerRect.top);
    clampGraphScroll(state.graphMetrics.width, state.graphMetrics.height, clampedZoom);
    renderNavigation();
  });
}

function fitCurrentGraph() {
  if (!state.graphMetrics) {
    return;
  }
  fitGraphToBounds(state.graphMetrics.bounds, {
    width: state.graphMetrics.width,
    height: state.graphMetrics.height,
    behavior: "smooth",
  });
}

function fitGraphToBounds(bounds, options = {}) {
  if (!bounds || !state.graphMetrics) {
    return;
  }

  const metrics = {
    width: options.width ?? state.graphMetrics.width,
    height: options.height ?? state.graphMetrics.height,
  };
  const containerRect = refs.graphScroll.getBoundingClientRect();
  if (!containerRect.width || !containerRect.height) {
    return;
  }

  const contentWidth = Math.max(220, bounds.maxX - bounds.minX);
  const contentHeight = Math.max(220, bounds.maxY - bounds.minY);
  const minZoom = options.minZoom ?? zoomLimits.min;
  const nextZoom = clamp(
    Math.min((containerRect.width - 96) / contentWidth, (containerRect.height - 92) / contentHeight),
    minZoom,
    zoomLimits.max
  );

  state.zoom = nextZoom;
  applyGraphCanvasSize(metrics.width, metrics.height, nextZoom);

  requestAnimationFrame(() => {
    centerGraphOnBounds(bounds, {
      width: metrics.width,
      height: metrics.height,
      zoom: nextZoom,
      behavior: options.behavior ?? "smooth",
    });
    renderNavigation();
  });
}

function centerCurrentSelection() {
  if (!state.graphMetrics) {
    return;
  }

  const nodeId = state.selectedNodeId ?? state.focusNodeId;
  if (!nodeId) {
    fitCurrentGraph();
    return;
  }

  const position = state.graphMetrics.layout.get(nodeId);
  if (!position) {
    fitCurrentGraph();
    return;
  }

  centerGraphOnPoint(position.x, position.y, {
    width: state.graphMetrics.width,
    height: state.graphMetrics.height,
    zoom: state.zoom,
    behavior: "smooth",
  });
}

function centerGraphOnBounds(bounds, options = {}) {
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  centerGraphOnPoint(centerX, centerY, options);
}

function centerGraphOnPoint(x, y, options = {}) {
  const width = options.width ?? state.graphMetrics?.width ?? 0;
  const height = options.height ?? state.graphMetrics?.height ?? 0;
  const zoom = options.zoom ?? state.zoom;
  const containerRect = refs.graphScroll.getBoundingClientRect();
  if (!containerRect.width || !containerRect.height) {
    return;
  }

  const maxLeft = Math.max(0, width * zoom - containerRect.width);
  const maxTop = Math.max(0, height * zoom - containerRect.height);
  const nextLeft = clamp(x * zoom - containerRect.width / 2, 0, maxLeft);
  const nextTop = clamp(y * zoom - containerRect.height / 2, 0, maxTop);

  refs.graphScroll.scrollTo({
    left: nextLeft,
    top: nextTop,
    behavior: options.behavior ?? "smooth",
  });
}

function clampGraphScroll(width, height, zoom) {
  const containerRect = refs.graphScroll.getBoundingClientRect();
  const maxLeft = Math.max(0, width * zoom - containerRect.width);
  const maxTop = Math.max(0, height * zoom - containerRect.height);
  refs.graphScroll.scrollLeft = clamp(refs.graphScroll.scrollLeft, 0, maxLeft);
  refs.graphScroll.scrollTop = clamp(refs.graphScroll.scrollTop, 0, maxTop);
}

function applyGraphCanvasSize(width, height, zoom) {
  refs.graphCanvas.style.width = `${Math.round(width * zoom)}px`;
  refs.graphCanvas.style.height = `${Math.round(height * zoom)}px`;
}

function estimateLabelWidth(text) {
  return Math.max(28, String(text).length * 7.4);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function validateBundle(bundle) {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Bundle must be a JSON object.");
  }
  if (!Array.isArray(bundle.nodes) || !Array.isArray(bundle.edges)) {
    throw new Error("Bundle must include nodes and edges arrays.");
  }
  if (!bundle.summary || typeof bundle.summary !== "object") {
    throw new Error("Bundle must include a summary object.");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
