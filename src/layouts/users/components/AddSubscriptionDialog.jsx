// src/layouts/Users/components/AddSubscriptionDialog.jsx
import React, { useState, useEffect, forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  CircularProgress,
  Alert as MuiAlert,
} from "@mui/material";

import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// API - تأكد من أن هذه الدالة تستدعي النقطة الصحيحة التي تتوقع payment_token
import { getSubscriptionTypes, addOrRenewSubscriptionAdmin } from "../../../services/api";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return (
    <MuiAlert elevation={0} ref={ref} variant="filled" {...props} sx={{ mb: 2, width: "100%" }} />
  );
});

const AddSubscriptionDialog = ({ open, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionTypesData, setSubscriptionTypesData] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInitialFormData = (currentUser) => ({
    telegram_id: currentUser?.telegram_id || "",
    full_name: currentUser?.full_name || "",
    username: currentUser?.username
      ? currentUser.username.startsWith("@")
        ? currentUser.username
        : `@${currentUser.username}`
      : "",
    subscription_type_id: "",
    days_to_add: "30",
    payment_token: "", // <-- [تعديل 1]: إضافة حقل رمز الدفع إلى الحالة
  });

  const [formData, setFormData] = useState(getInitialFormData(user));

  useEffect(() => {
    if (open) {
      setError(null);
      fetchSubscriptionTypes();
      setFormData(getInitialFormData(user));
    }
  }, [open, user]);

  const fetchSubscriptionTypes = async () => {
    setTypesLoading(true);
    try {
      const types = await getSubscriptionTypes();
      setSubscriptionTypesData(types || []);
    } catch (err) {
      console.error("Error fetching subscription types:", err);
      setError("فشل في تحميل أنواع الاشتراكات. حاول مرة أخرى.");
    } finally {
      setTypesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    const daysToAddNum = parseInt(formData.days_to_add, 10);

    if (!formData.subscription_type_id || !formData.days_to_add) {
      setError("يرجى اختيار نوع الاشتراك وتحديد عدد أيام الإضافة.");
      return;
    }
    if (isNaN(daysToAddNum) || daysToAddNum <= 0) {
      setError("عدد أيام الإضافة يجب أن يكون رقمًا صحيحًا موجبًا.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // <-- [تعديل 2]: بناء البيانات التي سترسل للخادم وتضمين payment_token بشكل شرطي
      const submissionData = {
        telegram_id: formData.telegram_id,
        full_name: formData.full_name,
        username: formData.username,
        subscription_type_id: formData.subscription_type_id,
        days_to_add: daysToAddNum,
      };

      // أضف التوكن فقط إذا كان يحتوي على قيمة
      if (formData.payment_token && formData.payment_token.trim() !== "") {
        submissionData.payment_token = formData.payment_token.trim();
      }

      await addOrRenewSubscriptionAdmin(submissionData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding/renewing subscription:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "فشل في إضافة/تجديد الاشتراك. يرجى التحقق من البيانات والمحاولة مرة أخرى.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      fullWidth
      maxWidth="sm"
      dir="rtl"
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
    >
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="bold" color="dark">
          إضافة/تجديد اشتراك للمستخدم
        </MDTypography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && <CustomAlert severity="error">{error}</CustomAlert>}
        <Grid container spacing={3}>
          {/* الحقول الحالية تبقى كما هي */}
          <Grid item xs={12}>
            <MDInput
              label="معرف تلجرام"
              name="telegram_id"
              fullWidth
              value={formData.telegram_id}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <MDInput
              label="الاسم الكامل (اختياري)"
              name="full_name"
              fullWidth
              value={formData.full_name}
              onChange={handleChange}
              InputLabelProps={{ shrink: !!formData.full_name }}
            />
          </Grid>
          <Grid item xs={12}>
            <MDInput
              label="اسم المستخدم (اختياري)"
              name="username"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              InputLabelProps={{ shrink: !!formData.username }}
            />
          </Grid>
          <Grid item xs={12}>
            <MDInput
              select
              label="نوع الاشتراك"
              name="subscription_type_id"
              fullWidth
              value={formData.subscription_type_id}
              onChange={handleChange}
              required
              disabled={typesLoading || loading}
              error={!!error && !formData.subscription_type_id}
              helperText={
                !!error && !formData.subscription_type_id
                  ? "هذا الحقل مطلوب"
                  : typesLoading
                  ? "جاري تحميل الأنواع..."
                  : ""
              }
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  MenuListProps: { sx: { paddingTop: "4px", paddingBottom: "4px" } },
                  PaperProps: { sx: { maxHeight: 200 } },
                },
              }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: typesLoading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                    sx={{ mr: 2, position: "absolute", right: "28px" }}
                  />
                ) : null,
              }}
            >
              <MenuItem value="" disabled>
                <em>اختر نوع الاشتراك...</em>
              </MenuItem>
              {subscriptionTypesData.map((type) => (
                <MenuItem
                  key={type.id}
                  value={type.id}
                  sx={{ paddingTop: "8px", paddingBottom: "8px" }}
                >
                  {type.name}
                </MenuItem>
              ))}
              {!typesLoading && subscriptionTypesData.length === 0 && (
                <MenuItem value="" disabled>
                  لا توجد أنواع متاحة.
                </MenuItem>
              )}
            </MDInput>
          </Grid>
          <Grid item xs={12}>
            <MDInput
              label="عدد أيام الإضافة/التجديد"
              name="days_to_add"
              type="number"
              fullWidth
              value={formData.days_to_add}
              onChange={handleChange}
              required
              disabled={loading}
              error={!!error && (!formData.days_to_add || parseInt(formData.days_to_add, 10) <= 0)}
              helperText={
                !!error && (!formData.days_to_add || parseInt(formData.days_to_add, 10) <= 0)
                  ? "عدد أيام موجب مطلوب"
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* <-- [تعديل 3]: إضافة حقل إدخال لرمز الدفع --> */}
          <Grid item xs={12}>
            <MDInput
              label="رمز الدفع"
              name="payment_token"
              fullWidth
              value={formData.payment_token}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="عنوان مذكرة الدفعه الفاشلة ان وجد"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <MDButton onClick={onClose} color="secondary" variant="text" disabled={loading}>
          إلغاء
        </MDButton>
        <MDButton
          type="submit"
          color="info"
          variant="gradient"
          disabled={loading || typesLoading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "جاري التنفيذ..." : "إضافة/تجديد الاشتراك"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubscriptionDialog;
