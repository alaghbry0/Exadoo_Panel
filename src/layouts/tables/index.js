// src/layouts/tables/index.js
import React, { useState, useEffect, useCallback, forwardRef, useMemo } from "react";
import {
  Card,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Grid,
  Box,
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
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";

import MuiAlert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
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

// Components
import TabsManager from "./components/TabsManager";
import SubscriptionTableToolbar from "./components/SubscriptionTableToolbar";
import SubscriptionTable from "./components/SubscriptionTable";
import SubscriptionFormModal from "./components/SubscriptionFormModal";
import PendingSubscriptionsTable from "./components/PendingSubscriptionsTable";
import LegacySubscriptionsTable from "./components/LegacySubscriptionsTable";

// API
import {
  getSubscriptionTypes,
  getSubscriptionSources,
  addSubscription,
  updateSubscription,
} from "./services/api";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Tables() {
  const [activeTab, setActiveTab] = useState(0);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const {
    fetchInitialData: fetchSubsData,
    handleFilterChange: handleSubsFilterChange,
    handleRequestSort: handleSubsRequestSort,
    handleChangeRowsPerPage: handleSubsRowsPerPageChange, // هذا سيمرر إلى SubscriptionTable
    handleLoadMore: handleSubsLoadMore,
    subscriptions,
    loading: subsLoading,
    loadingMore: subsLoadingMore,
    error: subsError,
    setError: setSubsError,
    filters: subsFilters,
    // setFilters: setSubsFilters, // لم يعد يمرر إلى Toolbar، الهوك يستخدمه داخليًا
    order: subsOrder,
    orderBy: subsOrderBy,
    totalSubscriptions: subsTotal,
    rowsPerPage: subsRowsPerPage, // هذا سيمرر إلى SubscriptionTable
    hasMoreData: subsHasMore,
  } = useSubscriptions(showSnackbar);

  const {
    fetchInitialLegacySubscriptions: fetchLegacyData,
    fetchLegacyCountForTabsManager,
    handleLoadMoreLegacy,
    handleLegacyFilterChange: handleLegacyFilterAction,
    handleLegacyRequestSort: handleLegacySortAction,
    legacyInitialData,
    legacyTotalCount,
    legacyLoadingInitial,
    activeLegacyFilter,
    legacyOrder,
    legacyOrderBy,
    legacyCountForTabDisplay,
    ROWS_PER_PAGE_FOR_LOAD_MORE,
  } = useLegacySubscriptions(showSnackbar);

  const pendingHookRefreshSubs = useCallback(
    (searchTerm) => fetchSubsData(searchTerm || globalSearchTerm),
    [fetchSubsData, globalSearchTerm]
  );
  const pendingHookRefreshLegacyCount = useCallback(
    (filterOverride, searchTerm) =>
      fetchLegacyCountForTabsManager(filterOverride, searchTerm || globalSearchTerm),
    [fetchLegacyCountForTabsManager, globalSearchTerm]
  );

  const {
    fetchPendingSubscriptionsData,
    fetchPendingStats,
    setPendingPage,
    handlePendingFilterChange: handlePendingFilterAction,
    handlePendingPageChange: handlePendingPageAction,
    handlePendingRowsPerPageChange: handlePendingRowsPerPageAction,
    handleMarkPendingComplete,
    handleBulkProcessPending,
    handleCloseBulkResultModal,
    pendingSubscriptions,
    pendingPage,
    pendingRowsPerPage,
    pendingTotal,
    pendingLoading,
    pendingStats,
    currentPendingFilter,
    bulkProcessingLoading,
    bulkProcessResult,
    bulkResultModalOpen,
  } = usePendingSubscriptions(
    showSnackbar,
    pendingHookRefreshSubs,
    pendingHookRefreshLegacyCount,
    pendingHookRefreshSubs // كان هناك pendingHookRefreshSubs مرتين، يفترض أن تكون واحدة منهم لشيء آخر أو خطأ مطبعي
  );

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    const fetchInitialDropdownData = async () => {
      try {
        const typesData = await getSubscriptionTypes();
        setSubscriptionTypes(typesData);
        const sourcesData = await getSubscriptionSources();
        setAvailableSources(sourcesData);
      } catch (err) {
        console.error("Error fetching initial dropdown data:", err);
        showSnackbar("Failed to load some initial data for forms", "error");
      }
    };
    fetchInitialDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // showSnackbar أضيفت إلى مصفوفة الاعتماديات إذا كانت ثابتة (مع useCallback)

  const handleGlobalSearchChange = useCallback(
    (value) => {
      setGlobalSearchTerm(value);
      if (activeTab === 1) {
        setPendingPage(0); // إعادة تعيين الصفحة عند البحث في Pending
      }
      // ملاحظة: useEffect التالي سيعيد جلب البيانات تلقائيًا عند تغيير globalSearchTerm
    },
    [activeTab, setPendingPage]
  );

  useEffect(() => {
    // console.log(`Fetching data for tab: ${activeTab}, search: "${globalSearchTerm}"`);
    if (activeTab === 0) {
      fetchSubsData(globalSearchTerm);
    } else if (activeTab === 1) {
      fetchPendingSubscriptionsData(globalSearchTerm); // جلب بيانات Pending
      fetchPendingStats(); // جلب إحصائيات Pending
    } else if (activeTab === 2) {
      fetchLegacyData(globalSearchTerm);
    }
  }, [
    activeTab,
    globalSearchTerm,
    fetchSubsData,
    fetchPendingSubscriptionsData,
    fetchPendingStats,
    fetchLegacyData,
  ]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // إذا انتقلنا إلى Pending tab
      setPendingPage(0); // إعادة تعيين الصفحة إلى الأولى
    }
    // ملاحظة: useEffect أعلاه سيتولى جلب البيانات للتاب الجديد
  };

  const handleRefreshDataOptimized = useCallback(async () => {
    showSnackbar("Refreshing data...", "info");
    try {
      if (activeTab === 0) {
        await fetchSubsData(globalSearchTerm);
      } else if (activeTab === 1) {
        await Promise.all([fetchPendingStats(), fetchPendingSubscriptionsData(globalSearchTerm)]);
      } else if (activeTab === 2) {
        await fetchLegacyData(globalSearchTerm);
      }
      showSnackbar("Data refreshed!", "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showSnackbar("Failed to refresh data.", "error");
    }
  }, [
    activeTab,
    globalSearchTerm,
    fetchSubsData,
    fetchPendingStats,
    fetchPendingSubscriptionsData,
    fetchLegacyData,
    showSnackbar,
  ]);

  const handleAddNewClick = () => {
    setSelectedSubscription(null);
    setFormModalOpen(true);
  };
  const handleEditClick = (subscription) => {
    setSelectedSubscription(subscription);
    setFormModalOpen(true);
  };
  const handleCloseModal = () => {
    setFormModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleFormSubmit = async (formData) => {
    const isEditMode = !!selectedSubscription;
    try {
      if (isEditMode) {
        await updateSubscription(selectedSubscription.id, formData);
        showSnackbar("Subscription updated successfully!", "success");
      } else {
        await addSubscription(formData);
        showSnackbar("Subscription added successfully!", "success");
      }
      handleCloseModal();
      // إعادة جلب البيانات لجميع التابات لضمان التحديث
      await fetchSubsData(globalSearchTerm);
      await fetchPendingStats();
      await fetchPendingSubscriptionsData(globalSearchTerm);
      await fetchLegacyData(globalSearchTerm);
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Error processing form";
      showSnackbar(errorMessage, "error");
    }
  };

  const isAnyLoading = useMemo(
    () =>
      subsLoading ||
      subsLoadingMore ||
      pendingLoading ||
      bulkProcessingLoading ||
      legacyLoadingInitial,
    [subsLoading, subsLoadingMore, pendingLoading, bulkProcessingLoading, legacyLoadingInitial]
  );

  const currentTabLoading = useMemo(
    () =>
      (activeTab === 0 && (subsLoading || subsLoadingMore)) ||
      (activeTab === 1 && (pendingLoading || bulkProcessingLoading)) ||
      (activeTab === 2 && legacyLoadingInitial),
    [
      activeTab,
      subsLoading,
      subsLoadingMore,
      pendingLoading,
      bulkProcessingLoading,
      legacyLoadingInitial,
    ]
  );

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
                >
                  <TabsManager
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    pendingCount={pendingStats.pending}
                    legacyCount={legacyCountForTabDisplay}
                  />
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={handleRefreshDataOptimized}
                      color="info"
                      disabled={isAnyLoading}
                      sx={{ ml: "auto" }}
                    >
                      {currentTabLoading ? (
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
                      onFilterChange={(newFilters) =>
                        handleSubsFilterChange(newFilters, globalSearchTerm)
                      }
                      filters={subsFilters} // تمرير الفلاتر الحالية
                      // setFilters prop removed as it's not needed by Toolbar
                      subscriptionTypes={subscriptionTypes}
                      onAddNewClick={handleAddNewClick}
                      availableSources={availableSources}
                      // rowsPerPage and onRowsPerPageChange are not passed to Toolbar
                      // They will be passed to SubscriptionTable instead if needed
                    />
                    {subsError && !subsLoading && !subsLoadingMore && (
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
                    <SubscriptionTable
                      subscriptions={subscriptions}
                      onEditClick={handleEditClick}
                      totalCount={subsTotal}
                      order={subsOrder}
                      orderBy={subsOrderBy}
                      onRequestSort={(event, property) =>
                        handleSubsRequestSort(event, property, globalSearchTerm)
                      }
                      loading={subsLoading}
                      loadingMore={subsLoadingMore}
                      onLoadMore={() => handleSubsLoadMore(globalSearchTerm)}
                      hasMore={subsHasMore}
                      rowsPerPage={subsRowsPerPage} // <<< تمرير هنا
                      onRowsPerPageChange={(e) => handleSubsRowsPerPageChange(e, globalSearchTerm)} // <<< تمرير هنا
                    />
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
                        <MuiChip
                          label={`Pending (${pendingStats.pending || 0})`}
                          icon={<PendingActionsIcon />}
                          clickable
                          color={currentPendingFilter === "pending" ? "primary" : "default"}
                          onClick={() => handlePendingFilterAction("pending", globalSearchTerm)}
                          variant={currentPendingFilter === "pending" ? "filled" : "outlined"}
                          size="small"
                        />
                        <MuiChip
                          label={`Complete (${pendingStats.complete || 0})`}
                          icon={<CheckCircleIcon />}
                          clickable
                          color={currentPendingFilter === "complete" ? "primary" : "default"}
                          onClick={() => handlePendingFilterAction("complete", globalSearchTerm)}
                          variant={currentPendingFilter === "complete" ? "filled" : "outlined"}
                          size="small"
                        />
                        <MuiChip
                          label={`All (${pendingStats.total_all || 0})`}
                          icon={<ListAltIcon />}
                          clickable
                          color={currentPendingFilter === "all" ? "primary" : "default"}
                          onClick={() => handlePendingFilterAction("all", globalSearchTerm)}
                          variant={currentPendingFilter === "all" ? "filled" : "outlined"}
                          size="small"
                        />
                      </Box>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleBulkProcessPending(globalSearchTerm)}
                        disabled={
                          bulkProcessingLoading ||
                          pendingLoading ||
                          currentPendingFilter !== "pending"
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
                    <PendingSubscriptionsTable
                      pendingSubscriptions={pendingSubscriptions}
                      page={pendingPage}
                      rowsPerPage={pendingRowsPerPage}
                      onPageChange={(event, newPage) =>
                        handlePendingPageAction(event, newPage, globalSearchTerm)
                      }
                      onRowsPerPageChange={(event) =>
                        handlePendingRowsPerPageAction(event, globalSearchTerm)
                      }
                      onMarkComplete={(id) => handleMarkPendingComplete(id, globalSearchTerm)}
                      totalCount={pendingTotal}
                      loading={pendingLoading}
                    />
                  </>
                )}

                {activeTab === 2 && (
                  <>
                    <LegacySubscriptionsTable
                      initialLegacySubscriptions={legacyInitialData}
                      onLoadMore={(pageToFetch) =>
                        handleLoadMoreLegacy(pageToFetch, globalSearchTerm)
                      }
                      totalServerCount={legacyTotalCount}
                      loadingInitial={legacyLoadingInitial}
                      activeFilter={activeLegacyFilter}
                      onFilterChange={(newFilter) =>
                        handleLegacyFilterAction(newFilter, globalSearchTerm)
                      }
                      order={legacyOrder}
                      orderBy={legacyOrderBy}
                      onRequestSort={(event, property) =>
                        handleLegacySortAction(event, property, globalSearchTerm)
                      }
                      rowsPerPageForLoadMore={ROWS_PER_PAGE_FOR_LOAD_MORE}
                    />
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
          initialValues={selectedSubscription}
          subscriptionTypes={subscriptionTypes}
          availableSources={availableSources}
          isEdit={!!selectedSubscription}
        />

        {bulkProcessResult && (
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
              {bulkProcessResult && (
                <>
                  <Typography gutterBottom>
                    {bulkProcessResult.message ||
                      (bulkProcessResult.error
                        ? "An error occurred during processing."
                        : "Processing complete.")}
                  </Typography>
                  {bulkProcessResult.details && (
                    <MDBox mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Details:
                      </Typography>
                      <MDTypography variant="body2">
                        Total Candidates:{" "}
                        {bulkProcessResult.details.total_candidates !== undefined
                          ? bulkProcessResult.details.total_candidates
                          : "N/A"}
                      </MDTypography>
                      <MDTypography variant="body2" color="success.main">
                        Successfully Updated:{" "}
                        {bulkProcessResult.details.successful_updates !== undefined
                          ? bulkProcessResult.details.successful_updates
                          : "N/A"}
                      </MDTypography>
                      <MDTypography variant="body2" color="error.main">
                        Failures (Bot/DB):{" "}
                        {bulkProcessResult.details.failed_bot_or_db_updates !== undefined
                          ? bulkProcessResult.details.failed_bot_or_db_updates
                          : "N/A"}
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
                                    secondaryTypographyProps={{
                                      variant: "caption",
                                      color: "error",
                                    }}
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
                </>
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
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <CustomAlert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </CustomAlert>
        </Snackbar>
        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

export default Tables;
