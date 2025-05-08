// layouts/tables/components/ExportModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
5;
import MDTypography from "components/MDTypography";

const ExportModal = ({ open, onClose, onSubmit, subscriptionTypes = [] }) => {
  const [filters, setFilters] = useState({
    subscription_type_id: "",
    start_date: null,
    end_date: null,
    active: "all",
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleChange = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleDateChange = (field) => (date) => {
    setFilters({ ...filters, [field]: date });
  };

  const toggleAdvanced = () => {
    setAdvancedOpen((prev) => !prev);
  };

  const handleExport = () => {
    const exportFilters = {
      subscription_type_id: filters.subscription_type_id,
      active: filters.active,
      start_date: filters.start_date ? filters.start_date.toISOString().split("T")[0] : "",
      end_date: filters.end_date ? filters.end_date.toISOString().split("T")[0] : "",
    };
    onSubmit(exportFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography variant="h5" color="dark">
            Export Subscriptions
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox my={2}>
            <MDInput
              select
              label="Subscription Type"
              value={filters.subscription_type_id}
              onChange={handleChange("subscription_type_id")}
              fullWidth
            >
              {subscriptionTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </MDInput>
          </MDBox>

          <MDBox display="flex" alignItems="center" justifyContent="flex-end">
            <MDButton
              variant="outlined"
              color="info"
              onClick={toggleAdvanced}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              }
            >
              Advanced Settings
            </MDButton>
          </MDBox>

          <Collapse in={advancedOpen}>
            <MDBox my={2}>
              <DatePicker
                label="Start Date"
                value={filters.start_date}
                onChange={handleDateChange("start_date")}
                renderInput={(params) => <MDInput fullWidth {...params} />}
              />
            </MDBox>
            <MDBox my={2}>
              <DatePicker
                label="End Date"
                value={filters.end_date}
                onChange={handleDateChange("end_date")}
                renderInput={(params) => <MDInput fullWidth {...params} />}
              />
            </MDBox>
            <MDBox my={2}>
              <MDInput
                select
                label="Status Filter"
                value={filters.active}
                onChange={handleChange("active")}
                fullWidth
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </MDInput>
            </MDBox>
          </Collapse>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="info" onClick={handleExport}>
            Export
          </MDButton>
          <MDButton variant="h6" onClick={onClose}>
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ExportModal;
