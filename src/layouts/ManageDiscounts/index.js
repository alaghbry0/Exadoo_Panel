// src/layouts/ManageDiscounts/index.js

import React, { useState, useEffect, useCallback } from "react";
import { Grid, Box, Alert, LinearProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// API
// 1. تعديل استدعاءات API
import { getDiscounts, getSubscriptionData, getSubscriptionPlans } from "services/api";

// Components for this page
import DiscountCard from "./components/DiscountCard";
import DiscountFormModal from "./components/DiscountFormModal";

function ManageDiscounts() {
  const { enqueueSnackbar } = useSnackbar();
  const [discounts, setDiscounts] = useState([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]); // <-- ⭐ إضافة حالة جديدة للخطط
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. استخدام Promise.all لجلب كل شيء معًا
      const [discountsData, subsData, plansData] = await Promise.all([
        getDiscounts(),
        getSubscriptionData(true), // لجلب أنواع الاشتراكات
        getSubscriptionPlans(), // <-- ⭐ جلب كل الخطط
      ]);

      setDiscounts(discountsData || []);
      setSubscriptionTypes(subsData.flatMap((group) => group.subscription_types) || []);
      setAvailablePlans(plansData || []); // <-- ⭐ تخزين الخطط في الحالة
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (discount = null) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  const handleSuccess = () => {
    fetchData();
    handleCloseModal();
    enqueueSnackbar(editingDiscount ? "Discount updated!" : "Discount created!", {
      variant: "success",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={{ xs: 4, md: 8 }} px={{ xs: 2, md: 3 }}>
        <MDBox mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h4" fontWeight="bold">
            Manage Discounts
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            New Discount
          </MDButton>
        </MDBox>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={3}>
          {discounts.map((discount) => (
            <Grid item xs={12} md={6} lg={4} key={discount.id}>
              <DiscountCard
                discount={discount}
                onEdit={() => handleOpenModal(discount)}
                onDataChange={fetchData}
              />
            </Grid>
          ))}
        </Grid>

        {discounts.length === 0 && !loading && (
          <MDTypography variant="body1" color="text.secondary" textAlign="center" mt={5}>
            No discounts found. Click "New Discount" to get started.
          </MDTypography>
        )}
      </MDBox>

      {isModalOpen && (
        <DiscountFormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          initialData={editingDiscount}
          subscriptionTypes={subscriptionTypes}
          availablePlans={availablePlans} // <-- ⭐ تمرير الخطط إلى الـ Modal
        />
      )}
    </DashboardLayout>
  );
}

export default ManageDiscounts;
