// src/layouts/broadcasts/components/BroadcastStats/index.js

import PropTypes from "prop-types";
import { Card, Grid, Icon, Box, Fade, Zoom } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { CircularProgress, LinearProgress } from "@mui/material";

function StatCard({ title, value, icon, color, percentage, trend, subtitle, delay = 0 }) {
  return (
    <Zoom in timeout={500} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: "100%",
          p: 3,
          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)`,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={1}>
              <Icon
                sx={{
                  fontSize: 20,
                  color: `${color}.main`,
                  p: 0.5,
                  borderRadius: "50%",
                  bgcolor: `${color}.light`,
                  mr: 1,
                }}
              >
                {icon}
              </Icon>
              <MDTypography variant="button" fontWeight="regular" color="text">
                {title}
              </MDTypography>
            </MDBox>

            <MDTypography variant="h3" fontWeight="bold" color={color} mb={0.5}>
              {value}
            </MDTypography>

            {subtitle && (
              <MDTypography variant="caption" color="text">
                {subtitle}
              </MDTypography>
            )}

            {percentage !== undefined && (
              <MDBox mt={2}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: `${color}.main`,
                      borderRadius: 4,
                    },
                  }}
                />
                <MDTypography variant="caption" color="text" mt={0.5} display="block">
                  {percentage.toFixed(1)}% من الإجمالي
                </MDTypography>
              </MDBox>
            )}

            {trend !== undefined && (
              <MDBox display="flex" alignItems="center" mt={1}>
                <Icon
                  sx={{
                    color: trend > 0 ? "success.main" : trend < 0 ? "error.main" : "text.secondary",
                    fontSize: 16,
                    mr: 0.5,
                  }}
                >
                  {trend > 0 ? "trending_up" : trend < 0 ? "trending_down" : "trending_flat"}
                </Icon>
                <MDTypography
                  variant="caption"
                  color={trend > 0 ? "success" : trend < 0 ? "error" : "text"}
                  fontWeight="medium"
                >
                  {trend > 0 ? "+" : ""}
                  {trend}% من الشهر الماضي
                </MDTypography>
              </MDBox>
            )}
          </MDBox>

          <MDBox>
            <Icon
              sx={{
                fontSize: 40,
                color: `${color}.main`,
                opacity: 0.3,
              }}
            >
              {icon}
            </Icon>
          </MDBox>
        </MDBox>
      </Card>
    </Zoom>
  );
}

function BroadcastStats({ stats }) {
  if (!stats) return null;

  const totalMessages = stats.total_messages || 0;
  const successfulMessages = stats.successful_messages || 0;
  const failedMessages = stats.failed_messages || 0;
  const pendingMessages = stats.pending_messages || 0;

  const successRate = totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;
  const failureRate = totalMessages > 0 ? (failedMessages / totalMessages) * 100 : 0;
  const pendingRate = totalMessages > 0 ? (pendingMessages / totalMessages) * 100 : 0;

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="%23ffffff" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
            pointerEvents: "none",
          },
        }}
      >
        <MDBox position="relative" zIndex={1}>
          <MDBox display="flex" alignItems="center" mb={3}>
            <Icon sx={{ fontSize: 32, mr: 2 }}>analytics</Icon>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="white">
                إحصائيات البث
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.8}>
                نظرة شاملة على أداء رسائل البث
              </MDTypography>
            </MDBox>
          </MDBox>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="إجمالي الرسائل"
                value={totalMessages.toLocaleString()}
                icon="mail"
                color="info"
                subtitle="جميع الرسائل المرسلة"
                delay={0}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="الرسائل الناجحة"
                value={successfulMessages.toLocaleString()}
                icon="check_circle"
                color="success"
                percentage={successRate}
                trend={stats.success_trend}
                delay={100}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="الرسائل الفاشلة"
                value={failedMessages.toLocaleString()}
                icon="error"
                color="error"
                percentage={failureRate}
                trend={stats.failure_trend}
                delay={200}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="قيد الانتظار"
                value={pendingMessages.toLocaleString()}
                icon="schedule"
                color="warning"
                percentage={pendingRate}
                subtitle="رسائل لم تُرسل بعد"
                delay={300}
              />
            </Grid>
          </Grid>

          {/* Additional Stats Row */}
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="معدل النجاح"
                value={`${successRate.toFixed(1)}%`}
                icon="trending_up"
                color="success"
                subtitle="نسبة الرسائل الناجحة"
                delay={400}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="متوسط وقت الإرسال"
                value={stats.avg_send_time || "0 ثانية"}
                icon="timer"
                color="info"
                subtitle="متوسط وقت إرسال الرسالة"
                delay={500}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="المستخدمون النشطون"
                value={(stats.active_users || 0).toLocaleString()}
                icon="people"
                color="secondary"
                trend={stats.users_trend}
                subtitle="المستخدمون المتفاعلون"
                delay={600}
              />
            </Grid>
          </Grid>
        </MDBox>
      </Card>
    </Fade>
  );
}

BroadcastStats.propTypes = {
  stats: PropTypes.object,
};

export default BroadcastStats;
