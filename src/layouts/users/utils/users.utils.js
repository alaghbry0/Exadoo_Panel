// src/layouts/Users/utils/users.utils.js
import React from "react";
import Chip from "@mui/material/Chip";
// No specific formatters needed based on current UsersTable, but can be added.

// Example formatter if needed:
export const formatUserSubscriptionCount = (count) => {
  const color = count > 0 ? "success" : "default";
  return (
    <Chip
      label={String(count)}
      color={color}
      size="small"
      variant="outlined"
      sx={{ borderRadius: "6px" }}
    />
  );
};
