// layouts/tables/components/TabsManager.jsx
import React from "react";
import { Tabs, Tab, Box, Badge } from "@mui/material"; // ١. استيراد Badge
import MDBox from "components/MDBox";
// MDTypography قد لا تكون ضرورية هنا إذا أزلنا العنوان
// import MDTypography from "components/MDTypography";

// أيقونات اختيارية
import ListAltIcon from "@mui/icons-material/ListAlt"; // مثال: للاشتراكات النشطة
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"; // مثال: للمراجعة المعلقة
import HistoryIcon from "@mui/icons-material/History"; // مثال: للاشتراكات القديمة

const TabsManager = ({ activeTab, handleTabChange, pendingCount = 0, legacyCount = 0 }) => {
  const tabLabelWithBadge = (label, count, IconComponent) => {
    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        {IconComponent && (
          <IconComponent
            sx={{ mr: count > 0 || label.includes("(") ? 0.5 : 0, fontSize: "1.1rem" }}
          />
        )}{" "}
        {/* ٢. إضافة أيقونة */}
        {label}
        {count > 0 && (
          <Badge badgeContent={count} color="error" sx={{ ml: 1.5 }} /> // ٣. استخدام مكون Badge من MUI
        )}
      </Box>
    );
  };

  return (
    // ٤. تعديل الـ padding إذا أزلنا العنوان
    <MDBox width="100%" /* يضمن أن TabsManager يأخذ العرض الكامل إذا كان داخل Flex container */>
      {/* تم إزالة MDBox الخاص بالعنوان من هنا */}
      {/* <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <MDTypography variant="h5" fontWeight="medium">
          Subscription Management
        </MDTypography>
      </MDBox> */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary" // يمكنك استخدام "secondary" أو لون آخر من الثيم
          textColor="primary"
          variant="fullWidth" // أو "standard" أو "scrollable" حسب الحاجة
          // centered // إذا كنت تريد توسيط التبويبات (يعمل جيدًا مع variant="standard")
          aria-label="Subscription tabs"
        >
          <Tab
            label={tabLabelWithBadge("Active", 0, ListAltIcon)} // تمرير أيقونة
            sx={{
              textTransform: "none", // لمنع تحويل النص إلى حروف كبيرة
              fontWeight: activeTab === 0 ? "bold" : 500, // خط أعرض للتبويب النشط
              fontSize: "0.9rem",
              minHeight: "48px", // ارتفاع قياسي للتبويب
            }}
            id="tab-active"
            aria-controls="tabpanel-active"
          />
          <Tab
            // استخدام Badge بشكل مباشر أو عبر الدالة المساعدة
            label={tabLabelWithBadge("Pending Review", pendingCount, HourglassEmptyIcon)}
            sx={{
              textTransform: "none",
              fontWeight: activeTab === 1 ? "bold" : 500,
              fontSize: "0.9rem",
              minHeight: "48px",
              // يمكنك إضافة أسلوب مميز للتبويب الذي يحتوي على إشعارات
              // color: pendingCount > 0 ? 'error.main' : 'inherit',
            }}
            id="tab-pending"
            aria-controls="tabpanel-pending"
          />
          <Tab
            label={tabLabelWithBadge("Legacy", legacyCount, HistoryIcon)}
            sx={{
              textTransform: "none",
              fontWeight: activeTab === 2 ? "bold" : 500,
              fontSize: "0.9rem",
              minHeight: "48px",
            }}
            id="tab-legacy"
            aria-controls="tabpanel-legacy"
          />
        </Tabs>
      </Box>
    </MDBox>
  );
};

export default TabsManager;
