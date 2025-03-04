import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { getWalletAddress, updateWalletAddress } from "services/api";

function WalletSettingsSection() {
  const [walletAddress, setWalletAddress] = useState("");
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);

  // دوال فتح وغلق الإشعارات
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  // جلب العنوان عند تحميل المكون
  useEffect(() => {
    getWalletAddress()
      .then((res) => {
        setWalletAddress(res.data.wallet_address);
      })
      .catch((error) => {
        console.error("Error fetching wallet address:", error);
        openErrorSB(); // إظهار إشعار الخطأ عند حدوث مشكلة
      });
  }, []);

  const handleSaveWalletAddress = () => {
    updateWalletAddress(walletAddress)
      .then((res) => {
        openSuccessSB(); // إظهار إشعار النجاح عند حفظ العنوان
      })
      .catch((error) => {
        console.error("Error updating wallet address:", error);
        openErrorSB(); // إظهار إشعار الخطأ عند حدوث مشكلة
      });
  };

  // تعريف عناصر الإشعارات
  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="نجاح"
      content="تم حفظ عنوان المحفظة بنجاح"
      dateTime=""
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="خطأ"
      content="حدث خطأ أثناء حفظ عنوان المحفظة"
      dateTime=""
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  return (
    <MDBox p={2} mt={4}>
      <MDTypography variant="h6" fontWeight="medium" mb={2}>
        Wallet Settings
      </MDTypography>
      <MDBox mb={3}>
        <MDTypography variant="body2" color="text">
          Please enter your TON Wallet address to receive payments.
        </MDTypography>
      </MDBox>
      <MDBox mb={3}>
        <MDInput
          type="text"
          label="TON Wallet Address"
          fullWidth
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
      </MDBox>
      <MDBox mt={3} display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="info" onClick={handleSaveWalletAddress}>
          Save Wallet Address
        </MDButton>
      </MDBox>
      {/* عرض الإشعارات */}
      {renderSuccessSB}
      {renderErrorSB}
    </MDBox>
  );
}

export default WalletSettingsSection;
