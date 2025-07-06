// src/layouts/payments/PaymentsPage.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Card, CircularProgress, Snackbar, IconButton, Tooltip, Grid, Paper } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReplayIcon from "@mui/icons-material/Replay"; // 👈 1. تم استيراد الأيقونة الجديدة
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDTypography from "components/MDTypography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DataTable from "examples/Tables/DataTable";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Hooks & API
import usePayments from "./hooks/usePayments";
import { getPaymentsMeta, retryPaymentRenewal } from "services/api"; // 👈 2. تم استيراد دالة API الجديدة

// Components
import PaymentsTableToolbar from "./components/PaymentsTableToolbar";
import PaymentDetailsDialog from "./PaymentDetailsDialog";
import CustomAlert from "layouts/tables/components/common/CustomAlert";
import { BASE_COLUMNS_CONFIG, INITIAL_VISIBLE_COLUMNS } from "./payments.config";
import { formatStatus, formatAmount, formatDate } from "./components/payments.utils";

// مكون بسيط لعرض الإحصائيات
const StatsCard = ({ title, count, color = "text", format = (val) => val }) => (
  <Paper elevation={2} sx={{ p: 2, textAlign: "center", height: "100%" }}>
    <MDTypography variant="button" color={color} fontWeight="bold" textTransform="uppercase">
      {title}
    </MDTypography>
    <MDTypography variant="h4" fontWeight="bold">
      {format(count)}
    </MDTypography>
  </Paper>
);

function PaymentsPage() {
  const location = useLocation();

  const getSearchParam = (paramName) => {
    const params = new URLSearchParams(location.search);
    return params.get(paramName) || "";
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [globalSearchTerm, setGlobalSearchTerm] = useState(() => getSearchParam("search"));
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [isRetrying, setIsRetrying] = useState(null); // 👈 3. حالة جديدة لتتبع الدفعة التي يعاد محاولتها

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const {
    payments,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions,
    pagination,
    statistics,
    customFilters,
    handleCustomFilterChange,
    fetchData: refreshData,
  } = usePayments(showSnackbar, globalSearchTerm);

  useEffect(() => {
    const newSearch = getSearchParam("search");
    if (newSearch !== globalSearchTerm) {
      setGlobalSearchTerm(newSearch);
    }
  }, [location.search]);

  // --- State for filter metadata ---
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const meta = await getPaymentsMeta();
        setSubscriptionTypes(meta.subscription_types || []);
        setSubscriptionPlans(meta.subscription_plans || []);
        setPaymentMethods(meta.payment_methods || []);
      } catch (err) {
        showSnackbar("Error fetching filter data.", "error");
      }
    };
    fetchMeta();
  }, [showSnackbar]);

  // 👈 4. الدالة الجديدة لإعادة محاولة الدفع
  const handleRetry = useCallback(
    async (paymentId) => {
      setIsRetrying(paymentId); // عرض مؤشر التحميل للزر المحدد
      try {
        const response = await retryPaymentRenewal(paymentId);
        showSnackbar(response.message || "إعادة المحاولة بدأت بنجاح!", "success");
        // تحديث بعد 5 ثوانٍ لإعطاء وقت للمعالجة في الخلفية
        setTimeout(() => {
          refreshData();
        }, 5000);
      } catch (err) {
        const errorMessage = err.response?.data?.error || "فشل في بدء إعادة المحاولة.";
        showSnackbar(errorMessage, "error");
      } finally {
        setIsRetrying(null); // إخفاء مؤشر التحميل
      }
    },
    [refreshData, showSnackbar]
  );

  const handleSort = (sortedColumn) => {
    if (sortedColumn && sortedColumn.length > 0) {
      const { id, desc } = sortedColumn[0];
      setTableQueryOptions((prev) => ({
        ...prev,
        sort_by: id,
        sort_order: desc ? "desc" : "asc",
        page: 1,
      }));
    }
  };

  const handleColumnVisibilityChange = useCallback((accessor) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [accessor]: !prev[accessor],
    }));
  }, []);

  const handleOpenUserDetails = useCallback((payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  }, []);

  // 👈 5. تم تحديث عمود الإجراءات وإضافة isRetrying و handleRetry للاعتماديات
  const tableColumns = useMemo(() => {
    const actionColumn = {
      Header: "الإجراءات",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      Cell: ({ row }) => {
        const payment = row.original;
        return (
          <MDBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton size="small" onClick={() => handleOpenUserDetails(payment)} color="info">
                <VisibilityIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>

            {/* ⭐⭐⭐ إضافة الزر الجديد هنا ⭐⭐⭐ */}
            {payment.status === "failed" && (
              <Tooltip title="إعادة محاولة التجديد">
                <span>
                  {" "}
                  {/* Span ضروري للـ Tooltip على زر معطل */}
                  <IconButton
                    size="small"
                    onClick={() => handleRetry(payment.id)}
                    color="warning"
                    disabled={isRetrying === payment.id} // تعطيل الزر أثناء المحاولة
                  >
                    {isRetrying === payment.id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <ReplayIcon fontSize="inherit" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </MDBox>
        );
      },
    };

    const filteredBase = BASE_COLUMNS_CONFIG.filter((col) => visibleColumns[col.accessor]);
    const formattedBase = filteredBase.map((col) => {
      if (col.accessor === "status") return { ...col, Cell: ({ value }) => formatStatus(value) };
      if (col.accessor === "amount")
        return {
          ...col,
          Cell: ({ row }) => formatAmount(row.original.amount, row.original.currency),
        };
      if (col.accessor === "created_at" || col.accessor === "processed_at")
        return { ...col, Cell: ({ value }) => formatDate(value) };
      return col;
    });

    return [...formattedBase, actionColumn];
  }, [visibleColumns, handleOpenUserDetails, isRetrying, handleRetry]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardLayout>
        <DashboardNavbar
          onSearchChange={setGlobalSearchTerm}
          searchLabel="بحث في المدفوعات..."
          initialValue={globalSearchTerm}
        />
        <MDBox pt={6} pb={3}>
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
                جدول المدفوعات
              </MDTypography>
              <Tooltip title="تحديث البيانات">
                <IconButton onClick={refreshData} color="inherit" disabled={loading}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </MDBox>

            <MDBox p={2}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md>
                  <StatsCard title="إجمالي المدفوعات" count={statistics?.total_records ?? 0} />
                </Grid>
                <Grid item xs={6} sm={4} md>
                  <StatsCard
                    title="مكتملة"
                    count={statistics?.completed_count ?? 0}
                    color="success"
                  />
                </Grid>
                <Grid item xs={6} sm={4} md>
                  <StatsCard
                    title="قيد الانتظار"
                    count={statistics?.pending_count ?? 0}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={6} sm={4} md>
                  <StatsCard title="فاشلة" count={statistics?.failed_count ?? 0} color="error" />
                </Grid>
              </Grid>
            </MDBox>

            <PaymentsTableToolbar
              onFilterChange={handleCustomFilterChange}
              filters={customFilters}
              subscriptionTypes={subscriptionTypes}
              subscriptionPlans={subscriptionPlans}
              paymentMethods={paymentMethods}
              allColumns={BASE_COLUMNS_CONFIG}
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
            />

            {error && !loading && (
              <MDBox p={2}>
                <CustomAlert severity="error">{error}</CustomAlert>
              </MDBox>
            )}

            <MDBox pt={1} sx={{ position: "relative" }}>
              {loading && payments.length === 0 && (
                <MDBox display="flex" justifyContent="center" py={5}>
                  <CircularProgress color="info" />
                </MDBox>
              )}
              <DataTable
                table={{ columns: tableColumns, rows: payments }}
                manualPagination
                manualSortBy
                onSortByChange={handleSort}
                pageCount={pagination?.totalPages || 1}
                page={tableQueryOptions.page - 1}
                onPageChange={(p) => setTableQueryOptions((prev) => ({ ...prev, page: p + 1 }))}
                entriesPerPage={{
                  defaultValue: tableQueryOptions.pageSize,
                  options: [10, 20, 50, 100],
                }}
                onEntriesPerPageChange={(ps) =>
                  setTableQueryOptions((prev) => ({ ...prev, pageSize: ps, page: 1 }))
                }
                showTotalEntries={pagination?.total > 0}
                totalEntries={pagination?.total}
                noEndBorder
                canSearch={false}
                sx={loading && payments.length > 0 ? { opacity: 0.7 } : {}}
              />
            </MDBox>
          </Card>
        </MDBox>

        {selectedPayment && (
          <PaymentDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            payment={selectedPayment}
            showSnackbar={showSnackbar}
            onRetrySuccess={refreshData}
          />
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <CustomAlert
            onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </CustomAlert>
        </Snackbar>
      </DashboardLayout>
    </LocalizationProvider>
  );
}

export default PaymentsPage;
