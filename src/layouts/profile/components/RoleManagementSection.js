// RoleManagementSection.js

import React, { useState, useEffect } from "react";

// Material UI Core Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Icon,
} from "@mui/material";

// Material UI Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// MD Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// API Services
import {
  getRoles,
  getPermissions,
  createRole,
  updateRolePermissions,
  getRolePermissions,
  // deleteRole,
} from "services/api";

function RoleManagementSection() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState({});
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    id: null,
    name: "",
    description: "",
    permission_ids: [],
  });

  const fetchData = async () => {
    try {
      const rolesRes = await getRoles();
      setRoles(rolesRes.data.roles || []);
      const permsRes = await getPermissions();
      setAllPermissions(permsRes.data.permissions || {});
    } catch (error) {
      console.error("Error fetching data for roles", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentRole({ id: null, name: "", description: "", permission_ids: [] });
    setOpenRoleModal(true);
  };

  const handleOpenEditModal = async (role) => {
    setIsEditing(true);
    try {
      const rolePermsRes = await getRolePermissions(role.id);
      const permissionIds = rolePermsRes.data.permissions.map((p) => p.id);
      setCurrentRole({ ...role, permission_ids: permissionIds });
      setOpenRoleModal(true);
    } catch (error) {
      // <-- التصحيح هنا
      console.error("Error fetching role permissions for editing", error);
    } // <-- وهذا القوس يغلق الـ catch
  };

  const handleCloseModal = () => {
    setOpenRoleModal(false);
  };

  const handleRoleSubmit = async () => {
    if (!currentRole.name.trim()) {
      alert("اسم الدور مطلوب.");
      return;
    }

    try {
      if (isEditing) {
        await updateRolePermissions(currentRole.id, currentRole.permission_ids);
        alert("تم تحديث صلاحيات الدور بنجاح");
      } else {
        await createRole(currentRole.name, currentRole.description, currentRole.permission_ids);
        alert("تم إنشاء الدور بنجاح");
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving role", error);
      alert(error.response?.data?.message || error.response?.data?.error || "فشل حفظ الدور");
    }
  };

  const handlePermissionChange = (permissionId) => {
    setCurrentRole((prev) => {
      const newPermissionIds = prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter((id) => id !== permissionId)
        : [...prev.permission_ids, permissionId];
      return { ...prev, permission_ids: newPermissionIds };
    });
  };

  return (
    <MDBox pt={3} pb={3} px={2}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          إدارة الأدوار والصلاحيات
        </MDTypography>
        <MDButton variant="gradient" color="info" onClick={handleOpenCreateModal}>
          <Icon sx={{ mr: 0.5 }}>add_circle</Icon>
          إنشاء دور جديد
        </MDButton>
      </MDBox>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table stickyHeader aria-label="roles table">
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>اسم الدور</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>الوصف</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>عدد المستخدمين</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>عدد الصلاحيات</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <MDTypography variant="body2" color="textSecondary">
                    لا توجد أدوار لعرضها حاليًا.
                  </MDTypography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow
                  hover
                  key={role.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {role.name}
                  </TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>{role.users_count ?? 0}</TableCell>
                  <TableCell>{role.permissions_count ?? 0}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditModal(role)}
                      color="info"
                      title="تعديل الدور والصلاحيات"
                      size="small"
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    {/* Delete button placeholder */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openRoleModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>{isEditing ? "تعديل الدور" : "إنشاء دور جديد"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus={!isEditing}
            margin="dense"
            id="role-name"
            label="اسم الدور"
            type="text"
            fullWidth
            variant="outlined"
            value={currentRole.name}
            onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
            disabled={isEditing && (currentRole.name === "owner" || currentRole.name === "Owner")}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="role-description"
            label="وصف الدور (اختياري)"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={currentRole.description}
            onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <MDTypography variant="subtitle2" mt={2} mb={1} fontWeight="medium">
            الصلاحيات:
          </MDTypography>
          {Object.keys(allPermissions).length === 0 ? (
            <MDTypography variant="body2" color="textSecondary">
              لا توجد صلاحيات متاحة.
            </MDTypography>
          ) : (
            Object.entries(allPermissions).map(([category, perms]) => (
              <Accordion
                key={category}
                defaultExpanded={
                  category.toLowerCase().includes("user") ||
                  category.toLowerCase().includes("general")
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
                    {category.replace(/_/g, " ")}
                  </MDTypography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <FormGroup>
                    <Grid container spacing={1}>
                      {perms.map((perm) => (
                        <Grid item xs={12} sm={6} md={4} key={perm.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={currentRole.permission_ids.includes(perm.id)}
                                onChange={() => handlePermissionChange(perm.id)}
                                name={perm.name}
                                color="primary"
                              />
                            }
                            label={
                              <MDTypography variant="caption">
                                {perm.description || "لا يوجد وصف"}
                              </MDTypography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MDButton onClick={handleCloseModal} color="secondary" variant="outlined">
            إلغاء
          </MDButton>
          <MDButton onClick={handleRoleSubmit} color="info" variant="gradient">
            {isEditing ? "حفظ التعديلات" : "إنشاء الدور"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default RoleManagementSection;
