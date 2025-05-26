// src/layouts/admin/components/UserManagementSection.js
import React, { useState, useEffect } from "react"; // <-- إضافة React, useState, useEffect
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel /*Checkbox, ListItemText,*/, // Checkbox و ListItemText غير مستخدمة مباشرة هنا
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Icon, // <-- إضافة مكونات Dialog و TextField و Icon
} from "@mui/material";
import MDBox from "components/MDBox"; // <-- إضافة MDBox
import MDTypography from "components/MDTypography"; // <-- إضافة MDTypography
import MDButton from "components/MDButton"; // <-- إضافة MDButton
// تأكد أن مسار services/api صحيح
import {
  getPanelUsers,
  deletePanelUser,
  createPanelUser,
  getRoles,
  updateUserRole,
} from "services/api";

function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openEditUserRoleModal, setOpenEditUserRoleModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", displayName: "", role_id: "" });
  const [editingUserRole, setEditingUserRole] = useState({ userId: null, role_id: "" });
  const [loading, setLoading] = useState(true); // لإظهار مؤشر تحميل
  const [error, setError] = useState(null); // لتخزين رسائل الخطأ

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await getPanelUsers();
      // التأكد من أن usersRes.data.users مصفوفة
      setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);

      const rolesRes = await getRoles();
      // التأكد من أن rolesRes.data.roles مصفوفة
      setRoles(Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : []);
    } catch (err) {
      console.error("Error fetching data for User Management:", err);
      setError(err.response?.data?.error || "فشل في جلب بيانات المستخدمين أو الأدوار.");
      // يمكنك استخدام MDSnackbar هنا لعرض الخطأ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await deletePanelUser(userId);
        alert("تم حذف المستخدم بنجاح."); // أو استخدم MDSnackbar
        fetchUsersAndRoles();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(err.response?.data?.error || "فشل حذف المستخدم.");
      }
    }
  };

  const handleOpenAddUserModal = () => {
    setNewUser({ email: "", displayName: "", role_id: roles.length > 0 ? roles[0].id : "" });
    setOpenAddUserModal(true);
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.role_id) {
      alert("البريد الإلكتروني والدور مطلوبان.");
      return;
    }
    try {
      await createPanelUser(newUser.email, newUser.displayName, parseInt(newUser.role_id, 10)); // تأكد أن role_id رقم
      alert("تم إضافة المستخدم بنجاح.");
      setOpenAddUserModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      console.error("Error adding user:", err);
      alert(err.response?.data?.error || "فشل إضافة المستخدم. تأكد أن البريد غير مكرر.");
    }
  };

  const handleOpenEditUserRoleModal = (user) => {
    setCurrentUserToEdit(user);
    setEditingUserRole({ userId: user.id, role_id: user.role_id ? String(user.role_id) : "" }); // تحويل role_id إلى string إذا كان رقمًا
    setOpenEditUserRoleModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!editingUserRole.role_id) {
      alert("يرجى اختيار دور للمستخدم.");
      return;
    }
    try {
      await updateUserRole(editingUserRole.userId, parseInt(editingUserRole.role_id, 10)); // تأكد أن role_id رقم
      alert("تم تحديث دور المستخدم بنجاح.");
      setOpenEditUserRoleModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      console.error("Error updating user role:", err);
      alert(err.response?.data?.error || "فشل تحديث دور المستخدم.");
    }
  };

  if (loading) {
    return (
      <MDBox p={3} display="flex" justifyContent="center">
        <MDTypography>جار التحميل...</MDTypography>
      </MDBox>
    );
  }

  if (error) {
    return (
      <MDBox p={3} display="flex" justifyContent="center">
        <MDTypography color="error">{error}</MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox pt={2} pb={3}>
      {" "}
      {/* استخدام pt و pb بدلاً من mt={4} و p={2} لتوحيد الـ padding */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} px={2}>
        {" "}
        {/* إضافة px للحفاظ على التباعد */}
        <MDTypography variant="h6" fontWeight="medium">
          إدارة المستخدمين
        </MDTypography>
        <MDButton variant="gradient" color="info" onClick={handleOpenAddUserModal}>
          <Icon sx={{ mr: 0.5 }}>add</Icon> إضافة مستخدم
        </MDButton>
      </MDBox>
      <TableContainer component={Paper} sx={{ mx: 2, width: "calc(100% - 32px)" }}>
        {" "}
        {/* إضافة mx و width لتعويض الـ padding المفقود */}
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            {" "}
            {/* ضروري لـ Material UI v5 */}
            <TableRow>
              <TableCell>الاسم المعروض</TableCell>
              <TableCell>البريد الإلكتروني</TableCell>
              <TableCell>الدور</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell align="right">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.display_name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role_name || "لم يتم التعيين"}</TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditUserRoleModal(user)}
                      color="info"
                      title="تعديل الدور"
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      color="error"
                      title="حذف المستخدم"
                    >
                      <Icon>delete</Icon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <MDTypography variant="body2">لا يوجد مستخدمون لعرضهم.</MDTypography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog لإضافة مستخدم */}
      <Dialog
        open={openAddUserModal}
        onClose={() => setOpenAddUserModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="البريد الإلكتروني"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="الاسم المعروض (اختياري)"
            type="text"
            fullWidth
            value={newUser.displayName}
            onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-select-label-add">الدور</InputLabel>
            <Select
              labelId="role-select-label-add"
              value={newUser.role_id}
              label="الدور"
              onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
            >
              <MenuItem value="">
                <em>اختر دورًا</em>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenAddUserModal(false)} color="secondary">
            إلغاء
          </MDButton>
          <MDButton onClick={handleAddUser} color="info">
            حفظ
          </MDButton>
        </DialogActions>
      </Dialog>
      {/* Dialog لتعديل دور المستخدم */}
      {currentUserToEdit && (
        <Dialog
          open={openEditUserRoleModal}
          onClose={() => setOpenEditUserRoleModal(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            تعديل دور للمستخدم: {currentUserToEdit.display_name || currentUserToEdit.email}
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="body2" mb={2}>
              البريد الإلكتروني: {currentUserToEdit.email}
            </MDTypography>
            <FormControl fullWidth margin="dense">
              <InputLabel id="edit-role-select-label">الدور الجديد</InputLabel>
              <Select
                labelId="edit-role-select-label"
                value={editingUserRole.role_id}
                label="الدور الجديد"
                onChange={(e) =>
                  setEditingUserRole({ ...editingUserRole, role_id: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>اختر دورًا</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setOpenEditUserRoleModal(false)} color="secondary">
              إلغاء
            </MDButton>
            <MDButton onClick={handleUpdateUserRole} color="info">
              تحديث الدور
            </MDButton>
          </DialogActions>
        </Dialog>
      )}
    </MDBox>
  );
}

export default UserManagementSection; // <-- إضافة التصدير الافتراضي
