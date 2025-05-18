// ./hooks/usePendingSubscriptions.js
import { useState, useEffect, useCallback } from "react";
import {
  getPendingSubscriptions, // API call to fetch paginated pending subscriptions
  getPendingSubscriptionsStats,
  handleSinglePendingSubscriptionAction,
  handleBulkPendingSubscriptionsAction,
} from "../services/api"; // Assuming this is your API service file

export function usePendingSubscriptions(
  showSnackbar,
  refreshPrimarySubscriptions, // Callback to refresh subscriptions on main tab
  refreshLegacyTabCount // Callback to refresh legacy count
  // refreshActiveSubscriptionsCount // Not directly used here, but passed from parent
) {
  const [pendingData, setPendingData] = useState([]); // Renamed from pendingSubscriptions for clarity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1, // 1-indexed for API
    pageSize: 20,
  });

  const [statusFilter, setStatusFilter] = useState("pending"); // 'pending', 'complete', 'all'
  const [searchTerm, setSearchTerm] = useState(""); // Internal search term state

  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState({ pending: 0, complete: 0, total_all: 0 }); // Renamed from pendingStats

  const [bulkProcessingLoading, setBulkProcessingLoading] = useState(false);
  const [bulkProcessResult, setBulkProcessResult] = useState(null);
  const [bulkResultModalOpen, setBulkResultModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    // No changes needed here if it works as intended
    try {
      const statsData = await getPendingSubscriptionsStats();
      setStats(statsData || { pending: 0, complete: 0, total_all: 0 });
    } catch (err) {
      console.error("Error fetching pending stats:", err);
      setStats({ pending: 0, complete: 0, total_all: 0 }); // Reset on error
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

        // Clean params (remove undefined/null/empty string)
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
          // API now returns pending_count_for_filter, which can be used if needed,
          // but totalRecords is the primary count for pagination.
          // Stats are fetched separately.
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

  // Effect to fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Effect to fetch data when relevant filters or query options change
  useEffect(() => {
    // console.log("Pending Hook: Fetching data due to change in queryOpts, statusFilter, or searchTerm");
    fetchData(tableQueryOptions, statusFilter, searchTerm);
  }, [fetchData, tableQueryOptions, statusFilter, searchTerm]);

  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const handleTableQueryOptionsChange = useCallback((newOptions) => {
    // newOptions could be { page: newPage } or { pageSize: newPageSize, page: 1 }
    setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  const handleMarkComplete = useCallback(
    async (id) => {
      // Removed currentGlobalSearchTerm, will use internal searchTerm
      // setLoading(true); // Consider a specific loading state for single action
      try {
        const result = await handleSinglePendingSubscriptionAction(id);
        if (result.success) {
          if (showSnackbar) showSnackbar(result.message || "Subscription processed!", "success");
          await fetchData(tableQueryOptions, statusFilter, searchTerm); // Refetch current view
          await fetchStats();
          if (refreshPrimarySubscriptions) await refreshPrimarySubscriptions(searchTerm); // Pass current search
          if (refreshLegacyTabCount) await refreshLegacyTabCount(undefined, searchTerm);
        } else {
          if (showSnackbar) showSnackbar(result.error || "Failed to process.", "error");
        }
      } catch (err) {
        // ... error handling ...
      } finally {
        // setLoading(false);
      }
    },
    [
      showSnackbar,
      fetchData,
      tableQueryOptions,
      statusFilter,
      searchTerm,
      fetchStats,
      refreshPrimarySubscriptions,
      refreshLegacyTabCount,
    ]
  );

  const handleBulkProcess = useCallback(async () => {
    // Removed currentGlobalSearchTerm, bulk usually processes all pending
    setBulkProcessingLoading(true);
    setBulkProcessResult(null);
    try {
      // Bulk action might not need search term if it processes all 'pending' regardless of current search view
      const result = await handleBulkPendingSubscriptionsAction({
        /* criteria if any */
      });
      setBulkProcessResult(result);
      setBulkResultModalOpen(true);
      if (showSnackbar) {
        /* ... snackbar logic ... */
      }
      await fetchData(tableQueryOptions, statusFilter, searchTerm); // Refetch
      await fetchStats();
      if (refreshPrimarySubscriptions) await refreshPrimarySubscriptions(searchTerm);
      if (refreshLegacyTabCount) await refreshLegacyTabCount(undefined, searchTerm);
    } catch (err) {
      // ... error handling ...
    } finally {
      setBulkProcessingLoading(false);
    }
  }, [
    showSnackbar,
    fetchData,
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
    setTableQueryOptions: handleTableQueryOptionsChange,
    totalRecords,
    stats, // Renamed from pendingStats
    statusFilter, // Renamed from currentPendingFilter
    handleStatusFilterChange,
    setSearchTerm, // To be called from parent when globalSearchTerm changes for this tab
    fetchData, // Expose if direct refresh is needed, though useEffect should handle most cases
    fetchStats, // Expose if manual stat refresh is needed
    handleMarkComplete,
    bulkProcessingLoading,
    bulkProcessResult,
    bulkResultModalOpen,
    handleBulkProcess: handleBulkProcess, // Renamed from handleBulkProcessPending
    handleCloseBulkResultModal,
  };
}
