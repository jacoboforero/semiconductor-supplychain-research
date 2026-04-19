import {
  buildBundleModel,
  findSearchMatches,
  getEdge,
  getEdgePayload,
  getLensPayload,
  getNode,
  getNodePayload,
} from "../../lib/bundle";

export function buildV2BundleModel(bundle) {
  return buildBundleModel(bundle);
}

export function findV2SearchMatches(model, query, limit) {
  return findSearchMatches(model, query, limit);
}

export function getV2Node(model, nodeId) {
  return getNode(model, nodeId);
}

export function getV2Edge(model, edgeId) {
  return getEdge(model, edgeId);
}

export function getV2FocusPayload(model, activeLens, selectedNodeId, selectedEdgeId) {
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
}

export function getV2LensPayload(model, activeLens) {
  return getLensPayload(model, activeLens);
}
