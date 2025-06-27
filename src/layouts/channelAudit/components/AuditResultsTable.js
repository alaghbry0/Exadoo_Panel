// src/layouts/channelAudit/components/AuditResultsTable.js

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DialogActions from "@mui/material/DialogActions";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DataTable from "examples/Tables/DataTable";

// API
import { startChannelCleanup, getRemovableUsers } from "services/api"; // <-- تم إضافة getRemovableUsers

// --- المكونات المساعدة (بدون تغيير) ---
const Channel = ({ name, id }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDTypography display="block" variant="button" fontWeight="medium">
      {name || "قناة غير مسماة"}
    </MDTypography>
    <MDTypography variant="caption">  ({id})</MDTypography>
  </MDBox>
);

const StatCell = ({ value, color = "text", fontWeight = "medium" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {value ?? "---"}
  </MDTypography>
);

// --- المكون الرئيسي مع التعديلات ---
function AuditResultsTable({ auditData, setSnackbar }) {
  // --- الحالة الحالية (بدون تغيير) ---
  const [cleanupState, setCleanupState] = useState({});
  const { audit_uuid, channel_results: auditResults = [], is_running: isAuditRunning } = auditData;

  // --- [جديد] حالة النافذة المنبثقة (Modal/Dialog) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUsers, setModalUsers] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // حالة للتحميل

  // --- [جديد] دالة لفتح النافذة وجلب بيانات المستخدمين ---
  const showUsersModal = async (channelId, channelName, usersToRemoveCount) => {
    setModalTitle(`المرشحون للإزالة من قناة "${channelName}" (${usersToRemoveCount} مستخدم)`);
    setModalOpen(true);
    setModalUsers([]); // تفريغ القائمة القديمة لإظهار رسالة التحميل
    setIsLoadingUsers(true);
    try {
      const users = await getRemovableUsers(audit_uuid, channelId);
      setModalUsers(users);
    } catch (error) {
      // يمكنك عرض رسالة خطأ هنا إذا أردت
      console.error("Failed to fetch removable users:", error);
      setSnackbar({
        open: true,
        color: "error",
        title: "خطأ",
        message: "فشل في جلب قائمة المستخدمين.",
      });
      // إغلاق النافذة عند حدوث خطأ
      handleCloseModal();
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // --- [جديد] دالة لإغلاق النافذة المنبثقة ---
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalUsers([]);
  };

  // --- دالة بدء التنظيف (بدون تغيير) ---
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
        message: "تم بدء عملية إزالة الأعضاء من القناة. يمكنك متابعة التقدم من صفحة المهام.",
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
      let usersToRemoveCount = 0;
      if (row.users_to_remove) {
        if (typeof row.users_to_remove === "object" && Array.isArray(row.users_to_remove.ids)) {
          usersToRemoveCount = row.users_to_remove.ids.length;
        } else if (typeof row.users_to_remove === "string") {
          try {
            const parsedData = JSON.parse(row.users_to_remove);
            if (Array.isArray(parsedData.ids)) {
              usersToRemoveCount = parsedData.ids.length;
            }
          } catch (e) {
            // تجاهل
          }
        }
      }

      return {
        // ... الأعمدة الأخرى تبقى كما هي ...
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
            {row.status === "PENDING" && (
              <MDBadge badgeContent="معلق" color="secondary" variant="gradient" size="sm" />
            )}
          </MDBox>
        ),
        total_members: <StatCell value={row.total_members_api} />,
        inactive_members: <StatCell value={row.inactive_in_channel_db} color="warning" />,
        unidentified: <StatCell value={row.unidentified_members} />,

        // --- [تعديل] جعل خانة "مرشحين للإزالة" قابلة للنقر ---
        to_remove: (
          <MDBox
            onClick={() => {
              // لا نفتح النافذة إذا كان العدد صفراً
              if (usersToRemoveCount > 0) {
                showUsersModal(row.channel_id, row.channel_name, usersToRemoveCount);
              }
            }}
            // تغيير شكل المؤشر فقط إذا كان هناك مستخدمون للعرض
            sx={{ cursor: usersToRemoveCount > 0 ? "pointer" : "default", display: "inline-block" }}
          >
            <StatCell value={usersToRemoveCount} color="error" fontWeight="bold" />
          </MDBox>
        ),

        // --- عمود الإجراء (بدون تغيير) ---
        action: (
          <MDBox>
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
            {row.status === "COMPLETED" && usersToRemoveCount === 0 && (
              <MDTypography variant="caption" color="text">
                لا يوجد
              </MDTypography>
            )}
            {row.status !== "COMPLETED" && (
              <MDTypography variant="caption" color="text">
                ---
              </MDTypography>
            )}
          </MDBox>
        ),
      };
    });

    return { columns, rows };
  }, [auditResults, cleanupState, isAuditRunning, audit_uuid]); // <-- أضفنا audit_uuid للـ dependencies

  // --- [تعديل] إضافة النافذة المنبثقة بعد الجدول ---
  return (
    <>
      <DataTable
        table={tableData}
        isSorted={false}
        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
        showTotalEntries
        noEndBorder
      />

      {/* [جديد] النافذة المنبثقة لعرض المستخدمين */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent dividers>
          <List>
            {isLoadingUsers ? (
              <ListItem>
                <ListItemText primary="جاري تحميل المستخدمين..." />
              </ListItem>
            ) : modalUsers.length > 0 ? (
              modalUsers.map((user) => (
                <ListItem key={user.telegram_id}>
                  <ListItemText
                    primary={user.full_name || "اسم غير معروف"}
                    secondary={`@${user.username || "لا يوجد اسم مستخدم"} - ID: ${
                      user.telegram_id
                    }`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="لم يتم العثور على مستخدمين." />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseModal} color="secondary">
            إغلاق
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AuditResultsTable;
