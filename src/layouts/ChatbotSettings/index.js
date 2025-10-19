// src/layouts/ChatbotSettings/index.js
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import DataObjectIcon from "@mui/icons-material/DataObject";
import HomeIcon from "@mui/icons-material/Home";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { fetchChatbotSettings } from "services/api";

// Import components
import GeneralSettingsTab from "./components/GeneralSettingsTab";
import KnowledgeBaseTab from "./components/KnowledgeBaseTab";
import KnowledgeBaseItemModal from "./components/KnowledgeBaseItemModal";

// تخطيط الصفحة ومكونات واجهة المستخدم
function ChatbotSettings() {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    name: "",
    system_instructions: "",
    welcome_message: "",
    fallback_message: "",
    temperature: 0.1,
    max_tokens: 500,
    faq_questions: [],
  });
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    color: "info",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState(new Set());
  const [knowledgeBase, setKnowledgeBase] = useState({
    items: [],
    total: 0,
    page: 1,
    per_page: 10,
    pages: 1,
  });
  const [refreshAnimation, setRefreshAnimation] = useState(false);

  // فئات معرفة افتراضية
  const defaultCategories = ["عام", "منتجات", "خدمات", "أسئلة شائعة", "دعم تقني"];

  // تحميل الإعدادات عند بدء التشغيل
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setRefreshAnimation(true);
      const response = await fetchChatbotSettings();
      const settingsData = response.data; // تأكد من أن البيانات موجودة في response.data

      // معالجة الأسئلة الشائعة
      let processedFaqQuestions = [];
      if (typeof settingsData.faq_questions === "string") {
        try {
          // تنظيف السلسلة وتحليلها
          const cleanString = settingsData.faq_questions.replace(/\\/g, "");
          const jsonStart = cleanString.indexOf("[");
          const jsonEnd = cleanString.lastIndexOf("]") + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonArray = cleanString.substring(jsonStart, jsonEnd);
            processedFaqQuestions = JSON.parse(jsonArray);
          }
        } catch (e) {
          console.error("خطأ في تحليل الأسئلة:", e);
        }
      } else if (Array.isArray(settingsData.faq_questions)) {
        processedFaqQuestions = settingsData.faq_questions;
      }

      setSettings({
        ...settingsData,
        faq_questions: processedFaqQuestions,
      });

      setTimeout(() => {
        setRefreshAnimation(false);
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error("Error loading settings:", error);
      showErrorMessage("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.");
      setRefreshAnimation(false);
      setLoading(false);
    }
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setAlertInfo({
      show: true,
      message: message,
      color: "success",
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setAlertInfo({ show: false, message: "", color: "info" });
    }, 5000);
  };

  // Show error message
  const showErrorMessage = (message) => {
    setAlertInfo({
      show: true,
      message: message,
      color: "error",
    });
  };

  // دالة تغيير التبويب
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // مكونات أيقونات التبويب مع التحسينات البصرية
  const tabIcons = [
    <SettingsIcon fontSize="small" sx={{ mr: 1 }} />,
    <DataObjectIcon fontSize="small" sx={{ mr: 1 }} />,
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        {/* Breadcrumbs */}

        {/* Notification Snackbar */}
        <Snackbar
          open={alertInfo.show}
          autoHideDuration={3000}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            severity={
              alertInfo.color === "success"
                ? "success"
                : alertInfo.color === "error"
                ? "error"
                : "info"
            }
            elevation={6}
            variant="filled"
          >
            {alertInfo.message}
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 8px 16px 0 rgba(0,0,0,0.1)",
                overflow: "visible",
              }}
            >
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  background: "linear-gradient(195deg, #49a3f1, #1A73E8)",
                  transition: "all 0.3s ease",
                }}
              >
                <MDTypography variant="h6" color="white" fontWeight="medium">
                  إعدادات بوت دعم العملاء
                </MDTypography>
                <Tooltip title="تحديث البيانات">
                  <IconButton
                    color="white"
                    onClick={loadInitialData}
                    sx={{
                      transition: "transform 0.5s ease",
                      transform: refreshAnimation ? "rotate(360deg)" : "rotate(0deg)",
                    }}
                  >
                    {refreshAnimation ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </MDBox>

              <MDBox>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": {
                      fontWeight: "medium",
                      transition: "all 0.2s ease",
                      px: 3,
                      py: 2,
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    },
                  }}
                >
                  <Tab icon={tabIcons[0]} label="الإعدادات الأساسية" iconPosition="start" />
                  <Tab icon={tabIcons[1]} label="قاعدة المعرفة" iconPosition="start" />
                </Tabs>

                {loading ? (
                  <MDBox p={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Skeleton variant="rounded" height={70} sx={{ mb: 2 }} />
                        <Skeleton variant="rounded" height={70} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Skeleton variant="rounded" height={70} sx={{ mb: 2 }} />
                        <Skeleton variant="rounded" height={70} />
                      </Grid>
                      <Grid item xs={12}>
                        <Skeleton variant="rounded" height={150} sx={{ mt: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Skeleton variant="rounded" height={70} sx={{ mt: 2 }} />
                      </Grid>
                    </Grid>
                  </MDBox>
                ) : (
                  <Fade in={!loading} timeout={500}>
                    <Box sx={{ p: 0 }}>
                      {tabValue === 0 && (
                        <GeneralSettingsTab
                          settings={settings}
                          setSettings={setSettings}
                          showSuccessMessage={showSuccessMessage}
                          showErrorMessage={showErrorMessage}
                        />
                      )}
                      {tabValue === 1 && (
                        <KnowledgeBaseTab
                          knowledgeBase={knowledgeBase}
                          setKnowledgeBase={setKnowledgeBase}
                          categories={categories}
                          setCategories={setCategories}
                          showSuccessMessage={showSuccessMessage}
                          showErrorMessage={showErrorMessage}
                          setCurrentItem={setCurrentItem}
                          setIsEditMode={setIsEditMode}
                          setModalOpen={setModalOpen}
                          currentTab={tabValue}
                        />
                      )}
                    </Box>
                  </Fade>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Modal for Knowledge Base Item */}
      <KnowledgeBaseItemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentItem(null);
        }}
        item={currentItem}
        isEdit={isEditMode}
        categories={[...categories]}
        knowledgeBase={knowledgeBase}
        setKnowledgeBase={setKnowledgeBase}
        showSuccessMessage={showSuccessMessage}
        showErrorMessage={showErrorMessage}
      />
    </DashboardLayout>
  );
}

export default ChatbotSettings;
