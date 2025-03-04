// src/pages/ManagePlans.jsx
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import LinearProgress from "@mui/material/LinearProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { getSubscriptionTypes } from "services/api";
import SubscriptionTypeCard from "layouts/ManagePlans/components/SubscriptionTypeCard";
import SubscriptionSettings from "layouts/ManagePlans/components/SubscriptionSettings";
import AddSubscriptionTypeModal from "layouts/ManagePlans/components/AddSubscriptionTypeModal";
import { Box } from "@mui/material"; // تم اضافة هذا السطر

function ManagePlans() {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddTypeModal, setOpenAddTypeModal] = useState(false);

  const fetchTypes = async () => {
    try {
      const types = await getSubscriptionTypes();
      setSubscriptionTypes(types);
    } catch (error) {
      console.error("Error fetching subscription types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleTypeAdded = (newType) => {
    setSubscriptionTypes((prevTypes) => [newType, ...prevTypes]);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar absolute={false} isMini />

      <MDBox mt={8} px={{ xs: 1, md: 3 }}>
        {/* Header Section */}
        <MDBox mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h4" fontWeight="bold" color="dark">
            Manage Subscription Plans
          </MDTypography>

          <Button
            variant="gradient"
            color="info"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddTypeModal(true)}
            aria-label="Add new subscription type"
            sx={{
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-1px)",
              },
            }}
          >
            New Subscription Type
          </Button>
        </MDBox>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ width: "100%", p: 4 }}>
            <LinearProgress color="primary" />
          </Box>
        ) : (
          /* Subscription Cards Grid */
          <MDBox mb={6}>
            <Grid container spacing={4}>
              {subscriptionTypes.map((type) => (
                <Grid item xs={12} md={6} lg={4} key={type.id}>
                  <SubscriptionTypeCard
                    subscriptionType={type}
                    refreshTypes={fetchTypes}
                    sx={{
                      height: "100%",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Settings Section */}
        <MDBox mb={6}>
          <SubscriptionSettings />
        </MDBox>
      </MDBox>

      {/* Add Subscription Modal */}
      <AddSubscriptionTypeModal
        open={openAddTypeModal}
        onClose={() => setOpenAddTypeModal(false)}
        onTypeAdded={handleTypeAdded}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            padding: "24px",
          },
        }}
      />
    </DashboardLayout>
  );
}

export default ManagePlans;
