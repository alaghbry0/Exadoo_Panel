// src/layouts/Users/components/ExportUsersDialog.js
import React, { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  CircularProgress,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportUsersToExcel } from "../../../services/api";

const ExportUsersDialog = ({ open, onClose, currentSearchTerm = "" }) => {
  // الحقول المتاحة للتصدير
  const availableFields = [
    //{ name: "id", label: "ID", default: true },
    { name: "telegram_id", label: "معرف تليجرام", default: true },
    { name: "username", label: "اسم المستخدم", default: true },
    { name: "full_name", label: "الاسم الكامل", default: true },
    { name: "wallet_address", label: "عنوان المحفظة", default: false },
    { name: "wallet_app", label: "تطبيق المحفظة", default: false },
    { name: "active_subscription_count", label: "عدد الاشتراكات النشطة", default: true },
    //{ name: "created_at", label: "تاريخ الإنشاء", default: true },
  ];

  // حالة الحقول المحددة
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.name)
  );

  // نوع المستخدمين للتصدير
  const [userType, setUserType] = useState("all");

  // حالة التحميل والخطأ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // معالجة تغيير الحقول المحددة
  const handleFieldChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedFields((prev) => [...prev, name]);
    } else {
      setSelectedFields((prev) => prev.filter((field) => field !== name));
    }
  };

  // معالجة تغيير نوع المستخدم
  const handleUserTypeChange = (event) => {
    setUserType(event.target.value);
  };

  // تحديد جميع الحقول
  const selectAllFields = () => {
    setSelectedFields(availableFields.map((field) => field.name));
  };

  // إلغاء تحديد جميع الحقول
  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  // تنفيذ عملية التصدير
  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // الخيارات التي سيتم إرسالها للخادم
      const exportOptions = {
        fields: selectedFields,
        user_type: userType,
        search: currentSearchTerm || "",
      };

      await exportUsersToExcel(exportOptions);

      // إغلاق النافذة بعد النجاح
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "حدث خطأ أثناء التصدير";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="div">
          <FileDownloadIcon sx={{ mr: 1, verticalAlign: "text-bottom" }} />
          تصدير بيانات المستخدمين
        </Typography>
        <Button onClick={onClose} color="inherit" disabled={loading} startIcon={<CloseIcon />}>
          إغلاق
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          حدد الحقول التي تريد تضمينها في ملف التصدير:
        </Typography>

        <FormControl component="fieldset" fullWidth margin="normal">
          <FormGroup>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
              <Button
                size="small"
                onClick={selectAllFields}
                variant="gradient"
                color="primary"
                sx={{ mr: 1 }}
              >
                تحديد الكل
              </Button>
              <Button size="small" onClick={deselectAllFields} variant="gradient" color="secondary">
                إلغاء تحديد الكل
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "8px",
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          حدد نوع المستخدمين:
        </Typography>

        <FormControl component="fieldset" fullWidth margin="normal">
          <RadioGroup
            aria-label="user-type"
            name="user-type"
            value={userType}
            onChange={handleUserTypeChange}
          >
            <FormControlLabel value="all" control={<Radio />} label="جميع المستخدمين" />
            <FormControlLabel
              value="with_subscription"
              control={<Radio />}
              label="المستخدمين الذين لديهم اشتراكات"
            />
            <FormControlLabel
              value="active_subscription"
              control={<Radio />}
              label="المستخدمين الذين لديهم اشتراكات نشطة"
            />
          </RadioGroup>
        </FormControl>

        {currentSearchTerm && (
          <Alert severity="info" sx={{ mt: 2 }}>
            سيتم تطبيق مصطلح البحث الحالي: "{currentSearchTerm}" على عملية التصدير.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} variant="gradient">
          إلغاء
        </Button>
        <Button
          onClick={handleExport}
          color="info"
          variant="gradient"
          disabled={loading || selectedFields.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        >
          {loading ? "جاري التصدير..." : "تصدير إلى إكسل"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportUsersDialog;
