// src/services/setupInterceptors.js

import { apiClient } from "./apiClient";
import { getAuthToken, refreshAuthToken, logout } from "./authService";

let refreshTokenPromise = null;

const setupAxiosInterceptors = () => {
  // معترض الطلبات: لإضافة الـ Access Token لكل طلب صادر
  apiClient.interceptors.request.use(
    (config) => {
      // ✅✅ الحل النهائي والمحوري ✅✅
      // لا تقم بإضافة هيدر الـ Authorization إذا كان الطلب موجهًا لمسار التجديد
      if (config.url.endsWith("/api/auth/refresh")) {
        return config;
      }

      const token = getAuthToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // معترض الاستجابات: يبقى كما هو من النسخة القوية السابقة
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAuthToken().finally(() => {
            refreshTokenPromise = null;
          });
        }

        try {
          const newAccessToken = await refreshTokenPromise;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          await logout(); // تأكد من استدعاء logout إذا فشل التجديد
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
