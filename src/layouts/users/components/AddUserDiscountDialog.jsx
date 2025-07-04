// src/layouts/Users/components/AddUserDiscountDialog.jsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText, // ⭐ 1. استيراد للمساعدة في عرض الرسائل التوضيحية
} from "@mui/material";

// Components & API
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { addDiscountToUser } from "services/api";

function AddUserDiscountDialog({ open, onClose, user, onSuccess, discounts, plans }) {
  const [selectedDiscountId, setSelectedDiscountId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⭐ 2. حالة جديدة لتخزين الخطط المفلترة
  const [filteredPlans, setFilteredPlans] = useState([]);

  useEffect(() => {
    if (!open) {
      setSelectedDiscountId("");
      setSelectedPlanId("");
      setFilteredPlans([]); // ⭐ 3. تنظيف الخطط المفلترة عند الإغلاق
      setIsSubmitting(false);
    }
  }, [open]);

  // ⭐ 4. useEffect للتعامل مع فلترة الخطط عند اختيار خصم
  useEffect(() => {
    // إعادة تعيين اختيار الخطة عند تغيير الخصم
    setSelectedPlanId("");

    if (selectedDiscountId) {
      // البحث عن الخصم المحدد في قائمة الخصومات
      const selectedDiscount = discounts.find((d) => d.id === selectedDiscountId);

      if (selectedDiscount && selectedDiscount.applicable_to_subscription_type_id) {
        // إذا كان الخصم مرتبطًا بنوع اشتراك معين، قم بفلترة الخطط
        const newFilteredPlans = plans.filter(
          (p) => p.subscription_type_id === selectedDiscount.applicable_to_subscription_type_id
        );
        setFilteredPlans(newFilteredPlans);
      } else {
        // إذا كان الخصم عامًا (غير مرتبط بنوع)، اعرض كل الخطط
        setFilteredPlans(plans);
      }
    } else {
      // إذا لم يتم اختيار أي خصم، أفرغ قائمة الخطط
      setFilteredPlans([]);
    }
  }, [selectedDiscountId, discounts, plans]); // يعتمد على هذه المتغيرات

  const handleSubmit = async () => {
    if (!selectedDiscountId || !selectedPlanId) {
      alert("Please select both a discount and a plan.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDiscountToUser(user.telegram_id, {
        discount_id: selectedDiscountId,
        plan_id: selectedPlanId,
      });
      onSuccess();
    } catch (err) {
      const message =
        err.response?.data?.details || err.response?.data?.error || "Failed to add discount.";
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dataLoaded = discounts && plans && discounts.length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <MDTypography variant="h5">
          Add Discount for {user.full_name || `@${user.username}`}
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        {!dataLoaded ? (
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={5}
            flexDirection="column"
          >
            <CircularProgress />
            <MDTypography variant="body2" color="textSecondary" mt={2}>
              Loading data...
            </MDTypography>
          </MDBox>
        ) : (
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="select-discount-label">Select Discount</InputLabel>
                <Select
                  labelId="select-discount-label"
                  value={selectedDiscountId}
                  label="Select Discount"
                  onChange={(e) => setSelectedDiscountId(e.target.value)}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                >
                  {discounts.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name} ({d.discount_value}
                      {d.discount_type === "percentage" ? "%" : "$"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {/* ⭐ 5. تعديل قائمة الخطط لتعمل بناءً على الفلترة */}
              <FormControl fullWidth disabled={!selectedDiscountId}>
                <InputLabel id="select-plan-label">Apply to Plan</InputLabel>
                <Select
                  labelId="select-plan-label"
                  value={selectedPlanId}
                  label="Apply to Plan"
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                >
                  {/* ⭐ 6. العرض من `filteredPlans` بدلاً من `plans` */}
                  {filteredPlans.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} (${p.price})
                    </MenuItem>
                  ))}
                </Select>
                {/* ⭐ 7. رسالة توضيحية للمستخدم */}
                {!selectedDiscountId && (
                  <FormHelperText>
                    Please select a discount first to see available plans.
                  </FormHelperText>
                )}
                {selectedDiscountId && filteredPlans.length === 0 && (
                  <FormHelperText>
                    No applicable plans found for the selected discount.
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancel
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          variant="contained"
          color="info"
          disabled={isSubmitting || !dataLoaded || !selectedPlanId || !selectedDiscountId}
        >
          {isSubmitting ? "Adding..." : "Add Discount"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserDiscountDialog;
