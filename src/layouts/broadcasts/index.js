// src/layouts/broadcasts/index.js

import { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Broadcasts page components
import BroadcastComposer from "layouts/broadcasts/components/BroadcastComposer";
import BroadcastHistory from "layouts/broadcasts/components/BroadcastHistory";

// API calls
import { getTargetGroups, getAvailableVariables } from "services/api";

function Broadcasts() {
  const [loading, setLoading] = useState(true);
  const [composerData, setComposerData] = useState({ targetGroups: null, variables: null });
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", title: "", message: "" });

  // Re-rendering BroadcastHistory with a new key ensures it fetches fresh data independently.
  const [historyKey, setHistoryKey] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsData, variablesData] = await Promise.all([
          getTargetGroups(),
          getAvailableVariables(),
        ]);
        setComposerData({
          targetGroups: groupsData,
          variables: variablesData,
        });
      } catch (error) {
        setSnackbar({
          open: true,
          color: "error",
          // Translation:
          title: "Data Fetch Error",
          message: "Failed to load initial targeting and variable data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBroadcastSent = useCallback(() => {
    setSnackbar({
      open: true,
      color: "success",
      // Translation:
      title: "Success",
      message: "The broadcast job has started.",
    });
    // Refresh the history by changing the key, forcing a full remount and data fetch.
    setHistoryKey(Date.now());
  }, []);

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const renderContent = () => {
    if (loading) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress color="info" />
        </MDBox>
      );
    }

    return (
      // UX Improvement: Using a stacked layout for better focus and responsiveness.
      <Grid container spacing={3}>
        {/* Broadcast Composer */}
        <Grid item xs={12}>
          <BroadcastComposer
            data={composerData}
            onBroadcastSent={handleBroadcastSent}
            setSnackbar={setSnackbar}
          />
        </Grid>

        {/* Broadcast History */}
        <Grid item xs={12}>
          {/* UX Improvement: Wrapping history in a Card for consistent styling. */}
          <Card>
            <BroadcastHistory key={historyKey} setSnackbar={setSnackbar} />
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          {/* Translation: */}
          <MDTypography variant="h4" fontWeight="medium">
            Marketing Broadcasts
          </MDTypography>
          <MDTypography variant="button" color="text">
            Send targeted messages to user groups and track your sending history.
          </MDTypography>
        </MDBox>

        {renderContent()}
      </MDBox>
      <Footer />
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={snackbar.title}
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
      />
    </DashboardLayout>
  );
}

export default Broadcasts;
