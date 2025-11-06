// src/layouts/broadcasts/components/BroadcastComposer/index.js
import { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
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

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import { previewTargetUsers, startBroadcast, getSubscriptionPlans } from "services/api";

const steps = ["Select Audience", "Compose Message", "Preview & Send"];

function BroadcastComposer({ data, onBroadcastSent, setSnackbar }) {
  const [message, setMessage] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");

  // Subscription type + single plan (optional)
  const [selectedSubscriptionTypeId, setSelectedSubscriptionTypeId] = useState("");
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(""); // "" تعني بدون فلترة

  // preview & sending
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const messageInputRef = useRef(null);

  // Safe getters
  const subscriptionTypes = data?.targetGroups?.subscription_types ?? [];
  const stats = data?.targetGroups?.general_stats ?? {
    all_users: 0,
    active_subscribers: 0,
    expired_subscribers: 0,
    no_subscription: 0,
  };

  const notify = (opts) => (typeof setSnackbar === "function" ? setSnackbar(opts) : null);

  const targetNeedsType = useMemo(
    () => ["subscription_type_active", "subscription_type_expired"].includes(selectedTarget),
    [selectedTarget]
  );

  // reset on target change
  useEffect(() => {
    setSelectedSubscriptionTypeId("");
    setAvailablePlans([]);
    setSelectedPlanId("");
    setPreview(null);
    setActiveStep(selectedTarget ? 1 : 0);
  }, [selectedTarget]);

  // fetch plans when subscription type chosen
  useEffect(() => {
    const fetchPlans = async () => {
      if (!targetNeedsType || !selectedSubscriptionTypeId) {
        setAvailablePlans([]);
        setSelectedPlanId("");
        return;
      }
      try {
        setLoadingPlans(true);
        const plansArr = await getSubscriptionPlans(Number(selectedSubscriptionTypeId));
        setAvailablePlans(Array.isArray(plansArr) ? plansArr : []);
        // لو تغيّر النوع، نظّف اختيار الخطة السابقة
        setSelectedPlanId("");
      } catch (error) {
        console.error("getSubscriptionPlans failed:", error?.response?.data || error);
        notify({ color: "error", title: "Error", message: "Failed to load subscription plans." });
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetNeedsType, selectedSubscriptionTypeId]);

  // when can we preview?
  const canPreview = useMemo(() => {
    if (!selectedTarget) return false;
    if (!targetNeedsType) return true; // مجموعات عامة
    return !!selectedSubscriptionTypeId; // النوع مطلوب؛ الخطة اختيارية
  }, [selectedTarget, targetNeedsType, selectedSubscriptionTypeId]);

  // build preview when inputs ready
  useEffect(() => {
    const runPreview = async () => {
      if (!canPreview) {
        setPreview(null);
        return;
      }
      try {
        setPreviewLoading(true);
        const options = {
          targetGroup: selectedTarget,
          subscriptionTypeId: targetNeedsType ? Number(selectedSubscriptionTypeId) : null,
          // نحول الخطة الواحدة إلى مصفوفة عند الإرسال
          subscriptionPlanIds: targetNeedsType && selectedPlanId ? [Number(selectedPlanId)] : [],
          limit: 10,
        };
        const previewData = await previewTargetUsers(options);
        setPreview(previewData);
        if (message.trim()) setActiveStep(2);
      } catch (error) {
        console.error("previewTargetUsers failed:", error?.response?.data || error);
        notify({ color: "error", title: "Error", message: "Failed to load user preview." });
      } finally {
        setPreviewLoading(false);
      }
    };
    runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget, selectedSubscriptionTypeId, selectedPlanId]);

  // stepper logic
  useEffect(() => {
    if (message.trim() && preview) setActiveStep(2);
    else if (selectedTarget) setActiveStep(1);
    else setActiveStep(0);
  }, [message, preview, selectedTarget]);

  const insertVariable = (variable) => {
    const textarea = messageInputRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = `${variable}`;
      const newMessage = message.substring(0, start) + text + message.substring(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.focus();
        const pos = start + text.length;
        textarea.setSelectionRange(pos, pos);
      }, 10);
    }
  };

  const handleSendBroadcast = async () => {
    if (!message.trim() || !selectedTarget || (targetNeedsType && !selectedSubscriptionTypeId)) {
      notify({
        color: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields to send the broadcast.",
      });
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        messageText: message,
        targetGroup: selectedTarget,
        subscriptionTypeId: targetNeedsType ? Number(selectedSubscriptionTypeId) : null,
        subscriptionPlanIds: targetNeedsType && selectedPlanId ? [Number(selectedPlanId)] : [],
      };
      await startBroadcast(payload);
      onBroadcastSent();
      // reset
      setMessage("");
      setSelectedTarget("");
      setSelectedSubscriptionTypeId("");
      setAvailablePlans([]);
      setSelectedPlanId("");
      setPreview(null);
      setActiveStep(0);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error || "An unexpected error occurred while sending.";
      notify({ color: "error", title: "Send Failed", message: errorMsg });
    } finally {
      setIsSending(false);
    }
  };

  const getTargetDisplayName = () => {
    if (!selectedTarget) return "";
    const names = {
      all_users: `All Users (${stats?.all_users ?? 0})`,
      active_subscribers: `Active Subscribers (${stats?.active_subscribers ?? 0})`,
      expired_subscribers: `Expired Subscribers (${stats?.expired_subscribers ?? 0})`,
      no_subscription: `No Subscription (${stats?.no_subscription ?? 0})`,
      subscription_type_active: "Active – by Subscription Type/Plan",
      subscription_type_expired: "Expired – by Subscription Type/Plan",
    };
    return names[selectedTarget] || selectedTarget;
  };

  const renderLivePreview = () => {
    if (!preview?.users?.length) return "Your message will appear here...";
    const firstUser = preview.users[0];
    return (message || "")
      .replace(/{full_name}/g, firstUser.full_name || "John Doe")
      .replace(/{username}/g, firstUser.username || "johndoe");
  };

  return (
    <Card elevation={0} sx={{ overflow: "visible" }}>
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

        {/* Stepper */}
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
          {/* Step 1: Audience */}
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
                  <Grid item xs={12} md={targetNeedsType ? 4 : 12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Target Audience</InputLabel>
                      <Select
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        label="Select Target Audience"
                      >
                        <MenuItem value="all_users">All Users ({stats?.all_users ?? 0})</MenuItem>
                        <MenuItem value="active_subscribers">
                          Active Subscribers ({stats?.active_subscribers ?? 0})
                        </MenuItem>
                        <MenuItem value="expired_subscribers">
                          Expired Subscribers ({stats?.expired_subscribers ?? 0})
                        </MenuItem>
                        <MenuItem value="no_subscription">
                          No Subscription ({stats?.no_subscription ?? 0})
                        </MenuItem>
                        <Divider />
                        <MenuItem value="subscription_type_active">
                          Active – by Subscription Type/Plan
                        </MenuItem>
                        <MenuItem value="subscription_type_expired">
                          Expired – by Subscription Type/Plan
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {targetNeedsType && (
                    <>
                      {/* Subscription Type */}
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Select Subscription Type</InputLabel>
                          <Select
                            value={selectedSubscriptionTypeId}
                            onChange={(e) => setSelectedSubscriptionTypeId(e.target.value)}
                            label="Select Subscription Type"
                          >
                            {(subscriptionTypes || []).map((st) => (
                              <MenuItem key={st.id} value={st.id}>
                                {st.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Plan (single optional) */}
                      <Grid item xs={12} md={4}>
                        <FormControl
                          fullWidth
                          disabled={!selectedSubscriptionTypeId || loadingPlans}
                        >
                          <InputLabel>Select Plan (optional)</InputLabel>
                          <Select
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            label="Select Plan (optional)"
                          >
                            {/* خيار عدم التحديد = أي خطة */}
                            <MenuItem value="">
                              <em>Any plan</em>
                            </MenuItem>

                            {loadingPlans && <MenuItem disabled>Loading...</MenuItem>}

                            {!loadingPlans && !(availablePlans || []).length && (
                              <MenuItem disabled>No plans found</MenuItem>
                            )}

                            {(availablePlans || []).map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.name} — {p.duration_days}d {p.is_trial ? "• Trial" : ""}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Fade>
          </Grid>

          {/* Step 2: Compose */}
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
                            {(data?.variables?.user_variables || []).map((v) =>
                              v?.key ? (
                                <Tooltip key={v.key} title={v.description || ""}>
                                  <Chip
                                    label={v.key}
                                    size="small"
                                    onClick={() => insertVariable(v.key)}
                                    sx={{ cursor: "pointer" }}
                                  />
                                </Tooltip>
                              ) : null
                            )}
                          </MDBox>
                        </MDBox>

                        <MDBox>
                          <MDTypography variant="caption" color="text">
                            Subscription Variables:
                          </MDTypography>
                          <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {(data?.variables?.subscription_variables || []).map((v) =>
                              v?.key ? (
                                <Tooltip key={v.key} title={v.description || ""}>
                                  <Chip
                                    label={v.key}
                                    size="small"
                                    onClick={() => insertVariable(v.key)}
                                    sx={{ cursor: "pointer" }}
                                  />
                                </Tooltip>
                              ) : null
                            )}
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

          {/* Step 3: Preview & Send */}
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
                              {targetNeedsType && selectedSubscriptionTypeId && (
                                <MDTypography variant="body2">
                                  <strong>Subscription Type:</strong>{" "}
                                  {(subscriptionTypes || []).find(
                                    (t) => String(t.id) === String(selectedSubscriptionTypeId)
                                  )?.name || selectedSubscriptionTypeId}
                                </MDTypography>
                              )}
                              {targetNeedsType && (
                                <MDTypography variant="body2">
                                  <strong>Plan Filter:</strong>{" "}
                                  {selectedPlanId
                                    ? availablePlans.find(
                                        (p) => String(p.id) === String(selectedPlanId)
                                      )?.name || selectedPlanId
                                    : "Any plan"}
                                </MDTypography>
                              )}
                              <MDTypography variant="body2">
                                <strong>Total Recipients:</strong> {preview.total_count} users
                              </MDTypography>
                              <MDTypography variant="caption">
                                (Showing a sample of {preview.showing_count} users)
                              </MDTypography>
                            </Alert>
                            <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                              {(preview.users || []).map((u) => (
                                <ListItem key={u.telegram_id}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {(u.full_name || "U")[0]}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={u.full_name || "Unknown User"}
                                    secondary={u.username ? `@${u.username}` : u.telegram_id}
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
  setSnackbar: PropTypes.func, // ({color,title,message}) => void
};

export default BroadcastComposer;
