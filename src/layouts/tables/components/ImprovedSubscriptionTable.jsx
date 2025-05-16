import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Tooltip, IconButton, Chip, CircularProgress, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Table components
import DataTable from "examples/Tables/DataTable";

const ImprovedSubscriptionTable = ({
  subscriptions = [],
  onLoadMore,
  hasMore,
  loadingMore,
  onEditClick,
  order,
  orderBy,
  onRequestSort,
  loading,
  totalCount = 0,
}) => {
  // Format subscription data for DataTable component
  const tableData = useMemo(() => {
    const columns = [
      {
        Header: "USERNAME",
        accessor: "username",
        width: "130px",
        align: "left",
        Cell: ({ value }) => (
          <Tooltip title={value ? `@${value}` : "-"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value ? `@${value}` : "-"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "NAME",
        accessor: "full_name",
        width: "180px",
        align: "left",
        Cell: ({ value }) => (
          <Tooltip title={value || "-"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value || "-"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "TELEGRAM ID",
        accessor: "telegram_id",
        width: "120px",
        align: "left",
        Cell: ({ value }) => (
          <Tooltip title={value || "-"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value || "-"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "SUBSCRIPTION TYPE",
        accessor: "subscription_type_name",
        width: "180px",
        align: "left",
        Cell: ({ value }) => (
          <Tooltip title={value || "-"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value || "-"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "SOURCE",
        accessor: "source",
        width: "100px",
        align: "left",
        Cell: ({ value }) => (
          <Tooltip title={value || "-"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value || "-"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "STATUS",
        accessor: "is_active",
        width: "100px",
        align: "center",
        Cell: ({ value }) => (
          <Chip
            label={value ? "Active" : "Inactive"}
            color={value ? "success" : "error"}
            size="small"
            sx={{
              borderRadius: "6px",
              fontWeight: "medium",
              minWidth: "70px",
            }}
          />
        ),
      },
      {
        Header: "EXPIRY DATE",
        accessor: "expiry_date",
        width: "120px",
        align: "center",
        Cell: ({ value }) => (
          <Tooltip title={value ? dayjs(value).format("DD/MM/YYYY") : "N/A"} placement="top" arrow>
            <MDTypography variant="caption" display="block" fontWeight="medium">
              {value ? dayjs(value).format("DD/MM/YY") : "N/A"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "ACTIONS",
        accessor: "actions",
        width: "90px",
        align: "center",
        Cell: ({ row }) => (
          <Tooltip title="Edit Subscription">
            <IconButton size="small" onClick={() => onEditClick(row.original)} color="info">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ];

    return {
      columns,
      rows: subscriptions || [],
    };
  }, [subscriptions, onEditClick]);

  if (loading && (!subscriptions || subscriptions.length === 0)) {
    return (
      <MDBox display="flex" justifyContent="center" p={4}>
        <CircularProgress color="info" />
      </MDBox>
    );
  }

  return (
    <MDBox>
      <DataTable
        table={tableData}
        entriesPerPage={false}
        showTotalEntries={false}
        isSorted={true}
        noEndBorder
        pagination={{ variant: "gradient", color: "info" }}
      />

      {/* Load More Button or Completion Message */}
      <MDBox sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
        {subscriptions.length > 0 && hasMore && (
          <MDButton
            variant="outlined"
            color="info"
            onClick={onLoadMore}
            disabled={loadingMore}
            startIcon={
              loadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreIcon />
            }
          >
            {loadingMore ? "Loading..." : "Load More"}
          </MDButton>
        )}

        {subscriptions.length > 0 && !hasMore && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <CheckCircleOutlineIcon fontSize="small" color="success" />
            All data loaded. ({subscriptions.length} of {totalCount})
          </Typography>
        )}

        {!loading && subscriptions.length === 0 && (
          <MDBox textAlign="center">
            <MDTypography variant="h6" color="textSecondary">
              No subscriptions found
            </MDTypography>
            <MDTypography variant="body2" color="textSecondary">
              Try adjusting your search or filters.
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </MDBox>
  );
};

export default ImprovedSubscriptionTable;
