// src/layouts/ManagePlans/components/EditSubscriptionPlanModal.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { updateSubscriptionPlan } from "services/api";

// Styled components لتحسين التنسيق
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
  const [durationDays, setDurationDays] = useState("");
  const [telegramStarsPrice, setTelegramStarsPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (plan) {
      setName(plan.name || "");
      setPrice(plan.price || "");
      setDurationDays(plan.duration_days || "");
      setTelegramStarsPrice(plan.telegram_stars_price || "");
      setIsActive(plan.is_active);
    }
  }, [plan]);

  const handleSubmit = async () => {
    const data = {
      name,
      price: parseFloat(price),
      duration_days: parseInt(durationDays, 10),
      telegram_stars_price: parseInt(telegramStarsPrice, 10),
      is_active: isActive,
    };
    try {
      const updatedPlan = await updateSubscriptionPlan(plan.id, data);
      onPlanUpdated(updatedPlan);
      onClose();
    } catch (error) {
      console.error("Error updating subscription plan", error);
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
          <MDInput
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            margin="dense"
            InputLabelProps={{ style: { fontWeight: "bold" } }}
          />
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
