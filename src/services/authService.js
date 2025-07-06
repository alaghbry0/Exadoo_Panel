// src/services/authService.js

import { apiClient } from "./apiClient";

// حفظ بيانات المصادقة في localStorage
export const saveAuthData = (token, role) => {
  localStorage.setItem("access_token", token);
  if (role) {
    localStorage.setItem("role", role);
  }
};

export const getAuthToken = () => localStorage.getItem("access_token");

// تسجيل الدخول
export const loginWithGoogle = async (idToken) => {
  // نستخدم apiClient لأنه الطلب الأول، لن يحتاج إلى interceptor
  const response = await apiClient.post("/api/auth/login", { id_token: idToken });
  const { access_token, role } = response.data;
  if (access_token) {
    saveAuthData(access_token, role);
  }
  return response.data;
};

// طلب تجديد التوكن
export const refreshAuthToken = async () => {
  try {
    const response = await apiClient.post("/api/auth/refresh", {});
    const newAccessToken = response.data.access_token;
    localStorage.setItem("access_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // 💡 الأهم: نطرح الخطأ ليتمكن الـ interceptor من التقاطه واتخاذ الإجراء
    throw error;
  }
};

// تسجيل الخروج
export const logout = async () => {
  try {
    // محاولة إبلاغ الخادم بحذف الكوكي
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    console.error("Server logout failed, cleaning up client-side.", error);
  } finally {
    // التنظيف المحلي يحدث دائمًا، سواء نجح طلب الخادم أم لا
    console.log("Cleaning up local storage and dispatching auth-expired event."); // للتأكد من التنفيذ
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    delete apiClient.defaults.headers.common["Authorization"];

    // ✅✅ التعديل الرئيسي: أطلق حدثًا بدلاً من إعادة التوجيه مباشرة
    window.dispatchEvent(new Event("auth-expired"));
  }
};
