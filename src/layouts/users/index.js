// src/layouts/Users/index.js
import React, { useState, useEffect, useCallback, forwardRef, useMemo } from "react";
import {
  Card,
  CircularProgress,
  Snackbar as MuiSnackbar,
  IconButton,
  Tooltip,
  Grid,
  Chip as MuiChip,
  Typography,
  Box, // ⭐ إضافة Box لحل مشكلة Tooltip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Hooks
import { useUsers } from "./hooks/useUsers";

// Components
import UserDetailsDialog from "./components/UserDetailsDialog";
import AddSubscriptionDialog from "./components/AddSubscriptionDialog";
import ExportUsersDialog from "./components/ExportUsersDialog";
import AddUserDiscountDialog from "./components/AddUserDiscountDialog";

// Configs and Utils
import { BASE_COLUMNS_CONFIG_USERS } from "./config/users.config";
import { formatUserSubscriptionCount } from "./utils/users.utils";

// API for dropdowns and export
import {
  getSubscriptionTypes,
  getSubscriptionSources,
  exportUsersToExcel as exportUsers,
  getDiscounts,
  getSubscriptionPlans, // ⭐ التأكد من أن هذا الاسم يطابق ما تم تصديره من api.js
} from "../../services/api";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const centeredContentStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "200px",
  width: "100%",
};

function UsersPage() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(false);
  const [addDiscountDialogOpen, setAddDiscountDialogOpen] = useState(false);
  const [activeUserForDialog, setActiveUserForDialog] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const {
    usersData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions,
    totalRecords,
    usersCountStat,
    setSearchTerm, // setSearchTerm is used by DashboardNavbar via onSearchChange
    refetchData,
    selectedUserDetails,
    userDetailsLoading,
    userDetailsError,
    fetchUserDetailsForDialog,
    clearSelectedUserDetails,
  } = useUsers(showSnackbar);

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesData, sourcesData, discountsData, plansData] = await Promise.all([
          getSubscriptionTypes(),
          getSubscriptionSources(),
          getDiscounts(),
          getSubscriptionPlans(), // ⭐ الآن هذا الاستدعاء صحيح
        ]);

        setSubscriptionTypes(typesData || []);
        const formattedSources = (sourcesData || []).map((s) => ({
          value: typeof s === "string" ? s : s.name,
          label: typeof s === "string" ? s : s.name,
        }));
        setAvailableSources(formattedSources);

        setAvailableDiscounts(discountsData || []);
        setAvailablePlans(plansData || []);
      } catch (err) {
        console.error("Failed to load data for dialogs:", err);
        showSnackbar("Failed to load required data for dialogs.", "error");
      }
    };
    fetchDropdownData();
  }, [showSnackbar]);

  // This effect synchronizes the local search term with the hook's search term
  useEffect(() => {
    setSearchTerm(globalSearchTerm);
  }, [globalSearchTerm, setSearchTerm]);

  const handleGlobalSearchChange = useCallback((value) => setGlobalSearchTerm(value), []);
  const handleRefreshData = useCallback(() => refetchData?.(), [refetchData]);
  const handleOpenUserDetails = useCallback(
    (user) => {
      setActiveUserForDialog(user);
      fetchUserDetailsForDialog(user.telegram_id);
      setUserDetailsDialogOpen(true);
    },
    [fetchUserDetailsForDialog]
  );
  const handleCloseUserDetailsDialog = useCallback(() => {
    setUserDetailsDialogOpen(false);
    clearSelectedUserDetails();
    setActiveUserForDialog(null);
  }, [clearSelectedUserDetails]);
  const handleOpenAddSubscriptionDialog = useCallback((user) => {
    setActiveUserForDialog(user);
    setAddSubscriptionDialogOpen(true);
  }, []);
  const handleCloseAddSubscriptionDialog = useCallback(
    () => setAddSubscriptionDialogOpen(false),
    []
  );
  const handleSubscriptionAdded = useCallback(async () => {
    showSnackbar("Subscription action complete. Refreshing user data...", "success");
    refetchData?.();
    if (userDetailsDialogOpen && activeUserForDialog?.telegram_id) {
      await fetchUserDetailsForDialog(activeUserForDialog.telegram_id);
    }
    setAddSubscriptionDialogOpen(false);
  }, [
    refetchData,
    userDetailsDialogOpen,
    activeUserForDialog,
    fetchUserDetailsForDialog,
    showSnackbar,
  ]);
  const handleOpenAddDiscountDialog = useCallback((user) => {
    setActiveUserForDialog(user);
    setAddDiscountDialogOpen(true);
  }, []);
  const handleCloseAddDiscountDialog = useCallback(() => setAddDiscountDialogOpen(false), []);
  const handleDiscountAdded = useCallback(async () => {
    showSnackbar("Discount added successfully. Refreshing user details...", "success");
    if (userDetailsDialogOpen && activeUserForDialog?.telegram_id) {
      await fetchUserDetailsForDialog(activeUserForDialog.telegram_id);
    }
    handleCloseAddDiscountDialog();
  }, [
    userDetailsDialogOpen,
    activeUserForDialog,
    fetchUserDetailsForDialog,
    showSnackbar,
    handleCloseAddDiscountDialog,
  ]);
  const handleOpenExportDialog = useCallback(() => setExportDialogOpen(true), []);
  const handleCloseExportDialog = useCallback(() => setExportDialogOpen(false), []);
  const handleExportSubmit = useCallback(
    async (exportOptions) => {
      try {
        showSnackbar("Generating Excel file...", "info");
        const blob = await exportUsers(exportOptions);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
        link.setAttribute("download", `users_export_${timestamp}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSnackbar("Excel file downloaded successfully!", "success");
        handleCloseExportDialog();
      } catch (err) {
        console.error("Export failed:", err);
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          "Failed to export data.";
        showSnackbar(`Export Error: ${message}`, "error");
      }
    },
    [showSnackbar, handleCloseExportDialog]
  );
  const usersDataTableColumns = useMemo(() => {
    const actionColumn = {
      Header: "ACTIONS",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      width: "10%",
      Cell: ({ row }) => (
        <MDBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleOpenUserDetails(row.original)}
              color="info"
            >
              <VisibilityIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Subscription">
            <IconButton
              size="small"
              onClick={() => handleOpenAddSubscriptionDialog(row.original)}
              color="success"
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    };
    const formattedBase = BASE_COLUMNS_CONFIG_USERS.map((col) => {
      if (col.accessor === "active_subscription_count")
        return { ...col, Cell: ({ value }) => formatUserSubscriptionCount(value) };
      if (col.accessor === "subscription_count")
        return {
          ...col,
          Cell: ({ value }) => (
            <Typography variant="caption" color="text.secondary">
              {String(value ?? 0)}
            </Typography>
          ),
        };
      return {
        ...col,
        Cell: ({ value }) => (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {value !== null && typeof value !== "undefined" ? String(value) : "N/A"}
          </MDTypography>
        ),
      };
    });
    return [...formattedBase, actionColumn];
  }, [handleOpenUserDetails, handleOpenAddSubscriptionDialog]);
  const usersPageCount = Math.ceil(totalRecords / (tableQueryOptions.pageSize || 20));

  return (
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
                  Users Management
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={1}>
                  {usersCountStat !== null && typeof usersCountStat !== "undefined" && (
                    <MuiChip
                      label={`Total Users: ${usersCountStat}`}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  )}
                  {/* ⭐⭐ إصلاح تحذير Tooltip هنا ⭐⭐ */}
                  <Tooltip title="تصدير البيانات">
                    <Box component="span">
                      {" "}
                      {/* استخدام span كـ wrapper */}
                      <IconButton
                        onClick={handleOpenExportDialog}
                        sx={{ color: "white" }}
                        disabled={loading || usersData.length === 0}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Refresh Data">
                    <Box component="span">
                      {" "}
                      {/* استخدام span كـ wrapper */}
                      <IconButton
                        onClick={handleRefreshData}
                        sx={{ color: "white" }}
                        disabled={loading}
                      >
                        {loading && usersData.length > 0 ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <RefreshIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Tooltip>
                </MDBox>
              </MDBox>

              {error && !loading && (
                <MDBox px={2} py={1}>
                  <MuiAlert
                    severity="error"
                    onClose={() => setError && setError(null)}
                    sx={{ width: "100%", mb: 1 }}
                  >
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </MuiAlert>
                </MDBox>
              )}

              <MDBox pt={1} sx={{ position: "relative" }}>
                {loading && usersData.length === 0 && (
                  <MDBox sx={centeredContentStyle}>
                    <CircularProgress color="info" />
                  </MDBox>
                )}

                {!loading && usersData.length === 0 && !error ? (
                  <MDBox sx={centeredContentStyle}>
                    <MDTypography variant="h6" color="textSecondary">
                      No users found.
                    </MDTypography>
                  </MDBox>
                ) : usersData.length > 0 || (loading && usersData.length > 0) ? (
                  <DataTable
                    table={{ columns: usersDataTableColumns, rows: usersData }}
                    isSorted={false}
                    entriesPerPage={{
                      defaultValue: tableQueryOptions.pageSize,
                      options: [10, 20, 50, 100],
                    }}
                    showTotalEntries={totalRecords > 0}
                    noEndBorder
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "info" }}
                    manualPagination
                    pageCount={usersPageCount > 0 ? usersPageCount : 1}
                    page={tableQueryOptions.page - 1}
                    onPageChange={(newPageIndex) =>
                      setTableQueryOptions?.({ page: newPageIndex + 1 })
                    }
                    onEntriesPerPageChange={(newPageSize) =>
                      setTableQueryOptions?.({ pageSize: newPageSize, page: 1 })
                    }
                    sx={
                      loading && usersData.length > 0 ? { opacity: 0.7, pointerEvents: "none" } : {}
                    }
                  />
                ) : null}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* --- Dialogs Section --- */}
      {userDetailsDialogOpen && selectedUserDetails && (
        <UserDetailsDialog
          open={userDetailsDialogOpen}
          onClose={handleCloseUserDetailsDialog}
          user={selectedUserDetails}
          loading={userDetailsLoading}
          error={userDetailsError}
          onAddSubscription={() => handleOpenAddSubscriptionDialog(selectedUserDetails)}
          onAddDiscount={() => handleOpenAddDiscountDialog(selectedUserDetails)}
        />
      )}
      {addSubscriptionDialogOpen && activeUserForDialog && (
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          onClose={handleCloseAddSubscriptionDialog}
          user={activeUserForDialog}
          onSuccess={handleSubscriptionAdded}
          subscriptionTypes={subscriptionTypes}
          availableSources={(availableSources || []).map((s) => s.value)}
        />
      )}
      {addDiscountDialogOpen && activeUserForDialog && (
        <AddUserDiscountDialog
          open={addDiscountDialogOpen}
          onClose={handleCloseAddDiscountDialog}
          user={activeUserForDialog}
          onSuccess={handleDiscountAdded}
          discounts={availableDiscounts}
          plans={availablePlans}
        />
      )}
      {exportDialogOpen && (
        <ExportUsersDialog
          open={exportDialogOpen}
          onClose={handleCloseExportDialog}
          onSubmit={handleExportSubmit}
          currentSearchTerm={globalSearchTerm}
        />
      )}
      <MuiSnackbar
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
      </MuiSnackbar>
      <Footer />
    </DashboardLayout>
  );
}

export default UsersPage;
