// src/layouts/tables/components/SubscriptionFormModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  TextField, // يستخدم بواسطة DatePicker
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// وضعنا الافتراضي لـ "add_or_renew"
const SubscriptionFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  subscriptionTypes = [],
  // availableSources لا نستخدمه كقائمة اختيار الآن للمصدر
  mode = "add_or_renew", // "add_or_renew" أو "edit_existing"
}) => {
  const isAddOrRenewMode = mode === "add_or_renew";
  const isEditExistingMode = mode === "edit_existing";

  const getDefaultFormData = () => {
    if (isAddOrRenewMode) {
      return {
        telegram_id: "",
        full_name: "",
        username: "",
        subscription_type_id: "",
        days_to_add: "30", // قيمة افتراضية لعدد الأيام
        // المصدر يتم تعيينه في الخادم الآن لـ admin_manual
      };
    }
    // isEditExistingMode
    return {
      telegram_id: initialValues?.telegram_id || "",
      full_name: initialValues?.full_name || "", // يمكن تعديله
      username: initialValues?.username || "", // يمكن تعديله
      subscription_type_id: initialValues?.subscription_type_id || "", // لا يمكن تعديله عادةً
      expiry_date: initialValues?.expiry_date ? dayjs(initialValues.expiry_date) : null,
      source: initialValues?.source || "manual", // المصدر الحالي، يمكن تعديله
      // حقول أخرى قد ترغب في تعديلها مثل payment_id (إذا كان مسموحًا)
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    if (open) {
      setFormData(getDefaultFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, open, mode]); // أضف mode هنا

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, expiry_date: newDate }));
  };

  const handleSubmit = () => {
    let processedData = { ...formData };
    let missingFields = false;

    if (isAddOrRenewMode) {
      if (
        !formData.telegram_id ||
        !formData.subscription_type_id ||
        !formData.days_to_add ||
        isNaN(parseInt(formData.days_to_add, 10)) || // تحقق من أنه رقم
        parseInt(formData.days_to_add, 10) <= 0 // تحقق من أنه أكبر من صفر
      ) {
        missingFields = true;
      }
      // full_name و username اختياريان عند الإضافة/التجديد، الخادم سيتعامل مع المستخدم الموجود
      processedData.days_to_add = parseInt(formData.days_to_add, 10);
      // لا نرسل expiry_date في هذا الوضع
      delete processedData.expiry_date;
    } else if (isEditExistingMode) {
      const expiryDateISO = formData.expiry_date
        ? formData.expiry_date
            // .set("hour", 0) // قد ترغب في إبقاء الوقت الأصلي أو تعيينه
            // .set("minute", 0)
            // .set("second", 1)
            // .set("millisecond", 600)
            .toISOString()
        : null;

      if (
        !formData.telegram_id ||
        !formData.subscription_type_id ||
        !expiryDateISO || // تاريخ الانتهاء مطلوب للتعديل
        !formData.source
      ) {
        missingFields = true;
      }
      processedData.expiry_date = expiryDateISO;
      // لا نرسل days_to_add في هذا الوضع
      delete processedData.days_to_add;
    }

    if (missingFields) {
      alert("Please fill in all required fields with valid values.");
      return;
    }
    onSubmit(processedData, mode, initialValues?.id); // نمرر mode و subscription_id للتعديل
  };

  const title = isAddOrRenewMode ? "Add / Renew Subscription" : "Edit Subscription";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography component="div" variant="h5" fontWeight="bold" color="dark">
            {title}
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDInput
                label="Telegram ID"
                name="telegram_id"
                type="text"
                fullWidth
                value={formData.telegram_id}
                onChange={handleChange}
                required
                disabled={isEditExistingMode} // لا يمكن تعديل Telegram ID للاشتراك القائم
              />
            </Grid>
            {/* full_name و username يمكن إظهارهما أو إخفاؤهما حسب الحاجة */}
            {/* في وضع الإضافة/التجديد، الخادم سيتعامل مع إنشاء/تحديث المستخدم */}
            {/* في وضع التعديل، يمكن تعديلها إذا أردت */}
            {(isAddOrRenewMode || isEditExistingMode) && ( // إظهارهما دائمًا كمثال
              <>
                <Grid item xs={12}>
                  <MDInput
                    label="Full Name (Optional for existing user)"
                    name="full_name"
                    type="text"
                    fullWidth
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    label="Username (Optional for existing user)"
                    name="username"
                    type="text"
                    fullWidth
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <MDInput
                select
                label="Subscription Type"
                name="subscription_type_id"
                fullWidth
                value={formData.subscription_type_id}
                onChange={handleChange}
                required
                disabled={isEditExistingMode} // لا يمكن تعديل نوع الاشتراك للاشتراك القائم
                SelectProps={{
                  MenuProps: { MenuListProps: { sx: { paddingTop: "4px", paddingBottom: "4px" } } },
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="" disabled>
                  <em>Select Subscription Type</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem
                    key={type.id}
                    value={type.id}
                    sx={{ paddingTop: "8px", paddingBottom: "8px" }}
                  >
                    {type.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {isAddOrRenewMode && (
              <Grid item xs={12}>
                <MDInput
                  label="Days to Add"
                  name="days_to_add"
                  type="number"
                  fullWidth
                  value={formData.days_to_add}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }} // تأكد من أن الأيام موجبة
                />
              </Grid>
            )}

            {isEditExistingMode && (
              <>
                <Grid item xs={12}>
                  <DatePicker
                    label="Expiry Date"
                    value={formData.expiry_date}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        variant="standard"
                        InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    label="Source" // يمكن تعديل المصدر في وضع التعديل
                    name="source"
                    type="text"
                    fullWidth
                    value={formData.source}
                    onChange={handleChange}
                    required
                  />
                  {/* يمكنك أيضًا استخدام قائمة منسدلة للمصادر إذا كانت محددة */}
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton onClick={onClose} color="secondary" variant="text">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} color="primary" variant="gradient">
            {isAddOrRenewMode ? "Add / Renew" : "Update"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubscriptionFormModal;
