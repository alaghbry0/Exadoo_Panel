// src/layouts/managePlans/components/EditSubscriptionPlanModal.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import { updateSubscriptionPlan } from "services/api";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles"; // Corrected quotes for import
import Typography from "@mui/material/Typography"; // Imported Typography - Fixes react/jsx-no-undef

// Styled Dialog Title for enhanced visual hierarchy
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  "&.MuiDialogTitle-root": {
    // Corrected quotes
    padding: theme.spacing(3),
    textAlign: "center", // Corrected quotes
    fontWeight: "bold", // Corrected quotes
    fontSize: "1.5rem", // Corrected quotes
    color: theme.palette.text.primary,
  },
}));

// Styled Dialog Content for improved spacing
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&.MuiDialogContent-root": {
    // Corrected quotes
    padding: theme.spacing(3),
  },
}));

// Styled Dialog Actions for better button styling and alignment
const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  "&.MuiDialogActions-root": {
    // Corrected quotes
    padding: theme.spacing(2, 3, 3, 3),
    justifyContent: "center", // Corrected quotes
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
      <StyledDialogTitle>Edit Subscription Plan {/* English Dialog Title */}</StyledDialogTitle>
      <StyledDialogContent>
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="Plan Name" // English Label
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label - Corrected quotes
          />
          <TextField
            margin="dense"
            label="Price" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label - Corrected quotes
          />
          <TextField
            margin="dense"
            label="Duration (Days)" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label - Corrected quotes
          />
          <TextField
            margin="dense"
            label="Telegram Stars Price" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={telegramStarsPrice}
            onChange={(e) => setTelegramStarsPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label - Corrected quotes
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography fontWeight="bold">Active</Typography>} // Bold label for checkbox - Typography imported
            sx={{ mt: 2 }} // Added margin top for spacing
          />
        </MDBox>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel {/* English Cancel Button */}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save Changes {/* English Save Changes Button */}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}

export default EditSubscriptionPlanModal;
