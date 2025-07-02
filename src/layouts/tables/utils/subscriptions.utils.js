// src/layouts/tables/utils/subscriptions.utils.js

import React from "react";
import Chip from "@mui/material/Chip";
import { format, isValid, parseISO } from "date-fns";

// --- تعديل: دالة تنسيق الحالة أصبحت أكثر ذكاءً ---
export const formatSubStatus = (statusLabel) => {
  switch (statusLabel) {
    case "active":
      return <Chip label="Active" color="success" size="small" variant="outlined" />;
    case "expiring_soon":
      return <Chip label="Expiring Soon" color="warning" size="small" variant="outlined" />;
    case "expired":
      return <Chip label="Expired" color="error" size="small" variant="outlined" />;
    case "inactive":
      return <Chip label="Inactive" color="secondary" size="small" variant="outlined" />;
    default:
      return <Chip label={statusLabel || "Unknown"} size="small" variant="outlined" />;
  }
};

export const formatSubDate = (dateString) => {
  if (!dateString) return "-";

  // 💡 --- التعديل الرئيسي هنا ---
  // JavaScript's new Date() can parse RFC 1123 format directly.
  // It's more robust than relying on a specific format parser like parseISO.
  const date = new Date(dateString);

  // نتحقق من صلاحية التاريخ بعد التحليل
  return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : "Invalid Date";
};
