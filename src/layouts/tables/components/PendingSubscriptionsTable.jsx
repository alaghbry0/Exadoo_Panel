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
} from "@mui/material";
// import CheckIcon from "@mui/icons-material/Check"; // إزالة، لم يعد مستخدماً
// import CloseIcon from "@mui/icons-material/Close"; // إزالة، لم يعد مستخدماً
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // أيقونة لإكمال
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"; // أيقونة لـ pending
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
  { id: "status", label: "STATUS", width: "120px", minWidth: "120px", align: "center" }, // تم تعديل العرض قليلاً
  {
    id: "actions",
    label: "ACTION", // تم تغيير الاسم
    sortable: false,
    width: "120px", // عرض مناسب لزر واحد
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
  // onApprove, // <<< إزالة
  // onReject,  // <<< إزالة
  onMarkComplete, // <<< الدالة الجديدة
  totalCount = 0,
  loading,
}) => {
  // دالة للحصول على الأنماط المشتركة للخلايا
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
                                    onClick={() => onMarkComplete(subscription.id)}
                                    startIcon={<CheckCircleOutlineIcon />} // أيقونة البداية
                                    // sx={{ minWidth: "100px" }} // لضمان عرض النص مع الأيقونة
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
                                sx={{ textTransform: "capitalize" }} // لجعل الحرف الأول كبيرًا
                              >
                                {subscription.status === "complete"
                                  ? "Completed"
                                  : subscription.status}
                                {subscription.admin_reviewed_at &&
                                  (subscription.status === "complete" ||
                                    subscription.status === "approved" ||
                                    subscription.status === "rejected") && ( // عرض التاريخ للحالات المراجَعة
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
                                ) : // يمكنك إضافة أيقونات لحالات أخرى إذا وجدت
                                undefined
                              }
                              color={
                                subscription.status === "pending"
                                  ? "warning"
                                  : subscription.status === "complete" // أو "approved" إذا كنت لا تزال تستخدمها كمرادف
                                  ? "success"
                                  : subscription.status === "rejected" // إذا كانت هذه الحالة لا تزال ممكنة
                                  ? "error"
                                  : "default" // لحالات أخرى غير متوقعة
                              }
                              size="small"
                              sx={{
                                borderRadius: "6px",
                                fontWeight: "medium",
                                minWidth: "90px", // عرض أدنى للـ Chip
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
        rowsPerPageOptions={[10, 20, 50, 100]} // يمكنك إضافة المزيد من الخيارات
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        showFirstButton
        showLastButton
        // يمكنك إضافة props أخرى لـ TablePagination لتحسين تجربة المستخدم
        // labelRowsPerPage="Rows:"
        // labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
      />
    </MDBox>
  );
};

export default PendingSubscriptionsTable;
