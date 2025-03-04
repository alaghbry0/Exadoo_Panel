// layouts/profile/components/ReminderSettingsSection.js
import React, { useState } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";

function ReminderSettingsSection() {
  const [firstReminderHours, setFirstReminderHours] = useState(24); // قيمة افتراضية للتذكير الأول (24 ساعة)
  const [secondReminderHours, setSecondReminderHours] = useState(72); // قيمة افتراضية للتذكير الثاني (72 ساعة)

  const handleSaveReminderSettings = () => {
    // هنا يمكنك إضافة كود لحفظ إعدادات التذكيرات الجديدة
    // في الوقت الحالي، سنقوم فقط بتحديث الحالة محليًا وعرض رسالة تنبيه
    alert(
      `تم حفظ إعدادات التذكيرات الجديدة:\n- التذكير الأول: ${firstReminderHours} ساعة\n- التذكير الثاني: ${secondReminderHours} ساعة`
    );
  };

  return (
    <MDBox p={2} mt={4}>
      <MDTypography variant="h6" fontWeight="medium" mb={2}>
        Reminder Settings
      </MDTypography>
      <MDBox mb={3}>
        <MDTypography variant="body2" color="text">
          Configure the timing for sending reminder notifications to your clients.
        </MDTypography>
      </MDBox>
      <MDBox component="form" role="form">
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="First Reminder (Hours)"
                fullWidth
                value={firstReminderHours}
                onChange={(e) => setFirstReminderHours(parseInt(e.target.value, 10))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography variant="body2" color="text">
                hours before the event.
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="Second Reminder (Hours)"
                fullWidth
                value={secondReminderHours}
                onChange={(e) => setSecondReminderHours(parseInt(e.target.value, 10))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography variant="body2" color="text">
                hours before the event.
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton variant="gradient" color="info" onClick={handleSaveReminderSettings}>
            Save Settings
          </MDButton>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default ReminderSettingsSection;
