// src/layouts/broadcasts/data/broadcastHistoryData.js

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import MDProgress from "components/MDProgress";
import MDButton from "components/MDButton";
import { Icon, Tooltip } from "@mui/material";

function getStatusBadge(status) {
  let color, text, icon;
  switch (status) {
    case "completed":
      color = "success";
      text = "مكتمل";
      icon = "check_circle";
      break;
    case "in_progress":
      color = "info";
      text = "قيد التنفيذ";
      icon = "sync";
      break;
    case "failed":
      color = "error";
      text = "فشل";
      icon = "error";
      break;
    case "pending":
      color = "warning";
      text = "قيد الانتظار";
      icon = "schedule";
      break;
    case "cancelled":
      color = "secondary";
      text = "ملغى";
      icon = "cancel";
      break;
    default:
      color = "dark";
      text = status;
      icon = "help";
  }
  return (
    <MDBadge
      badgeContent={
        <MDBox display="flex" alignItems="center" px={1}>
          <Icon sx={{ mr: 0.5, fontSize: "14px!important" }}>{icon}</Icon>
          <MDTypography variant="caption" sx={{ color: "white", fontWeight: "bold" }}>
            {text}
          </MDTypography>
        </MDBox>
      }
      color={color}
      variant="gradient"
      size="sm"
      container
    />
  );
}

export default function broadcastHistoryData(data, onRowClick) {
  const columns = [
    { Header: "المهمة", accessor: "batchInfo", width: "35%" },
    { Header: "الحالة", accessor: "status", align: "center" },
    { Header: "التقدم", accessor: "progress", align: "center", width: "20%" },
    { Header: "تاريخ الإنشاء", accessor: "created_at", align: "center" },
    { Header: "إجراء", accessor: "action", align: "center" },
  ];

  const rows = data.map((batch) => {
    const progressValue =
      batch.total_users > 0
        ? ((batch.successful_sends + batch.failed_sends) / batch.total_users) * 100
        : 0;

    const progressLabel = `${batch.successful_sends + batch.failed_sends} / ${batch.total_users}`;

    return {
      batchInfo: (
        <MDBox display="flex" flexDirection="column">
          <MDTypography variant="button" color="text" fontWeight="medium">
            {batch.target_description || "مجموعة عامة"}
          </MDTypography>
          <MDTypography variant="caption" color="secondary">
            ID: {batch.batch_id.substring(0, 12)}...
          </MDTypography>
        </MDBox>
      ),
      status: getStatusBadge(batch.status),
      progress: (
        <MDBox sx={{ width: "90%" }} mx="auto">
          <MDProgress value={progressValue} color="info" variant="gradient" label={false} />
          <MDTypography variant="caption" color="text" display="block" textAlign="center" mt={0.5}>
            {progressLabel}
          </MDTypography>
        </MDBox>
      ),
      created_at: (
        <MDTypography variant="caption" color="text">
          {new Date(batch.created_at).toLocaleString("ar-EG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </MDTypography>
      ),
      action: (
        <Tooltip title="عرض التفاصيل">
          <MDButton
            variant="outlined"
            color="info"
            iconOnly
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onRowClick(batch.batch_id);
            }}
          >
            <Icon>visibility</Icon>
          </MDButton>
        </Tooltip>
      ),
    };
  });

  return { columns, rows };
}
