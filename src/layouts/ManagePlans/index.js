// src/layouts/ManagePlans/index.js
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button"; // استخدم MDButton ليكون متناسقًا
import AddIcon from "@mui/icons-material/Add";
import LinearProgress from "@mui/material/LinearProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // استيراد MDButton
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Card, Paper } from "@mui/material"; // Paper لإظهار رسالة "لا توجد أنواع" بشكل أفضل

import { getSubscriptionTypes } from "services/api";
import SubscriptionTypeCard from "layouts/ManagePlans/components/SubscriptionTypeCard";
// import SubscriptionSettings from "layouts/ManagePlans/components/SubscriptionSettings"; // تمت إزالة هذا
import AddSubscriptionTypeModal from "layouts/ManagePlans/components/AddSubscriptionTypeModal";
import { Box } from "@mui/material";

function ManagePlans() {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddTypeModal, setOpenAddTypeModal] = useState(false);

  const fetchTypes = async () => {
    setLoading(true); // تأكد من ضبط التحميل عند كل جلب
    try {
      const types = await getSubscriptionTypes();
      setSubscriptionTypes(types);
    } catch (error) {
      console.error("Error fetching subscription types:", error);
      // يمكنك هنا إضافة حالة لعرض رسالة خطأ للمستخدم إذا فشل جلب البيانات
      setSubscriptionTypes([]); // أفرغ الأنواع في حالة الخطأ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleTypeAdded = (newType) => {
    // إضافة النوع الجديد في بداية القائمة يجعله يظهر أولاً
    setSubscriptionTypes((prevTypes) => [newType, ...prevTypes]);
    // يمكنك أيضًا إعادة جلب القائمة كاملة إذا كان الـ backend يقوم بالفرز أو لديه منطق خاص
    // fetchTypes();
  };

  const handleOpenAddTypeModal = () => setOpenAddTypeModal(true);
  const handleCloseAddTypeModal = () => setOpenAddTypeModal(false);

  return (
    <DashboardLayout>
      <DashboardNavbar absolute={false} isMini /> {/* تأكد من أن isMini مناسبة أو أزلها */}
      <MDBox mt={{ xs: 4, md: 8 }} px={{ xs: 2, md: 3 }}>
        {" "}
        {/* تعديل mt و px لتباعد أفضل */}
        {/* Header Section */}
        <MDBox
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <MDTypography variant="h4" fontWeight="bold" color="dark">
            Manage Subscription Types & Plans
          </MDTypography>

          <MDButton // استخدام MDButton
            variant="gradient"
            color="info"
            startIcon={<AddIcon />}
            onClick={handleOpenAddTypeModal}
            aria-label="Add new subscription type"
            sx={{
              boxShadow: (theme) => theme.shadows[3],
              "&:hover": {
                boxShadow: (theme) => theme.shadows[5],
                transform: "translateY(-1px)",
              },
            }}
          >
            New Subscription Type
          </MDButton>
        </MDBox>
        {/* Loading State */}
        {loading ? (
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%", py: 10 }}
          >
            {/* يمكنك استخدام LinearProgress أو CircularProgress */}
            <LinearProgress color="info" sx={{ width: "50%", borderRadius: "4px" }} />
          </MDBox>
        ) : subscriptionTypes.length === 0 ? (
          // رسالة عند عدم وجود أنواع اشتراكات
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
                No Subscription Types Found
              </MDTypography>
              <MDTypography variant="body2" color="text.secondary" mb={3}>
                Get started by adding your first subscription type. Click the button below.
              </MDTypography>
              <MDButton
                variant="contained" // استخدام contained هنا لجعله أكثر بروزًا
                color="info"
                startIcon={<AddIcon />}
                onClick={handleOpenAddTypeModal}
              >
                Add Subscription Type
              </MDButton>
            </Paper>
          </MDBox>
        ) : (
          /* Subscription Cards Grid */
          <MDBox mb={6}>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {" "}
              {/* تعديل التباعد ليكون أكثر استجابة */}
              {subscriptionTypes.map((type) => (
                <Grid item xs={12} md={6} lg={4} key={type.id}>
                  <SubscriptionTypeCard
                    subscriptionType={type}
                    refreshTypes={fetchTypes}
                    // sx المضمنة في الكارت نفسه كافية، لا حاجة لإضافتها هنا إلا إذا أردت تجاوزها
                  />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}
        {/* Settings Section - تمت إزالته */}
        {/*
        <MDBox mb={6}>
          <SubscriptionSettings />
        </MDBox>
        */}
      </MDBox>
      {/* Add Subscription Modal */}
      <AddSubscriptionTypeModal
        open={openAddTypeModal}
        onClose={handleCloseAddTypeModal}
        onTypeAdded={handleTypeAdded}
        // sx المضمنة في Modal نفسه كافية، لا حاجة لإضافتها هنا إلا إذا أردت تجاوزها
        // sx={{
        //   "& .MuiDialog-paper": {
        //     borderRadius: "16px", // أو theme.shape.borderRadius * 4
        //     padding: "24px",      // أو theme.spacing(3)
        //   },
        // }}
      />
    </DashboardLayout>
  );
}

export default ManagePlans;
