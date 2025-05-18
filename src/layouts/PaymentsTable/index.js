// src/layouts/payments/PaymentsPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getPayments } from "services/api";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import PaymentsFilterDialog from "./PaymentsFilterDialog";
import PaymentDetailsDialog from "./PaymentDetailsDialog";
import { INITIAL_FILTERS, INITIAL_VISIBLE_COLUMNS, BASE_COLUMNS_CONFIG } from "./payments.config";
import {
  formatStatus,
  formatAmount,
  formatPaymentMethod,
  createPaymentRow,
} from "./payments.utils";

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true); // حالة التحميل الرئيسية
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPageApi, setCurrentPageApi] = useState(1);
  const [pageSizeApi, setPageSizeApi] = useState(INITIAL_FILTERS.page_size);
  const [completedPaymentsCount, setCompletedPaymentsCount] = useState(0);

  const currentPageTable = useMemo(() => currentPageApi - 1, [currentPageApi]);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchData = useCallback(
    async (fetchFilters) => {
      setLoading(true); // بدء التحميل
      try {
        const paramsToSend = { ...fetchFilters };
        if (paramsToSend.status === "all") delete paramsToSend.status;
        if (paramsToSend.payment_method === "all") delete paramsToSend.payment_method;
        if (searchTerm) paramsToSend.search = searchTerm;

        const response = await getPayments(paramsToSend);

        if (response && response.data) {
          setPayments(response.data);
          setTotalRecords(response.total || 0);
          setCurrentPageApi(response.page || 1);
          setPageSizeApi(response.page_size || INITIAL_FILTERS.page_size);
          setCompletedPaymentsCount(response.completed_count || 0);
        } else {
          showSnackbar("لم يتم استلام بيانات صحيحة من الخادم", "warning");
          setPayments([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        const errorMessage =
          error.response?.data?.details || error.message || "حدث خطأ أثناء جلب البيانات";
        showSnackbar(errorMessage, "error");
        setPayments([]);
        setTotalRecords(0);
      } finally {
        setLoading(false); // انتهاء التحميل
      }
    },
    [searchTerm, showSnackbar]
  );

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleDialogFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    setOpenFilterDialog(false);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setVisibleColumns(INITIAL_VISIBLE_COLUMNS);
    setSearchTerm("");
    setOpenFilterDialog(false);
  };

  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handlePageChange = (newPageTable) => {
    setFilters((prev) => ({ ...prev, page: newPageTable + 1 }));
  };

  const handleEntriesPerPageChange = (newPageSize) => {
    setFilters((prev) => ({ ...prev, page_size: newPageSize, page: 1 }));
  };

  const handleRefresh = () => {
    // fetchData سيقوم بتعيين setLoading(true)
    fetchData(filters);
    showSnackbar("تم تحديث البيانات بنجاح", "success"); // قد تظهر هذه قبل انتهاء التحميل، يمكن نقلها إلى finally في fetchData
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const tableColumns = useMemo(() => {
    const subscriptionTypeColumn = {
      Header: "نوع الاشتراك",
      accessor: "subscription_type_name",
      align: "left",
    };
    const actionColumn = {
      Header: "الإجراءات",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
    };
    const filteredBaseColumns = BASE_COLUMNS_CONFIG.filter(
      (column) => visibleColumns[column.accessor]
    );
    const finalColumns = [...filteredBaseColumns];
    if (
      visibleColumns.subscription_type_name &&
      !finalColumns.some((col) => col.accessor === "subscription_type_name")
    ) {
      const existingSubCol = finalColumns.find((col) => col.accessor === "subscription_type_name");
      if (!existingSubCol) {
        finalColumns.push(subscriptionTypeColumn);
      }
    }
    finalColumns.push(actionColumn);
    return finalColumns;
  }, [visibleColumns]);

  const visibleColumnsKeys = useMemo(
    () => Object.keys(visibleColumns).filter((key) => visibleColumns[key]),
    [visibleColumns]
  );

  const tableRows = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    const formatters = { formatAmount, formatPaymentMethod, formatStatus };
    const actionHandlers = { handleView: handleViewDetails };
    return payments.map((payment) =>
      createPaymentRow(payment, visibleColumnsKeys, actionHandlers, formatters, showSnackbar)
    );
  }, [payments, visibleColumnsKeys, showSnackbar, handleViewDetails]);

  const pageCount = Math.ceil(totalRecords / pageSizeApi);

  return (
    <DashboardLayout>
      <DashboardNavbar onSearchChange={handleSearchChange} />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
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
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    جدول المدفوعات
                  </MDTypography>
                  <MDBox mx={2} display="flex" alignItems="center">
                    <Chip
                      label={`إجمالي: ${totalRecords}`}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", mr: 1 }}
                    />
                    <Chip
                      label={`مكتملة: ${completedPaymentsCount}`}
                      size="small"
                      color="success"
                      sx={{ backgroundColor: "rgba(76,175,80,0.6)", color: "white" }}
                    />
                  </MDBox>
                </MDBox>
                <MDBox display="flex">
                  <Tooltip title="تحديث البيانات">
                    <IconButton color="inherit" onClick={handleRefresh} disabled={loading}>
                      {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="فلاتر البحث">
                    <IconButton
                      color="inherit"
                      onClick={() => setOpenFilterDialog(true)}
                      disabled={loading}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                </MDBox>
              </MDBox>

              {/* --- منطقة عرض الجدول ومؤشر التحميل --- */}
              <MDBox pt={3} sx={{ position: "relative" }}>
                {/* مؤشر تحميل التحديث (عندما تكون هناك بيانات قديمة ونقوم بتحديث) */}
                {loading && payments.length > 0 && (
                  <MDBox
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.7)", // لون تعتيم
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10, // ليكون فوق الجدول
                      borderRadius: "inherit", // ليتناسب مع حدود الـ Card الداخلية
                    }}
                  >
                    <CircularProgress color="info" />
                  </MDBox>
                )}

                {/* مؤشر التحميل الأولي (لا توجد بيانات بعد) */}
                {loading && payments.length === 0 ? (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center" // محاذاة رأسية وأفقية
                    py={4} // بعض المساحة العمودية
                    minHeight="300px" // ارتفاع أدنى ليكون مرئيًا بشكل جيد
                  >
                    <CircularProgress color="info" />
                  </MDBox>
                ) : // عرض الجدول إذا لم يكن هناك تحميل أولي
                payments.length === 0 && !loading ? ( // حالة عدم وجود بيانات بعد انتهاء التحميل
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="300px"
                  >
                    <MDTypography variant="h6" color="textSecondary">
                      لا توجد بيانات لعرضها تطابق الفلاتر الحالية.
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns: tableColumns, rows: tableRows }}
                    isSorted
                    entriesPerPage={{ defaultValue: pageSizeApi, options: [10, 20, 50, 100] }}
                    showTotalEntries={totalRecords > 0 && tableRows.length > 0}
                    noEndBorder
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "info" }}
                    manualPagination
                    pageCount={pageCount > 0 ? pageCount : 1}
                    page={currentPageTable}
                    onPageChange={handlePageChange}
                    onEntriesPerPageChange={handleEntriesPerPageChange}
                    // إذا أردت تعتيم الجدول أثناء تحديث البيانات القديمة
                    // sx={loading && payments.length > 0 ? { opacity: 0.6 } : {}}
                  />
                )}
              </MDBox>
              {/* --- نهاية منطقة عرض الجدول --- */}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <PaymentsFilterDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        filters={filters}
        onFilterChange={handleDialogFilterChange}
        visibleColumns={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {selectedPayment && (
        <PaymentDetailsDialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          payment={selectedPayment}
          showSnackbar={showSnackbar}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default PaymentsPage;
