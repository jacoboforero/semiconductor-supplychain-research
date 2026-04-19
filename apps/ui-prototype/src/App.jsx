import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import DetailPanel from "./components/DetailPanel";
import GraphCanvas from "./components/GraphCanvas";
import LeftRail from "./components/LeftRail";
import TopBar from "./components/TopBar";
import { buildBundleModel, findSearchMatches, getEdge, getEdgePayload, getLensPayload, getNode, getNodePayload } from "./lib/bundle";
import { buildGraphScene } from "./lib/graph";
import { loadBuiltInSnapshot, readSnapshotFile } from "./lib/snapshot";

export default function App() {
  const [snapshot, setSnapshot] = useState(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeLens, setActiveLens] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const builtInSnapshot = await loadBuiltInSnapshot();
      if (cancelled) {
        return;
      }
      setSnapshot(builtInSnapshot);
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(() => (snapshot ? buildBundleModel(snapshot.bundle) : null), [snapshot]);
  const deferredQuery = useDeferredValue(query);
  const searchResults = model && searchOpen ? findSearchMatches(model, deferredQuery) : [];
  const scene = useMemo(
    () => (model ? buildGraphScene(model, activeLens, selectedNodeId, selectedEdgeId) : null),
    [model, activeLens, selectedNodeId, selectedEdgeId]
  );
  const focusPayload = useMemo(() => {
    if (!model) {
      return null;
    }
    if (selectedEdgeId) {
      return getEdgePayload(model, selectedEdgeId);
    }
    if (selectedNodeId) {
      return getNodePayload(model, selectedNodeId);
    }
    return getLensPayload(model, activeLens);
  }, [model, activeLens, selectedNodeId, selectedEdgeId]);

  if (!snapshot || !model || !scene) {
    return (
      <div className="app-shell loading-shell">
        <div className="loading-card">
          <span className="panel-kicker">Loading snapshot</span>
          <h1>Semisupply Flow</h1>
          <p>Preparing the built-in dependency snapshot.</p>
        </div>
      </div>
    );
  }

  function resetWorkspace() {
    setQuery("");
    setSearchOpen(false);
    setActiveLens(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }

  function activateLens(lens) {
    if (!lens?.id) {
      return;
    }
    setActiveLens(lens);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSearchOpen(false);
  }

  function selectNode(nodeId) {
    const node = getNode(model, nodeId);
    if (!node) {
      return;
    }
    const currentLens = getLensPayload(model, activeLens);
    if (currentLens && !currentLens.relatedIds.has(nodeId)) {
      setActiveLens(null);
    }
    setSelectedEdgeId(null);
    setSelectedNodeId(nodeId);
    setSearchOpen(false);
  }

  function selectEdge(edgeId) {
    const edge = getEdge(model, edgeId);
    if (!edge) {
      return;
    }
    const currentLens = getLensPayload(model, activeLens);
    if (
      currentLens &&
      (!currentLens.relatedIds.has(edge.source.id) || !currentLens.relatedIds.has(edge.target.id))
    ) {
      setActiveLens(null);
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(edgeId);
    setSearchOpen(false);
  }

  function selectSearchResult(result) {
    setQuery(result.label);
    setSearchOpen(false);
    selectNode(result.id);
  }

  async function handleSnapshotLoad(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextSnapshot = await readSnapshotFile(file);

    startTransition(() => {
      setSnapshot(nextSnapshot);
      setQuery("");
      setActiveLens(null);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    });

    event.target.value = "";
  }

  return (
    <div className="app-shell">
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onClearQuery={() => {
          setQuery("");
          setSearchOpen(false);
        }}
        searchResults={searchResults}
        onSelectSearchResult={selectSearchResult}
        onOpenSearch={() => setSearchOpen(true)}
        onResetWorkspace={resetWorkspace}
        onLoadSnapshot={handleSnapshotLoad}
        bundleOrigin={snapshot.bundleOrigin}
        generatedAt={snapshot.generatedAt}
        metrics={model.metrics}
      />

      <main className="workspace">
        <LeftRail
          model={model}
          activeLens={activeLens}
          onActivateLens={activateLens}
          onSelectNode={selectNode}
          onResetWorkspace={resetWorkspace}
        />

        <div className="workspace-main">
          <GraphCanvas
            scene={scene}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onClearSelection={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            onActivateLens={activateLens}
            laneHighlights={model.lanes}
            countryHighlights={model.countries.filter((country) => country.connectedCompanies.length).slice(0, 4)}
            hubHighlights={model.hubCompanies.slice(0, 4)}
            focusLabel={focusPayload?.title ?? "Full dependency flow"}
            focusStrap={focusPayload?.strap ?? "Workspace"}
          />
        </div>

        <DetailPanel
          model={model}
          activeLens={activeLens}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          onActivateLens={activateLens}
          onSelectNode={selectNode}
          onSelectEdge={selectEdge}
          onClearSelection={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
        />
      </main>
    </div>
  );
}
