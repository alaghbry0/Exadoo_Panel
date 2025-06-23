// src/layouts/broadcasts/index.js

import { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card"; // <--- تصحيح: استيراد Card من @mui/material
import CircularProgress from "@mui/material/CircularProgress"; // <--- تصحيح: استيراد مؤشر التحميل الصحيح

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Broadcasts page components
import BroadcastComposer from "layouts/broadcasts/components/BroadcastComposer";
import BroadcastHistory from "layouts/broadcasts/components/BroadcastHistory";

// API calls
import { getTargetGroups, getAvailableVariables } from "services/api";

function Broadcasts() {
  const [loading, setLoading] = useState(true);
  const [composerData, setComposerData] = useState({ targetGroups: null, variables: null });
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", title: "", message: "" });

  // سنعيد استخدام خدعة الـ key لأنها تجعل المكونات أكثر استقلالية
  // BroadcastHistory سيظل مسؤولاً عن جلب بياناته، وهذا أفضل لفصل الاهتمامات
  const [historyKey, setHistoryKey] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsData, variablesData] = await Promise.all([
          getTargetGroups(),
          getAvailableVariables(),
        ]);
        setComposerData({
          targetGroups: groupsData,
          variables: variablesData,
        });
      } catch (error) {
        setSnackbar({
          open: true,
          color: "error",
          title: "خطأ في جلب البيانات",
          message: "فشل تحميل بيانات الاستهداف والمتغيرات الأولية.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBroadcastSent = useCallback(() => {
    setSnackbar({
      open: true,
      color: "success",
      title: "تم بنجاح",
      message: "بدأت مهمة الإرسال. سيتم تحديث السجل تلقائياً عند اكتمال جلب البيانات.",
    });
    // تحديث السجل عن طريق تغيير الـ key، مما يجبر React على إعادة تحميل مكون السجل بالكامل وجلب أحدث البيانات
    setHistoryKey(Date.now());
  }, []);

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const renderContent = () => {
    if (loading) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress color="info" />
        </MDBox>
      );
    }

    return (
      // تحسين التخطيط: استخدام التخطيط المكدس ليعطي مساحة أكبر ويكون أفضل على كل الشاشات
      <Grid container spacing={3}>
        {/* محرر الرسائل */}
        <Grid item xs={12}>
          <BroadcastComposer
            data={composerData}
            onBroadcastSent={handleBroadcastSent}
            setSnackbar={setSnackbar}
          />
        </Grid>

        {/* سجل البث */}
        <Grid item xs={12}>
          {/* نستخدم Card هنا لتغليف السجل لمظهر أفضل */}
          <Card>
            <BroadcastHistory key={historyKey} setSnackbar={setSnackbar} />
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            رسائل البث التسويقية
          </MDTypography>
          <MDTypography variant="button" color="text">
            أرسل رسائل مخصصة لمجموعات المستخدمين وتتبع سجل الإرسال.
          </MDTypography>
        </MDBox>

        {renderContent()}
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

export default Broadcasts;
