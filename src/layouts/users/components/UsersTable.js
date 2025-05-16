// src/layouts/Users/components/UsersTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TableSortLabel,
  Skeleton,
  CircularProgress,
  Typography,
  Box, // For layout within cells if needed
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Or Visibility for View Details
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Define your head cells based on your API response and desired display
const headCells = [
  { id: "id", label: "ID", minWidth: "80px", sortable: true, numeric: true },
  { id: "telegram_id", label: "TELEGRAM ID", minWidth: "130px", sortable: true, numeric: true },
  { id: "username", label: "USERNAME", minWidth: "150px", sortable: true },
  { id: "full_name", label: "FULL NAME", minWidth: "180px", sortable: true },
  { id: "subscription_count", label: "SUBS", minWidth: "80px", align: "center", sortable: false }, // 'SUBS' is shorter
  {
    id: "active_subscription_count",
    label: "ACTIVE",
    minWidth: "90px",
    align: "center",
    sortable: false,
  },
  { id: "actions", label: "ACTIONS", minWidth: "120px", align: "center", sortable: false },
];

const UsersTable = ({
  users,
  loading,
  loadingMore,
  order,
  orderBy,
  onRequestSort,
  onLoadMore,
  hasMore,
  totalCount = 0,
  onViewDetailsClick,
  onAddSubscriptionClick,
  // rowsPerPage, // If you need to control API page_size from UI
  // onRowsPerPageChange, // If you need to control API page_size from UI
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const getCommonCellStyles = (cellConfig) => ({
    py: 0.8,
    px: 1.5,
    width: cellConfig.width, // Assign width if you want fixed, else let it flow with minWidth
    minWidth: cellConfig.minWidth,
    maxWidth: cellConfig.maxWidth || cellConfig.minWidth, // Allow expanding up to maxWidth
    boxSizing: "border-box",
    fontSize: "0.875rem",
  });

  const getHeaderCellStyles = (theme, headCell) => ({
    ...getCommonCellStyles(headCell),
    py: 1.5,
    fontWeight: "medium",
    backgroundColor: theme.palette.background.paper, // Or a specific header color
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    "& .MuiTableSortLabel-icon": {
      color: theme.palette.text.secondary,
    },
  });

  const typographyStyles = {
    display: "block",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const renderSkeletonRows = (count = 5) => {
    return Array.from(new Array(count)).map((_, index) => (
      <TableRow key={`skeleton-user-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-cell-user-${cell.id}-${index}`}
            align={cell.align || (cell.numeric ? "right" : "left")}
            sx={getCommonCellStyles(cell)}
          >
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const tableMinWidth =
    headCells.reduce((acc, cell) => acc + parseInt(cell.minWidth, 10), 0) + "px";

  return (
    <MDBox>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "0", // Tables page has border on Card, not Paper
          overflowX: "auto", // Ensure horizontal scroll if content overflows
          borderTop: (theme) => `1px solid ${theme.palette.divider}`, // Separator from toolbar
          // maxHeight: "calc(100vh - 350px)", // Optional: if you want internal scroll instead of page scroll
        }}
      >
        <Table
          aria-labelledby="usersTableTitle"
          size="small" // Consistent with SubscriptionTable
          sx={{
            tableLayout: "fixed", // Important for minWidth/maxWidth to work well
            minWidth: tableMinWidth,
            width: "100%",
          }}
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || (headCell.numeric ? "right" : "left")}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={(theme) => getHeaderCellStyles(theme, headCell)}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={createSortHandler(headCell.id)}
                      sx={{
                        color: "inherit",
                        "&:hover": { color: "inherit" },
                        width: "100%",
                        display: "flex",
                        justifyContent:
                          headCell.align || (headCell.numeric ? "flex-end" : "flex-start"),
                      }}
                    >
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        sx={typographyStyles}
                      >
                        {headCell.label}
                      </MDTypography>
                    </TableSortLabel>
                  ) : (
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      color="text"
                      sx={typographyStyles}
                    >
                      {headCell.label}
                    </MDTypography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (!users || users.length === 0)
              ? renderSkeletonRows()
              : users && users.length > 0
              ? users.map((user) => (
                  <TableRow
                    hover
                    key={user.id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {headCells.map((cellInfo) => {
                      let cellValue = user[cellInfo.id];
                      return (
                        <TableCell
                          key={`${cellInfo.id}-${user.id}`}
                          align={cellInfo.align || (cellInfo.numeric ? "right" : "left")}
                          sx={(theme) => ({
                            ...getCommonCellStyles(cellInfo),
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          })}
                        >
                          {(() => {
                            switch (cellInfo.id) {
                              case "actions":
                                return (
                                  <MDBox display="flex" justifyContent="center" gap={0.5}>
                                    <Tooltip title="View Details">
                                      <IconButton
                                        size="small"
                                        onClick={() => onViewDetailsClick(user)}
                                        color="info"
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Add Subscription">
                                      <IconButton
                                        size="small"
                                        onClick={() => onAddSubscriptionClick(user)}
                                        color="success"
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </MDBox>
                                );
                              case "username":
                                return (
                                  <Tooltip
                                    title={user.username ? `@${user.username}` : "N/A"}
                                    placement="top"
                                    arrow
                                  >
                                    <MDTypography variant="caption" sx={typographyStyles}>
                                      {user.username ? `@${user.username}` : "N/A"}
                                    </MDTypography>
                                  </Tooltip>
                                );
                              case "active_subscription_count":
                                return (
                                  <Chip
                                    label={String(user.active_subscription_count)}
                                    color={
                                      user.active_subscription_count > 0 ? "success" : "default"
                                    }
                                    size="small"
                                    sx={{
                                      borderRadius: "6px",
                                      fontWeight: "medium",
                                      minWidth: "30px",
                                    }}
                                  />
                                );
                              default:
                                return (
                                  <Tooltip title={String(cellValue ?? "N/A")} placement="top" arrow>
                                    <MDTypography variant="caption" sx={typographyStyles}>
                                      {String(cellValue ?? "N/A")}
                                    </MDTypography>
                                  </Tooltip>
                                );
                            }
                          })()}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              : !loading && (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>
                      <MDBox>
                        <MDTypography variant="h6" color="textSecondary">
                          No users found
                        </MDTypography>
                        <MDTypography variant="body2" color="textSecondary">
                          Try adjusting your search or filters.
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button / All Data Loaded Message */}
      <MDBox
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {!loading && users.length > 0 && hasMore && (
          <MDButton
            variant="outlined"
            color="info"
            onClick={onLoadMore}
            disabled={loadingMore}
            startIcon={
              loadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreIcon />
            }
          >
            {loadingMore ? "Loading..." : `Load More (${totalCount - users.length} remaining)`}
          </MDButton>
        )}
        {!loading && users.length > 0 && !hasMore && totalCount > 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <CheckCircleOutlineIcon fontSize="small" color="success" />
            All users loaded. ({users.length} of {totalCount})
          </Typography>
        )}
      </MDBox>
    </MDBox>
  );
};

export default UsersTable;
