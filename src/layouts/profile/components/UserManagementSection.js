// src/layouts/admin/components/UserManagementSection.js

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

import {
  getPanelUsers,
  deletePanelUser,
  createPanelUser,
  updatePanelUser,
  getRoles,
} from "services/api";

const INITIAL_USER_STATE = {
  email: "",
  display_name: "",
  role_id: "",
  telegram_id: "",
  receives_notifications: false,
};

function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null for new, user object for editing
  const [formData, setFormData] = useState(INITIAL_USER_STATE);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });

  const fetchUsersAndRoles = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([getPanelUsers(), getRoles()]);
      setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
      setRoles(Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : []);
    } catch (err) {
      setSnackbar({ open: true, color: "error", message: "Failed to fetch data." });
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        email: user.email || "",
        display_name: user.display_name || "",
        role_id: user.role_id || "",
        telegram_id: user.telegram_id || "",
        receives_notifications: user.receives_notifications || false,
      });
    } else {
      setFormData(INITIAL_USER_STATE);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(INITIAL_USER_STATE);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveUser = async () => {
    if (!formData.email || !formData.role_id) {
      setSnackbar({ open: true, color: "warning", message: "Email and Role are required." });
      return;
    }

    // تجهيز البيانات للإرسال
    const payload = {
      ...formData,
      role_id: parseInt(formData.role_id, 10),
      telegram_id: formData.telegram_id ? formData.telegram_id : null,
    };

    try {
      if (editingUser) {
        await updatePanelUser(editingUser.id, payload);
        setSnackbar({ open: true, color: "success", message: "User updated successfully!" });
      } else {
        await createPanelUser(payload);
        setSnackbar({ open: true, color: "success", message: "User created successfully!" });
      }
      handleCloseModal();
      fetchUsersAndRoles(); // إعادة تحميل البيانات
    } catch (err) {
      setSnackbar({
        open: true,
        color: "error",
        message: err.response?.data?.error || "An error occurred.",
      });
      console.error("Save user error:", err);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      try {
        await deletePanelUser(userId);
        setSnackbar({ open: true, color: "success", message: "User deleted successfully." });
        fetchUsersAndRoles();
      } catch (err) {
        setSnackbar({
          open: true,
          color: "error",
          message: err.response?.data?.error || "Failed to delete user.",
        });
      }
    }
  };

  if (loading) {
    return (
      <MDBox p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </MDBox>
    );
  }

  return (
    <MDBox pt={2} pb={3}>
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title="User Management"
        content={snackbar.message}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        close={() => setSnackbar({ ...snackbar, open: false })}
        bgWhite
      />
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          إدارة المستخدمين
        </MDTypography>
        <MDButton variant="gradient" color="info" onClick={() => handleOpenModal()}>
          <Icon sx={{ mr: 0.5 }}>add</Icon> إضافة مستخدم
        </MDButton>
      </MDBox>
      <TableContainer component={Paper} sx={{ mx: 2, width: "calc(100% - 32px)" }}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>الدور</TableCell>
              <TableCell>معرف تليجرام</TableCell>
              <TableCell align="center">يتلقى إشعارات</TableCell>
              <TableCell align="right">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <MDTypography variant="subtitle2">{user.display_name || "N/A"}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    {user.email}
                  </MDTypography>
                </TableCell>
                <TableCell>{user.role_name || "N/A"}</TableCell>
                <TableCell>{user.telegram_id || "غير محدد"}</TableCell>
                <TableCell align="center">
                  {user.receives_notifications ? (
                    <Icon color="success">check_circle</Icon>
                  ) : (
                    <Icon color="disabled">cancel</Icon>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit User">
                    <IconButton size="small" onClick={() => handleOpenModal(user)} color="info">
                      <Icon>edit</Icon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      color="error"
                    >
                      <Icon>delete</Icon>
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog موحد للإضافة والتعديل */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
        <DialogContent>
          <MDBox component="form" role="form" display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="البريد الإلكتروني"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              disabled={!!editingUser}
              fullWidth
            />
            <TextField
              label="الاسم المعروض"
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="معرف تليجرام (اختياري)"
              type="number"
              name="telegram_id"
              value={formData.telegram_id}
              onChange={handleFormChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>الدور</InputLabel>
              <Select
                name="role_id"
                value={formData.role_id}
                label="الدور"
                onChange={handleFormChange}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  name="receives_notifications"
                  checked={formData.receives_notifications}
                  onChange={handleFormChange}
                />
              }
              label="تلقي إشعارات النظام الحرجة"
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseModal} color="secondary">
            إلغاء
          </MDButton>
          <MDButton onClick={handleSaveUser} color="info" variant="gradient">
            حفظ
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default UserManagementSection;
