// src/layouts/Users/index.js
import React, { useState, useEffect, useCallback, forwardRef, useMemo, useRef } from "react";
import {
  Card,
  CircularProgress,
  Snackbar as MuiSnackbar, // Renamed to avoid conflict if we use custom Snackbar later
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton, // Using MuiButton for DialogActions for now
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MuiAlert from "@mui/material/Alert";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // Use MDButton where appropriate
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Hooks
import { useUsers } from "./hooks/useUsers"; // Already correct

// Components
import UsersTableToolbar from "./components/UsersTableToolbar";
import UsersTable from "./components/UsersTable";
import UserDetailsDialog from "./components/UserDetailsDialog";
import AddSubscriptionDialog from "./components/AddSubscriptionDialog";
// API - if needed directly, else it's in the hook
// import { getUsers, getUserDetails } from "../../../services/api"; // Likely handled by useUsers

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Users() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(false);
  const [activeUserForDialog, setActiveUserForDialog] = useState(null); // For passing to dialogs

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

  const {
    users,
    loading,
    loadingMore,
    error, // You might want to display this error more prominently
    // rowsPerPage, // We'll pass this to UsersTable if needed by API
    totalUsers,
    order,
    orderBy,
    fetchInitialData,
    handleRequestSort,
    // handleChangeRowsPerPage, // Pass to UsersTable if API needs it and you add a selector
    handleLoadMore,
    hasMoreData,
    selectedUser, // This is for user details dialog
    userDetailsLoading,
    userDetailsError,
    fetchUserDetails,
    clearSelectedUser,
  } = useUsers(showSnackbar); // Pass our snackbar

  // Initial data fetch and re-fetch on globalSearchTerm change
  useEffect(() => {
    fetchInitialData(globalSearchTerm);
  }, [globalSearchTerm, fetchInitialData]);

  const handleGlobalSearchChange = useCallback((value) => {
    setGlobalSearchTerm(value);
    // fetchInitialData will be called by the useEffect above
  }, []);

  const handleRefreshData = useCallback(async () => {
    showSnackbar("Refreshing user data...", "info");
    try {
      await fetchInitialData(globalSearchTerm);
      showSnackbar("User data refreshed!", "success");
    } catch (e) {
      showSnackbar("Failed to refresh user data.", "error");
      console.error("Refresh error:", e);
    }
  }, [fetchInitialData, globalSearchTerm, showSnackbar]);

  // User Details Dialog Handlers
  const handleOpenUserDetails = useCallback(
    (user) => {
      fetchUserDetails(user.telegram_id); // Fetches details and sets selectedUser in the hook
      setActiveUserForDialog(user); // Keep a reference if needed for other actions from the list
      setUserDetailsDialogOpen(true);
    },
    [fetchUserDetails]
  );

  const handleCloseUserDetailsDialog = () => {
    setUserDetailsDialogOpen(false);
    clearSelectedUser(); // Clears selectedUser in the hook
    setActiveUserForDialog(null);
  };

  // Add Subscription Dialog Handlers
  const handleOpenAddSubscriptionDialog = useCallback((user) => {
    // If called from UserDetailsDialog, 'user' will be selectedUser.
    // If called directly from table row, 'user' is the row user.
    setActiveUserForDialog(user);
    setAddSubscriptionDialogOpen(true);
  }, []);

  const handleCloseAddSubscriptionDialog = () => {
    setAddSubscriptionDialogOpen(false);
    // setActiveUserForDialog(null); // Keep activeUserForDialog if UserDetailsDialog is still open
  };

  const handleSubscriptionAdded = async () => {
    showSnackbar("Subscription added/updated. Refreshing data...", "success");
    // Refresh user list
    await fetchInitialData(globalSearchTerm);
    // If user details dialog is open and pertains to the user for whom sub was added, refresh its data
    if (
      userDetailsDialogOpen &&
      selectedUser &&
      activeUserForDialog &&
      selectedUser.telegram_id === activeUserForDialog.telegram_id
    ) {
      await fetchUserDetails(selectedUser.telegram_id);
    }
    setAddSubscriptionDialogOpen(false);
  };

  const isAnyLoading = useMemo(
    () => loading || loadingMore || userDetailsLoading,
    [loading, loadingMore, userDetailsLoading]
  );

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
                {/* You can add a count here if desired, similar to Tables page, e.g., totalUsers */}
              </MDBox>

              <UsersTableToolbar
                onRefreshClick={handleRefreshData}
                // onAddNewUserClick={() => { /* TODO: Implement Add User Modal if needed */ }}
                // For future filters:
                // onFilterChange={(newFilters) => handleUserFilterChange(newFilters, globalSearchTerm)}
                // filters={userFilters}
                loading={loading}
              />

              {error && !loading && (
                <MDBox px={3} py={1}>
                  <MuiAlert severity="error" sx={{ width: "100%" }}>
                    {typeof error === "object" ? JSON.stringify(error) : error}
                  </MuiAlert>
                </MDBox>
              )}

              <UsersTable
                users={users}
                loading={loading} // For initial skeleton
                loadingMore={loadingMore} // For "Load More" button spinner
                order={order}
                orderBy={orderBy}
                onRequestSort={(event, property) =>
                  handleRequestSort(event, property, globalSearchTerm)
                }
                onLoadMore={() => handleLoadMore(globalSearchTerm)}
                hasMore={hasMoreData}
                totalCount={totalUsers}
                onViewDetailsClick={handleOpenUserDetails}
                onAddSubscriptionClick={handleOpenAddSubscriptionDialog}
                // Pass rowsPerPage and onRowsPerPageChange if you implement a selector for it
                // rowsPerPage={rowsPerPage}
                // onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, globalSearchTerm)}
              />
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {userDetailsDialogOpen && selectedUser && (
        <UserDetailsDialog
          open={userDetailsDialogOpen}
          onClose={handleCloseUserDetailsDialog}
          user={selectedUser} // selectedUser is fetched by fetchUserDetails
          loading={userDetailsLoading}
          error={userDetailsError}
          onAddSubscription={() => handleOpenAddSubscriptionDialog(selectedUser)} // Pass the detailed user
        />
      )}

      {addSubscriptionDialogOpen && activeUserForDialog && (
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          onClose={handleCloseAddSubscriptionDialog}
          user={activeUserForDialog} // Use activeUserForDialog which is set before opening
          onSuccess={handleSubscriptionAdded}
          // You'll need to fetch subscriptionTypes and sources similar to Tables page
          // subscriptionTypes={subscriptionTypes}
          // availableSources={availableSources}
        />
      )}

      <MuiSnackbar
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
      </MuiSnackbar>
      <Footer />
    </DashboardLayout>
  );
}

export default Users;
