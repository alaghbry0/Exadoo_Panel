// src/layouts/Users/components/AddSubscriptionDialog.jsx
import React, { useState, useEffect, forwardRef } from "react";
import {
  Dialog,
  DialogTitle, // Changed from MuiDialogTitle
  DialogContent, // Changed from MuiDialogContent
  DialogActions, // Changed from MuiDialogActions
  MenuItem,
  Grid,
  CircularProgress,
  // IconButton, // No longer needed for close button in title
  Alert as MuiAlert,
  TextField, // Added for DatePicker renderInput if needed, though MDInput is preferred
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ar"; // Import the Arabic locale for dayjs

// Material Dashboard Components
// import MDBox from "components/MDBox"; // Still used, ensure it's imported if needed
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
// import { Close } from "@mui/icons-material"; // No longer needed for close button in title

// API
import { getSubscriptionTypes, addSubscription } from "../../../services/api";

// Custom Alert
const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return (
    <MuiAlert elevation={0} ref={ref} variant="filled" {...props} sx={{ mb: 2, width: "100%" }} />
  );
});

const AddSubscriptionDialog = ({ open, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionTypesData, setSubscriptionTypesData] = useState([]); // Renamed for clarity
  const [typesLoading, setTypesLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialFormData = {
    telegram_id: "",
    full_name: "",
    username: "",
    subscription_type_id: "",
    expiry_date: null,
    source: "manual",
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open) {
      // dayjs.locale('ar'); // Set locale if needed globally or higher up
      setError(null);
      fetchSubscriptionTypes();

      if (user) {
        setFormData({
          telegram_id: user.telegram_id || "",
          full_name: user.full_name || "",
          username: user.username
            ? user.username.startsWith("@")
              ? user.username
              : `@${user.username}`
            : "",
          subscription_type_id: "", // Reset on open
          expiry_date: null, // Reset on open
          source: "manual",
        });
      } else {
        // Should ideally not happen if 'user' is always provided for this dialog
        setFormData(initialFormData);
      }
    }
  }, [open, user]); // initialFormData is stable, so removed from deps

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, expiry_date: newDate });
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
    // No event.preventDefault() if Dialog PaperProps has component='form' and onSubmit is there
    // If it's passed to MDButton type="submit", then preventDefault on the form onSubmit might be needed if that button isn't type="submit"
    // However, since we attach onSubmit to PaperProps, we don't need it on the button
    // If button has type="submit" and PaperProps has onSubmit, the PaperProps one will be called.
    if (event) event.preventDefault(); // Keep for safety if MDButton click is directly calling this.

    if (!formData.subscription_type_id || !formData.expiry_date) {
      setError("يرجى اختيار نوع الاشتراك وتحديد تاريخ انتهاء صالح.");
      return;
    }
    const expiryDateDayjs = dayjs(formData.expiry_date);
    if (!expiryDateDayjs.isValid() || expiryDateDayjs.isBefore(dayjs(), "day")) {
      setError("تاريخ الانتهاء يجب أن يكون تاريخًا مستقبليًا صالحًا.");
      return;
    }

    setLoading(true);
    setError(null);

    const expiryDateISO = expiryDateDayjs
      .set("hour", 23) // end of day for expiry
      .set("minute", 59)
      .set("second", 59)
      .set("millisecond", 999)
      .toISOString();
    try {
      const submissionData = {
        telegram_id: user.telegram_id, // Critical: use user.telegram_id from prop, not formData
        subscription_type_id: formData.subscription_type_id,
        expiry_date: expiryDateISO,
        source: formData.source,
      };
      await addSubscription(submissionData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding subscription:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "فشل في إضافة الاشتراك. يرجى التحقق من البيانات والمحاولة مرة أخرى.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Dialog
        open={open}
        onClose={!loading ? onClose : undefined} // Allow close if not loading
        fullWidth
        maxWidth="sm"
        dir="rtl" // Keep RTL direction
        PaperProps={{ component: "form", onSubmit: handleSubmit }}
      >
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold" color="dark">
            إضافة اشتراك جديد للمستخدم
          </MDTypography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          <Grid container spacing={3}>
            {" "}
            {/* Consistent spacing with SubscriptionFormModal */}
            {/* User Information Fields - Disabled */}
            <Grid item xs={12}>
              <MDInput
                label="معرف تلجرام"
                name="telegram_id"
                fullWidth
                value={formData.telegram_id}
                disabled // Always disabled, comes from user prop
                InputLabelProps={{ shrink: true }} // Shrink label as value is pre-filled
                // variant="standard" // MDInput is usually standard by default
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="الاسم الكامل"
                name="full_name"
                fullWidth
                value={formData.full_name}
                disabled // Always disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="اسم المستخدم"
                name="username"
                fullWidth
                value={formData.username}
                disabled // Always disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Subscription Details Fields */}
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
                error={!!error && !formData.subscription_type_id} // Basic error indication
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
                    MenuListProps: {
                      sx: {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      },
                    },
                    PaperProps: { sx: { maxHeight: 200 } },
                  },
                }}
                InputLabelProps={{ shrink: true }} // Important for select with value
                InputProps={{
                  // For loading indicator inside select
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
                    sx={{ paddingTop: "8px", paddingBottom: "8px" }} // Consistent item padding
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
              <DatePicker
                label="تاريخ انتهاء الاشتراك"
                value={formData.expiry_date}
                onChange={handleDateChange}
                minDate={dayjs().add(1, "day")}
                disabled={loading}
                format="YYYY/MM/DD" // format for v6+, inputFormat for v5
                renderInput={(params) => (
                  <TextField // Using TextField as in SubscriptionFormModal's DatePicker example
                    {...params}
                    fullWidth
                    required
                    variant="standard" // Consistent variant
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      shrink: true,
                    }}
                    error={
                      !!error &&
                      (!formData.expiry_date ||
                        !dayjs(formData.expiry_date).isValid() ||
                        dayjs(formData.expiry_date).isBefore(dayjs(), "day"))
                    }
                    helperText={
                      params.error
                        ? "صيغة تاريخ غير صالحة"
                        : !!error &&
                          (!formData.expiry_date ||
                            !dayjs(formData.expiry_date).isValid() ||
                            dayjs(formData.expiry_date).isBefore(dayjs(), "day"))
                        ? "تاريخ انتهاء صالح ومستقبلي مطلوب"
                        : ""
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                // select // Making it consistent, even if only one option for now
                label="المصدر"
                name="source"
                fullWidth
                value={formData.source}
                disabled // Always disabled
                InputLabelProps={{ shrink: true }}
                // If it were a select:
                // SelectProps={{ MenuProps: { MenuListProps: { sx: { paddingTop: "4px", paddingBottom: "4px" } } } }}
              >
                {/* If it were a select: <MenuItem value="manual">manual</MenuItem> */}
              </MDInput>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          {" "}
          {/* Consistent padding with SubscriptionFormModal */}
          <MDButton onClick={onClose} color="secondary" variant="text" disabled={loading}>
            إلغاء
          </MDButton>
          <MDButton
            type="submit" // This will trigger PaperProps onSubmit
            color="info" // Changed to 'info' as per original AddSubscriptionDialog
            variant="gradient"
            disabled={loading || typesLoading}
            startIcon={loading ? <CircularProgress size={20} color="white" /> : null}
          >
            {loading ? "جاري الإضافة..." : "إضافة الاشتراك"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddSubscriptionDialog;
