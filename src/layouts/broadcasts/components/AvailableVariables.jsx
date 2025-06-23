// src/layouts/broadcasts/components/AvailableVariables.js
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbar } from "notistack";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getAvailableVariables } from "services/api";

function AvailableVariables() {
  const { enqueueSnackbar } = useSnackbar();
  const [variables, setVariables] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVars = async () => {
      try {
        const data = await getAvailableVariables();
        setVariables(data);
      } catch (error) {
        console.error("Failed to fetch variables:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVars();
  }, []);

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    enqueueSnackbar(`Copied "${key}" to clipboard!`, { variant: "success" });
  };

  if (loading) return <MDTypography variant="caption">Loading variables...</MDTypography>;
  if (!variables) return null;

  return (
    <MDBox mt={2}>
      <MDTypography variant="subtitle2" mb={1}>
        Available Variables
      </MDTypography>
      {Object.entries(variables).map(([category, vars]) => (
        <Accordion key={category} sx={{ boxShadow: "none", "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {category.replace("_", " ")}
            </MDTypography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {vars.map((v) => (
                <Grid item xs={12} sm={6} md={4} key={v.key}>
                  <Tooltip title={v.description}>
                    <Chip
                      label={v.key}
                      onClick={() => handleCopy(v.key)}
                      onDelete={() => handleCopy(v.key)}
                      deleteIcon={<ContentCopyIcon />}
                      variant="outlined"
                      size="small"
                      sx={{ cursor: "pointer", width: "100%", justifyContent: "space-between" }}
                    />
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </MDBox>
  );
}

export default AvailableVariables;
