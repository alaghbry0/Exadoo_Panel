import React, { useState, useEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getPayments } from "services/api";
import { format } from "date-fns";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    status: "all",
    payment_method: "all",
    date_from: "",
    date_to: "",
  });
  const [visibleColumns, setVisibleColumns] = useState({
    full_name: true,
    username: true,
    telegram_id: false,
    payment_token: false,
    tx_hash: false,
    amount: true,
    amount_received: true,
    payment_method: true,
    processed_at: true,
    error_message: false,
    status: true,
  });
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [tabValue, setTabValue] = useState("1");
  const [totalRecords, setTotalRecords] = useState(0);

  // دالة لتحديث حالة البحث تُمرر إلى DashboardNavbar
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setFilters({ ...filters, page: 1 }); // إعادة التصفح للصفحة الأولى عند البحث
  };

  // دالة لتحديث الفلاتر
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
      page: 1, // إعادة التصفح للصفحة الأولى عند تغيير الفلاتر
    });
  };

  // دالة لتحديث الأعمدة المرئية
  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    });
  };

  // دالة لتحديث الصفحة
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // دالة لإعادة تحميل البيانات
  const handleRefresh = () => {
    // حذف البيانات المخزنة مؤقتاً
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("payments_")) {
        sessionStorage.removeItem(key);
      }
    });
    fetchData();
    showSnackbar("تم تحديث البيانات بنجاح", "success");
  };

  // دالة لعرض رسائل التنبيه
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // دالة لإخفاء رسائل التنبيه
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // دالة لنسخ النص إلى الحافظة
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showSnackbar("تم نسخ النص بنجاح", "success");
      },
      (err) => {
        showSnackbar("فشل نسخ النص", "error");
        console.error("فشل نسخ النص: ", err);
      }
    );
  };

  // دالة لتغيير التبويب في نافذة التفاصيل
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // دالة لعرض تفاصيل الدفعة
  const handleView = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
    setTabValue("1"); // إعادة تعيين التبويب إلى المعلومات الأساسية
  };

  // دالة لتنسيق حالة الدفعة مع رمز ولون مناسب
  const formatStatus = (status) => {
    const statusMap = {
      completed: { label: "مكتملة", color: "success" },
      pending: { label: "قيد الانتظار", color: "warning" },
      failed: { label: "فاشلة", color: "error" },
      processing: { label: "قيد المعالجة", color: "info" },
      default: { label: status, color: "default" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || statusMap.default;

    return (
      <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="contained" />
    );
  };

  // دالة لتنسيق طريقة الدفع مع أيقونة مناسبة
  const formatPaymentMethod = (method) => {
    // يمكن إضافة أيقونات أو ألوان مختلفة لكل طريقة دفع
    return method;
  };

  // دالة لتنسيق المبلغ مع عملة مناسبة
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "USD", // يمكن تغييرها حسب العملة المستخدمة
    }).format(amount);
  };

  // استخدام useMemo لتحسين الأداء عند تنسيق البيانات
  const visibleColumnsArray = useMemo(() => {
    return Object.keys(visibleColumns).filter((column) => visibleColumns[column]);
  }, [visibleColumns]);

  // استخدام useMemo لتصفية الأعمدة المرئية فقط
  const filteredColumns = useMemo(() => {
    const baseColumns = [
      { Header: "الاسم الكامل", accessor: "full_name", align: "left" },
      { Header: "اسم المستخدم", accessor: "username", align: "left" },
      { Header: "معرف تيليجرام", accessor: "telegram_id", align: "left" },
      { Header: "رمز الدفع", accessor: "payment_token", align: "left" },
      { Header: "رقم العملية", accessor: "tx_hash", align: "left" },
      { Header: "المبلغ", accessor: "amount", align: "right" },
      { Header: "المبلغ المستلم", accessor: "amount_received", align: "right" },
      { Header: "طريقة الدفع", accessor: "payment_method", align: "left" },
      { Header: "تاريخ المعالجة", accessor: "processed_at", align: "left" },
      { Header: "رسالة الخطأ", accessor: "error_message", align: "left" },
      { Header: "الحالة", accessor: "status", align: "center" },
    ];

    // إضافة عمود الإجراءات دائماً
    const actionColumn = {
      Header: "الإجراءات",
      accessor: "actions",
      align: "center",
    };

    // تصفية الأعمدة المرئية فقط
    return [...baseColumns.filter((column) => visibleColumns[column.accessor]), actionColumn];
  }, [visibleColumns]);

  // دالة إنشاء الصفوف
  const createRows = (payment) => {
    const baseRow = {
      full_name: payment.full_name,
      username: payment.username,
      telegram_id: payment.telegram_id,
      payment_token: payment.payment_token,
      tx_hash: payment.tx_hash ? (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="caption">{payment.tx_hash.substring(0, 10)}...</MDTypography>
          <Tooltip title="نسخ">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(payment.tx_hash);
              }}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ) : (
        "-"
      ),
      amount: formatAmount(payment.amount),
      amount_received: formatAmount(payment.amount_received),
      payment_method: formatPaymentMethod(payment.payment_method),
      processed_at: payment.processed_at
        ? format(new Date(payment.processed_at), "dd/MM/yyyy HH:mm")
        : "-",
      error_message: payment.error_message ? (
        <Tooltip title={payment.error_message}>
          <MDTypography variant="caption" color="error">
            {payment.error_message.length > 20
              ? payment.error_message.substring(0, 20) + "..."
              : payment.error_message}
          </MDTypography>
        </Tooltip>
      ) : (
        "-"
      ),
      status: formatStatus(payment.status),
      actions: (
        <Tooltip title="عرض التفاصيل">
          <IconButton size="small" onClick={() => handleView(payment)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    };

    // تصفية الخصائص المرئية فقط
    const filteredRow = {};
    visibleColumnsArray.forEach((column) => {
      filteredRow[column] = baseRow[column];
    });
    filteredRow.actions = baseRow.actions; // إضافة عمود الإجراءات دائماً

    return filteredRow;
  };

  async function fetchData() {
    setLoading(true);
    try {
      const filterParams = { ...filters };
      if (filterParams.status === "all") filterParams.status = "";
      if (filterParams.payment_method === "all") filterParams.payment_method = "";
      if (searchTerm) filterParams.search = searchTerm;

      if (searchTerm) filterParams.search = searchTerm;

      const cacheKey = `payments_${JSON.stringify(filterParams)}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setPayments(parsedData.data);
        setTotalRecords(parsedData.total || parsedData.data.length);
      } else {
        const response = await getPayments(filterParams);
        setPayments(response.data);
        setTotalRecords(response.total || response.data.length);
        sessionStorage.setItem(cacheKey, JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      showSnackbar("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters, searchTerm]);

  const rows = useMemo(() => payments.map(createRows), [payments, visibleColumns]);

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
                  <MDBox mx={2}>
                    <Chip
                      label={`إجمالي السجلات: ${totalRecords}`}
                      size="small"
                      color="default"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  </MDBox>
                </MDBox>
                <MDBox display="flex">
                  <Tooltip title="تحديث البيانات">
                    <IconButton color="inherit" onClick={handleRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="فلاتر البحث">
                    <IconButton color="inherit" onClick={() => setOpenFilterDialog(true)}>
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns: filteredColumns, rows }}
                    isSorted
                    entriesPerPage
                    showTotalEntries
                    noEndBorder
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "info" }}
                    onPageChange={handlePageChange}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* مربع حوار الفلاتر */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          فلاتر البحث
          <IconButton
            aria-label="close"
            onClick={() => setOpenFilterDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="status-label">الحالة</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  label="الحالة"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="completed">مكتملة</MenuItem>
                  <MenuItem value="pending">قيد الانتظار</MenuItem>
                  <MenuItem value="failed">فاشلة</MenuItem>
                  <MenuItem value="processing">قيد المعالجة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="payment-method-label">طريقة الدفع</InputLabel>
                <Select
                  labelId="payment-method-label"
                  name="payment_method"
                  value={filters.payment_method}
                  label="طريقة الدفع"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">جميع الطرق</MenuItem>
                  <MenuItem value="credit_card">بطاقة ائتمان</MenuItem>
                  <MenuItem value="bank_transfer">تحويل بنكي</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="crypto">عملات رقمية</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="من تاريخ"
                name="date_from"
                type="date"
                value={filters.date_from}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="إلى تاريخ"
                name="date_to"
                type="date"
                value={filters.date_to}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="h6" mt={2} mb={1}>
                الأعمدة المرئية
              </MDTypography>
              <Grid container spacing={1}>
                {Object.keys(visibleColumns).map((column) => (
                  <Grid item xs={6} md={4} key={column}>
                    <FormControl fullWidth>
                      <Chip
                        label={column.replace(/_/g, " ")}
                        color={visibleColumns[column] ? "info" : "default"}
                        variant={visibleColumns[column] ? "filled" : "outlined"}
                        onClick={() => handleColumnVisibilityChange(column)}
                        sx={{ width: "100%" }}
                      />
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)} color="primary">
            إغلاق
          </Button>
          <Button
            onClick={() => {
              setFilters({
                page: 1,
                page_size: 20,
                status: "all",
                payment_method: "all",
                date_from: "",
                date_to: "",
              });
              setVisibleColumns({
                full_name: true,
                username: true,
                telegram_id: false,
                payment_token: false,
                tx_hash: false,
                amount: true,
                amount_received: true,
                payment_method: true,
                processed_at: true,
                error_message: false,
                status: true,
              });
            }}
            color="primary"
          >
            إعادة تعيين
          </Button>
          <Button
            onClick={() => {
              setOpenFilterDialog(false);
              fetchData();
            }}
            color="primary"
            variant="contained"
          >
            تطبيق
          </Button>
        </DialogActions>
      </Dialog>

      {/* مربع حوار تفاصيل الدفعة */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          تفاصيل الدفعة{" "}
          {selectedPayment && (
            <Chip label={selectedPayment.payment_token} size="small" color="info" sx={{ ml: 1 }} />
          )}
          <IconButton
            aria-label="close"
            onClick={() => setDetailsDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList onChange={handleTabChange} aria-label="payment details tabs">
                  <Tab label="المعلومات الأساسية" value="1" />
                  <Tab label="تفاصيل العملية" value="2" />
                  <Tab label="معلومات المستخدم" value="3" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">الحالة</MDTypography>
                    {formatStatus(selectedPayment.status)}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">المبلغ</MDTypography>
                    <MDTypography variant="body2">
                      {formatAmount(selectedPayment.amount)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">المبلغ المستلم</MDTypography>
                    <MDTypography variant="body2">
                      {formatAmount(selectedPayment.amount_received)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">طريقة الدفع</MDTypography>
                    <MDTypography variant="body2">{selectedPayment.payment_method}</MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">تاريخ المعالجة</MDTypography>
                    <MDTypography variant="body2">
                      {selectedPayment.processed_at
                        ? format(new Date(selectedPayment.processed_at), "dd/MM/yyyy HH:mm:ss")
                        : "-"}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">رمز الدفع</MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2">{selectedPayment.payment_token}</MDTypography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(selectedPayment.payment_token)}
                      >
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </MDBox>
                  </Grid>
                  {selectedPayment.error_message && (
                    <Grid item xs={12}>
                      <Alert severity="error">{selectedPayment.error_message}</Alert>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              <TabPanel value="2">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDTypography variant="subtitle2">رقم العملية</MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2">{selectedPayment.tx_hash || "-"}</MDTypography>
                      {selectedPayment.tx_hash && (
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedPayment.tx_hash)}
                        >
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      )}
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">تاريخ الإنشاء</MDTypography>
                    <MDTypography variant="body2">
                      {selectedPayment.created_at
                        ? format(new Date(selectedPayment.created_at), "dd/MM/yyyy HH:mm:ss")
                        : "-"}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">تاريخ التحديث</MDTypography>
                    <MDTypography variant="body2">
                      {selectedPayment.updated_at
                        ? format(new Date(selectedPayment.updated_at), "dd/MM/yyyy HH:mm:ss")
                        : "-"}
                    </MDTypography>
                  </Grid>
                  {/* يمكن إضافة المزيد من التفاصيل مثل سعر الصرف أو معلومات أخرى عن العملية */}
                </Grid>
              </TabPanel>
              <TabPanel value="3">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">الاسم الكامل</MDTypography>
                    <MDTypography variant="body2">{selectedPayment.full_name}</MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">اسم المستخدم</MDTypography>
                    <MDTypography variant="body2">{selectedPayment.username}</MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="subtitle2">معرف تيليجرام</MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2">{selectedPayment.telegram_id}</MDTypography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(selectedPayment.telegram_id)}
                      >
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </MDBox>
                  </Grid>
                  {/* يمكن إضافة المزيد من معلومات المستخدم مثل البريد الإلكتروني أو رقم الهاتف إذا كانت متوفرة */}
                </Grid>
              </TabPanel>
            </TabContext>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* رسائل التنبيه */}
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

export default PaymentsTable;
