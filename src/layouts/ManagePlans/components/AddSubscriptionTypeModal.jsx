// src/layouts/ManagePlans/components/AddSubscriptionTypeModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CssBaseline from "@mui/material/CssBaseline";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createSubscriptionType } from "services/api";
import FeaturesInput from "./FeaturesInput";

function AddSubscriptionTypeModal({ open, onClose, onTypeAdded }) {
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [features, setFeatures] = useState();
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  // حالات التحقق من الصحة
  const [nameError, setNameError] = useState(false);
  const [channelIdError, setChannelIdError] = useState(false);

  const handleSubmit = async () => {
    // إعادة تعيين حالات الخطأ
    setNameError(false);
    setChannelIdError(false);

    let isValid = true;
    if (!name) {
      setNameError(true);
      isValid = false;
    }
    if (!channelId) {
      setChannelIdError(true);
      isValid = false;
    }
    if (!isValid) return;

    const data = {
      name,
      channel_id: parseInt(channelId, 10),
      features,
      is_active: isActive,
    };

    try {
      const newType = await createSubscriptionType(data);
      onTypeAdded(newType);
      onClose();
      // إعادة تعيين الحقول بعد الإضافة الناجحة
      setName("");
      setChannelId("");
      setFeatures();
      setIsActive(true);
    } catch (error) {
      console.error("Error creating subscription type", error);
      alert("Failed to add new subscription type. Please check the form and try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        <MDTypography variant="h5" fontWeight="bold">
          Add New Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent
        sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
      >
        <CssBaseline />
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <MDInput
            label="Type Name *"
            fullWidth
            required
            value={name}
            error={nameError}
            helperText={nameError ? "Type Name is required" : ""}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }}
            InputLabelProps={{ style: { color: theme.palette.text.primary } }}
            margin="dense"
          />
          <MDInput
            label="Channel ID *"
            type="number"
            fullWidth
            required
            value={channelId}
            error={channelIdError}
            helperText={channelIdError ? "Channel ID is required" : ""}
            onChange={(e) => setChannelId(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }}
            InputLabelProps={{ style: { color: theme.palette.text.primary } }}
            margin="dense"
          />
          <FeaturesInput value={features} onChange={setFeatures} />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <MDTypography variant="body2" fontWeight="regular" color="text">
                Active
              </MDTypography>
            }
            sx={{ color: theme.palette.text.primary, mt: 1 }}
          />
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: theme.palette.background.paper }}>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          variant="gradient"
          disabled={nameError || channelIdError}
          color="primary"
        >
          Add Type
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddSubscriptionTypeModal;
