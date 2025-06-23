// src/layouts/ManagePlans/components/BatchStatusIndicator.js
import React from "react";
import { Chip, Tooltip, Box, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import SendIcon from "@mui/icons-material/Send";

// دالة مساعدة لتحديد نص ونوع المهمة
const getBatchTypeInfo = (batchType) => {
  switch (batchType) {
    case "invite":
      return "Invite";
    case "broadcast":
      return "Broadcast";
    default:
      return "Task";
  }
};

function BatchStatusIndicator({ status, onClick }) {
  if (!status || !status.status) {
    return null;
  }

  const {
    status: batchStatus,
    batch_type,
    total_users = 0,
    successful_sends = 0,
    failed_sends = 0,
  } = status;

  const taskName = getBatchTypeInfo(batch_type);
  const progress = total_users > 0 ? ((successful_sends + failed_sends) / total_users) * 100 : 0;

  const renderStatus = () => {
    switch (batchStatus) {
      case "in_progress":
      case "pending":
        return (
          <Tooltip
            title={`${taskName} in Progress: ${successful_sends + failed_sends} / ${total_users}`}
          >
            <Chip
              icon={<CircularProgress size={16} />}
              label={`${taskName}: ${Math.round(progress)}%`}
              color="primary"
              variant="outlined"
              size="small"
              onClick={onClick}
              sx={{ cursor: "pointer" }}
            />
          </Tooltip>
        );
      case "completed":
        return (
          <Tooltip
            title={`${taskName} Completed: ${successful_sends} succeeded, ${failed_sends} failed.`}
          >
            <Chip
              icon={failed_sends > 0 ? <ErrorIcon /> : <CheckCircleIcon />}
              label={`${taskName} Completed`}
              color={failed_sends > 0 ? "warning" : "success"}
              variant="outlined"
              size="small"
              onClick={onClick}
              sx={{ cursor: "pointer" }}
            />
          </Tooltip>
        );
      case "failed":
        return (
          <Tooltip title={`${taskName} failed to run. Click for details.`}>
            <Chip
              icon={<ErrorIcon />}
              label={`${taskName} Failed`}
              color="error"
              variant="outlined"
              size="small"
              onClick={onClick}
              sx={{ cursor: "pointer" }}
            />
          </Tooltip>
        );
      default:
        return (
          <Tooltip title={`Status: ${batchStatus}`}>
            <Chip
              icon={<HourglassTopIcon />}
              label={batchStatus}
              size="small"
              onClick={onClick}
              sx={{ cursor: "pointer" }}
            />
          </Tooltip>
        );
    }
  };

  return <Box sx={{ mt: 1 }}>{renderStatus()}</Box>;
}

export default BatchStatusIndicator;
