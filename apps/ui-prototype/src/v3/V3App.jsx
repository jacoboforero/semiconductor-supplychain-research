import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { buildBundleModel } from "../lib/bundle";
import { loadBuiltInSnapshot, readSnapshotFile } from "../lib/snapshot";
import V3CompanyMap from "./components/V3CompanyMap";
import V3Inspector from "./components/V3Inspector";
import V3SearchOverlay from "./components/V3SearchOverlay";
import V3SystemMap from "./components/V3SystemMap";
import { buildV3Model } from "./model/system";
import { useV3WorkspaceState } from "./state/useWorkspaceState";
import "./styles.css";

export default function V3App() {
  const [snapshot, setSnapshot] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const builtInSnapshot = await loadBuiltInSnapshot();
      if (!cancelled) {
        setSnapshot(builtInSnapshot);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    const baseModel = buildBundleModel(snapshot.bundle);
    return buildV3Model(baseModel);
  }, [snapshot]);
  const workspace = useV3WorkspaceState(model);

  async function handleSnapshotLoad(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const nextSnapshot = await readSnapshotFile(file);
    startTransition(() => {
      setSnapshot(nextSnapshot);
      workspace.resetWorkspace();
    });
    event.target.value = "";
  }

  if (!snapshot || !model || !workspace.focusPayload || !workspace.representativeScene) {
    return (
      <div className="v3-shell v3-loading-shell">
        <div className="v3-loading-card">
          <span className="v3-panel-kicker">Semiconductor supply chain</span>
          <h1>Semisupply Flow</h1>
          <p>Loading the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="v3-shell">
      <div className="v3-surface">
        <div className="v3-topbar">
          <section className="v3-brand-panel">
            <span className="v3-panel-kicker">Semiconductor supply chain</span>
            <h1>Semisupply Flow</h1>
          </section>

          <V3SearchOverlay
            query={workspace.query}
            onQueryChange={workspace.setQuery}
            onOpenSearch={() => workspace.setSearchOpen(true)}
            onClearQuery={() => {
              workspace.setQuery("");
              workspace.setSearchOpen(false);
            }}
            searchResults={workspace.searchResults}
            onSelectSearchResult={workspace.selectSearchResult}
          />

          <section className="v3-utility-panel">
            <div className="v3-direction-inline">
              <span className="v3-direction-arrow">{"->"}</span>
              <span>Upstream to downstream</span>
            </div>

            <div className="v3-view-switch" role="tablist" aria-label="View switcher">
              <button
                type="button"
                className={`v3-view-chip ${workspace.viewMode === "system" ? "is-active" : ""}`}
                onClick={() => workspace.setViewMode("system")}
              >
                Structure
              </button>
              <button
                type="button"
                className={`v3-view-chip ${workspace.viewMode === "companies" ? "is-active" : ""}`}
                onClick={() => workspace.setViewMode("companies")}
              >
                Companies
              </button>
            </div>

            <div className="v3-command-row">
              <button
                type="button"
                className="v3-command-button"
                onClick={() => workspace.setDrawerOpen((open) => !open)}
              >
                {workspace.drawerOpen ? "Hide details" : "Details"}
              </button>
              <button type="button" className="v3-command-button" onClick={workspace.resetWorkspace}>
                Reset view
              </button>
              <button type="button" className="v3-command-button" onClick={() => fileInputRef.current?.click()}>
                Open snapshot
              </button>
            </div>
          </section>
        </div>

        <div className="v3-status-dock">
          <div className="v3-status-card">
            <span className="v3-panel-kicker">Focus</span>
            <strong>{workspace.focusPayload.title}</strong>
          </div>
          <div className="v3-status-card v3-status-card-metrics">
            <span>{model.metrics.connectedCompanies} linked companies</span>
            <span>{model.metrics.relationships} cited links</span>
            <span>{model.mapStages.length} categories</span>
          </div>
        </div>

        {workspace.viewMode === "system" ? (
          <V3SystemMap
            model={model}
            selectedStageId={workspace.selectedStageId}
            onSelectStage={workspace.selectStage}
          />
        ) : (
          <V3CompanyMap
            model={model}
            scene={workspace.representativeScene}
            selectedStageId={workspace.selectedStageId}
            selectedCompanyId={workspace.selectedCompanyId}
            onSelectStage={workspace.selectStage}
            onSelectCompany={workspace.selectCompany}
          />
        )}

        <V3Inspector
          isOpen={workspace.drawerOpen}
          payload={workspace.focusPayload}
          viewMode={workspace.viewMode}
          onClose={() => workspace.setDrawerOpen(false)}
          onClearSelection={workspace.clearSelection}
          onSelectCompany={workspace.selectCompany}
          onSelectStage={workspace.selectStage}
          onOpenCompanyView={() => workspace.openCompanyViewForStage(workspace.selectedStageId)}
        />

        <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleSnapshotLoad} />
      </div>
    </div>
  );
}
