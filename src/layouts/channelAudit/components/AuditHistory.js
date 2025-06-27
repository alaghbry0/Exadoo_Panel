import { useState, useEffect, useMemo } from "react";

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge"; // <-- استخدام MDBadge للاتساق
import { format, isValid } from "date-fns";
// Material Dashboard 2 React example components
import DataTable from "examples/Tables/DataTable"; // <-- استخدام DataTable

// API
import { getAuditsHistory } from "services/api";

// <-- جديد: دالة مساعدة لتنسيق الحالة
const getStatusBadge = (status) => {
  let color;
  let text = status;
  switch (status) {
    case "RUNNING":
      color = "info";
      text = "قيد التشغيل";
      break;
    case "COMPLETED":
      color = "success";
      text = "مكتمل";
      break;
    case "FAILED":
      color = "error";
      text = "فشل";
      break;
    default:
      color = "dark";
      text = status || "غير معروف";
  }
  return <MDBadge badgeContent={text} color={color} variant="gradient" size="sm" container />;
};
const formatDateSimple = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm:ss") : "تاريخ غير صالح";
};

function AuditHistoryTable({ onSelectAudit, refreshKey, selectedAuditUUID }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getAuditsHistory();
        setHistory(data);
      } catch (error) {
        console.error("Could not fetch audit history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshKey]);

  // <-- جديد: تعريف الأعمدة والصفوف لمكون DataTable
  const { columns, rows } = useMemo(() => {
    const tableColumns = [
      { Header: "تاريخ البدء", accessor: "started_at", width: "30%" },
      { Header: "الحالة", accessor: "status", align: "center" },
      { Header: "مرشحين للإزالة", accessor: "candidates", align: "center" },
      { Header: "إجراء", accessor: "action", align: "center" },
    ];

    const tableRows = history.map((audit) => {
      const isSelected = audit.audit_uuid === selectedAuditUUID;
      return {
        started_at: (
          <MDTypography variant="body2">{formatDateSimple(audit.started_at)}</MDTypography>
        ),
        status: getStatusBadge(audit.overall_status),
        candidates: (
          <MDTypography
            variant="button"
            color={audit.total_removed_candidates > 0 ? "error" : "text"}
            fontWeight="bold"
          >
            {audit.total_removed_candidates ?? "---"}
          </MDTypography>
        ),
        action: (
          <MDButton
            variant={isSelected ? "contained" : "outlined"} // <-- تمييز الصف المحدد
            color="info"
            size="small"
            onClick={() => onSelectAudit(audit.audit_uuid)}
            startIcon={<Icon>{isSelected ? "visibility" : "search"}</Icon>}
          >
            {isSelected ? "محدد" : "عرض"}
          </MDButton>
        ),
      };
    });

    return { columns: tableColumns, rows: tableRows };
  }, [history, selectedAuditUUID, onSelectAudit]);

  return (
    <DataTable
      table={{ columns, rows }}
      isSorted={false}
      entriesPerPage={false}
      showTotalEntries={false}
      noEndBorder
      canSearch={false} // يمكنك تفعيله وإضافة حقل بحث إذا أردت
      tableHead
      title="سجل عمليات الفحص"
      description="اختر عملية فحص لعرض تفاصيلها بالأسفل"
      isLoading={loading}
    />
  );
}

export default AuditHistoryTable;
