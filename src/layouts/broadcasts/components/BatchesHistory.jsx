// src/layouts/broadcasts/components/BatchesHistory.js
import React, { useState, useEffect } from "react";
import {
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getMessagingBatches } from "services/api";

function BatchesHistory() {
  const [data, setData] = useState({ batches: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [queryOptions, setQueryOptions] = useState({ page: 1, pageSize: 10 });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const result = await getMessagingBatches({
          page: queryOptions.page,
          page_size: queryOptions.pageSize,
        });
        setData(result);
      } catch (error) {
        console.error("Failed to fetch batches history:", error);
        // يمكنك إضافة إشعار خطأ هنا
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [queryOptions]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "running":
        return "info";
      case "pending":
        return "warning";
      default:
        return "text";
    }
  };

  return (
    <Card>
      <MDBox p={2}>
        <MDTypography variant="h6">Broadcasts History</MDTypography>
      </MDBox>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <MDTypography variant="button" fontWeight="bold">
                    ID
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="button" fontWeight="bold">
                    Type
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="button" fontWeight="bold">
                    Status
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="button" fontWeight="bold">
                    Total
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="button" fontWeight="bold">
                    Success
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="button" fontWeight="bold">
                    Failed
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="button" fontWeight="bold">
                    Created At
                  </MDTypography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.batches?.length > 0 ? (
                data.batches.map((batch, index) => (
                  <TableRow key={batch.batch_id || index}>
                    <TableCell>
                      <MDTypography variant="caption" color="text">
                        {batch.batch_id ? `${batch.batch_id.substring(0, 8)}...` : "N/A"}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="button" color="text">
                        {batch.batch_type || "N/A"}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="button" color={getStatusColor(batch.status)}>
                        {batch.status || "Unknown"}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="button" color="text">
                        {batch.total_users || 0}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="button" color="success">
                        {batch.successful_sends || 0}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="button" color="error">
                        {batch.failed_sends || 0}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="text">
                        {batch.created_at ? new Date(batch.created_at).toLocaleString() : "N/A"}
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <MDTypography variant="body2" color="text">
                      No broadcast history found
                    </MDTypography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

export default BatchesHistory;
