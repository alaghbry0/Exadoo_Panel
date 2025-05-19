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
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // <<<--- تمت الإضافة

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
import ExportUsersDialog from "./components/ExportUsersDialog"; // <<<--- تمت الإضافة (افترض أن الاسم هو ExportUsersDialog)

// Configs and Utils
import { BASE_COLUMNS_CONFIG_USERS } from "./config/users.config";
import { formatUserSubscriptionCount } from "./utils/users.utils";

// API for dropdowns and export
import {
  getSubscriptionTypes,
  getSubscriptionSources,
  exportUsersToExcel as exportUsers,
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
  const [activeUserForDialog, setActiveUserForDialog] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false); // <<<--- تمت الإضافة

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
    setSearchTerm,
    refetchData,
    selectedUserDetails,
    userDetailsLoading,
    userDetailsError,
    fetchUserDetailsForDialog,
    clearSelectedUserDetails,
  } = useUsers(showSnackbar);

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

  useEffect(() => {
    setSearchTerm(globalSearchTerm);
  }, [globalSearchTerm, setSearchTerm]);

  const handleGlobalSearchChange = useCallback((value) => {
    setGlobalSearchTerm(value);
  }, []);

  const handleRefreshData = useCallback(() => {
    if (refetchData) {
      refetchData();
    }
  }, [refetchData]);

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

  // <<<--- تمت إضافة الدوال المعالجة لـ Export Dialog ---<<<
  const handleOpenExportDialog = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleCloseExportDialog = useCallback(() => {
    setExportDialogOpen(false);
  }, []);

  const handleExportSubmit = useCallback(
    async (exportOptions) => {
      // اسم الدالة onSubmit في ExportUsersDialog.js يتوافق مع هذه.
      try {
        showSnackbar("Generating Excel file...", "info");
        const blob = await exportUsers(exportOptions); // استدعاء API التصدير

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
        // قد لا ترغب في إغلاق الحوار عند الفشل
      }
    },
    [showSnackbar, handleCloseExportDialog] // أضفت handleCloseExportDialog للاعتماديات
  );
  // >>>------------------------------------------------>>>

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
                {/* <<<--- تم تعديل هذا الجزء لإضافة زر التصدير ---<<< */}
                <MDBox display="flex" alignItems="center" gap={1}>
                  {usersCountStat !== null && typeof usersCountStat !== "undefined" && (
                    <MuiChip
                      label={`Total Users: ${usersCountStat}`}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  )}
                  <Tooltip title="تصدير البيانات">
                    <IconButton
                      onClick={handleOpenExportDialog}
                      sx={{ color: "white" }}
                      disabled={loading || usersData.length === 0} // تعطيل إذا كان التحميل جاريًا أو لا توجد بيانات
                    >
                      <FileDownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={handleRefreshData}
                      sx={{ color: "white" }}
                      disabled={loading} // تعطيل إذا كان التحميل جاريًا
                    >
                      {/* تعديل طفيف: إظهار الدائرة فقط إذا كان التحميل جاريًا وهناك بيانات بالفعل (تجنب وميض الأيقونة عند التحميل الأولي)
                          أو ببساطة: loading ? <CircularProgress... : <RefreshIcon /> */}
                      {loading && usersData.length > 0 ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </MDBox>
                {/* >>>------------------------------------------------>>> */}
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
                    canSearch={false} // البحث يتم عبر شريط البحث العام
                    pagination={{ variant: "gradient", color: "info" }}
                    manualPagination
                    pageCount={usersPageCount > 0 ? usersPageCount : 1}
                    page={tableQueryOptions.page - 1}
                    onPageChange={(newPageIndex) => {
                      if (setTableQueryOptions) {
                        setTableQueryOptions({ page: newPageIndex + 1 });
                      }
                    }}
                    onEntriesPerPageChange={(newPageSize) => {
                      if (setTableQueryOptions) {
                        setTableQueryOptions({ pageSize: newPageSize, page: 1 });
                      }
                    }}
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
          onAddSubscription={() => handleOpenAddSubscriptionDialog(selectedUserDetails)} // <-- تم تغيير اسم الخاصية إلى onAddSubscription
        />
      )}
      {addSubscriptionDialogOpen && activeUserForDialog && (
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          onClose={handleCloseAddSubscriptionDialog}
          user={activeUserForDialog} // <--- قم بتمرير الكائن بأكمله هنا
          onSuccess={handleSubscriptionAdded}
          subscriptionTypes={subscriptionTypes} // هذه الخصائص الأخرى تبدو صحيحة
          availableSources={(availableSources || []).map((s) => s.value)} // هذه الخصائص الأخرى تبدو صحيحة
        />
      )}

      {/* <<<--- تم إضافة المربع الحواري للتصدير هنا ---<<< */}
      {exportDialogOpen && (
        <ExportUsersDialog
          open={exportDialogOpen}
          onClose={handleCloseExportDialog}
          onSubmit={handleExportSubmit} // تمرير دالة الإرسال
          currentSearchTerm={globalSearchTerm} // تمرير مصطلح البحث الحالي
        />
      )}
      {/* >>>-------------------------------------------->>> */}

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
