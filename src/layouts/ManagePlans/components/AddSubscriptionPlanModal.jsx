// src/layouts/managePlans/components/AddSubscriptionPlanModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import { createSubscriptionPlan } from "services/api";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles"; // Import styled for custom styling
import Typography from "@mui/material/Typography"; // Import Typography for bold label

// Styled Dialog Title for enhanced visual hierarchy
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  "&.MuiDialogTitle-root": {
    padding: theme.spacing(3),
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: theme.palette.text.primary,
  },
}));

// Styled Dialog Content for improved spacing
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&.MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
}));

// Styled Dialog Actions for better button styling and alignment
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
      setName("");
      setPrice("");
      setDurationDays("");
      setTelegramStarsPrice("");
      setIsActive(true); // Reset isActive to true for next add operation - important fix!
    } catch (error) {
      console.error("Error creating subscription plan", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>Add New Subscription Plan {/* English Dialog Title */}</StyledDialogTitle>
      <StyledDialogContent>
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="Plan Name" // English Label
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label
          />
          <TextField
            margin="dense"
            label="Price" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label
          />
          <TextField
            margin="dense"
            label="Duration (Days)" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label
          />
          <TextField
            margin="dense"
            label="Telegram Stars Price" // English Label
            type="number"
            fullWidth
            variant="outlined" // Added outlined variant for consistency
            value={telegramStarsPrice}
            onChange={(e) => setTelegramStarsPrice(e.target.value)}
            InputLabelProps={{ style: { fontWeight: "bold" } }} // Bold label
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography fontWeight="bold">Active</Typography>} // Bold label for checkbox
            sx={{ mt: 2 }} // Added margin top for spacing
          />
        </MDBox>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel {/* English Cancel Button */}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Add Plan {/* English Add Plan Button */}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}

export default AddSubscriptionPlanModal;
