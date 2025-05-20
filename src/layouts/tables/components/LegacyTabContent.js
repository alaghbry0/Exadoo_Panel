// src/layouts/tables/components/LegacyTabContent.js
import React, { useMemo } from "react";
import { CircularProgress, Chip as MuiChip } from "@mui/material";
import MuiAlert from "@mui/material/Alert"; // Or your CustomAlert
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import {
  BASE_COLUMNS_CONFIG_LEGACY,
  LEGACY_PROCESSED_FILTER_OPTIONS,
} from "../config/legacy.config.js";
import { formatLegacyProcessedStatus, formatLegacyDate } from "../utils/legacy.utils.js";
import { centeredContentStyle } from "../utils/ui.utils"; // Assuming you created this

function LegacyTabContent({
  legacyData,
  loading,
  error,
  setError,
  queryOptions,
  setQueryOptions,
  totalRecords,
  processedLegacyCount,
  processedFilter,
  handleProcessedFilterChange,
}) {
  const dataTableColumns = useMemo(() => {
    return BASE_COLUMNS_CONFIG_LEGACY.map((col) => {
      if (col.accessor === "processed") {
        return { ...col, Cell: ({ value }) => formatLegacyProcessedStatus(value) };
      }
      if (col.accessor === "expiry_date" || col.accessor === "created_at") {
        return { ...col, Cell: ({ value }) => formatLegacyDate(value) };
      }
      return col;
    });
  }, []);

  const pageCount = Math.ceil(totalRecords / (queryOptions.pageSize || 20));

  return (
    <>
      <MDBox
        p={2}
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mr: 1 }}>
          Status:
        </MDTypography>
        {LEGACY_PROCESSED_FILTER_OPTIONS.map((opt) => {
          let count = 0;
          if (opt.value === null) count = totalRecords; // 'All'
          else if (opt.value === true) count = processedLegacyCount; // 'Processed'
          else if (opt.value === false) count = totalRecords - processedLegacyCount; // 'Not Processed'
          const IconComponent = opt.icon;

          return (
            <MuiChip
              key={String(opt.value)}
              label={`${opt.label} (${count < 0 ? 0 : count})`}
              icon={IconComponent ? <IconComponent fontSize="small" /> : null}
              clickable
              color={processedFilter === opt.value ? "primary" : "default"}
              onClick={() => handleProcessedFilterChange(opt.value)}
              variant={processedFilter === opt.value ? "filled" : "outlined"}
              size="small"
            />
          );
        })}
      </MDBox>
      {error && !loading && (
        <MDBox px={3} py={1}>
          <MuiAlert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
            {error}
          </MuiAlert>
        </MDBox>
      )}
      <MDBox pt={1} sx={{ position: "relative" }}>
        {loading && legacyData.length === 0 && (
          <MDBox sx={centeredContentStyle}>
            <CircularProgress color="info" />
          </MDBox>
        )}
        {(loading && legacyData.length > 0) || (!loading && legacyData.length > 0) ? (
          <DataTable
            table={{ columns: dataTableColumns, rows: legacyData }}
            isSorted={false}
            entriesPerPage={{
              defaultValue: queryOptions.pageSize,
              options: [10, 20, 50, 100],
            }}
            showTotalEntries={totalRecords > 0}
            noEndBorder
            canSearch={false} // Global search handled by parent
            pagination={{ variant: "gradient", color: "info" }}
            manualPagination
            pageCount={pageCount > 0 ? pageCount : 1}
            page={queryOptions.page - 1}
            onPageChange={(newPage) => setQueryOptions((prev) => ({ ...prev, page: newPage + 1 }))}
            onEntriesPerPageChange={(newPageSize) =>
              setQueryOptions((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
            }
            sx={loading && legacyData.length > 0 ? { opacity: 0.7 } : {}}
          />
        ) : (
          !loading &&
          legacyData.length === 0 && (
            <MDBox sx={centeredContentStyle}>
              <MDTypography variant="h6" color="textSecondary">
                No legacy subscriptions found.
              </MDTypography>
            </MDBox>
          )
        )}
      </MDBox>
    </>
  );
}

export default LegacyTabContent;
