// src/layouts/payments/PaymentsFilterDialog.js
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import MDTypography from "components/MDTypography";
import Chip from "@mui/material/Chip";
import FormGroup from "@mui/material/FormGroup"; // For better layout of chips
import FormControlLabel from "@mui/material/FormControlLabel"; // For potential checkboxes in future
import Switch from "@mui/material/Switch"; // Alternative to chips for toggling

import {
  // إذا كنت تستخدم أسماء مميزة للخيارات في config
  // STATUS_OPTIONS_FOR_DIALOG as STATUS_OPTIONS,
  // PAYMENT_METHOD_OPTIONS_FOR_DIALOG as PAYMENT_METHOD_OPTIONS,
  // أو الأسماء العادية إذا كانت هي نفسها
  STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  BASE_COLUMNS_CONFIG, // هذا هو المهم لقائمة الأعمدة
} from "./payments.config"; // تأكد من أن المسار صحيح وأنك تصدر الخيارات المستخدمة

function PaymentsFilterDialog({
  open,
  onClose,
  filters,
  onFilterChange,
  visibleColumns,
  onColumnVisibilityChange,
  onApply,
  onReset,
}) {
  // الأعمدة التي يمكن للمستخدم التحكم في ظهورها هي تلك الموجودة في BASE_COLUMNS_CONFIG
  // ما لم يكن هناك أعمدة لا تريد أن يتحكم المستخدم في ظهورها (مثل عمود الإجراءات)
  const toggleableColumns = BASE_COLUMNS_CONFIG.map((col) => col.accessor);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        فلاتر البحث وتخصيص الأعمدة
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <MDTypography variant="h6" gutterBottom>
          خيارات التصفية
        </MDTypography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-label-dialog">الحالة</InputLabel>
              <Select
                labelId="status-label-dialog"
                name="status"
                value={filters.status || "all"}
                label="الحالة"
                onChange={onFilterChange}
              >
                {STATUS_OPTIONS.map(
                  (
                    option // استخدم STATUS_OPTIONS
                  ) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="payment-method-label-dialog">طريقة الدفع</InputLabel>
              <Select
                labelId="payment-method-label-dialog"
                name="payment_method"
                value={filters.payment_method || "all"}
                label="طريقة الدفع"
                onChange={onFilterChange}
              >
                {PAYMENT_METHOD_OPTIONS.map(
                  (
                    option // استخدم PAYMENT_METHOD_OPTIONS
                  ) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="من تاريخ"
              name="date_from"
              type="date"
              value={filters.date_from || ""}
              onChange={onFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="إلى تاريخ"
              name="date_to"
              type="date"
              value={filters.date_to || ""}
              onChange={onFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
        </Grid>

        <MDTypography variant="h6" gutterBottom sx={{ mt: 2 }}>
          الأعمدة المرئية
        </MDTypography>
        <FormGroup>
          <Grid container spacing={1}>
            {BASE_COLUMNS_CONFIG.map(
              (columnConfig) =>
                // لا نعرض عادة خيار التحكم في عمود "الإجراءات"
                columnConfig.accessor !== "actions" && (
                  <Grid item xs={12} sm={6} md={4} key={columnConfig.accessor}>
                    <Chip
                      label={columnConfig.Header}
                      clickable
                      color={visibleColumns[columnConfig.accessor] ? "info" : "default"}
                      variant={visibleColumns[columnConfig.accessor] ? "filled" : "outlined"}
                      onClick={() => onColumnVisibilityChange(columnConfig.accessor)}
                      sx={{ width: "100%", justifyContent: "space-between" }}
                      // يمكنك استخدام Switch بدلاً من Chip إذا كنت تفضل ذلك
                      // deleteIcon={visibleColumns[columnConfig.accessor] ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    />
                    {/* مثال لاستخدام Switch بدلاً من Chip
                    <FormControlLabel
                    control={
                        <Switch
                        checked={!!visibleColumns[columnConfig.accessor]}
                        onChange={() => onColumnVisibilityChange(columnConfig.accessor)}
                        name={columnConfig.accessor}
                        />
                    }
                    label={columnConfig.Header}
                    />
                    */}
                  </Grid>
                )
            )}
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onReset} color="secondary">
          إعادة تعيين الفلاتر
        </Button>
        <Box sx={{ flex: "1 1 auto" }} /> {/* لدفع الأزرار التالية إلى اليمين */}
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={onApply} color="primary" variant="contained">
          تطبيق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentsFilterDialog;
