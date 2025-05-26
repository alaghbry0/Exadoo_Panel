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
// import { useTheme } from "@mui/material/styles"; // لا يتم استخدامه حاليًا
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { updateSubscriptionType } from "services/api"; // تمت إزالة getSubscriptionType
import FeaturesInput from "./FeaturesInput";
import { Grid, Divider, Tooltip, CircularProgress } from "@mui/material"; // CircularProgress قد لا يكون ضروريًا

// تغيير اسم الخاصية من subscriptionTypeId إلى subscriptionTypeData
function EditSubscriptionTypeModal({ open, onClose, subscriptionTypeData, onTypeUpdated }) {
  // const [loadingDetails, setLoadingDetails] = useState(false); // لم يعد ضروريًا إذا مررنا البيانات
  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState("");
  const [mainChannelName, setMainChannelName] = useState("");
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]);
  const [features, setFeatures] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]); // <-- حالة جديدة
  const [isActive, setIsActive] = useState(true);
  // const theme = useTheme(); // لا يتم استخدامه حاليًا

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);

  // دالة مساعدة لتحليل JSON بأمان
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
      // لا حاجة لـ setLoadingDetails(true);
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
      ); // <-- إضافة جديدة

      setIsActive(
        subscriptionTypeData.is_active !== undefined ? subscriptionTypeData.is_active : true
      );
      // لا حاجة لـ finally { setLoadingDetails(false); }
    } else if (!open) {
      // إعادة تعيين النموذج عند الإغلاق إذا لم يتم تمرير البيانات
      setName("");
      setMainChannelId("");
      setMainChannelName("");
      setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
      setFeatures([]);
      setTermsAndConditions([]);
      setIsActive(true);
      setNameError(false);
      setMainChannelIdError(false);
    }
  }, [open, subscriptionTypeData]);

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
    const parsedMainChannelId = parseInt(mainChannelId.trim(), 10);
    if (!mainChannelId.trim() || isNaN(parsedMainChannelId)) {
      setMainChannelIdError(true);
      isValid = false;
    }

    const finalSecondaryChannels = secondaryChannels
      .map((ch) => ({
        channel_id: ch.channel_id ? parseInt(ch.channel_id.toString().trim(), 10) : null,
        channel_name: ch.channel_name?.trim() || null,
      }))
      .filter((ch) => ch.channel_id !== null && !isNaN(ch.channel_id));

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
      main_channel_name: mainChannelName.trim() || null,
      secondary_channels: finalSecondaryChannels,
      features: Array.isArray(features) ? features : [],
      terms_and_conditions: Array.isArray(termsAndConditions) ? termsAndConditions : [], // <-- إضافة جديدة
      is_active: isActive,
    };

    try {
      // subscriptionTypeData.id هو المعرف الصحيح هنا
      const updatedType = await updateSubscriptionType(subscriptionTypeData.id, dataToUpdate);
      onTypeUpdated(updatedType);
      onClose();
    } catch (error) {
      console.error("Error updating subscription type", error);
      alert(error.response?.data?.error || "Failed to update subscription type.");
    }
  };

  // إذا كان subscriptionTypeData غير موجود عند الفتح، لا تعرض النموذج أو اعرض رسالة خطأ
  // لكننا اعتمدنا أنه سيتم تمريره، وإلا يجب تعديل useEffect للتعامل مع جلبه
  // مع التعديل الأخير للـ SubscriptionTypeCard، يجب أن يتم تمرير subscriptionTypeData دائمًا

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <MDTypography variant="h5" fontWeight="bold">
          Edit Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        {/* لا حاجة لـ loadingDetails إذا كانت البيانات تُمرر مباشرة */}
        {/* يمكنك إضافة شرط عرض CircularProgress إذا كان subscriptionTypeData هو null في البداية */}
        {/* لكن مع التعديل في SubscriptionTypeCard، يُفترض أن subscriptionTypeData يكون متاحًا */}
        {!subscriptionTypeData && open ? ( // حالة احتياطية إذا لم يتم تمرير البيانات بشكل صحيح
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <MDTypography color="error">Error: Subscription type data not available.</MDTypography>
          </MDBox>
        ) : (
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
                    Secondary Channels
                  </MDTypography>
                  <Tooltip title="Add Secondary Channel">
                    <IconButton onClick={handleAddSecondaryChannel} color="primary" size="small">
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </MDBox>
              </Grid>

              {secondaryChannels.map((channel, index) => (
                <React.Fragment key={`sec-ch-${index}`}>
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
                    <Tooltip title="Remove Channel">
                      <IconButton
                        onClick={() => handleRemoveSecondaryChannel(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
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
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          color="info"
          variant="gradient"
          disabled={!subscriptionTypeData && open}
        >
          Save Changes
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditSubscriptionTypeModal;
