import React, { useState, useEffect, useCallback } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import Card from "@mui/material/Card"; // استيراد Card
import Grid from "@mui/material/Grid"; // للاستخدام المحتمل داخل البطاقة
import CircularProgress from "@mui/material/CircularProgress"; // لمؤشر التحميل
import { getWalletAddress, updateWalletAddress } from "services/api";

function WalletSettingsSection() {
  const [walletData, setWalletData] = useState({
    walletAddress: "",
    apiKey: "", // سنستخدم هذا لتتبع ما إذا كان المفتاح موجودًا أم لا
  });
  const [inputApiKey, setInputApiKey] = useState(""); // حقل إدخال منفصل لمفتاح API الجديد
  const [loading, setLoading] = useState(true); // حالة التحميل الأولية
  const [updating, setUpdating] = useState(false); // حالة التحديث (الحفظ)
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const openSuccessSB = useCallback((message) => {
    setSnackbarMessage(message);
    setSuccessSB(true);
  }, []);

  const openErrorSB = useCallback((message) => {
    setSnackbarMessage(message);
    setErrorSB(true);
  }, []);

  const closeSuccessSB = () => setSuccessSB(false);
  const closeErrorSB = () => setErrorSB(false);

  useEffect(() => {
    setLoading(true);
    getWalletAddress()
      .then((res) => {
        setWalletData({
          walletAddress: res.data.wallet_address || "",
          apiKey: res.data.api_key ? "********" : "", // عرض نجوم إذا كان المفتاح موجودًا
        });
        setInputApiKey(""); // مسح حقل الإدخال عند جلب البيانات
      })
      .catch((error) => {
        console.error("Error fetching wallet data:", error);
        openErrorSB(error.response?.data?.error || "فشل في جلب بيانات المحفظة.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [openErrorSB]); // openErrorSB مضمونة بواسطة useCallback

  const handleSave = () => {
    if (successSB) setSuccessSB(false);
    if (errorSB) setErrorSB(false);
    setUpdating(true);

    const payload = {
      wallet_address: walletData.walletAddress,
      // أرسل مفتاح API الجديد فقط إذا تم إدخاله، وإلا لا ترسله (ليبقى القديم)
      // أو يمكنك أن تقرر إرسال قيمة فارغة لمسح المفتاح إذا كان inputApiKey فارغًا
      ...(inputApiKey && { api_key: inputApiKey }),
    };

    updateWalletAddress(payload)
      .then((res) => {
        openSuccessSB(res.data?.message || "تم حفظ البيانات بنجاح");
        // تحديث الحالة المحلية بعد الحفظ الناجح إذا لزم الأمر
        if (inputApiKey) {
          setWalletData((prev) => ({ ...prev, apiKey: "********" })); // عرض نجوم مرة أخرى
          setInputApiKey(""); // مسح حقل الإدخال
        }
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        openErrorSB(error.response?.data?.error || "حدث خطأ أثناء حفظ البيانات");
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const handleChange = (field) => (e) => {
    setWalletData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  if (loading && !errorSB) {
    // لا تعرض شاشة التحميل إذا كان هناك خطأ بالفعل
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
          جارِ تحميل إعدادات المحفظة...
        </MDTypography>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          إعدادات المحفظة والأمان
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={3}>
          قم بإدارة عنوان محفظتك (TON) ومفتاح API الخاص بخدمة DeepSeek.
        </MDTypography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDTypography variant="subtitle2" fontWeight="regular" color="textSecondary" mb={1}>
              عنوان المحفظة (TON Blockchain)
            </MDTypography>
            <MDInput
              type="text"
              label="عنوان المحفظة"
              fullWidth
              value={walletData.walletAddress}
              onChange={handleChange("walletAddress")}
              placeholder="أدخل عنوان محفظة TON الخاصة بك"
            />
          </Grid>

          <Grid item xs={12}>
            <MDTypography variant="subtitle2" fontWeight="regular" color="textSecondary" mb={1}>
              مفتاح API لـ DeepSeek
            </MDTypography>
            <MDInput
              type="password"
              label="مفتاح API"
              fullWidth
              value={walletData.apiKey}
              onChange={handleChange("apiKey")}
              placeholder={
                walletData.apiKey
                  ? "أدخل مفتاحًا جديدًا لتغييره (اتركه فارغًا للإبقاء على الحالي)"
                  : "أدخل مفتاح API"
              }
              inputProps={{
                autoComplete: "new-password",
              }}
            />
            {walletData.apiKey && (
              <MDTypography variant="caption" color="textSecondary" mt={0.5} display="block">
                مفتاح API الحالي مُخزن.
              </MDTypography>
            )}
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
          content={snackbarMessage}
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
          content={snackbarMessage}
          dateTime="الآن"
          open={errorSB}
          onClose={closeErrorSB} // استخدام onClose
          bgWhite
        />
      )}
    </Card>
  );
}

export default WalletSettingsSection;
