// src/layouts/ManageDiscounts/components/DiscountFormModal.jsx

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
} from "@mui/material";
import { useSnackbar } from "notistack";

// Components
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// API
import { createDiscount, updateDiscount } from "services/api";

function DiscountFormModal({ open, onClose, onSuccess, initialData, subscriptionTypes }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    applicable_to_subscription_type_id: "",
    start_date: "",
    end_date: "",
    is_active: true,
    lock_in_price: false,
    lose_on_lapse: false,
    target_audience: "all_new",
  });

  const mode = initialData ? "edit" : "add";

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // تأكد من أن الحقول غير الموجودة لا تكون null وأنواعها صحيحة
        description: initialData.description || "",
        discount_value: initialData.discount_value || "",
        applicable_to_subscription_type_id: initialData.applicable_to_subscription_type_id || "",
        // تحويل التاريخ إلى الصيغة التي يفهمها حقل الإدخال datetime-local
        start_date: initialData.start_date
          ? new Date(initialData.start_date).toISOString().slice(0, 16)
          : "",
        end_date: initialData.end_date
          ? new Date(initialData.end_date).toISOString().slice(0, 16)
          : "",
      });
    } else {
      // Reset form for "add" mode
      setFormData({
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        applicable_to_subscription_type_id: "",
        start_date: "",
        end_date: "",
        is_active: true,
        lock_in_price: false,
        lose_on_lapse: false,
        target_audience: "all_new",
      });
    }
  }, [initialData, open]); // أضف `open` لضمان إعادة تعيين النموذج عند إعادة فتحه

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" || type === "switch" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // التحقق من الحقول الإلزامية
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
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (mode === "edit") {
        await updateDiscount(initialData.id, dataToSubmit);
      } else {
        await createDiscount(dataToSubmit);
      }
      onSuccess(); // استدعاء الدالة من الأب لإعادة جلب البيانات وإغلاق النموذج
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="bold">
          {mode === "edit" ? "Edit Discount" : "Create New Discount"}
        </MDTypography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          {/* --- القسم الأول: التفاصيل الأساسية --- */}
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

          {/* --- القسم الثاني: قيمة الخصم --- */}
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

          {/* --- القسم الثالث: الاستهداف --- */}
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
                <MenuItem value="existing_subscribers">
                  Existing Subscribers (for manual apply)
                </MenuItem>
                <MenuItem value="specific_users" disabled>
                  Specific Users (future use)
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="subscription-type-label">Applicable to Type (Optional)</InputLabel>
              <Select
                labelId="subscription-type-label"
                name="applicable_to_subscription_type_id"
                value={formData.applicable_to_subscription_type_id}
                label="Applicable to Type (Optional)"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Any Type</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* --- القسم الرابع: التوقيت --- */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="start_date"
              label="Start Date (Optional)"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="end_date"
              label="End Date (Optional)"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* --- القسم الخامس: القواعد والتفعيل --- */}
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
  );
}

export default DiscountFormModal;
