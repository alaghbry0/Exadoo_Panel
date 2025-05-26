// src/layouts/dashboard/components/RecentActivities/index.js

import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

// API Service
import { getRecentActivities } from "services/api.js";

function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newCount: 0,
    renewalCount: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      const data = await getRecentActivities(15);
      setActivities(data);

      // حساب الإحصائيات
      const newCount = data.filter((activity) => activity.action_type === "NEW").length;
      const renewalCount = data.filter((activity) => activity.action_type === "RENEWAL").length;
      const percentage = data.length > 0 ? Math.round((newCount / data.length) * 100) : 0;

      setStats({ newCount, renewalCount, percentage });
    } catch (error) {
      console.error("Error loading recent activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // تحديد لون النشاط
  const getActivityColor = (actionType) => {
    switch (actionType) {
      case "NEW":
        return "success";
      case "RENEWAL":
        return "info";
      case "ADMIN_RENEWAL":
        return "primary";
      case "ADMIN_CANCEL":
        return "error";
      case "EXPIRY":
        return "warning";
      default:
        return "secondary";
    }
  };

  // تحديد أيقونة النشاط
  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case "NEW":
        return "person_add";
      case "RENEWAL":
        return "refresh";
      case "ADMIN_RENEWAL":
        return "admin_panel_settings";
      case "ADMIN_CANCEL":
        return "cancel";
      case "EXPIRY":
        return "schedule";
      default:
        return "info";
    }
  };

  // تحديد نص النشاط
  const getActivityText = (actionType) => {
    switch (actionType) {
      case "NEW":
        return "اشتراك جديد";
      case "RENEWAL":
        return "تجديد اشتراك";
      case "ADMIN_RENEWAL":
        return "تجديد إداري";
      case "ADMIN_CANCEL":
        return "إلغاء إداري";
      case "EXPIRY":
        return "انتهاء اشتراك";
      default:
        return actionType;
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "أمس";
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else {
      return date.toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // تحديد وصف النشاط
  const getActivityDescription = (activity) => {
    const subscriptionInfo = activity.subscription_type || "غير محدد";
    const planInfo = activity.subscription_plan || "";

    return `${subscriptionInfo}${planInfo ? ` - ${planInfo}` : ""}`;
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          النشاطات الحديثة
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main }}>trending_up</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {stats.percentage}%
            </MDTypography>{" "}
            اشتراكات جديدة
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox p={2} sx={{ maxHeight: 400, overflowY: "auto" }}>
        {loading ? (
          <MDBox textAlign="center" py={3}>
            <MDTypography variant="button" color="text">
              جاري التحميل...
            </MDTypography>
          </MDBox>
        ) : activities.length === 0 ? (
          <MDBox textAlign="center" py={3}>
            <MDTypography variant="button" color="text">
              لا توجد نشاطات حديثة
            </MDTypography>
          </MDBox>
        ) : (
          activities.map((activity, index) => (
            <TimelineItem
              key={index}
              color={getActivityColor(activity.action_type)}
              icon={getActivityIcon(activity.action_type)}
              title={`${getActivityText(activity.action_type)}`}
              description={getActivityDescription(activity)}
              dateTime={formatDate(activity.changed_at)}
              lastItem={index === activities.length - 1}
            />
          ))
        )}
      </MDBox>

      {/* إحصائيات سريعة */}
      <MDBox px={3} pb={2}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <MDTypography variant="caption" color="text">
            اشتراكات جديدة: {stats.newCount}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            تجديدات: {stats.renewalCount}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default RecentActivities;
