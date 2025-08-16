// src/layouts/broadcasts/components/BroadcastHistory/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns"; // For better date formatting

// @mui material components
import {
  Card,
  CircularProgress,
  TablePagination,
  Icon,
  Fade,
  Tooltip,
  Chip,
  Box,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge"; // UX Improvement: For colored status
import DataTable from "examples/Tables/DataTable";

// Components
import BatchDetailsModal from "layouts/broadcasts/components/BatchDetailsModal";

// API
import { getBroadcastHistory } from "services/api";

// UX Improvement: Status helper
const getStatusBadge = (status) => {
  const statusMap = {
    completed: { color: "success", text: "Completed" },
    in_progress: { color: "info", text: "In Progress" },
    failed: { color: "error", text: "Failed" },
    pending: { color: "warning", text: "Pending" },
    cancelled: { color: "secondary", text: "Cancelled" },
  };
  const { color, text } = statusMap[status] || { color: "dark", text: status };
  return <MDBadge badgeContent={text} color={color} size="xs" container />;
};

function BroadcastHistory({ setSnackbar }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, total: 0, pageSize: 10 });
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
        title: "Error",
        message: "Failed to load broadcast history.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, pagination.pageSize]);

  const handlePageChange = (_, newPage) => setPagination((prev) => ({ ...prev, page: newPage }));
  const handleRowsPerPageChange = (event) =>
    setPagination((prev) => ({ ...prev, pageSize: parseInt(event.target.value, 10), page: 0 }));
  const handleRowClick = (batchId) => {
    setSelectedBatchId(batchId);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBatchId(null);
    fetchHistory(true); // Refresh history on modal close
  };
  const handleRefresh = () => fetchHistory(true);

  // UX Improvement: Building table data within the component for clarity
  const tableData = {
    columns: [
      { Header: "Date", accessor: "date", width: "25%" },
      { Header: "Target Group", accessor: "target" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Sent/Total", accessor: "progress", align: "center" },
      { Header: "Actions", accessor: "action", align: "center" },
    ],
    rows: history.map((batch) => ({
      date: (
        <MDTypography variant="caption">
          {format(new Date(batch.created_at), "MMM dd, yyyy, h:mm a")}
        </MDTypography>
      ),
      target: <MDTypography variant="button">{batch.target_group_display}</MDTypography>,
      status: getStatusBadge(batch.status),
      progress: (
        <MDTypography variant="caption" color="text">
          {`${batch.successful_sends} / ${batch.total_users}`}
        </MDTypography>
      ),
      action: (
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleRowClick(batch.batch_id)}
        >
          View Details
        </MDButton>
      ),
    })),
  };

  const activeJobs = history.filter(
    (batch) => batch.status === "in_progress" || batch.status === "pending"
  ).length;

  return (
    <>
      <Fade in timeout={500}>
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ fontSize: 24, color: "info.main", mr: 1 }}>history</Icon>
              <MDTypography variant="h5" fontWeight="bold">
                Broadcast History
              </MDTypography>
              {activeJobs > 0 && (
                <Chip
                  label={`${activeJobs} active job(s)`}
                  color="info"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </MDBox>
            <Tooltip title="Refresh">
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
                iconOnly
              >
                {refreshing ? <CircularProgress size={16} color="inherit" /> : <Icon>refresh</Icon>}
              </MDButton>
            </Tooltip>
          </MDBox>

          {loading ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <CircularProgress />
            </MDBox>
          ) : (
            <MDBox>
              {tableData.rows.length === 0 ? (
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="300px"
                  p={3}
                >
                  <Icon sx={{ fontSize: 64, color: "grey.400", mb: 2 }}>inbox</Icon>
                  <MDTypography variant="h6">No Broadcasts Found</MDTypography>
                  <MDTypography variant="body2" color="text">
                    Your sent broadcasts will appear here.
                  </MDTypography>
                </MDBox>
              ) : (
                <>
                  <DataTable
                    table={tableData}
                    isSorted={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                  <Box sx={{ borderTop: 1, borderColor: "divider" }}>
                    <TablePagination
                      component="div"
                      count={pagination.total}
                      page={pagination.page}
                      onPageChange={handlePageChange}
                      rowsPerPage={pagination.pageSize}
                      onRowsPerPageChange={handleRowsPerPageChange}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      // Translation:
                      labelRowsPerPage="Rows per page:"
                    />
                  </Box>
                </>
              )}
            </MDBox>
          )}
        </MDBox>
      </Fade>
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
};

export default BroadcastHistory;
