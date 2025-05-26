// src/layouts/dashboard/index.js

import { useState, useEffect, useMemo, useCallback } from "react"; // Added useMemo, useCallback

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select"; // MUI Select
import MenuItem from "@mui/material/MenuItem"; // MUI MenuItem
import FormControl from "@mui/material/FormControl"; // MUI FormControl
// import InputLabel from "@mui/material/InputLabel"; // Optional: if you want a floating label

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import RecentPayments from "layouts/dashboard/components/RecentPayments";
import RecentActivities from "layouts/dashboard/components/RecentActivities";

// API Services
import { getDashboardStats, getRevenueChart, getSubscriptionsChart } from "services/api.js";

// Constants for revenue periods
const REVENUE_PERIODS = {
  P7_DAYS: "7days",
  P30_DAYS: "30days",
  P6_MONTHS: "6months",
  P12_MONTHS: "12months",
};

const REVENUE_PERIOD_OPTIONS = [
  { value: REVENUE_PERIODS.P7_DAYS, label: "آخر 7 أيام" },
  { value: REVENUE_PERIODS.P30_DAYS, label: "آخر 30 يومًا" },
  { value: REVENUE_PERIODS.P6_MONTHS, label: "آخر 6 أشهر" },
  { value: REVENUE_PERIODS.P12_MONTHS, label: "آخر 12 شهرًا" },
];

// Optimized StatCard component
const StatCard = ({ icon, color, title, count, percentage, isLoading }) => (
  <MDBox mb={1.5}>
    {isLoading ? (
      <Card sx={{ p: 2, minHeight: 120 }}>
        {" "}
        {/* Ensure consistent height for skeletons */}
        <Skeleton
          variant="circular"
          width={30}
          height={30}
          sx={{
            mb: 1,
            borderRadius: "0.75rem",
            p: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5, width: "70%" }} />
        <Skeleton variant="text" sx={{ fontSize: "1.5rem", mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: "0.875rem", width: "50%" }} />
      </Card>
    ) : (
      <ComplexStatisticsCard
        icon={icon}
        color={color}
        title={title}
        count={count}
        percentage={percentage}
      />
    )}
  </MDBox>
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [subscriptionsData, setSubscriptionsData] = useState(null);

  const [loadingStates, setLoadingStates] = useState({
    initialDashboard: true,
    revenueChart: false,
  });
  const [error, setError] = useState(null); // Single error state for dashboard-wide errors
  const [revenuePeriod, setRevenuePeriod] = useState(REVENUE_PERIODS.P7_DAYS);

  const handleLoading = (key, value) => setLoadingStates((prev) => ({ ...prev, [key]: value }));

  const loadRevenueData = useCallback(async (period, isInitialCall = false) => {
    if (!isInitialCall) handleLoading("revenueChart", true);
    // Clear previous revenue data to show loading state properly if needed, or keep old data
    // setRevenueData(null);
    try {
      const revenueChartData = await getRevenueChart(period);
      setRevenueData(revenueChartData);
    } catch (err) {
      console.error("Revenue data loading error:", err);
      // Optionally set a specific error for revenue chart if needed
      // setError(prev => ({...prev, revenueError: 'فشل تحميل مخطط الإيرادات'}));
    } finally {
      if (!isInitialCall) handleLoading("revenueChart", false);
    }
  }, []); // No dependencies needed if getRevenueChart doesn't change

  const loadDashboardData = useCallback(async () => {
    handleLoading("initialDashboard", true);
    setError(null);
    try {
      const [statsData, subscriptionsChartData] = await Promise.all([
        getDashboardStats(),
        getSubscriptionsChart(),
      ]);
      setStats(statsData);
      setSubscriptionsData(subscriptionsChartData);
      await loadRevenueData(revenuePeriod, true); // true for initial call
    } catch (err) {
      setError("فشل في تحميل بيانات لوحة التحكم الرئيسية.");
      console.error("Dashboard data loading error:", err);
    } finally {
      handleLoading("initialDashboard", false);
    }
  }, [revenuePeriod, loadRevenueData]); // Add loadRevenueData

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // loadDashboardData is memoized

  useEffect(() => {
    // This effect runs when revenuePeriod changes, but not on initial load
    // as loadRevenueData is already called by loadDashboardData initially.
    if (!loadingStates.initialDashboard && stats) {
      // Ensure initial load is complete
      loadRevenueData(revenuePeriod);
    }
  }, [revenuePeriod, stats, loadingStates.initialDashboard, loadRevenueData]);

  const formattedRevenueChart = useMemo(() => {
    if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
      return { labels: [], datasets: { label: "الإيرادات", data: [] } };
    }
    return {
      labels: revenueData.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("ar-SA", {
          month: "short",
          day: "numeric",
          year:
            revenuePeriod === REVENUE_PERIODS.P6_MONTHS ||
            revenuePeriod === REVENUE_PERIODS.P12_MONTHS
              ? "numeric"
              : undefined,
        });
      }),
      datasets: {
        label: "الإيرادات ($)",
        data: revenueData.map((item) => parseFloat(item.revenue)),
      },
    };
  }, [revenueData, revenuePeriod]);

  const formattedSubscriptionsChart = useMemo(() => {
    if (!subscriptionsData || !Array.isArray(subscriptionsData) || subscriptionsData.length === 0) {
      return { labels: [], datasets: { label: "الاشتراكات", data: [] } };
    }
    return {
      labels: subscriptionsData.map((item) => item.name),
      datasets: { label: "عدد الاشتراكات", data: subscriptionsData.map((item) => item.active) },
    };
  }, [subscriptionsData]);

  const kpiMetrics = useMemo(() => {
    if (!stats) return [];
    const completedPaymentsCount = stats.completed_payments || 0;
    const totalFailedPaymentsCount = stats.total_failed_payments || 0;
    const totalPaymentsAttempted = completedPaymentsCount + totalFailedPaymentsCount;
    const paymentSuccessRate =
      totalPaymentsAttempted > 0 ? (completedPaymentsCount / totalPaymentsAttempted) * 100 : 0;
    const totalRevenueAmount = parseFloat(stats.total_revenue || 0);
    const averageOrderValue =
      completedPaymentsCount > 0 ? totalRevenueAmount / completedPaymentsCount : 0;

    return [
      {
        label: "معدل نجاح المدفوعات",
        value: `${paymentSuccessRate.toFixed(1)}%`,
        color:
          paymentSuccessRate >= 90 ? "success" : paymentSuccessRate >= 70 ? "warning" : "error",
        icon:
          paymentSuccessRate >= 90
            ? "check_circle_outline"
            : paymentSuccessRate >= 70
            ? "warning_amber"
            : "error_outline",
      },
      {
        label: "متوسط قيمة الطلب",
        value: `$${averageOrderValue.toFixed(2)}`,
        color: "info",
        icon: "attach_money",
      },
      {
        label: "المدفوعات المكتملة",
        value: completedPaymentsCount.toLocaleString(),
        color: "success",
        icon: "task_alt",
      },
      {
        label: "المدفوعات الفاشلة",
        value: totalFailedPaymentsCount.toLocaleString(),
        color: "error",
        icon: "highlight_off",
      },
    ];
  }, [stats]);

  const lastUpdateTime = useMemo(
    () => new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    []
  );

  // Skeleton for initial page load
  if (loadingStates.initialDashboard && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          {/* Welcome Skeleton */}
          <MDBox mb={3}>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </MDBox>
          {/* Stats Cards Skeleton */}
          <Grid container spacing={3} mb={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={`stat-skel-${i}`}>
                <StatCard isLoading={true} />
              </Grid>
            ))}
          </Grid>
          {/* Charts Skeleton */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 2, height: 350 }}>
                <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 2, height: 350 }}>
                <Skeleton variant="text" height={30} width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Error display for major data load failure
  if (error && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center">
          <Alert
            severity="error"
            action={
              <MDButton variant="outlined" color="error" size="small" onClick={loadDashboardData}>
                <Icon sx={{ mr: 1 }}>refresh</Icon>
                إعادة المحاولة
              </MDButton>
            }
            sx={{ width: "100%", maxWidth: "600px" }}
          >
            {error}
          </Alert>
        </MDBox>
      </DashboardLayout>
    );
  }

  // If stats are still null after loading (shouldn't happen if error is caught)
  if (!stats)
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          py={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="calc(100vh - 200px)"
        >
          <MDTypography>لا توجد بيانات لعرضها.</MDTypography>
        </MDBox>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Section: Welcome & Quick Summary */}
        <MDBox mb={3}>
          <Grid container spacing={1} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md></Grid>
            <Grid item xs={12} md="auto">
              <Chip
                icon={<Icon fontSize="small">update</Icon>}
                label={`آخر تحديث: ${lastUpdateTime}`}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </MDBox>

        {/* Section: Key Performance Indicators Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon="people"
              color="dark"
              title="إجمالي المستخدمين"
              count={stats.total_users?.toLocaleString() || "0"}
              percentage={{
                color: (stats.user_growth_percentage || 0) >= 0 ? "success" : "error",
                amount: `${Math.abs(stats.user_growth_percentage || 0).toFixed(1)}%`,
                label: "عن الشهر الماضي",
              }}
              isLoading={loadingStates.initialDashboard}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon="monetization_on"
              color="success"
              title="إجمالي الإيرادات"
              count={`$${parseFloat(stats.total_revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`}
              percentage={{
                color: "success",
                // amount: `+${(stats.revenue_growth_percentage || 0).toFixed(1)}%`, // Assuming you might have this
                label: "الإجمالي الكلي",
              }}
              isLoading={loadingStates.initialDashboard}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon="subscriptions"
              color="info"
              title="الاشتراكات النشطة"
              count={stats.active_subscriptions?.toLocaleString() || "0"}
              percentage={{
                // color: "info",
                // amount: `+${(stats.new_subscriptions_this_month || 0)}`,
                label: "إجمالي الاشتراكات الحالية",
              }}
              isLoading={loadingStates.initialDashboard}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon="event_busy" // or "schedule" or "hourglass_empty"
              color="warning"
              title="اشتراكات تنتهي قريبًا"
              count={stats.expiring_soon?.toLocaleString() || "0"}
              percentage={{
                label: "خلال 7 أيام",
              }}
              isLoading={loadingStates.initialDashboard}
            />
          </Grid>
        </Grid>

        {/* Section: Charts (Revenue and Subscriptions) */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={7}>
            {" "}
            {/* Revenue chart gets more space */}
            <Card sx={{ height: "100%" }}>
              <MDBox pt={2} px={2} mb={4}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <MDTypography variant="h6" fontWeight="medium">
                      نظرة عامة على الإيرادات
                    </MDTypography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    {/* <InputLabel id="revenue-period-select-label">الفترة</InputLabel> */}
                    <Select
                      // labelId="revenue-period-select-label"
                      // label="الفترة"
                      value={revenuePeriod}
                      onChange={(e) => setRevenuePeriod(e.target.value)}
                      sx={{ ".MuiSelect-select": { py: 1, px: 1.5 }, fontSize: "0.875rem" }}
                    >
                      {REVENUE_PERIOD_OPTIONS.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>
              </MDBox>
              <MDBox p={1} sx={{ minHeight: 300, position: "relative" }}>
                {" "}
                {/* Added minHeight and relative positioning */}
                {loadingStates.revenueChart && (
                  <MDBox
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      zIndex: 10,
                    }}
                  >
                    <CircularProgress size={40} />
                  </MDBox>
                )}
                {/* Render chart only if data is available, or show a message */}
                {formattedRevenueChart.labels.length > 0 || loadingStates.revenueChart ? (
                  <ReportsLineChart
                    color="success"
                    chart={formattedRevenueChart}
                    // No need for title/description here as they are above
                  />
                ) : (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                    minHeight="250px"
                  >
                    <MDTypography variant="body2" color="text.secondary">
                      لا توجد بيانات إيرادات لهذه الفترة.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <MDBox pt={2} px={2} mb={4}>
                <MDTypography variant="h6" fontWeight="medium">
                  الاشتراكات النشطة
                </MDTypography>
              </MDBox>
              <MDBox p={1} sx={{ minHeight: 300 }}>
                {formattedSubscriptionsChart.labels.length > 0 || loadingStates.initialDashboard ? (
                  <ReportsBarChart color="info" chart={formattedSubscriptionsChart} />
                ) : (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                    minHeight="250px"
                  >
                    <MDTypography variant="body2" color="text.secondary">
                      لا توجد بيانات اشتراكات حالياً.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Section: Detailed Metrics (KPIs) and Recent Payments */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={5} lg={4}>
            {" "}
            {/* KPI Card */}
            <Card sx={{ height: "100%" }}>
              <MDBox pt={2} px={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  مؤشرات الأداء الهامة
                </MDTypography>
              </MDBox>
              <MDBox p={2}>
                {kpiMetrics.length > 0 ? (
                  kpiMetrics.map((item, index) => (
                    <MDBox
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.5} // Increased padding for better spacing
                      borderBottom={index < kpiMetrics.length - 1 ? "1px solid #f0f0f0" : "none"}
                    >
                      <MDBox display="flex" alignItems="center">
                        <Icon color={item.color} sx={{ mr: 1.5, fontSize: "1.3rem" }}>
                          {item.icon}
                        </Icon>
                        <MDTypography variant="button" fontWeight="regular" color="text.secondary">
                          {item.label}
                        </MDTypography>
                      </MDBox>
                      <Chip
                        label={item.value}
                        color={item.color}
                        size="small"
                        variant="outlined" // Or "filled" for more emphasis
                        sx={{ fontWeight: "bold", minWidth: "70px", textAlign: "center" }} // Ensure chip has min-width
                      />
                    </MDBox>
                  ))
                ) : (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="150px"
                  >
                    <MDTypography variant="body2" color="text.secondary">
                      لا تتوفر مؤشرات حالياً.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            {" "}
            {/* Recent Payments */}
            <RecentPayments />
          </Grid>
        </Grid>

        {/* Section: Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RecentActivities />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
