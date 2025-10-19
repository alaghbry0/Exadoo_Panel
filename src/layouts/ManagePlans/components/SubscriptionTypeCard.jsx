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
  Chip,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import LinkIcon from "@mui/icons-material/Link";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { deleteSubscriptionPlan, deleteSubscriptionType } from "services/api";

import AddSubscriptionPlanModal from "./AddSubscriptionPlanModal";
import EditSubscriptionPlanModal from "./EditSubscriptionPlanModal";
import ConfirmDeleteDialog from "./SubscriptionDelete";
import BatchStatusIndicator from "./BatchStatusIndicator";

// JSON safe
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

function SubscriptionTypeCard({
  subscriptionType,
  plans,
  onDataChange,
  onEdit,
  batchStatus,
  onStatusClick,
  sx,
}) {
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  const handlePlanChange = () => {
    onDataChange();
    setIsAddPlanModalOpen(false);
    setIsEditPlanModalOpen(false);
    setSelectedPlan(null);
  };

  const confirmDeleteSubscriptionType = async () => {
    try {
      await deleteSubscriptionType(subscriptionType.id);
      onDataChange();
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
      onDataChange();
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

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

  const displayPrice = (plan) => {
    const price = parseFloat(plan.price);
    const originalPrice = parseFloat(plan.original_price);
    if (!Number.isNaN(originalPrice) && originalPrice > price) {
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

  const featuresArray = parseJsonSafe(subscriptionType.features);
  const termsArray = parseJsonSafe(subscriptionType.terms_and_conditions);
  const mainChannelInfo = subscriptionType.linked_channels?.find((ch) => ch.is_main);
  const secondaryChannelsInfo = subscriptionType.linked_channels?.filter((ch) => !ch.is_main) || [];
  const hasDetails =
    mainChannelInfo ||
    secondaryChannelsInfo.length > 0 ||
    featuresArray.length > 0 ||
    termsArray.length > 0;

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
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Tooltip title={subscriptionType.name}>
              <MDTypography variant="h6" fontWeight="bold" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                {subscriptionType.name}
              </MDTypography>
            </Tooltip>
            <MDBox display="flex" gap={0.5}>
              <Tooltip title="Edit Type">
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

          <MDBox px={0} pb={1} mt={1}>
            <BatchStatusIndicator status={batchStatus} onClick={onStatusClick} />
          </MDBox>

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

          {secondaryChannelsInfo.length > 0 && (
            <MDBox mt={0.5} mb={1.5}>
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
                    <ListItemIcon sx={{ minWidth: "20px", mr: 0.5 }}>
                      <LinkIcon fontSize="small" color="action" />
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
                    <MDTypography variant="caption" color="text.secondary">
                      {feature}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          )}

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
                {termsArray.map((term, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.2, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ minWidth: "18px", marginRight: "6px", mt: "3px" }}>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color="success"
                        sx={{ fontSize: "0.85rem" }}
                      />
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

          <MDBox flexGrow={1} />
          {hasDetails && <Divider sx={{ my: 1.5 }} />}

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
                        bgcolor: plan.is_trial ? "rgba(0,200,83,0.08)" : "grey.100",
                        "&:hover": { bgcolor: "grey.200" },
                      }}
                    >
                      <ListItemText
                        primary={
                          <MDBox display="flex" alignItems="center" gap={1}>
                            <MDTypography variant="body2" fontWeight="medium">
                              {plan.name}
                            </MDTypography>
                            {plan.is_trial && (
                              <Chip
                                size="small"
                                color="success"
                                label="TRIAL"
                                sx={{ height: 20 }}
                              />
                            )}
                          </MDBox>
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

      <AddSubscriptionPlanModal
        open={isAddPlanModalOpen}
        onClose={() => setIsAddPlanModalOpen(false)}
        subscriptionTypeId={subscriptionType.id}
        onPlanAdded={handlePlanChange}
      />

      {selectedPlan && (
        <EditSubscriptionPlanModal
          open={isEditPlanModalOpen}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onPlanUpdated={handlePlanChange}
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
