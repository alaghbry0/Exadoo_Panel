// /src/layouts/tables/index.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom"; // ✅ 1. تم استيراد useLocation
import debounce from "lodash.debounce"; // استيراد Debounce لتحسين البحث
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
import { useSubscriptionHistory } from "./hooks/useSubscriptionHistory";

// Components
import TabsManager from "./components/TabsManager";
import SubscriptionFormModal from "./components/SubscriptionFormModal";
import CustomAlert from "./components/common/CustomAlert";
import SubscriptionsTabContent from "./components/SubscriptionsTabContent";
import SubscriptionHistoryTabContent from "./components/SubscriptionHistoryTabContent";

// API
import {
  getSubscriptionsMeta,
  addOrRenewSubscriptionAdmin,
  updateSubscriptionAdmin,
} from "services/api";

function Tables() {
  const location = useLocation(); // ✅ 2. تهيئة useLocation

  // دالة مساعدة لقراءة قيمة من search params
  const getSearchParam = (paramName) => {
    const params = new URLSearchParams(location.search);
    return params.get(paramName) || "";
  };

  const [activeTab, setActiveTab] = useState(0);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState("add_or_renew");
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // ✅ 3. تهيئة globalSearchTerm بالقيمة من الرابط
  const [globalSearchTerm, setGlobalSearchTerm] = useState(() => getSearchParam("search"));

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --- Hook for Subscriptions Tab (Tab 0) ---
  const {
    subscriptions,
    loading: subsLoading,
    error: subsError,
    setError: setSubsError,
    tableQueryOptions: subsQueryOptions,
    setTableQueryOptions: setSubsQueryOptions,
    pagination: subsPagination,
    statistics: subsStatistics,
    customFilters: subsCustomFilters,
    handleCustomFilterChange: handleSubsCustomFilterChange,
    fetchData: fetchSubscriptionsDataHook,
  } = useSubscriptions(showSnackbar, globalSearchTerm); // ✅ 4. تم تمرير globalSearchTerm

  // --- Hook for Subscription History Tab (Tab 1) ---
  const {
    historyData,
    loading: historyLoading,
    error: historyError,
    setError: setHistoryError,
    tableQueryOptions: historyQueryOptions,
    setTableQueryOptions: setHistoryQueryOptions,
    pagination: historyPagination,
    customFilters: historyCustomFilters,
    handleCustomFilterChange: handleHistoryCustomFilterChange,
    fetchData: fetchHistoryDataHook,
  } = useSubscriptionHistory(showSnackbar, globalSearchTerm); // ✅ 4. تم تمرير globalSearchTerm

  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const metaData = await getSubscriptionsMeta();
        setSubscriptionTypes(metaData.subscription_types || []);
        setSubscriptionPlans(metaData.subscription_plans || []);
        setAvailableSources(metaData.available_sources || []);
      } catch (err) {
        showSnackbar("Error fetching filter data: " + (err.message || "Unknown error"), "error");
      }
    };
    fetchFilterMetadata();
  }, [showSnackbar]);

  // ✅ 5. useEffect لمزامنة التغييرات في الرابط مع حالة البحث
  useEffect(() => {
    const newSearch = getSearchParam("search");
    // إذا كانت قيمة البحث الجديدة مختلفة عن الحالية
    if (newSearch !== globalSearchTerm) {
      // إذا كان هناك بحث جديد قادم من الخارج، انتقل إلى التبويب الأول (الاشتراكات النشطة)
      if (newSearch) {
        setActiveTab(0);
      }
      setGlobalSearchTerm(newSearch);
    }
  }, [location.search]); // يعتمد على تغييرات الرابط

  // --- دالة بحث محسّنة باستخدام debounce ---
  const handleGlobalSearchChange = useCallback(
    debounce((value) => {
      setGlobalSearchTerm(value);
    }, 400), // انتظر 400ms بعد توقف المستخدم عن الكتابة
    [] // تأكد من أن الدالة لا يُعاد إنشاؤها في كل مرة
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // يمكنك اختيار مسح البحث عند التبديل بين التبويبات أو إبقائه
    // setGlobalSearchTerm("");
  };

  const handleRefreshData = useCallback(async () => {
    showSnackbar("Refreshing data...", "info");
    try {
      if (activeTab === 0) {
        await fetchSubscriptionsDataHook();
      } else if (activeTab === 1) {
        await fetchHistoryDataHook();
      }
    } catch (refreshError) {
      showSnackbar("Error refreshing data: " + (refreshError.message || "Unknown error"), "error");
    }
  }, [activeTab, fetchSubscriptionsDataHook, fetchHistoryDataHook, showSnackbar]);

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
        await updateSubscriptionAdmin(subscriptionIdToUpdate, formData);
        showSnackbar("Subscription updated successfully!", "success");
      } else {
        await addOrRenewSubscriptionAdmin(formData);
        showSnackbar("Subscription added/renewed successfully!", "success");
      }
      handleCloseModal();
      await handleRefreshData(); // استدعاء await هنا لضمان التحديث قبل أي شيء آخر
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Error processing form";
      showSnackbar(errorMessage, "error");
    }
  };

  const isAnyLoading = useMemo(() => subsLoading || historyLoading, [subsLoading, historyLoading]);
  const currentTabSpinnerOnRefresh = useMemo(() => {
    if (activeTab === 0) return subsLoading && subscriptions.length > 0;
    if (activeTab === 1) return historyLoading && historyData.length > 0;
    return false;
  }, [activeTab, subsLoading, subscriptions.length, historyLoading, historyData.length]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardLayout>
        <DashboardNavbar
          onSearchChange={handleGlobalSearchChange}
          searchLabel={activeTab === 0 ? "بحث في الاشتراكات..." : "بحث في السجل..."}
          initialValue={globalSearchTerm} // ✅ 6. تمرير القيمة الأولية لشريط البحث
        />
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
                    إدارة الاشتراكات
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
                  <TabsManager activeTab={activeTab} handleTabChange={handleTabChange} />
                  <Tooltip title="تحديث البيانات">
                    <IconButton onClick={handleRefreshData} color="info" disabled={isAnyLoading}>
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
                    pagination={subsPagination}
                    statistics={subsStatistics}
                    customFilters={subsCustomFilters}
                    handleCustomFilterChange={handleSubsCustomFilterChange}
                    subscriptionTypes={subscriptionTypes}
                    subscriptionPlans={subscriptionPlans}
                    availableSources={availableSources}
                    onAddNewOrRenewClick={handleOpenAddOrRenewModal}
                    onEditExistingClick={handleOpenEditExistingModal}
                    onDataShouldRefresh={handleRefreshData}
                    showSnackbar={showSnackbar}
                  />
                )}

                {activeTab === 1 && (
                  <SubscriptionHistoryTabContent
                    historyData={historyData}
                    loading={historyLoading}
                    error={historyError}
                    setError={setHistoryError}
                    queryOptions={historyQueryOptions}
                    setQueryOptions={setHistoryQueryOptions}
                    pagination={historyPagination}
                    customFilters={historyCustomFilters}
                    handleCustomFilterChange={handleHistoryCustomFilterChange}
                    availableSources={availableSources}
                    showSnackbar={showSnackbar}
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
          availableSources={availableSources.map((s) => s.value)}
          mode={formModalMode}
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
