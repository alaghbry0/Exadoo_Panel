// src/layouts/tables/components/BulkProcessResultModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function BulkProcessResultModal({ open, onClose, result }) {
  if (!result) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{result.error ? "Bulk Processing Error" : "Bulk Processing Result"}</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          {result.message || (result.error ? "An error occurred." : "Processing complete.")}
        </Typography>
        {result.details && (
          <MDBox mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Details:
            </Typography>
            <MDTypography variant="body2">
              Total Candidates: {result.details.total_candidates ?? "N/A"}
            </MDTypography>
            <MDTypography variant="body2" color="success.main">
              Successfully Updated: {result.details.successful_updates ?? "N/A"}
            </MDTypography>
            <MDTypography variant="body2" color="error.main">
              Failures (Bot/DB): {result.details.failed_bot_or_db_updates ?? "N/A"}
            </MDTypography>
            {result.details.failures_log && result.details.failures_log.length > 0 && (
              <MDBox
                mt={2}
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid lightgray",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2">Failure Log:</Typography>
                <List dense>
                  {result.details.failures_log.map((failure, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      sx={{ borderBottom: "1px dashed #eee", pb: 0.5, mb: 0.5 }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ variant: "caption" }}
                        secondaryTypographyProps={{ variant: "caption", color: "error" }}
                        primary={`Sub ID: ${failure.sub_id} (User: ${failure.telegram_id})`}
                        secondary={`Error: ${failure.error}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </MDBox>
            )}
          </MDBox>
        )}
        {result.error && !result.details && (
          <MDTypography variant="body2" color="error.main">
            {result.error}
          </MDTypography>
        )}
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose} color="primary">
          Close
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

export default BulkProcessResultModal;
