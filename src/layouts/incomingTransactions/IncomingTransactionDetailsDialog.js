import React from "react"; // لا حاجة لـ useState هنا إذا كان الحوار يعرض فقط
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
// import Alert from "@mui/material/Alert"; // إذا احتجت لعرض خطأ
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  formatProcessedStatus,
  formatIncomingAmount,
  formatDateSimple,
} from "./incoming-transactions.utils";
// افترض أن copyToClipboardUtil موجود في ملف مشترك أو تم استيراده
import { generalCopyToClipboard as copyToClipboardUtil } from "./incoming-transactions.utils"; // مثال

function IncomingTransactionDetailsDialog({ open, onClose, transaction, showSnackbar }) {
  if (!transaction) return null;

  const handleCopyToClipboard = (text) => {
    copyToClipboardUtil(text, showSnackbar);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        تفاصيل المعاملة الواردة
        {transaction.txhash && (
          <Chip
            label={transaction.txhash.substring(0, 15) + "..."}
            size="small"
            color="info"
            sx={{ ml: 1 }}
          />
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              TX Hash
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                {transaction.txhash || "-"}
              </MDTypography>
              {transaction.txhash && (
                <IconButton
                  size="small"
                  onClick={() => handleCopyToClipboard(transaction.txhash)}
                  sx={{ ml: 0.5 }}
                >
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              عنوان المرسل
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                {transaction.sender_address || "-"}
              </MDTypography>
              {transaction.sender_address && (
                <IconButton
                  size="small"
                  onClick={() => handleCopyToClipboard(transaction.sender_address)}
                  sx={{ ml: 0.5 }}
                >
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              المبلغ
            </MDTypography>
            <MDTypography variant="body2">{formatIncomingAmount(transaction.amount)}</MDTypography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              رمز الدفع (Payment Token)
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="body2" sx={{ wordBreak: "break-all" }}>
                {transaction.payment_token || "-"}
              </MDTypography>
              {transaction.payment_token && (
                <IconButton
                  size="small"
                  onClick={() => handleCopyToClipboard(transaction.payment_token)}
                  sx={{ ml: 0.5 }}
                >
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              حالة المعالجة
            </MDTypography>
            {formatProcessedStatus(transaction.processed)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              تاريخ الاستلام
            </MDTypography>
            <MDTypography variant="body2">{formatDateSimple(transaction.received_at)}</MDTypography>
          </Grid>
          <Grid item xs={12}>
            <MDTypography variant="subtitle2" fontWeight="medium">
              ملاحظة (Memo)
            </MDTypography>
            <MDTypography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {transaction.memo || "-"}
            </MDTypography>
          </Grid>
          {/* يمكنك إضافة txhash_base64 إذا لزم الأمر */}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IncomingTransactionDetailsDialog;
