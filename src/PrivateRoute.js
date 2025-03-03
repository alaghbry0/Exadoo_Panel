import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const accessToken = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role"); // استخراج دور المستخدم من Local Storage

  // تحقق من تسجيل الدخول أولاً
  if (!accessToken) {
    return <Navigate to="/authentication/sign-in" />;
  }

  // التحقق من الدور في حال كان مطلوبًا
  if (requiredRole) {
    if (!userRole || userRole !== requiredRole) {
      alert("ليس لديك صلاحية الوصول إلى هذه الصفحة.");
      return <Navigate to="/dashboard" />;
    }
  }

  // إذا تم تسجيل الدخول ولديه الصلاحية (أو لا يوجد دور مطلوب)، اسمح بالوصول
  return children;
};

export default PrivateRoute;
