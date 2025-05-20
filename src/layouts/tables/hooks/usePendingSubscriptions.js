// ./hooks/usePendingSubscriptions.js
import { useState, useEffect, useCallback } from "react";
import {
  getPendingSubscriptions,
  getPendingSubscriptionsStats,
  handleSinglePendingSubscriptionAction,
  handleBulkPendingSubscriptionsAction,
} from "../services/api";

export function usePendingSubscriptions(
  showSnackbar,
  refreshPrimarySubscriptions,
  refreshLegacyTabCount
) {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    // مُحدِّث الحالة المباشر
    page: 1,
    pageSize: 20,
  });

  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState({ pending: 0, complete: 0, total_all: 0 });

  const [bulkProcessingLoading, setBulkProcessingLoading] = useState(false);
  const [bulkProcessResult, setBulkProcessResult] = useState(null);
  const [bulkResultModalOpen, setBulkResultModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getPendingSubscriptionsStats();
      setStats(statsData || { pending: 0, complete: 0, total_all: 0 });
    } catch (err) {
      console.error("Error fetching pending stats:", err);
      setStats({ pending: 0, complete: 0, total_all: 0 });
    }
  }, []);

  const fetchData = useCallback(
    async (queryOpts, currentStatusFilter, currentSearchTerm) => {
      setLoading(true);
      setError(null);
      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          status: currentStatusFilter === "all" ? undefined : currentStatusFilter,
          search: currentSearchTerm || undefined,
        };

        Object.keys(paramsToSend).forEach((key) => {
          if (
            paramsToSend[key] === undefined ||
            paramsToSend[key] === null ||
            paramsToSend[key] === ""
          ) {
            delete paramsToSend[key];
          }
        });

        const responseData = await getPendingSubscriptions(paramsToSend);

        if (responseData && responseData.data) {
          setPendingData(responseData.data || []);
          setTotalRecords(responseData.total || 0);
        } else {
          console.error("[fetchData pending] Unexpected API response:", responseData);
          if (showSnackbar)
            showSnackbar("Error: Could not parse pending subscription data.", "error");
          setPendingData([]);
          setTotalRecords(0);
        }
      } catch (err) {
        console.error("Error fetching pending subscriptions:", err);
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          "Could not fetch pending subscriptions.";
        setError(message);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
        setPendingData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData(tableQueryOptions, statusFilter, searchTerm);
  }, [fetchData, tableQueryOptions, statusFilter, searchTerm]);

  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  // الدالة handleTableQueryOptionsChange لم تعد ضرورية هنا
  // const handleTableQueryOptionsChange = useCallback((newOptions) => {
  //   setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  // }, []);

  const handleMarkComplete = useCallback(
    async (id) => {
      try {
        const result = await handleSinglePendingSubscriptionAction(id);
        if (result.success) {
          if (showSnackbar) showSnackbar(result.message || "Subscription processed!", "success");
          // fetchData سيتم استدعاؤه تلقائيًا بواسطة useEffect بسبب تغيير tableQueryOptions
          // أو إذا لم يتغير، يمكن استدعاؤه يدويًا إذا كنت تريد ضمان التحديث الفوري
          await fetchData(tableQueryOptions, statusFilter, searchTerm); // ضمان التحديث
          await fetchStats();
          if (refreshPrimarySubscriptions) await refreshPrimarySubscriptions(searchTerm);
          if (refreshLegacyTabCount) await refreshLegacyTabCount(undefined, searchTerm);
        } else {
          if (showSnackbar) showSnackbar(result.error || "Failed to process.", "error");
        }
      } catch (err) {
        console.error("Error marking pending subscription as complete:", err);
        if (showSnackbar) showSnackbar(err.message || "Error processing subscription.", "error");
      }
    },
    [
      showSnackbar,
      fetchData, // أضف fetchData هنا إذا كنت ستستدعيه مباشرة
      tableQueryOptions,
      statusFilter,
      searchTerm,
      fetchStats,
      refreshPrimarySubscriptions,
      refreshLegacyTabCount,
    ]
  );

  const handleBulkProcess = useCallback(async () => {
    setBulkProcessingLoading(true);
    setBulkProcessResult(null);
    try {
      const result = await handleBulkPendingSubscriptionsAction({});
      setBulkProcessResult(result);
      setBulkResultModalOpen(true);
      if (showSnackbar) {
        if (result.error) {
          showSnackbar(result.message || "Bulk processing encountered errors.", "warning");
        } else {
          showSnackbar(result.message || "Bulk processing initiated.", "info");
        }
      }
      // استدعاء fetchData لضمان تحديث البيانات المعروضة
      await fetchData(tableQueryOptions, statusFilter, searchTerm);
      await fetchStats();
      if (refreshPrimarySubscriptions) await refreshPrimarySubscriptions(searchTerm);
      if (refreshLegacyTabCount) await refreshLegacyTabCount(undefined, searchTerm);
    } catch (err) {
      console.error("Error during bulk processing:", err);
      const errorMessage = err.message || "An error occurred during bulk processing.";
      setBulkProcessResult({ error: true, message: errorMessage }); // عرض خطأ عام
      setBulkResultModalOpen(true);
      if (showSnackbar) showSnackbar(errorMessage, "error");
    } finally {
      setBulkProcessingLoading(false);
    }
  }, [
    showSnackbar,
    fetchData, // أضف fetchData هنا
    tableQueryOptions,
    statusFilter,
    searchTerm,
    fetchStats,
    refreshPrimarySubscriptions,
    refreshLegacyTabCount,
  ]);

  const handleCloseBulkResultModal = useCallback(() => {
    setBulkResultModalOpen(false);
  }, []);

  return {
    pendingData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions, // <-- التغيير: أرجع مُحدِّث الحالة المباشر
    totalRecords,
    stats,
    statusFilter,
    handleStatusFilterChange,
    setSearchTerm,
    fetchData, // قد تحتاجها للإنعاش اليدوي
    fetchStats,
    handleMarkComplete,
    bulkProcessingLoading,
    bulkProcessResult,
    bulkResultModalOpen,
    handleBulkProcess,
    handleCloseBulkResultModal,
  };
}
