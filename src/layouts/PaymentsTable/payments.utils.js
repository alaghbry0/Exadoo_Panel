// src/layouts/payments/payments.utils.js
import React from "react";
import Chip from "@mui/material/Chip";
import { format } from "date-fns";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const formatStatus = (status) => {
  const statusMap = {
    completed: { label: "مكتملة", color: "success" },
    pending: { label: "قيد الانتظار", color: "warning" },
    failed: { label: "فاشلة", color: "error" },
    processing: { label: "قيد المعالجة", color: "info" },
    underpaid: { label: "دفع ناقص", color: "secondary" }, // مثال لإضافة حالة
    canceled: { label: "ملغاة", color: "default" }, // مثال لإضافة حالة
    default: { label: status || "غير معروف", color: "default" },
  };
  const statusInfo = statusMap[status?.toLowerCase()] || statusMap.default;
  return (
    <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="contained" />
  );
};

export const formatPaymentMethod = (method) => {
  // يمكنك إضافة منطق لتنسيق أسماء طرق الدفع إذا لزم الأمر
  // مثال: if (method === 'crypto') return 'عملات رقمية';
  return method || "-";
};

export const formatAmount = (amount, currency = "USD") => {
  // إضافة العملة كباراميتر اختياري
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat("ar-SA", {
      // يمكنك تغيير ar-SA إذا لزم الأمر
      style: "currency",
      currency: currency, // استخدام العملة الممررة أو الافتراضية
    }).format(amount);
  } catch (e) {
    console.error("Error formatting amount:", e);
    return `${amount} ${currency}`; // fallback
  }
};

export const copyToClipboardUtil = (text, showSnackbarCallback) => {
  if (!text) {
    showSnackbarCallback("لا يوجد نص للنسخ", "warning");
    return;
  }
  navigator.clipboard.writeText(String(text)).then(
    // تحويل النص إلى string لضمان عمله
    () => {
      showSnackbarCallback("تم نسخ النص بنجاح", "success");
    },
    (err) => {
      showSnackbarCallback("فشل نسخ النص", "error");
      console.error("فشل نسخ النص: ", err);
    }
  );
};

export const createPaymentRow = (
  payment,
  visibleColumnsKeys,
  actionHandlers,
  formatters,
  showSnackbarCallback
) => {
  const { handleView } = actionHandlers;
  const {
    formatAmount: fmtAmount,
    formatPaymentMethod: fmtMethod,
    formatStatus: fmtStatus,
  } = formatters;

  const baseRow = {
    full_name: payment.full_name || "-",
    username: payment.username || "-",
    telegram_id: payment.telegram_id ? String(payment.telegram_id) : "-", // التعامل مع الأرقام الكبيرة
    payment_token: payment.payment_token || "-",
    tx_hash: payment.tx_hash ? (
      <MDBox display="flex" alignItems="center" sx={{ maxWidth: 150, overflow: "hidden" }}>
        {" "}
        {/* تحديد عرض أقصى */}
        <MDTypography
          variant="caption"
          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {payment.tx_hash}
        </MDTypography>
        <Tooltip title="نسخ رقم العملية">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboardUtil(payment.tx_hash, showSnackbarCallback);
            }}
            sx={{ ml: 0.5 }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </MDBox>
    ) : (
      "-"
    ),
    amount: fmtAmount(payment.amount, payment.currency), // استخدام عملة الدفعة
    amount_received: fmtAmount(payment.amount_received, payment.currency), // استخدام عملة الدفعة
    payment_method: fmtMethod(payment.payment_method),
    processed_at: payment.processed_at
      ? format(new Date(payment.processed_at), "dd/MM/yyyy HH:mm")
      : "-",
    error_message: payment.error_message ? (
      <Tooltip title={payment.error_message}>
        <MDTypography
          variant="caption"
          color="error"
          sx={{
            maxWidth: 150,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {payment.error_message}
        </MDTypography>
      </Tooltip>
    ) : (
      "-"
    ),
    status: fmtStatus(payment.status),
    subscription_type_name: payment.subscription_type_name || "-", // <-- إضافة الحقل الجديد
    plan_name: payment.plan_name || "-", // <-- إضافة الحقل الذي كان موجودًا في الكود الأول الذي أرسلته لي
    actions: (
      <Tooltip title="عرض التفاصيل">
        <IconButton size="small" onClick={() => handleView(payment)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  };

  const filteredRow = {};
  visibleColumnsKeys.forEach((columnKey) => {
    if (baseRow.hasOwnProperty(columnKey)) {
      filteredRow[columnKey] = baseRow[columnKey];
    }
  });
  // تأكد دائماً من إضافة عمود الإجراءات إذا لم يكن مرئياً بالفعل من خلال visibleColumnsKeys
  if (!filteredRow.actions && baseRow.actions) {
    filteredRow.actions = baseRow.actions;
  }

  return filteredRow;
};
