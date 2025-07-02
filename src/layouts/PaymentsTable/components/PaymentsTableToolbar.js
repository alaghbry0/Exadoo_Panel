// src/layouts/payments/components/PaymentsTableToolbar.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Grid, MenuItem, Collapse, Box } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FilterListIcon from "@mui/icons-material/FilterList";
import ColumnSelector from "./ColumnSelector"; // ✅ استيراد المكون الجديد

const PaymentsTableToolbar = ({
  onFilterChange,
  filters: initialFilters,
  subscriptionTypes = [],
  subscriptionPlans = [],
  paymentMethods = [],
  // ✅ إضافة props جديدة للتحكم في الأعمدة
  allColumns,
  visibleColumns,
  onColumnVisibilityChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const filteredPlans = useMemo(() => {
    if (!localFilters.subscription_type_id) return [];
    // Ensure IDs are compared correctly (e.g., both as strings or numbers)
    return subscriptionPlans.filter(
      (plan) => String(plan.subscription_type_id) === String(localFilters.subscription_type_id)
    );
  }, [localFilters.subscription_type_id, subscriptionPlans]);

  const handleLocalFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "subscription_type_id") {
        newFilters.subscription_plan_id = "";
      }
      return newFilters;
    });
  };

  const handleDateChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => onFilterChange(localFilters);

  const clearAllFilters = () => {
    const cleared = {
      status: "",
      subscription_type_id: "",
      subscription_plan_id: "",
      payment_method: "",
      start_date: null,
      end_date: null,
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <MDBox p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* يمكنك ترك هذا فارغًا أو إضافة عنوان */}
        <div />
        <Box display="flex" gap={1}>
          {/* ✅ استخدام المكون الجديد هنا */}
          <ColumnSelector
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            onVisibilityChange={onColumnVisibilityChange}
          />
          <MDButton
            variant="outlined"
            color="info"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterListIcon />}
          >
            Filters {showFilters ? "(Hide)" : "(Show)"}
          </MDButton>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <MDBox pt={2} mt={2} borderTop="1px solid #eee">
          <Grid container spacing={2}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="الحالة"
                name="status"
                value={localFilters.status || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>الكل</em>
                </MenuItem>
                <MenuItem value="completed">مكتملة</MenuItem>
                <MenuItem value="pending">قيد الانتظار</MenuItem>
                <MenuItem value="failed">فاشلة</MenuItem>
                <MenuItem value="underpaid">دفع ناقص</MenuItem>
                <MenuItem value="canceled">ملغاة</MenuItem>
              </MDInput>
            </Grid>
            {/* Payment Method Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="طريقة الدفع"
                name="payment_method"
                value={localFilters.payment_method || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>الكل</em>
                </MenuItem>
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            {/* Subscription Type & Plan Filters */}
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="نوع الاشتراك"
                name="subscription_type_id"
                value={localFilters.subscription_type_id || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>الكل</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="الخطة"
                name="subscription_plan_id"
                value={localFilters.subscription_plan_id || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
                disabled={!localFilters.subscription_type_id}
              >
                <MenuItem value="">
                  <em>{!localFilters.subscription_type_id ? "اختر نوع أولاً" : "كل الخطط"}</em>
                </MenuItem>
                {filteredPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            {/* Date Pickers */}
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="من تاريخ"
                value={localFilters.start_date}
                onChange={(d) => handleDateChange("start_date", d)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="إلى تاريخ"
                value={localFilters.end_date}
                onChange={(d) => handleDateChange("end_date", d)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>
            {/* Action Buttons */}
            <Grid item xs={12}>
              <MDBox display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <MDButton variant="outlined" color="secondary" onClick={clearAllFilters}>
                  مسح الكل
                </MDButton>
                <MDButton variant="gradient" color="info" onClick={applyFilters}>
                  تطبيق الفلاتر
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </Collapse>
    </MDBox>
  );
};

export default PaymentsTableToolbar;
