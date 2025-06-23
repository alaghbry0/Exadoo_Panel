// src/layouts/ManagePlans/index.js

// ------------------- Imports -------------------
import React, { useState, useEffect, useCallback, useRef } from "react";
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

// --- استيراد الدوال والمكونات الجديدة من API ---
import {
  getSubscriptionData,
  getSubscriptionGroups,
  deleteSubscriptionGroup,
  getBatchDetails,
  retryMessagingBatch,
} from "services/api";
import SubscriptionTypeCard from "./components/SubscriptionTypeCard";
import SubscriptionTypeFormModal from "./components/SubscriptionTypeFormModal";
import AddGroupModal from "./components/AddGroupModal";
import EditGroupModal from "./components/EditGroupModal";
import BatchDetailsModal from "./components/BatchDetailsModal";

// ------------------- Component -------------------
function ManagePlans() {
  const { enqueueSnackbar } = useSnackbar();

  // --- الحالات (States) ---
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالات النوافذ المنبثقة
  const [isTypeFormOpen, setIsTypeFormOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [expandedGroups, setExpandedGroups] = useState({});

  // --- حالة لتتبع مهام المراسلة في الخلفية ---
  const [batchStatuses, setBatchStatuses] = useState({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // ✅ [تعديل] تحديث Refs لإدارة Polling
  const pollingIntervalRef = useRef(null);
  // ✅ [إضافة جديدة] لتتبع محاولات Polling الفاشلة و Exponential Backoff
  const pollFailuresRef = useRef({}); // { [batch_id]: failureCount }
  const basePollInterval = 5000; // 5 ثوانٍ

  // --- دالة جلب البيانات ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionData();
      setSubscriptionData(data || []);

      const groupsList = await getSubscriptionGroups();
      setAvailableGroups(groupsList || []);

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ✅ [تعديل] منطق التحقق الدوري (Polling) مع تتبع الفشل ---
  const pollStatuses = useCallback(async () => {
    const batchesToPoll = Object.values(batchStatuses).filter(
      (statusObj) =>
        statusObj && (statusObj.status === "pending" || statusObj.status === "in_progress")
    );

    if (batchesToPoll.length === 0) {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current); // استخدم clearTimeout
        pollingIntervalRef.current = null;
        pollFailuresRef.current = {}; // إعادة تعيين عداد الفشل
        console.log("Polling stopped: No active batches.");
      }
      return;
    }

    console.log(
      "Polling for batches:",
      batchesToPoll.map((b) => b.batch_id)
    );

    const statusPromises = batchesToPoll.map((batch) =>
      getBatchDetails(batch.batch_id)
        .then((response) => {
          // ✅ [تعديل] إعادة تعيين عداد الفشل عند النجاح
          if (pollFailuresRef.current[batch.batch_id]) {
            delete pollFailuresRef.current[batch.batch_id];
          }
          return response;
        })
        .catch((err) => {
          console.error(`Failed to poll batch ${batch.batch_id}`, err);
          // ✅ [تعديل] زيادة عداد الفشل
          pollFailuresRef.current[batch.batch_id] =
            (pollFailuresRef.current[batch.batch_id] || 0) + 1;
          return batch; // أعد الحالة القديمة في حالة فشل الجلب
        })
    );

    const updatedBatches = await Promise.all(statusPromises);

    setBatchStatuses((prev) => {
      const newStatuses = { ...prev };
      let changed = false;
      updatedBatches.forEach((batch) => {
        if (batch && newStatuses[batch.subscription_type_id]?.batch_id === batch.batch_id) {
          if (newStatuses[batch.subscription_type_id].status !== batch.status) {
            newStatuses[batch.subscription_type_id] = batch;
            changed = true;
            if (batch.status === "completed" || batch.status === "failed") {
              enqueueSnackbar(`Task for a subscription has finished.`, { variant: "info" });
            }
          }
        }
      });
      return changed ? newStatuses : prev;
    });
  }, [batchStatuses, enqueueSnackbar]);

  // --- ✅ [تعديل] useEffect الخاص بالتحقق الدوري باستخدام setTimeout و Exponential Backoff ---
  useEffect(() => {
    const shouldPoll = Object.values(batchStatuses).some(
      (s) => s && (s.status === "pending" || s.status === "in_progress")
    );

    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (shouldPoll) {
      console.log("Polling started.");
      // ✅ [تعديل] استخدام فاصل زمني ديناميكي
      const scheduleNextPoll = () => {
        // حساب أطول فترة انتظار بناءً على المحاولات الفاشلة
        const maxFailures = Math.max(0, ...Object.values(pollFailuresRef.current));
        // Exponential backoff: 5s, 10s, 20s, 40s... capped at ~1 minute
        const delay = Math.min(basePollInterval * Math.pow(2, maxFailures), 60000);

        pollingIntervalRef.current = setTimeout(() => {
          pollStatuses().finally(scheduleNextPoll); // أعد الجدولة بعد انتهاء الجلب الحالي
        }, delay);
      };

      // ابدأ الدورة الأولى فورًا
      pollStatuses().finally(scheduleNextPoll);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current); // استخدم clearTimeout بدلًا من clearInterval
      }
    };
  }, [batchStatuses, pollStatuses]); // الاعتماديات صحيحة

  // --- دالة تحديث البيانات بعد أي تغيير ---
  const handleDataChange = (updateResult = null) => {
    if (updateResult && updateResult.invite_batch_id) {
      const typeId = updateResult.id;
      const newBatchId = updateResult.invite_batch_id;

      setBatchStatuses((prev) => ({
        ...prev,
        [typeId]: {
          batch_id: newBatchId,
          subscription_type_id: typeId,
          status: "pending",
          batch_type: "invite",
        },
      }));
      enqueueSnackbar("Invite process has been started in the background.", { variant: "info" });
    }
    fetchData();
  };

  // --- دوال فتح وإغلاق النوافذ المنبثقة ---
  const handleOpenAddType = () => {
    setEditingType(null);
    setIsTypeFormOpen(true);
  };

  const handleOpenEditType = (type) => {
    setEditingType(type);
    setIsTypeFormOpen(true);
  };

  const handleCloseTypeForm = () => {
    setIsTypeFormOpen(false);
    setEditingType(null);
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
    if (!groupId) return;
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // --- دوال فتح وإغلاق النافذة المنبثقة للتفاصيل ---
  const handleOpenDetailsModal = (batchId) => {
    setSelectedBatchId(batchId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedBatchId(null);
    setIsDetailsModalOpen(false);
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      try {
        await deleteSubscriptionGroup(groupId);
        enqueueSnackbar(`Group "${groupName}" deleted successfully.`, { variant: "success" });
        handleDataChange();
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
                            plans={type.plans || []}
                            onDataChange={handleDataChange}
                            onEdit={() => handleOpenEditType(type)}
                            batchStatus={batchStatuses[type.id]}
                            onStatusClick={() => {
                              const batch = batchStatuses[type.id];
                              if (batch && batch.batch_id) {
                                handleOpenDetailsModal(batch.batch_id);
                              }
                            }}
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

      {/* --- النوافذ المنبثقة --- */}
      {isTypeFormOpen && (
        <SubscriptionTypeFormModal
          open={isTypeFormOpen}
          onClose={handleCloseTypeForm}
          onSuccess={(result) => handleDataChange(result)}
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

      {/* --- النافذة المنبثقة الجديدة لتفاصيل المهمة --- */}
      {isDetailsModalOpen && selectedBatchId && (
        <BatchDetailsModal
          open={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          batchId={selectedBatchId}
          // ✅ [تعديل] تحديث onRetry لقبول batchType وتمريره
          onRetry={(newBatchId, typeId, batchType) => {
            setBatchStatuses((prev) => ({
              ...prev,
              [typeId]: {
                batch_id: newBatchId,
                subscription_type_id: typeId,
                status: "pending",
                batch_type: batchType, // ✅ إضافة batch_type هنا
              },
            }));
            handleCloseDetailsModal();
          }}
          apiFn={{ getDetails: getBatchDetails, retry: retryMessagingBatch }}
        />
      )}
    </DashboardLayout>
  );
}

export default ManagePlans;
