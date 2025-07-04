// src/layouts/tables/hooks/useSubscriptions.js

import { useState, useEffect, useCallback } from "react";
import { getSubscriptions } from "../../../services/api";

export function useSubscriptions(showSnackbar, initialSearchTerm = "") {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 1,
  });

  const [statistics, setStatistics] = useState({
    total_records: 0,
    active_count: 0,
    expired_count: 0,
    expiring_soon_count: 0,
    inactive_count: 0,
  });

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1,
    pageSize: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [customFilters, setCustomFilters] = useState({});
  
  // --- التعديل الأول: استخدام useState مع useEffect لتحديث searchTerm ---
  // هذا يعطينا تحكماً أفضل في تحديث حالة البحث الداخلية
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, [initialSearchTerm]);

  // --- التعديل الثاني: تعديل دالة fetchData لجعل المعاملات اختيارية ---
  const fetchData = useCallback(
    async (
      queryOpts = tableQueryOptions,
      filters = customFilters,
      search = searchTerm
    ) => {
      setLoading(true);
      setError(null);

      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          sort_by: queryOpts.sort_by || "created_at",
          sort_order: queryOpts.sort_order || "desc",
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

          if ((key === "start_date" || key === "end_date") && paramsToSend[key]) {
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
          setPagination(
            responseData.pagination || { page: 1, page_size: 20, total: 0, total_pages: 1 }
          );
          setStatistics(responseData.statistics || {});
        } else {
          setSubscriptions([]);
          setPagination({ page: 1, page_size: 20, total: 0, total_pages: 1 });
          setStatistics({});
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        const errorMessage =
          err.response?.data?.error || err.message || "Failed to fetch subscriptions.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        setSubscriptions([]);
        setPagination({ page: 1, page_size: 20, total: 0, total_pages: 1 });
        setStatistics({});
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, tableQueryOptions, customFilters, searchTerm] // إضافة الاعتماديات لضمان أن القيم الافتراضية محدثة
  );

  const handleCustomFilterChange = useCallback((newCustomFilters) => {
    setCustomFilters(newCustomFilters);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  // هذا الـ useEffect هو المحرك الرئيسي لجلب البيانات
  // يتم تشغيله عند تغيير أي من خيارات الجدول أو الفلاتر أو مصطلح البحث
  useEffect(() => {
    fetchData(tableQueryOptions, customFilters, searchTerm);
  }, [fetchData, tableQueryOptions, customFilters, searchTerm]);

  return {
    subscriptions,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions,
    pagination,
    totalRecords: pagination.total,
    statistics,
    customFilters,
    handleCustomFilterChange,
    setSearchTerm,
    fetchData,
  };
}
