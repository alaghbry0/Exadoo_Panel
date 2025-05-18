// ./hooks/useLegacySubscriptions.js
import { useState, useEffect, useCallback } from "react";
import { getLegacySubscriptions } from "../services/api"; // Your API function

export function useLegacySubscriptions(showSnackbar, initialSearchTerm = "") {
  const [legacyData, setLegacyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1, // 1-indexed for API
    pageSize: 20, // Default page size
  });

  // Filter for 'processed' status: null (all), true (processed), false (not processed)
  const [processedFilter, setProcessedFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const [totalRecords, setTotalRecords] = useState(0);
  const [processedLegacyCount, setProcessedLegacyCount] = useState(0); // Stat from API

  // Client-side sorting state (if you want DataTable to handle it)
  // Or remove if server handles sorting and DataTable's isSorted is false
  // const [order, setOrder] = useState("desc");
  // const [orderBy, setOrderBy] = useState("expiry_date");

  const fetchData = useCallback(
    async (queryOpts, currentProcessedFilter, currentSearch) => {
      setLoading(true);
      setError(null);
      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          search: currentSearch || undefined,
          processed: currentProcessedFilter === null ? undefined : String(currentProcessedFilter), // API expects "true", "false", or undefined/all
          // sort_field: orderBy, // If server-side sorting is kept
          // sort_order: order,    // If server-side sorting is kept
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

        const responseData = await getLegacySubscriptions(paramsToSend);

        if (responseData && responseData.data) {
          setLegacyData(responseData.data || []);
          setTotalRecords(responseData.total || 0);
          setProcessedLegacyCount(responseData.processed_legacy_count || 0);
        } else {
          console.error("[fetchData legacy] Unexpected API response:", responseData);
          if (showSnackbar)
            showSnackbar("Error: Could not parse legacy subscription data.", "error");
          setLegacyData([]);
          setTotalRecords(0);
          setProcessedLegacyCount(0);
        }
      } catch (err) {
        console.error("Error fetching legacy subscriptions:", err);
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          "Could not fetch legacy subscriptions.";
        setError(message);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
        setLegacyData([]);
        setTotalRecords(0);
        setProcessedLegacyCount(0);
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar /*, order, orderBy (if server-side sort)*/]
  );

  // Effect to fetch data when relevant states change
  useEffect(() => {
    fetchData(tableQueryOptions, processedFilter, searchTerm);
  }, [fetchData, tableQueryOptions, processedFilter, searchTerm]);

  const handleProcessedFilterChange = useCallback((newFilterValue) => {
    setProcessedFilter(newFilterValue);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 })); // Reset page
  }, []);

  const handleTableQueryOptionsChange = useCallback((newOptions) => {
    setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Client-side sort handler (if DataTable's isSorted is true)
  // Or modify to send sort params to server if isSorted is false and server handles it
  // const handleSortRequest = useCallback((event, property) => {
  //   const isAsc = orderBy === property && order === "asc";
  //   setOrder(isAsc ? "desc" : "asc");
  //   setOrderBy(property);
  //   // If server-side sorting:
  //   // setTableQueryOptions(prev => ({ ...prev, page: 1 })); // And fetchData will use new order/orderBy
  // }, [order, orderBy]);

  return {
    legacyData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions: handleTableQueryOptionsChange,
    totalRecords,
    processedLegacyCount, // Stat for display
    processedFilter, // Current 'processed' filter
    handleProcessedFilterChange,
    setSearchTerm, // To update search from parent
    // order, // Expose if using client-side sort controlled by DataTable
    // orderBy,
    // handleSortRequest, // Expose if using client-side sort controlled by DataTable
    // Expose a direct fetch for refresh button if needed, though useEffect handles most cases
    fetchData,
  };
}
