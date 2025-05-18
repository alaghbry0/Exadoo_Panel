// src/layouts/tables/utils/legacy.utils.js
import React from "react";
import Chip from "@mui/material/Chip";
import { format, isValid } from "date-fns";

export const formatLegacyProcessedStatus = (processed) => {
  if (processed === true || String(processed).toLowerCase() === "true") {
    return (
      <Chip
        label="Processed"
        color="success"
        size="small"
        variant="outlined"
        sx={{ borderRadius: "6px", fontWeight: "medium" }}
      />
    );
  }
  return (
    <Chip
      label="Not Processed"
      color="error"
      size="small"
      variant="outlined"
      sx={{ borderRadius: "6px", fontWeight: "medium" }}
    />
  );
};

export const formatLegacyDate = (dateString, withTime = false) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const formatString = withTime ? "dd/MM/yy HH:mm" : "dd/MM/yyyy";
  return isValid(date) ? format(date, formatString) : "Invalid Date";
};
