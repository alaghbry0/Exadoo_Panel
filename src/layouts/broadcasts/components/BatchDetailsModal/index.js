// src/layouts/broadcasts/components/BatchDetailsModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns"; // For better date formatting

// @mui material components
import {
  Modal,
  Card,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Icon,
  IconButton,
  Chip,
  Avatar,
  ListItemAvatar,
  Paper,
  Box,
  Fade,
  Tooltip,
  LinearProgress,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// API
import { getBatchDetails, retryMessagingBatch } from "services/api";

// Helper Functions - Translation:
function getStatusInfo(status) {
  const statusMap = {
    completed: { color: "success", text: "Completed", icon: "check_circle" },
    in_progress: { color: "info", text: "In Progress", icon: "sync" },
    failed: { color: "error", text: "Failed", icon: "error" },
    pending: { color: "warning", text: "Pending", icon: "schedule" },
    cancelled: { color: "secondary", text: "Cancelled", icon: "cancel" },
  };
  return statusMap[status] || { color: "dark", text: status, icon: "help" };
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "N/A";
  return format(new Date(dateTimeString), "MMM dd, yyyy, h:mm a");
}

function translateTargetGroup(group) {
  const names = {
    all_users: "All Users",
    active_subscribers: "Active Subscribers",
    expired_subscribers: "Expired Subscribers",
    no_subscription: "No Subscription",
    subscription_type_active: "Active in Plan",
    subscription_type_expired: "Expired in Plan",
  };
  return names[group] || group;
}

function translateErrorKey(key) {
  const errorTranslations = {
    bot_blocked: "Bot blocked by user",
    chat_not_found: "User has not started a chat",
    user_deactivated: "User account is deactivated",
    rate_limit_exceeded: "Rate limit exceeded",
    unknown_error: "Unknown error",
  };
  return errorTranslations[key] || key;
}

function BatchDetailsModal({ open, onClose, batchId, setSnackbar }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!batchId) return;
      try {
        setLoading(true);
        const data = await getBatchDetails(batchId);
        setDetails(data);
      } catch (error) {
        setSnackbar({
          open: true,
          color: "error",
          title: "Error",
          message: "Failed to load job details.",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };
    if (open) fetchDetails();
    else setDetails(null);
  }, [open, batchId]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const response = await retryMessagingBatch(batchId);
      setSnackbar({
        open: true,
        color: "success",
        title: "Success",
        message: `Retry job started for failed recipients. New Batch ID: ${response.new_batch_id}`,
      });
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "An error occurred while retrying.";
      setSnackbar({ open: true, color: "error", title: "Failed", message: errorMsg });
    } finally {
      setRetrying(false);
    }
  };

  const retryableErrorsExist = details?.error_details?.some((e) => e.is_retryable) || false;
  const statusInfo = details ? getStatusInfo(details.status) : null;
  const progressPercentage =
    details?.total_users > 0
      ? ((details.successful_sends + details.failed_sends) / details.total_users) * 100
      : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <Fade in={open} timeout={300}>
        <Card sx={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}>
          <MDBox p={3} position="relative">
            <IconButton onClick={onClose} sx={{ position: "absolute", top: 12, right: 12 }}>
              <Icon>close</Icon>
            </IconButton>

            {loading && (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
              </MDBox>
            )}

            {!loading && details && (
              <Box>
                {/* Header */}
                <MDBox mb={3}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ fontSize: 32, color: "info.main", mr: 2 }}>dvr</Icon>
                    <MDBox>
                      <MDTypography variant="h4" fontWeight="bold">
                        Job Details
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        ID: {details.batch_id}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBadge
                    badgeContent={
                      <>
                        <Icon sx={{ fontSize: 14, mr: 0.5 }}>{statusInfo.icon}</Icon>
                        {statusInfo.text}
                      </>
                    }
                    color={statusInfo.color}
                    variant="gradient"
                    size="lg"
                  />
                </MDBox>
                <Divider sx={{ mb: 3 }} />

                {/* Grid Layout */}
                <Grid container spacing={3}>
                  {/* Info Panel */}
                  <Grid item xs={12} md={5}>
                    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                      <MDTypography variant="h6">Job Information</MDTypography>
                      <List dense>
                        <ListItem disableGutters>
                          <ListItemText
                            primary="Audience:"
                            secondary={translateTargetGroup(details.target_group)}
                          />
                        </ListItem>
                        <ListItem disableGutters>
                          <ListItemText
                            primary="Created At:"
                            secondary={formatDateTime(details.created_at)}
                          />
                        </ListItem>
                        <ListItem disableGutters>
                          <ListItemText
                            primary="Started At:"
                            secondary={formatDateTime(details.started_at)}
                          />
                        </ListItem>
                        <ListItem disableGutters>
                          <ListItemText
                            primary="Completed At:"
                            secondary={formatDateTime(details.completed_at)}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  {/* Stats Panel */}
                  <Grid item xs={12} md={7}>
                    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                      <MDTypography variant="h6" mb={2}>
                        Sending Statistics
                      </MDTypography>
                      <Grid container spacing={1}>
                        <Grid item xs={4} textAlign="center">
                          <MDTypography variant="h4" color="success">
                            {details.successful_sends}
                          </MDTypography>
                          <MDTypography variant="caption">Successful</MDTypography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                          <MDTypography variant="h4" color="error">
                            {details.failed_sends}
                          </MDTypography>
                          <MDTypography variant="caption">Failed</MDTypography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                          <MDTypography variant="h4" color="text">
                            {details.total_users}
                          </MDTypography>
                          <MDTypography variant="caption">Total</MDTypography>
                        </Grid>
                      </Grid>
                      <MDBox mt={2}>
                        <Tooltip title={`${progressPercentage.toFixed(1)}% Complete`}>
                          <Box>
                            <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                              <MDTypography variant="caption">Progress</MDTypography>
                              <MDTypography variant="caption">{`${
                                details.successful_sends + details.failed_sends
                              } / ${details.total_users}`}</MDTypography>
                            </MDBox>
                            <LinearProgress
                              variant="determinate"
                              value={progressPercentage}
                              color={statusInfo.color}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </Tooltip>
                      </MDBox>
                    </Paper>
                  </Grid>

                  {/* Message Content Panel */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <MDTypography variant="h6" mb={1}>
                        Message Content
                      </MDTypography>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          maxHeight: 180,
                          overflow: "auto",
                          bgcolor: "grey.100",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {details.message_content?.text || "No content available."}
                      </Card>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Error Details Panel */}
                {details.failed_sends > 0 && (
                  <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6">
                        Error Details ({details.failed_sends})
                      </MDTypography>
                      {retryableErrorsExist && (
                        <Tooltip title="Create a new broadcast for users who failed with a temporary error.">
                          <MDButton
                            variant="gradient"
                            color="info"
                            size="small"
                            onClick={handleRetry}
                            disabled={retrying}
                          >
                            {retrying ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <>
                                <Icon>replay</Icon> Retry Failed
                              </>
                            )}
                          </MDButton>
                        </Tooltip>
                      )}
                    </MDBox>
                    {details.error_summary && Object.keys(details.error_summary).length > 0 && (
                      <MDBox mb={2}>
                        <MDTypography variant="subtitle2" mb={1}>
                          Failure Reason Summary:
                        </MDTypography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {Object.entries(details.error_summary).map(([key, value]) => (
                            <Tooltip key={key} title={`Code: ${key}`}>
                              <Chip
                                label={`${translateErrorKey(key)}: ${value}`}
                                variant="outlined"
                                color="error"
                                size="small"
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </MDBox>
                    )}
                    <Card variant="outlined" sx={{ maxHeight: "250px", overflowY: "auto" }}>
                      <List dense>
                        {details.error_details.map((error, index) => (
                          <ListItem key={index} divider>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: error.is_retryable ? "warning.light" : "error.light",
                                }}
                              >
                                <Icon color={error.is_retryable ? "warning" : "error"}>
                                  {error.is_retryable ? "autorenew" : "error"}
                                </Icon>
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={error.full_name || `@${error.username}` || error.telegram_id}
                              secondary={error.error_message}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </Paper>
                )}
              </Box>
            )}
          </MDBox>
        </Card>
      </Fade>
    </Modal>
  );
}

BatchDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  batchId: PropTypes.string,
  setSnackbar: PropTypes.func.isRequired,
};

export default BatchDetailsModal;
