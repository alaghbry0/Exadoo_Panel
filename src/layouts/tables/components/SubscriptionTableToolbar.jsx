// layouts/tables/components/SubscriptionTableToolbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Grid, MenuItem, IconButton, InputAdornment, Collapse, Box } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { DatePicker } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

// دالة Debounce
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

const SubscriptionTableToolbar = ({
  onSearch,
  onFilter,
  subscriptionTypes,
  onAddNewClick,
  availableSources = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false); // للتحكم في إظهار/إخفاء الفلاتر
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    startDate: null,
    endDate: null,
    source: "",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(onSearch, 500), [onSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    // قم بإزالة القيم الفارغة أو null من الفلاتر قبل الإرسال
    const activeFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== "") {
        activeFilters[key] = filters[key];
      }
    });
    onFilter(activeFilters);
  };

  const clearAll = () => {
    setSearchTerm("");
    setFilters({
      status: "",
      type: "",
      startDate: null,
      endDate: null,
      source: "",
    });
    onSearch("");
    onFilter({});
    setShowFilters(false); // إخفاء الفلاتر عند المسح
  };

  return (
    <MDBox p={3}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        {/* Search Input and Add New Button */}
        <Grid item xs={12} sm={6} md={5}>
          <MDInput
            fullWidth
            placeholder="Search by name, username or ID"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setSearchTerm("");
                      onSearch("");
                    }}
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm="auto">
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="outlined"
              color="info"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
            >
              Filters
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

      {/* Collapsible Filter Section */}
      <Collapse in={showFilters}>
        <MDBox pt={2} mt={2} borderTop="1px solid #eee">
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                select
                fullWidth
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                select
                fullWidth
                label="Subscription Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
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
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                select
                fullWidth
                label="Source"
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                variant="standard"
              >
                <MenuItem value="">
                  <em>All Sources</em>
                </MenuItem>
                {availableSources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source || "Unknown"}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={filters.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                renderInput={(params) => <MDInput fullWidth {...params} variant="standard" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={filters.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                renderInput={(params) => <MDInput fullWidth {...params} variant="standard" />}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <MDBox
                display="flex"
                justifyContent={{ xs: "stretch", md: "flex-end" }}
                gap={1}
                width="100%"
              >
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={applyFilters}
                  sx={{ flexGrow: { xs: 1, md: 0 } }}
                >
                  Apply Filters
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={clearAll}
                  sx={{ flexGrow: { xs: 1, md: 0 } }}
                >
                  Clear All
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
