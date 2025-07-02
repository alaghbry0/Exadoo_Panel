// src/layouts/authentication/sign-in/index.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import MDBox from "components/MDBox";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// ✅ تعديل: لم نعد بحاجة لاستيراد setAuthToken هنا
import { loginWithGoogle } from "services/authService";

// تأكد من أن هذا المعرف صحيح وموجود في متغيرات البيئة في التطبيق الحقيقي
const CLIENT_ID = "827694711515-5k71g9mv8qr4i6ml557pipo27tm6t51f.apps.googleusercontent.com";

function Basic() {
  const navigate = useNavigate();

  /**
   * 💡 تحسين: نسخة جديدة ومبسطة من الدالة
   * هذه الدالة الآن مسؤولة فقط عن استدعاء خدمة المصادقة والتعامل مع النتيجة (النجاح أو الفشل).
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("✅ Google login success:", credentialResponse);
    try {
      // 1. استدعاء الخدمة التي ستقوم بكل شيء: إرسال الطلب، استلام التوكن، وحفظه.
      await loginWithGoogle(credentialResponse.credential);

      // 2. إذا نجح كل شيء بدون أخطاء، قم بتوجيه المستخدم إلى لوحة التحكم.
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error during Google login:", error);

      // 💡 تحسين: عرض رسالة خطأ أكثر فائدة من الخادم إن وجدت
      const errorMessage =
        error.response?.data?.message || "فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.";
      alert(errorMessage);
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
        >
          {/* يمكنك إضافة عنوان هنا مثل MDTypography */}
        </MDBox>
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
