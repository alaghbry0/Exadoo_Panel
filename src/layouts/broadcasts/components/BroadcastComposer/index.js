// src/layouts/broadcasts/components/BroadcastComposer/index.js

import { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Icon,
  Avatar,
  ListItemAvatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Zoom,
  Paper,
  Tooltip,
  Box,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API
import { previewTargetUsers, startBroadcast } from "services/api";

const steps = ["اختيار الجمهور", "كتابة الرسالة", "المعاينة والإرسال"];

function BroadcastComposer({ loading, data, onBroadcastSent, setSnackbar }) {
  const [message, setMessage] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [messagePreview, setMessagePreview] = useState("");

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
          title: "خطأ",
          message: "فشل في تحميل معاينة المستخدمين.",
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
        title: "بيانات ناقصة",
        message: "يرجى ملء جميع الحقول المطلوبة.",
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
      const errorMsg = error.response?.data?.error || "حدث خطأ غير متوقع أثناء الإرسال.";
      setSnackbar({ open: true, color: "error", title: "فشل الإرسال", message: errorMsg });
    } finally {
      setIsSending(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector(
      'textarea[aria-label="نص الرسالة (يدعم HTML والمتغيرات)"]'
    );
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + `{${variable}}` + message.substring(end);
      setMessage(newMessage);

      // Focus back and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 10);
    }
  };

  const getTargetDisplayName = () => {
    if (!selectedTarget) return "";

    const targetNames = {
      all_users: `جميع المستخدمين (${data.targetGroups?.general_stats.all_users})`,
      active_subscribers: `المشتركون النشطون (${data.targetGroups?.general_stats.active_subscribers})`,
      expired_subscribers: `المشتركون المنتهون (${data.targetGroups?.general_stats.expired_subscribers})`,
      no_subscription: `بدون اشتراك (${data.targetGroups?.general_stats.no_subscription})`,
      subscription_type_active: "المشتركون النشطون في نوع معين",
      subscription_type_expired: "المشتركون المنتهون في نوع معين",
    };

    return targetNames[selectedTarget] || selectedTarget;
  };

  return (
    <Card elevation={4} sx={{ overflow: "visible" }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={3}>
          <Icon sx={{ fontSize: 32, color: "info.main", mr: 2 }}>campaign</Icon>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              إنشاء رسالة جديدة
            </MDTypography>
            <MDTypography variant="body2" color="text">
              تابع الخطوات لإنشاء وإرسال رسالة بث فعالة
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
                    style: {
                      color: index <= activeStep ? "#1976d2" : "#ccc",
                    },
                  }}
                >
                  <MDTypography variant="caption" color={index <= activeStep ? "info" : "text"}>
                    {label}
                  </MDTypography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" my={5}>
            <CircularProgress size={60} />
          </MDBox>
        ) : (
          <Grid container spacing={3}>
            {/* Target Selection */}
            <Grid item xs={12}>
              <Fade in timeout={500}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: "grey.50" }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon color="primary">people</Icon>
                    <MDTypography variant="h6" ml={1}>
                      الخطوة 1: اختيار الجمهور المستهدف
                    </MDTypography>
                  </MDBox>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>اختر الجمهور المستهدف</InputLabel>
                        <Select
                          value={selectedTarget}
                          onChange={(e) => setSelectedTarget(e.target.value)}
                          label="اختر الجمهور المستهدف"
                          sx={{ height: "50px" }}
                        >
                          <MenuItem value="all_users">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1 }}>group</Icon>
                              جميع المستخدمين ({data.targetGroups?.general_stats.all_users})
                            </MDBox>
                          </MenuItem>
                          <MenuItem value="active_subscribers">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: "success.main" }}>verified</Icon>
                              المشتركون النشطون (
                              {data.targetGroups?.general_stats.active_subscribers})
                            </MDBox>
                          </MenuItem>
                          <MenuItem value="expired_subscribers">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: "warning.main" }}>schedule</Icon>
                              المشتركون المنتهون (
                              {data.targetGroups?.general_stats.expired_subscribers})
                            </MDBox>
                          </MenuItem>
                          <MenuItem value="no_subscription">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>person_outline</Icon>
                              بدون اشتراك ({data.targetGroups?.general_stats.no_subscription})
                            </MDBox>
                          </MenuItem>
                          <Divider />
                          <MenuItem value="subscription_type_active">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: "info.main" }}>star</Icon>
                              المشتركون النشطون في نوع معين
                            </MDBox>
                          </MenuItem>
                          <MenuItem value="subscription_type_expired">
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: "error.main" }}>star_border</Icon>
                              المشتركون المنتهون في نوع معين
                            </MDBox>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {targetNeedsSubType && (
                      <Grid item xs={12}>
                        <Zoom in timeout={300}>
                          <FormControl fullWidth>
                            <InputLabel>اختر نوع الاشتراك</InputLabel>
                            <Select
                              value={selectedSubType}
                              onChange={(e) => setSelectedSubType(e.target.value)}
                              label="اختر نوع الاشتراك"
                              sx={{ height: "50px" }}
                            >
                              {data.targetGroups?.subscription_types.map((sub) => (
                                <MenuItem key={sub.id} value={sub.id}>
                                  <MDBox display="flex" alignItems="center">
                                    <Icon sx={{ mr: 1 }}>label</Icon>
                                    {sub.name}
                                  </MDBox>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Zoom>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Fade>
            </Grid>

            {/* Message Composition */}
            {selectedTarget && (
              <Grid item xs={12}>
                <Fade in timeout={700}>
                  <Paper elevation={2} sx={{ p: 3, bgcolor: "grey.50" }}>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Icon color="primary">edit</Icon>
                      <MDTypography variant="h6" ml={1}>
                        الخطوة 2: كتابة الرسالة
                      </MDTypography>
                    </MDBox>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <MDInput
                          label="نص الرسالة (يدعم HTML والمتغيرات)"
                          multiline
                          rows={8}
                          fullWidth
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              fontSize: "14px",
                              lineHeight: 1.5,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="subtitle2" mb={1} fontWeight="bold">
                            المتغيرات المتاحة
                          </MDTypography>
                          <MDBox mb={2}>
                            <MDTypography variant="caption" color="text">
                              متغيرات المستخدم:
                            </MDTypography>
                            <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {data.variables?.user_variables.map((v) => (
                                <Tooltip key={v.key} title={v.description}>
                                  <Chip
                                    label={v.key}
                                    size="small"
                                    onClick={() => insertVariable(v.key)}
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { bgcolor: "primary.light", color: "white" },
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </MDBox>
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="caption" color="text">
                              متغيرات الاشتراك:
                            </MDTypography>
                            <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {data.variables?.subscription_variables.map((v) => (
                                <Tooltip key={v.key} title={v.description}>
                                  <Chip
                                    label={v.key}
                                    size="small"
                                    onClick={() => insertVariable(v.key)}
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { bgcolor: "secondary.light", color: "white" },
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </Paper>
                </Fade>
              </Grid>
            )}

            {/* Preview and Send */}
            {preview && (
              <Grid item xs={12}>
                <Fade in timeout={900}>
                  <Paper elevation={2} sx={{ p: 3, bgcolor: "grey.50" }}>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Icon color="primary">preview</Icon>
                      <MDTypography variant="h6" ml={1}>
                        الخطوة 3: المعاينة والإرسال
                      </MDTypography>
                    </MDBox>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, bgcolor: "white" }}>
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ color: "info.main", mr: 1 }}>people</Icon>
                            <MDTypography variant="h6">معاينة الاستهداف</MDTypography>
                          </MDBox>

                          {previewLoading ? (
                            <MDBox display="flex" justifyContent="center" p={2}>
                              <CircularProgress size={30} />
                            </MDBox>
                          ) : (
                            <MDBox>
                              <Alert severity="info" sx={{ mb: 2 }}>
                                <MDTypography variant="body2">
                                  <strong>الجمهور المستهدف:</strong> {getTargetDisplayName()}
                                </MDTypography>
                                <MDTypography variant="body2">
                                  <strong>إجمالي المستلمين:</strong> {preview.total_count} مستخدم
                                </MDTypography>
                                <MDTypography variant="caption">
                                  (عرض عينة من {preview.showing_count} مستخدمين)
                                </MDTypography>
                              </Alert>

                              <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                                {preview.users.map((u) => (
                                  <ListItem key={u.telegram_id}>
                                    <ListItemAvatar>
                                      <Avatar
                                        sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                                      >
                                        {(u.full_name || u.username || "U")[0].toUpperCase()}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <MDTypography variant="button">
                                          {u.full_name || "مستخدم غير محدد"}
                                        </MDTypography>
                                      }
                                      secondary={`${u.username || u.telegram_id}`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </MDBox>
                          )}
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, bgcolor: "white" }}>
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ color: "success.main", mr: 1 }}>send</Icon>
                            <MDTypography variant="h6">الإرسال</MDTypography>
                          </MDBox>

                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <MDTypography variant="caption">
                              سيتم إرسال الرسالة إلى {preview.total_count} مستخدم. تأكد من مراجعة
                              المحتوى قبل الإرسال.
                            </MDTypography>
                          </Alert>

                          <MDButton
                            variant="gradient"
                            color="success"
                            fullWidth
                            size="large"
                            onClick={handleSendBroadcast}
                            disabled={isSending || !preview?.total_count || !message.trim()}
                            sx={{
                              height: 50,
                              fontSize: "16px",
                              boxShadow: 3,
                              "&:hover": { boxShadow: 6 },
                            }}
                          >
                            {isSending ? (
                              <MDBox display="flex" alignItems="center">
                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                جاري الإرسال...
                              </MDBox>
                            ) : (
                              <MDBox display="flex" alignItems="center">
                                <Icon sx={{ mr: 1 }}>send</Icon>
                                إرسال الرسالة الآن ({preview.total_count} مستلم)
                              </MDBox>
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
        )}
      </MDBox>
    </Card>
  );
}

BroadcastComposer.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onBroadcastSent: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};

export default BroadcastComposer;
