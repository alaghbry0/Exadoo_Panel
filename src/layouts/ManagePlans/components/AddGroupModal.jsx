// src/layouts/ManagePlans/components/AddGroupModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createSubscriptionGroup } from "services/api"; // فقط create
import ColorPicker from "./ColorPicker";
import IconPicker from "./IconPicker";
import { useSnackbar } from "notistack";

function AddGroupModal({ open, onClose, onGroupAdded }) {
  // تم تغيير onGroupUpserted إلى onGroupAdded
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [color, setColor] = useState("#3f51b5");
  const [icon, setIcon] = useState("category");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [nameError, setNameError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setImageUrl("");
    setColor("#3f51b5");
    setIcon("category");
    setIsActive(true);
    setSortOrder(0);
    setNameError(false);
    setIsSaving(false);
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = async () => {
    setNameError(false);
    if (!name.trim()) {
      setNameError(true);
      enqueueSnackbar("Group Name is required.", { variant: "error" });
      return;
    }

    const groupData = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      color: color,
      icon: icon.trim() || "category",
      is_active: isActive,
      sort_order: parseInt(String(sortOrder), 10) || 0,
    };

    setIsSaving(true);
    try {
      await createSubscriptionGroup(groupData);
      enqueueSnackbar(`Group "${groupData.name}" created successfully.`, { variant: "success" });
      onGroupAdded();
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      const errorMessage = error.response?.data?.error || "Failed to create group.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? () => {} : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <MDTypography variant="h5" fontWeight="bold">
          Add New Subscription Group
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MDBox component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <MDInput
                label="Group Name *"
                fullWidth
                required
                value={name}
                error={nameError}
                helperText={nameError ? "Group Name is required" : ""}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Description (Optional)"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ColorPicker
                label="Group Color"
                value={color}
                onChange={setColor}
                disabled={isSaving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <IconPicker
                label="Group Icon Name"
                value={icon}
                onChange={setIcon}
                disabled={isSaving}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Image URL (Optional)"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="Sort Order"
                type="number"
                fullWidth
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={isSaving}
                variant="outlined"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", alignItems: "center", justifyContent: { sm: "flex-end" } }}
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
                sx={{ mr: { sm: 0 }, ml: { xs: -1, sm: 0 } }}
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
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSaving ? "Creating..." : "Create Group"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddGroupModal;
