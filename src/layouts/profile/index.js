// Overview.js
import React, { useState, useEffect } from "react";

// @mui material components
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "layouts/profile/components/Header";

// استيراد الأقسام الجديدة
import WalletSettingsSection from "layouts/profile/components/WalletSettingsSection";
import ReminderSettingsSection from "layouts/profile/components/ReminderSettingsSection";

// استيراد دوال API
import { getUsers, deleteUser, addUser } from "services/api";

// قسم إدارة المستخدمين
function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserDisplayName, setNewUserDisplayName] = useState("");
  const [newUserRole, setNewUserRole] = useState("admin"); // القيمة الافتراضية "admin"

  // جلب قائمة المستخدمين من الخادم
  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching users", error);
      alert("فشل جلب قائمة المستخدمين");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (email) => {
    try {
      await deleteUser(email);
      // إعادة جلب القائمة بعد الحذف
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
      alert("فشل حذف المستخدم");
    }
  };

  const handleAddUser = async () => {
    try {
      await addUser(newUserEmail, newUserDisplayName, newUserRole);
      alert("تم إضافة المستخدم بنجاح");
      setOpenModal(false);
      // إعادة جلب القائمة بعد الإضافة
      fetchUsers();
    } catch (error) {
      console.error("Error adding user", error);
      alert("فشل إضافة المستخدم");
    }
  };

  return (
    <MDBox p={2} mt={4}>
      <MDTypography variant="h6" fontWeight="medium" mb={2}>
        User Management
      </MDTypography>
      <MDBox display="flex" justifyContent="flex-end" mb={2}>
        <MDButton variant="gradient" color="info" onClick={() => setOpenModal(true)}>
          Add User
        </MDButton>
      </MDBox>
      {users.map((user) => (
        <MDBox
          key={user.email} // استخدام البريد الإلكتروني كمفتاح
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={1}
          mb={1}
          border="1px solid #e0e0e0"
          borderRadius="8px"
        >
          <MDBox>
            <MDTypography variant="subtitle1" fontWeight="medium">
              {user.display_name || user.email}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {user.email} - {user.role}
            </MDTypography>
          </MDBox>
          <Icon sx={{ cursor: "pointer" }} onClick={() => handleDeleteUser(user.email)}>
            delete
          </Icon>
        </MDBox>
      ))}

      {/* نافذة منبثقة لإضافة مستخدم جديد */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Display Name"
            type="text"
            fullWidth
            value={newUserDisplayName}
            onChange={(e) => setNewUserDisplayName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Role"
            select
            fullWidth
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="owner">Owner</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleAddUser} color="info">
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

function Overview() {
  // إضافة حالة التبويب النشط هنا
  const [activeTab, setActiveTab] = useState("users"); // القيمة الافتراضية هي 'users'

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      {/* تمرير دالة setActiveTab إلى Header */}
      <Header setActiveTab={setActiveTab} />
      <MDBox>
        {/* استخدام switch لعرض القسم المناسب بناءً على activeTab */}
        {(() => {
          switch (activeTab) {
            case "users":
              return <UserManagementSection />;
            case "wallet":
              return <WalletSettingsSection />;
            case "settings":
              return <ReminderSettingsSection />;
            default:
              return <UserManagementSection />; // في حالة وجود خطأ، يتم عرض قسم المستخدمين كافتراضي
          }
        })()}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
