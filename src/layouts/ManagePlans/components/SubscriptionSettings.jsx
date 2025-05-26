// src/layouts/ManagePlans/components/SubscriptionSettings.jsx
import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// import Grid from "@mui/material/Grid"; // لم يعد مستخدماً إذا أزلنا كل شيء
// import TermsConditionsSettings from "./TermsConditionsSettings"; // تمت إزالته

function SubscriptionSettings() {
  // بما أن TermsConditionsSettings تمت إدارتها ضمن كل نوع اشتراك،
  // هذا القسم يمكن أن يظل فارغًا حاليًا أو يستخدم لإعدادات نظام أخرى عامة مستقبلًا.

  // إذا لم تكن هناك إعدادات أخرى مخطط لها قريبًا، يمكنك إزالة هذا المكون بالكامل
  // وإزالة استدعائه من ManagePlans/index.js.

  // مثال على كيفية تركه فارغًا مؤقتًا:
  return (
    <MDBox>
      <MDTypography variant="h5" fontWeight="bold" mb={3}>
        System Settings
      </MDTypography>
      <MDTypography variant="body2" color="text.secondary">
        Currently, there are no general system settings to configure here. Subscription type
        specific settings, including terms and conditions, are managed within each subscription type
        card.
      </MDTypography>
      {/*
      <Grid container spacing={3}>
        <Grid item xs={12}>
          // <TermsConditionsSettings /> //  تمت إزالته
        </Grid>
        // Additional settings can be added here as needed
      </Grid>
      */}
    </MDBox>
  );
}

export default SubscriptionSettings;
