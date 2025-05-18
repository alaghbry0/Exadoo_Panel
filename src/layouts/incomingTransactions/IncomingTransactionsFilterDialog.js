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
import FormGroup from "@mui/material/FormGroup";

import {
  PROCESSED_STATUS_OPTIONS,
  BASE_COLUMNS_CONFIG_INCOMING,
} from "./incoming-transactions.config";

function IncomingTransactionsFilterDialog({
  open,
  onClose,
  filters, // من incomingTransactionsPage
  onFilterChange, // من incomingTransactionsPage
  visibleColumns, // من incomingTransactionsPage
  onColumnVisibilityChange, // من incomingTransactionsPage
  onApply,
  onReset,
}) {
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
              <InputLabel id="processed-status-label-dialog">حالة المعالجة</InputLabel>
              <Select
                labelId="processed-status-label-dialog"
                name="processed" // اسم الحقل في filters
                value={filters.processed || "all"}
                label="حالة المعالجة"
                onChange={onFilterChange} // الدالة التي تحدث الفلاتر في الصفحة الرئيسية
              >
                {PROCESSED_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            {" "}
            {/* فراغ أو فلتر آخر */}{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="من تاريخ الاستلام"
              name="start_date" // اسم الحقل في filters
              type="date"
              value={filters.start_date || ""}
              onChange={onFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="إلى تاريخ الاستلام"
              name="end_date" // اسم الحقل في filters
              type="date"
              value={filters.end_date || ""}
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
            {BASE_COLUMNS_CONFIG_INCOMING.map(
              (columnConfig) =>
                columnConfig.accessor !== "actions" && ( // لا نعرض عمود الإجراءات للتحكم
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
        <Button onClick={onReset} color="secondary">
          إعادة تعيين
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={onApply} color="primary" variant="contained">
          تطبيق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IncomingTransactionsFilterDialog;
