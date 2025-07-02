// src/layouts/tables/components/SubscriptionTableToolbar.jsx

import React, { useState, useEffect, useMemo } from "react"; // 💡 استيراد useMemo
import { Grid, MenuItem, Collapse } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

const SubscriptionTableToolbar = ({
  onFilterChange,
  filters: initialFiltersFromParent,
  subscriptionTypes,
  onAddNewClick,
  availableSources = [],
  subscriptionPlans = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getInitialState = () => ({
    status: "",
    subscription_type_id: "",
    subscription_plan_id: "",
    start_date: null,
    end_date: null,
    source: "",
    ...initialFiltersFromParent,
  });

  const [localFilters, setLocalFilters] = useState(getInitialState);

  useEffect(() => {
    setLocalFilters(getInitialState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiltersFromParent]);

  // 💡 --- التحسين رقم 1: فلترة الخطط ديناميكيًا ---
  const filteredPlans = useMemo(() => {
    // إذا لم يتم اختيار نوع اشتراك، أرجع قائمة فارغة
    if (!localFilters.subscription_type_id) {
      return [];
    }
    // فلترة الخطط التي تطابق subscription_type_id المختار
    return subscriptionPlans.filter(
      (plan) => plan.subscription_type_id === localFilters.subscription_type_id
    );
  }, [localFilters.subscription_type_id, subscriptionPlans]);

  // 💡 --- التحسين رقم 2: تحديث معالج التغيير ---
  const handleLocalFilterChange = (e) => {
    const { name, value } = e.target;

    setLocalFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      // عند تغيير نوع الاشتراك، قم بإعادة تعيين اختيار الخطة الحالية
      if (name === "subscription_type_id") {
        newFilters.subscription_plan_id = "";
      }

      return newFilters;
    });
  };

  const handleDateChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    if (typeof onFilterChange === "function") {
      onFilterChange(localFilters);
    } else {
      console.error("SubscriptionTableToolbar: onFilterChange prop is not a function!");
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "",
      subscription_type_id: "",
      subscription_plan_id: "",
      start_date: null,
      end_date: null,
      source: "",
    };
    setLocalFilters(clearedFilters);
    if (typeof onFilterChange === "function") {
      onFilterChange({});
    }
  };

  return (
    <MDBox p={3}>
      <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
        <Grid item xs={12} sm="auto">
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="outlined"
              color="info"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
            >
              Filters {showFilters ? "(Hide)" : "(Show)"}
            </MDButton>
            <MDButton
              variant="gradient"
              color="success"
              onClick={onAddNewClick}
              startIcon={<AddIcon />}
            >
              Add New
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>

      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <MDBox pt={2} mt={2} borderTop="1px solid #eee">
          <Grid container spacing={2} alignItems="flex-end">
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="Status"
                name="status"
                value={localFilters.status || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expiring_soon">Expiring Soon</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </MDInput>
            </Grid>

            {/* Subscription Type Filter */}
            <Grid item xs={12} sm={6} md={2.5}>
              <MDInput
                select
                fullWidth
                label="Subscription Type"
                name="subscription_type_id"
                value={localFilters.subscription_type_id || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* 💡 --- التحسين رقم 3: تعديل فلتر الخطط --- */}
            <Grid item xs={12} sm={6} md={2.5}>
              <MDInput
                select
                fullWidth
                label="Subscription Plan"
                name="subscription_plan_id"
                value={localFilters.subscription_plan_id || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
                // تعطيل الحقل إذا لم يتم اختيار نوع الاشتراك
                disabled={!localFilters.subscription_type_id}
              >
                <MenuItem value="">
                  {/* تغيير النص ليكون أكثر وضوحًا */}
                  <em>
                    {localFilters.subscription_type_id
                      ? "All Plans for Type"
                      : "Select a Type First"}
                  </em>
                </MenuItem>
                {/* استخدام قائمة الخطط المفلترة */}
                {filteredPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {/* عرض الاسم الوصفي الكامل من الخادم */}
                    {plan.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* Source Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <MDInput
                select
                fullWidth
                label="Source"
                name="source"
                value={localFilters.source || ""}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Sources</em>
                </MenuItem>
                {availableSources.map((source) => (
                  <MenuItem key={source.value} value={source.value}>
                    {source.label}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* Date Pickers for Updated Date */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Updated From" // ⬅️ التغيير هنا
                value={localFilters.start_date}
                onChange={(date) => handleDateChange("start_date", date)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Updated To" // ⬅️ التغيير هنا
                value={localFilters.end_date}
                onChange={(date) => handleDateChange("end_date", date)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <MDBox
                display="flex"
                justifyContent={{ xs: "stretch", sm: "flex-end" }}
                gap={1}
                mt={2}
                width="100%"
              >
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={clearAllFilters}
                  sx={{ flexGrow: { xs: 1, sm: 0 } }}
                >
                  Clear All
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={applyFilters}
                  sx={{ flexGrow: { xs: 1, sm: 0 } }}
                >
                  Apply Filters
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </Collapse>
    </MDBox>
  );
};

export default SubscriptionTableToolbar;
