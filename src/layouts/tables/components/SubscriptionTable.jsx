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
  Button, // <<<<<<< أضفنا Button
  CircularProgress, // <<<<<<< أضفنا CircularProgress للتحميل
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // << أيقونة اختيارية للزر

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import dayjs from "dayjs";

const headCells = [
  // ... (نفس تعريفات headCells لديك)
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
  // --- Props معدلة/جديدة ---
  onLoadMore, // دالة لجلب المزيد
  hasMore, // هل يوجد المزيد من البيانات؟
  loadingMore, // هل عملية جلب المزيد جارية؟
  // --- نهاية Props معدلة/جديدة ---
  onEditClick,
  order,
  orderBy,
  onRequestSort,
  loading, // هذا للتحميل الأولي
  totalCount = 0, // لا يزال مفيدًا لمعرفة العدد الإجمالي إذا لزم الأمر
}) => {
  // --- DEBUGGING START ---
  console.log("[SubscriptionTable] Props received:", {
    subscriptions,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    order,
    orderBy,
  });
  // ... (باقي console.log الخاص بك)
  // --- DEBUGGING END ---

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const getCommonCellStyles = (cellConfig) => ({
    py: 0.8,
    px: 1.5,
    width: cellConfig.width,
    minWidth: cellConfig.minWidth,
    maxWidth: cellConfig.width,
    boxSizing: "border-box",
    fontSize: "0.875rem",
  });

  const getHeaderCellStyles = (theme, headCell) => ({
    ...getCommonCellStyles(headCell),
    py: 1.5,
    px: 1.5,
    fontWeight: "medium",
    backgroundColor: theme.palette.background.paper,
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

  const renderSkeletonRows = () => {
    // نعرض عدد قليل من Skeletons ثابت عند التحميل الأولي
    // أو يمكنك استخدام rowsPerPage إذا كنت لا تزال تمررها من مكان ما كـ default
    const skeletonRowCount = loading && (!subscriptions || subscriptions.length === 0) ? 5 : 0;
    return Array.from(new Array(skeletonRowCount)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-cell-${cell.id}-${index}`}
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
          borderRadius: "8px",
          overflow: "hidden", // تأكد من أن هذا لا يخفي زر "جلب المزيد" إذا كان بالداخل
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          size="small"
          sx={{
            tableLayout: "fixed",
            minWidth: tableMinWidth,
            width: "100%",
          }}
        >
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
                        width: "100%",
                        display: "flex",
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
            {loading && (!subscriptions || subscriptions.length === 0)
              ? renderSkeletonRows()
              : subscriptions && subscriptions.length > 0
              ? subscriptions.map((subscription, index) => {
                  const rowKey = subscription.id ?? `${subscription.telegram_id}-${index}`;
                  return (
                    <TableRow
                      hover
                      key={rowKey}
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
                            key={`${cellInfo.id}-${rowKey}`}
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
                                    <Tooltip
                                      title={
                                        subscription.expiry_date
                                          ? dayjs(subscription.expiry_date).format("DD/MM/YYYY")
                                          : "N/A"
                                      }
                                      placement="top"
                                      arrow
                                    >
                                      <MDTypography variant="caption" sx={typographyStyles}>
                                        {subscription.expiry_date
                                          ? dayjs(subscription.expiry_date).format("DD/MM/YY")
                                          : "N/A"}
                                      </MDTypography>
                                    </Tooltip>
                                  );
                                case "username":
                                  return (
                                    <Tooltip
                                      title={
                                        subscription.username ? `@${subscription.username}` : "-"
                                      }
                                      placement="top"
                                      arrow
                                    >
                                      <MDTypography variant="caption" sx={typographyStyles}>
                                        {subscription.username ? `@${subscription.username}` : "-"}
                                      </MDTypography>
                                    </Tooltip>
                                  );
                                default:
                                  return (
                                    <Tooltip title={String(cellValue ?? "-")} placement="top" arrow>
                                      <MDTypography variant="caption" sx={typographyStyles}>
                                        {String(cellValue ?? "-")}
                                      </MDTypography>
                                    </Tooltip>
                                  );
                              }
                            })()}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              : !loading && ( // إذا لم يكن هناك تحميل ولا توجد بيانات
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

      {/* --- زر جلب المزيد أو رسالة اكتمال البيانات --- */}
      <MDBox sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        {hasMore ? (
          <Button
            variant="contained"
            color="primary" // يمكنك استخدام "info" أو أي لون آخر من MD
            onClick={onLoadMore}
            disabled={loadingMore || loading} // تعطيل أثناء التحميل الأولي أو تحميل المزيد
            startIcon={
              loadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreIcon />
            }
            sx={{ textTransform: "none" }}
          >
            {loadingMore ? "جاري التحميل..." : "جلب المزيد"}
          </Button>
        ) : (
          subscriptions &&
          subscriptions.length > 0 && ( // لا تعرض هذه الرسالة إذا لم يكن هناك بيانات أصلاً
            <MDTypography variant="body2" color="textSecondary">
              تم جلب كل البيانات
            </MDTypography>
          )
        )}
      </MDBox>
      {/* --- نهاية زر جلب المزيد --- */}
    </MDBox>
  );
};

export default SubscriptionTable;
