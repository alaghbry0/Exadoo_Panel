// src/layouts/ManagePlans/components/EditSubscriptionTypeModal.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MDBox from "components/MDBox";
import { updateSubscriptionType } from "services/api";
// استيراد المكون الجديد لإدخال الميزات
import FeaturesInput from "./FeaturesInput";

function EditSubscriptionTypeModal({ open, onClose, subscriptionType, onTypeUpdated }) {
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // استخدم مصفوفة لميزات الاشتراك
  const [features, setFeatures] = useState([]);
  const [usp, setUsp] = useState("");
  const [isActive, setIsActive] = useState(true);

  // تعبئة الحقول بالبيانات الحالية عند فتح النموذج
  useEffect(() => {
    if (subscriptionType) {
      setName(subscriptionType.name || "");
      setChannelId(subscriptionType.channel_id || "");
      setDescription(subscriptionType.description || "");
      setImageUrl(subscriptionType.image_url || "");
      // فحص إذا كانت features مصفوفة أو سلسلة نصية
      if (Array.isArray(subscriptionType.features)) {
        setFeatures(subscriptionType.features); // تعيين المصفوفة مباشرة
      } else if (typeof subscriptionType.features === "string") {
        setFeatures(subscriptionType.features.split(",").map((item) => item.trim())); // تقسيم السلسلة النصية إلى مصفوفة
      } else {
        setFeatures([]); // تعيين مصفوفة فارغة كقيمة افتراضية
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
      features, // مصفوفة الميزات الآن
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Subscription Type</DialogTitle>
      <DialogContent>
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="Type Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Channel ID"
            type="number"
            fullWidth
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {/* استخدام FeaturesInput بدلاً من TextField */}
          <FeaturesInput value={features} onChange={setFeatures} />
          <TextField
            margin="dense"
            label="USP"
            fullWidth
            value={usp}
            onChange={(e) => setUsp(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label="Active"
          />
        </MDBox>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditSubscriptionTypeModal;
