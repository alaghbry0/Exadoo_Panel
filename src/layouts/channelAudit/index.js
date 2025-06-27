// src/layouts/channelAudit/index.js

import { useState, useEffect, useCallback, useRef } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Page specific components
import AuditResultsDataTable from "layouts/channelAudit/components/AuditResultsTable";
import AuditHistoryTable from "layouts/channelAudit/components/AuditHistory";

// API calls
import { startChannelAudit, getChannelAuditStatus } from "services/api";

function ChannelAudit() {
  const [isStarting, setIsStarting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [selectedAuditUUID, setSelectedAuditUUID] = useState(() =>
    localStorage.getItem("lastAuditUUID")
  );
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", title: "", message: "" });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(Date.now());
  const [selectedTab, setSelectedTab] = useState(0);

  const pollIntervalRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const pollStatus = useCallback(async (uuid) => {
    if (!uuid) return;
    try {
      const data = await getChannelAuditStatus(uuid);
      if (data && !data.is_running) {
        setIsPolling(false);
        setAuditData(data);
        clearInterval(pollIntervalRef.current);
        setHistoryRefreshKey(Date.now());
      } else if (data) {
        setAuditData(data);
      }
    } catch (error) {
      setIsPolling(false);
      clearInterval(pollIntervalRef.current);
      console.error("Polling failed:", error);
    }
  }, []);

  // ----- بداية الجزء المعدّل -----
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (!selectedAuditUUID) {
      setAuditData(null);
      setIsPolling(false);
      return;
    }

    let initialFetchAttempt = 0;
    const MAX_INITIAL_FETCH_ATTEMPTS = 5; // سنحاول 5 مرات كحد أقصى
    const INITIAL_FETCH_DELAY = 1500; // 1.5 ثانية بين كل محاولة

    const fetchInitialStatus = async () => {
      // لا نضع setIsPolling(true) هنا إلا عند أول محاولة
      if (initialFetchAttempt === 0) {
        setIsPolling(true);
      }
      initialFetchAttempt++;

      try {
        const data = await getChannelAuditStatus(selectedAuditUUID);

        if (data) {
          // وجدنا البيانات بنجاح
          setAuditData(data);
          if (data.is_running) {
            // إذا كانت لا تزال تعمل، نبدأ الاستعلام الدوري العادي
            pollIntervalRef.current = setInterval(() => pollStatus(selectedAuditUUID), 5000);
          } else {
            // إذا كانت مكتملة، نوقف التحميل
            setIsPolling(false);
          }
        } else if (initialFetchAttempt < MAX_INITIAL_FETCH_ATTEMPTS) {
          // لم نجد البيانات، ولكننا لم نصل إلى الحد الأقصى للمحاولات
          // ننتظر قليلاً ثم نحاول مرة أخرى
          setTimeout(fetchInitialStatus, INITIAL_FETCH_DELAY);
        } else {
          // لم نجد البيانات بعد عدة محاولات، نفترض وجود خطأ
          console.error("Failed to fetch initial status after multiple attempts.");
          localStorage.removeItem("lastAuditUUID");
          setSelectedAuditUUID(null);
          setIsPolling(false);
        }
      } catch (error) {
        // إذا كان الخطأ 404، فقد يكون بسبب التأخير، لذا نحاول مرة أخرى
        if (error.response?.status === 404 && initialFetchAttempt < MAX_INITIAL_FETCH_ATTEMPTS) {
          console.warn(`Attempt ${initialFetchAttempt}: Audit not found yet, retrying...`);
          setTimeout(fetchInitialStatus, INITIAL_FETCH_DELAY);
        } else {
          // خطأ حقيقي أو وصلنا للحد الأقصى للمحاولات
          console.error("Failed to fetch initial audit status:", error);
          localStorage.removeItem("lastAuditUUID");
          setSelectedAuditUUID(null);
          setIsPolling(false);
        }
      }
    };

    fetchInitialStatus();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedAuditUUID, pollStatus]);
  // ----- نهاية الجزء المعدّل -----

  const handleStartAudit = async () => {
    setIsStarting(true);
    setAuditData(null); // مسح البيانات القديمة فوراً
    try {
      const response = await startChannelAudit();
      const newAuditUUID = response.audit_uuid;
      localStorage.setItem("lastAuditUUID", newAuditUUID);
      setSelectedAuditUUID(newAuditUUID); // هذا سيُفعّل الـ useEffect الجديد
      setSnackbar({
        open: true,
        color: "info",
        title: "بدأت عملية الفحص",
        message: "جاري فحص القنوات. سيتم تحديث السجل تلقائياً.",
      });
      setHistoryRefreshKey(Date.now());
      setSelectedTab(0);
    } catch (error) {
      setSnackbar({
        open: true,
        color: "error",
        title: "خطأ",
        message: "فشل في بدء عملية الفحص.",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectAuditFromHistory = (uuid) => {
    localStorage.setItem("lastAuditUUID", uuid);
    setSelectedAuditUUID(uuid);
    setSelectedTab(0);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* بطاقة التحكم الرئيسية */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6">إدارة فحص القنوات</MDTypography>
                  <MDTypography variant="body2" color="text">
                    قم بفحص قنواتك للعثور على الأعضاء الذين ليس لديهم اشتراك نشط, قد تستغرق عمليه
                    الفحص بعض الوقت
                  </MDTypography>
                </MDBox>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={handleStartAudit}
                  disabled={isStarting || isPolling}
                  startIcon={<Icon>rocket_launch</Icon>}
                >
                  {isStarting ? "جاري البدء..." : isPolling ? "فحص قيد التشغيل..." : "بدء فحص جديد"}
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <AppBar position="static">
                <Tabs value={selectedTab} onChange={handleTabChange}>
                  <Tab label="حالة الفحص" icon={<Icon>monitor_heart</Icon>} iconPosition="start" />
                  <Tab label="سجل العمليات" icon={<Icon>history</Icon>} iconPosition="start" />
                </Tabs>
              </AppBar>
              <MDBox p={2}>
                {/* محتوى تبويب حالة الفحص */}
                {selectedTab === 0 && (
                  <MDBox>
                    {isPolling && !auditData && (
                      <MDBox textAlign="center" p={3}>
                        <CircularProgress color="info" />
                        <MDTypography variant="h6" mt={2}>
                          جاري تحميل تفاصيل الفحص المحدد...
                        </MDTypography>
                      </MDBox>
                    )}
                    {/* ملاحظة: تم استخدام 'results' هنا لتتوافق مع مكون AuditResultsTable */}
                    {auditData?.channel_results && (
                      <AuditResultsDataTable auditData={auditData} setSnackbar={setSnackbar} />
                    )}
                    {!isPolling && !auditData && (
                      <MDTypography variant="h6" color="text" textAlign="center" p={3}>
                        لم يتم تحديد أي فحص. ابدأ فحصاً جديداً أو اختر واحداً من السجل.
                      </MDTypography>
                    )}
                  </MDBox>
                )}

                {/* محتوى تبويب سجل العمليات */}
                {selectedTab === 1 && (
                  <AuditHistoryTable
                    onSelectAudit={handleSelectAuditFromHistory}
                    refreshKey={historyRefreshKey}
                    selectedAuditUUID={selectedAuditUUID}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={snackbar.title}
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
      />
    </DashboardLayout>
  );
}

export default ChannelAudit;
