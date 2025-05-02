// layouts/tables/components/SubscriptionFormModal.jsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Grid } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

const SubscriptionFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  subscriptionTypes = [],
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    telegram_id: "",
    full_name: "",
    username: "",
    subscription_type_id: "",
    expiry_date: null,
  });

  useEffect(() => {
    if (open) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        setFormData({
          telegram_id: initialValues.telegram_id || "",
          full_name: initialValues.full_name || "",
          username: initialValues.username || "",
          subscription_type_id: initialValues.subscription_type_id || "",
          expiry_date: initialValues.expiry_date ? new Date(initialValues.expiry_date) : null,
        });
      } else {
        setFormData({
          telegram_id: "",
          full_name: "",
          username: "",
          subscription_type_id: "",
          expiry_date: null,
        });
      }
    }
  }, [initialValues, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, expiry_date: date });
  };

  const handleSubmit = () => {
    if (
      !formData.telegram_id ||
      !formData.full_name ||
      !formData.username ||
      !formData.subscription_type_id ||
      !formData.expiry_date
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    const date = new Date(formData.expiry_date);
    date.setHours(0, 0, 1, 600);
    const processedData = {
      ...formData,
      expiry_date: date.toISOString(),
    };
    onSubmit(processedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold" color="dark">
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
                disabled={isEdit} // أضف هذا السطر
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
                disabled={isEdit} // أضف هذا السطر
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
                  style: { fontWeight: "bold" },
                }}
              >
                <MenuItem value="" disabled>
                  Select Subscription Type
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
              <DatePicker
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={handleDateChange}
                renderInput={(params) => <MDInput fullWidth {...params} />}
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
