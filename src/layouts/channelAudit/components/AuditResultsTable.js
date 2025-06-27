// src/layouts/channelAudit/components/AuditResultsTable.js

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DataTable from "examples/Tables/DataTable";

// API
import { startChannelCleanup } from "services/api";

// مكون مساعد لعرض اسم القناة بشكل منمق
const Channel = ({ name, id }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDTypography display="block" variant="button" fontWeight="medium">
      {name || "قناة غير مسماة"}
    </MDTypography>
    <MDTypography variant="caption"> ({id})</MDTypography>
  </MDBox>
);

// مكون مساعد لعرض الإحصائيات والأرقام
const StatCell = ({ value, color = "text", fontWeight = "medium" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {/* نعرض طول المصفوفة إذا كانت القيمة مصفوفة (مثل users_to_remove) */}
    {Array.isArray(value) ? value.length : value ?? "---"}
  </MDTypography>
);

function AuditResultsTable({ auditData, setSnackbar }) {
  const [cleanupState, setCleanupState] = useState({});
  // استخدام قيم افتراضية آمنة لمنع الأخطاء إذا كانت البيانات غير موجودة
  const { audit_uuid, channel_results: auditResults = [], is_running: isAuditRunning } = auditData; //  <--  التعديل هنا

  const handleStartCleanup = async (channelId) => {
    setCleanupState((prev) => ({ ...prev, [channelId]: { loading: true, batchId: null } }));
    try {
      const response = await startChannelCleanup(audit_uuid, channelId);
      setCleanupState((prev) => ({
        ...prev,
        [channelId]: { loading: false, batchId: response.batch_id },
      }));
      setSnackbar({
        open: true,
        color: "success",
        title: "بدأت مهمة الإزالة",
        message: `تم بدء عملية إزالة الأعضاء من القناة. يمكنك متابعة التقدم من صفحة المهام.`,
      });
    } catch (error) {
      setCleanupState((prev) => ({ ...prev, [channelId]: { loading: false } }));
      setSnackbar({
        open: true,
        color: "error",
        title: "خطأ",
        message: error.response?.data?.error || "فشل في بدء عملية الإزالة.",
      });
    }
  };

  const tableData = useMemo(() => {
    const columns = [
      { Header: "القناة", accessor: "channel", width: "25%", align: "left" },
      { Header: "الحالة", accessor: "status", align: "center" },
      { Header: "إجمالي الأعضاء", accessor: "total_members", align: "center" },
      { Header: "غير مشتركين", accessor: "inactive_members", align: "center" },
      { Header: "أعضاء مجهولين", accessor: "unidentified", align: "center" },
      { Header: "مرشحين للإزالة", accessor: "to_remove", align: "center" },
      { Header: "الإجراء", accessor: "action", align: "center" },
    ];

    const rows = auditResults.map((row) => {
      const usersToRemoveCount = row.users_to_remove?.length || 0;

      return {
        channel: <Channel name={row.channel_name} id={row.channel_id} />,
        status: (
          <MDBox textAlign="center">
            {row.status === "RUNNING" && <CircularProgress size={20} color="info" />}
            {row.status === "COMPLETED" && (
              <MDBadge badgeContent="اكتمل" color="success" variant="gradient" size="sm" />
            )}
            {row.status === "FAILED" && (
              <MDBadge badgeContent="فشل" color="error" variant="gradient" size="sm" />
            )}
          </MDBox>
        ),
        total_members: <StatCell value={row.total_members_api} />,
        inactive_members: <StatCell value={row.inactive_in_channel_db} color="warning" />,
        unidentified: <StatCell value={row.unidentified_members} />,
        to_remove: <StatCell value={usersToRemoveCount} color="error" fontWeight="bold" />,
        // ----- بداية الجزء المعدّل -----
        action: (
          <MDBox>
            {/* الحالة 1: اكتمل وهناك أعضاء لإزالتهم */}
            {row.status === "COMPLETED" &&
              usersToRemoveCount > 0 &&
              (cleanupState[row.channel_id]?.batchId ? (
                <Tooltip title="عرض تفاصيل المهمة" placement="top">
                  <Link to={`/tasks/${cleanupState[row.channel_id].batchId}`}>
                    <MDButton variant="outlined" color="success" size="small" iconOnly>
                      <Icon>task_alt</Icon>
                    </MDButton>
                  </Link>
                </Tooltip>
              ) : (
                <MDButton
                  variant="gradient"
                  color="error"
                  size="small"
                  onClick={() => handleStartCleanup(row.channel_id)}
                  disabled={cleanupState[row.channel_id]?.loading || isAuditRunning}
                >
                  {cleanupState[row.channel_id]?.loading ? (
                    "جاري..."
                  ) : (
                    <>
                      <Icon>delete_sweep</Icon> إزالة ({usersToRemoveCount})
                    </>
                  )}
                </MDButton>
              ))}

            {/* الحالة 2: اكتمل ولا يوجد أعضاء لإزالتهم */}
            {row.status === "COMPLETED" && usersToRemoveCount === 0 && (
              <MDTypography variant="caption" color="text">
                لا يوجد
              </MDTypography>
            )}
          </MDBox>
        ),
        // ----- نهاية الجزء المعدّل -----
      };
    });

    return { columns, rows };
  }, [auditResults, cleanupState, isAuditRunning]);

  return (
    <DataTable
      table={tableData}
      isSorted={false}
      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
      showTotalEntries
      noEndBorder
    />
  );
}

export default AuditResultsTable;
