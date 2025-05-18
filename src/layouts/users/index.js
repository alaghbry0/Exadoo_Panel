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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Hooks
import { useUsers } from "./hooks/useUsers"; // تأكد أن هذا الهوك مُحدَّث

// Components
import UserDetailsDialog from "./components/UserDetailsDialog";
import AddSubscriptionDialog from "./components/AddSubscriptionDialog";

// Configs and Utils
import { BASE_COLUMNS_CONFIG_USERS } from "./config/users.config";
import { formatUserSubscriptionCount } from "./utils/users.utils";

// API for dropdowns
import { getSubscriptionTypes, getSubscriptionSources } from "../../services/api"; // تأكد من المسار الصحيح

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
  const [activeUserForDialog, setActiveUserForDialog] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // استدعاء الهوك المحدث
  const {
    usersData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions, // هذه هي handleTableQueryOptionsChange من الهوك
    totalRecords,
    usersCountStat,
    setSearchTerm, // هذه هي handleSetSearchTerm من الهوك
    refetchData, // <<< الدالة الجديدة من الهوك للتحديث
    selectedUserDetails,
    userDetailsLoading,
    userDetailsError,
    fetchUserDetailsForDialog,
    clearSelectedUserDetails,
  } = useUsers(
    showSnackbar /*, globalSearchTerm - لم نعد بحاجة لتمريره هنا إذا كان الهوك لا يستخدمه للإعداد الأولي */
  );

  // For AddSubscriptionDialog dropdowns
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesData, sourcesData] = await Promise.all([
          getSubscriptionTypes(),
          getSubscriptionSources(),
        ]);
        setSubscriptionTypes(typesData || []);
        const formattedSources = (sourcesData || []).map((s) => ({
          value: typeof s === "string" ? s : s.name,
          label: typeof s === "string" ? s : s.name,
        }));
        setAvailableSources(formattedSources);
      } catch (err) {
        console.error("Failed to load data for Add Subscription dialog:", err);
        showSnackbar("Failed to load data for Add Subscription dialog", "error");
      }
    };
    fetchDropdownData();
  }, [showSnackbar]);

  // Effect لمزامنة globalSearchTerm (من شريط البحث في Navbar) مع الهوك
  useEffect(() => {
    // استدعاء setSearchTerm من الهوك (التي هي handleSetSearchTerm داخليًا)
    // هذا سيؤدي إلى تحديث internalSearchTerm في الهوك وإعادة الصفحة إلى 1.
    setSearchTerm(globalSearchTerm);
  }, [globalSearchTerm, setSearchTerm]); // الاعتماديات صحيحة

  // يتم استدعاؤها من DashboardNavbar
  const handleGlobalSearchChange = useCallback((value) => {
    setGlobalSearchTerm(value); // هذا سيشغل الـ useEffect أعلاه
  }, []);

  // يتم استدعاؤها عند الضغط على زر التحديث
  const handleRefreshData = useCallback(() => {
    // showSnackbar("Refreshing user data...", "info"); // يمكن وضعها هنا أو داخل refetchData في الهوك
    if (refetchData) {
      // تأكد من وجود الدالة قبل استدعائها
      refetchData();
    }
  }, [refetchData]); // الاعتماد على refetchData من الهوك

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

  const handleCloseAddSubscriptionDialog = useCallback(() => {
    setAddSubscriptionDialogOpen(false);
  }, []);

  const handleSubscriptionAdded = useCallback(async () => {
    showSnackbar("Subscription action complete. Refreshing user data...", "success");
    if (refetchData) {
      // استخدام دالة التحديث المباشرة من الهوك
      refetchData();
    }

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
      if (col.accessor === "active_subscription_count") {
        return { ...col, Cell: ({ value }) => formatUserSubscriptionCount(value) };
      }
      if (col.accessor === "subscription_count") {
        return {
          ...col,
          Cell: ({ value }) => (
            <Typography variant="caption" color="text.secondary">
              {String(value ?? 0)}
            </Typography>
          ),
        };
      }
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
                  <Tooltip title="Refresh Data">
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
                    // --- تعديلات هنا ---
                    page={tableQueryOptions.page - 1} // تمرير الصفحة 0-indexed
                    onPageChange={(newPageIndex) => {
                      // استقبال الصفحة 0-indexed
                      if (setTableQueryOptions) {
                        // تحديث حالة الهوك بالصفحة 1-indexed
                        setTableQueryOptions({ page: newPageIndex + 1 });
                      }
                    }}
                    onEntriesPerPageChange={(newPageSize) => {
                      // استقبال حجم الصفحة الجديد
                      if (setTableQueryOptions) {
                        setTableQueryOptions({ pageSize: newPageSize, page: 1 }); // إعادة التعيين للصفحة 1
                      }
                    }}
                    // --- نهاية التعديلات ---
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

      {userDetailsDialogOpen && selectedUserDetails && (
        <UserDetailsDialog
          open={userDetailsDialogOpen}
          onClose={handleCloseUserDetailsDialog}
          user={selectedUserDetails}
          loading={userDetailsLoading}
          error={userDetailsError}
          onAddSubscriptionClick={() => handleOpenAddSubscriptionDialog(selectedUserDetails)}
        />
      )}

      {addSubscriptionDialogOpen && activeUserForDialog && (
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          onClose={handleCloseAddSubscriptionDialog}
          userTelegramId={activeUserForDialog.telegram_id}
          currentFullName={
            activeUserForDialog.full_name ||
            `${activeUserForDialog.first_name || ""} ${activeUserForDialog.last_name || ""}`.trim()
          }
          onSuccess={handleSubscriptionAdded}
          subscriptionTypes={subscriptionTypes}
          availableSources={(availableSources || []).map((s) => s.value)}
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
