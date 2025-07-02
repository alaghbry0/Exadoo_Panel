// src/layouts/tables/components/SubscriptionHistoryToolbar.jsx
import React, { useState, useEffect } from "react";
import { Grid, MenuItem, IconButton, Collapse, Box } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FilterListIcon from "@mui/icons-material/FilterList";

const SubscriptionHistoryToolbar = ({
  onFilterChange,
  filters: initialFiltersFromParent,
  subscriptionTypes,
  availableSources = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const [localFilters, setLocalFilters] = useState(
    () =>
      initialFiltersFromParent || {
        action_type: "",
        source: "",
        start_date: null,
        end_date: null,
      }
  );

  useEffect(() => {
    setLocalFilters(
      initialFiltersFromParent || {
        action_type: "",
        source: "",
        start_date: null,
        end_date: null,
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
          (key === "start_date" || key === "end_date") &&
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
      console.error("SubscriptionHistoryToolbar: onFilterChange prop is not a function!");
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      action_type: "",
      source: "",
      start_date: null,
      end_date: null,
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
          </MDBox>
        </Grid>
      </Grid>

      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <MDBox pt={2} mt={2} borderTop="1px solid #eee">
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                select
                fullWidth
                label="Action Type"
                name="action_type"
                value={localFilters.action_type}
                onChange={handleLocalFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Actions</em>
                </MenuItem>
                <MenuItem value="NEW">Automatically NEW</MenuItem>
                <MenuItem value="ADMIN_NEW">ADMIN NEW</MenuItem>
                <MenuItem value="RENEWAL">Automatically Renew</MenuItem>
                <MenuItem value="ADMIN_RENEWAL">ADMIN Renew</MenuItem>
                <MenuItem value="ADMIN_CANCEL">Cancel</MenuItem>
                <MenuItem value="Expired">Expire</MenuItem>
              </MDInput>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={localFilters.start_date}
                onChange={(date) => handleDateChange("start_date", date)}
                renderInput={(params) => <MDInput {...params} fullWidth variant="standard" />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={localFilters.end_date}
                onChange={(date) => handleDateChange("end_date", date)}
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

export default SubscriptionHistoryToolbar;
