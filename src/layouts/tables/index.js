// src/layouts/tables/index.js
import React, { useState, useEffect, useCallback, forwardRef, useMemo } from "react";
import {
  Card,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Grid,
  Box, // Kept for Pending Tab toolbar if needed
  Chip as MuiChip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
// import PendingActionsIcon from "@mui/icons-material/PendingActions"; // Not used in the provided code directly
// import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Not used in the provided code directly
// import ListAltIcon from "@mui/icons-material/ListAlt"; // Not used in the provided code directly
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// Icons for Legacy Filter Options are expected to be part of LEGACY_PROCESSED_FILTER_OPTIONS in config

import MuiAlert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// --- DataTable ---
import DataTable from "examples/Tables/DataTable";

// Hooks
import { useSubscriptions } from "./hooks/useSubscriptions";
import { usePendingSubscriptions } from "./hooks/usePendingSubscriptions";
import { useLegacySubscriptions } from "./hooks/useLegacySubscriptions";

// Components
import TabsManager from "./components/TabsManager";
import SubscriptionTableToolbar from "./components/SubscriptionTableToolbar";
import SubscriptionFormModal from "./components/SubscriptionFormModal";

// API
import {
  getSubscriptionTypes,
  getSubscriptionSources,
  addSubscription, // Assuming this is used somewhere, keeping it.
  updateSubscription, // Assuming this is used somewhere, keeping it.
} from "./services/api";

// Configs and Utils
import { BASE_COLUMNS_CONFIG_SUBS } from "./config/subscriptions.config";
import { formatSubStatus, formatSubDate } from "./utils/subscriptions.utils";
import {
  BASE_COLUMNS_CONFIG_PENDING,
  PENDING_STATUS_FILTER_OPTIONS,
} from "./config/pending.config.js";
import { formatPendingStatus, formatPendingDate } from "./utils/pending.utils.js";
import {
  BASE_COLUMNS_CONFIG_LEGACY,
  LEGACY_PROCESSED_FILTER_OPTIONS,
} from "./config/legacy.config.js";
import { formatLegacyProcessedStatus, formatLegacyDate } from "./utils/legacy.utils.js";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const centeredContentStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  py: 4,
  minHeight: "300px",
};

function Tables() {
  const [activeTab, setActiveTab] = useState(0);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --- Subscriptions Tab (Tab 0) ---
  const {
    subscriptions,
    loading: subsLoading,
    error: subsError,
    setError: setSubsError,
    tableQueryOptions: subsQueryOptions,
    setTableQueryOptions: setSubsQueryOptions,
    totalRecords: subsTotalRecords,
    activeSubscriptionsCount: subsActiveCount, // subsActiveCount might not be used if not displayed
    customFilters: subsCustomFilters,
    handleCustomFilterChange: handleSubsCustomFilterChange,
    setSearchTerm: setSubsSearchTerm,
  } = useSubscriptions(showSnackbar, globalSearchTerm);

  // --- Pending Subscriptions Tab (Tab 1) ---
  const {
    pendingData,
    loading: pendingLoadingState,
    error: pendingError,
    setError: setPendingError,
    tableQueryOptions: pendingQueryOptions,
    setTableQueryOptions: setPendingQueryOptions,
    totalRecords: pendingTotalRecords,
    stats: pendingStatsData,
    statusFilter: pendingStatusFilter,
    handleStatusFilterChange: handlePendingStatusFilterChange,
    setSearchTerm: setPendingSearchTerm,
    handleMarkComplete: handlePendingMarkCompleteInternal,
    bulkProcessingLoading,
    bulkProcessResult,
    bulkResultModalOpen,
    handleBulkProcess: handlePendingBulkProcessInternal,
    handleCloseBulkResultModal,
    fetchStats: fetchPendingStatsHook,
  } = usePendingSubscriptions(
    showSnackbar,
    async (searchTerm) => {
      if (activeTab !== 0) {
        setSubsSearchTerm((prev) => prev + " ");
        setSubsSearchTerm(searchTerm);
      }
    }, // This logic might need review based on how global search is intended to work across tabs
    async (filterOverride, searchTerm) => {
      /* For legacy count refresh - now handled by legacy hook */
    }
  );

  // --- Legacy Subscriptions Tab (Tab 2) ---
  const {
    legacyData,
    loading: legacyLoadingState,
    error: legacyError,
    setError: setLegacyError,
    tableQueryOptions: legacyQueryOptions,
    setTableQueryOptions: setLegacyQueryOptions,
    totalRecords: legacyTotalRecords,
    processedLegacyCount,
    processedFilter: legacyProcessedFilter,
    handleProcessedFilterChange: handleLegacyProcessedFilterChange,
    setSearchTerm: setLegacySearchTerm,
    fetchData: fetchLegacyDataHook,
  } = useLegacySubscriptions(showSnackbar, globalSearchTerm);

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    const fetchInitialDropdownData = async () => {
      try {
        const typesData = await getSubscriptionTypes();
        setSubscriptionTypes(typesData || []);
        const sourcesData = await getSubscriptionSources();
        const formattedSources = (sourcesData || []).map((s) => ({
          value: typeof s === "string" ? s : s.name,
          label: typeof s === "string" ? s : s.name,
        }));
        setAvailableSources(formattedSources);
      } catch (err) {
        showSnackbar("Error fetching dropdown data: " + (err.message || "Unknown error"), "error");
      }
    };
    fetchInitialDropdownData();
  }, [showSnackbar]);

  useEffect(() => {
    if (activeTab === 0) {
      setSubsSearchTerm(globalSearchTerm);
    } else if (activeTab === 1) {
      setPendingSearchTerm(globalSearchTerm);
    } else if (activeTab === 2) {
      setLegacySearchTerm(globalSearchTerm);
    }
  }, [activeTab, globalSearchTerm, setSubsSearchTerm, setPendingSearchTerm, setLegacySearchTerm]);

  const handleGlobalSearchChange = useCallback(
    (value) => {
      setGlobalSearchTerm(value);
      // Reset to page 1 for the currently active tab when global search changes
      if (activeTab === 0) {
        setSubsQueryOptions((prev) => ({ ...prev, page: 1 }));
      } else if (activeTab === 1) {
        setPendingQueryOptions((prev) => ({ ...prev, page: 1 }));
      } else if (activeTab === 2) {
        setLegacyQueryOptions((prev) => ({ ...prev, page: 1 }));
      }
    },
    [activeTab, setSubsQueryOptions, setPendingQueryOptions, setLegacyQueryOptions]
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Optionally, reset global search term when changing tabs if desired
    // setGlobalSearchTerm("");
  };

  const handleRefreshData = useCallback(async () => {
    showSnackbar("Refreshing data...", "info");
    if (activeTab === 0) {
      // Trigger re-fetch in useSubscriptions hook
      setSubsSearchTerm((prev) => prev + " ");
      setSubsSearchTerm(globalSearchTerm);
    } else if (activeTab === 1) {
      // Trigger re-fetch in usePendingSubscriptions hook and stats
      setPendingSearchTerm((prev) => prev + " ");
      setPendingSearchTerm(globalSearchTerm);
      if (fetchPendingStatsHook) await fetchPendingStatsHook();
    } else if (activeTab === 2) {
      if (fetchLegacyDataHook) {
        await fetchLegacyDataHook(legacyQueryOptions, legacyProcessedFilter, globalSearchTerm);
      } else {
        // Fallback: Trigger re-fetch in useLegacySubscriptions hook if fetchData isn't exposed or for a simpler refresh
        setLegacySearchTerm((prev) => prev + " ");
        setLegacySearchTerm(globalSearchTerm);
      }
    }
  }, [
    activeTab,
    globalSearchTerm,
    setSubsSearchTerm,
    setPendingSearchTerm,
    fetchPendingStatsHook,
    setLegacySearchTerm,
    fetchLegacyDataHook,
    legacyQueryOptions,
    legacyProcessedFilter, // Added dependencies from legacy hook
    showSnackbar,
  ]);

  const handleAddNewClick = () => {
    setEditingSubscription(null);
    setFormModalOpen(true);
  };

  const handleEditSubscriptionClick = (subscription) => {
    setEditingSubscription(subscription);
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingSubscription(null);
  };

  const handleFormSubmit = async (formData) => {
    const isEditMode = !!editingSubscription;
    try {
      if (isEditMode) {
        await updateSubscription(editingSubscription.id, formData);
        showSnackbar("Subscription updated successfully!", "success");
      } else {
        await addSubscription(formData);
        showSnackbar("Subscription added successfully!", "success");
      }
      handleCloseModal();
      // Trigger refetch for all potentially affected tabs
      // A common pattern is to slightly change the search term to force a refetch if the hook depends on it.
      setSubsSearchTerm((prev) => prev + "_");
      setSubsSearchTerm(globalSearchTerm);
      setPendingSearchTerm((prev) => prev + "_");
      setPendingSearchTerm(globalSearchTerm); // New subs might appear as pending
      if (fetchPendingStatsHook) await fetchPendingStatsHook(); // Refresh pending stats

      if (fetchLegacyDataHook) {
        // Refresh legacy data
        await fetchLegacyDataHook(legacyQueryOptions, legacyProcessedFilter, globalSearchTerm);
      } else {
        setLegacySearchTerm((prev) => prev + "_");
        setLegacySearchTerm(globalSearchTerm);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Error processing form";
      showSnackbar(errorMessage, "error");
    }
  };

  // --- DataTable Columns for Subscriptions Tab ---
  const subsDataTableColumns = useMemo(() => {
    const actionColumn = {
      Header: "ACTIONS",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      Cell: ({ row }) => (
        <Tooltip title="Edit Subscription">
          <IconButton
            size="small"
            onClick={() => handleEditSubscriptionClick(row.original)}
            color="info"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    };
    const formattedBase = BASE_COLUMNS_CONFIG_SUBS.map((col) => {
      if (col.accessor === "is_active")
        return { ...col, Cell: ({ value }) => formatSubStatus(value) };
      if (col.accessor === "expiry_date" || col.accessor === "start_date")
        return { ...col, Cell: ({ value }) => formatSubDate(value) };
      return col;
    });
    return [...formattedBase, actionColumn];
  }, []); // handleEditSubscriptionClick is stable due to useCallback or if defined outside component

  const subsPageCount = Math.ceil(subsTotalRecords / (subsQueryOptions.pageSize || 20));

  // --- DataTable Columns for Pending Subscriptions Tab ---
  const pendingDataTableColumns = useMemo(() => {
    const actionColumn = {
      Header: "ACTION",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      Cell: ({ row }) => {
        if (row.original.status === "pending") {
          return (
            <Tooltip title="Mark as Complete">
              <MDButton
                variant="gradient"
                color="success"
                size="small"
                onClick={() => handlePendingMarkCompleteInternal(row.original.id)}
                startIcon={<CheckCircleOutlineIcon />}
              >
                Complete
              </MDButton>
            </Tooltip>
          );
        }
        return (
          <MDTypography
            variant="caption"
            color={row.original.status === "complete" ? "success.main" : "text.secondary"}
            fontWeight="medium"
            sx={{ textTransform: "capitalize" }}
          >
            {row.original.status === "complete" ? "Completed" : row.original.status}
            {row.original.admin_reviewed_at &&
              (row.original.status === "complete" ||
                row.original.status === "approved" ||
                row.original.status === "rejected") && (
                <Tooltip
                  title={`Reviewed: ${formatPendingDate(row.original.admin_reviewed_at, true)}`}
                >
                  <MDTypography
                    variant="caption"
                    component="div"
                    sx={{ fontSize: "0.7rem", color: "text.disabled" }}
                  >
                    {formatPendingDate(row.original.admin_reviewed_at)}
                  </MDTypography>
                </Tooltip>
              )}
          </MDTypography>
        );
      },
    };
    const formattedBase = BASE_COLUMNS_CONFIG_PENDING.map((col) => {
      if (col.accessor === "status")
        return { ...col, Cell: ({ value }) => formatPendingStatus(value) };
      if (col.accessor === "found_at")
        return { ...col, Cell: ({ value }) => formatPendingDate(value, true) };
      return col;
    });
    return [...formattedBase, actionColumn];
  }, [handlePendingMarkCompleteInternal]);

  const pendingPageCount = Math.ceil(pendingTotalRecords / (pendingQueryOptions.pageSize || 20));

  // --- DataTable Columns for Legacy Subscriptions Tab ---
  const legacyDataTableColumns = useMemo(() => {
    return BASE_COLUMNS_CONFIG_LEGACY.map((col) => {
      if (col.accessor === "processed") {
        return { ...col, Cell: ({ value }) => formatLegacyProcessedStatus(value) };
      }
      if (col.accessor === "expiry_date" || col.accessor === "created_at") {
        return { ...col, Cell: ({ value }) => formatLegacyDate(value) };
      }
      return col;
    });
    // No actions column by default for legacy, add if needed
  }, []);

  const legacyPageCount = Math.ceil(legacyTotalRecords / (legacyQueryOptions.pageSize || 20));

  // --- Loading States ---
  const isAnyLoading = useMemo(
    () => subsLoading || pendingLoadingState || legacyLoadingState,
    [subsLoading, pendingLoadingState, legacyLoadingState]
  );
  const currentTabSpinnerOnRefresh = useMemo(() => {
    if (activeTab === 0) return subsLoading && subscriptions.length > 0;
    if (activeTab === 1) return pendingLoadingState && pendingData.length > 0;
    if (activeTab === 2) return legacyLoadingState && legacyData.length > 0;
    return false;
  }, [
    activeTab,
    subsLoading,
    subscriptions,
    pendingLoadingState,
    pendingData,
    legacyLoadingState,
    legacyData,
  ]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardLayout>
        <DashboardNavbar onSearchChange={handleGlobalSearchChange} />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <MDTypography variant="h6" color="white">
                    Subscriptions Management
                  </MDTypography>
                </MDBox>

                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  px={2}
                  py={1}
                  flexWrap="wrap"
                  sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
                >
                  <TabsManager
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    pendingCount={pendingStatsData?.pending || 0}
                    legacyCount={legacyTotalRecords || 0}
                  />
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={handleRefreshData}
                      color="info"
                      disabled={isAnyLoading}
                      sx={{ ml: "auto" }}
                    >
                      {currentTabSpinnerOnRefresh ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </MDBox>

                {/* ================= Tab Content ================= */}
                {activeTab === 0 && (
                  <>
                    <SubscriptionTableToolbar
                      onFilterChange={(newFilters) => handleSubsCustomFilterChange(newFilters)}
                      filters={subsCustomFilters}
                      subscriptionTypes={(subscriptionTypes || []).map((st) => ({
                        value: st.id,
                        label: st.name,
                      }))}
                      onAddNewClick={handleAddNewClick} // This prop might be redundant if button is in header
                      availableSources={availableSources}
                    />
                    {subsError && !subsLoading && (
                      <MDBox px={3} py={1}>
                        <MuiAlert
                          severity="error"
                          onClose={() => setSubsError(null)}
                          sx={{ width: "100%" }}
                        >
                          {subsError}
                        </MuiAlert>
                      </MDBox>
                    )}
                    <MDBox pt={1} sx={{ position: "relative" }}>
                      {subsLoading && subscriptions.length === 0 && (
                        <MDBox sx={centeredContentStyle}>
                          <CircularProgress color="info" />
                        </MDBox>
                      )}
                      {(!subsLoading && subscriptions.length > 0) ||
                      (subsLoading && subscriptions.length > 0) ? (
                        <DataTable
                          table={{ columns: subsDataTableColumns, rows: subscriptions }}
                          isSorted={false}
                          entriesPerPage={{
                            defaultValue: subsQueryOptions.pageSize,
                            options: [10, 20, 50, 100],
                          }}
                          showTotalEntries={subsTotalRecords > 0}
                          noEndBorder
                          canSearch={false}
                          pagination={{ variant: "gradient", color: "info" }}
                          manualPagination
                          pageCount={subsPageCount > 0 ? subsPageCount : 1}
                          page={subsQueryOptions.page - 1}
                          onPageChange={(newPage) => setSubsQueryOptions({ page: newPage + 1 })}
                          onEntriesPerPageChange={(newPageSize) =>
                            setSubsQueryOptions({ pageSize: newPageSize, page: 1 })
                          }
                          sx={subsLoading && subscriptions.length > 0 ? { opacity: 0.7 } : {}}
                        />
                      ) : (
                        !subsLoading &&
                        subscriptions.length === 0 && (
                          <MDBox sx={centeredContentStyle}>
                            <MDTypography variant="h6" color="textSecondary">
                              No subscriptions found.
                            </MDTypography>
                          </MDBox>
                        )
                      )}
                    </MDBox>
                  </>
                )}

                {activeTab === 1 && (
                  <>
                    <MDBox
                      p={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={2}
                      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
                    >
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mr: 1 }}>
                          Status:
                        </MDTypography>
                        {PENDING_STATUS_FILTER_OPTIONS.map((opt) => {
                          const count =
                            opt.value === "all"
                              ? pendingStatsData.total_all
                              : pendingStatsData[opt.value];
                          const IconComponent = opt.icon; // Assuming opt.icon is the component
                          return (
                            <MuiChip
                              key={opt.value}
                              label={`${opt.label} (${count || 0})`}
                              icon={IconComponent ? <IconComponent fontSize="small" /> : null}
                              clickable
                              color={pendingStatusFilter === opt.value ? "primary" : "default"}
                              onClick={() => handlePendingStatusFilterChange(opt.value)}
                              variant={pendingStatusFilter === opt.value ? "filled" : "outlined"}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={handlePendingBulkProcessInternal}
                        disabled={
                          bulkProcessingLoading ||
                          pendingLoadingState ||
                          pendingStatusFilter !== "pending"
                        }
                        startIcon={
                          bulkProcessingLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <PlaylistPlayIcon />
                          )
                        }
                        sx={{ ml: { xs: 0, sm: "auto" }, mt: { xs: 1, sm: 0 } }}
                      >
                        {bulkProcessingLoading ? "Processing All..." : "Process All Pending"}
                      </MDButton>
                    </MDBox>
                    {pendingError && !pendingLoadingState && (
                      <MDBox px={3} py={1}>
                        <MuiAlert
                          severity="error"
                          onClose={() => setPendingError(null)}
                          sx={{ width: "100%" }}
                        >
                          {pendingError}
                        </MuiAlert>
                      </MDBox>
                    )}
                    <MDBox pt={1} sx={{ position: "relative" }}>
                      {pendingLoadingState && pendingData.length === 0 && (
                        <MDBox sx={centeredContentStyle}>
                          <CircularProgress color="info" />
                        </MDBox>
                      )}
                      {(!pendingLoadingState && pendingData.length > 0) ||
                      (pendingLoadingState && pendingData.length > 0) ? (
                        <DataTable
                          table={{ columns: pendingDataTableColumns, rows: pendingData }}
                          isSorted={false}
                          entriesPerPage={{
                            defaultValue: pendingQueryOptions.pageSize,
                            options: [10, 20, 50, 100],
                          }}
                          showTotalEntries={pendingTotalRecords > 0}
                          noEndBorder
                          canSearch={false}
                          pagination={{ variant: "gradient", color: "info" }}
                          manualPagination
                          pageCount={pendingPageCount > 0 ? pendingPageCount : 1}
                          page={pendingQueryOptions.page - 1}
                          onPageChange={(newPage) => setPendingQueryOptions({ page: newPage + 1 })}
                          onEntriesPerPageChange={(newPageSize) =>
                            setPendingQueryOptions({ pageSize: newPageSize, page: 1 })
                          }
                          sx={pendingLoadingState && pendingData.length > 0 ? { opacity: 0.7 } : {}}
                        />
                      ) : (
                        !pendingLoadingState &&
                        pendingData.length === 0 && (
                          <MDBox sx={centeredContentStyle}>
                            <MDTypography variant="h6" color="textSecondary">
                              No pending subscriptions found.
                            </MDTypography>
                          </MDBox>
                        )
                      )}
                    </MDBox>
                  </>
                )}

                {activeTab === 2 && (
                  <>
                    {/* Toolbar for Legacy Tab (Processed Filter Chips) */}
                    <MDBox
                      p={2}
                      display="flex"
                      justifyContent="flex-start"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1.5}
                      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
                    >
                      <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mr: 1 }}>
                        Status:
                      </MDTypography>
                      {LEGACY_PROCESSED_FILTER_OPTIONS.map((opt) => {
                        let count = 0;
                        if (opt.value === null) count = legacyTotalRecords; // 'All'
                        else if (opt.value === true) count = processedLegacyCount; // 'Processed'
                        else if (opt.value === false)
                          count = legacyTotalRecords - processedLegacyCount; // 'Not Processed'
                        const IconComponent = opt.icon; // Get the component itself from config

                        return (
                          <MuiChip
                            key={String(opt.value)} // Use String for boolean key
                            label={`${opt.label} (${count < 0 ? 0 : count})`} // Ensure count is not negative
                            icon={IconComponent ? <IconComponent fontSize="small" /> : null}
                            clickable
                            color={legacyProcessedFilter === opt.value ? "primary" : "default"}
                            onClick={() => handleLegacyProcessedFilterChange(opt.value)}
                            variant={legacyProcessedFilter === opt.value ? "filled" : "outlined"}
                            size="small"
                          />
                        );
                      })}
                    </MDBox>
                    {legacyError && !legacyLoadingState && (
                      <MDBox px={3} py={1}>
                        <MuiAlert
                          severity="error"
                          onClose={() => setLegacyError(null)}
                          sx={{ width: "100%" }}
                        >
                          {legacyError}
                        </MuiAlert>
                      </MDBox>
                    )}
                    <MDBox pt={1} sx={{ position: "relative" }}>
                      {legacyLoadingState && legacyData.length === 0 && (
                        <MDBox sx={centeredContentStyle}>
                          <CircularProgress color="info" />
                        </MDBox>
                      )}
                      {(!legacyLoadingState && legacyData.length > 0) ||
                      (legacyLoadingState && legacyData.length > 0) ? (
                        <DataTable
                          table={{ columns: legacyDataTableColumns, rows: legacyData }}
                          isSorted={false} // Legacy data might not support sorting via API easily
                          entriesPerPage={{
                            defaultValue: legacyQueryOptions.pageSize,
                            options: [10, 20, 50, 100],
                          }}
                          showTotalEntries={legacyTotalRecords > 0}
                          noEndBorder
                          canSearch={false} // Global search handled by DashboardNavbar
                          pagination={{ variant: "gradient", color: "info" }}
                          manualPagination
                          pageCount={legacyPageCount > 0 ? legacyPageCount : 1}
                          page={legacyQueryOptions.page - 1} // DataTable is 0-indexed
                          onPageChange={(newPage) => setLegacyQueryOptions({ page: newPage + 1 })}
                          onEntriesPerPageChange={(newPageSize) =>
                            setLegacyQueryOptions({ pageSize: newPageSize, page: 1 })
                          }
                          sx={legacyLoadingState && legacyData.length > 0 ? { opacity: 0.7 } : {}}
                        />
                      ) : (
                        !legacyLoadingState &&
                        legacyData.length === 0 && (
                          <MDBox sx={centeredContentStyle}>
                            <MDTypography variant="h6" color="textSecondary">
                              No legacy subscriptions found.
                            </MDTypography>
                          </MDBox>
                        )
                      )}
                    </MDBox>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <SubscriptionFormModal
          open={formModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          initialValues={editingSubscription}
          subscriptionTypes={subscriptionTypes}
          availableSources={(availableSources || []).map((s) => s.value)}
          isEdit={!!editingSubscription}
        />

        {bulkResultModalOpen && bulkProcessResult && (
          <Dialog
            open={bulkResultModalOpen}
            onClose={handleCloseBulkResultModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {bulkProcessResult.error ? "Bulk Processing Error" : "Bulk Processing Result"}
            </DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
                {bulkProcessResult.message ||
                  (bulkProcessResult.error ? "An error occurred." : "Processing complete.")}
              </Typography>
              {bulkProcessResult.details && (
                <MDBox mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Details:
                  </Typography>
                  <MDTypography variant="body2">
                    Total Candidates: {bulkProcessResult.details.total_candidates ?? "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2" color="success.main">
                    Successfully Updated: {bulkProcessResult.details.successful_updates ?? "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2" color="error.main">
                    Failures (Bot/DB): {bulkProcessResult.details.failed_bot_or_db_updates ?? "N/A"}
                  </MDTypography>
                  {bulkProcessResult.details.failures_log &&
                    bulkProcessResult.details.failures_log.length > 0 && (
                      <MDBox
                        mt={2}
                        sx={{
                          maxHeight: 300,
                          overflowY: "auto",
                          border: "1px solid lightgray",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle2">Failure Log:</Typography>
                        <List dense>
                          {bulkProcessResult.details.failures_log.map((failure, index) => (
                            <ListItem
                              key={index}
                              disableGutters
                              sx={{ borderBottom: "1px dashed #eee", pb: 0.5, mb: 0.5 }}
                            >
                              <ListItemText
                                primaryTypographyProps={{ variant: "caption" }}
                                secondaryTypographyProps={{ variant: "caption", color: "error" }}
                                primary={`Sub ID: ${failure.sub_id} (User: ${failure.telegram_id})`}
                                secondary={`Error: ${failure.error}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </MDBox>
                    )}
                </MDBox>
              )}
              {bulkProcessResult.error && !bulkProcessResult.details && (
                <MDTypography variant="body2" color="error.main">
                  {bulkProcessResult.error}
                </MDTypography>
              )}
            </DialogContent>
            <DialogActions>
              <MuiButton onClick={handleCloseBulkResultModal} color="primary">
                Close
              </MuiButton>
            </DialogActions>
          </Dialog>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <CustomAlert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </CustomAlert>
        </Snackbar>
        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

export default Tables;
