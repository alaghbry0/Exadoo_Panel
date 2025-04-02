import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  CircularProgress,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Download,
  FileDownload,
  TableChart,
  Description,
  PictureAsPdf,
  Close,
  FilterList,
} from "@mui/icons-material";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";

/**
 * مكون خيارات التصدير للبيانات بتنسيقات مختلفة
 */
const ExportOptions = ({ data, filename }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportStatus, setExportStatus] = useState({ loading: false, success: false, error: null });
  const [exportConfig, setExportConfig] = useState({
    allData: true,
    currentPage: false,
    dateRange: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    includeHeaders: true,
  });

  // معالجة فتح قائمة التصدير
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // معالجة إغلاق قائمة التصدير
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // فتح حوار إعدادات التصدير
  const handleOpenExportDialog = (format) => {
    setExportFormat(format);
    setExportDialogOpen(true);
    handleMenuClose();
  };

  // تغيير إعدادات التصدير
  const handleConfigChange = (e) => {
    const { name, value, checked, type } = e.target;
    setExportConfig({
      ...exportConfig,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // تنظيف البيانات للتصدير (إزالة الحقول غير المرغوب فيها)
  const cleanDataForExport = (rawData) => {
    return rawData.map((item) => {
      // نسخة جديدة من العنصر بدون الحقول التي لا نريد تصديرها
      const cleanItem = { ...item };

      // إزالة الحقول التي قد تسبب مشاكل عند التصدير
      delete cleanItem.actions;

      // تنسيق التواريخ
      if (cleanItem.created_at) {
        cleanItem.created_at = format(new Date(cleanItem.created_at), "yyyy-MM-dd HH:mm:ss");
      }
      if (cleanItem.processed_at) {
        cleanItem.processed_at = format(new Date(cleanItem.processed_at), "yyyy-MM-dd HH:mm:ss");
      }

      return cleanItem;
    });
  };

  // تحضير عناوين أعمدة التصدير
  const getHeaders = () => {
    if (data.length === 0) return [];

    const firstItem = data[0];
    // ترجمة أسماء الحقول إلى أسماء أعمدة قابلة للقراءة
    const headerMap = {
      payment_token: "معرف المعاملة",
      tx_hash: "هاش المعاملة",
      username: "اسم المستخدم",
      full_name: "الاسم الكامل",
      telegram_id: "معرف تيليجرام",
      amount: "المبلغ",
      amount_received: "المبلغ المستلم",
      currency: "العملة",
      status: "الحالة",
      payment_method: "طريقة الدفع",
      created_at: "تاريخ الإنشاء",
      processed_at: "تاريخ المعالجة",
      plan_name: "اسم الباقة",
      subscription_name: "نوع الاشتراك",
    };

    return Object.keys(firstItem)
      .filter((key) => key !== "actions")
      .map((key) => ({
        id: key,
        displayName: headerMap[key] || key,
      }));
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = () => {
    const cleanedData = cleanDataForExport(data);
    const headers = getHeaders();

    // إنشاء مصفوفة للبيانات مع العناوين
    const worksheet = XLSX.utils.json_to_sheet(
      cleanedData.map((item) => {
        const row = {};
        headers.forEach((header) => {
          row[header.displayName] = item[header.id] || "";
        });
        return row;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "المدفوعات");

    // تحديد اسم الملف
    const exportFileName = `${filename || "export"}_${format(new Date(), "yyyyMMdd")}.xlsx`;

    // تصدير الملف
    XLSX.writeFile(workbook, exportFileName);
    setExportDialogOpen(false);
    setExportStatus({ loading: false, success: true, error: null });
  };

  // تصدير البيانات إلى CSV
  const getCSVData = () => {
    const cleanedData = cleanDataForExport(data);
    const headers = getHeaders();

    return {
      data: cleanedData.map((item) => {
        const row = {};
        headers.forEach((header) => {
          row[header.displayName] = item[header.id] || "";
        });
        return row;
      }),
      headers: headers.map((h) => ({ label: h.displayName, key: h.displayName })),
      filename: `${filename || "export"}_${format(new Date(), "yyyyMMdd")}.csv`,
    };
  };

  // تصدير البيانات إلى PDF (هنا نحتاج لمكتبة إضافية مثل jsPDF)
  const exportToPDF = () => {
    // هنا يمكن تنفيذ التصدير إلى PDF باستخدام مكتبة مثل jsPDF
    // لتبسيط المثال، سنعرض رسالة أن هذه الميزة قيد التطوير
    alert("ميزة التصدير إلى PDF قيد التطوير");
    setExportDialogOpen(false);
  };

  // معالجة عملية التصدير بناءً على التنسيق المحدد
  const handleExport = () => {
    setExportStatus({ loading: true, success: false, error: null });

    try {
      switch (exportFormat) {
        case "excel":
          exportToExcel();
          break;
        case "csv":
          // لا نفعل شيئًا هنا لأن CSVLink ستتولى التصدير
          setExportDialogOpen(false);
          break;
        case "pdf":
          exportToPDF();
          break;
        default:
          exportToExcel();
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      setExportStatus({ loading: false, success: false, error: error.message });
    }
  };

  // مكون CSV Link للتصدير إلى CSV
  const csvData = getCSVData();

  return (
    <>
      <Button variant="outlined" startIcon={<Download />} onClick={handleMenuOpen} size="medium">
        تصدير
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenExportDialog("excel")}>
          <ListItemIcon>
            <TableChart fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenExportDialog("csv")}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenExportDialog("pdf")}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>

      {/* حوار إعدادات التصدير */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">تصدير البيانات ({exportFormat.toUpperCase()})</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setExportDialogOpen(false)}
              aria-label="إغلاق"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            نطاق البيانات
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              name="exportRange"
              value={exportConfig.allData ? "all" : exportConfig.currentPage ? "current" : "date"}
              onChange={(e) => {
                const value = e.target.value;
                setExportConfig({
                  ...exportConfig,
                  allData: value === "all",
                  currentPage: value === "current",
                  dateRange: value === "date",
                });
              }}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label="جميع البيانات"
              />
              <FormControlLabel
                value="current"
                control={<Radio size="small" />}
                label="الصفحة الحالية فقط"
              />
              <FormControlLabel
                value="date"
                control={<Radio size="small" />}
                label="نطاق تاريخ محدد"
              />
            </RadioGroup>
          </FormControl>

          {exportConfig.dateRange && (
            <Box mt={2} mb={2}>
              <Box display="flex" gap={2}>
                <TextField
                  label="من تاريخ"
                  type="date"
                  name="startDate"
                  value={exportConfig.startDate}
                  onChange={handleConfigChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="إلى تاريخ"
                  type="date"
                  name="endDate"
                  value={exportConfig.endDate}
                  onChange={handleConfigChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          )}

          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              خيارات إضافية
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportConfig.includeHeaders}
                  onChange={handleConfigChange}
                  name="includeHeaders"
                  size="small"
                />
              }
              label="تضمين عناوين الأعمدة"
            />
          </Box>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              سيتم تصدير {data.length} سجل بتنسيق {exportFormat.toUpperCase()}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>إلغاء</Button>

          {exportFormat === "csv" ? (
            <CSVLink
              {...csvData}
              onClick={() => setExportDialogOpen(false)}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownload />}
                disabled={exportStatus.loading}
              >
                تصدير
              </Button>
            </CSVLink>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              startIcon={exportStatus.loading ? <CircularProgress size={20} /> : <FileDownload />}
              disabled={exportStatus.loading}
            >
              تصدير
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* إشعار نجاح التصدير */}
      <Tooltip
        open={exportStatus.success}
        title="تم التصدير بنجاح"
        onClose={() => setExportStatus({ ...exportStatus, success: false })}
        arrow
      >
        <span></span>
      </Tooltip>
    </>
  );
};

ExportOptions.propTypes = {
  data: PropTypes.array.isRequired,
  filename: PropTypes.string,
};

ExportOptions.defaultProps = {
  filename: "export",
};

export default ExportOptions;
