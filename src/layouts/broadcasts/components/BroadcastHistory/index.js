// src/layouts/broadcasts/components/BroadcastHistory/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Card,
  CircularProgress,
  TablePagination,
  Icon,
  Fade,
  Box,
  Tooltip,
  Chip,
  Alert,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

// Data and Components
import broadcastHistoryData from "layouts/broadcasts/data/broadcastHistoryData";
import BatchDetailsModal from "layouts/broadcasts/components/BatchDetailsModal";

// API
import { getBroadcastHistory } from "services/api";

function BroadcastHistory({ setSnackbar, compact = false }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, total: 0, pageSize: compact ? 3 : 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const response = await getBroadcastHistory(pagination.page + 1, pagination.pageSize);
      setHistory(response.batches);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      setSnackbar({
        open: true,
        color: "error",
        title: "خطأ",
        message: "فشل تحميل سجل البث.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, pagination.pageSize]);

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), page: 0 }));
  };

  const handleRowClick = (batchId) => {
    setSelectedBatchId(batchId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBatchId(null);
    // Refresh history when modal closes to get updated data
    fetchHistory(true);
  };

  const handleRefresh = () => {
    fetchHistory(true);
  };

  const { columns, rows } = broadcastHistoryData(history, handleRowClick);

  const activeJobs = history.filter(
    (batch) => batch.status === "in_progress" || batch.status === "pending"
  ).length;

  return (
    <>
      <Fade in timeout={500}>
        <Card
          elevation={compact ? 1 : 4}
          sx={{
            height: compact ? "400px" : "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={3}
            pb={compact ? 2 : 3}
          >
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ fontSize: 24, color: "info.main", mr: 1 }}>history</Icon>
              <MDBox>
                <MDTypography variant={compact ? "h6" : "h5"} fontWeight="bold">
                  {compact ? "سجل البث المختصر" : "سجل البث الكامل"}
                </MDTypography>
                {activeJobs > 0 && (
                  <Chip
                    label={`${activeJobs} مهمة نشطة`}
                    color="info"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </MDBox>
            </MDBox>

            <MDBox display="flex" alignItems="center" gap={1}>
              <Tooltip title="تحديث">
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ minWidth: "auto", p: 1 }}
                >
                  {refreshing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Icon sx={{ fontSize: 16 }}>refresh</Icon>
                  )}
                </MDButton>
              </Tooltip>
            </MDBox>
          </MDBox>

          {loading ? (
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={compact ? "200px" : "300px"}
            >
              <CircularProgress size={compact ? 30 : 40} />
            </MDBox>
          ) : (
            <MDBox flex={1} display="flex" flexDirection="column">
              {rows.length === 0 ? (
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight={compact ? "200px" : "300px"}
                  p={3}
                >
                  <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>inbox</Icon>
                  <MDTypography variant="h6" color="text" mb={1}>
                    لا يوجد سجلات بث
                  </MDTypography>
                  <MDTypography variant="body2" color="text" textAlign="center">
                    لم يتم إرسال أي رسائل بث حتى الآن
                  </MDTypography>
                </MDBox>
              ) : (
                <>
                  <MDBox flex={1} sx={{ overflow: "auto" }}>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      //entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                      canSearch={!compact}
                    />
                  </MDBox>

                  {!compact && (
                    <Box sx={{ borderTop: 1, borderColor: "divider" }}>
                      <TablePagination
                        component="div"
                        count={pagination.total}
                        page={pagination.page}
                        onPageChange={handlePageChange}
                        rowsPerPage={pagination.pageSize}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="صفوف في الصفحة:"
                        labelDisplayedRows={({ from, to, count }) =>
                          `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
                        }
                      />
                    </Box>
                  )}
                </>
              )}
            </MDBox>
          )}
        </Card>
      </Fade>

      {/* Modal for Batch Details */}
      <BatchDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        batchId={selectedBatchId}
        setSnackbar={setSnackbar}
      />
    </>
  );
}

BroadcastHistory.propTypes = {
  setSnackbar: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

export default BroadcastHistory;
