// src/layouts/ManagePlans/components/SubscriptionTypeCard.jsx

// ------------------- Imports -------------------
import React, { useState } from "react";
import {
  Card,
  Tooltip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import LinkIcon from "@mui/icons-material/Link";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// --- [تغيير 1]: حذف getSubscriptionPlans. لا حاجة لجلب الخطط هنا ---
import { deleteSubscriptionPlan, deleteSubscriptionType } from "services/api";

// --- [تغيير 2]: حذف SubscriptionTypeFormModal. الأب هو المسؤول عنه ---
import AddSubscriptionPlanModal from "./AddSubscriptionPlanModal";
import EditSubscriptionPlanModal from "./EditSubscriptionPlanModal";
import ConfirmDeleteDialog from "./SubscriptionDelete";

// ------------------- Helper Functions -------------------
// دالة مساعدة لتحليل JSON بأمان (تبقى كما هي)
const parseJsonSafe = (jsonString) => {
  if (Array.isArray(jsonString)) return jsonString;
  if (typeof jsonString === "string") {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// ------------------- Component -------------------
// --- [تغيير 3]: قبول props جديدة: plans, onDataChange, onEdit ---
function SubscriptionTypeCard({ subscriptionType, plans, onDataChange, onEdit, sx }) {
  // --- [تغيير 4]: حذف الحالات المتعلقة بجلب الخطط ---
  // const [plans, setPlans] = useState([]); // <-- محذوف
  // const [loadingPlans, setLoadingPlans] = useState(true); // <-- محذوف

  // الحالات المتبقية خاصة بالنوافذ المنبثقة للخطط والحذف
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  // --- [تغيير 5]: تبسيط دوال التعامل مع الأحداث ---
  const handlePlanChange = () => {
    onDataChange(); // استدعاء دالة التحديث الشاملة من الأب
    setIsAddPlanModalOpen(false); // إغلاق النوافذ
    setIsEditPlanModalOpen(false);
    setSelectedPlan(null);
  };

  const confirmDeleteSubscriptionType = async () => {
    try {
      await deleteSubscriptionType(subscriptionType.id);
      onDataChange(); // تحديث شامل
    } catch (err) {
      console.error("Error deleting subscription type", err);
      // يمكنك إضافة تنبيه للمستخدم هنا (notistack)
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  const confirmDeletePlan = async () => {
    if (!itemToDeleteId) return;
    try {
      await deleteSubscriptionPlan(itemToDeleteId);
      onDataChange(); // تحديث شامل
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  // دوال فتح وإغلاق النوافذ المنبثقة (لا تغيير كبير هنا)
  const openAddPlanModalHandler = () => setIsAddPlanModalOpen(true);

  const openEditPlanModalHandler = (plan) => {
    setSelectedPlan(plan);
    setIsEditPlanModalOpen(true);
  };

  const openDeleteConfirmationDialogForType = () => {
    setItemToDeleteName(subscriptionType.name);
    setIsDeleteDialogOpen(true);
  };

  const openDeleteConfirmationDialogForPlan = (plan) => {
    setItemToDeleteName(plan.name);
    setItemToDeleteId(plan.id);
    setIsPlanDeleteDialogOpen(true);
  };

  const closeDeleteConfirmationDialog = () => {
    setIsDeleteDialogOpen(false);
    setIsPlanDeleteDialogOpen(false);
    setItemToDeleteId(null);
    setItemToDeleteName("");
  };

  // دالة عرض السعر (تبقى كما هي)
  const displayPrice = (plan) => {
    // ... الكود الحالي لعرض السعر ...
    const price = parseFloat(plan.price);
    const originalPrice = parseFloat(plan.original_price);
    if (!isNaN(originalPrice) && originalPrice > price) {
      return (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="body2" fontWeight="medium" color="dark" mr={0.5}>
            ${price.toFixed(2)}
          </MDTypography>
          <MDTypography
            variant="caption"
            color="text.secondary"
            sx={{ textDecoration: "line-through" }}
          >
            ${originalPrice.toFixed(2)}
          </MDTypography>
        </MDBox>
      );
    }
    return `$${price.toFixed(2)}`;
  };

  // تحليل البيانات (تبقى كما هي)
  const featuresArray = parseJsonSafe(subscriptionType.features);
  const termsArray = parseJsonSafe(subscriptionType.terms_and_conditions);
  const mainChannelInfo = subscriptionType.linked_channels?.find((ch) => ch.is_main);
  const secondaryChannelsInfo = subscriptionType.linked_channels?.filter((ch) => !ch.is_main) || [];
  const hasDetails =
    mainChannelInfo ||
    secondaryChannelsInfo.length > 0 ||
    featuresArray.length > 0 ||
    termsArray.length > 0;

  // ------------------- Render Logic -------------------
  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": { transform: "translateY(-5px)", boxShadow: (theme) => theme.shadows[6] },
          ...sx,
        }}
      >
        <MDBox p={{ xs: 2, sm: 2.5 }} flexGrow={1} display="flex" flexDirection="column">
          {/* Card Header: Name and Actions */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Tooltip title={subscriptionType.name}>
              <MDTypography variant="h6" fontWeight="bold" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                {subscriptionType.name}
              </MDTypography>
            </Tooltip>
            <MDBox display="flex" gap={0.5}>
              <Tooltip title="Edit Type">
                {/* --- [تغيير 6]: زر التعديل يستدعي دالة onEdit من الأب --- */}
                <IconButton aria-label="edit-type" color="info" size="small" onClick={onEdit}>
                  <Icon fontSize="small">edit</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Type">
                <IconButton
                  aria-label="delete-type"
                  color="error"
                  size="small"
                  onClick={openDeleteConfirmationDialogForType}
                >
                  <Icon fontSize="small">delete</Icon>
                </IconButton>
              </Tooltip>
            </MDBox>
          </MDBox>

          {/* Main Channel Info */}
          {subscriptionType.main_channel_id && (
            <MDBox mb={1} display="flex" alignItems="center">
              <Tooltip title="Main Channel">
                <StarIcon color="warning" sx={{ mr: 0.5, fontSize: "1.1rem" }} />
              </Tooltip>
              <MDTypography variant="body2" color="text.secondary" fontWeight="regular">
                Main: ID {subscriptionType.main_channel_id}
                {mainChannelInfo?.channel_name ? ` (${mainChannelInfo.channel_name})` : ""}
              </MDTypography>
            </MDBox>
          )}
          {/* Secondary Channels Info */}
          {secondaryChannelsInfo.length > 0 && (
            <MDBox mt={0.5} mb={1.5}>
              {" "}
              {/* تعديل mt */}
              <MDTypography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                textTransform="uppercase"
                display="block"
                mb={0.5}
              >
                Secondary Channels:
              </MDTypography>
              <List dense disablePadding sx={{ pl: 0.5 }}>
                {secondaryChannelsInfo.map((channel) => (
                  <ListItem key={channel.channel_id} disableGutters sx={{ py: 0.2 }}>
                    {" "}
                    {/* تعديل py */}
                    <ListItemIcon sx={{ minWidth: "20px", mr: 0.5 }}>
                      {" "}
                      {/* تعديل minWidth و mr */}
                      <LinkIcon fontSize="small" color="action" /> {/* تعديل fontSize */}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <MDTypography variant="caption" color="text.secondary">
                          ID {channel.channel_id}
                          {channel.channel_name ? ` (${channel.channel_name})` : ""}
                        </MDTypography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </MDBox>
          )}
          {/* Features Info */}
          {featuresArray.length > 0 && (
            <MDBox
              mt={secondaryChannelsInfo.length > 0 || subscriptionType.main_channel_id ? 0.5 : 1}
              mb={1.5}
            >
              <MDTypography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                textTransform="uppercase"
                display="block"
                mb={0.5}
              >
                Features:
              </MDTypography>
              <MDBox
                component="ul"
                pl={2}
                mt={0}
                sx={{ listStyleType: "disc", marginBlockStart: 0, marginBlockEnd: 0 }}
              >
                {" "}
                {/* تعديل pl */}
                {featuresArray.map((feature, index) => (
                  <MDBox
                    component="li"
                    key={index}
                    mb={0.25}
                    sx={{
                      "&::marker": {
                        fontSize: "0.85em",
                        color: (theme) => theme.palette.info.main,
                      },
                    }}
                  >
                    {" "}
                    {/* تعديل mb و fontSize */}
                    <MDTypography variant="caption" color="text.secondary">
                      {feature}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          )}
          {/* Terms & Conditions Info */}
          {termsArray.length > 0 && (
            <MDBox
              mt={
                secondaryChannelsInfo.length > 0 ||
                subscriptionType.main_channel_id ||
                featuresArray.length > 0
                  ? 0.5
                  : 1
              }
              mb={1.5}
            >
              <MDTypography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                textTransform="uppercase"
                display="block"
                mb={0.5}
              >
                Terms & Conditions:
              </MDTypography>
              <List dense disablePadding sx={{ pl: 0.5 }}>
                {" "}
                {/* إضافة pl */}
                {termsArray.map((term, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.2, alignItems: "flex-start" }}>
                    {" "}
                    {/* تعديل py و alignItems */}
                    <ListItemIcon sx={{ minWidth: "18px", marginRight: "6px", mt: "3px" }}>
                      {" "}
                      {/* تعديل minWidth, mr, mt */}
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color="success"
                        sx={{ fontSize: "0.85rem" }}
                      />{" "}
                      {/* تعديل fontSize */}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <MDTypography variant="caption" color="text.secondary">
                          {term}
                        </MDTypography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </MDBox>
          )}

          {/* Spacer and Divider */}
          <MDBox flexGrow={1} />
          {hasDetails && <Divider sx={{ my: 1.5 }} />}

          {/* Subscription Plans Section */}
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="subtitle2" fontWeight="bold">
                Subscription Plans
              </MDTypography>
              <Tooltip title="Add New Plan">
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={openAddPlanModalHandler}
                  startIcon={<Icon>add</Icon>}
                >
                  New Plan
                </MDButton>
              </Tooltip>
            </MDBox>

            {/* --- [تغيير 7]: عرض الخطط بدون حالة تحميل --- */}
            <MDBox minHeight="80px">
              {plans.length === 0 ? (
                <MDBox display="flex" justifyContent="center" alignItems="center" py={3}>
                  <MDTypography variant="caption" color="text.secondary" fontStyle="italic">
                    No plans available for this type.
                  </MDTypography>
                </MDBox>
              ) : (
                <List dense disablePadding>
                  {plans.map((plan) => (
                    <ListItem
                      key={plan.id}
                      disableGutters
                      secondaryAction={
                        <MDBox display="flex" gap={0.5}>
                          <Tooltip title="Edit Plan">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => openEditPlanModalHandler(plan)}
                            >
                              <Icon fontSize="small">edit</Icon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Plan">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteConfirmationDialogForPlan(plan)}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </Tooltip>
                        </MDBox>
                      }
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        mb: 0.75,
                        borderRadius: 1,
                        bgcolor: "grey.100",
                        "&:hover": { bgcolor: "grey.200" },
                      }}
                    >
                      <ListItemText
                        primary={
                          <MDTypography variant="body2" fontWeight="medium">
                            {plan.name}
                          </MDTypography>
                        }
                        secondary={
                          <MDTypography variant="caption" color="text.secondary">
                            {displayPrice(plan)} for {plan.duration_days} days
                            {plan.telegram_stars_price > 0 &&
                              ` / Stars: ${plan.telegram_stars_price}`}
                          </MDTypography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* --- Modals --- */}
      {/* --- [تغيير 8]: حذف SubscriptionTypeFormModal من هنا --- */}

      <AddSubscriptionPlanModal
        open={isAddPlanModalOpen}
        onClose={() => setIsAddPlanModalOpen(false)}
        subscriptionTypeId={subscriptionType.id}
        onPlanAdded={handlePlanChange} // <-- تحديث شامل
      />

      {selectedPlan && (
        <EditSubscriptionPlanModal
          open={isEditPlanModalOpen}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onPlanUpdated={handlePlanChange} // <-- تحديث شامل
        />
      )}

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeleteSubscriptionType}
        itemName={itemToDeleteName || subscriptionType.name}
        itemType="Subscription Type"
      />

      <ConfirmDeleteDialog
        open={isPlanDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeletePlan}
        itemName={itemToDeleteName}
        itemType="Subscription Plan"
      />
    </>
  );
}

export default SubscriptionTypeCard;
