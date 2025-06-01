// src/layouts/ManagePlans/components/EditSubscriptionTypeModal.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { updateSubscriptionType } from "services/api"; // تأكد أن هذا المسار صحيح
import FeaturesInput from "./FeaturesInput"; // تأكد أن هذا المسار صحيح
import { Grid, Divider, Tooltip, CircularProgress } from "@mui/material";

function EditSubscriptionTypeModal({ open, onClose, subscriptionTypeData, onTypeUpdated }) {
  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState("");
  const [mainChannelName, setMainChannelName] = useState("");
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]);
  const [features, setFeatures] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [sendInvites, setSendInvites] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);

  // حالة لتتبع عملية الحفظ
  const [isSaving, setIsSaving] = useState(false);

  const parseJsonSafe = (jsonString, fieldNameForErrorLog) => {
    if (typeof jsonString === "string") {
      try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
          console.warn(
            `Parsed ${fieldNameForErrorLog} from string is not an array, defaulting to empty array. Original:`,
            jsonString
          );
          return [];
        }
        return parsed;
      } catch (e) {
        console.error(
          `Failed to parse ${fieldNameForErrorLog} JSON string in EditModal:`,
          jsonString,
          e
        );
        return [];
      }
    } else if (Array.isArray(jsonString)) {
      return jsonString;
    } else if (jsonString === null || jsonString === undefined) {
      return [];
    }
    console.warn(
      `${fieldNameForErrorLog} field is not a string, array, null, or undefined, defaulting to empty. Original:`,
      jsonString
    );
    return [];
  };

  useEffect(() => {
    if (open && subscriptionTypeData) {
      setName(subscriptionTypeData.name || "");
      setMainChannelId(subscriptionTypeData.main_channel_id?.toString() || "");
      const mainCh = subscriptionTypeData.linked_channels?.find((ch) => ch.is_main === true);
      setMainChannelName(mainCh?.channel_name || "");
      const secChs =
        subscriptionTypeData.linked_channels?.filter((ch) => ch.is_main === false) || [];
      setSecondaryChannels(
        secChs.length > 0
          ? secChs.map((ch) => ({
              channel_id: ch.channel_id.toString(),
              channel_name: ch.channel_name || "",
            }))
          : [{ channel_id: "", channel_name: "" }]
      );
      setFeatures(parseJsonSafe(subscriptionTypeData.features, "features"));
      setTermsAndConditions(
        parseJsonSafe(subscriptionTypeData.terms_and_conditions, "terms_and_conditions")
      );
      setIsActive(
        subscriptionTypeData.is_active !== undefined ? subscriptionTypeData.is_active : true
      );
      setSendInvites(false); // عادةً ما يتم إعادة تعيين هذا الخيار عند كل فتح
      setIsSaving(false); // إعادة تعيين حالة الحفظ عند فتح النافذة مجددًا
    } else if (!open) {
      // إعادة تعيين الحالات عند إغلاق النافذة
      setName("");
      setMainChannelId("");
      setMainChannelName("");
      setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
      setFeatures([]);
      setTermsAndConditions([]);
      setIsActive(true);
      setSendInvites(false);
      setNameError(false);
      setMainChannelIdError(false);
      setIsSaving(false); // إعادة تعيين حالة الحفظ عند إغلاق النافذة
    }
  }, [open, subscriptionTypeData]);

  const handleAddSecondaryChannel = () => {
    if (isSaving) return; // منع الإضافة أثناء الحفظ
    setSecondaryChannels([...secondaryChannels, { channel_id: "", channel_name: "" }]);
  };

  const handleRemoveSecondaryChannel = (index) => {
    if (isSaving) return; // منع الحذف أثناء الحفظ
    const newChannels = secondaryChannels.filter((_, i) => i !== index);
    setSecondaryChannels(
      newChannels.length > 0 ? newChannels : [{ channel_id: "", channel_name: "" }]
    );
  };

  const handleSecondaryChannelChange = (index, field, value) => {
    if (isSaving) return; // منع التغيير أثناء الحفظ
    const newChannels = [...secondaryChannels];
    newChannels[index][field] = value;
    setSecondaryChannels(newChannels);
  };

  const handleSubmit = async () => {
    if (isSaving) return; // منع إرسال متعدد إذا كان الحفظ جارياً

    setNameError(false);
    setMainChannelIdError(false);
    let isValid = true;

    if (!name.trim()) {
      setNameError(true);
      isValid = false;
    }
    const parsedMainChannelId = parseInt(mainChannelId.trim(), 10);
    if (!mainChannelId.trim() || isNaN(parsedMainChannelId)) {
      setMainChannelIdError(true);
      isValid = false;
    }
    const finalSecondaryChannels = secondaryChannels
      .map((ch) => ({
        channel_id: ch.channel_id ? parseInt(ch.channel_id.toString().trim(), 10) : null,
        channel_name: ch.channel_name?.trim() || null, // تأكد من إرسال null إذا كان فارغًا
      }))
      .filter(
        (ch) =>
          ch.channel_id !== null && !isNaN(ch.channel_id) && ch.channel_id.toString().trim() !== ""
      ); // تصفية أكثر دقة

    for (const ch of finalSecondaryChannels) {
      if (ch.channel_id === parsedMainChannelId) {
        alert("Secondary channel ID cannot be the same as the Main Channel ID.");
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    const dataToUpdate = {
      name: name.trim(),
      main_channel_id: parsedMainChannelId,
      main_channel_name: mainChannelName.trim() || null, // أرسل null إذا كان اسم القناة الرئيسية فارغًا
      secondary_channels: finalSecondaryChannels,
      features: Array.isArray(features) ? features.filter((f) => f.trim() !== "") : [], // تصفية الميزات الفارغة
      terms_and_conditions: Array.isArray(termsAndConditions)
        ? termsAndConditions.filter((t) => t.trim() !== "")
        : [], // تصفية الشروط الفارغة
      is_active: isActive,
      send_invites_for_new_channels: sendInvites,
      // تأكد من أنك لا ترسل image_url و usp إذا لم تكن تنوي تعديلها هنا
      // أو إذا كنت تريد إرسالها دائمًا، تأكد من وجودها في dataToUpdate
    };

    setIsSaving(true);
    try {
      const updatedType = await updateSubscriptionType(subscriptionTypeData.id, dataToUpdate);
      onTypeUpdated(updatedType); // أبلغ المكون الأصل بالتحديث
      onClose(); // أغلق النافذة فقط بعد النجاح
    } catch (error) {
      console.error("Error updating subscription type:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update subscription type. Please try again.";
      alert(`Error: ${errorMessage}`); // من الأفضل استخدام مكون تنبيه مخصص بدلاً من alert
    } finally {
      setIsSaving(false);
    }
  };

  // إذا لم تكن بيانات الاشتراك متاحة عند فتح النافذة، اعرض رسالة أو مؤشر تحميل
  if (open && !subscriptionTypeData) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <CircularProgress />
          <MDTypography sx={{ ml: 2 }}>Loading subscription data...</MDTypography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={isSaving ? () => {} : onClose} // منع الإغلاق أثناء الحفظ
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <MDTypography variant="h5" fontWeight="bold">
          Edit Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MDBox component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {/* Type Name & Active Status */}
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
                variant="outlined"
                disabled={isSaving}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", alignItems: "center", pt: { xs: 1, sm: "12px" } }} // تعديل بسيط للـ padding
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                    sx={{ py: 0.5 }}
                    disabled={isSaving}
                  />
                }
                label={<MDTypography variant="body2">Active</MDTypography>}
              />
            </Grid>

            {/* Main Channel */}
            <Grid item xs={12} sx={{ mt: 1 }}>
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
                variant="outlined"
                disabled={isSaving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Main Channel Name (Optional)"
                fullWidth
                value={mainChannelName}
                onChange={(e) => setMainChannelName(e.target.value)}
                margin="dense"
                variant="outlined"
                disabled={isSaving}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider light={false} />
            </Grid>

            {/* Secondary Channels */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  Secondary Channels
                </MDTypography>
                <Tooltip title="Add Secondary Channel">
                  <span>
                    <IconButton
                      onClick={handleAddSecondaryChannel}
                      color="primary"
                      size="small"
                      disabled={isSaving}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </MDBox>
            </Grid>

            {secondaryChannels.map((channel, index) => (
              <React.Fragment key={`sec-ch-${index}`}>
                <Grid item xs={12} sm={5}>
                  <MDInput
                    label={`Sec. Channel ID ${index + 1}`}
                    type="number"
                    fullWidth
                    value={channel.channel_id}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_id", e.target.value)
                    }
                    margin="dense"
                    variant="outlined"
                    disabled={isSaving}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <MDInput
                    label={`Sec. Channel Name ${index + 1} (Optional)`}
                    fullWidth
                    value={channel.channel_name}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_name", e.target.value)
                    }
                    margin="dense"
                    variant="outlined"
                    disabled={isSaving}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Tooltip title="Remove Channel">
                    <span>
                      <IconButton
                        onClick={() => handleRemoveSecondaryChannel(index)}
                        color="error"
                        size="small"
                        disabled={
                          (secondaryChannels.length === 1 &&
                            !channel.channel_id &&
                            !channel.channel_name) ||
                          isSaving
                        }
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </React.Fragment>
            ))}

            {/* --- خيار إرسال الدعوات --- */}
            <Grid item xs={12} sx={{ mt: 1.5, mb: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendInvites}
                    onChange={(e) => setSendInvites(e.target.checked)}
                    color="primary"
                    sx={{ py: 0.5 }}
                    disabled={isSaving}
                  />
                }
                label={
                  <MDTypography variant="body2" component="span">
                    Send invite links
                  </MDTypography>
                }
              />
              <MDTypography
                variant="caption"
                display="block"
                color="textSecondary"
                sx={{ pl: 4, mt: -0.5 }}
              >
                For newly added secondary channels to active subscribers.
              </MDTypography>
            </Grid>

            {/* Features */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider light={false} />
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
                variant="outlined"
                disabled={isSaving}
              />
            </Grid>

            {/* Terms & Conditions */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider light={false} />
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
                variant="outlined"
                disabled={isSaving}
              />
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, pb: 2, pt: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <MDButton
          onClick={isSaving ? () => {} : onClose}
          color="secondary"
          variant="text"
          disabled={isSaving}
        >
          Cancel
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          color="info"
          variant="gradient"
          disabled={isSaving} // تم تبسيط الشرط هنا لأن التحقق من subscriptionTypeData يتم في الأعلى
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditSubscriptionTypeModal;
