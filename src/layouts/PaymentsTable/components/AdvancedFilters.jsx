// components/AdvancedFilters.jsx
import React from "react";
import {
  Grid,
  Card,
  InputAdornment,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Button,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { DateRange, FilterList, Clear } from "@mui/icons-material";

const PAYMENT_METHODS = ["TON", "Bank Transfer", "Crypto"];
const CURRENCIES = ["TON", "USDT", "USD", "EUR"];
const STATUS_OPTIONS = ["pending", "completed", "failed", "underpaid", "canceled"];

const AdvancedFilters = ({ filters, onFilterChange }) => {
  const handleClearFilters = () => {
    onFilterChange("status", []);
    onFilterChange("payment_method", []);
    onFilterChange("currency", []);
    onFilterChange("start_date", "");
    onFilterChange("end_date", "");
  };

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterList sx={{ mr: 1 }} color="primary" />
        <Box flexGrow={1} fontWeight="bold">
          فلترة متقدمة
        </Box>
        <Button startIcon={<Clear />} color="secondary" size="small" onClick={handleClearFilters}>
          مسح الكل
        </Button>
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4} lg={3}>
          <FormControl fullWidth size="small">
            <InputLabel>حالة المعاملة</InputLabel>
            <Select
              multiple
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              input={<OutlinedInput label="حالة المعاملة" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <FormControl fullWidth size="small">
            <InputLabel>طريقة الدفع</InputLabel>
            <Select
              multiple
              value={filters.payment_method}
              onChange={(e) => onFilterChange("payment_method", e.target.value)}
              input={<OutlinedInput label="طريقة الدفع" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4} lg={2}>
          <FormControl fullWidth size="small">
            <InputLabel>العملة</InputLabel>
            <Select
              multiple
              value={filters.currency}
              onChange={(e) => onFilterChange("currency", e.target.value)}
              input={<OutlinedInput label="العملة" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6} lg={2}>
          <TextField
            label="من تاريخ"
            type="date"
            value={filters.start_date}
            onChange={(e) => onFilterChange("start_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <DateRange fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={2}>
          <TextField
            label="إلى تاريخ"
            type="date"
            value={filters.end_date}
            onChange={(e) => onFilterChange("end_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <DateRange fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default AdvancedFilters;
