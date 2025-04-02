import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  TableSortLabel,
} from "@mui/material";
import { AutoSizer, List, WindowScroller } from "react-virtualized";

/**
 * مكون جدول افتراضي للتعامل مع كميات كبيرة من البيانات مع ميزة التحميل اللانهائي
 */
const VirtualTable = ({ data, columns, height, onLoadMore, loading, hasMore }) => {
  const loaderRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // دالة لترتيب البيانات
  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // معالجة طلب الترتيب
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // إعداد مراقبة التمرير للتحميل اللانهائي
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  // رسم الخلية باستخدام دالة العرض المخصصة أو القيمة المباشرة
  const renderCell = (row, column) => {
    if (column.cell) {
      return column.cell(row);
    }
    return row[column.accessor] || "—";
  };

  // دالة لرسم صفوف البيانات بشكل افتراضي
  const rowRenderer = ({ index, key, style }) => {
    const row = sortedData[index];

    return (
      <TableRow key={key} style={{ ...style, display: "flex" }} hover>
        {columns.map((column) => (
          <TableCell
            key={`${row.id || index}-${column.accessor}`}
            style={{
              flex: column.width ? `0 0 ${column.width}` : 1,
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              boxSizing: "border-box",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            {renderCell(row, column)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table stickyHeader aria-label="جدول البيانات">
          <TableHead>
            <TableRow style={{ display: "flex" }}>
              {columns.map((column) => (
                <TableCell
                  key={column.accessor}
                  sortDirection={sortConfig.key === column.accessor ? sortConfig.direction : false}
                  style={{
                    flex: column.width ? `0 0 ${column.width}` : 1,
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {column.accessor !== "actions" ? (
                    <TableSortLabel
                      active={sortConfig.key === column.accessor}
                      direction={sortConfig.key === column.accessor ? sortConfig.direction : "asc"}
                      onClick={() => requestSort(column.accessor)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>

        <Box sx={{ height, width: "100%" }}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width}
                height={height}
                rowCount={sortedData.length}
                rowHeight={72}
                rowRenderer={rowRenderer}
                overscanRowCount={5}
              />
            )}
          </AutoSizer>

          {/* عنصر لمراقبة التمرير وتحميل المزيد من البيانات */}
          <div ref={loaderRef} style={{ height: 20, width: "100%" }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </div>

          {!loading && data.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography variant="body1" color="textSecondary">
                لا توجد بيانات للعرض
              </Typography>
            </Box>
          )}
        </Box>
      </TableContainer>
    </Paper>
  );
};

VirtualTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  height: PropTypes.number,
  onLoadMore: PropTypes.func,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
};

VirtualTable.defaultProps = {
  height: 400,
  onLoadMore: () => {},
  loading: false,
  hasMore: false,
};

export default VirtualTable;
