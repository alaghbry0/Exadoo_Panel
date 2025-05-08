// layouts/tables/components/LegacySubscriptionsTable.jsx
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
// import ArchiveIcon from "@mui/icons-material/Archive"; // لم نعد بحاجة إليه
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton"; // لم نعد بحاجة إليه هنا
import dayjs from "dayjs";

const headCells = [
  { id: "id", label: "ID", width: "70px", minWidth: "70px", numeric: true },
  { id: "username", label: "USERNAME", width: "130px", minWidth: "130px" },
  { id: "subscription_type_name", label: "SUB TYPE", width: "140px", minWidth: "140px" },
  { id: "excel_file_name", label: "EXCEL SHEET", width: "150px", minWidth: "150px" },
  { id: "start_date", label: "START DATE", width: "110px", minWidth: "110px", align: "center" },
  { id: "expiry_date", label: "EXPIRY DATE", width: "110px", minWidth: "110px", align: "center" },
  { id: "processed", label: "STATUS", width: "100px", minWidth: "100px", align: "center" },
  // إذا لم يعد هناك أي إجراءات أخرى، يمكن إزالة هذا العمود أو تعديل عرضه
  // سنبقيه الآن فارغًا أو يمكنك تعديل عرضه ليناسب "No actions" مثلاً أو إزالته بالكامل
  // { id: "actions", label: "ACTIONS", sortable: false, width: "160px", minWidth: "160px", align: "center" },
  // قررت إزالة عمود "ACTIONS" بالكامل لأنه لا يوجد إجراء الآن
];

// تعديل headCells إذا تم إزالة عمود Actions
const updatedHeadCells = headCells.filter((cell) => cell.id !== "actions");

const LegacySubscriptionsTable = ({
  legacySubscriptions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  // onProcess, // --- إزالة Prop
  totalCount = 0,
  loading,
}) => {
  const renderSkeletonRows = () =>
    Array.from(new Array(rowsPerPage)).map((_, index) => (
      <TableRow key={`skeleton-legacy-${index}`}>
        {updatedHeadCells.map(
          (
            cell // استخدام updatedHeadCells
          ) => (
            <TableCell
              key={`skeleton-legacy-cell-${cell.id}-${index}`}
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
          )
        )}
      </TableRow>
    ));

  if (loading && legacySubscriptions.length === 0) {
    return (
      <MDBox>
        <TableContainer
          component={Paper}
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: "8px" }}
        >
          <Table size="small" sx={{ tableLayout: "fixed" }}>
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
              <TableRow>
                {updatedHeadCells.map(
                  (
                    headCell // استخدام updatedHeadCells
                  ) => (
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
                  )
                )}
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
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              {updatedHeadCells.map(
                (
                  headCell // استخدام updatedHeadCells
                ) => (
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
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {legacySubscriptions.map((subscription) => (
              <TableRow hover key={subscription.id}>
                {updatedHeadCells.map((cellInfo) => {
                  // استخدام updatedHeadCells
                  let cellValue = subscription[cellInfo.id];
                  if (cellInfo.id === "processed") {
                    cellValue = subscription.processed;
                  }

                  return (
                    <TableCell
                      key={`${cellInfo.id}-${subscription.id}`}
                      align={cellInfo.align || (cellInfo.numeric ? "right" : "left")}
                      sx={{
                        py: 0.8,
                        px: 1.5,
                        width: cellInfo.width,
                        minWidth: cellInfo.minWidth,
                        maxWidth: cellInfo.width,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* --- إزالة هذا الجزء الخاص بالزر ---
                      {cellInfo.id === "actions" ? (
                        !subscription.processed && (
                          <Tooltip title="Mark as Processed">
                            <MDButton
                              size="small"
                              variant="gradient"
                              color="info"
                              onClick={() => onProcess(subscription.id)} // onProcess لم يعد موجودًا
                              startIcon={<ArchiveIcon fontSize="small" />}
                              sx={{minWidth: 'auto', padding: '4px 8px'}}
                            >
                              <MDTypography variant="caption" color="inherit" fontWeight="medium" sx={{whiteSpace: 'nowrap'}}> Process</MDTypography>
                            </MDButton>
                          </Tooltip>
                        )
                      ) :  */}
                      {cellInfo.id === "processed" ? (
                        <Chip
                          label={cellValue ? "Processed" : "Unprocessed"}
                          color={cellValue ? "success" : "warning"}
                          size="small"
                          sx={{ borderRadius: "6px", fontWeight: "medium", minWidth: "90px" }}
                        />
                      ) : cellInfo.id === "start_date" || cellInfo.id === "expiry_date" ? (
                        <Tooltip
                          title={cellValue ? dayjs(cellValue).format("DD/MM/YYYY") : "N/A"}
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
                            {cellValue ? dayjs(cellValue).format("DD/MM/YY") : "N/A"}
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
                        <Tooltip
                          title={String(
                            cellValue ?? (cellInfo.id === "excel_file_name" ? "N/A" : "-")
                          )}
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
                            {String(cellValue ?? (cellInfo.id === "excel_file_name" ? "N/A" : "-"))}
                          </MDTypography>
                        </Tooltip>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {legacySubscriptions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={updatedHeadCells.length} align="center" sx={{ py: 3 }}>
                  {" "}
                  {/* استخدام updatedHeadCells */}
                  <MDBox>
                    <MDTypography variant="h6" color="textSecondary">
                      No legacy subscriptions
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

export default LegacySubscriptionsTable;
