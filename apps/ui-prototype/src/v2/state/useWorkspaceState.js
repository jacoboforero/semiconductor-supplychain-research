import { useDeferredValue, useMemo, useState } from "react";
import {
  findV2SearchMatches,
  getV2Edge,
  getV2FocusPayload,
  getV2LensPayload,
  getV2Node,
} from "../model/bundleBridge";
import { buildV2Scene, resolveV2Mode } from "../model/scene";

export function useWorkspaceState(model) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeLens, setActiveLens] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const deferredQuery = useDeferredValue(query);

  const searchResults = useMemo(
    () => (model && searchOpen ? findV2SearchMatches(model, deferredQuery) : []),
    [model, searchOpen, deferredQuery]
  );
  const scene = useMemo(
    () => (model ? buildV2Scene(model, { activeLens, selectedNodeId, selectedEdgeId }) : null),
    [model, activeLens, selectedNodeId, selectedEdgeId]
  );
  const focusPayload = useMemo(
    () => getV2FocusPayload(model, activeLens, selectedNodeId, selectedEdgeId),
    [model, activeLens, selectedNodeId, selectedEdgeId]
  );
  const mode = resolveV2Mode({ activeLens, selectedNodeId, selectedEdgeId });

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
    const node = getV2Node(model, nodeId);
    if (!node) {
      return;
    }
    const currentLens = getV2LensPayload(model, activeLens);
    if (currentLens && !currentLens.relatedIds.has(nodeId)) {
      setActiveLens(null);
    }
    setSelectedEdgeId(null);
    setSelectedNodeId(nodeId);
    setSearchOpen(false);
  }

  function selectEdge(edgeId) {
    const edge = getV2Edge(model, edgeId);
    if (!edge) {
      return;
    }
    const currentLens = getV2LensPayload(model, activeLens);
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

  function clearSelection() {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }

  function selectSearchResult(result) {
    setQuery(result.label);
    setSearchOpen(false);
    selectNode(result.id);
  }

  return {
    query,
    setQuery,
    searchOpen,
    setSearchOpen,
    activeLens,
    selectedNodeId,
    selectedEdgeId,
    searchResults,
    scene,
    focusPayload,
    mode,
    resetWorkspace,
    activateLens,
    selectNode,
    selectEdge,
    clearSelection,
    selectSearchResult,
  };
}
