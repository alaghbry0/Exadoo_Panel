// src/layouts/ManagePlans/components/AddSubscriptionTypeModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CssBaseline from "@mui/material/CssBaseline";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createSubscriptionType } from "services/api";
import FeaturesInput from "./FeaturesInput"; // افترض أن هذا هو المكون المستخدم للميزات
import { Grid, Divider, Tooltip } from "@mui/material";

function AddSubscriptionTypeModal({ open, onClose, onTypeAdded }) {
  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState("");
  const [mainChannelName, setMainChannelName] = useState("");
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]);
  const [features, setFeatures] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]); // <-- حالة جديدة
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);

  const resetForm = () => {
    setName("");
    setMainChannelId("");
    setMainChannelName("");
    setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
    setFeatures([]);
    setTermsAndConditions([]); // <-- إعادة تعيين
    setIsActive(true);
    setNameError(false);
    setMainChannelIdError(false);
  };

  const handleAddSecondaryChannel = () => {
    setSecondaryChannels([...secondaryChannels, { channel_id: "", channel_name: "" }]);
  };

  const handleRemoveSecondaryChannel = (index) => {
    const newChannels = secondaryChannels.filter((_, i) => i !== index);
    setSecondaryChannels(
      newChannels.length > 0 ? newChannels : [{ channel_id: "", channel_name: "" }]
    );
  };

  const handleSecondaryChannelChange = (index, field, value) => {
    const newChannels = [...secondaryChannels];
    newChannels[index][field] = value;
    setSecondaryChannels(newChannels);
  };

  const handleSubmit = async () => {
    setNameError(false);
    setMainChannelIdError(false);

    let isValid = true;
    if (!name.trim()) {
      setNameError(true);
      isValid = false;
    }
    if (!mainChannelId.trim() || isNaN(parseInt(mainChannelId.trim(), 10))) {
      setMainChannelIdError(true);
      isValid = false;
    }

    const finalSecondaryChannels = secondaryChannels
      .map((ch) => ({
        ...ch,
        channel_id: ch.channel_id ? parseInt(ch.channel_id.toString().trim(), 10) : null,
      }))
      .filter((ch) => ch.channel_id !== null && !isNaN(ch.channel_id));

    for (const ch of finalSecondaryChannels) {
      if (ch.channel_id === parseInt(mainChannelId, 10)) {
        alert("Secondary channel ID cannot be the same as the Main Channel ID.");
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    const data = {
      name: name.trim(),
      main_channel_id: parseInt(mainChannelId.trim(), 10),
      main_channel_name: mainChannelName.trim() || null,
      secondary_channels: finalSecondaryChannels.map((ch) => ({
        channel_id: ch.channel_id,
        channel_name: ch.channel_name?.trim() || null,
      })),
      features: features || [],
      terms_and_conditions: termsAndConditions || [], // <-- إضافة جديدة
      is_active: isActive,
    };

    try {
      const newType = await createSubscriptionType(data);
      onTypeAdded(newType);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating subscription type", error);
      alert(
        error.response?.data?.error ||
          "Failed to add new subscription type. Please check the form and try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ color: theme.palette.text.primary, pb: 1 }}>
        <MDTypography variant="h5" fontWeight="bold">
          Add New Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent
        sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
      >
        <CssBaseline />
        <MDBox component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Type Name *"
                fullWidth
                required
                value={name}
                error={nameError}
                helperText={nameError ? "Type Name is required" : ""}
                onChange={(e) => setName(e.target.value)}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label={<MDTypography variant="body2">Active</MDTypography>}
                sx={{ mt: 1.5 }}
              />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                Main Channel
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Main Channel ID *"
                type="number"
                fullWidth
                required
                value={mainChannelId}
                error={mainChannelIdError}
                helperText={
                  mainChannelIdError ? "Main Channel ID is required and must be a number" : ""
                }
                onChange={(e) => setMainChannelId(e.target.value)}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Main Channel Name (Optional)"
                fullWidth
                value={mainChannelName}
                onChange={(e) => setMainChannelName(e.target.value)}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  Secondary Channels (Optional)
                </MDTypography>
                <Tooltip title="Add Secondary Channel">
                  <IconButton onClick={handleAddSecondaryChannel} color="primary" size="small">
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </MDBox>
            </Grid>

            {secondaryChannels.map((channel, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={5}>
                  <MDInput
                    label={`Secondary Channel ID ${index + 1}`}
                    type="number"
                    fullWidth
                    value={channel.channel_id}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_id", e.target.value)
                    }
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <MDInput
                    label={`Secondary Channel Name ${index + 1} (Optional)`}
                    fullWidth
                    value={channel.channel_name}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_name", e.target.value)
                    }
                    margin="dense"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {secondaryChannels.length > 1 && (
                    <Tooltip title="Remove Channel">
                      <IconButton
                        onClick={() => handleRemoveSecondaryChannel(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
              </React.Fragment>
            ))}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                Features
              </MDTypography>
              <FeaturesInput
                value={features}
                onChange={setFeatures}
                label="Feature"
                placeholder="Enter a feature"
              />
            </Grid>

            {/* -- قسم الشروط والأحكام الجديد -- */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
            </Grid>
            <Grid item xs={12} sx={{ mt: 1 }}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                Terms & Conditions
              </MDTypography>
              <FeaturesInput
                value={termsAndConditions}
                onChange={setTermsAndConditions}
                label="Term"
                placeholder="Enter a term or condition"
              />
            </Grid>
            {/* -- نهاية قسم الشروط والأحكام الجديد -- */}
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: theme.palette.background.paper, px: 3, pb: 2 }}>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} variant="gradient" color="info">
          Add Type
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddSubscriptionTypeModal;
