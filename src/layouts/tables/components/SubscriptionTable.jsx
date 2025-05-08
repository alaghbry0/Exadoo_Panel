import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  TableSortLabel,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import dayjs from "dayjs";

const headCells = [
  { id: "username", label: "USERNAME", width: "130px", minWidth: "130px", sortable: true },
  { id: "full_name", label: "NAME", width: "180px", minWidth: "180px", sortable: true },
  {
    id: "telegram_id",
    label: "Telegram ID",
    width: "120px",
    minWidth: "120px",
    numeric: true,
    sortable: true,
  },
  {
    id: "subscription_type_name",
    label: "SUBSCRIPTION TYPE",
    width: "180px",
    minWidth: "170px",
    sortable: true,
  },
  { id: "source", label: "SOURCE", width: "100px", minWidth: "100px", sortable: true },
  {
    id: "is_active",
    label: "STATUS",
    width: "100px",
    minWidth: "100px",
    align: "center",
    sortable: true,
  },
  {
    id: "expiry_date",
    label: "EXPIRY DATE",
    width: "120px",
    minWidth: "120px",
    align: "center",
    sortable: true,
  },
  {
    id: "actions",
    label: "ACTIONS",
    width: "90px",
    minWidth: "90px",
    align: "center",
    sortable: false,
  },
];

const SubscriptionTable = ({
  subscriptions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEditClick,
  totalCount = 0,
  order,
  orderBy,
  onRequestSort,
  loading,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const renderSkeletonRows = () =>
    Array.from(new Array(rowsPerPage)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-cell-${cell.id}-${index}`}
            align={cell.align || (cell.numeric ? "right" : "left")}
            sx={{
              py: 0.8,
              px: 1.5,
              width: cell.width,
              minWidth: cell.minWidth,
              boxSizing: "border-box",
            }}
          >
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));

  const getHeaderCellStyles = (theme, headCell) => ({
    py: 1.5,
    px: 2,
    fontWeight: "medium",
    width: headCell.width,
    minWidth: headCell.minWidth,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    "& .MuiTableSortLabel-icon": {
      color: theme.palette.text.secondary,
    },
  });

  return (
    <MDBox>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Table aria-labelledby="tableTitle" size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
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
                      }}
                    >
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        color="text"
                        sx={{
                          display: "inline-block",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {headCell.label}
                      </MDTypography>
                    </TableSortLabel>
                  ) : (
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      color="text"
                      sx={{
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {headCell.label}
                    </MDTypography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && subscriptions.length === 0
              ? renderSkeletonRows()
              : subscriptions.map((subscription) => (
                  <TableRow
                    hover
                    key={`${subscription.telegram_id}-${subscription.id}`}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                    }}
                  >
                    {headCells.map((cellInfo) => (
                      <TableCell
                        key={`${cellInfo.id}-${subscription.id}`}
                        align={cellInfo.align || (cellInfo.numeric ? "right" : "left")}
                        sx={{
                          py: 1,
                          px: 1.5,
                          width: cellInfo.width,
                          minWidth: cellInfo.minWidth,
                          maxWidth: cellInfo.width,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          boxSizing: "border-box",
                          fontSize: "0.875rem",
                          color: (theme) => theme.palette.text.secondary,
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {(() => {
                          switch (cellInfo.id) {
                            case "actions":
                              return (
                                <Tooltip title="Edit Subscription">
                                  <IconButton
                                    size="small"
                                    onClick={() => onEditClick(subscription)}
                                    color="info"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              );
                            case "is_active":
                              return (
                                <Chip
                                  label={subscription.is_active ? "Active" : "Inactive"}
                                  color={subscription.is_active ? "success" : "error"}
                                  size="small"
                                  sx={{
                                    borderRadius: "6px",
                                    fontWeight: "medium",
                                    minWidth: "70px",
                                  }}
                                />
                              );
                            case "expiry_date":
                              return (
                                <MDTypography variant="caption">
                                  {subscription.expiry_date
                                    ? dayjs(subscription.expiry_date).format("DD/MM/YY")
                                    : "N/A"}
                                </MDTypography>
                              );
                            case "username":
                              return (
                                <Tooltip
                                  title={subscription.username ? `@${subscription.username}` : "-"}
                                >
                                  <MDTypography variant="caption">
                                    {subscription.username ? `@${subscription.username}` : "-"}
                                  </MDTypography>
                                </Tooltip>
                              );
                            default:
                              return (
                                <Tooltip title={String(subscription[cellInfo.id] ?? "-")}>
                                  <MDTypography
                                    variant="caption"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {String(subscription[cellInfo.id] ?? "-")}
                                  </MDTypography>
                                </Tooltip>
                              );
                          }
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

            {subscriptions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                  <MDBox>
                    <MDTypography variant="h6" color="textSecondary">
                      No subscriptions found
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

      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        showFirstButton
        showLastButton
      />
    </MDBox>
  );
};

export default SubscriptionTable;
