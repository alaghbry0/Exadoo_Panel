// layouts/tables/index.js
import React, { useState, useEffect, useCallback, forwardRef } from "react";
// ١. استيراد IconButton و RefreshIcon
import { Card, CircularProgress, Snackbar, IconButton, Tooltip, Grid } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MuiAlert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // يمكنك وضع الزر هنا أيضًا إذا أردت
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
import LegacySubscriptionsTable from "layouts/tables/components/LegacySubscriptionsTable";

// Data
import {
  getSubscriptions,
  getSubscriptionTypes,
  addSubscription,
  updateSubscription,
  getSubscriptionSources,
  getPendingSubscriptions,
  handlePendingSubscriptionAction,
  getLegacySubscriptions,
} from "services/api";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Tables() {
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [legacyCount, setLegacyCount] = useState(0);

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(20);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [legacySubscriptions, setLegacySubscriptions] = useState([]);
  const [legacyPage, setLegacyPage] = useState(0);
  const [legacyRowsPerPage, setLegacyRowsPerPage] = useState(20);
  const [legacyTotal, setLegacyTotal] = useState(0);
  const [legacyLoading, setLegacyLoading] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) setPage(0);
    else if (newValue === 1) setPendingPage(0);
    else if (newValue === 2) setLegacyPage(0);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesData = await getSubscriptionTypes();
        setSubscriptionTypes(typesData);
      } catch (err) {
        console.error("Error fetching subscription types:", err);
        showSnackbar("Failed to load subscription types", "error");
      }
      try {
        const sourcesData = await getSubscriptionSources();
        setAvailableSources(sourcesData);
      } catch (err) {
        console.error("Error fetching subscription sources:", err);
        showSnackbar("Failed to load subscription sources", "error");
      }
    };
    fetchInitialData();
  }, []); // لا نضيف showSnackbar هنا لتجنب إعادة الجلب عند كل عرض لـ Snackbar

  const fetchCounts = useCallback(async () => {
    try {
      const pendingData = await getPendingSubscriptions({
        status: "pending",
        page: 1,
        page_size: 1,
      });
      setPendingCount(pendingData.length > 0 ? pendingData[0].total_count || 0 : 0);
    } catch (err) {
      console.error("Error fetching pending counts:", err);
    }
    try {
      const legacyData = await getLegacySubscriptions({
        processed: "false",
        page: 1,
        page_size: 1,
      });
      setLegacyCount(legacyData.length > 0 ? legacyData[0].total_count || 0 : 0);
    } catch (err) {
      console.error("Error fetching legacy counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        ordering: `${order === "desc" ? "-" : ""}${orderBy}`,
        ...filters,
      };
      Object.keys(queryParams).forEach((key) => {
        if (
          queryParams[key] === "" ||
          queryParams[key] === null ||
          queryParams[key] === undefined
        ) {
          delete queryParams[key];
        }
        if (key === "startDate" && queryParams[key]) {
          queryParams[key] = queryParams[key].toISOString().split("T")[0];
        }
        if (key === "endDate" && queryParams[key]) {
          queryParams[key] = queryParams[key].toISOString().split("T")[0];
        }
      });

      const data = await getSubscriptions(queryParams);
      setSubscriptions(data);
      setTotalSubscriptions(
        data.length > 0 && data[0].total_count !== undefined ? data[0].total_count : data.length
      );
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to load subscriptions. Please try again.");
      showSnackbar(`Error: ${err.message || "Could not fetch subscriptions."}`, "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filters, order, orderBy]); // showSnackbar ليست ضرورية هنا لأنها لا تغير منطق الجلب

  const fetchPendingSubscriptions = useCallback(async () => {
    setPendingLoading(true);
    try {
      const queryParams = {
        page: pendingPage + 1,
        page_size: pendingRowsPerPage,
        status: "pending",
      };
      const data = await getPendingSubscriptions(queryParams);
      setPendingSubscriptions(data);
      setPendingTotal(
        data.length > 0 && data[0].total_count !== undefined ? data[0].total_count : data.length
      );
    } catch (err) {
      console.error("Error fetching pending subscriptions:", err);
      showSnackbar(`Error: ${err.message || "Could not fetch pending subscriptions."}`, "error");
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage, pendingRowsPerPage]); // showSnackbar

  const fetchLegacySubscriptions = useCallback(async () => {
    setLegacyLoading(true);
    try {
      const queryParams = {
        page: legacyPage + 1,
        page_size: legacyRowsPerPage,
        processed: "false",
      };
      const data = await getLegacySubscriptions(queryParams);
      setLegacySubscriptions(data);
      setLegacyTotal(
        data.length > 0 && data[0].total_count !== undefined ? data[0].total_count : data.length
      );
    } catch (err) {
      console.error("Error fetching legacy subscriptions:", err);
      showSnackbar(`Error: ${err.message || "Could not fetch legacy subscriptions."}`, "error");
    } finally {
      setLegacyLoading(false);
    }
  }, [legacyPage, legacyRowsPerPage]); // showSnackbar

  useEffect(() => {
    if (activeTab === 0) {
      fetchSubscriptions();
    } else if (activeTab === 1) {
      fetchPendingSubscriptions();
    } else if (activeTab === 2) {
      fetchLegacySubscriptions();
    }
  }, [activeTab, fetchSubscriptions, fetchPendingSubscriptions, fetchLegacySubscriptions]);

  // ٢. إنشاء دالة معالج النقر لزر التحديث
  const handleRefreshData = async () => {
    showSnackbar("Refreshing data...", "info");
    // لا حاجة لإعادة تعيين الصفحة هنا، نريد تحديث البيانات الحالية
    if (activeTab === 0) {
      await fetchSubscriptions();
    } else if (activeTab === 1) {
      await fetchPendingSubscriptions();
    } else if (activeTab === 2) {
      await fetchLegacySubscriptions();
    }
    await fetchCounts(); // تحديث الأعداد أيضًا
    showSnackbar("Data refreshed!", "success");
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setPage(0);
  };

  const handleFilter = (filterValues) => {
    const processedFilters = { ...filterValues };
    if (processedFilters.startDate) {
      processedFilters.startDate =
        processedFilters.startDate.isSameOrAfter(processedFilters.endDate, "day") &&
        processedFilters.endDate
          ? processedFilters.endDate.subtract(1, "day")
          : processedFilters.startDate;
    }
    if (
      processedFilters.endDate &&
      processedFilters.startDate &&
      processedFilters.endDate.isBefore(processedFilters.startDate, "day")
    ) {
      processedFilters.endDate = processedFilters.startDate.add(1, "day");
      showSnackbar("End date cannot be before start date. Adjusted end date.", "warning");
    }
    setFilters(processedFilters);
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    // استخدام متغيرات loading محددة لكل تبويب إذا أردت
    const currentLoadingSetter =
      activeTab === 0 ? setLoading : activeTab === 1 ? setPendingLoading : setLegacyLoading;

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
      // إعادة جلب بيانات التبويب النشط
      if (activeTab === 0) await fetchSubscriptions();
      else if (activeTab === 1) await fetchPendingSubscriptions();
      else if (activeTab === 2) await fetchLegacySubscriptions();

      await fetchCounts();
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        (isEditMode ? "Error updating subscription" : "Error adding subscription");
      showSnackbar(errorMessage, "error");
    } finally {
      currentLoadingSetter(false);
    }
  };

  const handlePendingPageChange = (event, newPage) => {
    setPendingPage(newPage);
  };

  const handlePendingRowsPerPageChange = (event) => {
    setPendingRowsPerPage(parseInt(event.target.value, 10));
    setPendingPage(0);
  };

  const handleApprove = async (id) => {
    setPendingLoading(true);
    try {
      await handlePendingSubscriptionAction(id, "approve");
      showSnackbar("Subscription approved successfully!", "success");
      await fetchPendingSubscriptions();
      await fetchCounts();
      if (activeTab === 0) await fetchSubscriptions();
    } catch (err) {
      console.error("Error approving subscription:", err);
      showSnackbar(err.response?.data?.detail || "Error approving subscription", "error");
    } finally {
      setPendingLoading(false);
    }
  };

  const handleReject = async (id) => {
    setPendingLoading(true);
    try {
      await handlePendingSubscriptionAction(id, "reject");
      showSnackbar("Subscription rejected successfully!", "info");
      await fetchPendingSubscriptions();
      await fetchCounts();
    } catch (err) {
      console.error("Error rejecting subscription:", err);
      showSnackbar(err.response?.data?.detail || "Error rejecting subscription", "error");
    } finally {
      setPendingLoading(false);
    }
  };

  const handleLegacyPageChange = (event, newPage) => {
    setLegacyPage(newPage);
  };

  const handleLegacyRowsPerPageChange = (event) => {
    setLegacyRowsPerPage(parseInt(event.target.value, 10));
    setLegacyPage(0);
  };

  // لتحديد ما إذا كان أي نوع من التحميل نشطًا
  const isAnyLoading = loading || pendingLoading || legacyLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          {" "}
          {/* هذا هو MDBox الخارجي */}
          <Grid container spacing={6}>
            {" "}
            {/* فتح Grid container */}
            <Grid item xs={12}>
              {" "}
              {/* فتح Grid item */}
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
                    Subscriptions Management {/* تم التعديل في الرد السابق، كان Manager */}
                  </MDTypography>
                </MDBox>

                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  px={2}
                  pt={1}
                >
                  <TabsManager
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    pendingCount={pendingCount}
                    legacyCount={legacyCount}
                  />
                  <Tooltip title="Refresh Data">
                    <IconButton onClick={handleRefreshData} color="info" disabled={isAnyLoading}>
                      {isAnyLoading &&
                      ((activeTab === 0 && loading) ||
                        (activeTab === 1 && pendingLoading) ||
                        (activeTab === 2 && legacyLoading)) ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </MDBox>

                {activeTab === 0 && (
                  <>
                    <SubscriptionTableToolbar
                      onSearch={handleSearch}
                      onFilter={handleFilter}
                      subscriptionTypes={subscriptionTypes}
                      onAddNewClick={handleAddNewClick}
                      availableSources={availableSources}
                    />
                    {error && !loading && (
                      <MDBox px={3} py={1}>
                        <MuiAlert
                          severity="error"
                          onClose={() => setError(null)}
                          sx={{ width: "100%" }}
                        >
                          {error}
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
                      loading={loading}
                    />
                  </>
                )}

                {activeTab === 1 && (
                  <>
                    {pendingLoading && pendingSubscriptions.length === 0 ? (
                      <MDBox display="flex" justifyContent="center" p={5}>
                        <CircularProgress />
                      </MDBox>
                    ) : (
                      <PendingSubscriptionsTable
                        pendingSubscriptions={pendingSubscriptions}
                        page={pendingPage}
                        rowsPerPage={pendingRowsPerPage}
                        onPageChange={handlePendingPageChange}
                        onRowsPerPageChange={handlePendingRowsPerPageChange}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        totalCount={pendingTotal}
                        loading={pendingLoading}
                      />
                    )}
                  </>
                )}

                {activeTab === 2 && (
                  <>
                    {legacyLoading && legacySubscriptions.length === 0 ? (
                      <MDBox display="flex" justifyContent="center" p={5}>
                        <CircularProgress />
                      </MDBox>
                    ) : (
                      <LegacySubscriptionsTable
                        legacySubscriptions={legacySubscriptions}
                        page={legacyPage}
                        rowsPerPage={legacyRowsPerPage}
                        onPageChange={handleLegacyPageChange}
                        onRowsPerPageChange={handleLegacyRowsPerPageChange}
                        totalCount={legacyTotal}
                        loading={legacyLoading}
                      />
                    )}
                  </>
                )}
              </Card>{" "}
              {/* إغلاق Card */}
            </Grid>{" "}
            {/* <== إضافة إغلاق Grid item */}
          </Grid>{" "}
          {/* <== إضافة إغلاق Grid container */}
        </MDBox>{" "}
        {/* إغلاق MDBox الخارجي (السطر الذي كان يشير إليه الخطأ) */}
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
