import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { getWalletAddress, updateWalletAddress } from "services/api";

function WalletSettingsSection() {
  const [walletAddress, setWalletAddress] = useState("");

  // جلب العنوان من الخادم عند تحميل المكون
  useEffect(() => {
    getWalletAddress()
      .then((res) => {
        setWalletAddress(res.data.wallet_address);
      })
      .catch((error) => {
        console.error("Error fetching wallet address:", error);
        // يمكنك تعيين قيمة افتراضية أو إظهار رسالة خطأ هنا
      });
  }, []);

  const handleSaveWalletAddress = () => {
    updateWalletAddress(walletAddress)
      .then((res) => {
        alert("تم حفظ عنوان المحفظة بنجاح");
      })
      .catch((error) => {
        console.error("Error updating wallet address:", error);
        alert("حدث خطأ أثناء حفظ عنوان المحفظة");
      });
  };

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
    </MDBox>
  );
}

export default WalletSettingsSection;
