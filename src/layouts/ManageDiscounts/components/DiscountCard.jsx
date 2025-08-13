// src/layouts/ManageDiscounts/components/DiscountCard.jsx

import React, { useState } from "react";
import { Card, Chip, Tooltip, IconButton, Divider, Box, LinearProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LayersIcon from "@mui/icons-material/Layers";
import LockClockIcon from "@mui/icons-material/LockClock"; // أيقونة أفضل لتثبيت السعر
import { useSnackbar } from "notistack";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { applyDiscountToExisting } from "services/api";

function DiscountCard({ discount, onEdit, onDataChange }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isApplying, setIsApplying] = useState(false);

  // ⭐ الاعتماد على is_tiered بدلاً من is_tiered_pricing
  const isTiered = discount.is_tiered;

  const handleApply = async () => {
    if (discount.potential_recipients_count === 0) return;
    setIsApplying(true);
    try {
      const response = await applyDiscountToExisting(discount.id);
      enqueueSnackbar(response.message || "Discount applied successfully!", { variant: "success" });
      onDataChange(); // تحديث البيانات بعد التطبيق الناجح
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || "Failed to apply.", { variant: "error" });
    } finally {
      setIsApplying(false);
    }
  };

  const audienceColors = { all_new: "success", existing_subscribers: "warning" };
  const activeTier =
    isTiered && Array.isArray(discount.tiers)
      ? discount.tiers.find((t) => t.is_active && t.used_slots < t.max_slots)
      : null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox p={2.5} flexGrow={1}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <MDTypography variant="h6" fontWeight="bold">
              {discount.name}
            </MDTypography>
            <Chip
              label={isTiered ? "Tiered Discount" : "Standard Discount"}
              color={isTiered ? "info" : "secondary"}
              size="small"
              sx={{ mt: 0.5, textTransform: "capitalize" }}
            />
          </Box>
          <Tooltip title="Edit Discount">
            <IconButton size="small" onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </MDBox>
        <MDTypography variant="body2" sx={{ color: "text.secondary", mt: 1, minHeight: "40px" }}>
          {discount.description || "No description provided."}
        </MDTypography>
        <Divider sx={{ my: 2 }} />

        {/* Details */}
        <MDBox display="flex" flexDirection="column" gap={1.5}>
          <MDBox display="flex" justifyContent="space-between">
            <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
              Target
            </MDTypography>
            <Chip
              label={discount.target_audience.replace(/_/g, " ")}
              color={audienceColors[discount.target_audience] || "default"}
              size="small"
            />
          </MDBox>
          <MDBox display="flex" justifyContent="space-between">
            <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
              Status
            </MDTypography>
            <Chip
              label={discount.is_active ? "Active" : "Inactive"}
              color={discount.is_active ? "success" : "default"}
              size="small"
            />
          </MDBox>
          {/* ⭐ تحسين عرض تثبيت السعر */}
          {discount.lock_in_price && (
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDBox display="flex" alignItems="center" gap={0.5}>
                <LockClockIcon fontSize="small" color="action" />
                <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                  Price Lock
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" fontWeight="medium">
                {discount.price_lock_duration_months
                  ? `${discount.price_lock_duration_months} months`
                  : "Permanent"}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

        <Divider sx={{ my: 2 }} />
        <MDTypography variant="subtitle2" fontWeight="medium" mb={1.5}>
          Statistics
        </MDTypography>

        {/* Stats */}
        <MDBox display="flex" flexDirection="column" gap={2}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox display="flex" alignItems="center" gap={0.5}>
              <CheckCircleIcon fontSize="small" color="success" />
              <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                Active Holders
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" fontWeight="bold">
              {discount.active_holders_count}
            </MDTypography>
          </MDBox>

          {/* ⭐ إعادة هيكلة عرض إحصائيات الاستخدام */}
          {isTiered ? (
            <Box>
              <MDBox display="flex" alignItems="center" gap={0.5} mb={1}>
                <LayersIcon fontSize="small" color="info" />
                <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                  Active Tier Progress
                </MDTypography>
              </MDBox>
              {activeTier ? (
                <>
                  <MDTypography variant="body2" fontWeight="medium" gutterBottom>
                    {activeTier.discount_value}% OFF
                  </MDTypography>
                  <LinearProgress
                    variant="determinate"
                    value={(activeTier.used_slots / activeTier.max_slots) * 100}
                  />
                  <MDBox display="flex" justifyContent="space-between" mt={0.5}>
                    <MDTypography variant="caption">{activeTier.used_slots} used</MDTypography>
                    <MDTypography variant="caption">{activeTier.max_slots} total</MDTypography>
                  </MDBox>
                </>
              ) : (
                <MDTypography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                >
                  All tiers consumed or inactive.
                </MDTypography>
              )}
            </Box>
          ) : (
            // عرض إحصائيات الخصم العادي فقط إذا كان لديه حد أقصى للمستخدمين
            discount.max_users && (
              <Box>
                <MDBox display="flex" alignItems="center" gap={0.5} mb={1}>
                  <PeopleIcon fontSize="small" color="primary" />
                  <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                    Usage Progress
                  </MDTypography>
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={(discount.usage_count / discount.max_users) * 100}
                />
                <MDBox display="flex" justifyContent="space-between" mt={0.5}>
                  <MDTypography variant="caption">{discount.usage_count} used</MDTypography>
                  <MDTypography variant="caption">{discount.max_users} total</MDTypography>
                </MDBox>
              </Box>
            )
          )}
        </MDBox>
      </MDBox>

      {/* Action Button */}
      {discount.target_audience === "existing_subscribers" && discount.is_active && (
        <Box p={2.5} pt={1} mt="auto">
          <MDButton
            variant="gradient"
            color="warning"
            fullWidth
            onClick={handleApply}
            disabled={isApplying || discount.potential_recipients_count === 0}
          >
            {isApplying ? "Applying..." : `Apply to ${discount.potential_recipients_count} Users`}
          </MDButton>
        </Box>
      )}
    </Card>
  );
}

export default DiscountCard;
