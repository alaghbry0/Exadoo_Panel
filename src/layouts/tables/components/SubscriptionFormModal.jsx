import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  TextField,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const SubscriptionFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  subscriptionTypes = [],
  availableSources = [], // ستبقى هذه الخاصية لتعبئة القائمة في حال أردت تغيير المنطق مستقبلاً
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    telegram_id: "",
    full_name: "",
    username: "",
    subscription_type_id: "",
    expiry_date: null,
    source: "", // القيمة الأولية فارغة
  });

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues && Object.keys(initialValues).length > 0) {
        // تعديل: التحقق من isEdit هنا
        setFormData({
          telegram_id: initialValues.telegram_id || "",
          full_name: initialValues.full_name || "",
          username: initialValues.username || "",
          subscription_type_id: initialValues.subscription_type_id || "",
          expiry_date: initialValues.expiry_date ? dayjs(initialValues.expiry_date) : null,
          source: initialValues.source || "", // استخدام المصدر الحالي للاشتراك
        });
      } else {
        // وضع الإضافة
        setFormData({
          telegram_id: "",
          full_name: "",
          username: "",
          subscription_type_id: "",
          expiry_date: null,
          source: "manual", // القيمة الافتراضية للمصدر عند الإضافة
        });
      }
    }
  }, [initialValues, open, isEdit]); // إضافة isEdit إلى مصفوفة الاعتماديات

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, expiry_date: newDate });
  };

  const handleSubmit = () => {
    const expiryDateISO = formData.expiry_date
      ? formData.expiry_date
          .set("hour", 0)
          .set("minute", 0)
          .set("second", 1)
          .set("millisecond", 600)
          .toISOString()
      : null;

    if (
      !formData.telegram_id ||
      !formData.full_name ||
      !formData.username || // حتى لو معطل، يجب أن تكون له قيمة
      !formData.subscription_type_id || // حتى لو معطل، يجب أن تكون له قيمة
      !expiryDateISO ||
      !formData.source // حتى لو معطل، يجب أن تكون له قيمة
    ) {
      alert("Please fill in all required fields, including a valid expiry date.");
      return;
    }

    const processedData = {
      ...formData,
      expiry_date: expiryDateISO,
    };
    onSubmit(processedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography component="div" variant="h5" fontWeight="bold" color="dark">
            {isEdit ? "Edit Subscription" : "Add New Subscription"}
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
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Full Name"
                name="full_name"
                type="text"
                fullWidth
                value={formData.full_name}
                onChange={handleChange}
                required
                // Full Name قابل للتعديل دائماً
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Username"
                name="username"
                type="text"
                fullWidth
                value={formData.username}
                onChange={handleChange} // يبقى onChange للسماح بالتعبئة الأولية
                required
                disabled={isEdit} // تعديل: تعطيل في وضع التعديل
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                select
                label="Subscription Type"
                name="subscription_type_id"
                fullWidth
                value={formData.subscription_type_id}
                onChange={handleChange} // يبقى onChange للسماح بالتعبئة الأولية
                required
                disabled={isEdit} // تعديل: تعطيل في وضع التعديل
                SelectProps={{
                  MenuProps: {
                    MenuListProps: {
                      sx: {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      },
                    },
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
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
            <Grid item xs={12}>
              <MDInput
                select
                label="Source"
                name="source"
                fullWidth
                value={formData.source} // سيتم تعيينه إلى "manual" في وضع الإضافة
                onChange={handleChange} // يبقى onChange للسماح بالتعبئة الأولية
                required
                disabled={true} // تعديل: تعطيل دائمًا (سواء إضافة أو تعديل)
                // في وضع الإضافة، قيمته "manual"
                // في وضع التعديل، قيمته هي المصدر الحالي للاشتراك
                SelectProps={{
                  MenuProps: {
                    MenuListProps: {
                      sx: {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      },
                    },
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                {/* لا نحتاج إلى خيار "Select Source" إذا كان الحقل معطلاً وقيمته محددة */}
                {/* عرض القيمة الحالية فقط */}
                {isEdit && formData.source && (
                  <MenuItem key={formData.source} value={formData.source}>
                    {formData.source}
                  </MenuItem>
                )}
                {!isEdit && (
                  <MenuItem key="manual" value="manual">
                    Manual
                  </MenuItem>
                )}
                {/* إذا أردت عرض قائمة المصادر في وضع التعديل (حتى لو معطل)، يمكنك ترك الكود التالي */}
                {/* ولكن بما أنه معطل، المستخدم لن يتمكن من الاختيار */}
                {/* {isEdit && Array.isArray(availableSources) && availableSources.length > 0 ? (
                  availableSources.map((sourceOption) => (
                    <MenuItem
                      key={sourceOption}
                      value={sourceOption}
                      sx={{ paddingTop: "8px", paddingBottom: "8px" }}
                    >
                      {sourceOption}
                    </MenuItem>
                  ))
                ) : null} */}
              </MDInput>
            </Grid>
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
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton onClick={onClose} color="secondary" variant="text">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} color="primary" variant="gradient">
            {isEdit ? "Update" : "Add"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubscriptionFormModal;
