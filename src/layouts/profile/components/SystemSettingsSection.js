// src/layouts/admin/components/SystemSettingsSection.js (أو مسار مشابه)
import React from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card"; // قد تحتاج لاستيراده هنا إذا قررت تغليف الأقسام من الخارج

// استيراد أقسام الإعدادات
import WalletSettingsSection from "layouts/profile/components/WalletSettingsSection";
import ReminderSettingsSection from "layouts/profile/components/ReminderSettingsSection";

function SystemSettingsSection() {
  return (
    <MDBox pt={2} pb={3}>
      <MDTypography variant="h5" fontWeight="medium" mb={3} textAlign="center">
        إعدادات النظام والتطبيق
      </MDTypography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* WalletSettingsSection يجب أن يعرض محتواه داخل Card */}
          <WalletSettingsSection />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* ReminderSettingsSection بالفعل يعرض محتواه داخل Card */}
          <ReminderSettingsSection />
        </Grid>
        {/* يمكنك إضافة المزيد من مكونات الإعدادات هنا داخل Grid items جديدة */}
        {/* مثال لقسم إضافي، يمكن أن يكون داخل Card أيضًا */}
        {/*
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6">قسم إعدادات آخر</MDTypography>
              // ... محتوى القسم ...
            </MDBox>
          </Card>
        </Grid>
        */}
      </Grid>
    </MDBox>
  );
}

export default SystemSettingsSection;
