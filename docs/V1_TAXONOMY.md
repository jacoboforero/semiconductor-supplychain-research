# V1 Taxonomy

This document captures the current working taxonomy and predicate vocabulary for v1.

It is a planning input, not a finalized schema. The purpose is to give the future pipeline and graph model a stable vocabulary to plan around.

## Taxonomy Principles

- The taxonomy should be semiconductor-specific.
- The taxonomy should be small enough for v1 and expandable later.
- Companies can hold multiple roles.
- Facilities can carry their own roles and types.
- Supply and dependency claims should use typed predicates and item codes where possible.
- External standards should act as bridge layers, not primary internal modeling drivers.
- Taxonomy codes should be versioned.

## Top-Level Segments

V1 should work from these eight top-level segments:

- Design and software
- Front-end manufacturing
- Back-end manufacturing
- Wafers and substrates
- Materials
- Manufacturing equipment
- Masks and reticles
- Policy and controls overlay

Recommended segment codes for the first coded implementation:

- `SEG.DESIGN_SOFTWARE`
- `SEG.FRONTEND_MANUFACTURING`
- `SEG.BACKEND_MANUFACTURING`
- `SEG.WAFERS_SUBSTRATES`
- `SEG.MATERIALS`
- `SEG.MANUFACTURING_EQUIPMENT`
- `SEG.MASKS_RETICLES`
- `SEG.POLICY_CONTROLS`

## Company Role Codes

Working role codes for v1:

- `ROLE.FABLESS`
- `ROLE.IDM`
- `ROLE.FOUNDRY`
- `ROLE.MEMORY_MANUFACTURER`
- `ROLE.ANALOG_POWER_MANUFACTURER`
- `ROLE.OSAT`
- `ROLE.PACKAGING_SPECIALIST`
- `ROLE.TEST_SERVICE`
- `ROLE.WAFER_MANUFACTURER`
- `ROLE.SUBSTRATE_MANUFACTURER`
- `ROLE.PHOTOMASK_SUPPLIER`
- `ROLE.CHEMICALS_SUPPLIER`
- `ROLE.SPECIALTY_GASES_SUPPLIER`
- `ROLE.EQUIPMENT_SUPPLIER`
- `ROLE.EDA_VENDOR`
- `ROLE.IP_VENDOR`

These are intentionally many-to-many. A company should be able to hold multiple role assignments with evidence and time bounds.

## Chip Output Categories

Working chip output layer for v1:

- `CHIP.LOGIC`
- `CHIP.MEMORY`
- `CHIP.ANALOG`
- `CHIP.OTHER`

This should remain intentionally coarse in v1.

Useful optional second-level splits:

- logic: general compute, accelerators, microcontrollers
- memory: DRAM, NAND, other memory
- analog: power, mixed-signal or signal-chain
- other: sensors, optoelectronics, discretes

## Facility Type Codes

Working facility codes for v1:

- `FAC.FAB`
- `FAC.OSAT`
- `FAC.PACKAGING`
- `FAC.TEST`
- `FAC.WAFER_PLANT`
- `FAC.SUBSTRATE_PLANT`
- `FAC.MASK_SHOP`
- `FAC.CHEMICALS_PLANT`
- `FAC.GASES_PLANT`
- `FAC.RND_CENTER`

Optional later:

- memory-dominant fab
- equipment factory

## Process Stage Codes

Working process-stage codes:

- `STAGE.DESIGN`
- `STAGE.TAPEOUT`
- `STAGE.WAFER_FAB`
- `STAGE.MASKS`
- `STAGE.WAFER_SORT`
- `STAGE.PACKAGE_ASSEMBLY`
- `STAGE.PACKAGE_TEST`
- `STAGE.FINAL_TEST`
- `STAGE.DISTRIBUTION`

These are useful for claim normalization and later analytics even if not every claim uses them.

## Item Classes

Top-level item classes:

- `ITEM.SERVICE`
- `ITEM.PHYSICAL_GOOD`
- `ITEM.SOFTWARE`
- `ITEM.IP`
- `ITEM.DATA`

## Service Codes

Working service codes:

- `SERVICE.FOUNDRY_WAFER_FAB`
- `SERVICE.MASK_MAKING`
- `SERVICE.PACKAGING_ASSEMBLY`
- `SERVICE.ADVANCED_PACKAGING`
- `SERVICE.TEST`
- `SERVICE.DESIGN_SERVICES`
- `SERVICE.EQUIPMENT_MAINTENANCE`

## Physical Goods And Tool Families

Working goods and tool-family codes:

- `GOOD.SILICON_WAFER`
- `GOOD.EPI_WAFER`
- `GOOD.SOI_WAFER`
- `GOOD.SIC_SUBSTRATE`
- `GOOD.GAN_SUBSTRATE`
- `GOOD.PHOTOMASK`
- `GOOD.MASK_BLANK`
- `GOOD.PHOTORESIST`
- `GOOD.WET_CHEMICAL`
- `GOOD.SPECIALTY_GAS`
- `GOOD.CMP_SLURRY_PAD`
- `GOOD.SPUTTER_TARGET`
- `GOOD.ABF_SUBSTRATE`
- `GOOD.BT_SUBSTRATE`
- `GOOD.LEADFRAME`
- `GOOD.INTERPOSER`
- `TOOL.LITHOGRAPHY`
- `TOOL.ETCH`
- `TOOL.DEPOSITION`
- `TOOL.CMP`
- `TOOL.IMPLANT`
- `TOOL.CLEAN`
- `TOOL.METROLOGY_INSPECTION`
- `TOOL.THERMAL`
- `TOOL.TEST_EQUIPMENT`
- `TOOL.PACKAGING_EQUIPMENT`

## Software And IP Codes

Working software and IP codes:

- `SW.EDA`
- `IP.CPU_CORE`
- `IP.GPU_CORE`
- `IP.NPU_ACCELERATOR`
- `IP.SERDES`
- `IP.MEMORY_INTERFACE`

This is intentionally narrow for v1.

## Useful Optional Attributes

Useful optional attributes that may attach to facilities, items, or claims:

- `node_nm`
- `wafer_diameter_mm`
- `package_type`
- `material_system`
- `export_control_flag`

These should remain optional in v1.

## Predicate Vocabulary

## Corporate And Control

- `OWNS`
- `SUBSIDIARY_OF`
- `JOINT_VENTURE_WITH`

## Facility Anchoring

- `OPERATES_FACILITY`
- `FACILITY_LOCATED_IN`
- `FACILITY_HAS_STATUS`

## Operational Relationships

- `SUPPLIES_MATERIAL_TO`
- `SUPPLIES_COMPONENT_TO`
- `PROVIDES_EQUIPMENT_TO`
- `PROVIDES_SERVICE_TO`
- `FABRICATES_FOR`
- `PACKAGES_FOR`
- `TESTS_FOR`
- `LICENSES_IP_TO`
- `PROVIDES_PDK_TO`
- `USES_EQUIPMENT_FROM`

## Dependency And Overlay

- `DEPENDS_ON`
- `HAS_SINGLE_SOURCE_RISK_FROM`
- `EXPOSED_TO_EXPORT_CONTROL`

## Predicate Rules

- Direct supply predicates should be used only when a relationship is explicit or strongly attributable.
- Proxy or inference predicates should carry explicit inference method and confidence.
- Supply and dependency claims should carry an `item_code` whenever the claim is not purely corporate or geographic.
- Claims should also carry a classification such as `FACT`, `PROXY`, or `INFERENCE`.

## External Standards As Bridge Layers

These standards are useful, but they should not drive the internal v1 taxonomy:

- HS / HTS
- NAICS
- NACE
- ISIC
- patent classifications
- procurement taxonomies such as UNSPSC-like systems

They are still worth mapping because they support joins to trade data, public statistics, or external datasets.

Working rule:

- use bridge tables from external codes into internal taxonomy codes
- do not use external codes as the canonical internal category system

## Governance

Taxonomy management should be treated as a governed, versioned artifact.

At minimum, future implementation should plan for:

- versioned code lists
- change logs
- migration paths for normalized data
- claim records stamped with the taxonomy version used during extraction or normalization

That is enough to keep later pipeline and graph work from being blocked by vocabulary drift.
