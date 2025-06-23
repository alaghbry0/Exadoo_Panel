// src/layouts/ManagePlans/components/BatchDetailsModal.js

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Box,
  // --- ✅ [تعديل] استيرادات إضافية ---
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { useSnackbar } from "notistack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import InfoIcon from "@mui/icons-material/Info";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// --- ✅ [تعديل] استيرادات إضافية ---
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOffIcon from "@mui/icons-material/PersonOff";

// دالة مساعدة لتنسيق التاريخ والوقت
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    return new Date(dateTimeString).toLocaleString(navigator.language || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    console.warn("Could not parse date:", dateTimeString, e);
    return dateTimeString;
  }
};

const getBatchTypeInfo = (batchType) => {
  switch (String(batchType).toLowerCase()) {
    case "invite":
      return { label: "Invite Sending Process", icon: <AutorenewIcon /> };
    case "broadcast":
      return { label: "Broadcast Message Task", icon: <AutorenewIcon /> };
    default:
      return { label: "Background Task", icon: <InfoIcon /> };
  }
};

const getStatusChipProps = (status) => {
  const s = String(status).toLowerCase();
  switch (s) {
    case "completed":
      return { label: "COMPLETED", color: "success", icon: <CheckCircleIcon /> };
    case "failed":
      return { label: "FAILED", color: "error", icon: <ErrorIcon /> };
    case "in_progress":
      return {
        label: "IN PROGRESS",
        color: "info",
        icon: <CircularProgress size={16} sx={{ mr: 0.5 }} />,
      };
    case "pending":
      return { label: "PENDING", color: "warning", icon: <HourglassEmptyIcon /> };
    default:
      return { label: s.toUpperCase(), color: "default" };
  }
};

function BatchDetailsModal({ open, onClose, batchId, onRetry, apiFn }) {
  const { enqueueSnackbar } = useSnackbar();
  const [batchDetails, setBatchDetails] = useState(null);
  // ✅ تعديل: ابدأ بـ true لعرض التحميل عند الفتح الأول
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);

  // ✅ تعديل: تحسين منطق جلب البيانات
  const fetchDetails = useCallback(async () => {
    if (!batchId || !apiFn || !apiFn.getDetails) {
      setError("Configuration error: API function for fetching details is not provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // لا تمسح batchDetails هنا، للسماح بعرض البيانات القديمة أثناء التحديث الدوري
    try {
      const data = await apiFn.getDetails(batchId);
      setBatchDetails(data);
    } catch (err) {
      console.error("Error fetching batch details:", err);
      setError(err.response?.data?.error || "Failed to load batch details.");
      // لا تمسح التفاصيل هنا في حالة وجود خطأ في الشبكة
    } finally {
      setLoading(false);
    }
  }, [batchId, apiFn]);

  // ✅ تعديل: تحسين useEffect
  useEffect(() => {
    if (open && batchId) {
      fetchDetails();
    }
    // لا تمسح التفاصيل عند الإغلاق لتجنب الوميض عند إعادة الفتح
  }, [open, batchId, fetchDetails]);

  // ✅ تعديل: تمرير batch_type عند إعادة المحاولة
  const handleRetry = async () => {
    if (!batchId || !apiFn || !apiFn.retry || !batchDetails || !batchDetails.subscription_type_id) {
      enqueueSnackbar("Cannot retry: Missing critical batch information or API function.", {
        variant: "error",
      });
      return;
    }
    setRetryLoading(true);
    try {
      const response = await apiFn.retry(batchId);
      enqueueSnackbar(response.message || "Retry process initiated successfully!", {
        variant: "success",
      });
      if (response.new_batch_id && batchDetails.subscription_type_id) {
        // ✅ تعديل: تمرير batch_type للمهمة الأصلية
        onRetry(response.new_batch_id, batchDetails.subscription_type_id, batchDetails.batch_type);
      }
      onClose(); // أغلق النافذة بعد بدء إعادة المحاولة
    } catch (err) {
      console.error("Error retrying batch:", err);
      enqueueSnackbar(err.response?.data?.error || "Failed to retry batch.", { variant: "error" });
    } finally {
      setRetryLoading(false);
    }
  };

  const batchTypeInfo = batchDetails
    ? getBatchTypeInfo(batchDetails.batch_type)
    : getBatchTypeInfo("");
  const progress =
    batchDetails && batchDetails.total_users > 0
      ? (((batchDetails.successful_sends || 0) + (batchDetails.failed_sends || 0)) /
          batchDetails.total_users) *
        100
      : 0;

  const statusProps = batchDetails
    ? getStatusChipProps(batchDetails.status)
    : getStatusChipProps("");

  // استخلاص تفاصيل الأخطاء لعرضها
  const errorDetails = batchDetails?.error_details || [];
  const hasFailedSends = batchDetails?.failed_sends > 0; // تبسيط الشرط

  // --- إضافة جديدة ---
  const errorSummary = batchDetails?.error_summary || {};
  const hasErrorSummary = Object.keys(errorSummary).length > 0;

  // قاموس لترجمة مفاتيح الأخطاء إلى نصوص عربية قابلة للعرض
  const errorKeyTranslations = {
    bot_blocked: "حظر البوت",
    user_deactivated: "حساب معطل",
    chat_not_found: "لم يبدأ محادثة",
    user_restricted: "مستخدم مقيد",
    parsing_error: "خطأ في تنسيق الرسالة",
    flood_wait: "تجاوز حد الطلبات",
    logic_error_invite: "خطأ في إنشاء الدعوة",
    generic_api_error: "خطأ API عام",
    unknown_error: "خطأ غير معروف",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">{batchTypeInfo.label} Details</MDTypography>
          {batchId && <Chip label={`ID: ${batchId.substring(0, 8)}...`} size="small" />}
        </MDBox>
      </DialogTitle>
      <DialogContent sx={{ py: 3, bgcolor: "grey.50" }}>
        {loading &&
          !batchDetails && ( // اعرض التحميل فقط إذا لم تكن هناك بيانات على الإطلاق
            <MDBox textAlign="center" py={5}>
              <CircularProgress />
              <MDTypography variant="body2" mt={2} color="text.secondary">
                Loading details...
              </MDTypography>
            </MDBox>
          )}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        {!error && batchDetails && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <MDTypography variant="subtitle1" gutterBottom fontWeight="medium">
                  Summary
                </MDTypography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {statusProps.icon || <InfoIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={statusProps.label}
                          color={statusProps.color}
                          size="small"
                          variant="outlined"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Successful Sends"
                      secondary={batchDetails.successful_sends || 0}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Failed Sends"
                      secondary={batchDetails.failed_sends || 0}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InfoIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Users Targeted"
                      secondary={batchDetails.total_users || 0}
                    />
                  </ListItem>
                </List>
                {(batchDetails.status === "in_progress" || batchDetails.status === "pending") &&
                  batchDetails.total_users > 0 && (
                    <MDBox mt={1.5}>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="text.secondary">
                          Progress
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          {Math.round(progress)}%
                        </MDTypography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        color="info"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </MDBox>
                  )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <MDTypography variant="subtitle1" gutterBottom fontWeight="medium">
                  Timestamps
                </MDTypography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created At"
                      secondary={formatDateTime(batchDetails.created_at)}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlayCircleOutlineIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Started At"
                      secondary={formatDateTime(batchDetails.started_at)}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Completed At"
                      secondary={formatDateTime(batchDetails.completed_at)}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* ✅ --- [إضافة جديدة] قسم ملخص الأخطاء --- */}
            {hasErrorSummary && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <MDTypography variant="subtitle1" gutterBottom fontWeight="medium">
                    Error Summary
                  </MDTypography>
                  <List dense>
                    {Object.entries(errorSummary).map(([key, count]) => (
                      <ListItem key={key} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
                          <ErrorIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={errorKeyTranslations[key] || key.replace(/_/g, " ")} // استخدام الترجمة أو اسم المفتاح
                          secondary={`Count: ${count}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}

            {/* ✅ --- قسم عرض تفاصيل الأخطاء --- */}
            {hasFailedSends && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <MDTypography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="medium"
                    color="error.main"
                  >
                    Failed Sends Details ({errorDetails.length})
                  </MDTypography>
                  <Accordion elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <MDTypography variant="body2">View List of Failed Sends</MDTypography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <List dense sx={{ maxHeight: 300, overflowY: "auto", width: "100%" }}>
                        {errorDetails.map((err, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <PersonOffIcon color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <MDTypography variant="caption" fontWeight="medium">
                                    {err.full_name ||
                                      (err.username
                                        ? `@${err.username}`
                                        : `ID: ${err.telegram_id}`)}
                                  </MDTypography>
                                }
                                secondary={
                                  <MDTypography variant="caption" color="text.secondary">
                                    {err.error_message || "No details available."}
                                  </MDTypography>
                                }
                              />
                              {err.is_retryable && (
                                <Chip
                                  label="Retryable"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </ListItem>
                            {index < errorDetails.length - 1 && (
                              <Divider component="li" variant="inset" />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </Grid>
            )}

            {/* عرض خطأ عام للمهمة إذا كان موجودًا */}
            {batchDetails.error_message && !hasFailedSends && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<ErrorIcon fontSize="inherit" />}>
                  <MDTypography variant="subtitle2" fontWeight="medium" gutterBottom>
                    Task Error:
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {batchDetails.error_message}
                  </MDTypography>
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions
        sx={{ p: "16px 24px", borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <MDButton onClick={onClose} color="secondary" variant="text">
          Close
        </MDButton>
        {/* ✅ تعديل: تحديث شرط عرض الزر وتغيير النص */}
        {batchDetails &&
          (batchDetails.status === "failed" ||
            (batchDetails.status === "completed" && hasFailedSends)) && (
            <MDButton
              onClick={handleRetry}
              color="info"
              variant="gradient"
              disabled={retryLoading || loading}
              startIcon={
                retryLoading ? <CircularProgress size={20} color="inherit" /> : <AutorenewIcon />
              }
            >
              {retryLoading ? "Retrying..." : "Retry Failed Sends"}
            </MDButton>
          )}
      </DialogActions>
    </Dialog>
  );
}

export default BatchDetailsModal;
