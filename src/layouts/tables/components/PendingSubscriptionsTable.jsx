// layouts/tables/components/PendingSubscriptionsTable.jsx
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
  Chip,
  Tooltip,
  Skeleton,
  // Box // Box غير مستخدم هنا بشكل مباشر
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import dayjs from "dayjs";

const headCells = [
  { id: "telegram_id", label: "USER ID", width: "100px", minWidth: "100px", numeric: true },
  { id: "full_name", label: "NAME", width: "150px", minWidth: "150px" },
  { id: "username", label: "USERNAME", width: "130px", minWidth: "130px" },
  { id: "subscription_type_name", label: "SUB TYPE", width: "140px", minWidth: "140px" },
  { id: "found_at", label: "FOUND AT", width: "130px", minWidth: "130px", align: "center" },
  { id: "status", label: "STATUS", width: "100px", minWidth: "100px", align: "center" },
  {
    id: "actions",
    label: "ACTIONS",
    sortable: false,
    width: "120px",
    minWidth: "120px",
    align: "center",
  }, // قللت العرض ليناسب زرين أيقونة
];

const PendingSubscriptionsTable = ({
  pendingSubscriptions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onApprove,
  onReject,
  totalCount = 0,
  loading,
}) => {
  const renderSkeletonRows = () =>
    Array.from(new Array(rowsPerPage)).map((_, index) => (
      <TableRow key={`skeleton-pending-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-pending-cell-${cell.id}-${index}`}
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

  if (loading && pendingSubscriptions.length === 0) {
    return (
      <MDBox>
        <TableContainer
          component={Paper}
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: "8px" }}
        >
          <Table size="small" sx={{ tableLayout: "fixed" }}>
            {" "}
            {/* <--- tableLayout: fixed */}
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || (headCell.numeric ? "right" : "left")}
                    sx={{
                      py: 1,
                      px: 1.5,
                      fontWeight: "bold",
                      width: headCell.width,
                      minWidth: headCell.minWidth,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      boxSizing: "border-box",
                    }}
                  >
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      {headCell.label}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderSkeletonRows()}</TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={loading ? 0 : totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </MDBox>
    );
  }

  return (
    <MDBox>
      <TableContainer
        component={Paper}
        elevation={0}
        variant="outlined"
        sx={{ borderRadius: "8px" }}
      >
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          {" "}
          {/* <--- tableLayout: fixed */}
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || (headCell.numeric ? "right" : "left")}
                  sx={{
                    py: 1,
                    px: 1.5,
                    fontWeight: "bold",
                    width: headCell.width,
                    minWidth: headCell.minWidth,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    boxSizing: "border-box",
                  }}
                >
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    {headCell.label}
                  </MDTypography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingSubscriptions.map((subscription) => (
              <TableRow hover key={subscription.id}>
                {headCells.map((cellInfo) => {
                  let cellValue = subscription[cellInfo.id];

                  return (
                    <TableCell
                      key={`${cellInfo.id}-${subscription.id}`}
                      align={cellInfo.align || (cellInfo.numeric ? "right" : "left")}
                      sx={{
                        py: 0.8,
                        px: 1.5,
                        width: cellInfo.width,
                        minWidth: cellInfo.minWidth,
                        maxWidth: cellInfo.width, // هام
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
                      }}
                    >
                      {cellInfo.id === "actions" ? (
                        subscription.status === "pending" ? (
                          <MDBox
                            display="flex"
                            gap={0.5}
                            justifyContent="center"
                            alignItems="center"
                            sx={{ height: "100%" }}
                          >
                            <Tooltip title="Approve">
                              <MDButton
                                iconOnly
                                size="small"
                                variant="gradient"
                                color="success"
                                onClick={() => onApprove(subscription.id)}
                                sx={{ minWidth: "auto", width: "30px", height: "30px" }} // لضمان حجم مناسب للأيقونة
                              >
                                <CheckIcon />
                              </MDButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <MDButton
                                iconOnly
                                size="small"
                                variant="gradient"
                                color="error"
                                onClick={() => onReject(subscription.id)}
                                sx={{ minWidth: "auto", width: "30px", height: "30px" }} // لضمان حجم مناسب للأيقونة
                              >
                                <CloseIcon />
                              </MDButton>
                            </Tooltip>
                          </MDBox>
                        ) : (
                          <MDTypography
                            variant="caption"
                            component="div"
                            sx={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {subscription.admin_reviewed_at
                              ? `Reviewed ${dayjs(subscription.admin_reviewed_at).format(
                                  "DD/MM/YY HH:mm"
                                )}`
                              : "N/A"}
                          </MDTypography>
                        )
                      ) : cellInfo.id === "status" ? (
                        <Chip
                          label={subscription.status}
                          color={
                            subscription.status === "pending"
                              ? "warning"
                              : subscription.status === "approved"
                              ? "success"
                              : "error"
                          }
                          size="small"
                          sx={{ borderRadius: "6px", fontWeight: "medium", minWidth: "70px" }}
                        />
                      ) : cellInfo.id === "found_at" ? (
                        <Tooltip
                          title={cellValue ? dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
                          placement="top-start"
                        >
                          <MDTypography
                            variant="caption"
                            component="div"
                            sx={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cellValue ? dayjs(cellValue).format("DD/MM/YY HH:mm") : "N/A"}
                          </MDTypography>
                        </Tooltip>
                      ) : cellInfo.id === "username" ? (
                        <Tooltip title={cellValue ? `@${cellValue}` : "-"} placement="top-start">
                          <MDTypography
                            variant="caption"
                            component="div"
                            sx={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cellValue ? `@${cellValue}` : "-"}
                          </MDTypography>
                        </Tooltip>
                      ) : (
                        <Tooltip title={String(cellValue ?? "-")} placement="top-start">
                          <MDTypography
                            variant="caption"
                            component="div"
                            sx={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {String(cellValue ?? "-")}
                          </MDTypography>
                        </Tooltip>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {pendingSubscriptions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                  <MDBox>
                    <MDTypography variant="h6" color="textSecondary">
                      No pending subscriptions
                    </MDTypography>
                  </MDBox>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
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

export default PendingSubscriptionsTable;
