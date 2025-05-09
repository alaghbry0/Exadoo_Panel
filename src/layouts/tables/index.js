// layouts/tables/index.js
import React, { useState, useEffect, useCallback, forwardRef } from "react";
import {
  Card,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Grid,
  Box,
  Chip as MuiChip,
  TextField,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListAltIcon from "@mui/icons-material/ListAlt";

import MuiAlert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Components
import TabsManager from "layouts/tables/components/TabsManager";
import SubscriptionTableToolbar from "layouts/tables/components/SubscriptionTableToolbar";
import SubscriptionTable from "layouts/tables/components/SubscriptionTable";
import SubscriptionFormModal from "layouts/tables/components/SubscriptionFormModal";
import PendingSubscriptionsTable from "layouts/tables/components/PendingSubscriptionsTable";
import LegacySubscriptionsTable from "layouts/tables/components/LegacySubscriptionsTable"; // النسخة التي تدعم Load More

// Data
import {
  getSubscriptions, // <--- سنركز على كيفية التعامل مع رد هذه الدالة
  getSubscriptionTypes,
  addSubscription,
  updateSubscription,
  getSubscriptionSources,
  getPendingSubscriptions,
  handlePendingSubscriptionAction,
  getLegacySubscriptions,
  getPendingSubscriptionsStats,
} from "services/api";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ROWS_PER_PAGE_FOR_LOAD_MORE = 20;

function Tables() {
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  const [legacyCountForTabDisplay, setLegacyCountForTabDisplay] = useState(0);

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  // State for Subscriptions Tab (Pagination)
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Error specific to Subscriptions Tab
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  // --- State for Pending Subscriptions Tab (Pagination) ---
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(20);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingStats, setPendingStats] = useState({ pending: 0, complete: 0, total_all: 0 });
  const [currentPendingFilter, setCurrentPendingFilter] = useState("pending");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

  // --- State for Legacy Subscriptions Tab (Load More) ---
  const [legacyInitialData, setLegacyInitialData] = useState([]);
  const [legacyTotalCount, setLegacyTotalCount] = useState(0);
  const [legacyLoadingInitial, setLegacyLoadingInitial] = useState(false);
  const [activeLegacyFilter, setActiveLegacyFilter] = useState(null);
  const [legacyOrder, setLegacyOrder] = useState("desc");
  const [legacyOrderBy, setLegacyOrderBy] = useState("expiry_date");

  // Modal and Snackbar state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) setPage(0);
    else if (newValue === 1) setPendingPage(0);
    // No page reset needed for legacy tab (Load More)
  };

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesData = await getSubscriptionTypes();
        setSubscriptionTypes(typesData);
        const sourcesData = await getSubscriptionSources();
        setAvailableSources(sourcesData);
      } catch (err) {
        console.error("Error fetching initial dropdown data:", err);
        showSnackbar("Failed to load some initial data", "error");
      }
    };
    fetchInitialData();
  }, [showSnackbar]);

  // --- Fetching Logic for Pending Tab ---
  const fetchPendingStats = useCallback(async () => {
    try {
      const statsData = await getPendingSubscriptionsStats();
      setPendingStats(statsData || { pending: 0, complete: 0, total_all: 0 });
    } catch (err) {
      console.error("Error fetching pending subscriptions stats:", err);
    }
  }, []);

  const fetchPendingSubscriptionsData = useCallback(async () => {
    setPendingLoading(true);
    try {
      const queryParams = {
        page: pendingPage + 1,
        page_size: pendingRowsPerPage,
        status: currentPendingFilter === "all" ? undefined : currentPendingFilter,
        search: pendingSearchTerm || undefined,
      };
      // Assume getPendingSubscriptions returns { data: [], total_count: N }
      const responseData = await getPendingSubscriptions(queryParams);
      setPendingSubscriptions(responseData.data || []);
      setPendingTotal(responseData.total_count || 0);
    } catch (err) {
      console.error("Error fetching pending subscriptions:", err);
      showSnackbar(`Error: ${err.message || "Could not fetch pending subscriptions."}`, "error");
      setPendingSubscriptions([]);
      setPendingTotal(0);
    } finally {
      setPendingLoading(false);
    }
  }, [currentPendingFilter, pendingPage, pendingRowsPerPage, pendingSearchTerm, showSnackbar]);

  // --- Fetching Logic for Subscriptions Tab (CORRECTED) ---
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error specific to this tab
    try {
      let queryParams = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm || undefined,
        ordering: `${order === "desc" ? "-" : ""}${orderBy}`,
      };
      const activeFilters = { ...filters };
      Object.keys(activeFilters).forEach((key) => {
        if (!activeFilters[key]) {
          delete activeFilters[key];
        }
        if (
          (key === "startDate" || key === "endDate") &&
          activeFilters[key] &&
          typeof activeFilters[key].toISOString === "function"
        ) {
          activeFilters[key] = activeFilters[key].toISOString().split("T")[0];
        }
      });
      // Flatten filters into queryParams (adjust if your API expects nested 'filters' object)
      queryParams = { ...queryParams, ...activeFilters };

      console.log("[fetchSubscriptions] Query Params:", queryParams);
      const responseData = await getSubscriptions(queryParams);
      console.log("[fetchSubscriptions] API Response:", responseData);

      let fetchedSubscriptions = [];
      let fetchedTotalCount = 0;

      // *** START: Handle potential response structures for getSubscriptions ***
      if (Array.isArray(responseData)) {
        // Case 1: API returns an array directly (e.g., with total_count in each item)
        fetchedSubscriptions = responseData;
        if (responseData.length > 0 && responseData[0].hasOwnProperty("total_count")) {
          fetchedTotalCount = responseData[0].total_count;
        } else {
          // Fallback if total_count isn't provided per item
          console.warn(
            "[fetchSubscriptions] 'total_count' not found in array items. Pagination might be inaccurate."
          );
          // If no total_count, pagination might break. Consider fetching all or alternative approach.
          fetchedTotalCount = responseData.length; // Setting total count to current length is often wrong for pagination
        }
        console.log(`[fetchSubscriptions] Handled as Array. Count: ${fetchedTotalCount}`);
      } else if (
        responseData &&
        typeof responseData === "object" &&
        responseData !== null &&
        responseData.hasOwnProperty("data") &&
        responseData.hasOwnProperty("total_count")
      ) {
        // Case 2: API returns an object { data: [], total_count: N } (Common pattern)
        fetchedSubscriptions = responseData.data || [];
        fetchedTotalCount = responseData.total_count || 0;
        console.log(
          `[fetchSubscriptions] Handled as Object {data, total_count}. Count: ${fetchedTotalCount}`
        );
      } else {
        // Unexpected structure
        console.error("[fetchSubscriptions] Unexpected API response structure:", responseData);
        setError("Received unexpected data format from server for subscriptions.");
      }
      // *** END: Handle potential response structures ***

      setSubscriptions(fetchedSubscriptions);
      setTotalSubscriptions(fetchedTotalCount);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      const message = err.message || "Could not fetch subscriptions.";
      setError(`Failed to load subscriptions: ${message}`); // Set specific error message
      showSnackbar(`Error: ${message}`, "error"); // Show snackbar too
      setSubscriptions([]);
      setTotalSubscriptions(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filters, order, orderBy, showSnackbar]); // Added showSnackbar back

  // --- Fetching Logic for Legacy Tab (Load More) ---
  const fetchLegacyCountForTabsManager = useCallback(async () => {
    try {
      const legacyResponse = await getLegacySubscriptions({ page: 1, page_size: 1 });
      let count = 0;
      if (Array.isArray(legacyResponse)) {
        count =
          legacyResponse.length > 0 && legacyResponse[0].total_count !== undefined
            ? legacyResponse[0].total_count
            : 0;
      } else if (legacyResponse && legacyResponse.total_count !== undefined) {
        count = legacyResponse.total_count;
      }
      setLegacyCountForTabDisplay(count);
    } catch (err) {
      console.error("Error fetching total legacy count for tab display:", err);
    }
  }, []); // Keep dependencies minimal

  useEffect(() => {
    fetchLegacyCountForTabsManager();
  }, [fetchLegacyCountForTabsManager]);

  const fetchInitialLegacySubscriptions = useCallback(async () => {
    setLegacyLoadingInitial(true);
    try {
      const queryParams = {
        page: 1,
        page_size: ROWS_PER_PAGE_FOR_LOAD_MORE,
        ordering: `${legacyOrder === "desc" ? "-" : ""}${legacyOrderBy}`,
      };
      if (activeLegacyFilter !== null) queryParams.processed = activeLegacyFilter;
      const responseData = await getLegacySubscriptions(queryParams);

      let initialData = [];
      let totalCount = 0;

      if (Array.isArray(responseData)) {
        initialData = responseData;
        totalCount =
          responseData.length > 0 && responseData[0].total_count !== undefined
            ? responseData[0].total_count
            : responseData.length; // Be careful with fallback
      } else if (responseData && responseData.data && responseData.total_count !== undefined) {
        initialData = responseData.data || [];
        totalCount = responseData.total_count || 0;
      } else {
        console.warn(
          "Unexpected response structure from getLegacySubscriptions for initial fetch:",
          responseData
        );
      }

      setLegacyInitialData(initialData);
      setLegacyTotalCount(totalCount);

      if (activeLegacyFilter === null) setLegacyCountForTabDisplay(totalCount);
    } catch (err) {
      console.error("Error fetching initial legacy subscriptions:", err);
      showSnackbar(
        `Error: ${err.message || "Could not fetch initial legacy subscriptions."}`,
        "error"
      );
      setLegacyInitialData([]);
      setLegacyTotalCount(0);
    } finally {
      setLegacyLoadingInitial(false);
    }
  }, [activeLegacyFilter, legacyOrder, legacyOrderBy, showSnackbar]);

  const handleLoadMoreLegacy = useCallback(
    async (pageToFetch, rowsPerPageForLoadMore) => {
      // This function only fetches and returns data, doesn't set state here
      try {
        const queryParams = {
          page: pageToFetch,
          page_size: rowsPerPageForLoadMore,
          ordering: `${legacyOrder === "desc" ? "-" : ""}${legacyOrderBy}`,
        };
        if (activeLegacyFilter !== null) queryParams.processed = activeLegacyFilter;
        const responseData = await getLegacySubscriptions(queryParams);
        return Array.isArray(responseData) ? responseData : responseData?.data || [];
      } catch (error) {
        console.error("Error fetching more legacy subscriptions:", error);
        showSnackbar(
          `Error: ${error.message || "Could not load more legacy subscriptions."}`,
          "error"
        );
        return [];
      }
    },
    [activeLegacyFilter, legacyOrder, legacyOrderBy, showSnackbar]
  );

  // useEffects to trigger data fetching based on dependencies
  useEffect(() => {
    if (activeTab === 0) {
      fetchSubscriptions();
    }
  }, [activeTab, page, rowsPerPage, searchTerm, filters, order, orderBy, fetchSubscriptions]); // Correct dependencies for Subscriptions

  useEffect(() => {
    if (activeTab === 1) {
      fetchPendingStats();
      fetchPendingSubscriptionsData();
    }
  }, [
    activeTab,
    currentPendingFilter,
    pendingPage,
    pendingRowsPerPage,
    pendingSearchTerm,
    fetchPendingStats,
    fetchPendingSubscriptionsData,
  ]); // Correct dependencies for Pending

  useEffect(() => {
    if (activeTab === 2) {
      fetchInitialLegacySubscriptions(); // Fetch initial batch for Legacy
    }
  }, [activeTab, activeLegacyFilter, legacyOrder, legacyOrderBy, fetchInitialLegacySubscriptions]); // Correct dependencies for Legacy

  // Refresh Handler
  const handleRefreshData = async () => {
    showSnackbar("Refreshing data...", "info");
    if (activeTab === 0) await fetchSubscriptions();
    else if (activeTab === 1) {
      await fetchPendingStats();
      await fetchPendingSubscriptionsData();
    } else if (activeTab === 2) {
      await fetchInitialLegacySubscriptions(); // Refetch initial batch
      await fetchLegacyCountForTabsManager(); // Also update tab count
    }
    showSnackbar("Data refreshed!", "success");
  };

  // --- Handlers for Subscriptions Tab ---
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setPage(0);
  };
  const handleFilter = (filterValues) => {
    setFilters(filterValues);
    setPage(0);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0); // Reset page on sort
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Handlers for Pending Subscriptions Tab ---
  const handlePendingFilterChange = (newFilterStatus) => {
    setCurrentPendingFilter(newFilterStatus);
    setPendingPage(0);
  };
  const handlePendingSearchChange = (event) => {
    setPendingSearchTerm(event.target.value);
    setPendingPage(0);
  };
  const handlePendingPageChange = (event, newPage) => {
    setPendingPage(newPage);
  };
  const handlePendingRowsPerPageChange = (event) => {
    setPendingRowsPerPage(parseInt(event.target.value, 10));
    setPendingPage(0);
  };
  const handleMarkPendingComplete = async (id) => {
    setPendingLoading(true);
    try {
      await handlePendingSubscriptionAction(id);
      showSnackbar("Subscription marked as complete successfully!", "success");
      await fetchPendingSubscriptionsData();
      await fetchPendingStats();
      await fetchSubscriptions();
      await fetchLegacyCountForTabsManager();
    } catch (err) {
      console.error("Error marking subscription complete:", err);
      showSnackbar(
        err.response?.data?.message || err.response?.data?.error || "Error processing subscription",
        "error"
      );
    } finally {
      setPendingLoading(false);
    }
  };

  // --- Handlers for Legacy Subscriptions Tab ---
  const handleLegacyFilterChange = (newFilterValue) => {
    setActiveLegacyFilter(newFilterValue);
    // No need to set page; useEffect handles refetching initial data
  };
  const handleLegacyRequestSort = (event, property) => {
    const isAsc = legacyOrderBy === property && legacyOrder === "asc";
    setLegacyOrder(isAsc ? "desc" : "asc");
    setLegacyOrderBy(property);
    // No need to set page; useEffect handles refetching initial data
  };

  // Modal Handlers
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
    const currentLoadingSetter =
      activeTab === 0 ? setLoading : activeTab === 1 ? setPendingLoading : setLegacyLoadingInitial;
    currentLoadingSetter(true);
    try {
      if (isEditMode) {
        await updateSubscription(selectedSubscription.id, formData);
        showSnackbar("Subscription updated successfully!", "success");
      } else {
        await addSubscription(formData);
        showSnackbar("Subscription added successfully!", "success");
      }
      handleCloseModal();
      // Refresh all potentially affected data
      await fetchSubscriptions();
      await fetchPendingStats();
      await fetchPendingSubscriptionsData();
      await fetchInitialLegacySubscriptions();
      await fetchLegacyCountForTabsManager();
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Error processing form";
      showSnackbar(errorMessage, "error");
    } finally {
      currentLoadingSetter(false);
    }
  };

  const isAnyLoading = loading || pendingLoading || legacyLoadingInitial;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                {/* Card Header */}
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

                {/* Tabs and Refresh Button */}
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
                      onClick={handleRefreshData}
                      color="info"
                      disabled={isAnyLoading}
                      sx={{ ml: "auto" }}
                    >
                      {isAnyLoading &&
                      ((activeTab === 0 && loading) ||
                        (activeTab === 1 && pendingLoading) ||
                        (activeTab === 2 && legacyLoadingInitial)) ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </MDBox>

                {/* Tab Content */}
                {activeTab === 0 && (
                  <>
                    <SubscriptionTableToolbar
                      onSearch={handleSearch}
                      onFilter={handleFilter}
                      subscriptionTypes={subscriptionTypes}
                      onAddNewClick={handleAddNewClick}
                      availableSources={availableSources}
                    />
                    {/* Display loading or error specific to this tab */}
                    {error && !loading && (
                      <MDBox px={3} py={1}>
                        <MuiAlert
                          severity="error"
                          onClose={() => setError(null)}
                          sx={{ width: "100%" }}
                        >
                          {error} {/* عرض رسالة الخطأ الخاصة بـ Subscriptions Tab */}
                        </MuiAlert>
                      </MDBox>
                    )}
                    <SubscriptionTable
                      subscriptions={subscriptions}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      onEditClick={handleEditClick}
                      totalCount={totalSubscriptions}
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      loading={loading} // Pass loading state for internal skeleton if needed
                    />
                    )}
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
                          onClick={() => handlePendingFilterChange("pending")}
                          variant={currentPendingFilter === "pending" ? "filled" : "outlined"}
                          size="small"
                        />
                        <MuiChip
                          label={`Complete (${pendingStats.complete || 0})`}
                          icon={<CheckCircleIcon />}
                          clickable
                          color={currentPendingFilter === "complete" ? "primary" : "default"}
                          onClick={() => handlePendingFilterChange("complete")}
                          variant={currentPendingFilter === "complete" ? "filled" : "outlined"}
                          size="small"
                        />
                        <MuiChip
                          label={`All (${pendingStats.total_all || 0})`}
                          icon={<ListAltIcon />}
                          clickable
                          color={currentPendingFilter === "all" ? "primary" : "default"}
                          onClick={() => handlePendingFilterChange("all")}
                          variant={currentPendingFilter === "all" ? "filled" : "outlined"}
                          size="small"
                        />
                      </Box>
                      <TextField
                        placeholder="Search User, ID..."
                        variant="outlined"
                        size="small"
                        value={pendingSearchTerm}
                        onChange={handlePendingSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {" "}
                              <SearchIcon fontSize="small" />{" "}
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: { xs: "100%", sm: "250px" }, maxWidth: "300px" }}
                      />
                    </MDBox>
                    {/* Conditional rendering for Pending Table */}
                    <PendingSubscriptionsTable
                      pendingSubscriptions={pendingSubscriptions}
                      page={pendingPage}
                      rowsPerPage={pendingRowsPerPage}
                      onPageChange={handlePendingPageChange}
                      onRowsPerPageChange={handlePendingRowsPerPageChange}
                      onMarkComplete={handleMarkPendingComplete}
                      totalCount={pendingTotal}
                      loading={pendingLoading}
                    />
                  </>
                )}

                {activeTab === 2 && (
                  <>
                    {/* Legacy Table (using Load More props) */}
                    <LegacySubscriptionsTable
                      initialLegacySubscriptions={legacyInitialData}
                      onLoadMore={handleLoadMoreLegacy}
                      totalServerCount={legacyTotalCount}
                      loadingInitial={legacyLoadingInitial}
                      activeFilter={activeLegacyFilter}
                      onFilterChange={handleLegacyFilterChange}
                      order={legacyOrder}
                      orderBy={legacyOrderBy}
                      onRequestSort={handleLegacyRequestSort}
                      // Pass the constant for rows per page if needed internally by child
                      rowsPerPageForLoadMore={ROWS_PER_PAGE_FOR_LOAD_MORE}
                    />
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Modal and Snackbar */}
        <SubscriptionFormModal
          open={formModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          initialValues={selectedSubscription}
          subscriptionTypes={subscriptionTypes}
          availableSources={availableSources}
          isEdit={!!selectedSubscription}
        />
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
