// ./hooks/useLegacySubscriptions.js
import { useState, useEffect, useCallback } from "react";
import { getLegacySubscriptions } from "../services/api"; // Your API function

export function useLegacySubscriptions(showSnackbar, initialSearchTerm = "") {
  const [legacyData, setLegacyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    // مُحدِّث الحالة المباشر
    page: 1,
    pageSize: 20,
  });

  const [processedFilter, setProcessedFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const [totalRecords, setTotalRecords] = useState(0);
  const [processedLegacyCount, setProcessedLegacyCount] = useState(0);

  const fetchData = useCallback(
    async (queryOpts, currentProcessedFilter, currentSearch) => {
      setLoading(true);
      setError(null);
      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          search: currentSearch || undefined,
          processed: currentProcessedFilter === null ? undefined : String(currentProcessedFilter),
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
    [showSnackbar]
  );

  useEffect(() => {
    fetchData(tableQueryOptions, processedFilter, searchTerm);
  }, [fetchData, tableQueryOptions, processedFilter, searchTerm]);

  const handleProcessedFilterChange = useCallback((newFilterValue) => {
    setProcessedFilter(newFilterValue);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  // الدالة handleTableQueryOptionsChange لم تعد ضرورية هنا
  // const handleTableQueryOptionsChange = useCallback((newOptions) => {
  //   setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  // }, []);

  return {
    legacyData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions, // <-- التغيير: أرجع مُحدِّث الحالة المباشر
    totalRecords,
    processedLegacyCount,
    processedFilter,
    handleProcessedFilterChange,
    setSearchTerm,
    fetchData, // قد تحتاجها للإنعاش اليدوي من المكون الأب
  };
}
