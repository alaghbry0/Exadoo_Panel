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

  // قيم افتراضية تحمي الواجهة حتى لو فشلت النداءات
  const [composerData, setComposerData] = useState({
    targetGroups: {
      general_stats: {
        all_users: 0,
        active_subscribers: 0,
        expired_subscribers: 0,
        no_subscription: 0,
      },
      subscription_types: [],
    },
    variables: { user_variables: [], subscription_variables: [] },
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    color: "info",
    title: "",
    message: "",
    dateTime: new Date().toLocaleString(),
  });

  // notifier موحّد يضمن dateTime و open
  const openSnack = (opts = {}) =>
    setSnackbar((s) => ({
      open: true,
      color: opts.color ?? s.color ?? "info",
      title: opts.title ?? "",
      message: opts.message ?? "",
      dateTime: new Date().toLocaleString(),
    }));

  // نستخدم key لإجبار إعادة تحميل التاريخ بعد الإرسال
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
          targetGroups: groupsData ?? {
            general_stats: {
              all_users: 0,
              active_subscribers: 0,
              expired_subscribers: 0,
              no_subscription: 0,
            },
            subscription_types: [],
          },
          variables: variablesData ?? { user_variables: [], subscription_variables: [] },
        });
      } catch (error) {
        console.error("Initial fetch failed:", error?.response?.data || error);
        openSnack({
          color: "error",
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
    openSnack({
      color: "success",
      title: "Success",
      message: "The broadcast job has started.",
    });
    setHistoryKey(Date.now());
  }, []);

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const renderContent = () => {
    if (loading) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress color="info" />
        </MDBox>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Broadcast Composer */}
        <Grid item xs={12}>
          <Card>
            <BroadcastComposer
              data={composerData}
              onBroadcastSent={handleBroadcastSent}
              setSnackbar={openSnack}
            />
          </Card>
        </Grid>

        {/* Broadcast History */}
        <Grid item xs={12}>
          <Card>
            <BroadcastHistory key={historyKey} setSnackbar={openSnack} />
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
        title={snackbar.title || "Notification"}
        content={snackbar.message || ""}
        dateTime={snackbar.dateTime || new Date().toLocaleString()}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
      />
    </DashboardLayout>
  );
}

export default Broadcasts;
