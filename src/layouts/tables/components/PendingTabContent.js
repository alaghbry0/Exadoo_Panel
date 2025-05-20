// src/layouts/tables/components/PendingTabContent.js
import React, { useMemo } from "react";
import { CircularProgress, Tooltip, Box, Chip as MuiChip } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import MuiAlert from "@mui/material/Alert"; // Or your CustomAlert
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import {
  BASE_COLUMNS_CONFIG_PENDING,
  PENDING_STATUS_FILTER_OPTIONS,
} from "../config/pending.config.js";
import { formatPendingStatus, formatPendingDate } from "../utils/pending.utils.js";
import { centeredContentStyle } from "../utils/ui.utils"; // Assuming you created this

function PendingTabContent({
  pendingData,
  loading,
  error,
  setError,
  queryOptions,
  setQueryOptions,
  totalRecords,
  statsData,
  statusFilter,
  handleStatusFilterChange,
  handleMarkComplete,
  bulkProcessingLoading,
  handleBulkProcess,
}) {
  const dataTableColumns = useMemo(() => {
    const actionColumn = {
      Header: "ACTION",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      Cell: ({ row }) => {
        if (row.original.status === "pending") {
          return (
            <Tooltip title="Mark as Complete">
              <MDButton
                variant="gradient"
                color="success"
                size="small"
                onClick={() => handleMarkComplete(row.original.id)}
                startIcon={<CheckCircleOutlineIcon />}
              >
                Complete
              </MDButton>
            </Tooltip>
          );
        }
        return (
          <MDTypography
            variant="caption"
            color={row.original.status === "complete" ? "success.main" : "text.secondary"}
            fontWeight="medium"
            sx={{ textTransform: "capitalize" }}
          >
            {row.original.status === "complete" ? "Completed" : row.original.status}
            {row.original.admin_reviewed_at &&
              (row.original.status === "complete" ||
                row.original.status === "approved" ||
                row.original.status === "rejected") && (
                <Tooltip
                  title={`Reviewed: ${formatPendingDate(row.original.admin_reviewed_at, true)}`}
                >
                  <MDTypography
                    variant="caption"
                    component="div"
                    sx={{ fontSize: "0.7rem", color: "text.disabled" }}
                  >
                    {formatPendingDate(row.original.admin_reviewed_at)}
                  </MDTypography>
                </Tooltip>
              )}
          </MDTypography>
        );
      },
    };
    const formattedBase = BASE_COLUMNS_CONFIG_PENDING.map((col) => {
      if (col.accessor === "status")
        return { ...col, Cell: ({ value }) => formatPendingStatus(value) };
      if (col.accessor === "found_at")
        return { ...col, Cell: ({ value }) => formatPendingDate(value, true) };
      return col;
    });
    return [...formattedBase, actionColumn];
  }, [handleMarkComplete]);

  const pageCount = Math.ceil(totalRecords / (queryOptions.pageSize || 20));

  return (
    <>
      <MDBox
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mr: 1 }}>
            Status:
          </MDTypography>
          {PENDING_STATUS_FILTER_OPTIONS.map((opt) => {
            const count = opt.value === "all" ? statsData?.total_all : statsData?.[opt.value];
            const IconComponent = opt.icon;
            return (
              <MuiChip
                key={opt.value}
                label={`${opt.label} (${count || 0})`}
                icon={IconComponent ? <IconComponent fontSize="small" /> : null}
                clickable
                color={statusFilter === opt.value ? "primary" : "default"}
                onClick={() => handleStatusFilterChange(opt.value)}
                variant={statusFilter === opt.value ? "filled" : "outlined"}
                size="small"
              />
            );
          })}
        </Box>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleBulkProcess}
          disabled={bulkProcessingLoading || loading || statusFilter !== "pending"}
          startIcon={
            bulkProcessingLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlaylistPlayIcon />
            )
          }
          sx={{ ml: { xs: 0, sm: "auto" }, mt: { xs: 1, sm: 0 } }}
        >
          {bulkProcessingLoading ? "Processing All..." : "Process All Pending"}
        </MDButton>
      </MDBox>
      {error && !loading && (
        <MDBox px={3} py={1}>
          <MuiAlert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
            {error}
          </MuiAlert>
        </MDBox>
      )}
      <MDBox pt={1} sx={{ position: "relative" }}>
        {loading && pendingData.length === 0 && (
          <MDBox sx={centeredContentStyle}>
            <CircularProgress color="info" />
          </MDBox>
        )}
        {(loading && pendingData.length > 0) || (!loading && pendingData.length > 0) ? (
          <DataTable
            table={{ columns: dataTableColumns, rows: pendingData }}
            isSorted={false}
            entriesPerPage={{
              defaultValue: queryOptions.pageSize,
              options: [10, 20, 50, 100],
            }}
            showTotalEntries={totalRecords > 0}
            noEndBorder
            canSearch={false} // Global search handled by parent
            pagination={{ variant: "gradient", color: "info" }}
            manualPagination
            pageCount={pageCount > 0 ? pageCount : 1}
            page={queryOptions.page - 1}
            onPageChange={(newPage) => setQueryOptions((prev) => ({ ...prev, page: newPage + 1 }))}
            onEntriesPerPageChange={(newPageSize) =>
              setQueryOptions((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
            }
            sx={loading && pendingData.length > 0 ? { opacity: 0.7 } : {}}
          />
        ) : (
          !loading &&
          pendingData.length === 0 && (
            <MDBox sx={centeredContentStyle}>
              <MDTypography variant="h6" color="textSecondary">
                No pending subscriptions found.
              </MDTypography>
            </MDBox>
          )
        )}
      </MDBox>
    </>
  );
}

export default PendingTabContent;
