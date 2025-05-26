// src/layouts/profile/components/Header/index.js
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg"; // يمكنك تغيير هذه الصورة أو إزالتها إذا أردت

function Header({ setActiveTab }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0); // القيمة الافتراضية للتبويب الأول

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }
    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, []); // Removed tabsOrientation from dependency array as it's set inside

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    // بناءً على الترتيب الجديد للتبويبات
    if (newValue === 0) setActiveTab("userManagement");
    else if (newValue === 1) setActiveTab("roleManagement");
    else if (newValue === 2) setActiveTab("auditLog");
    else if (newValue === 3) setActiveTab("systemSettings");
  };

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="10rem" // تم تقليل الارتفاع قليلاً
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8, // لرفع البطاقة فوق الخلفية
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        {/* لم نعد بحاجة إلى Grid هنا لأننا أزلنا معلومات الملف الشخصي */}
        <AppBar position="static">
          <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
            <Tab
              label="إدارة المستخدمين"
              icon={
                <Icon fontSize="small" sx={{ mt: -0.25 }}>
                  group
                </Icon>
              }
            />
            <Tab
              label="إدارة الأدوار"
              icon={
                <Icon fontSize="small" sx={{ mt: -0.25 }}>
                  admin_panel_settings
                </Icon>
              }
            />
            <Tab
              label="سجل التدقيق"
              icon={
                <Icon fontSize="small" sx={{ mt: -0.25 }}>
                  history
                </Icon>
              }
            />
            <Tab
              label="إعدادات النظام"
              icon={
                <Icon fontSize="small" sx={{ mt: -0.25 }}>
                  settings
                </Icon>
              }
            />
          </Tabs>
        </AppBar>
      </Card>
    </MDBox>
  );
}

Header.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default Header;
