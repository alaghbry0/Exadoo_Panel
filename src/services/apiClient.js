import axios from "axios";

// إنشاء نسخة axios واحدة مع الإعدادات الأساسية
// سيتم إضافة الـ interceptors إليها لاحقًا
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // ✅ حاسم: للسماح بإرسال واستقبال الكوكيز
});
