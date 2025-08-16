// src/layouts/broadcasts/components/BroadcastComposer/index.js

// New: Import useRef to handle the textarea element directly
import { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Icon,
  Avatar,
  ListItemAvatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Paper,
  Tooltip,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API
import { previewTargetUsers, startBroadcast } from "services/api";

// All text is now in English
const steps = ["Select Audience", "Compose Message", "Preview & Send"];

function BroadcastComposer({ data, onBroadcastSent, setSnackbar }) {
  const [message, setMessage] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // New: Create a ref to hold a reference to the message input element.
  // This is the standard React way to interact with DOM elements.
  const messageInputRef = useRef(null);

  const targetNeedsSubType = useMemo(
    () => ["subscription_type_active", "subscription_type_expired"].includes(selectedTarget),
    [selectedTarget]
  );

  useEffect(() => {
    setSelectedSubType("");
    setPreview(null);
    if (selectedTarget) {
      setActiveStep(1);
    }
  }, [selectedTarget]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!selectedTarget || (targetNeedsSubType && !selectedSubType)) {
        setPreview(null);
        return;
      }
      try {
        setPreviewLoading(true);
        const previewData = await previewTargetUsers(
          selectedTarget,
          targetNeedsSubType ? selectedSubType : null
        );
        setPreview(previewData);
        if (message.trim()) {
          setActiveStep(2);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          color: "error",
          title: "Error",
          message: "Failed to load user preview.",
        });
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [selectedTarget, selectedSubType]);

  useEffect(() => {
    if (message.trim() && preview) {
      setActiveStep(2);
    } else if (selectedTarget) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [message, preview, selectedTarget]);

  const handleSendBroadcast = async () => {
    if (!message.trim() || !selectedTarget || (targetNeedsSubType && !selectedSubType)) {
      setSnackbar({
        open: true,
        color: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields to send the broadcast.",
      });
      return;
    }

    setIsSending(true);
    try {
      await startBroadcast(message, selectedTarget, targetNeedsSubType ? selectedSubType : null);
      onBroadcastSent();
      setMessage("");
      setSelectedTarget("");
      setSelectedSubType("");
      setPreview(null);
      setActiveStep(0);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "An unexpected error occurred while sending.";
      setSnackbar({ open: true, color: "error", title: "Send Failed", message: errorMsg });
    } finally {
      setIsSending(false);
    }
  };

  // Improved: The function now uses the ref for stability and performance.
  const insertVariable = (variable) => {
    const textarea = messageInputRef.current; // Get the textarea from the ref
    if (textarea) {
      const start = textarea.selectionStart; // Get cursor start position
      const end = textarea.selectionEnd; // Get cursor end position
      const text = `${variable}`;

      // Construct the new message with the variable inserted
      const newMessage = message.substring(0, start) + text + message.substring(end);
      setMessage(newMessage);

      // This part ensures the cursor is placed right after the inserted variable,
      // allowing the user to continue typing smoothly.
      setTimeout(() => {
        textarea.focus();
        const newCursorPosition = start + text.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 10);
    }
  };

  const getTargetDisplayName = () => {
    if (!selectedTarget) return "";
    const targetNames = {
      all_users: `All Users (${data.targetGroups?.general_stats.all_users})`,
      active_subscribers: `Active Subscribers (${data.targetGroups?.general_stats.active_subscribers})`,
      expired_subscribers: `Expired Subscribers (${data.targetGroups?.general_stats.expired_subscribers})`,
      no_subscription: `No Subscription (${data.targetGroups?.general_stats.no_subscription})`,
      subscription_type_active: "Active in a specific plan",
      subscription_type_expired: "Expired in a specific plan",
    };
    return targetNames[selectedTarget] || selectedTarget;
  };

  const renderLivePreview = () => {
    if (!preview || !preview.users || preview.users.length === 0) {
      return "Your message will appear here...";
    }
    let previewText = message;
    const firstUser = preview.users[0];
    previewText = previewText.replace(/{full_name}/g, firstUser.full_name || "John Doe");
    previewText = previewText.replace(/{username}/g, firstUser.username || "johndoe");
    return previewText;
  };

  return (
    <Card elevation={4} sx={{ overflow: "visible" }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={3}>
          <Icon sx={{ fontSize: 32, color: "info.main", mr: 2 }}>campaign</Icon>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              Create New Broadcast
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Follow the steps to compose and send an effective broadcast message.
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Progress Stepper */}
        <MDBox mb={4}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": { color: "info.main" },
                      "&.Mui-completed": { color: "success.main" },
                    },
                  }}
                >
                  <MDTypography variant="caption" color={index <= activeStep ? "dark" : "text"}>
                    {label}
                  </MDTypography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </MDBox>

        <Grid container spacing={3}>
          {/* Step 1: Target Selection */}
          <Grid item xs={12}>
            <Fade in timeout={500}>
              <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee" }}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon color="primary">people</Icon>
                  <MDTypography variant="h6" ml={1}>
                    Step 1: Choose Your Audience
                  </MDTypography>
                </MDBox>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={targetNeedsSubType ? 6 : 12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Target Audience</InputLabel>
                      <Select
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        label="Select Target Audience"
                      >
                        <MenuItem value="all_users">
                          All Users ({data.targetGroups?.general_stats.all_users})
                        </MenuItem>
                        <MenuItem value="active_subscribers">
                          Active Subscribers ({data.targetGroups?.general_stats.active_subscribers})
                        </MenuItem>
                        <MenuItem value="expired_subscribers">
                          Expired Subscribers (
                          {data.targetGroups?.general_stats.expired_subscribers})
                        </MenuItem>
                        <MenuItem value="no_subscription">
                          No Subscription ({data.targetGroups?.general_stats.no_subscription})
                        </MenuItem>
                        <Divider />
                        <MenuItem value="subscription_type_active">
                          Active in a specific plan
                        </MenuItem>
                        <MenuItem value="subscription_type_expired">
                          Expired in a specific plan
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {targetNeedsSubType && (
                    <Grid item xs={12} md={6}>
                      <Fade in timeout={300}>
                        <FormControl fullWidth>
                          <InputLabel>Select Subscription Plan</InputLabel>
                          <Select
                            value={selectedSubType}
                            onChange={(e) => setSelectedSubType(e.target.value)}
                            label="Select Subscription Plan"
                          >
                            {data.targetGroups?.subscription_types.map((sub) => (
                              <MenuItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Fade>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Fade>
          </Grid>

          {/* Step 2: Message Composition */}
          {activeStep >= 1 && (
            <Grid item xs={12}>
              <Fade in timeout={700}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee" }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon color="primary">edit</Icon>
                    <MDTypography variant="h6" ml={1}>
                      Step 2: Compose Your Message
                    </MDTypography>
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <MDInput
                        label="Message"
                        multiline
                        rows={8}
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        // New: Attach the ref to the MDInput component.
                        // It passes the ref to the underlying textarea.
                        inputRef={messageInputRef}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <MDBox>
                        <MDTypography variant="subtitle2" mb={1} fontWeight="bold">
                          Available Variables
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Click to insert a variable:
                        </MDTypography>
                        <MDBox mb={2}>
                          <MDTypography variant="caption" color="text">
                            User Variables:
                          </MDTypography>
                          <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {data.variables?.user_variables.map((v) => (
                              <Tooltip key={v.key} title={v.description}>
                                <Chip
                                  label={v.key}
                                  size="small"
                                  // The onClick now triggers our improved function
                                  onClick={() => insertVariable(v.key)}
                                  sx={{ cursor: "pointer" }}
                                />
                              </Tooltip>
                            ))}
                          </MDBox>
                        </MDBox>
                        <MDBox>
                          <MDTypography variant="caption" color="text">
                            Subscription Variables:
                          </MDTypography>
                          <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {data.variables?.subscription_variables.map((v) => (
                              <Tooltip key={v.key} title={v.description}>
                                <Chip
                                  label={v.key}
                                  size="small"
                                  onClick={() => insertVariable(v.key)}
                                  sx={{ cursor: "pointer" }}
                                />
                              </Tooltip>
                            ))}
                          </MDBox>
                        </MDBox>
                        <MDBox mt={3}>
                          <MDTypography variant="subtitle2" mb={1} fontWeight="bold">
                            Live Preview
                          </MDTypography>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: "grey.100",
                              minHeight: 100,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <MDTypography variant="body2" color="textSecondary">
                              {renderLivePreview()}
                            </MDTypography>
                          </Card>
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          )}

          {/* Step 3: Preview and Send */}
          {activeStep >= 2 && preview && (
            <Grid item xs={12}>
              <Fade in timeout={900}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee" }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon color="primary">preview</Icon>
                    <MDTypography variant="h6" ml={1}>
                      Step 3: Preview & Send
                    </MDTypography>
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                        <MDTypography variant="h6">Audience Preview</MDTypography>
                        {previewLoading ? (
                          <MDBox display="flex" justifyContent="center" p={2}>
                            <CircularProgress size={30} />
                          </MDBox>
                        ) : (
                          <MDBox>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <MDTypography variant="body2">
                                <strong>Target Audience:</strong> {getTargetDisplayName()}
                              </MDTypography>
                              <MDTypography variant="body2">
                                <strong>Total Recipients:</strong> {preview.total_count} users
                              </MDTypography>
                              <MDTypography variant="caption">
                                (Showing a sample of {preview.showing_count} users)
                              </MDTypography>
                            </Alert>
                            <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                              {preview.users.map((u) => (
                                <ListItem key={u.telegram_id}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {(u.full_name || "U")[0]}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={u.full_name || "Unknown User"}
                                    secondary={`@${u.username}` || u.telegram_id}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </MDBox>
                        )}
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <MDTypography variant="h6">Final Confirmation</MDTypography>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          The message will be sent to <strong>{preview.total_count}</strong> users.
                          Please review the content before sending.
                        </Alert>
                        <MDButton
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="large"
                          onClick={handleSendBroadcast}
                          disabled={isSending || !preview?.total_count || !message.trim()}
                        >
                          {isSending ? (
                            <>
                              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Icon sx={{ mr: 1 }}>send</Icon>
                              Send Broadcast Now ({preview.total_count} recipients)
                            </>
                          )}
                        </MDButton>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </Card>
  );
}

BroadcastComposer.propTypes = {
  data: PropTypes.object,
  onBroadcastSent: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};

export default BroadcastComposer;
