// layouts/tables/components/TabsManager.jsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import MDBox from "components/MDBox";

// أيقونات
import ListAltIcon from "@mui/icons-material/ListAlt";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"; // أيقونة جديدة لسجل الاشتراكات

const TabsManager = ({ activeTab, handleTabChange }) => {
  // --- تعديل: لم نعد بحاجة لدالة Badge المعقدة إذا لم تكن هناك عدادات حالياً ---
  const tabLabelWithIcon = (label, IconComponent) => {
    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <IconComponent sx={{ mr: 0.5, fontSize: "1.1rem" }} />
        {label}
      </Box>
    );
  };

  return (
    <MDBox width="100%">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="Subscription tabs"
        >
          <Tab
            label={tabLabelWithIcon("Subscriptions", ListAltIcon)}
            sx={{
              textTransform: "none",
              fontWeight: activeTab === 0 ? "bold" : 500,
              fontSize: "0.9rem",
              minHeight: "48px",
            }}
            id="tab-subscriptions"
            aria-controls="tabpanel-subscriptions"
          />
          {/* --- إضافة: تبويب جديد لسجل الاشتراكات --- */}
          <Tab
            label={tabLabelWithIcon("Subscription History", HistoryEduIcon)}
            sx={{
              textTransform: "none",
              fontWeight: activeTab === 1 ? "bold" : 500,
              fontSize: "0.9rem",
              minHeight: "48px",
            }}
            id="tab-history"
            aria-controls="tabpanel-history"
          />
        </Tabs>
      </Box>
    </MDBox>
  );
};

export default TabsManager;
