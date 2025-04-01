import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import { loginWithGoogle, setAuthToken } from "services/api";

const CLIENT_ID = "827694711515-5k71g9mv8qr4i6ml557pipo27tm6t51f.apps.googleusercontent.com";

function Basic() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("✅ Google login success:", credentialResponse);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      console.log("✅ Server response:", res.data);
      // ✅ تم التعديل: نتوقع فقط access_token و role في الاستجابة
      const { access_token, role } = res.data;
      // ❌ تم الحذف: لم نعد نخزن refresh_token في Local Storage
      // localStorage.setItem("refresh_token", refresh_token);
      setAuthToken(access_token);
      // ✅ التعديل الهام: تخزين role المستخدم في Local Storage
      localStorage.setItem("role", role); // تخزين role المستخدم
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error during Google login:", error);
      alert("فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("❌ Google sign-in error:", error);
    alert("فشل تسجيل الدخول عبر Google. يرجى التحقق من الإعدادات.");
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BasicLayout image={bgImage}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        ></MDBox>
        <MDBox pt={4} pb={3} px={3} textAlign="center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            prompt="select_account"
            context="signin"
            is_fedcm_supported={false}
          />
        </MDBox>
      </BasicLayout>
    </GoogleOAuthProvider>
  );
}

export default Basic;
