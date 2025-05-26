// src/layouts/admin/AdminPanel.js (أو مسار مشابه لصفحتك الرئيسية)
import React, { useState } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// تأكد من أن مسار Header صحيح
import Header from "layouts/profile/components/Header";

// استيراد الأقسام
// تأكد من صحة المسارات بناءً على هيكل مشروعك
// هذه المكونات يجب أن تكون قد طُورت كما نوقش سابقاً
import UserManagementSection from "./components/UserManagementSection"; // افترض وجوده في ./components/
import RoleManagementSection from "./components/RoleManagementSection"; // افترض وجوده في ./components/
import AuditLogSection from "./components/AuditLogSection"; // افترض وجوده في ./components/
import SystemSettingsSection from "./components/SystemSettingsSection"; // افترض وجوده في ./components/

function AdminPanel() {
  // التبويب الافتراضي هو "إدارة المستخدمين"
  const [activeTab, setActiveTab] = useState("userManagement");

  const renderActiveSection = () => {
    switch (activeTab) {
      case "userManagement":
        return <UserManagementSection />;
      case "roleManagement":
        return <RoleManagementSection />;
      case "auditLog":
        return <AuditLogSection />;
      case "systemSettings":
        return <SystemSettingsSection />;
      default:
        // كإجراء احتياطي، اعرض قسم إدارة المستخدمين
        return <UserManagementSection />;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* <MDBox mb={2} />  يمكن إزالة هذا إذا لم يكن هناك محتوى بين Navbar و Header */}
      <Header setActiveTab={setActiveTab} />
      <MDBox mt={3}>
        {" "}
        {/* أضفت mt هنا لبعض التباعد بين Header والمحتوى */}
        {renderActiveSection()}
      </MDBox>
    </DashboardLayout>
  );
}

export default AdminPanel;
