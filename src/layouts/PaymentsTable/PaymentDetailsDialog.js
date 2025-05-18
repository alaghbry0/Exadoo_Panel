// src/layouts/payments/PaymentDetailsDialog.js
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { format, isValid } from "date-fns"; // استيراد isValid للتحقق من صحة التاريخ
import { formatStatus, formatAmount, copyToClipboardUtil } from "./payments.utils";

function PaymentDetailsDialog({ open, onClose, payment, showSnackbar }) {
  const [tabValue, setTabValue] = useState("1");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!payment) return null;

  const handleCopyToClipboard = (text) => {
    copyToClipboardUtil(text, showSnackbar);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy HH:mm:ss") : "تاريخ غير صالح";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        تفاصيل الدفعة{" "}
        {payment.payment_token && (
          <Chip label={payment.payment_token} size="small" color="info" sx={{ ml: 1 }} />
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleTabChange} aria-label="payment details tabs">
              <Tab label="المعلومات الأساسية" value="1" />
              <Tab label="تفاصيل الاشتراك والعملية" value="2" />
              <Tab label="معلومات المستخدم" value="3" />
            </TabList>
          </Box>

          {/* المعلومات الأساسية */}
          <TabPanel value="1" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  الحالة
                </MDTypography>
                {formatStatus(payment.status)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  المبلغ
                </MDTypography>
                <MDTypography variant="body2">
                  {formatAmount(payment.amount, payment.currency)}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  المبلغ المستلم
                </MDTypography>
                <MDTypography variant="body2">
                  {formatAmount(payment.amount_received, payment.currency)}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  طريقة الدفع
                </MDTypography>
                <MDTypography variant="body2">{payment.payment_method || "-"}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  تاريخ الإنشاء
                </MDTypography>
                <MDTypography variant="body2">{formatDate(payment.created_at)}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  تاريخ المعالجة
                </MDTypography>
                <MDTypography variant="body2">{formatDate(payment.processed_at)}</MDTypography>
              </Grid>
              {payment.expires_at && (
                <Grid item xs={12} sm={6}>
                  <MDTypography variant="subtitle2" fontWeight="medium">
                    تاريخ الانتهاء
                  </MDTypography>
                  <MDTypography variant="body2">{formatDate(payment.expires_at)}</MDTypography>
                </Grid>
              )}
              {/* تاريخ التحديث غير موجود في بنية جدولك، إذا وجد أضفه
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">تاريخ آخر تحديث</MDTypography>
                <MDTypography variant="body2">{formatDate(payment.updated_at)}</MDTypography>
              </Grid>
              */}
              {payment.error_message && (
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" fontWeight="medium" color="error">
                    رسالة الخطأ
                  </MDTypography>
                  <Alert severity="error" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                    {payment.error_message}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* تفاصيل الاشتراك والعملية */}
          <TabPanel value="2" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  نوع الاشتراك
                </MDTypography>
                <MDTypography variant="body2">{payment.subscription_type_name || "-"}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  اسم الخطة
                </MDTypography>
                <MDTypography variant="body2">{payment.plan_name || "-"}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  رمز الدفع (Token)
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {payment.payment_token || "-"}
                  </MDTypography>
                  {payment.payment_token && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(payment.payment_token)}
                      sx={{ ml: 0.5 }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  رقم العملية (Tx Hash)
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {payment.tx_hash || "-"}
                  </MDTypography>
                  {payment.tx_hash && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(payment.tx_hash)}
                      sx={{ ml: 0.5 }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  محفظة المستخدم
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {payment.user_wallet_address || "-"}
                  </MDTypography>
                  {payment.user_wallet_address && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(payment.user_wallet_address)}
                      sx={{ ml: 0.5 }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </MDBox>
              </Grid>
            </Grid>
          </TabPanel>

          {/* معلومات المستخدم */}
          <TabPanel value="3" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  الاسم الكامل
                </MDTypography>
                <MDTypography variant="body2">{payment.full_name || "-"}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  اسم المستخدم
                </MDTypography>
                <MDTypography variant="body2">{payment.username || "-"}</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" fontWeight="medium">
                  معرف تيليجرام
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="body2">
                    {payment.telegram_id ? String(payment.telegram_id) : "-"}
                  </MDTypography>
                  {payment.telegram_id && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(String(payment.telegram_id))}
                      sx={{ ml: 0.5 }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </MDBox>
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentDetailsDialog;
