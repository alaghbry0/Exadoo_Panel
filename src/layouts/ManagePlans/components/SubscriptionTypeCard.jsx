import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { getSubscriptionPlans, deleteSubscriptionPlan, deleteSubscriptionType } from "services/api";
import EditSubscriptionTypeModal from "./EditSubscriptionTypeModal";
import AddSubscriptionPlanModal from "./AddSubscriptionPlanModal";
import EditSubscriptionPlanModal from "./EditSubscriptionPlanModal";
import ConfirmDeleteDialog from "./SubscriptionDelete";
import IconButton from "@mui/material/IconButton"; // استيراد IconButton لأزرار الأيقونات
import CircularProgress from "@mui/material/CircularProgress"; // استيراد CircularProgress لمؤشر التحميل

function SubscriptionTypeCard({ subscriptionType, refreshTypes }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPlans = async () => {
    setLoading(true); // تعيين حالة التحميل إلى صحيح قبل جلب الخطط
    try {
      const data = await getSubscriptionPlans(subscriptionType.id);
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans for subscription type:", error);
      // يمكنك هنا إضافة معالجة أخطاء أكثر تفصيلاً
    } finally {
      setLoading(false); // تعيين حالة التحميل إلى خطأ بعد انتهاء جلب الخطط
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [subscriptionType.id]);

  const handleDeletePlan = async (planId) => {
    const planToDelete = plans.find((plan) => plan.id === planId);
    if (planToDelete) {
      openDeleteConfirmationDialogForPlan(planToDelete);
    }
  };

  const handleDeleteSubscriptionType = async () => {
    openDeleteConfirmationDialogForType();
  };

  const openEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleTypeUpdated = (updatedType) => {
    refreshTypes();
    closeEditDialog();
  };

  const openAddPlanModal = () => {
    setIsAddPlanModalOpen(true);
  };

  const closeAddPlanModal = () => {
    setIsAddPlanModalOpen(false);
  };

  const handlePlanAdded = (newPlan) => {
    fetchPlans();
    closeAddPlanModal();
  };

  const openEditPlanModal = (plan) => {
    setSelectedPlan(plan);
    setIsEditPlanModalOpen(true);
  };

  const closeEditPlanModal = () => {
    setIsEditPlanModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePlanUpdated = (updatedPlan) => {
    fetchPlans();
    closeEditPlanModal();
  };

  const openDeleteConfirmationDialogForType = () => {
    setItemToDeleteName(subscriptionType.name);
    setIsDeleteDialogOpen(true);
    setDeleteTarget("type");
  };

  const openDeleteConfirmationDialogForPlan = (plan) => {
    setItemToDeleteName(plan.name);
    setItemToDeleteId(plan.id);
    setIsPlanDeleteDialogOpen(true);
    setDeleteTarget("plan");
  };

  const closeDeleteConfirmationDialog = () => {
    setIsDeleteDialogOpen(false);
    setIsPlanDeleteDialogOpen(false);
    setItemToDeleteName("");
    setItemToDeleteId(null);
    setDeleteTarget(null);
  };

  const confirmDeleteSubscriptionType = async () => {
    try {
      await deleteSubscriptionType(subscriptionType.id);
      refreshTypes();
    } catch (err) {
      console.error("Error deleting subscription type", err);
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  const confirmDeletePlan = async () => {
    try {
      await deleteSubscriptionPlan(itemToDeleteId);
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        {" "}
        {/* زيادة المساحة الداخلية للبطاقة */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h5" fontWeight="bold" color="dark">
            {" "}
            {/* عنوان نوع الاشتراك بخط أوضح */}
            {subscriptionType.name}
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1}>
            {" "}
            {/* استخدام gap لتوفير مساحة بين الأزرار */}
            <IconButton
              aria-label="edit-type"
              color="primary"
              size="small"
              onClick={openEditDialog}
            >
              <Icon>edit</Icon>
            </IconButton>
            <IconButton
              aria-label="delete-type"
              color="error"
              size="small"
              onClick={openDeleteConfirmationDialogForType}
            >
              <Icon>delete</Icon>
            </IconButton>
          </MDBox>
        </MDBox>
        {/* عرض الميزات بشكل قائمة منسقة */}
        {subscriptionType.features &&
          Array.isArray(subscriptionType.features) &&
          subscriptionType.features.length > 0 && (
            <MDBox mt={2} mb={2}>
              <MDTypography variant="subtitle2" fontWeight="bold" color="text">
                Features:
              </MDTypography>
              <MDBox component="ul" pl={3} mt={1}>
                {Array.isArray(subscriptionType.features) ? ( // فحص إضافي هنا
                  subscriptionType.features.map((feature, index) => (
                    <MDBox component="li" key={index} mb={0.5}>
                      <MDTypography variant="body2" color="text">
                        {feature}
                      </MDTypography>
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2" color="error">
                    Error loading features (features are not an array)
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          )}
        {/* عنوان قائمة خطط الاشتراك */}
        <MDBox mt={3} mb={2}>
          {" "}
          {/* إضافة مساحة رأسية قبل وبعد العنوان */}
          <MDTypography variant="subtitle1" fontWeight="bold" color="dark">
            {" "}
            {/* عنوان خطط الاشتراك بخط أوضح */}
            Subscription Plans
          </MDTypography>
        </MDBox>
        {/* قائمة الخطط مع حالة التحميل */}
        <MDBox>
          {loading ? (
            <MDBox display="flex" justifyContent="center" py={2}>
              {" "}
              {/* توسيط مؤشر التحميل */}
              <CircularProgress color="primary" size="small" /> {/* مؤشر تحميل صغير */}
            </MDBox>
          ) : plans.length === 0 ? (
            <MDTypography variant="body2" color="text" fontStyle="italic">
              No plans available for this type.
            </MDTypography>
          ) : (
            plans.map((plan) => (
              <MDBox
                key={plan.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={1} // تقليل المسافة الرأسية للخطط
                px={2} // إضافة مساحة أفقية للخطط
                mb={1} // إضافة مسافة سفلية بين الخطط
                borderRadius="md" // إضافة زوايا مدورة للخطط
                sx={{ backgroundColor: "#f8f9fa" }} // لون خلفية أفتح للخطط
              >
                <MDTypography variant="body2" fontWeight="medium" color="dark">
                  {" "}
                  {/* معلومات الخطة بخط أوضح */}
                  {plan.name} - ${plan.price} for {plan.duration_days} days
                </MDTypography>
                <MDBox display="flex" justifyContent="flex-end" gap={1}>
                  {" "}
                  {/* استخدام gap لتوفير مساحة بين أزرار الخطة */}
                  <IconButton
                    aria-label="edit-plan"
                    color="primary"
                    size="small"
                    onClick={() => openEditPlanModal(plan)}
                  >
                    <Icon>edit</Icon>
                  </IconButton>
                  <IconButton
                    aria-label="delete-plan"
                    color="error"
                    size="small"
                    onClick={() => openDeleteConfirmationDialogForPlan(plan)}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </MDBox>
              </MDBox>
            ))
          )}
        </MDBox>
        {/* زر إضافة خطة جديدة */}
        <MDBox mt={3} textAlign="right">
          {" "}
          {/* محاذاة الزر إلى اليمين */}
          <MDButton variant="contained" color="primary" size="small" onClick={openAddPlanModal}>
            Add New Plan
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Modals */}
      <EditSubscriptionTypeModal
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        subscriptionType={subscriptionType}
        onTypeUpdated={handleTypeUpdated}
      />
      <AddSubscriptionPlanModal
        open={isAddPlanModalOpen}
        onClose={closeAddPlanModal}
        subscriptionTypeId={subscriptionType.id}
        onPlanAdded={handlePlanAdded}
      />
      <EditSubscriptionPlanModal
        open={isEditPlanModalOpen}
        onClose={closeEditPlanModal}
        plan={selectedPlan}
        onPlanUpdated={handlePlanUpdated}
      />
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeleteSubscriptionType}
        itemName={itemToDeleteName}
      />
      <ConfirmDeleteDialog
        open={isPlanDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeletePlan}
        itemName={itemToDeleteName}
      />
    </Card>
  );
}

export default SubscriptionTypeCard;
