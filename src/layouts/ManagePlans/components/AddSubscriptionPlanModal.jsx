// src/layouts/managePlans/components/AddSubscriptionPlanModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { styled, useTheme } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createSubscriptionPlan } from "services/api";

// Styled components لضبط التنسيق
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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [telegramStarsPrice, setTelegramStarsPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  const handleSubmit = async () => {
    const data = {
      subscription_type_id: subscriptionTypeId,
      name,
      price: parseFloat(price),
      duration_days: parseInt(durationDays, 10),
      telegram_stars_price: parseInt(telegramStarsPrice, 10),
      is_active: isActive,
    };
    try {
      const newPlan = await createSubscriptionPlan(data);
      onPlanAdded(newPlan);
      onClose();
      // إعادة تعيين الحقول بعد الإضافة الناجحة
      setName("");
      setPrice("");
      setDurationDays("");
      setTelegramStarsPrice("");
      setIsActive(true);
    } catch (error) {
      console.error("Error creating subscription plan", error);
      alert("Failed to add new subscription plan. Please check the form and try again.");
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
          <MDInput
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }}
            margin="dense"
          />
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
