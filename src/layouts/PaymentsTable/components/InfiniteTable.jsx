// src/components/InfiniteTable.jsx
import React, { useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  useTheme,
  Skeleton,
} from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * Skeleton component for the table loading state.
 */
const TableSkeleton = ({ columns, rows = 10 }) => (
  <>
    {Array.from(new Array(rows)).map((_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {columns.map((column) => (
          <TableCell key={`skeleton-cell-${column.accessor}`} align={column.align || "right"}>
            <Skeleton variant="text" width="80%" sx={{ fontSize: "1rem" }} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/**
 * A theme-aware, infinite-scrolling table with skeleton loading and improved UX.
 * @param {object[]} columns - Array of column definitions. e.g., { accessor, header, align, width, cell }
 * @param {object[]} data - The data array to be displayed.
 * @param {boolean} loading - Indicates if data is currently being loaded.
 * @param {boolean} hasMore - Indicates if there is more data to load.
 * @param {function} loadMore - The function to call to load more data.
 * @param {function} [onRowClick] - Optional function to handle row clicks.
 * @param {string} [emptyMessage] - Message to display when there is no data.
 * @param {number} [rowHeight] - The height of each table row.
 */
const InfiniteTable = ({
  columns,
  data,
  loading,
  hasMore,
  loadMore,
  onRowClick,
  emptyMessage = "لا توجد بيانات لعرضها",
  rowHeight = 60,
}) => {
  const theme = useTheme();
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Load more only if not currently loading and there is more data
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the target is visible
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMore, loading]);

  const showSkeleton = loading && data.length === 0;
  const showEmptyState = !loading && data.length === 0;

  return (
    <Paper
      elevation={0}
      sx={{ width: "100%", overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}
    >
      <TableContainer sx={{ maxHeight: { xs: "70vh", md: 650 } }}>
        <Table stickyHeader aria-label="infinite scroll table">
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-root": {
                  backgroundColor: theme.palette.grey[100], // Theme-aware header color
                  borderBottom: `2px solid ${theme.palette.divider}`,
                },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.accessor}
                  align={column.align || "right"}
                  style={{ width: column.width }}
                >
                  <MDTypography variant="overline" color="text" fontWeight="bold">
                    {column.header}
                  </MDTypography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {showSkeleton ? (
              <TableSkeleton columns={columns} />
            ) : showEmptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <MDBox display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <InboxOutlined sx={{ fontSize: 56, color: "text.disabled" }} />
                    <MDTypography variant="h6" color="textSecondary">
                      {emptyMessage}
                    </MDTypography>
                  </MDBox>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    height: rowHeight,
                    cursor: onRowClick ? "pointer" : "default",
                    "&:last-child td, &:last-child th": { border: 0 },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id || index}-${column.accessor}`}
                      align={column.align || "right"}
                    >
                      <MDTypography variant="button" color="textSecondary" fontWeight="regular">
                        {column.cell ? column.cell(row) : row[column.accessor]}
                      </MDTypography>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MDBox
        ref={observerTarget}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          minHeight: 60,
        }}
      >
        {loading && data.length > 0 && <CircularProgress size={32} />}
        {!loading && !hasMore && data.length > 0 && (
          <MDTypography variant="caption" color="textSecondary">
            لقد وصلت إلى نهاية القائمة
          </MDTypography>
        )}
      </MDBox>
    </Paper>
  );
};

export default InfiniteTable;
