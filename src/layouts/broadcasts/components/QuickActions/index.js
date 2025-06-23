// src/layouts/broadcasts/components/QuickActions/index.js

import PropTypes from "prop-types";
import { Card, Grid, IconButton, Tooltip, Zoom, Fade } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Icon } from "@mui/material";

function QuickActions({ activeTab, setActiveTab, stats }) {
  const quickStats = [
    {
      label: "المهام النشطة",
      value: stats?.active_batches || "0",
      icon: "play_arrow",
      color: "success",
    },
    {
      label: "آخر إرسال",
      value: stats?.last_broadcast
        ? new Date(stats.last_broadcast).toLocaleDateString("ar-EG")
        : "لا يوجد",
      icon: "schedule",
      color: "info",
    },
  ];

  return (
    <Fade in timeout={800}>
      <Card
        sx={{
          p: 2,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6" color="white" fontWeight="bold">
              إجراءات سريعة
            </MDTypography>
          </MDBox>

          <Grid container spacing={2} mb={2}>
            {quickStats.map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                  <MDBox
                    textAlign="center"
                    p={1}
                    sx={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Icon sx={{ color: "white", fontSize: 20, mb: 0.5 }}>{stat.icon}</Icon>
                    <MDTypography variant="h6" color="white" fontWeight="bold">
                      {stat.value}
                    </MDTypography>
                    <MDTypography variant="caption" color="white" opacity={0.8}>
                      {stat.label}
                    </MDTypography>
                  </MDBox>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <MDBox display="flex" gap={1}>
            <MDButton
              variant={activeTab === "composer" ? "contained" : "outlined"}
              color="white"
              size="small"
              onClick={() => setActiveTab("composer")}
              sx={{
                flex: 1,
                color: activeTab === "composer" ? "dark.main" : "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: activeTab === "composer" ? "white" : "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Icon sx={{ mr: 0.5, fontSize: 16 }}>edit</Icon>
              إنشاء
            </MDButton>
            <MDButton
              variant={activeTab === "history" ? "contained" : "outlined"}
              color="white"
              size="small"
              onClick={() => setActiveTab("history")}
              sx={{
                flex: 1,
                color: activeTab === "history" ? "dark.main" : "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: activeTab === "history" ? "white" : "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Icon sx={{ mr: 0.5, fontSize: 16 }}>history</Icon>
              السجل
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    </Fade>
  );
}

QuickActions.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  stats: PropTypes.object,
};

export default QuickActions;
