// src/layouts/ManagePlans/index.js

// ------------------- Imports -------------------
import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  Paper,
  Chip,
  Collapse,
  IconButton,
  Box,
  Alert,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// --- [تغيير 1]: استيراد الدوال الجديدة من API ---
import { getSubscriptionData, getSubscriptionGroups, deleteSubscriptionGroup } from "services/api";
import SubscriptionTypeCard from "./components/SubscriptionTypeCard";
import SubscriptionTypeFormModal from "./components/SubscriptionTypeFormModal";
import AddGroupModal from "./components/AddGroupModal";
import EditGroupModal from "./components/EditGroupModal";

// ------------------- Component -------------------
function ManagePlans() {
  const { enqueueSnackbar } = useSnackbar();

  // --- [تغيير 2]: إعادة هيكلة الحالات (States) ---
  const [subscriptionData, setSubscriptionData] = useState([]); // الحالة الرئيسية لكل البيانات
  const [availableGroups, setAvailableGroups] = useState([]); // قائمة منفصلة للنوافذ المنبثقة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالات النوافذ المنبثقة
  const [isTypeFormOpen, setIsTypeFormOpen] = useState(false);
  const [editingType, setEditingType] = useState(null); // لتحديد النوع المراد تعديله

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [expandedGroups, setExpandedGroups] = useState({});

  // --- [تغيير 3]: دالة واحدة لجلب كل البيانات ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // استدعاء API واحد يجلب المجموعات، الأنواع، والخطط
      const data = await getSubscriptionData();
      setSubscriptionData(data || []);

      // استدعاء منفصل لقائمة المجموعات النظيفة للـ Modals
      const groupsList = await getSubscriptionGroups();
      setAvailableGroups(groupsList || []);

      // منطق توسيع المجموعات الافتراضي
      const initialExpanded = {};
      if (Array.isArray(data)) {
        data.forEach((group) => {
          if (group.id && group.subscription_types && group.subscription_types.length > 0) {
            initialExpanded[group.id] = true;
          }
        });
      }
      setExpandedGroups(initialExpanded);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError(err.response?.data?.error || "Failed to load subscription data. Please try again.");
      setSubscriptionData([]);
      setAvailableGroups([]);
    } finally {
      setLoading(false);
    }
  }, []); // لا توجد تبعيات لأنها لا تعتمد على props أو state

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- دالة واحدة لتحديث البيانات بعد أي تغيير ---
  const handleDataChange = () => {
    fetchData();
  };

  // --- [تغيير 4]: دوال فتح وإغلاق النوافذ المنبثقة (Modals) ---
  const handleOpenAddType = () => {
    setEditingType(null); // تأكد من أنه لا يوجد نوع محدد (وضع الإضافة)
    setIsTypeFormOpen(true);
  };

  const handleOpenEditType = (type) => {
    setEditingType(type); // حدد النوع للتعديل
    setIsTypeFormOpen(true);
  };

  const handleCloseTypeForm = () => {
    setIsTypeFormOpen(false);
    setEditingType(null); // نظّف الحالة عند الإغلاق
  };

  const handleOpenAddGroup = () => setIsAddGroupModalOpen(true);
  const handleCloseAddGroup = () => setIsAddGroupModalOpen(false);

  const handleOpenEditGroup = (group) => {
    setEditingGroup(group);
    setIsEditGroupModalOpen(true);
  };
  const handleCloseEditGroup = () => {
    setIsEditGroupModalOpen(false);
    setEditingGroup(null);
  };

  const toggleGroupExpansion = (groupId) => {
    if (!groupId) return; // لا تفعل شيئًا للأنواع غير المجمعة
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      try {
        await deleteSubscriptionGroup(groupId);
        enqueueSnackbar(`Group "${groupName}" deleted successfully.`, { variant: "success" });
        handleDataChange(); // أعد جلب البيانات
      } catch (err) {
        console.error("Error deleting group:", err);
        enqueueSnackbar(err.response?.data?.error || `Failed to delete group "${groupName}".`, {
          variant: "error",
        });
      }
    }
  };

  // ------------------- Render Logic -------------------
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar absolute={false} />
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", py: 10 }}
        >
          <LinearProgress color="info" sx={{ width: "50%" }} />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar absolute={false} />
        <MDBox mt={8} px={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <MDButton onClick={fetchData} variant="contained" color="info">
            Retry
          </MDButton>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar absolute={false} />
      <MDBox mt={{ xs: 4, md: 8 }} px={{ xs: 2, md: 3 }}>
        <MDBox
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <MDTypography variant="h4" fontWeight="bold" color="dark">
            Manage Subscriptions
          </MDTypography>
          <MDBox display="flex" gap={1.5}>
            <MDButton
              variant="gradient"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpenAddGroup}
            >
              New Group
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              startIcon={<AddIcon />}
              onClick={handleOpenAddType}
            >
              New Subscription Type
            </MDButton>
          </MDBox>
        </MDBox>

        {/* --- [تغيير 5]: منطق العرض يعتمد على subscriptionData --- */}
        {subscriptionData && subscriptionData.length > 0 ? (
          subscriptionData.map((group) => (
            <Card key={group.id || "ungrouped-section"} sx={{ mb: 3, overflow: "visible" }}>
              <MDBox
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => toggleGroupExpansion(group.id)}
                sx={{
                  cursor: group.id ? "pointer" : "default",
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <MDBox display="flex" alignItems="center">
                  {group.id && group.color && (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: group.color,
                        mr: 1.5,
                      }}
                    />
                  )}
                  <MDTypography variant="h6" fontWeight="medium">
                    {group.name}
                  </MDTypography>
                  <Chip
                    label={`${group.subscription_types?.length || 0} types`}
                    size="small"
                    sx={{
                      ml: 2,
                      backgroundColor: group.color || "grey.300",
                      color: "common.white",
                    }}
                  />
                </MDBox>
                {group.id && (
                  <MDBox>
                    <Tooltip title="Edit Group">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditGroup(group);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Group">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id, group.name);
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                    {group.subscription_types?.length > 0 && (
                      <IconButton
                        size="small"
                        sx={{
                          transform: expandedGroups[group.id] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    )}
                  </MDBox>
                )}
              </MDBox>

              <Collapse in={!group.id || expandedGroups[group.id]} timeout="auto" unmountOnExit>
                <MDBox p={2.5}>
                  {group.subscription_types && group.subscription_types.length > 0 ? (
                    <Grid container spacing={3}>
                      {group.subscription_types.map((type) => (
                        <Grid item xs={12} md={6} lg={4} key={type.id}>
                          <SubscriptionTypeCard
                            subscriptionType={type}
                            plans={type.plans || []} // تمرير الخطط الجاهزة
                            onDataChange={handleDataChange} // تمرير دالة التحديث
                            onEdit={() => handleOpenEditType(type)} // تمرير دالة لفتح نافذة التعديل
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <MDTypography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ py: 2 }}
                    >
                      No subscription types in this group.
                    </MDTypography>
                  )}
                </MDBox>
              </Collapse>
            </Card>
          ))
        ) : (
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%", py: 6, mt: 4 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 4 },
                textAlign: "center",
                borderRadius: "12px",
                maxWidth: "600px",
              }}
            >
              <MDTypography variant="h5" color="text.secondary" mb={2}>
                No Subscriptions Found
              </MDTypography>
              <MDTypography variant="body2" color="text.secondary" mb={3}>
                Get started by adding a new group or a subscription type.
              </MDTypography>
              <MDBox display="flex" justifyContent="center" gap={2}>
                <MDButton
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddGroup}
                >
                  Add Group
                </MDButton>
                <MDButton
                  variant="contained"
                  color="info"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddType}
                >
                  Add Subscription Type
                </MDButton>
              </MDBox>
            </Paper>
          </MDBox>
        )}
      </MDBox>

      {/* --- [تغيير 6]: النوافذ المنبثقة تتلقى البيانات كـ props --- */}
      {isTypeFormOpen && (
        <SubscriptionTypeFormModal
          open={isTypeFormOpen}
          onClose={handleCloseTypeForm}
          onSuccess={handleDataChange}
          mode={editingType ? "edit" : "add"}
          initialData={editingType}
          availableGroups={availableGroups}
        />
      )}
      {isAddGroupModalOpen && (
        <AddGroupModal
          open={isAddGroupModalOpen}
          onClose={handleCloseAddGroup}
          onGroupAdded={handleDataChange}
        />
      )}
      {isEditGroupModalOpen && editingGroup && (
        <EditGroupModal
          open={isEditGroupModalOpen}
          onClose={handleCloseEditGroup}
          onGroupUpdated={handleDataChange}
          existingGroupData={editingGroup}
        />
      )}
    </DashboardLayout>
  );
}

export default ManagePlans;
