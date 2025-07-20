import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Typography,
  Divider,
  Alert,
  Grid,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MDButton from "components/MDButton";
import dayjs from "dayjs";

const ExportSubscriptionsDialog = ({
  open,
  onClose,
  onSubmit,
  currentSearchTerm = "",
  // ⭐ 1. استقبال قوائم الفلاتر من المكون الأب
  subscriptionTypes,
  subscriptionPlans,
  availableSources,
}) => {
  // --- حقول التصدير ---
  const availableFields = [
    { name: "subscription_id", label: "معرف الاشتراك", default: true },
    { name: "telegram_id", label: "معرف تليجرام", default: true },
    { name: "full_name", label: "الاسم الكامل", default: true },
    { name: "username", label: "اسم المستخدم", default: true },
    { name: "subscription_type_name", label: "نوع الاشتراك", default: true },
    { name: "subscription_plan_name", label: "خطة الاشتراك", default: false },
    { name: "status", label: "الحالة", default: true },
    { name: "start_date", label: "تاريخ البدء", default: false },
    { name: "expiry_date", label: "تاريخ الانتهاء", default: true },
    { name: "days_remaining", label: "الأيام المتبقية", default: true },
    { name: "source", label: "المصدر", default: false },
    { name: "payment_token", label: "معرف الدفع", default: false },
    { name: "created_at", label: "تاريخ الإنشاء", default: false },
  ];

  // --- حالات للنافذة ---
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.name)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ⭐ 2. إضافة حالات مستقلة للفلاتر داخل النافذة
  const [filters, setFilters] = useState({
    search: currentSearchTerm,
    status: "all",
    subscription_type_id: "all",
    subscription_plan_id: "all",
    source: "all",
    start_date: null,
    end_date: null,
  });

  // --- دوال التحكم ---
  const handleFieldChange = (event) => {
    const { name, checked } = event.target;
    setSelectedFields((prev) =>
      checked ? [...prev, name] : prev.filter((field) => field !== name)
    );
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, newValue) => {
    setFilters((prev) => ({ ...prev, [name]: newValue }));
  };

  const selectAllFields = () => setSelectedFields(availableFields.map((field) => field.name));
  const deselectAllFields = () => setSelectedFields([]);

  // --- دالة التصدير الرئيسية ---
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      // ⭐ 3. بناء حمولة نظيفة لإرسالها للخادم
      const payload = {
        fields: selectedFields,
      };
      // إضافة الفلاتر فقط إذا كانت لها قيمة (ليست 'all' أو null)
      for (const key in filters) {
        if (filters[key] && filters[key] !== "all") {
          if (key === "start_date" || key === "end_date") {
            // تنسيق التواريخ إلى YYYY-MM-DD
            payload[key] = dayjs(filters[key]).format("YYYY-MM-DD");
          } else {
            payload[key] = filters[key];
          }
        }
      }

      await onSubmit(payload); // استدعاء الدالة من المكون الأب مع الحمولة الكاملة
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Export failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          <FileDownloadIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          تخصيص تصدير بيانات الاشتراكات
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ⭐ 4. قسم جديد بالكامل لاختيار الفلاتر */}
        <Typography variant="h6" gutterBottom>
          الفلاتر
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          حدد معايير البيانات التي تريد تصديرها. (اتركها فارغة لتصدير الكل)
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="بحث عام"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              fullWidth
              variant="outlined"
              helperText="يبحث في اسم المستخدم، الاسم الكامل، المعرف..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>الحالة</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="expiring_soon">على وشك الانتهاء</MenuItem>
                <MenuItem value="inactive">غير نشط</MenuItem>
                <MenuItem value="expired">منتهي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>نوع الاشتراك</InputLabel>
              <Select
                name="subscription_type_id"
                value={filters.subscription_type_id}
                onChange={handleFilterChange}
                label="نوع الاشتراك"
              >
                <MenuItem value="all">الكل</MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>خطة الاشتراك</InputLabel>
              <Select
                name="subscription_plan_id"
                value={filters.subscription_plan_id}
                onChange={handleFilterChange}
                label="خطة الاشتراك"
                disabled={filters.subscription_type_id === "all"}
              >
                <MenuItem value="all">الكل</MenuItem>
                {subscriptionPlans
                  .filter((p) => p.subscription_type_id.toString() === filters.subscription_type_id)
                  .map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="من تاريخ إنشاء"
              value={filters.start_date}
              onChange={(newValue) => handleDateChange("start_date", newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="إلى تاريخ إنشاء"
              value={filters.end_date}
              onChange={(newValue) => handleDateChange("end_date", newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* قسم اختيار الحقول */}
        <Typography variant="h6" gutterBottom>
          الحقول
        </Typography>
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormGroup>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <MDButton size="small" onClick={selectAllFields} variant="gradient" color="info">
                تحديد الكل
              </MDButton>
              <MDButton
                size="small"
                onClick={deselectAllFields}
                variant="outlined"
                color="secondary"
              >
                إلغاء تحديد الكل
              </MDButton>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "0 8px",
              }}
            >
              {availableFields.map((field) => (
                <FormControlLabel
                  key={field.name}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field.name)}
                      onChange={handleFieldChange}
                      name={field.name}
                    />
                  }
                  label={field.label}
                />
              ))}
            </div>
          </FormGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <MDButton onClick={handleClose} disabled={loading} color="secondary">
          إلغاء
        </MDButton>
        <MDButton
          onClick={handleExport}
          color="info"
          variant="gradient"
          disabled={loading || selectedFields.length === 0}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />
          }
        >
          {loading ? "جاري التصدير..." : "تصدير الآن"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default ExportSubscriptionsDialog;
