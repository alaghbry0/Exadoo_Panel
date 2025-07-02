import React, { useMemo } from "react";
import { CircularProgress, Chip } from "@mui/material"; // تأكد من استيراد Chip
import MuiAlert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import SubscriptionHistoryToolbar from "./SubscriptionHistoryToolbar";
import { formatSubDate } from "../utils/subscriptions.utils";
import { centeredContentStyle } from "../utils/ui.utils";

// تكوين أعمدة جدول سجل الاشتراكات
const HISTORY_COLUMNS_CONFIG = [
  // تأكد من أن كل accessor هو سلسلة نصية فريدة
  { Header: "USER", accessor: "full_name", align: "left" },
  { Header: "USERNAME", accessor: "username", align: "left" },
  { Header: "ACTION", accessor: "action_type", align: "center" },
  { Header: "TYPE", accessor: "subscription_type_name", align: "left" },
  { Header: "PLAN", accessor: "subscription_plan_name", align: "left" },
  { Header: "ACTION DATE", accessor: "renewal_date", align: "center" },
  { Header: "EXPIRY DATE", accessor: "expiry_date", align: "center" },
  { Header: "SOURCE", accessor: "source", align: "center" },
];

// دالة تنسيق نوع العمل
const formatActionType = (actionType) => {
  const actionColors = {
    CREATE: "success",
    RENEW: "info",
    CANCEL: "error",
    EXPIRE: "warning",
  };

  const actionLabels = {
    CREATE: "NEW",
    RENEW: "RENEWAL",
    CANCEL: "CANCELED",
    EXPIRE: "EXPIRED",
  };

  return (
    <Chip
      label={actionLabels[actionType] || actionType}
      color={actionColors[actionType] || "default"}
      size="small"
      variant="outlined"
    />
  );
};

// تأكد من أن اسم المكون يبدأ بحرف كبير
function SubscriptionHistoryTabContent({
  historyData,
  loading,
  error,
  setError,
  queryOptions,
  setQueryOptions,
  pagination, // استقبال pagination
  customFilters,
  handleCustomFilterChange,
  availableSources,
  // showSnackbar prop is not used here, but it's okay to receive it
}) {
  const dataTableColumns = useMemo(() => {
    return HISTORY_COLUMNS_CONFIG.map((col) => {
      if (col.accessor === "action_type") {
        return { ...col, Cell: ({ value }) => formatActionType(value) };
      }
      if (col.accessor === "renewal_date" || col.accessor === "expiry_date") {
        return { ...col, Cell: ({ value }) => formatSubDate(value) };
      }
      if (col.accessor === "source") {
        return {
          ...col,
          Cell: ({ value }) => (
            <MDTypography variant="caption" color="text">
              {value || "N/A"}
            </MDTypography>
          ),
        };
      }
      return col;
    });
  }, []); // لا توجد اعتماديات هنا، مما يجعله يُحسب مرة واحدة

  return (
    <>
      <SubscriptionHistoryToolbar
        onFilterChange={handleCustomFilterChange}
        filters={customFilters}
        availableSources={availableSources}
      />

      {error && !loading && (
        <MDBox px={3} py={1}>
          <MuiAlert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
            {error}
          </MuiAlert>
        </MDBox>
      )}

      <MDBox pt={1} sx={{ position: "relative" }}>
        {loading && !historyData?.length && (
          <MDBox sx={centeredContentStyle} py={5}>
            <CircularProgress color="info" />
          </MDBox>
        )}

        {!loading && historyData?.length > 0 ? (
          <DataTable
            table={{ columns: dataTableColumns, rows: historyData }}
            isSorted={false}
            manualPagination
            pageCount={pagination?.total_pages || 1}
            page={queryOptions.page - 1}
            onPageChange={(newPage) => setQueryOptions((prev) => ({ ...prev, page: newPage + 1 }))}
            entriesPerPage={{
              defaultValue: queryOptions.pageSize,
              options: [10, 20, 50, 100],
            }}
            onEntriesPerPageChange={(newPageSize) =>
              setQueryOptions((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
            }
            showTotalEntries={pagination?.total > 0}
            totalEntries={pagination?.total}
            noEndBorder
            canSearch={false}
            pagination={{ variant: "gradient", color: "info" }}
            sx={loading && historyData.length > 0 ? { opacity: 0.7 } : {}}
          />
        ) : (
          !loading &&
          !historyData?.length && (
            <MDBox sx={centeredContentStyle} py={5}>
              <MDTypography variant="h6" color="textSecondary">
                No subscription history found.
              </MDTypography>
              <MDTypography variant="body2" color="textSecondary" mt={1}>
                Try adjusting your search criteria or filters.
              </MDTypography>
            </MDBox>
          )
        )}
      </MDBox>
    </>
  );
}

// 💡 تأكد 100% من وجود هذا السطر
export default SubscriptionHistoryTabContent;
