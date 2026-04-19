import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { SCENARIOS } from "../config/scenarios";
import { loadBuiltInSnapshot, readSnapshotFile } from "../lib/snapshot";
import V2Drawer from "./components/V2Drawer";
import V2GraphSurface from "./components/V2GraphSurface";
import V2LensDock from "./components/V2LensDock";
import V2SearchOverlay from "./components/V2SearchOverlay";
import { buildV2BundleModel } from "./model/bundleBridge";
import { useWorkspaceState } from "./state/useWorkspaceState";
import "./styles.css";

export default function V2App() {
  const [snapshot, setSnapshot] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const model = useMemo(() => (snapshot ? buildV2BundleModel(snapshot.bundle) : null), [snapshot]);
  const workspace = useWorkspaceState(model);
  const stages = useMemo(
    () => (model ? model.stages.filter((stage) => stage.connectedCompanies.length) : []),
    [model]
  );
  const countries = useMemo(
    () => (model ? model.countries.filter((country) => country.connectedCompanies.length).slice(0, 5) : []),
    [model]
  );
  const ambientSummary = useMemo(() => {
    if (!workspace.focusPayload) {
      return "Start with the graph. Search a company, launch a path, or open a country corridor.";
    }
    return workspace.focusPayload.whyItMatters ?? workspace.focusPayload.summary;
  }, [workspace.focusPayload]);

  useEffect(() => {
    if (workspace.activeLens || workspace.selectedNodeId || workspace.selectedEdgeId) {
      setDrawerOpen(true);
    }
  }, [workspace.activeLens, workspace.selectedNodeId, workspace.selectedEdgeId]);

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

  if (!snapshot || !model || !workspace.scene) {
    return (
      <div className="v2-shell v2-loading">
        <div className="v2-loading-card">
          <span className="v2-drawer-kicker">V2 preview</span>
          <h1>Semisupply Flow</h1>
          <p>Preparing the graph-native workspace slice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-shell">
      <div className="v2-stage">
        <V2GraphSurface
          scene={workspace.scene}
          focusPayload={workspace.focusPayload}
          onSelectNode={workspace.selectNode}
          onSelectEdge={workspace.selectEdge}
          onClearSelection={workspace.clearSelection}
        />

        <div className="v2-topbar">
          <section className="v2-brand-card">
            <span className="v2-hero-kicker">Semiconductor dependency flow workspace</span>
            <h1>Semisupply Flow</h1>
            <p>Trace how companies feed one another across the chain.</p>
          </section>

          <V2SearchOverlay
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

          <section className="v2-status-card">
            <span className="v2-drawer-kicker">Workspace</span>
            <strong>{workspace.focusPayload?.title ?? "Full dependency overview"}</strong>
            <div className="v2-metric-row">
              <span>{model.metrics.connectedCompanies} companies</span>
              <span>{model.metrics.relationships} relationships</span>
              <span>{stages.length} stages</span>
              <span>{workspace.mode}</span>
            </div>
            <span className="v2-status-footnote">
              {snapshot.generatedAt ? new Date(snapshot.generatedAt).toLocaleString() : snapshot.bundleOrigin}
            </span>
          </section>
        </div>

        <V2LensDock
          activeLens={workspace.activeLens}
          scenarios={SCENARIOS}
          stages={stages}
          countries={countries}
          onResetWorkspace={workspace.resetWorkspace}
          onActivateLens={workspace.activateLens}
        />

        <div className="v2-ambient-bar">
          <div className="v2-ambient-copy">
            <span className="v2-drawer-kicker">Current read</span>
            <strong>{workspace.focusPayload?.title ?? "God's-eye company flow"}</strong>
            <span>{ambientSummary}</span>
          </div>
          <div className="v2-legend-row" aria-label="Supply-chain stage legend">
            {stages.map((stage) => (
              <span key={stage.id} className="v2-legend-chip">
                <i style={{ backgroundColor: stage.color }} />
                {stage.shortLabel} {stage.connectedCompanies.length}
              </span>
            ))}
          </div>
        </div>

        <div className="v2-utility-rail">
          <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleSnapshotLoad} />
          <button type="button" className="v2-command-button" onClick={() => setDrawerOpen((open) => !open)}>
            {drawerOpen ? "Hide Info" : "Inspector"}
          </button>
          <button type="button" className="v2-command-button" onClick={() => fileInputRef.current?.click()}>
            Load Snapshot
          </button>
          <button type="button" className="v2-command-button" onClick={workspace.resetWorkspace}>
            Reset
          </button>
          <a className="v2-command-button" href="/">
            V1
          </a>
        </div>

        <V2Drawer
          isOpen={drawerOpen}
          mode={workspace.mode}
          payload={workspace.focusPayload}
          metrics={model.metrics}
          overviewCompanies={model.hubCompanies}
          onSelectNode={workspace.selectNode}
          onSelectEdge={workspace.selectEdge}
          onClearSelection={workspace.clearSelection}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
