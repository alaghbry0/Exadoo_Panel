// src/layouts/profile/components/ReminderSettingsSection.js
import React, { useState, useEffect, useCallback } from "react";
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
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip"; // استيراد Tooltip

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
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // useCallback يحسن الأداء بمنع إعادة إنشاء الدوال في كل render إلا عند تغيير الاعتماديات
  const openSuccessSB = useCallback((message) => {
    setFeedbackMessage(message);
    setSuccessSB(true);
  }, []);

  const openErrorSB = useCallback((message) => {
    setFeedbackMessage(message);
    setErrorSB(true);
  }, []);

  const closeSuccessSB = () => setSuccessSB(false);
  const closeErrorSB = () => setErrorSB(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setErrorSB(false); // أغلق أي خطأ سابق عند محاولة التحميل
      try {
        const response = await fetchReminderSettings();
        if (response.data) {
          setSettings({
            first_reminder: response.data.first_reminder_hours ?? 24,
            second_reminder: response.data.second_reminder_hours ?? 72,
            first_reminder_message:
              response.data.first_reminder_message ||
              "📢 تنبيه: اشتراكك سينتهي في {expiry_date} بتوقيت الرياض. يرجى التجديد.",
            second_reminder_message:
              response.data.second_reminder_message ||
              "⏳ تبقى {remaining_hours} ساعة على انتهاء اشتراكك. لا تنسَ التجديد!",
          });
        }
      } catch (error) {
        console.error("Error loading reminder settings:", error);
        const message = error.response?.data?.error || "فشل في تحميل إعدادات التذكير";
        openErrorSB(message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [openErrorSB]); // openErrorSB مضمونة بواسطة useCallback

  const handleSave = async () => {
    if (successSB) setSuccessSB(false);
    if (errorSB) setErrorSB(false);
    setUpdating(true);
    try {
      await updateReminderSettings({
        first_reminder_hours: parseInt(settings.first_reminder, 10),
        second_reminder_hours: parseInt(settings.second_reminder, 10),
        first_reminder_message: settings.first_reminder_message,
        second_reminder_message: settings.second_reminder_message,
      });
      openSuccessSB("تم تحديث إعدادات التذكير بنجاح");
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      const message = error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات";
      openErrorSB(message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !errorSB) {
    return (
      <Card
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
        <MDTypography variant="body1" color="textSecondary" ml={2}>
          جارِ تحميل إعدادات التذكيرات...
        </MDTypography>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={1}>
          إعدادات تذكيرات انتهاء الاشتراك
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={3}>
          قم بتحديد أوقات إرسال رسائل التذكير الآلية ومحتواها للمشتركين قبل انتهاء صلاحية
          اشتراكاتهم.
        </MDTypography>

        <Divider sx={{ my: 2 }} />

        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          توقيتات إرسال التذكيرات
        </MDTypography>

        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="التذكير الأول (ساعة قبل الانتهاء)"
                fullWidth
                value={settings.first_reminder}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    first_reminder: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
                InputProps={{ inputProps: { min: 1 } }}
                helperText="سيتم إرسال التذكير الأول قبل هذا العدد من الساعات."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="التذكير الثاني (ساعة قبل الانتهاء)"
                fullWidth
                value={settings.second_reminder}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    second_reminder: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
                InputProps={{ inputProps: { min: 1 } }}
                helperText="سيتم إرسال التذكير الثاني قبل هذا العدد من الساعات."
              />
            </Grid>
          </Grid>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          محتوى رسائل التذكير
        </MDTypography>
        <Tooltip title="استخدم هذه المتغيرات ليتم استبدالها تلقائيًا في الرسالة. مثال: {user_name} سيتم استبداله باسم المستخدم.">
          <MDBox
            mb={2}
            display="flex"
            alignItems="center"
            p={1.5}
            borderRadius="md"
            sx={{ backgroundColor: "grey.100", cursor: "help" }}
          >
            <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
            <MDTypography variant="caption" color="text">
              المتغيرات المتاحة: <code>{`{expiry_date}`}</code>, <code>{`{remaining_hours}`}</code>,{" "}
              <code>{`{user_name}`}</code>, <code>{`{site_name}`}</code>.
            </MDTypography>
          </MDBox>
        </Tooltip>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MDTypography variant="subtitle2" fontWeight="regular" mb={1} color="text">
              نص رسالة التذكير الأول:
            </MDTypography>
            <MDInput
              type="text"
              label="رسالة التذكير الأول"
              fullWidth
              multiline
              rows={4}
              value={settings.first_reminder_message}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  first_reminder_message: e.target.value,
                }))
              }
              placeholder="مثال: عزيزي {user_name}، نود تذكيرك بأن اشتراكك سينتهي بتاريخ {expiry_date}."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="subtitle2" fontWeight="regular" mb={1} color="text">
              نص رسالة التذكير الثاني:
            </MDTypography>
            <MDInput
              type="text"
              label="رسالة التذكير الثاني"
              fullWidth
              multiline
              rows={4}
              value={settings.second_reminder_message}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  second_reminder_message: e.target.value,
                }))
              }
              placeholder="مثال: تبقى {remaining_hours} ساعة على انتهاء اشتراكك. سارع بالتجديد الآن!"
            />
          </Grid>
        </Grid>

        <MDBox mt={4} display="flex" justifyContent="flex-end">
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleSave}
            disabled={updating || loading}
          >
            {updating && <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />}
            {updating ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </MDButton>
        </MDBox>
      </MDBox>

      {successSB && (
        <MDSnackbar
          color="success"
          icon="check"
          title="نجاح"
          content={feedbackMessage}
          dateTime="الآن"
          open={successSB}
          onClose={closeSuccessSB} // استخدام onClose
          bgWhite
        />
      )}
      {errorSB && (
        <MDSnackbar
          color="error"
          icon="warning"
          title="خطأ"
          content={feedbackMessage}
          dateTime="الآن"
          open={errorSB}
          onClose={closeErrorSB} // استخدام onClose
          bgWhite
        />
      )}
    </Card>
  );
}

export default ReminderSettingsSection;
