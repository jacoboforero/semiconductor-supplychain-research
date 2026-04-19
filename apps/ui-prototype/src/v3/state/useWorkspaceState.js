import { useDeferredValue, useMemo, useState } from "react";
import { findSearchMatches } from "../../lib/bundle";
import {
  buildRepresentativeScene,
  buildV3CompanyPayload,
  buildV3OverviewPayload,
  buildV3StagePayload,
  getV3StageIdForCompany,
} from "../model/system";

export function useV3WorkspaceState(model) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState("system");
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const searchResults = useMemo(
    () => (model && searchOpen ? findSearchMatches(model, deferredQuery, 8) : []),
    [model, searchOpen, deferredQuery]
  );

  const representativeScene = useMemo(
    () =>
      model
        ? buildRepresentativeScene(model, {
            selectedStageId,
            selectedCompanyId,
          })
        : null,
    [model, selectedStageId, selectedCompanyId]
  );

  const focusPayload = useMemo(() => {
    if (!model) {
      return null;
    }
    if (selectedCompanyId) {
      return buildV3CompanyPayload(model, selectedCompanyId);
    }
    if (selectedStageId) {
      return buildV3StagePayload(model, selectedStageId);
    }
    return buildV3OverviewPayload(model);
  }, [model, selectedCompanyId, selectedStageId]);

  function resetWorkspace() {
    setQuery("");
    setSearchOpen(false);
    setViewMode("system");
    setSelectedStageId(null);
    setSelectedCompanyId(null);
    setDrawerOpen(false);
  }

  function selectStage(stageId) {
    if (!stageId || !model?.mapStageById.has(stageId)) {
      return;
    }
    setSelectedStageId(stageId);
    setSelectedCompanyId(null);
    setDrawerOpen(true);
  }

  function selectCompany(companyId) {
    const company = model?.companyById.get(companyId);
    if (!company) {
      return;
    }
    setSelectedCompanyId(companyId);
    setSelectedStageId(getV3StageIdForCompany(company));
    setViewMode("companies");
    setSearchOpen(false);
    setDrawerOpen(true);
  }

  function clearSelection() {
    setSelectedCompanyId(null);
    setSelectedStageId(null);
  }

  function selectSearchResult(result) {
    setQuery(result.label);
    selectCompany(result.id);
  }

  function openCompanyViewForStage(stageId) {
    if (stageId) {
      setSelectedStageId(stageId);
    }
    setViewMode("companies");
    setDrawerOpen(true);
  }

  return {
    query,
    setQuery,
    searchOpen,
    setSearchOpen,
    searchResults,
    viewMode,
    setViewMode,
    selectedStageId,
    selectedCompanyId,
    drawerOpen,
    setDrawerOpen,
    representativeScene,
    focusPayload,
    resetWorkspace,
    selectStage,
    selectCompany,
    clearSelection,
    selectSearchResult,
    openCompanyViewForStage,
  };
}
