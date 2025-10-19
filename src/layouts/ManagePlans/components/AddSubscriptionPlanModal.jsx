import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { styled, useTheme } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { createSubscriptionPlan } from "services/api";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  "&.MuiDialogTitle-root": {
    padding: theme.spacing(3),
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: theme.palette.text.primary,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&.MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  "&.MuiDialogActions-root": {
    padding: theme.spacing(2, 3, 3, 3),
    justifyContent: "center",
  },
}));

function AddSubscriptionPlanModal({ open, onClose, subscriptionTypeId, onPlanAdded }) {
  const theme = useTheme();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [telegramStarsPrice, setTelegramStarsPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isTrial, setIsTrial] = useState(false);

  // لو الخطة تجريبية: بنثبت السعر على 0 ونقفل الحقول
  useEffect(() => {
    if (isTrial) {
      setPrice("0");
      setOriginalPrice("0");
      if (!durationDays) setDurationDays("14"); // quality-of-life: افتراضي 14 يوم
    }
  }, [isTrial, durationDays]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Plan name is required");
      return;
    }
    if (!durationDays || Number.isNaN(Number(durationDays)) || Number(durationDays) <= 0) {
      alert("Duration must be a positive number");
      return;
    }
    if (!isTrial && (price === "" || Number(price) <= 0)) {
      alert("For non-trial plans, price must be > 0");
      return;
    }

    const data = {
      subscription_type_id: subscriptionTypeId,
      name: name.trim(),
      price: parseFloat(isTrial ? "0" : price),
      original_price: parseFloat(isTrial ? "0" : originalPrice ? originalPrice : price),
      duration_days: parseInt(durationDays, 10),
      telegram_stars_price: parseInt(telegramStarsPrice, 10) || 0,
      is_active: isActive,
      is_trial: isTrial,
    };

    try {
      const newPlan = await createSubscriptionPlan(data);
      onPlanAdded(newPlan);
      onClose();
      // reset
      setName("");
      setPrice("");
      setOriginalPrice("");
      setDurationDays("");
      setTelegramStarsPrice("");
      setIsActive(true);
      setIsTrial(false);
    } catch (error) {
      console.error("Error creating subscription plan", error);
      alert(error?.response?.data?.error || "Failed to add new subscription plan.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>
        <MDTypography variant="h5" fontWeight="bold">
          Add New Subscription Plan
        </MDTypography>
      </StyledDialogTitle>

      <StyledDialogContent>
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <MDInput
            label="Plan Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }}
            margin="dense"
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Original Price"
                type="number"
                fullWidth
                variant="outlined"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                InputLabelProps={{ style: { fontWeight: "bold" } }}
                margin="dense"
                helperText={isTrial ? "Disabled for trial" : "Price before discount"}
                disabled={isTrial}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Final Price"
                type="number"
                fullWidth
                variant="outlined"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                InputLabelProps={{ style: { fontWeight: "bold" } }}
                margin="dense"
                helperText={
                  isTrial ? "Trial plans are always $0" : "Price after discount (if applicable)"
                }
                disabled={isTrial}
              />
            </Grid>
          </Grid>

          <MDInput
            label="Duration (Days)"
            type="number"
            fullWidth
            variant="outlined"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }}
            margin="dense"
          />
          <MDInput
            label="Telegram Stars Price"
            type="number"
            fullWidth
            variant="outlined"
            value={telegramStarsPrice}
            onChange={(e) => setTelegramStarsPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }}
            margin="dense"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <MDTypography variant="body2" fontWeight="bold">
                Active
              </MDTypography>
            }
            sx={{ mt: 2, color: theme.palette.text.primary }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <MDTypography variant="body2" fontWeight="bold">
                Trial (free / once)
              </MDTypography>
            }
            sx={{ color: theme.palette.text.primary }}
          />
        </MDBox>
      </StyledDialogContent>

      <StyledDialogActions>
        <MDButton onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="primary" variant="contained">
          Add Plan
        </MDButton>
      </StyledDialogActions>
    </Dialog>
  );
}

export default AddSubscriptionPlanModal;
