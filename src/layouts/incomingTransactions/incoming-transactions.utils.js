import React from "react";
import Chip from "@mui/material/Chip";
import { format, isValid } from "date-fns";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
// يمكنك استيراد copyToClipboardUtil من utils الخاص بـ payments إذا كان عاماً
// أو نسخه هنا إذا كان مختلفًا قليلاً

export const formatProcessedStatus = (processed) => {
  if (processed === true || String(processed).toLowerCase() === "true") {
    return <Chip label="معالجة" color="success" size="small" variant="contained" />;
  }
  if (processed === false || String(processed).toLowerCase() === "false") {
    return <Chip label="غير معالجة" color="warning" size="small" variant="contained" />;
  }
  return <Chip label="غير معروف" color="default" size="small" />;
};

export const generalCopyToClipboard = (text, showSnackbarCallback) => {
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

export const formatIncomingAmount = (amount) => {
  // افترض أن العملة ثابتة أو غير مهمة هنا
  if (amount === null || amount === undefined) return "-";
  try {
    // افترض أن incoming_transactions لا تحتوي على حقل عملة محدد لكل معاملة
    // إذا كان هناك، يمكنك تمريره كما في payments.utils
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal", // أو 'currency' إذا كان لديك عملة
      minimumFractionDigits: 2, // أو حسب الدقة المطلوبة
      maximumFractionDigits: 6, // للسماح بعرض الكسور العشرية للعملات المشفرة
    }).format(amount);
  } catch (e) {
    console.error("Error formatting incoming amount:", e);
    return `${amount}`; // fallback
  }
};

export const formatDateSimple = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm:ss") : "تاريخ غير صالح";
};

export const createIncomingTransactionRow = (
  transaction,
  visibleColumnsKeys,
  actionHandlers,
  formatters,
  showSnackbarCallback
) => {
  const { handleView } = actionHandlers;
  const { formatProcessed, formatAmount, formatDate } = formatters;

  const baseRow = {
    txhash: transaction.txhash ? (
      <MDBox display="flex" alignItems="center" sx={{ maxWidth: 150, overflow: "hidden" }}>
        <MDTypography
          variant="caption"
          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {transaction.txhash}
        </MDTypography>
        <Tooltip title="نسخ TX Hash">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              generalCopyToClipboard(transaction.txhash, showSnackbarCallback);
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
    sender_address: transaction.sender_address ? (
      <MDBox display="flex" alignItems="center" sx={{ maxWidth: 150, overflow: "hidden" }}>
        <MDTypography
          variant="caption"
          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {transaction.sender_address}
        </MDTypography>
        <Tooltip title="نسخ عنوان المرسل">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              generalCopyToClipboard(transaction.sender_address, showSnackbarCallback);
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
    amount: formatAmount(transaction.amount),
    payment_token: transaction.payment_token || "-",
    processed: formatProcessed(transaction.processed),
    received_at: formatDate(transaction.received_at),
    memo: transaction.memo ? (
      <Tooltip title={transaction.memo}>
        <MDTypography
          variant="caption"
          sx={{
            maxWidth: 150,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {transaction.memo}
        </MDTypography>
      </Tooltip>
    ) : (
      "-"
    ),
    // txhash_base64: transaction.txhash_base64 || "-",
    actions: (
      <Tooltip title="عرض التفاصيل">
        <IconButton size="small" onClick={() => handleView(transaction)}>
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
  if (!filteredRow.actions && baseRow.actions) {
    filteredRow.actions = baseRow.actions;
  }

  return filteredRow;
};
