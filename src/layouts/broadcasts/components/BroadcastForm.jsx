// src/layouts/broadcasts/components/BroadcastForm.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import { useSnackbar } from "notistack";

// Components & API
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import AvailableVariables from "./AvailableVariables";
import { getTargetGroupsStats, startBroadcast, previewTargetUsers } from "services/api";

function BroadcastForm() {
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [subscriptionTypeId, setSubscriptionTypeId] = useState("");

  // Data state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // UI State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState({ open: false, users: [], total: 0, loading: false });
  const [error, setError] = useState("");

  const selectedSub = stats?.subscription_types.find((s) => s.id === subscriptionTypeId);

  const getTargetCount = () => {
    if (!stats) return 0;
    if (targetGroup === "all_users") return stats.general_stats.all_users;
    if (targetGroup === "no_subscription") return stats.general_stats.no_subscription;
    if (targetGroup === "active_subscribers") return stats.general_stats.active_subscribers;
    if (targetGroup === "expired_subscribers") return stats.general_stats.expired_subscribers;
    if (targetGroup === "subscription_type_active" && selectedSub) return selectedSub.active_count;
    if (targetGroup === "subscription_type_expired" && selectedSub)
      return selectedSub.expired_count;
    return 0;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await getTargetGroupsStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        enqueueSnackbar("Failed to load target group statistics.", { variant: "error" });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [enqueueSnackbar]);

  const handlePreview = async () => {
    const payload = { target_group: targetGroup, subscription_type_id: subscriptionTypeId };
    setPreview({ ...preview, open: true, loading: true });
    try {
      const data = await previewTargetUsers(payload);
      setPreview({ open: true, loading: false, users: data.users, total: data.total_count });
    } catch (err) {
      console.error("Error fetching preview:", err);
      enqueueSnackbar("Failed to fetch preview.", { variant: "error" });
      setPreview({ open: false, loading: false, users: [], total: 0 });
    }
  };

  const handleConfirmSend = () => {
    if (
      !message.trim() ||
      !targetGroup ||
      (targetGroup.startsWith("subscription_type_") && !subscriptionTypeId)
    ) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    setConfirmOpen(true);
  };

  const handleSendBroadcast = async () => {
    setConfirmOpen(false);
    setLoading(true);
    const payload = {
      message_text: message,
      target_group: targetGroup,
      subscription_type_id: subscriptionTypeId,
    };

    try {
      const response = await startBroadcast(payload);
      enqueueSnackbar(response.message || "Broadcast started successfully!", {
        variant: "success",
      });
      setMessage("");
      setTargetGroup("");
      setSubscriptionTypeId("");
    } catch (err) {
      console.error("Error starting broadcast:", err);
      const errorMsg = err.response?.data?.error || "An unknown error occurred.";
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isTypeRequired = targetGroup.startsWith("subscription_type_");
  const targetUserCount = getTargetCount();

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5">Create New Broadcast</MDTypography>
        <Grid container spacing={3} mt={1}>
          {/* Message Area */}
          <Grid item xs={12} md={7}>
            <MDInput
              label="Broadcast Message"
              multiline
              rows={10}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText="Use available variables for personalization. Supports basic HTML."
            />
            <AvailableVariables />
          </Grid>

          {/* Targeting Area */}
          <Grid item xs={12} md={5}>
            <MDTypography variant="h6">Targeting</MDTypography>
            {loadingStats ? (
              <Box display="flex" alignItems="center" mt={2}>
                <CircularProgress size={20} />
                <MDTypography variant="body2" ml={1}>
                  Loading statistics...
                </MDTypography>
              </Box>
            ) : (
              <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                <RadioGroup
                  value={targetGroup}
                  onChange={(e) => {
                    setTargetGroup(e.target.value);
                    setSubscriptionTypeId("");
                  }}
                >
                  {stats &&
                    Object.entries({
                      "All Users": "all_users",
                      "Active Subscribers (All)": "active_subscribers",
                      "Users with No Subscription": "no_subscription",
                      "Expired Subscribers (All)": "expired_subscribers",
                    }).map(([label, value]) => (
                      <FormControlLabel
                        key={value}
                        value={value}
                        control={<Radio />}
                        label={`${label} (${stats.general_stats[value] || 0})`}
                      />
                    ))}
                  <FormControlLabel
                    value="subscription_type_active"
                    control={<Radio />}
                    label="Specific Plan - Active"
                  />
                  <FormControlLabel
                    value="subscription_type_expired"
                    control={<Radio />}
                    label="Specific Plan - Expired"
                  />
                </RadioGroup>
              </FormControl>
            )}

            <Collapse in={isTypeRequired}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Plan</InputLabel>
                <Select
                  value={subscriptionTypeId}
                  label="Select Plan"
                  onChange={(e) => setSubscriptionTypeId(e.target.value)}
                >
                  {stats?.subscription_types?.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} (
                      {targetGroup === "subscription_type_active"
                        ? type.active_count
                        : type.expired_count}
                      )
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Collapse>

            <Alert severity="info" sx={{ mt: 3 }}>
              Estimated recipients: <strong>{targetUserCount}</strong>
            </Alert>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>

        {/* Actions */}
        <MDBox mt={4} display="flex" justifyContent="space-between">
          <MDButton
            variant="outlined"
            color="secondary"
            onClick={handlePreview}
            disabled={!targetGroup || (isTypeRequired && !subscriptionTypeId)}
          >
            Preview Audience
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={handleConfirmSend} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Broadcast"}
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Confirm Broadcast
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <MDTypography variant="body1" mb={2}>
              You are about to send a broadcast message to <strong>{targetUserCount}</strong> users.
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={2}>
              <strong>Target Group:</strong> {targetGroup}
            </MDTypography>
            {selectedSub && (
              <MDTypography variant="body2" color="text" mb={2}>
                <strong>Subscription Plan:</strong> {selectedSub.name}
              </MDTypography>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. Please make sure your message is correct.
            </Alert>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setConfirmOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSendBroadcast} color="error" variant="gradient">
            Send Broadcast
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={preview.open}
        onClose={() => setPreview({ ...preview, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audience Preview</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="textSecondary" mb={2}>
            Showing up to 10 users out of <strong>{preview.total}</strong> total recipients.
          </MDTypography>
          {preview.loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List dense>
              {preview.users?.length > 0 ? (
                preview.users.map((user) => (
                  <ListItem key={user.telegram_id}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={user.full_name || `@${user.username}` || "Unknown User"}
                      secondary={`ID: ${user.telegram_id}`}
                    />
                  </ListItem>
                ))
              ) : (
                <MDTypography variant="body2" color="text" textAlign="center" p={2}>
                  No users found for the selected criteria.
                </MDTypography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setPreview({ ...preview, open: false })}>Close</MDButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default BroadcastForm;
