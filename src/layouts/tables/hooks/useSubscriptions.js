import { useState, useEffect, useCallback } from "react";
import { getSubscriptions } from "../services/api";

export function useSubscriptions(showSnackbar) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [filters, setFilters] = useState({}); // هذه هي حالة الفلاتر التي ستُحدّث
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");
  const [hasMoreData, setHasMoreData] = useState(true);

  const fetchData = useCallback(
    async (pageToFetch, currentSearchTerm = "", isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams = {
          page: pageToFetch,
          page_size: rowsPerPage,
          search: currentSearchTerm || undefined,
          ordering: `${order === "desc" ? "-" : ""}${orderBy}`,
          ...filters, // دمج الفلاتر من الحالة
        };

        const finalParams = { ...queryParams };
        Object.keys(finalParams).forEach((key) => {
          if (
            finalParams[key] === null ||
            finalParams[key] === "" ||
            finalParams[key] === undefined
          ) {
            delete finalParams[key];
          }
          if (
            (key === "startDate" || key === "endDate") &&
            finalParams[key] &&
            typeof finalParams[key].toISOString === "function"
          ) {
            finalParams[key] = finalParams[key].toISOString().split("T")[0];
          }
        });

        const responseData = await getSubscriptions(finalParams);

        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.hasOwnProperty("data") &&
          responseData.hasOwnProperty("total_count")
        ) {
          const newSubscriptions = responseData.data || [];
          const newTotalCount = responseData.total_count || 0;

          setSubscriptions((prevSubs) => {
            if (!isLoadMore) return newSubscriptions;
            const existingIds = new Set(prevSubs.map((s) => s.id));
            const uniqueNewData = newSubscriptions.filter((s) => !existingIds.has(s.id));
            return [...prevSubs, ...uniqueNewData];
          });

          setTotalSubscriptions(newTotalCount);
          setCurrentPage(pageToFetch);

          const currentDataLength = isLoadMore
            ? subscriptions.length +
              newSubscriptions.filter((s) => !subscriptions.find((ps) => ps.id === s.id)).length
            : newSubscriptions.length;
          setHasMoreData(currentDataLength < newTotalCount);
        } else {
          console.error("[fetchData] Unexpected API response structure:", responseData);
          setError("Received unexpected data format from server.");
          if (showSnackbar) showSnackbar("Error: Could not parse subscription data.", "error");
          if (!isLoadMore) {
            setSubscriptions([]);
            setTotalSubscriptions(0);
          }
          setHasMoreData(false);
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        const message =
          err.response?.data?.error || err.message || "Could not fetch subscriptions.";
        setError(`Failed to load subscriptions: ${message}`);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
        if (!isLoadMore) {
          setSubscriptions([]);
          setTotalSubscriptions(0);
        }
        setHasMoreData(false);
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [rowsPerPage, filters, order, orderBy, showSnackbar, subscriptions.length]
  );

  const fetchInitialData = useCallback(
    async (currentSearchTerm = "") => {
      await fetchData(1, currentSearchTerm, false);
    },
    [fetchData]
  );

  const handleFilterChange = useCallback(
    (newFilterValues, currentGlobalSearchTerm) => {
      setFilters(newFilterValues); // تحديث حالة الفلاتر هنا
      fetchInitialData(currentGlobalSearchTerm); // ثم جلب البيانات بالفلاتر الجديدة
    },
    [fetchInitialData] // لا تعتمد على setFilters مباشرة هنا لتجنب re-render loop، fetchInitialData تعتمد على filters
  );

  const handleRequestSort = useCallback(
    (event, property, currentGlobalSearchTerm) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
      fetchInitialData(currentGlobalSearchTerm);
    },
    [order, orderBy, fetchInitialData]
  );

  const handleChangeRowsPerPage = useCallback(
    (event, currentGlobalSearchTerm) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      fetchInitialData(currentGlobalSearchTerm);
    },
    [fetchInitialData]
  );

  const handleLoadMore = useCallback(
    (currentGlobalSearchTerm) => {
      if (!loadingMore && hasMoreData) {
        fetchData(currentPage + 1, currentGlobalSearchTerm, true);
      }
    },
    [loadingMore, hasMoreData, currentPage, fetchData]
  );

  return {
    subscriptions,
    loading,
    loadingMore,
    error,
    setError,
    rowsPerPage,
    // setRowsPerPage, // لا يتم تصديره حاليًا ولكن يمكن إذا احتجت للتحكم به من الخارج
    totalSubscriptions,
    order,
    orderBy,
    filters, // تصدير الفلاتر الحالية ليتم تمريرها للمكونات الفرعية
    // setFilters, // لا حاجة لتصدير setFilters مباشرة إذا كان التحديث يتم عبر handleFilterChange
    fetchInitialData,
    handleFilterChange, // هذه الدالة هي التي يجب استخدامها لتحديث الفلاتر
    handleRequestSort,
    handleChangeRowsPerPage,
    handleLoadMore,
    hasMoreData,
  };
}
