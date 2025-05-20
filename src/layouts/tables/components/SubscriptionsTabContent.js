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
import { cancelSubscriptionAdmin } from "../../../services/api"; // استيراد دالة الإلغاء

function SubscriptionsTabContent({
  subscriptions,
  loading,
  error,
  setError,
  queryOptions,
  setQueryOptions,
  totalRecords,
  customFilters,
  handleCustomFilterChange,
  subscriptionTypes,
  availableSources,
  onAddNewOrRenewClick, // اسم محدث
  onEditExistingClick, // اسم محدث
  onDataShouldRefresh, // لتحديث البيانات بعد أي تغيير (إضافة، تعديل، إلغاء)
  showSnackbar, // تمرير دالة عرض Snackbar
}) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);

  const handleOpenCancelConfirm = (subscription) => {
    // تأكد أن subscription.subscription_type_id موجود هنا
    // إذا لم يكن، قد تحتاج للحصول عليه من subscriptionTypes بناءً على channel_id أو اسم النوع
    if (!subscription.subscription_type_id && subscription.subscription_type_name) {
      const type = subscriptionTypes.find((st) => st.name === subscription.subscription_type_name);
      if (type) {
        subscription.subscription_type_id = type.id;
      }
    }
    // تحقق إضافي
    if (!subscription.subscription_type_id && subscription.channel_id) {
      // هذا أكثر تعقيدًا، قد تحتاج للبحث عن subscription_type الذي main_channel_id له هو subscription.channel_id
      // من الأفضل التأكد من أن البيانات القادمة للجدول تحتوي على subscription_type_id
      const type = subscriptionTypes.find(
        (st) => parseInt(st.channel_id, 10) === parseInt(subscription.channel_id, 10)
      );
      if (type) {
        subscription.subscription_type_id = type.id;
      }
    }

    if (!subscription.telegram_id || !subscription.subscription_type_id) {
      showSnackbar(
        "Cannot prepare cancellation: Missing Telegram ID or Subscription Type ID for the selected row.",
        "error"
      );
      console.error("Subscription data for cancellation:", subscription);
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
    if (
      !subscriptionToCancel ||
      !subscriptionToCancel.telegram_id ||
      !subscriptionToCancel.subscription_type_id
    ) {
      showSnackbar("Cancellation failed: Invalid subscription data.", "error");
      handleCloseCancelConfirm();
      return;
    }
    try {
      await cancelSubscriptionAdmin({
        telegram_id: subscriptionToCancel.telegram_id,
        subscription_type_id: subscriptionToCancel.subscription_type_id,
      });
      showSnackbar("Subscription canceled successfully!", "success");
      if (onDataShouldRefresh) onDataShouldRefresh(); // أعد جلب البيانات
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Error canceling subscription";
      showSnackbar(errorMessage, "error");
    }
    handleCloseCancelConfirm();
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
              {" "}
              {/* Tooltip قد يحتاج لعنصر ابن مباشر لا يقبل ref أحيانًا */}
              <IconButton
                size="small"
                onClick={() => onEditExistingClick(row.original)}
                color="info"
                // تعطيل زر التعديل إذا كان الاشتراك غير نشط أو ملغى
                disabled={!row.original.is_active || row.original.source?.includes("canceled")}
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
                // تعطيل زر الإلغاء إذا كان الاشتراك غير نشط بالفعل أو ملغى
                disabled={!row.original.is_active || row.original.source?.includes("canceled")}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </MDBox>
      ),
    };
    const formattedBase = BASE_COLUMNS_CONFIG_SUBS.map((col) => {
      if (col.accessor === "is_active")
        return {
          ...col,
          Cell: ({ value, row: { original } }) => formatSubStatus(value, original.source),
        }; // تمرير المصدر
      if (col.accessor === "expiry_date" || col.accessor === "start_date")
        return { ...col, Cell: ({ value }) => formatSubDate(value) };
      return col;
    });
    return [...formattedBase, actionColumn];
  }, [onEditExistingClick, subscriptionTypes]); // أضفت subscriptionTypes هنا لأنها قد تُستخدم في handleOpenCancelConfirm

  const pageCount = Math.ceil(totalRecords / (queryOptions.pageSize || 20));

  return (
    <>
      <SubscriptionTableToolbar
        onFilterChange={handleCustomFilterChange}
        filters={customFilters}
        subscriptionTypes={(subscriptionTypes || []).map((st) => ({
          value: st.id,
          label: st.name,
        }))}
        onAddNewClick={onAddNewOrRenewClick} // اسم محدث
        availableSources={availableSources} // لا تزال مفيدة إذا كان شريط الأدوات يستخدمها
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
            isSorted={false} // أو true إذا كنت تريد الفرز من الخادم
            entriesPerPage={{
              defaultValue: queryOptions.pageSize,
              options: [10, 20, 50, 100],
            }}
            showTotalEntries={totalRecords > 0}
            noEndBorder
            canSearch={false}
            pagination={{ variant: "gradient", color: "info" }}
            manualPagination
            pageCount={pageCount > 0 ? pageCount : 1}
            page={queryOptions.page - 1} // DataTable قد يتوقع 0-indexed
            onPageChange={(newPage) => setQueryOptions((prev) => ({ ...prev, page: newPage + 1 }))}
            onEntriesPerPageChange={(newPageSize) =>
              setQueryOptions((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
            }
            sx={loading && subscriptions.length > 0 ? { opacity: 0.7 } : {}}
          />
        ) : (
          !loading &&
          subscriptions.length === 0 && (
            <MDBox sx={centeredContentStyle}>
              <MDTypography variant="h6" color="textSecondary">
                No subscriptions found.
              </MDTypography>
            </MDBox>
          )
        )}
      </MDBox>

      <Dialog open={cancelConfirmOpen} onClose={handleCloseCancelConfirm}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the subscription for user{" "}
            <strong>{subscriptionToCancel?.telegram_id}</strong>
            {subscriptionToCancel?.subscription_type_name &&
              ` (Type: ${subscriptionToCancel.subscription_type_name})`}
            ? This action will remove the user from associated channels.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseCancelConfirm} color="secondary" variant="text">
            No
          </MDButton>
          <MDButton onClick={handleConfirmCancel} color="error" variant="gradient" autoFocus>
            Yes, Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SubscriptionsTabContent;
