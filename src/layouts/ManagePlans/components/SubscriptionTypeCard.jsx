// src/layouts/ManagePlans/components/SubscriptionTypeCard.jsx
import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { getSubscriptionPlans, deleteSubscriptionPlan, deleteSubscriptionType } from "services/api";
import EditSubscriptionTypeModal from "./EditSubscriptionTypeModal";
import AddSubscriptionPlanModal from "./AddSubscriptionPlanModal";
import EditSubscriptionPlanModal from "./EditSubscriptionPlanModal";
import ConfirmDeleteDialog from "./SubscriptionDelete";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import LinkIcon from "@mui/icons-material/Link";
import StarIcon from "@mui/icons-material/Star";

function SubscriptionTypeCard({ subscriptionType, refreshTypes }) {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false); // <--- تأكد من تعريفها هنا
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  const fetchPlans = async () => {
    if (!subscriptionType || !subscriptionType.id) return;
    setLoadingPlans(true);
    try {
      const data = await getSubscriptionPlans(subscriptionType.id);
      setPlans(data);
    } catch (error) {
      console.error(`Error fetching plans for subscription type ${subscriptionType.id}:`, error);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [subscriptionType.id]);

  const openEditDialog = () => setIsEditDialogOpen(true);
  const closeEditDialog = () => setIsEditDialogOpen(false);

  const handleTypeUpdated = (updatedType) => {
    refreshTypes();
    closeEditDialog();
  };

  const openAddPlanModalHandler = () => setIsAddPlanModalOpen(true); // <--- دالة لفتح نموذج إضافة خطة
  const closeAddPlanModalHandler = () => setIsAddPlanModalOpen(false);
  const handlePlanAdded = () => {
    // newPlan غير مستخدم هنا، فقط أعد جلب الخطط
    fetchPlans();
    closeAddPlanModalHandler();
  };

  const openEditPlanModalHandler = (plan) => {
    setSelectedPlan(plan);
    setIsEditPlanModalOpen(true);
  };
  const closeEditPlanModalHandler = () => {
    setIsEditPlanModalOpen(false);
    setSelectedPlan(null);
  };
  const handlePlanUpdated = () => {
    // updatedPlan غير مستخدم
    fetchPlans();
    closeEditPlanModalHandler();
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
    if (!itemToDeleteId) return;
    try {
      await deleteSubscriptionPlan(itemToDeleteId);
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      closeDeleteConfirmationDialog();
      setItemToDeleteId(null);
      setItemToDeleteName("");
    }
  };

  const displayPrice = (plan) => {
    if (plan.original_price && parseFloat(plan.original_price) > parseFloat(plan.price)) {
      return (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="body2" fontWeight="medium" color="dark" mr={1}>
            ${plan.price}
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ textDecoration: "line-through" }}>
            ${plan.original_price}
          </MDTypography>
        </MDBox>
      );
    }
    return `$${plan.price}`;
  };

  // معالجة features إذا كانت نص JSON
  let featuresArray = subscriptionType.features;
  if (typeof subscriptionType.features === "string") {
    try {
      featuresArray = JSON.parse(subscriptionType.features);
    } catch (e) {
      console.error("Failed to parse features JSON string:", subscriptionType.features, e);
      featuresArray = []; // قيمة افتراضية في حالة الخطأ
    }
  }
  if (!Array.isArray(featuresArray)) {
    featuresArray = []; // تأكد أنها مصفوفة دائمًا
  }

  const mainChannelInfo = subscriptionType.linked_channels?.find((ch) => ch.is_main === true); // تحقق صريح من true
  const secondaryChannelsInfo =
    subscriptionType.linked_channels?.filter((ch) => ch.is_main === false) || [];

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={2.5}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <MDTypography
            variant="h6"
            fontWeight="bold"
            color="dark"
            sx={{ flexGrow: 1, mr: 1 }}
            noWrap
          >
            {subscriptionType.name}
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={0.5}>
            <Tooltip title="Edit Type">
              <IconButton aria-label="edit-type" color="info" size="small" onClick={openEditDialog}>
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

        {subscriptionType.main_channel_id && (
          <MDBox mb={1} display="flex" alignItems="center">
            <Tooltip title="Main Channel">
              <StarIcon color="warning" sx={{ mr: 0.5, fontSize: "1.1rem" }} />
            </Tooltip>
            <MDTypography variant="body2" color="text" fontWeight="regular">
              {" "}
              {/* غيّر color="text" */}
              Main: ID {subscriptionType.main_channel_id}
              {mainChannelInfo && mainChannelInfo.channel_name
                ? ` (${mainChannelInfo.channel_name})`
                : ""}
            </MDTypography>
          </MDBox>
        )}

        {secondaryChannelsInfo.length > 0 && (
          <MDBox mt={1} mb={1.5}>
            <MDTypography
              variant="caption"
              fontWeight="bold"
              color="text"
              sx={{ color: "text.secondary" }}
              textTransform="uppercase"
              display="block"
              mb={0.5}
            >
              Secondary Channels:
            </MDTypography>
            <List dense disablePadding sx={{ pl: 0.5 }}>
              {secondaryChannelsInfo.map((channel) => (
                <ListItem key={channel.channel_id} disableGutters sx={{ py: 0.1 }}>
                  <ListItemIcon sx={{ minWidth: "24px" }}>
                    <LinkIcon fontSize="inherit" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <MDTypography variant="caption" color="text" sx={{ color: "text.secondary" }}>
                        {" "}
                        {/* غيّر color="text" واستخدم sx */}
                        ID {channel.channel_id}{" "}
                        {channel.channel_name ? `(${channel.channel_name})` : ""}
                      </MDTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>
        )}

        {featuresArray.length > 0 && (
          <MDBox mt={secondaryChannelsInfo.length > 0 ? 0.5 : 1} mb={1.5}>
            <MDTypography
              variant="caption"
              fontWeight="bold"
              color="text"
              sx={{ color: "text.secondary" }}
              textTransform="uppercase"
              display="block"
              mb={0.5}
            >
              Features:
            </MDTypography>
            <MDBox
              component="ul"
              pl={2.5}
              mt={0}
              sx={{ listStyleType: "disc", marginBlockStart: 0, marginBlockEnd: 0 }}
            >
              {featuresArray.map((feature, index) => (
                <MDBox
                  component="li"
                  key={index}
                  mb={0}
                  sx={{ "&::marker": { fontSize: "0.9em" } }}
                >
                  <MDTypography variant="caption" color="text" sx={{ color: "text.secondary" }}>
                    {" "}
                    {/* غيّر color="text" واستخدم sx */}
                    {feature}
                  </MDTypography>
                </MDBox>
              ))}
            </MDBox>
          </MDBox>
        )}

        {(mainChannelInfo || secondaryChannelsInfo.length > 0 || featuresArray.length > 0) && (
          <Divider sx={{ my: 1.5 }} />
        )}

        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5} mb={1}>
          <MDTypography variant="subtitle2" fontWeight="bold" color="text">
            {" "}
            {/* غيّر color="text" */}
            Subscription Plans
          </MDTypography>
          <Tooltip title="Add New Plan">
            {/* الخطأ هنا: يجب أن تستدعي دالة الحالة */}
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

        <MDBox minHeight="80px">
          {loadingPlans ? (
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={2}
              sx={{ height: "100%" }}
            >
              <CircularProgress color="info" size={24} />
            </MDBox>
          ) : plans.length === 0 ? (
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={2}
              sx={{ height: "100%" }}
            >
              <MDTypography
                variant="caption"
                color="text"
                sx={{ color: "text.secondary" }}
                fontStyle="italic"
              >
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
                          aria-label="edit-plan"
                          color="info"
                          size="small"
                          onClick={() => openEditPlanModalHandler(plan)}
                        >
                          <Icon fontSize="small">edit</Icon>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Plan">
                        <IconButton
                          aria-label="delete-plan"
                          color="error"
                          size="small"
                          onClick={() => openDeleteConfirmationDialogForPlan(plan)}
                        >
                          <Icon fontSize="small">delete</Icon>
                        </IconButton>
                      </Tooltip>
                    </MDBox>
                  }
                  sx={{
                    py: 0.5,
                    px: 1,
                    mb: 0.5,
                    borderRadius: "md",
                    backgroundColor: (theme) => theme.palette.grey[100],
                    "&:hover": { backgroundColor: (theme) => theme.palette.grey[200] },
                  }}
                >
                  <ListItemText
                    primary={
                      <MDTypography variant="caption" fontWeight="medium" color="textPrimary">
                        {" "}
                        {/* textPrimary أو dark */}
                        {plan.name}
                      </MDTypography>
                    }
                    secondary={
                      <MDTypography variant="caption" color="text" sx={{ color: "text.secondary" }}>
                        {" "}
                        {/* غيّر color="text" واستخدم sx */}
                        {displayPrice(plan)} for {plan.duration_days} days
                        {plan.telegram_stars_price > 0 && ` / Stars: ${plan.telegram_stars_price}`}
                      </MDTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </MDBox>
      </MDBox>

      <EditSubscriptionTypeModal
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        subscriptionTypeId={subscriptionType.id}
        onTypeUpdated={handleTypeUpdated}
      />
      <AddSubscriptionPlanModal
        open={isAddPlanModalOpen}
        onClose={closeAddPlanModalHandler} // <--- استدع الدالة الصحيحة
        subscriptionTypeId={subscriptionType.id}
        onPlanAdded={handlePlanAdded}
      />
      <EditSubscriptionPlanModal
        open={isEditPlanModalOpen}
        onClose={closeEditPlanModalHandler} // <--- استدع الدالة الصحيحة
        plan={selectedPlan}
        onPlanUpdated={handlePlanUpdated}
      />
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeleteSubscriptionType}
        itemName={itemToDeleteName}
        itemType="Subscription Type"
      />
      <ConfirmDeleteDialog
        open={isPlanDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeletePlan}
        itemName={itemToDeleteName}
        itemType="Subscription Plan"
      />
    </Card>
  );
}

export default SubscriptionTypeCard;
