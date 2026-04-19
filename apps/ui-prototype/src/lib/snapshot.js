import { normalizeBundle } from "./bundle";

export function normalizeSnapshotMetadata(bundleOrigin, bundle) {
  return {
    bundleOrigin,
    generatedAt: bundle.generated_at ?? null,
  };
}

export async function loadBuiltInSnapshot() {
  const response = await fetch("/demo/ui_bundle.json");
  const payload = normalizeBundle(await response.json());
  return {
    bundle: payload,
    ...normalizeSnapshotMetadata("Built-in demo snapshot", payload),
  };
}

export async function readSnapshotFile(file) {
  const text = await file.text();
  const payload = normalizeBundle(JSON.parse(text));
  return {
    bundle: payload,
    ...normalizeSnapshotMetadata(file.name, payload),
  };
}
