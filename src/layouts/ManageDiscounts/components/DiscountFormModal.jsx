import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Switch,
  Box,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
// <-- 1. إضافة المكتبات اللازمة للتاريخ والوقت
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

// Components
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// API
import { createDiscount, updateDiscount } from "services/api";

function DiscountFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
  subscriptionTypes,
  availablePlans,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState([]);

  // <-- 2. تعديل الحالة الافتراضية للتاريخ لتكون null بدلاً من ""
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    applicable_to_subscription_type_id: "",
    applicable_to_subscription_plan_id: "",
    start_date: null, // <-- تغيير
    end_date: null, // <-- تغيير
    is_active: true,
    lock_in_price: false,
    lose_on_lapse: false,
    target_audience: "all_new",
  });

  const mode = initialData ? "edit" : "add";

  useEffect(() => {
    if (open) {
      if (initialData) {
        const typeId = initialData.applicable_to_subscription_type_id || "";
        setFormData({
          ...initialData,
          description: initialData.description || "",
          discount_value: initialData.discount_value || "",
          applicable_to_subscription_type_id: typeId,
          applicable_to_subscription_plan_id: initialData.applicable_to_subscription_plan_id || "",
          // <-- 3. تحويل التواريخ القادمة من السيرفر إلى كائنات dayjs
          start_date: initialData.start_date ? dayjs(initialData.start_date) : null,
          end_date: initialData.end_date ? dayjs(initialData.end_date) : null,
        });

        if (typeId) {
          const newFilteredPlans = availablePlans.filter((p) => p.subscription_type_id === typeId);
          setFilteredPlans(newFilteredPlans);
        } else {
          setFilteredPlans([]);
        }
      } else {
        setFormData({
          name: "",
          description: "",
          discount_type: "percentage",
          discount_value: "",
          applicable_to_subscription_type_id: "",
          applicable_to_subscription_plan_id: "",
          start_date: null, // <-- تغيير
          end_date: null, // <-- تغيير
          is_active: true,
          lock_in_price: false,
          lose_on_lapse: false,
          target_audience: "all_new",
        });
        setFilteredPlans([]);
      }
    }
  }, [initialData, open, availablePlans]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "applicable_to_subscription_type_id") {
      setFormData((prev) => ({
        ...prev,
        applicable_to_subscription_type_id: value,
        applicable_to_subscription_plan_id: "",
      }));
      if (value) {
        const newFilteredPlans = availablePlans.filter((p) => p.subscription_type_id === value);
        setFilteredPlans(newFilteredPlans);
      } else {
        setFilteredPlans([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" || type === "switch" ? checked : value,
      }));
    }
  };

  // <-- 4. دالة جديدة لمعالجة تغيير التاريخ والوقت
  const handleDateChange = (newDate, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: newDate }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.discount_value) {
      enqueueSnackbar("Please fill in all required fields: Name and Discount Value.", {
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        applicable_to_subscription_type_id: formData.applicable_to_subscription_type_id || null,
        applicable_to_subscription_plan_id: formData.applicable_to_subscription_plan_id || null,
        // <-- 5. تحويل كائنات dayjs إلى صيغة ISO string قبل الإرسال
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
      };

      if (mode === "edit") {
        await updateDiscount(initialData.id, dataToSubmit);
      } else {
        await createDiscount(dataToSubmit);
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save discount:", err);
      enqueueSnackbar(err.response?.data?.error || "An error occurred. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <-- 6. تغليف المكون بالكامل بـ LocalizationProvider
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold">
            {mode === "edit" ? "Edit Discount" : "Create New Discount"}
          </MDTypography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {/* --- الأقسام الأخرى تبقى كما هي --- */}
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Discount Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="discount-type-label">Discount Type</InputLabel>
                <Select
                  labelId="discount-type-label"
                  name="discount_type"
                  value={formData.discount_type}
                  label="Discount Type"
                  onChange={handleChange}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="discount_value"
                label={`Value (${formData.discount_type === "percentage" ? "%" : "$"})`}
                value={formData.discount_value}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.discount_type === "percentage" ? "%" : "$"}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="target-audience-label">Target Audience</InputLabel>
                <Select
                  labelId="target-audience-label"
                  name="target_audience"
                  value={formData.target_audience}
                  label="Target Audience"
                  onChange={handleChange}
                >
                  <MenuItem value="all_new">All New Subscribers</MenuItem>
                  <MenuItem value="existing_subscribers">Existing Subscribers</MenuItem>
                  <MenuItem value="specific_users" disabled>
                    Specific Users (future use)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="subscription-type-label">Applicable to Type</InputLabel>
                <Select
                  name="applicable_to_subscription_type_id"
                  value={formData.applicable_to_subscription_type_id}
                  onChange={handleChange}
                  label="Applicable to Type"
                  labelId="subscription-type-label"
                >
                  <MenuItem value="">
                    <em>Any Type (Global)</em>
                  </MenuItem>
                  {subscriptionTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!formData.applicable_to_subscription_type_id}>
                <InputLabel id="subscription-plan-label">Applicable to Plan (Optional)</InputLabel>
                <Select
                  labelId="subscription-plan-label"
                  name="applicable_to_subscription_plan_id"
                  value={formData.applicable_to_subscription_plan_id}
                  onChange={handleChange}
                  label="Applicable to Plan (Optional)"
                >
                  <MenuItem value="">
                    <em>Any Plan in Selected Type</em>
                  </MenuItem>
                  {filteredPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {`${plan.name} ($${plan.price})`}
                    </MenuItem>
                  ))}
                </Select>
                {!formData.applicable_to_subscription_type_id && (
                  <FormHelperText>
                    Select a subscription type to see available plans.
                  </FormHelperText>
                )}
                {formData.applicable_to_subscription_type_id && filteredPlans.length === 0 && (
                  <FormHelperText>No plans found for the selected type.</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* <-- 7. استبدال حقول التاريخ القديمة بالمكون الجديد --> */}
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Date (Optional)"
                value={formData.start_date}
                onChange={(newDate) => handleDateChange(newDate, "start_date")}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="End Date (Optional)"
                value={formData.end_date}
                onChange={(newDate) => handleDateChange(newDate, "end_date")}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
                <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                  Rules & Activation
                </MDTypography>
                <FormControlLabel
                  control={
                    <Switch checked={formData.is_active} onChange={handleChange} name="is_active" />
                  }
                  label="Discount is Active"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="lock_in_price"
                      checked={formData.lock_in_price}
                      onChange={handleChange}
                    />
                  }
                  label="Lock-in price for user after first successful payment with this discount?"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="lose_on_lapse"
                      checked={formData.lose_on_lapse}
                      onChange={handleChange}
                    />
                  }
                  label="User loses this discount if their subscription expires before renewal?"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <MDButton onClick={onClose} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} variant="contained" color="info" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Discount"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default DiscountFormModal;
