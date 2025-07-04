// src/layouts/tables/components/SubscriptionsTabContent.js

import React, { useMemo, useState } from "react";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MuiAlert from "@mui/material/Alert";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import SubscriptionTableToolbar from "./SubscriptionTableToolbar";
import { BASE_COLUMNS_CONFIG_SUBS } from "../config/subscriptions.config";
import { formatSubStatus, formatSubDate } from "../utils/subscriptions.utils";
import { centeredContentStyle } from "../utils/ui.utils";
import { cancelSubscriptionAdmin } from "../../../services/api";

// --- إضافة: مكون بسيط لعرض الإحصائيات ---
const StatsCard = ({ title, count, color = "text" }) => (
  <Paper elevation={2} sx={{ p: 2, textAlign: "center", height: "100%" }}>
    <MDTypography variant="button" color={color} fontWeight="bold" textTransform="uppercase">
      {title}
    </MDTypography>
    <MDTypography variant="h4" fontWeight="bold">
      {count}
    </MDTypography>
  </Paper>
);

function SubscriptionsTabContent({
  subscriptions,
  loading,
  error,
  setError,
  queryOptions,
  setQueryOptions,
  // --- تعديل: استقبال pagination و statistics ---
  pagination,
  statistics,
  customFilters,
  handleCustomFilterChange,
  subscriptionTypes,
  subscriptionPlans,
  availableSources,
  onAddNewOrRenewClick,
  onEditExistingClick,
  onDataShouldRefresh,
  showSnackbar,
}) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);

  const handleOpenCancelConfirm = (subscription) => {
    // ... (Your existing logic for finding subscription_type_id)
    if (!subscription.subscription_type_id && subscription.subscription_type_name) {
      const type = subscriptionTypes.find((st) => st.name === subscription.subscription_type_name);
      if (type) {
        subscription.subscription_type_id = type.id;
      }
    }
    if (!subscription.telegram_id || !subscription.subscription_type_id) {
      showSnackbar(
        "Cannot prepare cancellation: Missing Telegram ID or Subscription Type ID.",
        "error"
      );
      return;
    }
    setSubscriptionToCancel(subscription);
    setCancelConfirmOpen(true);
  };

  const handleCloseCancelConfirm = () => {
    setSubscriptionToCancel(null);
    setCancelConfirmOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (!subscriptionToCancel) return;
    try {
      await cancelSubscriptionAdmin({
        telegram_id: subscriptionToCancel.telegram_id,
        subscription_type_id: subscriptionToCancel.subscription_type_id,
      });
      showSnackbar("Subscription canceled successfully!", "success");
      onDataShouldRefresh();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Error canceling subscription";
      showSnackbar(errorMessage, "error");
    }
    handleCloseCancelConfirm();
  };

  const handleSort = (sortedColumn) => {
    if (sortedColumn && sortedColumn.length > 0) {
      const { id, desc } = sortedColumn[0];
      setQueryOptions((prev) => ({
        ...prev,
        sort_by: id,
        sort_order: desc ? "desc" : "asc",
        page: 1,
      }));
    }
  };

  const dataTableColumns = useMemo(() => {
    const actionColumn = {
      Header: "ACTIONS",
      accessor: "actions",
      align: "center",
      disableSortBy: true,
      Cell: ({ row }) => (
        <MDBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
          <Tooltip title="Edit Subscription">
            <span>
              <IconButton
                size="small"
                onClick={() => onEditExistingClick(row.original)}
                color="info"
                disabled={
                  row.original.status_label === "expired" ||
                  row.original.status_label === "inactive"
                }
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancel Subscription">
            <span>
              <IconButton
                size="small"
                onClick={() => handleOpenCancelConfirm(row.original)}
                color="error"
                disabled={
                  row.original.status_label === "expired" ||
                  row.original.status_label === "inactive"
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </MDBox>
      ),
    };

    const formattedBase = BASE_COLUMNS_CONFIG_SUBS.map((col) => {
      if (col.accessor === "status_label")
        return { ...col, Cell: ({ value }) => formatSubStatus(value) };
      if (col.accessor === "expiry_date" || col.accessor === "start_date")
        return { ...col, Cell: ({ value }) => formatSubDate(value) };
      return col;
    });

    return [...formattedBase, actionColumn];
  }, [onEditExistingClick, subscriptionTypes]);

  return (
    <>
      <MDBox p={2}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md>
            <StatsCard title="Total" count={statistics?.total_records ?? 0} />
          </Grid>
          <Grid item xs={6} sm={4} md>
            <StatsCard title="Active" count={statistics?.active_count ?? 0} color="success" />
          </Grid>
          <Grid item xs={6} sm={4} md>
            <StatsCard
              title="Expiring Soon"
              count={statistics?.expiring_soon_count ?? 0}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={4} md>
            <StatsCard title="Inactive" count={statistics?.inactive_count ?? 0} color="secondary" />
          </Grid>
          <Grid item xs={6} sm={4} md>
            <StatsCard title="Expired" count={statistics?.expired_count ?? 0} color="error" />
          </Grid>
        </Grid>
      </MDBox>

      <SubscriptionTableToolbar
        onFilterChange={handleCustomFilterChange}
        filters={customFilters}
        subscriptionTypes={subscriptionTypes}
        subscriptionPlans={subscriptionPlans}
        availableSources={availableSources}
        onAddNewClick={onAddNewOrRenewClick}
      />
      {error && !loading && (
        <MDBox px={3} py={1}>
          <MuiAlert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
            {error}
          </MuiAlert>
        </MDBox>
      )}
      <MDBox pt={1} sx={{ position: "relative" }}>
        {loading && subscriptions.length === 0 && (
          <MDBox sx={centeredContentStyle}>
            <CircularProgress color="info" />
          </MDBox>
        )}
        {(loading && subscriptions.length > 0) || (!loading && subscriptions.length > 0) ? (
          <DataTable
            table={{ columns: dataTableColumns, rows: subscriptions }}
            manualPagination
            manualSortBy
            onSortByChange={handleSort}
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
            sx={loading && subscriptions.length > 0 ? { opacity: 0.7 } : {}}
          />
        ) : (
          !loading &&
          subscriptions.length === 0 && (
            <MDBox sx={centeredContentStyle} py={5}>
              <MDTypography variant="h6" color="textSecondary">
                No subscriptions found.
              </MDTypography>
              <MDTypography variant="body2" color="textSecondary">
                Try adjusting your search or filters.
              </MDTypography>
            </MDBox>
          )
        )}
      </MDBox>

      <Dialog
        open={cancelConfirmOpen}
        onClose={handleCloseCancelConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"تأكيد حذف الاشتراك"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            هل أنت متأكد أنك تريد حذف هذا الاشتراك؟
            <br />
            <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseCancelConfirm} color="secondary">
            إلغاء
          </MDButton>
          <MDButton onClick={handleConfirmCancel} color="error" autoFocus>
            تأكيد الحذف
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SubscriptionsTabContent;
