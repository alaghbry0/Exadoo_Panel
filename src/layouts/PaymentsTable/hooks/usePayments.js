// src/layouts/payments/hooks/usePayments.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { getPayments } from "services/api";
import dayjs from "dayjs";

const usePayments = (showSnackbar, globalSearchTerm) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [statistics, setStatistics] = useState({});
  // ✅ التهيئة الأولية من globalSearchTerm صحيحة
  const [searchTerm, setSearchTerm] = useState(globalSearchTerm);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1,
    pageSize: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [customFilters, setCustomFilters] = useState({
    status: "",
    subscription_type_id: "",
    subscription_plan_id: "",
    payment_method: "",
    start_date: null,
    end_date: null,
  });

  const queryParams = useMemo(() => {
    const params = {
      ...tableQueryOptions,
      search: searchTerm,
    };
    // تحويل التواريخ إلى الصيغة المطلوبة
    if (customFilters.start_date) {
      params.start_date = dayjs(customFilters.start_date).format("YYYY-MM-DD");
    }
    if (customFilters.end_date) {
      params.end_date = dayjs(customFilters.end_date).format("YYYY-MM-DD");
    }
    // إضافة الفلاتر المخصصة الأخرى إذا كانت موجودة
    for (const [key, value] of Object.entries(customFilters)) {
      if (value && !["start_date", "end_date"].includes(key)) {
        params[key] = value;
      }
    }
    return params;
  }, [tableQueryOptions, searchTerm, customFilters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPayments(queryParams);
      setPayments(response.data || []);
      setPagination(response.pagination || {});
      setStatistics(response.statistics || {});
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch payments.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams, showSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ تحديث مصطلح البحث الداخلي عند تغير المصطلح العام القادم من URL
  useEffect(() => {
    setSearchTerm(globalSearchTerm);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, [globalSearchTerm]);

  const handleCustomFilterChange = useCallback((newFilters) => {
    setCustomFilters(newFilters);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    payments,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions,
    pagination,
    statistics,
    customFilters,
    handleCustomFilterChange,
    fetchData,
    searchTerm, // 💡 تم تصدير searchTerm
    setSearchTerm, // 💡 تم تصدير setSearchTerm
  };
};

export default usePayments;
