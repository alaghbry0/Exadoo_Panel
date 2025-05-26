// src/layouts/admin-settings/AdminSettingsPage.js  (أو أي مسار تختاره)
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box as MUIBox, CircularProgress } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography"; // إذا كنت ستستخدمه للعناوين

// استيراد الأقسام
import UserManagementSection from "./components/UserManagementSection";
import RoleManagementSection from "./components/RoleManagementSection";
import AuditLogSection from "./components/AuditLogSection";
// import WalletSettingsSection from "layouts/profile/components/WalletSettingsSection"; // إذا قررت نقلها
// import ReminderSettingsSection from "layouts/profile/components/ReminderSettingsSection"; // إذا قررت نقلها

// استيراد للتحقق من صلاحيات المستخدم (مثال، قد تحتاج لتكييفه)
import { getMyPermissions } from "services/api";
// أو إذا كنت تستخدم User Context
// import { useUser } from "contexts/UserContext"; // مثال

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <MUIBox sx={{ pt: 0 }}>{children}</MUIBox>}{" "}
      {/* إزالة الـ padding من هنا */}
    </div>
  );
}

function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // مثال: جلب صلاحيات المستخدم الحالي لتحديد ما يمكن عرضه/تمكينه
  // useEffect(() => {
  //   const fetchPermissions = async () => {
  //     try {
  //       const response = await getMyPermissions();
  //       setUserPermissions(response.data.permissions || []);
  //     } catch (error) {
  //       console.error("Failed to fetch user permissions", error);
  //       // يمكنك عرض رسالة خطأ هنا أو إعادة توجيه المستخدم
  //     } finally {
  //       setLoadingPermissions(false);
  //     }
  //   };
  //   fetchPermissions();
  // }, []);

  // بدلاً من ذلك، إذا كان لديك نظام صلاحيات بالفعل، استخدمه
  // const { user, permissions, isLoading: userLoading } = useUser(); // مثال
  // useEffect(() => {
  //   if (!userLoading) {
  //     setUserPermissions(permissions || []);
  //     setLoadingPermissions(false);
  //   }
  // }, [permissions, userLoading]);
  //
  // **ملاحظة هامة:** للتبسيط، سنفترض أن المستخدم لديه كل الصلاحيات المطلوبة الآن
  // يجب عليك دمج منطق التحقق من الصلاحيات الفعلي.
  useEffect(() => {
    // صلاحيات وهمية للتطوير
    setUserPermissions([
      "panel_users.read",
      "panel_users.create",
      "panel_users.update",
      "panel_users.delete",
      "roles.read",
      "roles.create",
      "roles.update",
      "roles.delete",
      "system.view_audit_log",
    ]);
    setLoadingPermissions(false);
  }, []);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // دالة للتحقق من الصلاحية
  const hasPermission = (permission) => {
    // return userPermissions.includes(permission);
    return true; // للتطوير، افترض أن كل الصلاحيات موجودة
  };

  if (loadingPermissions) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: "calc(100vh - 150px)" }}
        >
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // إذا لم يكن لدى المستخدم أي صلاحيات أساسية لعرض هذه الصفحة
  // if (!hasPermission("panel_users.read") && !hasPermission("roles.read") && !hasPermission("system.view_audit_log")) {
  //   return (
  //     <DashboardLayout>
  //       <DashboardNavbar />
  //       <MDBox pt={6} pb={3}>
  //         <MDTypography variant="h4" color="error" textAlign="center">
  //           ليس لديك الصلاحية لعرض هذه الصفحة.
  //         </MDTypography>
  //       </MDBox>
  //       <Footer />
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        {" "}
        {/* تعديل الـ padding */}
        <MDTypography variant="h4" mb={3} px={3}>
          إعدادات النظام
        </MDTypography>{" "}
        {/* عنوان للصفحة */}
        <MUIBox sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          {" "}
          {/* px للـ tabs container */}
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            aria-label="admin settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {hasPermission("panel_users.read") && (
              <Tab label="إدارة المستخدمين" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            )}
            {hasPermission("roles.read") && (
              <Tab label="الأدوار والصلاحيات" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            )}
            {hasPermission("system.view_audit_log") && (
              <Tab label="سجل التدقيق" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
            )}
            {/* أضف تبويبات لإعدادات المحفظة والتذكيرات إذا نقلتها هنا وتحققت من صلاحياتها */}
            {/* {hasPermission("wallet.read") && <Tab label="إعدادات المحفظة" id="admin-tab-3" />} */}
            {/* {hasPermission("reminders.read") && <Tab label="إعدادات التذكيرات" id="admin-tab-4" />} */}
          </Tabs>
        </MUIBox>
        {/* محتوى التبويبات لا يأخذ padding هنا، بل داخل كل قسم */}
        {hasPermission("panel_users.read") && (
          <TabPanel value={activeTab} index={0}>
            <UserManagementSection />
          </TabPanel>
        )}
        {hasPermission("roles.read") && (
          <TabPanel
            value={activeTab}
            index={activeTab === 0 && !hasPermission("panel_users.read") ? 0 : 1}
          >
            {/* تعديل index إذا كان التبويب الأول مخفيًا */}
            <RoleManagementSection />
          </TabPanel>
        )}
        {hasPermission("system.view_audit_log") && (
          <TabPanel
            value={activeTab}
            index={
              activeTab === 0 && !hasPermission("panel_users.read") && !hasPermission("roles.read")
                ? 0
                : (activeTab === 0 && !hasPermission("panel_users.read")) ||
                  (activeTab === 1 && !hasPermission("roles.read"))
                ? 1
                : 2
            }
          >
            {/* تعديل index إذا كانت التبويبات السابقة مخفية */}
            <AuditLogSection />
          </TabPanel>
        )}
        {/*
        <TabPanel value={activeTab} index={3}> // اضبط الـ index بناءً على التبويبات المرئية
          <WalletSettingsSection />
        </TabPanel>
        <TabPanel value={activeTab} index={4}> // اضبط الـ index بناءً على التبويبات المرئية
          <ReminderSettingsSection />
        </TabPanel>
        */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminSettingsPage;
