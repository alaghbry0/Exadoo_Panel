// ./hooks/useSubscriptions.js
import { useState, useEffect, useCallback } from "react";
import { getSubscriptions } from "../services/api";

export function useSubscriptions(showSnackbar, initialSearchTerm = "") {
  // Accept initialSearchTerm
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1,
    pageSize: 20,
  });
  const [customFilters, setCustomFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm); // Manage searchTerm internally if preferred

  const [totalRecords, setTotalRecords] = useState(0);
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0); // For the stat

  // The core fetching logic
  const fetchData = useCallback(
    async (queryOpts, filters, search) => {
      setLoading(true);
      setError(null);
      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          search: search || undefined,
          ...filters,
        };

        Object.keys(paramsToSend).forEach((key) => {
          if (
            paramsToSend[key] === null ||
            paramsToSend[key] === "" ||
            paramsToSend[key] === undefined ||
            paramsToSend[key] === "all"
          ) {
            delete paramsToSend[key];
          }
          if (
            (key === "start_date" ||
              key === "end_date" ||
              key === "startDate" ||
              key === "endDate") &&
            paramsToSend[key]
          ) {
            if (typeof paramsToSend[key].toISOString === "function") {
              // Date object
              paramsToSend[key] = paramsToSend[key].toISOString().split("T")[0];
            } else if (typeof paramsToSend[key] === "object" && "$y" in paramsToSend[key]) {
              // dayjs object
              paramsToSend[key] = paramsToSend[key].format("YYYY-MM-DD");
            }
            // If it's already a string in 'YYYY-MM-DD', do nothing
          }
        });

        const responseData = await getSubscriptions(paramsToSend);

        if (responseData && responseData.data) {
          setSubscriptions(responseData.data || []);
          setTotalRecords(responseData.total || 0);
          setActiveSubscriptionsCount(responseData.active_subscriptions_count || 0); // Get stat
          // Update tableQueryOptions ONLY if server explicitly returns different page/pageSize
          // This is usually not needed if client controls pagination.
          // For now, assume client's tableQueryOptions are the source of truth for the request.
          if (responseData.page && responseData.page !== queryOpts.page) {
            console.warn(
              "Server returned a different page than requested. Client page:",
              queryOpts.page,
              "Server page:",
              responseData.page
            );
            // Decide if you want to force update client state based on server, or log only.
            // setTableQueryOptions(prev => ({ ...prev, page: responseData.page }));
          }
          if (responseData.page_size && responseData.page_size !== queryOpts.pageSize) {
            console.warn(
              "Server returned a different page_size than requested. Client pageSize:",
              queryOpts.pageSize,
              "Server pageSize:",
              responseData.page_size
            );
            // setTableQueryOptions(prev => ({ ...prev, pageSize: responseData.page_size }));
          }
        } else {
          // ... error handling
          setSubscriptions([]);
          setTotalRecords(0);
          setActiveSubscriptionsCount(0);
        }
      } catch (err) {
        // ... error handling
        setSubscriptions([]);
        setTotalRecords(0);
        setActiveSubscriptionsCount(0);
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar] // Only stable external dependencies
  );

  // Called when filters from Toolbar change
  const handleCustomFilterChange = useCallback((newCustomFilters) => {
    setCustomFilters(newCustomFilters);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 })); // Reset page on filter change
  }, []);

  // Called by DataTable onPageChange or onEntriesPerPageChange
  // newQueryOptions will contain { page: newPage } or { pageSize: newPageSize, page: 1 }
  const handleTableQueryOptionsChange = useCallback((newOptions) => {
    setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Expose a function to trigger refetch, e.g., on global search term change or refresh button
  const triggerFetch = useCallback((currentSearchTerm) => {
    setSearchTerm(currentSearchTerm); // Update internal search term
    // Fetch will be triggered by useEffect below if you include searchTerm in its deps
    // OR call fetchData directly:
    // fetchData(tableQueryOptions, customFilters, currentSearchTerm);
  }, []); // Removed tableQueryOptions, customFilters from deps

  // Effect to automatically fetch data when relevant states change
  useEffect(() => {
    // console.log("Hook useEffect: Fetching data due to change in tableQueryOptions, customFilters, or searchTerm");
    fetchData(tableQueryOptions, customFilters, searchTerm);
  }, [fetchData, tableQueryOptions, customFilters, searchTerm]);

  return {
    subscriptions,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions: handleTableQueryOptionsChange, // For DataTable
    totalRecords,
    activeSubscriptionsCount,
    customFilters,
    handleCustomFilterChange, // For Toolbar
    // For external control like global search or refresh:
    // fetchData, // Expose the raw fetchData if needed, but usually not
    setSearchTerm, // Allow parent to set search term, triggering re-fetch via useEffect
    // No need to expose order/orderBy and handleRequestSort if DataTable handles client-side sorting
  };
}
