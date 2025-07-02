import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, refreshAuthToken, removeAuthToken } from "services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // يمكنك تخزين بيانات المستخدم هنا
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = getAuthToken();
      if (token) {
        setUser({ token });
      } else {
        const newToken = await refreshAuthToken();
        if (newToken) {
          setUser({ token: newToken });
        } else {
          removeAuthToken();
          navigate("/authentication/sign-in");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};
