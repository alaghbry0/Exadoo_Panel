// ./hooks/useSubscriptions.js
import { useState, useEffect, useCallback } from "react";
import { getSubscriptions } from "../services/api";

export function useSubscriptions(showSnackbar, initialSearchTerm = "") {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    // مُحدِّث الحالة المباشر
    page: 1,
    pageSize: 20,
  });
  const [customFilters, setCustomFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const [totalRecords, setTotalRecords] = useState(0);
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0);

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
              paramsToSend[key] = paramsToSend[key].toISOString().split("T")[0];
            } else if (typeof paramsToSend[key] === "object" && "$y" in paramsToSend[key]) {
              paramsToSend[key] = paramsToSend[key].format("YYYY-MM-DD");
            }
          }
        });

        const responseData = await getSubscriptions(paramsToSend);

        if (responseData && responseData.data) {
          setSubscriptions(responseData.data || []);
          setTotalRecords(responseData.total || 0);
          setActiveSubscriptionsCount(responseData.active_subscriptions_count || 0);
          // لا حاجة لتحديث tableQueryOptions هنا بناءً على استجابة الخادم إلا إذا كان ضروريًا بشكل صريح
        } else {
          setSubscriptions([]);
          setTotalRecords(0);
          setActiveSubscriptionsCount(0);
          // يمكنك عرض خطأ هنا إذا لم تكن هناك بيانات متوقعة
          // showSnackbar("Failed to fetch subscriptions or no data returned.", "error");
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError(err.message || "An error occurred while fetching subscriptions.");
        showSnackbar(err.message || "Failed to fetch subscriptions.", "error");
        setSubscriptions([]);
        setTotalRecords(0);
        setActiveSubscriptionsCount(0);
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar] // تم إزالة fetchData من الاعتماديات لتجنب الحلقات
  );

  const handleCustomFilterChange = useCallback((newCustomFilters) => {
    setCustomFilters(newCustomFilters);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    fetchData(tableQueryOptions, customFilters, searchTerm);
  }, [fetchData, tableQueryOptions, customFilters, searchTerm]);

  return {
    subscriptions,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions, // <-- التغيير الرئيسي: أرجع مُحدِّث الحالة المباشر
    totalRecords,
    activeSubscriptionsCount,
    customFilters,
    handleCustomFilterChange,
    setSearchTerm,
    fetchData,
  };
}
