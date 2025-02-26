// src/layouts/ManagePlans/components/EditSubscriptionTypeModal.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { updateSubscriptionType } from "services/api";
import FeaturesInput from "./FeaturesInput";

function EditSubscriptionTypeModal({ open, onClose, subscriptionType, onTypeUpdated }) {
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [features, setFeatures] = useState([]);
  const [usp, setUsp] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (subscriptionType) {
      setName(subscriptionType.name || "");
      setChannelId(subscriptionType.channel_id || "");
      setDescription(subscriptionType.description || "");
      setImageUrl(subscriptionType.image_url || "");
      if (Array.isArray(subscriptionType.features)) {
        setFeatures(subscriptionType.features);
      } else if (typeof subscriptionType.features === "string") {
        setFeatures(subscriptionType.features.split(",").map((item) => item.trim()));
      } else {
        setFeatures([]);
      }
      setUsp(subscriptionType.usp || "");
      setIsActive(subscriptionType.is_active);
    }
  }, [subscriptionType]);

  const handleSubmit = async () => {
    const data = {
      name,
      channel_id: parseInt(channelId, 10),
      description,
      image_url: imageUrl,
      features,
      usp,
      is_active: isActive,
    };
    try {
      const updatedType = await updateSubscriptionType(subscriptionType.id, data);
      onTypeUpdated(updatedType);
      onClose();
    } catch (error) {
      console.error("Error updating subscription type", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="bold">
          Edit Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <MDInput
            label="Type Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="dense"
          />
          <MDInput
            label="Channel ID"
            type="number"
            fullWidth
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            margin="dense"
          />
          <MDInput
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="dense"
          />
          <MDInput
            label="Image URL"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            margin="dense"
          />
          {/* استخدام FeaturesInput لإدخال الميزات */}
          <FeaturesInput value={features} onChange={setFeatures} />
          <MDInput
            label="USP"
            fullWidth
            value={usp}
            onChange={(e) => setUsp(e.target.value)}
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
            sx={{ mt: 1 }}
          />
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="primary" variant="contained">
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditSubscriptionTypeModal;
