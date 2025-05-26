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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// دالة مساعدة لتحليل JSON بأمان
const parseJsonSafe = (jsonString, fieldNameForErrorLog) => {
  if (typeof jsonString === "string") {
    try {
      const parsed = JSON.parse(jsonString);
      // تأكد أنها مصفوفة، وإلا أرجع مصفوفة فارغة
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(
        `Failed to parse ${fieldNameForErrorLog} JSON string in SubscriptionTypeCard:`,
        jsonString,
        e
      );
      // يمكنك اختيار عرض رسالة خطأ ضمن البيانات أو إرجاع مصفوفة فارغة
      // return [`Error: Invalid ${fieldNameForErrorLog} format`];
      return [];
    }
  } else if (Array.isArray(jsonString)) {
    return jsonString;
  } else if (jsonString === null || jsonString === undefined) {
    return []; // تعامل مع null أو undefined كأنها مصفوفة فارغة
  }
  // إذا لم تكن أيًا مما سبق، افترض أنها بيانات غير صالحة
  console.warn(
    `${fieldNameForErrorLog} field is not a string, array, null, or undefined, defaulting to empty array. Original:`,
    jsonString
  );
  return [];
};

function SubscriptionTypeCard({ subscriptionType, refreshTypes, sx }) {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  const fetchPlans = async () => {
    if (!subscriptionType || !subscriptionType.id) {
      setPlans([]); // أفرغ الخطط إذا لم يكن هناك نوع محدد
      setLoadingPlans(false);
      return;
    }
    setLoadingPlans(true);
    try {
      const data = await getSubscriptionPlans(subscriptionType.id);
      setPlans(data);
    } catch (error) {
      console.error(`Error fetching plans for subscription type ${subscriptionType.id}:`, error);
      setPlans([]); // أفرغ الخطط في حالة الخطأ
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
    refreshTypes(); // لتحديث قائمة الأنواع الرئيسية
    // لا حاجة لتحديث الخطط هنا لأنها مرتبطة بـ subscriptionType.id الذي لم يتغير
    closeEditDialog();
  };

  const openAddPlanModalHandler = () => setIsAddPlanModalOpen(true);
  const closeAddPlanModalHandler = () => setIsAddPlanModalOpen(false);
  const handlePlanAdded = () => {
    fetchPlans(); // إعادة جلب الخطط بعد إضافة خطة جديدة
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
    fetchPlans(); // إعادة جلب الخطط بعد تحديث خطة
    closeEditPlanModalHandler();
  };

  const openDeleteConfirmationDialogForType = () => {
    setItemToDeleteName(subscriptionType.name);
    // لا حاجة لـ setItemToDeleteId هنا لأننا نستخدم subscriptionType.id مباشرة
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
    // إعادة تعيين itemToDeleteId و itemToDeleteName هنا أيضًا لضمان النظافة
    setItemToDeleteId(null);
    setItemToDeleteName("");
  };

  const confirmDeleteSubscriptionType = async () => {
    try {
      await deleteSubscriptionType(subscriptionType.id);
      refreshTypes(); // لتحديث قائمة الأنواع بعد الحذف
    } catch (err) {
      console.error("Error deleting subscription type", err);
      // يمكنك إضافة تنبيه للمستخدم هنا
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  const confirmDeletePlan = async () => {
    if (!itemToDeleteId) return;
    try {
      await deleteSubscriptionPlan(itemToDeleteId);
      fetchPlans(); // إعادة جلب الخطط بعد حذف خطة
    } catch (error) {
      console.error("Error deleting plan:", error);
      // يمكنك إضافة تنبيه للمستخدم هنا
    } finally {
      closeDeleteConfirmationDialog();
    }
  };

  const displayPrice = (plan) => {
    const price = parseFloat(plan.price);
    const originalPrice = parseFloat(plan.original_price);

    if (!isNaN(originalPrice) && originalPrice > price) {
      return (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="body2" fontWeight="medium" color="dark" mr={0.5}>
            {" "}
            {/* تعديل mr */}${price.toFixed(2)}
          </MDTypography>
          <MDTypography
            variant="caption"
            color="text.secondary"
            sx={{ textDecoration: "line-through" }}
          >
            {" "}
            {/* تعديل variant */}${originalPrice.toFixed(2)}
          </MDTypography>
        </MDBox>
      );
    }
    return `$${price.toFixed(2)}`;
  };

  const featuresArray = parseJsonSafe(subscriptionType.features, "features");
  const termsArray = parseJsonSafe(subscriptionType.terms_and_conditions, "terms_and_conditions");

  const mainChannelInfo = subscriptionType.linked_channels?.find((ch) => ch.is_main === true);
  const secondaryChannelsInfo =
    subscriptionType.linked_channels?.filter((ch) => ch.is_main === false) || [];

  const hasDetails =
    mainChannelInfo ||
    secondaryChannelsInfo.length > 0 ||
    featuresArray.length > 0 ||
    termsArray.length > 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: (theme) => theme.shadows[6], // تعديل طفيف لقوة الظل
        },
        ...sx, // دمج أي sx خارجية
      }}
    >
      <MDBox p={{ xs: 2, sm: 2.5 }} flexGrow={1} display="flex" flexDirection="column">
        {" "}
        {/* تعديل padding ليكون متجاوبًا */}
        {/* Card Header: Name and Actions */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Tooltip title={subscriptionType.name}>
            <MDTypography
              variant="h6"
              fontWeight="bold"
              color="dark"
              sx={{
                flexGrow: 1,
                mr: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subscriptionType.name}
            </MDTypography>
          </Tooltip>
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
                    "&::marker": { fontSize: "0.85em", color: (theme) => theme.palette.info.main },
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
        {/* Spacer to push plans section to the bottom */}
        <MDBox flexGrow={1} />
        {/* Divider if there are any details shown above plans */}
        {hasDetails && <Divider sx={{ my: 1.5 }} />}
        {/* Subscription Plans Section */}
        <MDBox>
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={hasDetails ? 0.5 : 1.5}
            mb={1}
          >
            <MDTypography variant="subtitle2" fontWeight="bold" color="text.primary">
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

          <MDBox minHeight={{ xs: "70px", sm: "80px" }}>
            {" "}
            {/* تعديل ارتفاع minHeight */}
            {loadingPlans ? (
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={3}
                sx={{ height: "100%" }}
              >
                <CircularProgress color="info" size={28} /> {/* تعديل حجم Progress */}
              </MDBox>
            ) : plans.length === 0 ? (
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={3}
                sx={{ height: "100%" }}
              >
                {" "}
                {/* تعديل py */}
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
                      py: 0.75,
                      px: 1.5, // تعديل px
                      mb: 0.75, // تعديل mb
                      borderRadius: (theme) => theme.shape.borderRadius,
                      backgroundColor: (theme) => theme.palette.grey[100],
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.grey[200],
                        boxShadow: (theme) => theme.shadows[1], // إضافة ظل خفيف عند الـ hover
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <MDTypography variant="body2" fontWeight="medium" color="text.primary">
                          {" "}
                          {/* تعديل variant */}
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

      {/* Modals */}
      <EditSubscriptionTypeModal
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        subscriptionTypeData={subscriptionType}
        onTypeUpdated={handleTypeUpdated}
      />
      <AddSubscriptionPlanModal
        open={isAddPlanModalOpen}
        onClose={closeAddPlanModalHandler}
        subscriptionTypeId={subscriptionType.id}
        onPlanAdded={handlePlanAdded}
      />
      {selectedPlan && ( // عرض النموذج فقط إذا كان هناك selectedPlan
        <EditSubscriptionPlanModal
          open={isEditPlanModalOpen}
          onClose={closeEditPlanModalHandler}
          plan={selectedPlan}
          onPlanUpdated={handlePlanUpdated}
        />
      )}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeleteSubscriptionType}
        itemName={itemToDeleteName || subscriptionType.name} // fallback
        itemType="Subscription Type"
      />
      <ConfirmDeleteDialog
        open={isPlanDeleteDialogOpen}
        onClose={closeDeleteConfirmationDialog}
        onConfirm={confirmDeletePlan}
        itemName={itemToDeleteName} // هذا يجب أن يكون اسم الخطة
        itemType="Subscription Plan"
      />
    </Card>
  );
}

export default SubscriptionTypeCard;
