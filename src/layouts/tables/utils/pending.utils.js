// src/layouts/tables/utils/pending.utils.js
import React from "react";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import MDTypography from "components/MDTypography";
import { format, isValid } from "date-fns";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export const formatPendingStatus = (status) => {
  let chipProps = {
    label: status,
    size: "small",
    sx: {
      borderRadius: "6px",
      fontWeight: "medium",
      minWidth: "90px",
      textTransform: "capitalize",
    },
  };
  if (status === "pending") {
    chipProps.color = "warning";
    chipProps.icon = <HourglassEmptyIcon fontSize="small" />;
  } else if (status === "complete") {
    chipProps.color = "success";
    chipProps.icon = <CheckCircleOutlineIcon fontSize="small" />;
  } else if (status === "rejected") {
    // Example for another status
    chipProps.color = "error";
  } else {
    chipProps.color = "default";
  }
  return <Chip {...chipProps} />;
};

export const formatPendingDate = (dateString, withTime = false) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const formatString = withTime ? "dd/MM/yy HH:mm" : "dd/MM/yyyy";
  return isValid(date) ? format(date, formatString) : "Invalid Date";
};

// createPendingRow (if needed, but DataTable usually handles rows from data and columns config)
// If you need complex rendering or actions within the row, you might use Cell renderers in column definitions.
