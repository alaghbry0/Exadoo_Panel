import React, { useState, useEffect } from "react";
import { Grid, MenuItem, IconButton, Collapse, Box, TextField } from "@mui/material"; // TextField قد لا تحتاجها إذا كنت تستخدم MDInput
import MDBox from "components/MDBox";
import MDInput from "components/MDInput"; // تأكد من أن هذا هو MDInput الخاص بك
import MDButton from "components/MDButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // استيراد أكثر تحديدًا
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

const SubscriptionTableToolbar = ({
  onFilterChange,
  filters: initialFiltersFromParent,
  subscriptionTypes,
  onAddNewClick,
  availableSources = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const [localFilters, setLocalFilters] = useState(
    () =>
      initialFiltersFromParent || {
        status: "",
        type: "",
        startDate: null,
        endDate: null,
        source: "",
      }
  );

  useEffect(() => {
    setLocalFilters(
      initialFiltersFromParent || {
        status: "",
        type: "",
        startDate: null,
        endDate: null,
        source: "",
      }
    );
  }, [initialFiltersFromParent]);

  const handleLocalFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    Object.keys(localFilters).forEach((key) => {
      if (
        localFilters[key] !== null &&
        localFilters[key] !== "" &&
        localFilters[key] !== undefined
      ) {
        if (
          (key === "startDate" || key === "endDate") &&
          localFilters[key] &&
          typeof localFilters[key].toISOString === "function"
        ) {
          activeFilters[key] = localFilters[key].toISOString().split("T")[0];
        } else {
          activeFilters[key] = localFilters[key];
        }
      }
    });
    if (typeof onFilterChange === "function") {
      onFilterChange(activeFilters);
    } else {
      console.error(
        "SubscriptionTableToolbar: onFilterChange prop is not a function or not passed!"
      );
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "",
      type: "",
      startDate: null,
      endDate: null,
      source: "",
    };
    setLocalFilters(clearedFilters);
    if (typeof onFilterChange === "function") {
      onFilterChange({});
    } else {
      console.error(
        "SubscriptionTableToolbar: onFilterChange prop is not a function or not passed on clear!"
      );
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
            {/* ... الحقول الأخرى ... */}
            <Grid item xs={12} sm={6} md={2.4}>
              <MDInput
                select
                fullWidth
                label="Status"
                name="status"
                value={localFilters.status}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MDInput
                select
                fullWidth
                label="Subscription Type"
                name="type"
                value={localFilters.type}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id || type.value}>
                    {type.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MDInput
                select
                fullWidth
                label="Source"
                name="source"
                value={localFilters.source}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Sources</em>
                </MenuItem>
                {availableSources.map((source) => (
                  <MenuItem key={source.value || source} value={source.value || source}>
                    {source.label || source || "Unknown"}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <DatePicker
                label="From Date"
                value={localFilters.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <DatePicker
                label="To Date"
                value={localFilters.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>

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
