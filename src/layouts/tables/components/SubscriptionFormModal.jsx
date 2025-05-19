// layouts/tables/components/SubscriptionFormModal.jsx
import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  TextField,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const SubscriptionFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  subscriptionTypes = [],
  availableSources = [], // Kept for future flexibility, though not used for selection in the current logic
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    telegram_id: "",
    full_name: "",
    username: "",
    subscription_type_id: "",
    expiry_date: null,
    source: "", // Initial value
  });

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues && Object.keys(initialValues).length > 0) {
        setFormData({
          telegram_id: initialValues.telegram_id || "",
          full_name: initialValues.full_name || "",
          username: initialValues.username || "",
          subscription_type_id: initialValues.subscription_type_id || "",
          expiry_date: initialValues.expiry_date ? dayjs(initialValues.expiry_date) : null,
          // --- MODIFICATION HERE ---
          // If the original source is empty/null/undefined, set a default value.
          // "unknown" is a suggestion; you can use "manual" or any other default
          // that makes sense and is acceptable by your backend.
          source: initialValues.source || "manual",
        });
      } else {
        // Add mode
        setFormData({
          telegram_id: "",
          full_name: "",
          username: "",
          subscription_type_id: "",
          expiry_date: null,
          source: "manual", // Default source for new subscriptions
        });
      }
    }
  }, [initialValues, open, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, expiry_date: newDate });
  };

  const handleSubmit = () => {
    const expiryDateISO = formData.expiry_date
      ? formData.expiry_date
          .set("hour", 0)
          .set("minute", 0)
          .set("second", 1)
          .set("millisecond", 600)
          .toISOString()
      : null;

    // The formData.source will now have a value ('unknown' or original, or 'manual' for new)
    // so the !formData.source check should pass if a default is set for empty original sources.
    if (
      !formData.telegram_id ||
      !formData.full_name ||
      !formData.username ||
      !formData.subscription_type_id ||
      !expiryDateISO ||
      !formData.source // This check remains, but source should now always have a value
    ) {
      // Consider using a more user-friendly notification (e.g., a Snackbar) instead of alert
      alert("Please fill in all required fields, including a valid expiry date.");
      return;
    }

    const processedData = {
      ...formData,
      expiry_date: expiryDateISO,
    };
    onSubmit(processedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography component="div" variant="h5" fontWeight="bold" color="dark">
            {isEdit ? "Edit Subscription" : "Add New Subscription"}
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDInput
                label="Telegram ID"
                name="telegram_id"
                type="text"
                fullWidth
                value={formData.telegram_id}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Full Name"
                name="full_name"
                type="text"
                fullWidth
                value={formData.full_name}
                onChange={handleChange}
                required
                // Full Name is always editable
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Username"
                name="username"
                type="text"
                fullWidth
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                select
                label="Subscription Type"
                name="subscription_type_id"
                fullWidth
                value={formData.subscription_type_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                SelectProps={{
                  MenuProps: {
                    MenuListProps: {
                      sx: {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      },
                    },
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select Subscription Type</em>
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem
                    key={type.id}
                    value={type.id}
                    sx={{ paddingTop: "8px", paddingBottom: "8px" }}
                  >
                    {type.name}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>
            <Grid item xs={12}>
              <MDInput
                select
                label="Source"
                name="source"
                fullWidth
                value={formData.source} // This will be 'manual' in add mode, or the original/defaulted source in edit mode
                onChange={handleChange} // Kept for consistency, but field is disabled
                required
                disabled={true} // Always disabled
                SelectProps={{
                  MenuProps: {
                    MenuListProps: {
                      sx: {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      },
                    },
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                {/*
                  The MenuItem logic here ensures that the correct value is displayed
                  in the disabled select field.
                  - For new subscriptions, 'manual' is shown.
                  - For existing subscriptions, the actual (or defaulted 'unknown') source is shown.
                */}
                {formData.source && ( // Check if formData.source has a value to display
                  <MenuItem key={formData.source} value={formData.source}>
                    {/* Capitalize first letter for display if desired, e.g., formData.source.charAt(0).toUpperCase() + formData.source.slice(1) */}
                    {formData.source}
                  </MenuItem>
                )}
                {/*
                  If you wanted to ensure a MenuItem is always present even if formData.source
                  could somehow be empty (though our useEffect logic prevents this for 'source'),
                  you might have more complex logic here. But given current setup, this is fine.
                */}
              </MDInput>
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="standard" // MDInput is typically 'standard' or 'outlined', ensure consistency
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      shrink: true,
                    }}
                    // helperText={params.error ? "Invalid date format" : ""} // Example error handling
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <MDButton onClick={onClose} color="secondary" variant="text">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} color="primary" variant="gradient">
            {isEdit ? "Update" : "Add"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubscriptionFormModal;
