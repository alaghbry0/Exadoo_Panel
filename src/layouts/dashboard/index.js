// src/layouts/dashboard/index.js

import { useState, useEffect, useMemo, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

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
import {
  getDashboardStats,
  getRevenueChart,
  getSubscriptionsChart,
  getSubscriptionAnalytics,
} from "services/api.js";

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Important for filled line charts
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

// 💡 تحديث ثوابت فترة توجه النمو
const TREND_PERIODS = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

const TREND_PERIOD_OPTIONS = [
  { value: TREND_PERIODS.DAILY, label: "يومي (آخر 30 يوم)" },
  { value: TREND_PERIODS.WEEKLY, label: "أسبوعي (آخر 12 أسبوع)" },
  { value: TREND_PERIODS.MONTHLY, label: "شهري (آخر 12 شهر)" },
];

// Optimized StatCard component
const StatCard = ({ icon, color, title, count, percentage, isLoading }) => (
  <MDBox mb={1.5}>
    {isLoading ? (
      <Card sx={{ p: 2, minHeight: 120 }}>
        <Skeleton
          variant="circular"
          width={30}
          height={30}
          sx={{ mb: 1, borderRadius: "0.75rem", p: 0.5 }}
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
  const [analyticsData, setAnalyticsData] = useState(null);

  const [loadingStates, setLoadingStates] = useState({
    initialDashboard: true,
    revenueChart: false,
    analytics: true,
  });
  const [error, setError] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState(REVENUE_PERIODS.P7_DAYS);
  // 💡 تغيير الحالة الافتراضية لتكون يومي
  const [trendPeriod, setTrendPeriod] = useState(TREND_PERIODS.DAILY);

  const handleLoading = (key, value) => setLoadingStates((prev) => ({ ...prev, [key]: value }));

  const loadRevenueData = useCallback(async (period, isInitialCall = false) => {
    if (!isInitialCall) handleLoading("revenueChart", true);
    try {
      const revenueChartData = await getRevenueChart(period);
      setRevenueData(revenueChartData);
    } catch (err) {
      console.error("Revenue data loading error:", err);
    } finally {
      if (!isInitialCall) handleLoading("revenueChart", false);
    }
  }, []);

  const loadDashboardData = useCallback(
    async (currentTrendPeriod) => {
      handleLoading("initialDashboard", true);
      handleLoading("analytics", true);
      setError(null);
      try {
        const [statsData, subscriptionsChartData, analytics] = await Promise.all([
          getDashboardStats(),
          getSubscriptionsChart(),
          getSubscriptionAnalytics({ trend_period: currentTrendPeriod }),
        ]);
        setStats(statsData);
        setSubscriptionsData(subscriptionsChartData);
        setAnalyticsData(analytics);
        await loadRevenueData(revenuePeriod, true);
      } catch (err) {
        setError("فشل في تحميل بيانات لوحة التحكم الرئيسية.");
        console.error("Dashboard data loading error:", err);
      } finally {
        handleLoading("initialDashboard", false);
        handleLoading("analytics", false);
      }
    },
    [revenuePeriod, loadRevenueData]
  );

  useEffect(() => {
    loadDashboardData(trendPeriod);
  }, [loadDashboardData, trendPeriod]);

  useEffect(() => {
    if (!loadingStates.initialDashboard && stats) {
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
        return date.toLocaleDateString("en-US", {
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

  // 💡 تحديث useMemo الخاص بتوجه النمو ليكون أكثر ذكاءً في عرض العناوين
  const formattedNewSubsTrend = useMemo(() => {
    const trend = analyticsData?.new_subscriptions_trend;
    if (!trend || !trend.data || trend.data.length === 0) {
      return null;
    }

    // تحديد صيغة التاريخ بناءً على الفترة المختارة
    const dateFormatOptions = {
      [TREND_PERIODS.DAILY]: { month: "short", day: "numeric" },
      [TREND_PERIODS.WEEKLY]: { month: "short", day: "numeric" },
      [TREND_PERIODS.MONTHLY]: { month: "short", year: "2-digit" },
    };

    return {
      labels: trend.data.map((d) =>
        new Date(d.period).toLocaleDateString("en-US", dateFormatOptions[trendPeriod])
      ),
      datasets: [
        {
          label: "اشتراكات جديدة",
          data: trend.data.map((d) => d.new_subscriptions),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          tension: 0.2,
          fill: true,
          pointRadius: trendPeriod === TREND_PERIODS.DAILY ? 2 : 3, // نقاط أصغر للعرض اليومي
          pointBackgroundColor: "rgb(54, 162, 235)",
        },
      ],
      details: {
        total: trend.total,
        growth: trend.growth,
        // 💡 إضافة نص وصفي للفترة
        growthLabel: {
          [TREND_PERIODS.DAILY]: "عن اليوم السابق",
          [TREND_PERIODS.WEEKLY]: "عن الأسبوع السابق",
          [TREND_PERIODS.MONTHLY]: "عن الشهر السابق",
        }[trendPeriod],
      },
    };
  }, [analyticsData, trendPeriod]); // 💡 إضافة trendPeriod كاعتمادية

  const formattedTypeDistribution = useMemo(() => {
    let data = analyticsData?.type_distribution;
    if (data && typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse type_distribution JSON:", e);
        return null;
      }
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    return {
      labels: data.map((d) => d.type_name),
      datasets: [
        {
          label: "Subscriptions by Type",
          data: data.map((d) => d.count),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  const kpiMetrics = useMemo(() => {
    let statsData = stats;
    if (analyticsData?.overall_stats && typeof analyticsData.overall_stats === "string") {
      try {
        statsData = { ...stats, ...JSON.parse(analyticsData.overall_stats) };
      } catch (e) {
        console.error("Failed to parse overall_stats JSON:", e);
      }
    }
    if (!statsData) return [];
    const completedPaymentsCount = statsData.completed_payments || 0;
    const totalFailedPaymentsCount = statsData.total_failed_payments || 0;
    const totalPaymentsAttempted = completedPaymentsCount + totalFailedPaymentsCount;
    const paymentSuccessRate =
      totalPaymentsAttempted > 0 ? (completedPaymentsCount / totalPaymentsAttempted) * 100 : 0;
    const totalRevenueAmount = parseFloat(statsData.total_revenue || 0);
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
  }, [stats, analyticsData]);

  const lastUpdateTime = useMemo(
    () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    []
  );

  if (loadingStates.initialDashboard && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3}>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </MDBox>
          <Grid container spacing={3} mb={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={`stat-skel-${i}`}>
                <StatCard isLoading={true} />
              </Grid>
            ))}
          </Grid>
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

  if (error && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center">
          <Alert
            severity="error"
            action={
              <MDButton
                variant="outlined"
                color="error"
                size="small"
                onClick={() => loadDashboardData(trendPeriod)}
              >
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
                label: "إجمالي الاشتراكات الحالية",
              }}
              isLoading={loadingStates.initialDashboard}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon="event_busy"
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

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <MDBox pt={2} px={2} mb={4}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <MDTypography variant="h6" fontWeight="medium">
                      نظرة عامة على الإيرادات
                    </MDTypography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
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
                {formattedRevenueChart.labels.length > 0 || loadingStates.revenueChart ? (
                  <ReportsLineChart color="success" chart={formattedRevenueChart} />
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

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={8}>
              <Card>
                <MDBox
                  p={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Box mb={{ xs: 1, sm: 0 }}>
                    <MDTypography variant="h6">توجه نمو الاشتراكات</MDTypography>
                    {formattedNewSubsTrend?.details && (
                      <MDTypography variant="button" color="text" fontWeight="light">
                        <strong>{formattedNewSubsTrend.details.total.toLocaleString()}</strong>{" "}
                        اشتراك جديد
                        <MDTypography
                          component="span"
                          variant="button"
                          color={formattedNewSubsTrend.details.growth >= 0 ? "success" : "error"}
                          fontWeight="bold"
                          sx={{ ml: 1 }}
                        >
                          ({formattedNewSubsTrend.details.growth >= 0 ? "▲" : "▼"}
                          {Math.abs(formattedNewSubsTrend.details.growth)}%)
                        </MDTypography>
                        <MDTypography
                          component="span"
                          variant="caption"
                          color="text"
                          sx={{ ml: 0.5 }}
                        >
                          {formattedNewSubsTrend.details.growthLabel}
                        </MDTypography>
                      </MDTypography>
                    )}
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={trendPeriod}
                      onChange={(e) => setTrendPeriod(e.target.value)}
                      sx={{ ".MuiSelect-select": { py: 1 }, fontSize: "0.875rem" }}
                    >
                      {TREND_PERIOD_OPTIONS.map((option) => (
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
                <MDBox p={1} sx={{ height: 300 }}>
                  {loadingStates.analytics ? (
                    <Skeleton variant="rectangular" height="100%" />
                  ) : formattedNewSubsTrend ? (
                    <Line
                      data={formattedNewSubsTrend}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : (
                    <MDTypography>لا توجد بيانات.</MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
              <Card sx={{ height: "100%" }}>
                <MDBox p={2}>
                  <MDTypography variant="h6">Top Subscription Types</MDTypography>
                </MDBox>
                <MDBox
                  p={1}
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loadingStates.analytics ? (
                    <CircularProgress />
                  ) : formattedTypeDistribution ? (
                    <Pie
                      data={formattedTypeDistribution}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : (
                    <MDTypography>No type data.</MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <Grid container spacing={3} mb={3} mt={1.5}>
          <Grid item xs={12} md={5} lg={4}>
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
                      py={1.5}
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
                        variant="outlined"
                        sx={{ fontWeight: "bold", minWidth: "70px", textAlign: "center" }}
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
            <RecentPayments />
          </Grid>
        </Grid>

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
