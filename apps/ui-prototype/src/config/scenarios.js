export const SCENARIOS = [
  {
    id: "foundry-core",
    title: "Foundry Core",
    strap: "Hub concentration",
    summary:
      "Center the graph on TSMC and inspect how design tools, equipment, packaging, and leading chip companies all converge through one manufacturing hub.",
    whyItMatters:
      "This is the clearest first read on concentration. One foundry node sits between upstream enablement and several globally important downstream companies.",
    companyNames: [
      "Taiwan Semiconductor Manufacturing Company Limited",
      "Synopsys, Inc.",
      "Cadence Design Systems, Inc.",
      "ASML Holding N.V.",
      "Applied Materials, Inc.",
      "Tokyo Electron Limited",
      "Amkor Technology, Inc.",
      "ASE Technology Holding Co., Ltd.",
      "Apple Inc.",
      "NVIDIA",
      "AMD",
      "Qualcomm",
      "Broadcom",
      "MediaTek",
    ],
  },
  {
    id: "mobile-design-stack",
    title: "Mobile Design Stack",
    strap: "Design-to-output path",
    summary:
      "Trace how Arm IP and foundry capacity support the mobile SoC path through MediaTek and Qualcomm, with TSMC sitting underneath execution.",
    whyItMatters:
      "This lens is useful when the user wants to understand how design-side dependencies and execution capacity combine inside a focused product corridor.",
    companyNames: [
      "Arm Holdings plc",
      "MediaTek",
      "Qualcomm",
      "Taiwan Semiconductor Manufacturing Company Limited",
      "ASML Holding N.V.",
      "Tokyo Electron Limited",
    ],
  },
  {
    id: "advanced-packaging-release",
    title: "Advanced Packaging Release",
    strap: "Back-end bottleneck",
    summary:
      "Focus on the handoff out of wafer fabrication and into advanced packaging, where Amkor and ASE release usable output for Apple, NVIDIA, Intel, and Analog Devices.",
    whyItMatters:
      "A wafer is not a finished product. This view makes the back-end release layer visible instead of treating it like an afterthought.",
    companyNames: [
      "Taiwan Semiconductor Manufacturing Company Limited",
      "Amkor Technology, Inc.",
      "ASE Technology Holding Co., Ltd.",
      "Apple Inc.",
      "NVIDIA",
      "Intel",
      "Analog Devices",
    ],
  },
];

export function getScenarioById(scenarioId) {
  return SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? SCENARIOS[0];
}
