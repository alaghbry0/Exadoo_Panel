// src/layouts/ManageDiscounts/components/DiscountCard.jsx

import React, { useState } from "react";
import { Card, Chip, Tooltip, IconButton, Divider, Box, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSnackbar } from "notistack";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// 1. استيراد الخدمات ومكون التأكيد الجديد
import { applyDiscountToExisting } from "services/api";
import ConfirmationDialog from "./ConfirmationDialog"; // تأكد من أن هذا المسار صحيح في مشروعك

function DiscountCard({ discount, onEdit, onDataChange }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isApplying, setIsApplying] = useState(false);

  // 2. حالة جديدة للتحكم في نافذة التأكيد
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 3. فصل منطق الضغط على الزر عن منطق التنفيذ الفعلي
  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  // 4. هذه الدالة سيتم استدعاؤها الآن فقط بعد التأكيد من الـ Dialog
  const handleApplyConfirm = async () => {
    setIsConfirmOpen(false); // أغلق نافذة التأكيد أولاً
    setIsApplying(true); // ابدأ التحميل
    try {
      const response = await applyDiscountToExisting(discount.id);
      enqueueSnackbar(response.message || "Discount applied successfully!", { variant: "success" });
      onDataChange(); // تحديث البيانات لإظهار active_holders_count الجديد
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || "Failed to apply discount.", {
        variant: "error",
      });
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const audienceColors = {
    all_new: "success",
    existing_subscribers: "warning",
    specific_users: "info",
  };

  const potential_count = discount.potential_recipients_count || 0;

  return (
    <>
      {" "}
      {/* 5. استخدام Fragment للسماح بوجود مكونين على نفس المستوى */}
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <MDBox p={2.5} flexGrow={1}>
          <MDBox display="flex" justifyContent="space-between" alignItems="start">
            <MDTypography variant="h6" fontWeight="bold">
              {discount.name}
            </MDTypography>
            <Tooltip title="Edit Discount">
              <IconButton size="small" onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </MDBox>
          <MDTypography variant="body2" color="text.secondary" mt={1}>
            {discount.description || "No description."}
          </MDTypography>
          <Divider sx={{ my: 2 }} />
          <MDBox display="flex" flexDirection="column" gap={1.5}>
            <MDBox display="flex" justifyContent="space-between">
              <MDTypography variant="caption" color="text.secondary">
                Discount
              </MDTypography>
              <MDTypography variant="body2" fontWeight="medium">
                {discount.discount_value} {discount.discount_type === "percentage" ? "%" : "$"} OFF
              </MDTypography>
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
              <MDTypography variant="caption" color="text.secondary">
                Target Audience
              </MDTypography>
              <Chip
                label={discount.target_audience.replace(/_/g, " ")}
                color={audienceColors[discount.target_audience] || "default"}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
              <MDTypography variant="caption" color="text.secondary">
                Price Lock-in
              </MDTypography>
              <MDTypography
                variant="body2"
                fontWeight="medium"
                color={discount.lock_in_price ? "success.main" : "error.main"}
              >
                {discount.lock_in_price ? "Yes" : "No"}
              </MDTypography>
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
              <MDTypography variant="caption" color="text.secondary">
                Status
              </MDTypography>
              <Chip
                label={discount.is_active ? "Active" : "Inactive"}
                color={discount.is_active ? "success" : "default"}
                size="small"
              />
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 2 }} />
          <MDTypography variant="subtitle2" fontWeight="medium" mb={1.5}>
            Statistics
          </MDTypography>
          <MDBox display="flex" flexDirection="column" gap={1.5}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDBox display="flex" alignItems="center" gap={0.5}>
                <CheckCircleIcon fontSize="small" color="success" />
                <MDTypography variant="caption" color="text.secondary">
                  Active Holders
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" fontWeight="bold">
                {discount.active_holders_count}
              </MDTypography>
            </MDBox>

            {discount.target_audience === "existing_subscribers" && (
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox display="flex" alignItems="center" gap={0.5}>
                  <PeopleIcon fontSize="small" color="warning" />
                  <MDTypography variant="caption" color="text.secondary">
                    Potential Recipients
                  </MDTypography>
                  <Tooltip title="Number of active users in the target subscription type who will receive this discount if you apply it.">
                    <HelpOutlineIcon
                      sx={{ fontSize: "1rem", color: "text.disabled", cursor: "pointer" }}
                    />
                  </Tooltip>
                </MDBox>
                <MDTypography variant="body2" fontWeight="bold">
                  {potential_count}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </MDBox>

        {discount.target_audience === "existing_subscribers" && discount.is_active && (
          <Box p={2.5} pt={1}>
            <MDButton
              variant="gradient"
              color="warning"
              fullWidth
              // 6. تعديل onClick ليفتح نافذة التأكيد بدلاً من التنفيذ المباشر
              onClick={handleOpenConfirm}
              disabled={isApplying || potential_count === 0}
              startIcon={
                isApplying ? <CircularProgress size={20} color="inherit" /> : <PeopleIcon />
              }
            >
              {isApplying ? "Applying..." : `Apply to ${potential_count} Users`}
            </MDButton>
          </Box>
        )}
      </Card>
      {/* 7. إضافة مكون التأكيد هنا */}
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleApplyConfirm}
        title="Confirm Action"
        content={`Are you sure you want to apply the "${discount.name}" discount to ${potential_count} user(s)? This action cannot be undone.`}
      />
    </>
  );
}

export default DiscountCard;
