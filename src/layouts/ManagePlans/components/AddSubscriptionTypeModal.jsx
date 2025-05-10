// src/layouts/ManagePlans/components/AddSubscriptionTypeModal.jsx
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CssBaseline from "@mui/material/CssBaseline";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton"; // لإضافة زر الحذف
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // أيقونة لإضافة قناة
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"; // أيقونة لحذف قناة
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createSubscriptionType } from "services/api"; // تأكد من أن هذه الدالة محدثة في api.js
import FeaturesInput from "./FeaturesInput";
import { Grid, Divider, Tooltip } from "@mui/material"; // للمساعدة في التنسيق

function AddSubscriptionTypeModal({ open, onClose, onTypeAdded }) {
  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState(""); // تم تغيير الاسم
  const [mainChannelName, setMainChannelName] = useState(""); // اسم القناة الرئيسية
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]); // قائمة القنوات الفرعية
  const [features, setFeatures] = useState([]); // تأكد من القيمة الافتراضية المناسبة
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);
  // يمكنك إضافة حالات خطأ للقنوات الفرعية إذا أردت التحقق المفصل

  const resetForm = () => {
    setName("");
    setMainChannelId("");
    setMainChannelName("");
    setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
    setFeatures([]);
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
    ); // أبقِ على حقل واحد فارغ إذا حذفت الكل
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
    if (!mainChannelId.trim()) {
      setMainChannelIdError(true);
      isValid = false;
    }
    // التحقق من أن mainChannelId هو رقم
    if (mainChannelId.trim() && isNaN(parseInt(mainChannelId, 10))) {
      setMainChannelIdError(true); // يمكنك إضافة رسالة خطأ محددة
      isValid = false;
    }

    // التحقق من القنوات الفرعية (اختياري، لكن إذا تم ملؤها يجب أن تكون صحيحة)
    const finalSecondaryChannels = secondaryChannels
      .map((ch) => ({
        ...ch,
        channel_id: ch.channel_id ? parseInt(ch.channel_id.toString().trim(), 10) : null,
      }))
      .filter((ch) => ch.channel_id !== null && !isNaN(ch.channel_id)); // تجاهل الحقول الفارغة أو غير الرقمية

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
      main_channel_name: mainChannelName.trim() || null, // أرسل null إذا كان فارغًا
      secondary_channels: finalSecondaryChannels.map((ch) => ({
        channel_id: ch.channel_id,
        channel_name: ch.channel_name?.trim() || null, // أرسل null إذا كان الاسم فارغًا
      })),
      features: features || [], // تأكد أن features هي مصفوفة
      is_active: isActive,
      // أضف بقية الحقول مثل description, image_url, usp إذا كانت تُدار هنا
    };

    try {
      const newType = await createSubscriptionType(data); // تأكد أن هذه الدالة تتوقع البنية الجديدة
      onTypeAdded(newType); // newType يجب أن يحتوي على linked_channels من الـ backend
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating subscription type", error);
      // يمكنك عرض رسالة خطأ أكثر تحديدًا من الـ backend إذا أمكن
      alert(
        error.response?.data?.error ||
          "Failed to add new subscription type. Please check the form and try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {" "}
      {/* زيادة العرض */}
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
                    // يمكنك إضافة error و helperText هنا إذا أردت تحققًا مفصلاً
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
                  {secondaryChannels.length > 1 && ( // لا تسمح بحذف آخر حقل، أو عدله ليصبح حقلاً واحداً فارغاً
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
              <FeaturesInput value={features} onChange={setFeatures} />
            </Grid>
            {/* أضف هنا حقول description, image_url, usp إذا كنت تريد إدارتها */}
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: theme.palette.background.paper, px: 3, pb: 2 }}>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          variant="gradient"
          color="info" // أو primary
        >
          Add Type
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddSubscriptionTypeModal;
