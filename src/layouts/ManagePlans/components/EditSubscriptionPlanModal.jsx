import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { updateSubscriptionPlan } from "services/api";

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

function EditSubscriptionPlanModal({ open, onClose, plan, onPlanUpdated }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [telegramStarsPrice, setTelegramStarsPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name || "");
      setPrice(plan.price || "");
      setOriginalPrice(plan.original_price || "");
      setDurationDays(plan.duration_days || "");
      setTelegramStarsPrice(plan.telegram_stars_price || "");
      setIsActive(Boolean(plan.is_active));
      setIsTrial(Boolean(plan.is_trial));
    }
  }, [plan]);

  useEffect(() => {
    if (isTrial) {
      setPrice("0");
      setOriginalPrice("0");
      if (!durationDays) setDurationDays("14");
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
      name: name.trim(),
      price: parseFloat(isTrial ? "0" : price),
      original_price: originalPrice ? parseFloat(isTrial ? "0" : originalPrice) : null,
      duration_days: parseInt(durationDays, 10),
      telegram_stars_price: parseInt(telegramStarsPrice, 10) || 0,
      is_active: isActive,
      is_trial: isTrial,
    };

    try {
      const updatedPlan = await updateSubscriptionPlan(plan.id, data);
      onPlanUpdated(updatedPlan);
      onClose();
    } catch (error) {
      console.error("Error updating subscription plan", error);
      alert(error?.response?.data?.error || "Failed to update plan.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>
        <MDTypography variant="h5" fontWeight="bold">
          Edit Subscription Plan
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
            margin="dense"
            InputLabelProps={{ style: { fontWeight: "bold" } }}
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
            margin="dense"
            InputLabelProps={{ style: { fontWeight: "bold" } }}
          />
          <MDInput
            label="Telegram Stars Price"
            type="number"
            fullWidth
            variant="outlined"
            value={telegramStarsPrice}
            onChange={(e) => setTelegramStarsPrice(e.target.value)}
            margin="dense"
            InputLabelProps={{ style: { fontWeight: "bold" } }}
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
            sx={{ mt: 2 }}
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
            sx={{ mt: 1 }}
          />
        </MDBox>
      </StyledDialogContent>

      <StyledDialogActions>
        <MDButton onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="primary" variant="contained">
          Save Changes
        </MDButton>
      </StyledDialogActions>
    </Dialog>
  );
}

export default EditSubscriptionPlanModal;
