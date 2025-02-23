// src/layouts/managePlans/components/SubscriptionSettings.jsx

import React from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function SubscriptionSettings() {
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Subscription Settings
        </MDTypography>
        {/* هنا يمكنك إضافة عناصر تحكم لإدارة الإعدادات مثل أسعار الاشتراكات، إلخ */}
        <MDTypography variant="body2" color="text">
          (Settings and additional data related to subscription types can be managed here.)
        </MDTypography>
      </MDBox>
    </Card>
  );
}

export default SubscriptionSettings;
