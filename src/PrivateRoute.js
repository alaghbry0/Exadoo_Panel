import React from "react";
import { Navigate } from "react-router-dom";

// تحقق من وجود المستخدم
const isAuthenticated = () => {
  return !!localStorage.getItem("access_token"); // تحقق من وجود التوكن
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/authentication/sign-in" />;
};

export default PrivateRoute;
