// src/layouts/ManagePlans/components/SubscriptionSettings.jsx
import React from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TermsConditionsSettings from "./TermsConditionsSettings";

function SubscriptionSettings() {
  return (
    <MDBox>
      <MDTypography variant="h5" fontWeight="bold" mb={3}>
        System Settings
      </MDTypography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TermsConditionsSettings />
        </Grid>

        {/* Additional settings can be added here as needed */}
      </Grid>
    </MDBox>
  );
}

export default SubscriptionSettings;
