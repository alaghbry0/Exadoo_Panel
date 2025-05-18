import React, { useState, useEffect, useMemo, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getIncomingTransactions } from "services/api"; // تأكد أن هذه الدالة تستقبل البارامترات الجديدة
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// استيراد ملفات الكونفيج والحوارات الجديدة
import IncomingTransactionsFilterDialog from "./IncomingTransactionsFilterDialog";
import IncomingTransactionDetailsDialog from "./IncomingTransactionDetailsDialog";
import {
  INITIAL_FILTERS_INCOMING,
  INITIAL_VISIBLE_COLUMNS_INCOMING,
  BASE_COLUMNS_CONFIG_INCOMING,
} from "./incoming-transactions.config";
import {
  formatProcessedStatus,
  formatIncomingAmount,
  formatDateSimple,
  createIncomingTransactionRow,
} from "./incoming-transactions.utils";
// يمكنك استيراد copyToClipboardUtil من utils مشترك إذا أردت
import { generalCopyToClipboard as copyToClipboardUtil } from "./incoming-transactions.utils";

function IncomingTransactionsPage() {
  const [transactionsData, setTransactionsData] = useState([]); // تم تغيير الاسم
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS_INCOMING);
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS_INCOMING);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // تم تغيير الاسم
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPageApi, setCurrentPageApi] = useState(1);
  const [pageSizeApi, setPageSizeApi] = useState(INITIAL_FILTERS_INCOMING.page_size);
  const [processedTransactionsCount, setProcessedTransactionsCount] = useState(0); // إحصائية جديدة

  const currentPageTable = useMemo(() => currentPageApi - 1, [currentPageApi]);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchData = useCallback(
    async (fetchFilters) => {
      setLoading(true);
      try {
        const paramsToSend = { ...fetchFilters };
        if (paramsToSend.processed === "all") delete paramsToSend.processed;
        // لا حاجة لحذف payment_method لأنه غير موجود في فلاتر هذه الصفحة
        if (searchTerm) paramsToSend.search = searchTerm;

        // استدعاء API جديد
        const response = await getIncomingTransactions(paramsToSend);

        if (response && response.data) {
          setTransactionsData(response.data);
          setTotalRecords(response.total || 0); // تأكد من أن الخادم يرجع "total"
          setCurrentPageApi(response.page || 1); // تأكد من أن الخادم يرجع "page"
          setPageSizeApi(response.page_size || INITIAL_FILTERS_INCOMING.page_size); // تأكد من أن الخادم يرجع "page_size"
          setProcessedTransactionsCount(response.processed_count || 0); // إحصائية جديدة
        } else {
          showSnackbar("لم يتم استلام بيانات صحيحة من الخادم", "warning");
          setTransactionsData([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Error fetching incoming transactions:", error);
        const errorMessage =
          error.response?.data?.details || error.message || "حدث خطأ أثناء جلب البيانات";
        showSnackbar(errorMessage, "error");
        setTransactionsData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, showSnackbar] // لا حاجة لـ INITIAL_FILTERS_INCOMING هنا
  );

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]); // fetchData الآن يعتمد على searchTerm و showSnackbar

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, page: 1 })); // إعادة التعيين للصفحة الأولى عند البحث
  };

  const handleDialogFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 })); // إعادة التعيين للصفحة الأولى عند تطبيق الفلاتر
    setOpenFilterDialog(false);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS_INCOMING);
    setVisibleColumns(INITIAL_VISIBLE_COLUMNS_INCOMING);
    setSearchTerm(""); // مسح البحث أيضاً
    setOpenFilterDialog(false);
  };

  const handleColumnVisibilityChange = (columnAccessor) => {
    setVisibleColumns((prev) => ({ ...prev, [columnAccessor]: !prev[columnAccessor] }));
  };

  const handlePageChange = (newPageTable) => {
    // newPageTable من DataTable يبدأ من 0
    setFilters((prev) => ({ ...prev, page: newPageTable + 1 }));
  };

  const handleEntriesPerPageChange = (newPageSize) => {
    setFilters((prev) => ({ ...prev, page_size: newPageSize, page: 1 }));
  };

  const handleRefresh = () => {
    fetchData(filters); // fetchData سيعين setLoading(true)
    showSnackbar("تم تحديث البيانات بنجاح", "success");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleViewDetails = (transaction) => {
    // تم تغيير الاسم
    setSelectedTransaction(transaction); // تم تغيير الاسم
    setDetailsDialogOpen(true);
  };

  const tableColumns = useMemo(() => {
    const actionColumn = {
      Header: "الإجراءات",
      accessor: "actions",
      align: "center",
      disableSortBy: true, // عادة لا يتم فرز عمود الإجراءات
    };
    // استخدام BASE_COLUMNS_CONFIG_INCOMING
    const filteredBaseColumns = BASE_COLUMNS_CONFIG_INCOMING.filter(
      (column) => visibleColumns[column.accessor]
    );
    // إضافة عمود الإجراءات دائماً في النهاية
    return [...filteredBaseColumns, actionColumn];
  }, [visibleColumns]); // لا حاجة لـ BASE_COLUMNS_CONFIG_INCOMING هنا لأنه ثابت

  const visibleColumnsKeys = useMemo(
    () => Object.keys(visibleColumns).filter((key) => visibleColumns[key]),
    [visibleColumns]
  );

  const tableRows = useMemo(() => {
    if (!Array.isArray(transactionsData)) return []; // استخدام transactionsData
    const formatters = {
      formatProcessed: formatProcessedStatus,
      formatAmount: formatIncomingAmount,
      formatDate: formatDateSimple,
    };
    const actionHandlers = { handleView: handleViewDetails };
    // استخدام createIncomingTransactionRow
    return transactionsData.map((transaction) =>
      createIncomingTransactionRow(
        transaction,
        visibleColumnsKeys,
        actionHandlers,
        formatters,
        showSnackbar
      )
    );
  }, [transactionsData, visibleColumnsKeys, showSnackbar, handleViewDetails]); // showSnackbar و handleViewDetails يجب أن تكونا في الاعتماديات إذا كانتا تتغيران

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
                bgColor="info" // يمكنك تغيير اللون إذا أردت
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    جدول المعاملات الواردة {/* تغيير العنوان */}
                  </MDTypography>
                  <MDBox mx={2} display="flex" alignItems="center">
                    <Chip
                      label={`إجمالي: ${totalRecords}`}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", mr: 1 }}
                    />
                    <Chip
                      label={`معالجة: ${processedTransactionsCount}`}
                      size="small"
                      color="success" // أو اللون المناسب
                      sx={{ backgroundColor: "rgba(76,175,80,0.6)", color: "white" }}
                    />
                  </MDBox>
                </MDBox>
                <MDBox display="flex">
                  <Tooltip title="تحديث البيانات">
                    <IconButton color="inherit" onClick={handleRefresh} disabled={loading}>
                      {loading && transactionsData.length > 0 ? ( // أيقونة تحميل مختلفة أثناء التحديث
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="فلاتر البحث">
                    <IconButton
                      color="inherit"
                      onClick={() => setOpenFilterDialog(true)}
                      disabled={loading} // تعطيل أثناء أي نوع من التحميل
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                </MDBox>
              </MDBox>

              <MDBox pt={3} sx={{ position: "relative" }}>
                {loading && transactionsData.length > 0 && (
                  <MDBox
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                      borderRadius: "inherit",
                    }}
                  >
                    <CircularProgress color="info" />
                  </MDBox>
                )}

                {loading && transactionsData.length === 0 ? (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="300px"
                  >
                    <CircularProgress color="info" />
                  </MDBox>
                ) : transactionsData.length === 0 && !loading ? (
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
                    isSorted // إذا كنت تريد الفرز الافتراضي
                    entriesPerPage={{ defaultValue: pageSizeApi, options: [10, 20, 50, 100] }}
                    showTotalEntries={totalRecords > 0 && tableRows.length > 0}
                    noEndBorder
                    canSearch={false} // البحث يتم عبر Navbar
                    pagination={{ variant: "gradient", color: "info" }}
                    // Props للترقيم اليدوي
                    manualPagination
                    pageCount={pageCount > 0 ? pageCount : 1} // يجب أن يكون على الأقل 1
                    page={currentPageTable} // DataTable يتوقع صفحة تبدأ من 0
                    onPageChange={handlePageChange}
                    onEntriesPerPageChange={handleEntriesPerPageChange}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <IncomingTransactionsFilterDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        filters={filters}
        onFilterChange={handleDialogFilterChange}
        visibleColumns={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {selectedTransaction && (
        <IncomingTransactionDetailsDialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          transaction={selectedTransaction} // تم تغيير الاسم
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

export default IncomingTransactionsPage;
