// layouts/tables/components/PendingSubscriptionsTable.jsx

import React, { useState } from "react"; // <<< إضافة useState
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
  Dialog, // <<< إضافة Dialog
  DialogActions, // <<< إضافة DialogActions
  DialogContent, // <<< إضافة DialogContent
  DialogContentText, // <<< إضافة DialogContentText
  DialogTitle, // <<< إضافة DialogTitle
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
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
  { id: "status", label: "STATUS", width: "120px", minWidth: "120px", align: "center" },
  {
    id: "actions",
    label: "ACTION",
    sortable: false,
    width: "120px",
    minWidth: "120px",
    align: "center",
  },
];

const PendingSubscriptionsTable = ({
  pendingSubscriptions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onMarkComplete,
  totalCount = 0,
  loading,
}) => {
  // <<< بداية التعديلات لنافذة التأكيد
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);

  const handleOpenConfirmDialog = (subscriptionId) => {
    setSelectedSubscriptionId(subscriptionId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedSubscriptionId(null); // إعادة تعيين للتأكد
  };

  const handleConfirmComplete = () => {
    if (selectedSubscriptionId) {
      onMarkComplete(selectedSubscriptionId);
    }
    handleCloseConfirmDialog();
  };
  // <<< نهاية التعديلات لنافذة التأكيد

  const getCommonCellStyles = (cellConfig) => ({
    py: 0.8,
    px: 1.5,
    width: cellConfig.width,
    minWidth: cellConfig.minWidth,
    maxWidth: cellConfig.width,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
    fontSize: "0.875rem",
  });

  const getHeaderCellStyles = (theme, cellConfig) => ({
    py: 1,
    px: 1.5,
    fontWeight: "bold",
    width: cellConfig.width,
    minWidth: cellConfig.minWidth,
    maxWidth: cellConfig.width,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  });

  const renderSkeletonRows = () =>
    Array.from(new Array(rowsPerPage)).map((_, index) => (
      <TableRow key={`skeleton-pending-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-pending-cell-${cell.id}-${index}`}
            align={cell.align || (cell.numeric ? "right" : "left")}
            sx={getCommonCellStyles(cell)}
          >
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));

  const tableMinWidth =
    headCells.reduce((acc, cell) => acc + parseInt(cell.minWidth, 10), 0) + "px";

  return (
    <MDBox>
      <TableContainer
        component={Paper}
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: "8px",
          overflowX: "auto",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            minWidth: tableMinWidth,
          }}
        >
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || (headCell.numeric ? "right" : "left")}
                  sx={(theme) => getHeaderCellStyles(theme, headCell)}
                >
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text"
                    sx={{
                      display: "block",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {headCell.label}
                  </MDTypography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && pendingSubscriptions.length === 0
              ? renderSkeletonRows()
              : pendingSubscriptions.map((subscription) => (
                  <TableRow
                    hover
                    key={subscription.id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                    }}
                  >
                    {headCells.map((cellInfo) => {
                      let cellValue = subscription[cellInfo.id];
                      return (
                        <TableCell
                          key={`${cellInfo.id}-${subscription.id}`}
                          align={cellInfo.align || (cellInfo.numeric ? "right" : "left")}
                          sx={(theme) => ({
                            ...getCommonCellStyles(cellInfo),
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          })}
                        >
                          {cellInfo.id === "actions" ? (
                            subscription.status === "pending" ? (
                              <MDBox
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                sx={{ height: "100%" }}
                              >
                                <Tooltip title="Mark as Complete">
                                  <MDButton
                                    variant="gradient"
                                    color="success"
                                    size="small"
                                    // <<< تعديل onClick هنا
                                    onClick={() => handleOpenConfirmDialog(subscription.id)}
                                    startIcon={<CheckCircleOutlineIcon />}
                                  >
                                    Complete
                                  </MDButton>
                                </Tooltip>
                              </MDBox>
                            ) : (
                              <MDTypography
                                variant="caption"
                                color={
                                  subscription.status === "complete"
                                    ? "success.main"
                                    : "text.secondary"
                                }
                                fontWeight="medium"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {subscription.status === "complete"
                                  ? "Completed"
                                  : subscription.status}
                                {subscription.admin_reviewed_at &&
                                  (subscription.status === "complete" ||
                                    subscription.status === "approved" ||
                                    subscription.status === "rejected") && (
                                    <Tooltip
                                      title={`Reviewed: ${dayjs(
                                        subscription.admin_reviewed_at
                                      ).format("DD/MM/YYYY HH:mm:ss")}`}
                                    >
                                      <MDTypography
                                        variant="caption"
                                        component="div"
                                        sx={{ fontSize: "0.7rem", color: "text.disabled" }}
                                      >
                                        {dayjs(subscription.admin_reviewed_at).format("DD/MM/YY")}
                                      </MDTypography>
                                    </Tooltip>
                                  )}
                              </MDTypography>
                            )
                          ) : cellInfo.id === "status" ? (
                            <Chip
                              label={subscription.status}
                              icon={
                                subscription.status === "pending" ? (
                                  <HourglassEmptyIcon fontSize="small" />
                                ) : subscription.status === "complete" ? (
                                  <CheckCircleOutlineIcon fontSize="small" />
                                ) : undefined
                              }
                              color={
                                subscription.status === "pending"
                                  ? "warning"
                                  : subscription.status === "complete"
                                  ? "success"
                                  : subscription.status === "rejected"
                                  ? "error"
                                  : "default"
                              }
                              size="small"
                              sx={{
                                borderRadius: "6px",
                                fontWeight: "medium",
                                minWidth: "90px",
                                textTransform: "capitalize",
                              }}
                            />
                          ) : cellInfo.id === "found_at" ? (
                            <Tooltip
                              title={
                                cellValue ? dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss") : "N/A"
                              }
                              placement="top"
                            >
                              <MDTypography variant="caption">
                                {cellValue ? dayjs(cellValue).format("DD/MM/YY HH:mm") : "N/A"}
                              </MDTypography>
                            </Tooltip>
                          ) : cellInfo.id === "username" ? (
                            <Tooltip title={cellValue ? `@${cellValue}` : "-"} placement="top">
                              <MDTypography variant="caption">
                                {cellValue ? `@${cellValue}` : "-"}
                              </MDTypography>
                            </Tooltip>
                          ) : (
                            <Tooltip title={String(cellValue ?? "-")} placement="top">
                              <MDTypography variant="caption">
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
                      No pending subscriptions found for the current filter.
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
      {/* <<< إضافة Dialog JSX هنا */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog} // لإغلاق النافذة عند الضغط خارجها أو على زر Esc
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to remove this user from this channel? This action cannot be
            undone. undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {" "}
          {/* إضافة padding لأزرار الـ Dialog */}
          <MDButton onClick={handleCloseConfirmDialog} color="secondary" variant="text">
            {" "}
            {/* استخدام variant="text" للإلغاء */}
            Cancel
          </MDButton>
          <MDButton onClick={handleConfirmComplete} color="success" variant="gradient" autoFocus>
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default PendingSubscriptionsTable;
