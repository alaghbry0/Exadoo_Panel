// Example: src/layouts/tables/utils/subscriptions.utils.js
import React from "react";
import Chip from "@mui/material/Chip";
import { format, isValid } from "date-fns"; // or use dayjs if preferred

export const formatSubStatus = (isActive) => {
  if (isActive === true || String(isActive).toLowerCase() === "true") {
    return <Chip label="Active" color="success" size="small" variant="outlined" />;
  }
  return <Chip label="Inactive" color="error" size="small" variant="outlined" />;
};

export const formatSubDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd/MM/yyyy") : "Invalid Date";
};
