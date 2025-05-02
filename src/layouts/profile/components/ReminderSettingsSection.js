import React, { useState, useEffect } from "react";
import { fetchReminderSettings, updateReminderSettings } from "services/api";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";

function ReminderSettingsSection() {
  const [settings, setSettings] = useState({
    first_reminder: 24,
    second_reminder: 72,
    first_reminder_message:
      "📢 تنبيه: اشتراكك سينتهي في {expiry_date} بتوقيت الرياض. يرجى التجديد.",
    second_reminder_message: "⏳ تبقى {remaining_hours} ساعة على انتهاء اشتراكك. لا تنسَ التجديد!",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetchReminderSettings();
        if (response.data) {
          setSettings({
            first_reminder: response.data.first_reminder,
            second_reminder: response.data.second_reminder,
            first_reminder_message:
              response.data.first_reminder_message ||
              "📢 تنبيه: اشتراكك سينتهي في {expiry_date} بتوقيت الرياض. يرجى التجديد.",
            second_reminder_message:
              response.data.second_reminder_message ||
              "⏳ تبقى {remaining_hours} ساعة على انتهاء اشتراكك. لا تنسَ التجديد!",
          });
        }
      } catch (error) {
        setErrorMessage("فشل في تحميل الإعدادات");
        setErrorSB(true);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setUpdating(true);
      await updateReminderSettings({
        first_reminder: settings.first_reminder,
        second_reminder: settings.second_reminder,
        first_reminder_message: settings.first_reminder_message,
        second_reminder_message: settings.second_reminder_message,
      });
      setSuccessSB(true);
    } catch (error) {
      const message = error.response?.data?.error || "حدث خطأ أثناء الحفظ";
      setErrorMessage(message);
      setErrorSB(true);
    } finally {
      setUpdating(false);
    }
  };

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="نجاح"
      content="تم تحديث الإعدادات بنجاح"
      open={successSB}
      onClose={() => setSuccessSB(false)}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="خطأ"
      content={errorMessage}
      open={errorSB}
      onClose={() => setErrorSB(false)}
      bgWhite
    />
  );

  if (loading) {
    return (
      <MDBox display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </MDBox>
    );
  }

  return (
    <MDBox p={2} mt={4}>
      <MDTypography variant="h6" fontWeight="medium" mb={2}>
        إعدادات التذكيرات
      </MDTypography>

      <MDBox mb={3}>
        <MDTypography variant="body2" color="text">
          قم بتحديد وقت إرسال التذكيرات ونص الرسائل قبل انتهاء الاشتراك
        </MDTypography>
      </MDBox>

      <Card sx={{ p: 3, mb: 4 }}>
        <MDTypography variant="subtitle1" fontWeight="medium" mb={2}>
          أوقات التذكير
        </MDTypography>

        <MDBox component="form" role="form">
          <MDBox mb={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="التذكير الأول (ساعات)"
                  fullWidth
                  value={settings.first_reminder}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      first_reminder: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" color="text">
                  ساعة قبل انتهاء الاشتراك
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>

          <MDBox mb={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="التذكير الثاني (ساعات)"
                  fullWidth
                  value={settings.second_reminder}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      second_reminder: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" color="text">
                  ساعة قبل انتهاء الاشتراك
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
      </Card>

      <Card sx={{ p: 3 }}>
        <MDTypography variant="subtitle1" fontWeight="medium" mb={2}>
          نص رسائل التذكير
        </MDTypography>

        <MDBox mb={1} display="flex" alignItems="center">
          <MDTypography variant="body2" color="text" mr={1}>
            المتغيرات المتاحة:
          </MDTypography>
          <Tooltip title="يمكنك استخدام {expiry_date} في رسالة التذكير الأولى و {remaining_hours} في رسالة التذكير الثانية">
            <InfoIcon fontSize="small" color="info" />
          </Tooltip>
        </MDBox>

        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="light" mb={1} color="text">
            {"التذكير الأول: استخدم {expiry_date} لعرض تاريخ انتهاء الاشتراك"}
          </MDTypography>
          <MDInput
            type="text"
            label="نص رسالة التذكير الأول"
            fullWidth
            multiline
            rows={3}
            value={settings.first_reminder_message}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                first_reminder_message: e.target.value,
              }))
            }
          />
        </MDBox>

        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="light" mb={1} color="text">
            {"التذكير الثاني: استخدم {remaining_hours} لعرض الساعات المتبقية"}
          </MDTypography>
          <MDInput
            type="text"
            label="نص رسالة التذكير الثاني"
            fullWidth
            multiline
            rows={3}
            value={settings.second_reminder_message}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                second_reminder_message: e.target.value,
              }))
            }
          />
        </MDBox>

        <Divider sx={{ my: 2 }} />

        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton variant="gradient" color="info" onClick={handleSave} disabled={updating}>
            {updating ? <CircularProgress size={24} color="inherit" /> : "حفظ الإعدادات"}
          </MDButton>
        </MDBox>
      </Card>

      {renderSuccessSB}
      {renderErrorSB}
    </MDBox>
  );
}

export default ReminderSettingsSection;
