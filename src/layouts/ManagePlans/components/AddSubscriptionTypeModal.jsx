// src/layouts/ManagePlans/components/AddSubscriptionTypeModal.jsx
import React, { useState, useEffect, useCallback } from "react";
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
import {
  Grid,
  Divider,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { createSubscriptionType, getSubscriptionGroups } from "services/api";
import FeaturesInput from "./FeaturesInput";
import { useSnackbar } from "notistack";

function AddSubscriptionTypeModal({ open, onClose, onTypeAdded }) {
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [mainChannelId, setMainChannelId] = useState("");
  const [mainChannelName, setMainChannelName] = useState("");
  const [secondaryChannels, setSecondaryChannels] = useState([
    { channel_id: "", channel_name: "" },
  ]);
  const [features, setFeatures] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [isActive, setIsActive] = useState(true);

  const [groupId, setGroupId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isRecommended, setIsRecommended] = useState(false);
  const [usp, setUsp] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [nameError, setNameError] = useState(false);
  const [mainChannelIdError, setMainChannelIdError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [availableGroups, setAvailableGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setMainChannelId("");
    setMainChannelName("");
    setSecondaryChannels([{ channel_id: "", channel_name: "" }]);
    setFeatures([]);
    setTermsAndConditions([]);
    setIsActive(true);
    setGroupId("");
    setSortOrder(0);
    setIsRecommended(false);
    setUsp("");
    setImageUrl("");
    setNameError(false);
    setMainChannelIdError(false);
    setIsSaving(false);
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!open) return;
    setLoadingGroups(true);
    try {
      const groups = await getSubscriptionGroups();
      setAvailableGroups(groups || []);
    } catch (error) {
      console.error("Error fetching groups for modal:", error);
      enqueueSnackbar("Failed to load subscription groups.", { variant: "error" });
      setAvailableGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [open, enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      resetForm();
      fetchGroups();
    } else {
      setAvailableGroups([]);
    }
  }, [open, resetForm, fetchGroups]);

  const handleAddSecondaryChannel = () => {
    if (isSaving) return;
    setSecondaryChannels((prev) => [...prev, { channel_id: "", channel_name: "" }]);
  };

  const handleRemoveSecondaryChannel = (index) => {
    if (isSaving) return;
    const newChannels = secondaryChannels.filter((_, i) => i !== index);
    setSecondaryChannels(
      newChannels.length > 0 ? newChannels : [{ channel_id: "", channel_name: "" }]
    );
  };

  const handleSecondaryChannelChange = (index, field, value) => {
    if (isSaving) return;
    const newChannels = [...secondaryChannels];
    newChannels[index][field] = value;
    setSecondaryChannels(newChannels);
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    let isValid = true;
    setNameError(!name.trim());
    setMainChannelIdError(!mainChannelId.trim() || isNaN(parseInt(mainChannelId.trim(), 10)));

    if (!name.trim() || !mainChannelId.trim() || isNaN(parseInt(mainChannelId.trim(), 10))) {
      isValid = false;
    }

    const parsedMainChannelId = parseInt(mainChannelId.trim(), 10);
    const finalSecondaryChannels = secondaryChannels
      .map((ch) => ({
        channel_id: ch.channel_id?.toString().trim()
          ? parseInt(ch.channel_id.toString().trim(), 10)
          : null,
        channel_name: ch.channel_name?.trim() || null,
      }))
      .filter((ch) => ch.channel_id !== null && !isNaN(ch.channel_id));

    for (const ch of finalSecondaryChannels) {
      if (ch.channel_id === parsedMainChannelId) {
        enqueueSnackbar("Secondary channel ID cannot be the same as the Main Channel ID.", {
          variant: "error",
        });
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    const dataToCreate = {
      name: name.trim(),
      main_channel_id: parsedMainChannelId,
      main_channel_name: mainChannelName.trim() || `Main Channel for ${name.trim()}`,
      secondary_channels: finalSecondaryChannels,
      features: features.filter((f) => f.trim() !== ""),
      terms_and_conditions: termsAndConditions.filter((t) => t.trim() !== ""),
      is_active: isActive,
      group_id: groupId ? parseInt(groupId, 10) : null,
      sort_order: parseInt(sortOrder, 10) || 0,
      is_recommended: isRecommended,
      usp: usp.trim() || null,
      image_url: imageUrl.trim() || null,
    };

    setIsSaving(true);
    try {
      const newType = await createSubscriptionType(dataToCreate);
      enqueueSnackbar("Subscription type created successfully!", { variant: "success" });
      onTypeAdded(newType);
      onClose();
    } catch (error) {
      console.error("Error creating subscription type:", error);
      enqueueSnackbar(error.response?.data?.error || "Failed to create subscription type.", {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? () => {} : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <MDTypography variant="h5" fontWeight="bold">
          Add New Subscription Type
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MDBox component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {" "}
            {/* spacing={3} قد يكون أفضل إذا كان مزدحماً */}
            {/* --- Section: Basic Information --- */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                Basic Information
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={7}>
              <MDInput
                label="Type Name *"
                fullWidth
                required
                value={name}
                error={nameError}
                helperText={nameError ? "Type Name is required" : ""}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              xs={6}
              sm={2.5}
              sx={{ display: "flex", alignItems: "center", pt: { xs: 0, sm: "4px" } }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                    disabled={isSaving}
                  />
                }
                label={<MDTypography variant="body2">Active</MDTypography>}
                sx={{ ml: -1 }}
              />
            </Grid>
            <Grid
              item
              xs={6}
              sm={2.5}
              sx={{ display: "flex", alignItems: "center", pt: { xs: 0, sm: "4px" } }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRecommended}
                    onChange={(e) => setIsRecommended(e.target.checked)}
                    color="primary"
                    disabled={isSaving}
                  />
                }
                label={<MDTypography variant="body2">Recommended</MDTypography>}
                sx={{ ml: -1 }}
              />
            </Grid>
            {/* --- Section: Organization & Display --- */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                Organization & Display
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled={isSaving || loadingGroups}>
                <InputLabel id="group-select-label-add">Assign to Group</InputLabel>
                <Select
                  labelId="group-select-label-add"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  label="Assign to Group"
                >
                  <MenuItem value="">
                    <em>None (Ungrouped)</em>
                  </MenuItem>
                  {availableGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
                {loadingGroups && (
                  <CircularProgress
                    size={20}
                    sx={{ position: "absolute", right: 40, top: "50%", marginTop: "-10px" }}
                  />
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Sort Order (in group)"
                type="number"
                fullWidth
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={isSaving}
                variant="outlined"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Unique Selling Proposition (USP)"
                fullWidth
                value={usp}
                onChange={(e) => setUsp(e.target.value)}
                disabled={isSaving}
                variant="outlined"
                placeholder="e.g. Best value for families"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Image URL"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isSaving}
                variant="outlined"
                placeholder="https://example.com/image.png"
              />
            </Grid>
            {/* --- Section: Channel Configuration --- */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                Channel Configuration
              </MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: -0.5 }}>
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
                helperText={mainChannelIdError ? "Main Channel ID is required" : ""}
                onChange={(e) => setMainChannelId(e.target.value)}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Main Channel Name"
                fullWidth
                value={mainChannelName}
                onChange={(e) => setMainChannelName(e.target.value)}
                disabled={isSaving}
                variant="outlined"
                placeholder={`Defaults to "Main Channel for {Name}"`}
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 1.5 }}>
              <Divider light={false} />
            </Grid>
            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
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
              <React.Fragment key={`sec-ch-add-${index}`}>
                <Grid item xs={12} sm={5.5}>
                  <MDInput
                    label={`Sec. Channel ID ${index + 1}`}
                    type="number"
                    fullWidth
                    value={channel.channel_id}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_id", e.target.value)
                    }
                    disabled={isSaving}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={5.5}>
                  <MDInput
                    label={`Sec. Channel Name ${index + 1}`}
                    fullWidth
                    value={channel.channel_name}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_name", e.target.value)
                    }
                    disabled={isSaving}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={1}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}
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
            {/* لا يوجد خيار إرسال الدعوات هنا في نافذة الإضافة */}
            {/* --- Section: Additional Details --- */}
            <Grid item xs={12} sx={{ mt: 1.5 }}>
              <Divider light={false} />
            </Grid>
            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                Additional Details
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
          disabled={isSaving || loadingGroups}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSaving ? "Creating..." : "Add Type"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddSubscriptionTypeModal;
