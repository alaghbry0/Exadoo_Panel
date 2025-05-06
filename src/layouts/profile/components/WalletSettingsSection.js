import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { getWalletAddress, updateWalletAddress } from "services/api";

function WalletSettingsSection() {
  const [walletData, setWalletData] = useState({
    walletAddress: "",
    apiKey: "",
  });
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);

  useEffect(() => {
    getWalletAddress()
      .then((res) => {
        setWalletData({
          walletAddress: res.data.wallet_address || "",
          apiKey: res.data.api_key || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching wallet data:", error);
        setErrorSB(true);
      });
  }, []);

  const handleSave = () => {
    updateWalletAddress({
      wallet_address: walletData.walletAddress,
      api_key: walletData.apiKey,
    })
      .then((res) => {
        setSuccessSB(true);
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        setErrorSB(true);
      });
  };

  const handleChange = (field) => (e) => {
    setWalletData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="نجاح"
      content="تم حفظ البيانات بنجاح"
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
      content="حدث خطأ أثناء حفظ البيانات"
      open={errorSB}
      onClose={() => setErrorSB(false)}
      bgWhite
    />
  );

  return (
    <MDBox p={2} mt={4}>
      <MDTypography variant="h6" fontWeight="medium" mb={2}>
        إعدادات الأمان
      </MDTypography>

      <MDBox mb={4}>
        <MDTypography variant="body2" color="text" mb={2}>
          إعدادات المحفظة
        </MDTypography>
        <MDInput
          type="text"
          label="عنوان المحفظة (TON)"
          fullWidth
          value={walletData.walletAddress}
          onChange={handleChange("walletAddress")}
          sx={{ mb: 2 }}
        />

        <MDInput
          type="text"
          label="DEEPSEEK API"
          fullWidth
          value={walletData.apiKey ? `••••${walletData.apiKey.slice(-4)}` : ""}
          onChange={handleChange("apiKey")}
          inputProps={{
            autoComplete: "new-password",
          }}
        />
      </MDBox>

      <MDBox mt={3} display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="info" onClick={handleSave}>
          حفظ الإعدادات
        </MDButton>
      </MDBox>

      {renderSuccessSB}
      {renderErrorSB}
    </MDBox>
  );
}

export default WalletSettingsSection;
