// src/layouts/ManagePlans/components/AddSubscriptionTypeModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import { createSubscriptionType } from "services/api";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FeaturesInput from "./FeaturesInput";
import { useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; // استيراد CssBaseline

function AddSubscriptionTypeModal({ open, onClose, onTypeAdded }) {
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [features, setFeatures] = useState();
  const [usp, setUsp] = useState("");
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  // حالات للتحقق من الصحة وعرض رسائل الخطأ
  const [nameError, setNameError] = useState(false);
  const [channelIdError, setChannelIdError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const handleSubmit = async () => {
    // إعادة تعيين حالات الخطأ عند كل محاولة إرسال
    setNameError(false);
    setChannelIdError(false);
    setDescriptionError(false);

    let isValid = true;

    // التحقق من الحقول المطلوبة
    if (!name) {
      setNameError(true);
      isValid = false;
    }
    if (!channelId) {
      setChannelIdError(true);
      isValid = false;
    }
    if (!description) {
      setDescriptionError(true);
      isValid = false;
    }

    if (!isValid) {
      // إذا كان هناك أي حقل فارغ، لا تقم بالإرسال واعرض رسائل الخطأ
      return;
    }

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
      const newType = await createSubscriptionType(data);
      onTypeAdded(newType);
      onClose();
      // إعادة تعيين الحقول بعد الإضافة الناجحة
      setName("");
      setChannelId("");
      setDescription("");
      setImageUrl("");
      setFeatures();
      setUsp("");
      setIsActive(true);
    } catch (error) {
      console.error("Error creating subscription type", error);
      alert("Failed to add new subscription type. Please check the form and try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        Add New Subscription Type
      </DialogTitle>
      <DialogContent
        sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
      >
        <CssBaseline /> {/* إضافة CssBaseline هنا */}
        <MDBox component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="Type Name *"
            fullWidth
            required
            value={name}
            error={nameError}
            helperText={nameError ? "Type Name is required" : null}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }} // لون النص لحقل الإدخال
            InputLabelProps={{ style: { color: theme.palette.text.primary } }} // لون العنوان لحقل الإدخال
          />
          <TextField
            margin="dense"
            label="Channel ID *"
            type="number"
            fullWidth
            required
            value={channelId}
            error={channelIdError}
            helperText={channelIdError ? "Channel ID is required" : null}
            onChange={(e) => setChannelId(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }} // لون النص لحقل الإدخال
            InputLabelProps={{ style: { color: theme.palette.text.primary } }} // لون العنوان لحقل الإدخال
          />
          <TextField
            margin="dense"
            label="Description *"
            fullWidth
            required
            value={description}
            error={descriptionError}
            helperText={descriptionError ? "Description is required" : null}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }} // لون النص لحقل الإدخال
            InputLabelProps={{ style: { color: theme.palette.text.primary } }} // لون العنوان لحقل الإدخال
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }} // لون النص لحقل الإدخال
            InputLabelProps={{ style: { color: theme.palette.text.primary } }} // لون العنوان لحقل الإدخال
          />
          <FeaturesInput value={features} onChange={setFeatures} />
          <TextField
            margin="dense"
            label="USP"
            fullWidth
            value={usp}
            onChange={(e) => setUsp(e.target.value)}
            InputProps={{ style: { color: theme.palette.text.primary } }} // لون النص لحقل الإدخال
            InputLabelProps={{ style: { color: theme.palette.text.primary } }} // لون العنوان لحقل الإدخال
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
            sx={{ color: theme.palette.text.primary }} // لون النص لـ FormControlLabel
          />
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: theme.palette.background.paper }}>
        <Button onClick={onClose} sx={{ color: theme.palette.text.primary }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={nameError || channelIdError || descriptionError}
          sx={{ color: theme.palette.text.primary }}
        >
          Add Type
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddSubscriptionTypeModal;
