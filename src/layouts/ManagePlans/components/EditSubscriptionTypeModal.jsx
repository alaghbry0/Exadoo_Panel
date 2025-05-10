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
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
// تأكد أن اسم الدالة صحيح، في بياناتك استخدمت getSubscriptionType
import { updateSubscriptionType, getSubscriptionType } from "services/api";
import FeaturesInput from "./FeaturesInput";
import { Grid, Divider, Tooltip, CircularProgress } from "@mui/material";

function EditSubscriptionTypeModal({ open, onClose, subscriptionTypeId, onTypeUpdated }) {
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState("");
  const [mainChannelName, setMainChannelName] = useState("");
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]);
  const [features, setFeatures] = useState([]); // القيمة الأولية يجب أن تكون مصفوفة
  const [isActive, setIsActive] = useState(true);
  const theme = useTheme();

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (open && subscriptionTypeId) {
        setLoadingDetails(true);
        setName(""); // إعادة تعيين عند التحميل لتجنب عرض بيانات قديمة
        setMainChannelId("");
        setMainChannelName("");
        setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
        setFeatures([]);
        setIsActive(true);
        try {
          const typeDetails = await getSubscriptionType(subscriptionTypeId);
          setName(typeDetails.name || "");
          setMainChannelId(typeDetails.main_channel_id?.toString() || "");

          const mainCh = typeDetails.linked_channels?.find((ch) => ch.is_main === true);
          setMainChannelName(mainCh?.channel_name || "");

          const secChs = typeDetails.linked_channels?.filter((ch) => ch.is_main === false) || [];
          setSecondaryChannels(
            secChs.length > 0
              ? secChs.map((ch) => ({
                  channel_id: ch.channel_id.toString(),
                  channel_name: ch.channel_name || "",
                }))
              : [{ channel_id: "", channel_name: "" }]
          );

          // --- هذا هو الجزء المهم لتصحيح الخطأ ---
          let parsedFeatures = [];
          if (typeDetails.features) {
            if (typeof typeDetails.features === "string") {
              try {
                parsedFeatures = JSON.parse(typeDetails.features);
                if (!Array.isArray(parsedFeatures)) {
                  console.warn(
                    "Parsed features from string is not an array, defaulting to empty array. Original:",
                    typeDetails.features
                  );
                  parsedFeatures = [];
                }
              } catch (e) {
                console.error(
                  "Failed to parse features JSON string in EditModal:",
                  typeDetails.features,
                  e
                );
                parsedFeatures = [];
              }
            } else if (Array.isArray(typeDetails.features)) {
              parsedFeatures = typeDetails.features;
            } else {
              console.warn(
                "Features field is neither a string nor an array, defaulting to empty. Original:",
                typeDetails.features
              );
            }
          }
          setFeatures(parsedFeatures);
          // --- نهاية الجزء المهم ---

          setIsActive(typeDetails.is_active !== undefined ? typeDetails.is_active : true);
        } catch (error) {
          console.error("Error fetching subscription type details for edit:", error);
          // يمكنك إغلاق النموذج أو عرض رسالة خطأ أكثر وضوحًا للمستخدم
          // onClose(); // أغلق النموذج إذا فشل جلب البيانات بشكل كامل
        } finally {
          setLoadingDetails(false);
        }
      }
    };
    fetchDetails();
  }, [open, subscriptionTypeId]); // أضف onClose إلى قائمة الاعتماديات إذا كنت ستستخدمه في catch

  const handleAddSecondaryChannel = () => {
    setSecondaryChannels([...secondaryChannels, { channel_id: "", channel_name: "" }]);
  };

  const handleRemoveSecondaryChannel = (index) => {
    const newChannels = secondaryChannels.filter((_, i) => i !== index);
    // إذا كانت المصفوفة الناتجة فارغة، أضف عنصرًا فارغًا واحدًا
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
      secondary_channels: finalSecondaryChannels, // الـ API يتوقع مصفوفة من الكائنات
      features: Array.isArray(features) ? features : [], // تأكد أنها مصفوفة دائمًا
      is_active: isActive,
      // أضف أي حقول أخرى يتم إرسالها مثل description, image_url, usp
    };

    try {
      const updatedType = await updateSubscriptionType(subscriptionTypeId, dataToUpdate);
      onTypeUpdated(updatedType);
      onClose();
    } catch (error) {
      console.error("Error updating subscription type", error);
      alert(error.response?.data?.error || "Failed to update subscription type.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <MDTypography variant="h5" fontWeight="bold">
          Edit Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        {loadingDetails ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
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
                  sx={{ mt: 1.5 }} // لضبط المحاذاة العمودية
                />
              </Grid>

              {/* Main Channel Section */}
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

              {/* Secondary Channels Section */}
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
                  {" "}
                  {/* مفتاح فريد */}
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
                    {/* اسمح بحذف أي قناة فرعية، حتى لو كانت الأخيرة. المنطق في handleRemove سيضيف حقلاً فارغًا إذا لزم الأمر */}
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

              {/* Features Section */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                  Features
                </MDTypography>
                <FeaturesInput value={features} onChange={setFeatures} />
              </Grid>
            </Grid>
          </MDBox>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton onClick={onClose} color="secondary" variant="text">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="info" variant="gradient" disabled={loadingDetails}>
          Save Changes
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditSubscriptionTypeModal;
