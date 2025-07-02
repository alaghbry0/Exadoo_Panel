// src/layouts/payments/PaymentsFilterDialog.js

import React, { useState, useEffect } from "react";
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
import FormGroup from "@mui/material/FormGroup";

// 💡 استيراد DatePicker
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  BASE_COLUMNS_CONFIG,
  INITIAL_FILTERS,
} from "./payments.config";

function PaymentsFilterDialog({
  open,
  onClose,
  filters,
  visibleColumns,
  onColumnVisibilityChange,
  onApply,
  onReset,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]); // Reset local state when dialog opens or parent filters change

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleInternalApply = () => {
    onApply(localFilters);
  };

  const handleInternalReset = () => {
    setLocalFilters(INITIAL_FILTERS); // Reset local state
    onReset(); // Call parent's reset logic which also closes the dialog
  };

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
                value={localFilters.status || "all"}
                label="الحالة"
                onChange={handleFilterChange}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="payment-method-label-dialog">طريقة الدفع</InputLabel>
              <Select
                labelId="payment-method-label-dialog"
                name="payment_method"
                value={localFilters.payment_method || "all"}
                label="طريقة الدفع"
                onChange={handleFilterChange}
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* 💡 استخدام DatePicker من MUI X */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="من تاريخ الإنشاء"
              value={localFilters.start_date || null}
              onChange={(date) => handleDateChange("start_date", date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="إلى تاريخ الإنشاء"
              value={localFilters.end_date || null}
              onChange={(date) => handleDateChange("end_date", date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
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
                columnConfig.accessor !== "actions" && (
                  <Grid item xs={12} sm={6} md={4} key={columnConfig.accessor}>
                    <Chip
                      label={columnConfig.Header}
                      clickable
                      color={visibleColumns[columnConfig.accessor] ? "info" : "default"}
                      variant={visibleColumns[columnConfig.accessor] ? "filled" : "outlined"}
                      onClick={() => onColumnVisibilityChange(columnConfig.accessor)}
                      sx={{ width: "100%", justifyContent: "space-between" }}
                    />
                  </Grid>
                )
            )}
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={handleInternalReset} color="secondary">
          إعادة تعيين الكل
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={handleInternalApply} color="primary" variant="contained">
          تطبيق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentsFilterDialog;
