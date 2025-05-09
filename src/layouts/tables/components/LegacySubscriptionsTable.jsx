import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip as MuiChip, // <<< --- استخدام MuiChip هنا
  Tooltip,
  Skeleton,
  TableSortLabel,
  Box, // <<< --- لاستخدامه في تنسيق label الـ Chip
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
// import InfoIcon from "@mui/icons-material/Info"; // إزالة إذا لم يكن مستخدماً
import ChecklistIcon from "@mui/icons-material/Checklist";
import DoneIcon from "@mui/icons-material/Done";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // سيبقى لزر "Load More"
import dayjs from "dayjs";
import { getLegacySubscriptions } from "services/api";

const headCells = [
  { id: "username", label: "USERNAME", width: "150px", minWidth: "150px", sortable: true },
  {
    id: "subscription_type_name",
    label: "SUB TYPE",
    width: "200px",
    minWidth: "200px",
    sortable: true,
  },
  {
    id: "processed",
    label: "PROCESSED",
    width: "130px",
    minWidth: "130px",
    align: "center",
    sortable: true,
  },
  {
    id: "expiry_date",
    label: "EXPIRY DATE",
    width: "150px",
    minWidth: "150px",
    align: "center",
    sortable: true,
  },
];

// تعديل filterOptions لتضمين colorMui
const filterOptions = [
  { label: "All", value: null, icon: <ChecklistIcon fontSize="small" />, colorMui: "primary" },
  { label: "Processed", value: true, icon: <DoneIcon fontSize="small" />, colorMui: "success" }, // كان color: "success"
  {
    label: "Not Processed",
    value: false,
    icon: <UnpublishedIcon fontSize="small" />,
    colorMui: "error",
  }, // كان color: "error"
];

const ROWS_PER_PAGE_FOR_LOAD_MORE = 20;

const LegacySubscriptionsTable = ({
  initialLegacySubscriptions,
  onLoadMore,
  totalServerCount = 0,
  loadingInitial,
  order,
  orderBy,
  onRequestSort,
  activeFilter,
  onFilterChange,
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState({ all: 0, processed: 0, notProcessed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [displayedSubscriptions, setDisplayedSubscriptions] = useState([]);
  const [currentPageToFetch, setCurrentPageToFetch] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (initialLegacySubscriptions) {
      setDisplayedSubscriptions(initialLegacySubscriptions);
      setCurrentPageToFetch(2);
      setAllDataLoaded(
        initialLegacySubscriptions.length >= totalServerCount ||
          initialLegacySubscriptions.length < ROWS_PER_PAGE_FOR_LOAD_MORE
      );
    }
  }, [initialLegacySubscriptions, totalServerCount]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const allDataResponse = await getLegacySubscriptions({ page: 1, page_size: 1 });
        const total =
          allDataResponse.length > 0 && allDataResponse[0].total_count !== undefined
            ? allDataResponse[0].total_count
            : 0;
        const processedDataResponse = await getLegacySubscriptions({
          processed: true,
          page: 1,
          page_size: 1,
        });
        const processedCount =
          processedDataResponse.length > 0 && processedDataResponse[0].total_count !== undefined
            ? processedDataResponse[0].total_count
            : 0;
        const notProcessedDataResponse = await getLegacySubscriptions({
          processed: false,
          page: 1,
          page_size: 1,
        });
        const notProcessedCount =
          notProcessedDataResponse.length > 0 &&
          notProcessedDataResponse[0].total_count !== undefined
            ? notProcessedDataResponse[0].total_count
            : 0;
        setStats({ all: total, processed: processedCount, notProcessed: notProcessedCount });
      } catch (err) {
        console.error("Error fetching legacy stats:", err);
        setStats({ all: 0, processed: 0, notProcessed: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [activeFilter]);

  const getStatForFilter = (filterValue) => {
    // لا نعرض Skeleton هنا، بل العدد أو مؤشر تحميل صغير داخل الـ Chip
    if (filterValue === null) return stats.all;
    if (filterValue === true) return stats.processed;
    if (filterValue === false) return stats.notProcessed;
    return 0;
  };

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
    "& .MuiTableSortLabel-icon": {
      color: `${theme.palette.text.secondary} !important`,
    },
  });

  const renderSkeletonRows = () =>
    Array.from(new Array(ROWS_PER_PAGE_FOR_LOAD_MORE)).map((_, index) => (
      <TableRow key={`skeleton-legacy-${index}`}>
        {headCells.map((cell) => (
          <TableCell
            key={`skeleton-legacy-cell-${cell.id}-${index}`}
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

  const handleLoadMore = async () => {
    if (isLoadingMore || allDataLoaded) return;
    setIsLoadingMore(true);
    try {
      const newData = await onLoadMore(currentPageToFetch, ROWS_PER_PAGE_FOR_LOAD_MORE);
      if (newData && newData.length > 0) {
        setDisplayedSubscriptions((prevSubs) => {
          const existingIds = new Set(prevSubs.map((s) => s.id));
          const uniqueNewData = newData.filter((s) => !existingIds.has(s.id));
          return [...prevSubs, ...uniqueNewData];
        });
        setCurrentPageToFetch((prevPage) => prevPage + 1);
        if (
          newData.length < ROWS_PER_PAGE_FOR_LOAD_MORE ||
          displayedSubscriptions.length + newData.length >= totalServerCount
        ) {
          setAllDataLoaded(true);
        }
      } else {
        setAllDataLoaded(true);
      }
    } catch (error) {
      console.error("Error loading more legacy subscriptions:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          !allDataLoaded &&
          displayedSubscriptions.length > 0 &&
          displayedSubscriptions.length < totalServerCount
        ) {
          // handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );
    const loadMoreTrigger = document.getElementById("load-more-trigger");
    if (loadMoreTrigger) observer.observe(loadMoreTrigger);
    return () => {
      if (loadMoreTrigger) observer.unobserve(loadMoreTrigger);
    };
  }, [isLoadingMore, allDataLoaded, displayedSubscriptions, totalServerCount, handleLoadMore]);

  return (
    <MDBox>
      {/* --- قسم الفلاتر المعدل ليستخدم MuiChip --- */}
      <MDBox
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mb={2}
        gap={1.5}
        flexWrap="wrap"
        p={2}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mr: 1 }}>
          Status:
        </MDTypography>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.value;
          const statCount = getStatForFilter(filter.value);

          // تحديد لون النص داخل الـ Chip بناءً على حالته ولونه
          let chipTextColor = theme.palette.text.secondary; // افتراضي لـ outlined
          if (isActive) {
            if (filter.colorMui && theme.palette[filter.colorMui]) {
              chipTextColor = theme.palette.getContrastText(theme.palette[filter.colorMui].main);
            } else if (theme.palette.primary) {
              // fallback لـ primary
              chipTextColor = theme.palette.getContrastText(theme.palette.primary.main);
            } else {
              chipTextColor = "white"; // افتراضي إذا لم يتمكن من تحديد contrastText
            }
          }

          return (
            <MuiChip
              key={filter.label}
              label={
                <Box component="span" display="flex" alignItems="center">
                  {filter.label}
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      ml: 0.75,
                      fontWeight: isActive ? "bold" : "normal",
                      color: "inherit", // يرث اللون من الـ Chip label
                      opacity: isActive ? 1 : 0.8,
                    }}
                  >
                    (
                    {statsLoading && isActive ? (
                      <CircularProgress size={10} color="inherit" sx={{ ml: 0.5 }} />
                    ) : (
                      statCount
                    )}
                    )
                  </Typography>
                </Box>
              }
              icon={filter.icon}
              clickable
              color={isActive ? filter.colorMui || "primary" : "default"}
              variant={isActive ? "filled" : "outlined"}
              size="small"
              onClick={() => {
                // عند تغيير الفلتر، المكون الأب سيعيد جلب البيانات الأولية
                // لذا لا حاجة لإعادة تعيين displayedSubscriptions هنا
                onFilterChange(filter.value);
              }}
              sx={{
                // تعديلات لضمان أن لون النص والأيقونة مناسبان
                color: isActive ? chipTextColor : theme.palette.text.secondary, // لون النص الرئيسي للـ Chip
                "& .MuiChip-icon": {
                  color: "inherit", // الأيقونة ترث لون الـ Chip
                  marginLeft: "5px",
                  marginRight: "-6px",
                },
                "& .MuiChip-label": {
                  paddingLeft: "10px",
                  paddingRight: "10px",
                },
              }}
            />
          );
        })}
      </MDBox>
      {/* --- نهاية قسم الفلاتر المعدل --- */}

      <TableContainer
        ref={tableContainerRef}
        component={Paper}
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: "8px",
          overflowX: "auto",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
          marginTop: 0, // تمت إزالة الهامش العلوي لأن MDBox للفلاتر أصبح له padding و border
        }}
      >
        <Table size="small" sx={{ tableLayout: "fixed", minWidth: tableMinWidth }}>
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
                      onClick={(event) => {
                        onRequestSort(event, headCell.id);
                      }}
                      sx={{
                        "&, &:hover, &.Mui-active": { color: "inherit" },
                        width: "100%",
                        "& .MuiTableSortLabel-icon": { opacity: 1 },
                      }}
                    >
                      <MDTypography variant="caption" fontWeight="bold" color="text" noWrap>
                        {headCell.label}
                      </MDTypography>
                    </TableSortLabel>
                  ) : (
                    <MDTypography variant="caption" fontWeight="bold" color="text" noWrap>
                      {headCell.label}
                    </MDTypography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingInitial && displayedSubscriptions.length === 0
              ? renderSkeletonRows()
              : displayedSubscriptions.map((subscription) => (
                  <TableRow
                    hover
                    key={subscription.id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {headCells.map((cellInfo) => {
                      const cellValue = subscription[cellInfo.id];
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
                          {(() => {
                            switch (cellInfo.id) {
                              case "processed":
                                return (
                                  <MuiChip
                                    label={cellValue ? "Processed" : "Not Processed"}
                                    color={cellValue ? "success" : "error"}
                                    size="small"
                                    sx={{
                                      borderRadius: "6px",
                                      fontWeight: "medium",
                                      minWidth: "100px",
                                      textTransform: "capitalize",
                                    }}
                                  />
                                );
                              case "expiry_date":
                                return (
                                  <Tooltip
                                    title={
                                      cellValue
                                        ? dayjs(cellValue).format("DD/MM/YYYY HH:mm")
                                        : "N/A"
                                    }
                                    placement="top"
                                  >
                                    <MDTypography variant="caption" noWrap>
                                      {cellValue ? dayjs(cellValue).format("DD MMM YYYY") : "N/A"}
                                    </MDTypography>
                                  </Tooltip>
                                );
                              case "username":
                                return (
                                  <Tooltip
                                    title={cellValue ? `@${cellValue}` : "-"}
                                    placement="top"
                                  >
                                    <MDTypography variant="caption" noWrap>
                                      {cellValue ? `@${cellValue}` : "-"}
                                    </MDTypography>
                                  </Tooltip>
                                );
                              default:
                                return (
                                  <Tooltip title={String(cellValue ?? "-")} placement="top">
                                    <MDTypography variant="caption" noWrap>
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
                ))}
            {displayedSubscriptions.length === 0 && !loadingInitial && !isLoadingMore && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                  <MDBox>
                    <MDTypography variant="h6" color="textSecondary">
                      No legacy subscriptions found for the current filter.
                    </MDTypography>
                  </MDBox>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MDBox display="flex" justifyContent="center" alignItems="center" py={2}>
        {!loadingInitial && displayedSubscriptions.length > 0 && !allDataLoaded && (
          <MDButton
            id="load-more-trigger"
            variant="outlined"
            color="info"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            startIcon={
              isLoadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreIcon />
            }
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </MDButton>
        )}
        {allDataLoaded && displayedSubscriptions.length > 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <CheckCircleOutlineIcon fontSize="small" color="success" /> All data loaded. (
            {displayedSubscriptions.length} of {totalServerCount})
          </Typography>
        )}
      </MDBox>
    </MDBox>
  );
};

export default LegacySubscriptionsTable;
