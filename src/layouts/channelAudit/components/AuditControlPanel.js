// src/layouts/channelAudit/components/AuditControlPanel.js

import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function AuditControlPanel({ onStartAudit, isStarting, isLoading, auditData }) {
  // الحالة التي تعرض فيها دائرة التحميل:
  // 1. إذا كان الفحص قيد التشغيل (isLoading)
  // 2. أو إذا كان هناك بيانات فحص حالية ولكنها لا تزال قيد التشغيل (auditData.is_running)
  const showLoader = isLoading || auditData?.is_running;

  return (
    <Card>
      <MDBox p={3} textAlign="center">
        {showLoader ? (
          <>
            <CircularProgress color="info" />
            <MDTypography variant="h6" mt={2}>
              🔍 جاري فحص القنوات...
            </MDTypography>
            <MDTypography variant="caption" color="text">
              قد تستغرق هذه العملية عدة دقائق. يمكنك مغادرة الصفحة والعودة لاحقًا.
            </MDTypography>
          </>
        ) : (
          <>
            <MDTypography variant="h4" gutterBottom>
              <Icon fontSize="large">policy</Icon> فحص القنوات
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              تقوم هذه الأداة بفحص جميع قنواتك للعثور على الأعضاء الموجودين بدون اشتراك فعال.
              <br />
              العملية تتم على مرحلتين: أولاً الفحص وعرض النتائج، ثم يمكنك بدء عملية الإزالة.
            </MDTypography>
            <MDButton
              variant="gradient"
              color="info"
              onClick={onStartAudit}
              disabled={isStarting || isLoading}
            >
              {isStarting ? "جاري البدء..." : "🚀 بدء عملية فحص جديدة"}
            </MDButton>
          </>
        )}
      </MDBox>
    </Card>
  );
}

// تحديد أنواع الـ props للتحقق من صحتها
AuditControlPanel.propTypes = {
  onStartAudit: PropTypes.func.isRequired,
  isStarting: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  auditData: PropTypes.object,
};

// تحديد قيمة افتراضية لـ auditData لتجنب الأخطاء
AuditControlPanel.defaultProps = {
  auditData: null,
};

export default AuditControlPanel;
