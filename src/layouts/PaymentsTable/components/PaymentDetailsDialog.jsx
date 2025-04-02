// components/PaymentDetailsDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  Paper,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { format } from "date-fns";

const DetailItem = ({ label, value, error, fullWidth = false }) => (
  <Grid item xs={12} md={fullWidth ? 12 : 6}>
    <Box mb={2}>
      <Typography variant="caption" color={error ? "error" : "textSecondary"}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        color={error ? "error" : "textPrimary"}
        sx={{ wordBreak: "break-all" }}
      >
        {value || "-"}
      </Typography>
    </Box>
  </Grid>
);

const PaymentDetailsDialog = ({ payment, open, onClose }) => {
  if (!payment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FFA726";
      case "failed":
        return "#F44336";
      case "underpaid":
        return "#9C27B0";
      case "canceled":
        return "#9E9E9E";
      default:
        return "#E0E0E0";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">تفاصيل المعاملة</Typography>
        <Chip
          label={payment.status}
          sx={{
            bgcolor: getStatusColor(payment.status),
            color: "#fff",
            position: "absolute",
            right: 24,
            top: 16,
          }}
        />
      </DialogTitle>

      <DialogContent dividers>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f5f7fa", borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ملخص المعاملة
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  المبلغ المطلوب
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {Number(payment.amount).toFixed(2)} {payment.currency}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  المبلغ المستلم
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={
                    Number(payment.amount_received) >= Number(payment.amount)
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {Number(payment.amount_received).toFixed(2)} {payment.currency}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  تاريخ المعاملة
                </Typography>
                <Typography variant="h6">
                  {payment.created_at ? format(new Date(payment.created_at), "yyyy/MM/dd") : "-"}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {payment.created_at ? format(new Date(payment.created_at), "HH:mm:ss") : ""}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MDTypography variant="h6" mb={2}>
              معلومات المعاملة
            </MDTypography>
            <Grid container>
              <DetailItem label="معرف المعاملة" value={payment.payment_token} />
              <DetailItem label="رقم الصفقة (TX Hash)" value={payment.tx_hash} />
              <DetailItem label="طريقة الدفع" value={payment.payment_method} />
              <DetailItem label="حالة المعاملة" value={payment.status} />
              <DetailItem label="الباقة المشترك بها" value={payment.plan_name} />
              <DetailItem label="نوع الاشتراك" value={payment.subscription_name} />
              {payment.processed_at && (
                <DetailItem
                  label="تاريخ المعالجة"
                  value={format(new Date(payment.processed_at), "yyyy/MM/dd HH:mm:ss")}
                />
              )}
              {payment.expires_at && (
                <DetailItem
                  label="تاريخ الانتهاء"
                  value={format(new Date(payment.expires_at), "yyyy/MM/dd HH:mm:ss")}
                />
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <MDTypography variant="h6" mb={2}>
              معلومات المستخدم
            </MDTypography>
            <Grid container>
              <DetailItem label="الاسم الكامل" value={payment.full_name} />
              <DetailItem
                label="اسم المستخدم"
                value={payment.username ? `@${payment.username}` : "-"}
              />
              <DetailItem label="معرف تيليجرام" value={payment.telegram_id} />
              <DetailItem label="معرف المستخدم" value={payment.user_id} />
              <DetailItem label="عنوان المحفظة" value={payment.user_wallet_address} />
            </Grid>
          </Grid>

          {payment.error_message && (
            <Grid item xs={12}>
              <MDTypography variant="h6" color="error" mt={2}>
                تفاصيل الخطأ
              </MDTypography>
              <DetailItem label="رسالة الخطأ" value={payment.error_message} error fullWidth />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        {payment.status === "pending" && (
          <Button color="success" variant="contained">
            تأكيد الدفع
          </Button>
        )}
        {payment.status === "failed" && (
          <Button color="primary" variant="contained">
            إعادة المحاولة
          </Button>
        )}
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDetailsDialog;
