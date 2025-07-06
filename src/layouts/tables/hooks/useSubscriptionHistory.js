// src/layouts/tables/hooks/useSubscriptionHistory.js

import { useState, useEffect, useCallback } from "react";
// تأكد من أن المسار صحيح
import { getSubscriptionHistory } from "../../../services/api";

// 💡 تأكد من أن كلمة export موجودة وأن اسم الدالة مطابق تمامًا
export function useSubscriptionHistory(showSnackbar, initialSearchTerm = "") {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- إضافة: حالة للـ pagination مثل useSubscriptions ---
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1,
    pageSize: 20,
    // ملاحظة: سجل الاشتراكات يتم فرزه دائمًا حسب renewal_date desc في الخادم
  });

  const [customFilters, setCustomFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // ✅ =================== التعديل المضاف هنا =================== ✅
  // هذا الـ useEffect يقوم بمزامنة حالة البحث الداخلية مع التغييرات القادمة من المكون الأب
  useEffect(() => {
    // تحديث حالة البحث الداخلية في كل مرة تتغير فيها خاصية initialSearchTerm
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]); // هذا الـ Effect سيعمل في كل مرة يتغير فيها initialSearchTerm
  // ✅ ======================================================== ✅

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // الآن سيتم استخدام قيمة searchTerm المحدثة دائماً
      const paramsToSend = {
        page: tableQueryOptions.page,
        page_size: tableQueryOptions.pageSize,
        search: searchTerm || undefined, // هذه القيمة ستكون الآن متزامنة مع الأب
        ...customFilters,
      };

      // تنظيف المعاملات الفارغة
      Object.keys(paramsToSend).forEach((key) => {
        if (
          paramsToSend[key] === null ||
          paramsToSend[key] === "" ||
          paramsToSend[key] === undefined ||
          paramsToSend[key] === "all"
        ) {
          delete paramsToSend[key];
        } else if ((key === "start_date" || key === "end_date") && paramsToSend[key]) {
          if (typeof paramsToSend[key].format === "function") {
            paramsToSend[key] = paramsToSend[key].format("YYYY-MM-DD");
          }
        }
      });

      const responseData = await getSubscriptionHistory(paramsToSend);

      if (responseData && responseData.data) {
        setHistoryData(responseData.data || []);
        // --- تعديل: تخزين كائن الـ pagination بالكامل ---
        setPagination(responseData.pagination || { total: 0, total_pages: 0 });
      } else {
        setHistoryData([]);
        setPagination({ total: 0, total_pages: 0 });
      }
    } catch (err) {
      console.error("Error fetching subscription history:", err);
      const errorMessage = err.message || "An error occurred fetching history.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
      setHistoryData([]);
      setPagination({ total: 0, total_pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [tableQueryOptions, customFilters, searchTerm, showSnackbar]); // searchTerm موجود بالفعل هنا، وهذا ممتاز

  const handleCustomFilterChange = useCallback((newCustomFilters) => {
    setCustomFilters(newCustomFilters);
    setTableQueryOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ =================== التعديل المضاف هنا =================== ✅
  // تم حذف setSearchTerm من هنا لأن المكون الأب هو من يتحكم به الآن
  // ✅ ======================================================== ✅
  return {
    historyData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions,
    pagination,
    customFilters,
    handleCustomFilterChange,
    fetchData,
  };
}
