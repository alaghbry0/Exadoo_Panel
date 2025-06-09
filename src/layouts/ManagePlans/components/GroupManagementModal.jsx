//src/layouts/ManagePlans/components/GroupManagementModal.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Box,
  Divider,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { ChromePicker } from "react-color";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import {
  getSubscriptionGroups,
  createSubscriptionGroup,
  updateSubscriptionGroup,
  deleteSubscriptionGroup,
} from "services/api";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// قائمة الأيقونات المتاحة
const availableIcons = [
  { value: "category", label: "Category" },
  { value: "trending_up", label: "Trending Up" },
  { value: "show_chart", label: "Show Chart" },
  { value: "currency_bitcoin", label: "Bitcoin" },
  { value: "account_balance", label: "Account Balance" },
  { value: "business", label: "Business" },
  { value: "analytics", label: "Analytics" },
  { value: "insights", label: "Insights" },
  { value: "timeline", label: "Timeline" },
  { value: "assessment", label: "Assessment" },
  { value: "star", label: "Star" },
  { value: "settings", label: "Settings" },
  { value: "support", label: "Support" },
  { value: "people", label: "People" },
  { value: "work", label: "Work" },
];

function GroupManagementModal({ open, onClose, groupData, onGroupUpdated }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // For form submission
  const [formMode, setFormMode] = useState("list"); // 'list', 'add', 'edit'
  const [currentGroup, setCurrentGroup] = useState({
    name: "",
    description: "",
    color: "#3f51b5",
    icon: "category",
    is_active: true,
    sort_order: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSubscriptionGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to fetch groups. " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGroups();
      if (groupData) {
        setFormMode("edit");
        setCurrentGroup({
          id: groupData.group_id,
          name: groupData.group_name || "",
          description: groupData.group_description || "",
          color: groupData.group_color || "#3f51b5",
          icon: groupData.group_icon || "category",
          is_active: typeof groupData.is_active === "boolean" ? groupData.is_active : true,
          sort_order: groupData.group_sort_order || 0,
        });
      } else {
        setFormMode("list");
        resetForm();
      }
    }
  }, [open, groupData]);

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        // Check if the click was on the color preview box itself
        const colorPreviewBox = document.getElementById("color-preview-box");
        if (colorPreviewBox && colorPreviewBox.contains(event.target)) {
          return; // Don't close if clicking the preview box to toggle
        }
        setShowColorPicker(false);
      }
    }
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  const resetForm = () => {
    setCurrentGroup({
      name: "",
      description: "",
      color: "#3f51b5",
      icon: "category",
      is_active: true,
      sort_order: 0,
    });
    setError("");
    setSuccess("");
    setShowColorPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGroup.name.trim()) {
      setError("Group name is required");
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "add") {
        await createSubscriptionGroup(currentGroup);
        setSuccess("Group created successfully!");
      } else if (formMode === "edit") {
        await updateSubscriptionGroup(currentGroup.id, currentGroup);
        setSuccess("Group updated successfully!");
      }

      await fetchGroups(); // Refresh list in modal
      if (onGroupUpdated) onGroupUpdated(); // Callback to refresh list in parent

      if (formMode === "add") {
        resetForm(); // Clear form for next potential addition
        setFormMode("list"); // Go back to list after successful add
      }
      // For edit, stay on the form so user can see success message, or make more changes.
      // Or: setFormMode("list"); // if you want to go back to list after edit too.
    } catch (err) {
      console.error("Error saving group:", err);
      setError(err.response?.data?.error || "Failed to save group. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (groupId, groupName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true); // Use main loading for delete operation affecting the list
    setError("");
    setSuccess("");
    try {
      await deleteSubscriptionGroup(groupId);
      setSuccess(`Group "${groupName}" deleted successfully.`);
      await fetchGroups();
      if (onGroupUpdated) onGroupUpdated();
      if (currentGroup.id === groupId) {
        // If deleting the group currently being edited
        setFormMode("list");
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      setError(err.response?.data?.error || "Failed to delete group. It might be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setFormMode("list");
    if (onClose) onClose();
  };

  const renderIconPreview = (iconName, color = "inherit", sx = {}) => {
    return <Icon sx={{ color, fontSize: "24px", ...sx }}>{iconName || "error_outline"}</Icon>;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px", maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h5" fontWeight="bold">
            {formMode === "list" && "Manage Subscription Groups"}
            {formMode === "add" && "Add New Group"}
            {formMode === "edit" && "Edit Group"}
          </MDTypography>
          {formMode !== "list" && (
            <MDButton
              variant="text"
              color="dark"
              onClick={() => {
                resetForm();
                setFormMode("list");
                // fetchGroups(); // Re-fetch if there were pending changes not saved
              }}
              sx={{ textTransform: "none" }}
            >
              <Icon sx={{ mr: 0.5 }}>arrow_back_ios</Icon>
              Back to List
            </MDButton>
          )}
        </MDBox>
      </DialogTitle>
      <Divider sx={{ my: 0 }} />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {formMode === "list" && (
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h6">Groups List ({groups.length})</MDTypography>
              <MDButton
                variant="gradient"
                color="info"
                size="small"
                startIcon={<Icon>add</Icon>}
                onClick={() => {
                  resetForm();
                  setFormMode("add");
                }}
              >
                Add Group
              </MDButton>
            </MDBox>

            {loading && groups.length === 0 ? (
              <MDBox textAlign="center" py={5}>
                <CircularProgress color="info" />
              </MDBox>
            ) : groups.length === 0 ? (
              <MDBox
                textAlign="center"
                py={4}
                sx={{ border: "1px dashed", borderColor: "divider", borderRadius: "8px" }}
              >
                <Icon sx={{ fontSize: "48px !important", color: "text.secondary", mb: 1 }}>
                  folder_off
                </Icon>
                <MDTypography variant="h6" color="text.secondary">
                  No groups found.
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                  Create your first group to organize subscription types.
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<Icon>add</Icon>}
                  onClick={() => {
                    resetForm();
                    setFormMode("add");
                  }}
                >
                  Create First Group
                </MDButton>
              </MDBox>
            ) : (
              <List sx={{ maxHeight: "calc(90vh - 250px)", overflowY: "auto", pr: 1 }}>
                {groups.map((group) => (
                  <ListItem
                    key={group.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                      mb: 1.5,
                      backgroundColor: "background.paper",
                      boxShadow: (theme) => theme.shadows[1],
                      p: 1.5,
                      "&:hover": {
                        boxShadow: (theme) => theme.shadows[3],
                      },
                    }}
                  >
                    <MDBox
                      display="flex"
                      alignItems="center"
                      mr={2}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: group.color + "20", // Light shade of group color
                        justifyContent: "center",
                      }}
                    >
                      {renderIconPreview(group.icon, group.color)}
                    </MDBox>
                    <ListItemText
                      primary={
                        <MDBox display="flex" alignItems="center" gap={1}>
                          <MDTypography variant="subtitle1" fontWeight="medium" color="dark">
                            {group.name}
                          </MDTypography>
                          <Chip
                            label={`${group.subscription_types_count || 0} types`}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                          {!group.is_active && (
                            <Chip
                              label="Inactive"
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </MDBox>
                      }
                      secondary={
                        <MDBox>
                          {group.description && (
                            <MDTypography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: 300 }}
                            >
                              {group.description}
                            </MDTypography>
                          )}
                          <MDTypography variant="caption" color="text.disabled">
                            Order: {group.sort_order} • ID: {group.id}
                          </MDTypography>
                        </MDBox>
                      }
                    />
                    <ListItemSecondaryAction>
                      <MDBox display="flex" gap={0.5}>
                        <IconButton
                          color="info"
                          size="small"
                          title="Edit Group"
                          onClick={() => {
                            setSuccess("");
                            setError(""); // Clear messages when switching to edit
                            setCurrentGroup({
                              id: group.id,
                              name: group.name,
                              description: group.description || "",
                              color: group.color,
                              icon: group.icon,
                              is_active: group.is_active,
                              sort_order: group.sort_order,
                            });
                            setFormMode("edit");
                          }}
                        >
                          <Icon>edit</Icon>
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          title="Delete Group"
                          onClick={() => handleDelete(group.id, group.name)}
                          disabled={(group.subscription_types_count || 0) > 0}
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </MDBox>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </MDBox>
        )}

        {(formMode === "add" || formMode === "edit") && (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Group Name"
                  value={currentGroup.name}
                  onChange={(e) => setCurrentGroup((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  variant="outlined"
                  autoFocus
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={currentGroup.sort_order}
                  onChange={(e) =>
                    setCurrentGroup((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={currentGroup.description}
                  onChange={(e) =>
                    setCurrentGroup((prev) => ({ ...prev, description: e.target.value }))
                  }
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  mb={0.5}
                  display="block"
                >
                  Group Color
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={1.5} sx={{ position: "relative" }}>
                  <Box
                    id="color-preview-box"
                    sx={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: "6px",
                      backgroundColor: currentGroup.color,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setShowColorPicker((prev) => !prev)}
                  >
                    <Icon sx={{ color: "white", fontSize: "16px", opacity: 0.7 }}>colorize</Icon>
                  </Box>
                  <TextField
                    fullWidth
                    value={currentGroup.color}
                    onClick={() => setShowColorPicker(true)}
                    onChange={(e) =>
                      setCurrentGroup((prev) => ({ ...prev, color: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />

                  {showColorPicker && (
                    <Box
                      ref={colorPickerRef}
                      sx={{ position: "absolute", zIndex: 1200, top: "calc(100% + 8px)", left: 0 }}
                    >
                      <ChromePicker
                        color={currentGroup.color}
                        onChange={(
                          color // Use onChange for live updates
                        ) => setCurrentGroup((prev) => ({ ...prev, color: color.hex }))}
                        disableAlpha
                      />
                    </Box>
                  )}
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color="text"
                  mb={0.5}
                  display="block"
                >
                  Group Icon
                </MDTypography>
                <TextField
                  select
                  fullWidth
                  label="Icon"
                  value={currentGroup.icon}
                  onChange={(e) => setCurrentGroup((prev) => ({ ...prev, icon: e.target.value }))}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    renderValue: (selectedValue) => (
                      <MDBox sx={{ display: "flex", alignItems: "center" }}>
                        {renderIconPreview(selectedValue, "inherit", { fontSize: "20px" })}
                        <MDTypography variant="body2" sx={{ ml: 1.5 }}>
                          {availableIcons.find((i) => i.value === selectedValue)?.label ||
                            selectedValue}
                        </MDTypography>
                      </MDBox>
                    ),
                  }}
                  size="small"
                  sx={{ ".MuiSelect-select .MuiBox-root": { pb: 0.1, pt: 0.1 } }} // Adjust padding for select preview
                >
                  {availableIcons.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <MDBox sx={{ display: "flex", alignItems: "center" }}>
                        {renderIconPreview(option.value, "inherit", { fontSize: "20px" })}
                        <MDTypography variant="body2" sx={{ ml: 1.5 }}>
                          {option.label}
                        </MDTypography>
                      </MDBox>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentGroup.is_active}
                      onChange={(e) =>
                        setCurrentGroup((prev) => ({ ...prev, is_active: e.target.checked }))
                      }
                      color="info"
                    />
                  }
                  labelPlacement="end"
                  label={
                    <MDTypography variant="body2" fontWeight="regular" color="text">
                      Group is Active
                    </MDTypography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ mt: formMode === "list" ? 0 : 2, mb: 0 }} />
      <DialogActions
        sx={{
          p: formMode === "list" ? 1.5 : 2.5,
          justifyContent: formMode === "list" ? "flex-end" : "space-between",
        }}
      >
        {(formMode === "add" || formMode === "edit") && (
          <MDButton
            onClick={() => {
              if (formMode === "edit" && groupData) {
                // Reset to original edit data if user cancels edit changes
                setCurrentGroup({
                  id: groupData.group_id,
                  name: groupData.group_name || "",
                  description: groupData.group_description || "",
                  color: groupData.group_color || "#3f51b5",
                  icon: groupData.group_icon || "category",
                  is_active: typeof groupData.is_active === "boolean" ? groupData.is_active : true,
                  sort_order: groupData.group_sort_order || 0,
                });
              } else {
                resetForm();
              }
              setFormMode("list");
              // fetchGroups(); // Re-fetch if changes were made then cancelled without saving.
            }}
            color="secondary"
            variant="text"
            sx={{ mr: "auto" }} // Pushes this button to the left
          >
            Back to List
          </MDButton>
        )}
        <MDButton
          onClick={handleClose}
          color="secondary"
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          {formMode === "list" ? "Close" : "Cancel"}
        </MDButton>
        {(formMode === "add" || formMode === "edit") && (
          <MDButton
            type="submit" // Important: make sure this is outside <Box component="form"> if not using form attribute
            onClick={handleSubmit} // Or link to form.submit() if type="submit" is problematic with layout
            variant="gradient"
            color="info"
            disabled={formLoading}
            startIcon={
              formLoading ? <CircularProgress size={16} color="inherit" /> : <Icon>save</Icon>
            }
          >
            {formLoading
              ? formMode === "add"
                ? "Creating..."
                : "Saving..."
              : formMode === "add"
              ? "Create Group"
              : "Save Changes"}
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default GroupManagementModal;
