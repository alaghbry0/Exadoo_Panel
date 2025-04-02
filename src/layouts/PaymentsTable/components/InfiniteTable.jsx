// components/InfiniteTable.jsx
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
  Typography,
} from "@mui/material";

const InfiniteTable = ({
  columns,
  data,
  loading,
  hasMore,
  loadMore,
  rowHeight = 60,
  emptyMessage = "لا توجد بيانات",
}) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <Paper elevation={0} sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.accessor}
                  align={column.align || "left"}
                  style={{
                    width: column.width,
                    fontWeight: 600,
                    backgroundColor: "#f5f7fa",
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              <>
                {data.map((row, index) => (
                  <TableRow key={row.id || index} hover sx={{ height: rowHeight }}>
                    {columns.map((column) => (
                      <TableCell
                        key={`${row.id || index}-${column.accessor}`}
                        align={column.align || "left"}
                      >
                        {column.cell ? column.cell(row) : row[column.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        ref={observerTarget}
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        {loading && <CircularProgress size={32} />}
      </Box>
    </Paper>
  );
};

export default InfiniteTable;
