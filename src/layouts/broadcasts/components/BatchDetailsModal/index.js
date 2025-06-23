// src/layouts/broadcasts/components/BatchDetailsModal/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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
  Zoom,
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

// Helper Functions
function getStatusInfo(status) {
  let color, text, icon;
  switch (status) {
    case "completed":
      color = "success";
      text = "مكتمل";
      icon = "check_circle";
      break;
    case "in_progress":
      color = "info";
      text = "قيد التنفيذ";
      icon = "sync";
      break;
    case "failed":
      color = "error";
      text = "فشل";
      icon = "error";
      break;
    case "pending":
      color = "warning";
      text = "قيد الانتظار";
      icon = "schedule";
      break;
    case "cancelled":
      color = "secondary";
      text = "ملغى";
      icon = "cancel";
      break;
    default:
      color = "dark";
      text = status;
      icon = "help";
  }
  return { color, text, icon };
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "N/A";
  return new Date(dateTimeString).toLocaleString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function translateTargetGroup(group) {
  const names = {
    all_users: "جميع المستخدمين",
    active_subscribers: "المشتركون النشطون",
    expired_subscribers: "المشتركون المنتهون",
    no_subscription: "بدون اشتراك",
    subscription_type_active: "نشطون في نوع معين",
    subscription_type_expired: "منتهون في نوع معين",
  };
  return names[group] || group;
}

// ** التحسين الجديد: دالة لترجمة مفاتيح الأخطاء **
function translateErrorKey(key) {
  const errorTranslations = {
    bot_blocked: "البوت محظور من قبل المستخدم",
    chat_not_found: "المستخدم لم يبدأ محادثة مع البوت",
    user_deactivated: "حساب المستخدم معطل",
    rate_limit_exceeded: "تجاوز حد المراسلة",
    unknown_error: "خطأ غير معروف",
    // أضف أي مفاتيح أخطاء أخرى هنا
  };
  return errorTranslations[key] || key; // يعيد المفتاح الأصلي إذا لم يجد ترجمة
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
          title: "خطأ",
          message: "فشل تحميل تفاصيل المهمة.",
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
        title: "تم بنجاح",
        message: `بدأت مهمة إعادة المحاولة للمرسلين الفاشلين بالمعرف: ${response.new_batch_id}`,
      });
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "حدث خطأ أثناء إعادة المحاولة.";
      setSnackbar({ open: true, color: "error", title: "فشل", message: errorMsg });
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

  const messageHtml = details?.message_content?.text
    ? { __html: details.message_content.text }
    : { __html: "لا يوجد محتوى." };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <Fade in={open} timeout={300}>
        <Card
          sx={{
            width: "100%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <MDBox p={3} position="relative">
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "grey.200",
                "&:hover": { bgcolor: "grey.300" },
              }}
            >
              <Icon>close</Icon>
            </IconButton>

            {loading && (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
              </MDBox>
            )}

            {!loading && details && (
              <Zoom in timeout={500}>
                <MDBox>
                  {/* ... باقي الكود كما هو ... */}
                  {/* Header */}
                  <MDBox mb={3}>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Icon sx={{ fontSize: 32, color: "info.main", mr: 2 }}>dvr</Icon>
                      <MDBox>
                        <MDTypography variant="h4" fontWeight="bold">
                          تفاصيل المهمة
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
                  <Grid container spacing={3} mb={3}>
                    {/* Info Panel */}
                    <Grid item xs={12} md={5}>
                      <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                        <MDBox mb={2}>
                          <MDTypography variant="h6" fontWeight="medium">
                            معلومات المهمة
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" mb={1.5}>
                          <Icon color="info" sx={{ mr: 1 }}>
                            groups
                          </Icon>
                          <MDTypography variant="button">الجمهور:</MDTypography>
                          <MDTypography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                             {translateTargetGroup(details.target_group)}
                          </MDTypography>
                        </MDBox>
                        <Divider />
                        <MDBox mt={1.5}>
                          <MDBox display="flex" alignItems="center" mb={1}>
                            <Icon color="action" sx={{ mr: 1 }}>
                              event
                            </Icon>
                            <MDTypography variant="button">
                              أنشئت في: {formatDateTime(details.created_at)}
                            </MDTypography>
                          </MDBox>
                          <MDBox display="flex" alignItems="center" mb={1}>
                            <Icon color="info" sx={{ mr: 1 }}>
                              play_circle
                            </Icon>
                            <MDTypography variant="button">
                              بدأت في: {formatDateTime(details.started_at)}
                            </MDTypography>
                          </MDBox>
                          <MDBox display="flex" alignItems="center" mb={1}>
                            <Icon color="success" sx={{ mr: 1 }}>
                              check_circle
                            </Icon>
                            <MDTypography variant="button">
                              اكتملت في: {formatDateTime(details.completed_at)}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Paper>
                    </Grid>

                    {/* Stats Panel */}
                    <Grid item xs={12} md={7}>
                      <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Icon color="info">analytics</Icon>
                          <MDTypography variant="h6" fontWeight="medium" ml={1}>
                            إحصائيات الإرسال
                          </MDTypography>
                        </MDBox>
                        <Grid container spacing={1}>
                          <Grid item xs={4} textAlign="center">
                            <MDTypography variant="h4" color="success" fontWeight="bold">
                              {details.successful_sends}
                            </MDTypography>
                            <MDTypography variant="caption">الناجح</MDTypography>
                          </Grid>
                          <Grid item xs={4} textAlign="center">
                            <MDTypography variant="h4" color="error" fontWeight="bold">
                              {details.failed_sends}
                            </MDTypography>
                            <MDTypography variant="caption">الفاشل</MDTypography>
                          </Grid>
                          <Grid item xs={4} textAlign="center">
                            <MDTypography variant="h4" color="text" fontWeight="bold">
                              {details.total_users}
                            </MDTypography>
                            <MDTypography variant="caption">الإجمالي</MDTypography>
                          </Grid>
                        </Grid>
                        <MDBox mt={2}>
                          <Tooltip title={`${progressPercentage.toFixed(1)}% مكتمل`}>
                            <MDBox>
                              <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                                <MDTypography variant="caption">التقدم</MDTypography>
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
                            </MDBox>
                          </Tooltip>
                        </MDBox>
                      </Paper>
                    </Grid>

                    {/* Message Content Panel */}
                    <Grid item xs={12}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <Icon color="primary">message</Icon>
                          <MDTypography variant="h6" ml={1} fontWeight="medium">
                            محتوى الرسالة
                          </MDTypography>
                        </MDBox>
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
                          <div dangerouslySetInnerHTML={messageHtml} />
                        </Card>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Error Details Panel */}
                  {details.failed_sends > 0 && (
                    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDBox display="flex" alignItems="center">
                          <Icon color="error" mr={1}>
                            report_problem
                          </Icon>
                          <MDTypography variant="h6" fontWeight="medium">
                            تفاصيل الأخطاء ({details.failed_sends})
                          </MDTypography>
                        </MDBox>
                        {retryableErrorsExist && (
                          <Tooltip title="إعادة إرسال الرسائل للمستخدمين الذين فشل الإرسال لهم مؤقتًا">
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
                                  <Icon>replay</Icon> إعادة المحاولة
                                </>
                              )}
                            </MDButton>
                          </Tooltip>
                        )}
                      </MDBox>

                      {/* ** القسم المحسن لعرض ملخص الأخطاء المترجم ** */}
                      {details.error_summary && Object.keys(details.error_summary).length > 0 && (
                        <MDBox mb={2}>
                          <MDTypography variant="subtitle2" mb={1}>
                            ملخص أسباب الفشل:
                          </MDTypography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {Object.entries(details.error_summary).map(([key, value]) => (
                              <Tooltip key={key} title={`الرمز: ${key}`}>
                                <Chip
                                  icon={<Icon sx={{ fontSize: "16px!important" }}>label</Icon>}
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
                                    width: 32,
                                    height: 32,
                                  }}
                                >
                                  <Icon
                                    sx={{
                                      color: error.is_retryable ? "warning.main" : "error.main",
                                    }}
                                  >
                                    {error.is_retryable ? "autorenew" : "error_outline"}
                                  </Icon>
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <MDTypography variant="button" fontWeight="medium">
                                    {error.full_name || `@${error.username}` || error.telegram_id}
                                  </MDTypography>
                                }
                                secondary={
                                  <MDTypography variant="caption">
                                    {error.error_message}
                                  </MDTypography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                    </Paper>
                  )}
                </MDBox>
              </Zoom>
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
