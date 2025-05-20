// src/layouts/tables/index.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CircularProgress, Snackbar, IconButton, Tooltip, Grid } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Hooks
import { useSubscriptions } from "./hooks/useSubscriptions";
import { usePendingSubscriptions } from "./hooks/usePendingSubscriptions";
import { useLegacySubscriptions } from "./hooks/useLegacySubscriptions";
// import { useSnackbar } from "./hooks/useSnackbar"; // إذا كنت قد أنشأت hook مخصص

// Components
import TabsManager from "./components/TabsManager";
import SubscriptionFormModal from "./components/SubscriptionFormModal";
import CustomAlert from "./components/common/CustomAlert";
import BulkProcessResultModal from "./components/BulkProcessResultModal";
import SubscriptionsTabContent from "./components/SubscriptionsTabContent";
import PendingTabContent from "./components/PendingTabContent";
import LegacyTabContent from "./components/LegacyTabContent";

// API - تأكد من تحديث هذه الاستيرادات
import {
  getSubscriptionTypes,
  getSubscriptionSources, // قد لا تحتاجها إذا كان المصدر يُدار بشكل مختلف
  addOrRenewSubscriptionAdmin, // اسم محدث
  updateSubscriptionAdmin, // اسم محدث (يفترض وجود نقطة PUT)
  // cancelSubscriptionAdmin سيتم استيرادها واستخدامها داخل SubscriptionsTabContent
} from "services/api";

function Tables() {
  const [activeTab, setActiveTab] = useState(0);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState("add_or_renew"); // "add_or_renew" أو "edit_existing"
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

  // --- Hooks for Tabs ---
  const {
    subscriptions,
    loading: subsLoading,
    error: subsError,
    setError: setSubsError,
    tableQueryOptions: subsQueryOptions,
    setTableQueryOptions: setSubsQueryOptions,
    totalRecords: subsTotalRecords,
    customFilters: subsCustomFilters,
    handleCustomFilterChange: handleSubsCustomFilterChange,
    setSearchTerm: setSubsSearchTerm,
    fetchData: fetchSubscriptionsDataHook, // افترض أن hook useSubscriptions يعرض دالة fetchData
  } = useSubscriptions(showSnackbar, globalSearchTerm);

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
    fetchData: fetchPendingDataHook, // افترض أن hook usePendingSubscriptions يعرض دالة fetchData
  } = usePendingSubscriptions(showSnackbar, globalSearchTerm);

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
  const [availableSources, setAvailableSources] = useState([]); // لا تزال مفيدة إذا كان التعديل يسمح باختيار المصدر

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
    // Update search term for the active tab when global search changes
    if (activeTab === 0) setSubsSearchTerm(globalSearchTerm);
    else if (activeTab === 1) setPendingSearchTerm(globalSearchTerm);
    else if (activeTab === 2) setLegacySearchTerm(globalSearchTerm);
  }, [activeTab, globalSearchTerm, setSubsSearchTerm, setPendingSearchTerm, setLegacySearchTerm]);

  const handleGlobalSearchChange = useCallback(
    (value) => {
      setGlobalSearchTerm(value);
      // Reset page to 1 for the active tab on new search
      if (activeTab === 0) setSubsQueryOptions((prev) => ({ ...prev, page: 1 }));
      else if (activeTab === 1) setPendingQueryOptions((prev) => ({ ...prev, page: 1 }));
      else if (activeTab === 2) setLegacyQueryOptions((prev) => ({ ...prev, page: 1 }));
    },
    [activeTab, setSubsQueryOptions, setPendingQueryOptions, setLegacyQueryOptions]
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefreshData = useCallback(async () => {
    showSnackbar("Refreshing data...", "info");
    try {
      if (activeTab === 0 && fetchSubscriptionsDataHook) {
        await fetchSubscriptionsDataHook(subsQueryOptions, subsCustomFilters, globalSearchTerm);
      } else if (activeTab === 1) {
        if (fetchPendingDataHook)
          await fetchPendingDataHook(pendingQueryOptions, pendingStatusFilter, globalSearchTerm);
        if (fetchPendingStatsHook) await fetchPendingStatsHook();
      } else if (activeTab === 2 && fetchLegacyDataHook) {
        await fetchLegacyDataHook(legacyQueryOptions, legacyProcessedFilter, globalSearchTerm);
      }
    } catch (refreshError) {
      showSnackbar("Error refreshing data: " + (refreshError.message || "Unknown error"), "error");
    }
  }, [
    activeTab,
    globalSearchTerm,
    fetchSubscriptionsDataHook,
    subsQueryOptions,
    subsCustomFilters,
    fetchPendingDataHook,
    pendingQueryOptions,
    pendingStatusFilter,
    fetchPendingStatsHook,
    fetchLegacyDataHook,
    legacyQueryOptions,
    legacyProcessedFilter,
    showSnackbar,
  ]);

  const handleOpenAddOrRenewModal = () => {
    setEditingSubscription(null);
    setFormModalMode("add_or_renew");
    setFormModalOpen(true);
  };

  const handleOpenEditExistingModal = (subscription) => {
    setEditingSubscription(subscription);
    setFormModalMode("edit_existing");
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingSubscription(null);
  };

  const handleFormSubmit = async (formData, mode, subscriptionIdToUpdate) => {
    try {
      if (mode === "edit_existing") {
        // تأكد أن لديك نقطة PUT في الخادم وأنها تتوقع subscriptionId في المسار
        await updateSubscriptionAdmin(subscriptionIdToUpdate, formData);
        showSnackbar("Subscription updated successfully!", "success");
      } else {
        // mode === "add_or_renew"
        await addOrRenewSubscriptionAdmin(formData);
        showSnackbar("Subscription added/renewed successfully!", "success");
      }
      handleCloseModal();
      handleRefreshData(); // أعد جلب البيانات للجدول الحالي
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Error processing form";
      showSnackbar(errorMessage, "error");
    }
  };

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

                {activeTab === 0 && (
                  <SubscriptionsTabContent
                    subscriptions={subscriptions}
                    loading={subsLoading}
                    error={subsError}
                    setError={setSubsError}
                    queryOptions={subsQueryOptions}
                    setQueryOptions={setSubsQueryOptions}
                    totalRecords={subsTotalRecords}
                    customFilters={subsCustomFilters}
                    handleCustomFilterChange={handleSubsCustomFilterChange}
                    subscriptionTypes={subscriptionTypes}
                    availableSources={availableSources}
                    onAddNewOrRenewClick={handleOpenAddOrRenewModal} // اسم محدث
                    onEditExistingClick={handleOpenEditExistingModal} // اسم محدث
                    onDataShouldRefresh={handleRefreshData} // لتحديث البيانات بعد الإلغاء
                    showSnackbar={showSnackbar} // تمرير showSnackbar
                  />
                )}

                {activeTab === 1 && (
                  <PendingTabContent
                    pendingData={pendingData}
                    loading={pendingLoadingState}
                    error={pendingError}
                    setError={setPendingError}
                    queryOptions={pendingQueryOptions}
                    setQueryOptions={setPendingQueryOptions}
                    totalRecords={pendingTotalRecords}
                    statsData={pendingStatsData}
                    statusFilter={pendingStatusFilter}
                    handleStatusFilterChange={handlePendingStatusFilterChange}
                    handleMarkComplete={handlePendingMarkCompleteInternal}
                    bulkProcessingLoading={bulkProcessingLoading}
                    handleBulkProcess={handlePendingBulkProcessInternal}
                  />
                )}

                {activeTab === 2 && (
                  <LegacyTabContent
                    legacyData={legacyData}
                    loading={legacyLoadingState}
                    error={legacyError}
                    setError={setLegacyError}
                    queryOptions={legacyQueryOptions}
                    setQueryOptions={setLegacyQueryOptions}
                    totalRecords={legacyTotalRecords}
                    processedLegacyCount={processedLegacyCount}
                    processedFilter={legacyProcessedFilter}
                    handleProcessedFilterChange={handleLegacyProcessedFilterChange}
                  />
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
          availableSources={(availableSources || []).map((s) => s.value)} // لا تزال مفيدة إذا كان التعديل يسمح باختيار المصدر
          mode={formModalMode}
        />

        <BulkProcessResultModal
          open={bulkResultModalOpen}
          onClose={handleCloseBulkResultModal}
          result={bulkProcessResult}
        />

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
