// src/layouts/tables/hooks/useLegacySubscriptions.js
import { useState, useEffect, useCallback } from "react";
import { getLegacySubscriptions } from "../services/api";

const ROWS_PER_PAGE_FOR_LOAD_MORE = 20;

export function useLegacySubscriptions(showSnackbar) {
  const [legacyInitialData, setLegacyInitialData] = useState([]);
  const [legacyTotalCount, setLegacyTotalCount] = useState(0);
  const [legacyLoadingInitial, setLegacyLoadingInitial] = useState(false);
  const [activeLegacyFilter, setActiveLegacyFilter] = useState(null); // null | true | false
  const [legacyOrder, setLegacyOrder] = useState("desc");
  const [legacyOrderBy, setLegacyOrderBy] = useState("expiry_date");
  const [legacyCountForTabDisplay, setLegacyCountForTabDisplay] = useState(0);
  // لا حاجة لـ legacySearchTerm هنا

  // دالة لجلب العدد الإجمالي للـ Legacy Subscriptions لعرضه في التبويب
  const fetchLegacyCountForTabsManager = useCallback(
    async (filterOverride, currentSearchTerm = "") => {
      const currentFilterValue = filterOverride !== undefined ? filterOverride : activeLegacyFilter;
      try {
        const queryParams = {
          page: 1,
          page_size: 1,
          search: currentSearchTerm || undefined, // استخدام البحث الممرر
        };
        if (currentFilterValue !== null) queryParams.processed = currentFilterValue;

        const legacyResponse = await getLegacySubscriptions(queryParams);
        let count = 0;
        if (Array.isArray(legacyResponse)) {
          count =
            legacyResponse.length > 0 && legacyResponse[0].total_count !== undefined
              ? legacyResponse[0].total_count
              : 0;
        } else if (legacyResponse && legacyResponse.total_count !== undefined) {
          count = legacyResponse.total_count;
        }
        setLegacyCountForTabDisplay(count);
        // إذا لم يتم تطبيق فلتر (أي يعرض الكل) ولم يكن هناك بحث، نستخدم هذا العدد أيضًا كـ totalCount للـ "Load More"
        // هذا السلوك قد يحتاج مراجعة، هل totalCount يجب أن يعكس دائمًا نتائج البحث/الفلترة؟
        if (currentFilterValue === null && !currentSearchTerm) {
          setLegacyTotalCount(count);
        }
      } catch (err) {
        console.error("Error fetching total legacy count for tab display:", err);
      }
    },
    [activeLegacyFilter] // يعتمد على الفلتر النشط
  );

  // دالة جلب البيانات الأولية (عند تغيير البحث، الفلتر، الفرز)
  const fetchInitialLegacySubscriptions = useCallback(
    async (currentSearchTerm = "") => {
      setLegacyLoadingInitial(true);
      try {
        const queryParams = {
          page: 1,
          page_size: ROWS_PER_PAGE_FOR_LOAD_MORE,
          ordering: `${legacyOrder === "desc" ? "-" : ""}${legacyOrderBy}`,
          search: currentSearchTerm || undefined, // استخدام البحث الممرر
        };
        if (activeLegacyFilter !== null) queryParams.processed = activeLegacyFilter;

        const responseData = await getLegacySubscriptions(queryParams);
        let initialData = [];
        let totalCountFromServer = 0;

        if (Array.isArray(responseData)) {
          // إذا كان الـ API يرجع مصفوفة مباشرة
          initialData = responseData;
          totalCountFromServer =
            responseData.length > 0 && responseData[0].total_count !== undefined
              ? responseData[0].total_count
              : responseData.length; // Fallback إذا لم يكن total_count موجودًا
        } else if (responseData && responseData.data && responseData.total_count !== undefined) {
          // إذا كان الـ API يرجع كائنًا يحتوي على data و total_count
          initialData = responseData.data || [];
          totalCountFromServer = responseData.total_count || 0;
        } else {
          console.warn(
            "Unexpected response structure from getLegacySubscriptions for initial fetch:",
            responseData
          );
        }
        setLegacyInitialData(initialData);
        setLegacyTotalCount(totalCountFromServer); // الإجمالي بناءً على البحث والفلترة الحالية

        // تحديث العدد المعروض في التبويب ليعكس الفلترة الحالية والبحث
        // fetchLegacyCountForTabsManager(activeLegacyFilter, currentSearchTerm); // يمكن استدعاؤها أو الاعتماد على totalCountFromServer
        setLegacyCountForTabDisplay(totalCountFromServer); // الأبسط هو استخدام الإجمالي الذي تم جلبه للتو
      } catch (err) {
        console.error("Error fetching initial legacy subscriptions:", err);
        if (showSnackbar)
          showSnackbar(
            `Error: ${err.message || "Could not fetch initial legacy subscriptions."}`,
            "error"
          );
        setLegacyInitialData([]);
        setLegacyTotalCount(0);
      } finally {
        setLegacyLoadingInitial(false);
      }
    },
    [
      activeLegacyFilter,
      legacyOrder,
      legacyOrderBy,
      showSnackbar /*fetchLegacyCountForTabsManager أزيلت من هنا لتجنب الاستدعاء المزدوج*/,
    ]
  );

  // جلب العدد الكلي عند التحميل الأول (بدون فلترة أو بحث)
  // useEffect(() => {
  //   fetchLegacyCountForTabsManager(null, ""); // جلب العدد الكلي في البداية
  // }, [fetchLegacyCountForTabsManager]);
  //  سيتم التحكم بهذا من Tables.jsx

  // معالج لجلب المزيد من البيانات
  const handleLoadMoreLegacy = useCallback(
    async (pageToFetch, currentSearchTerm = "") => {
      try {
        const queryParams = {
          page: pageToFetch,
          page_size: ROWS_PER_PAGE_FOR_LOAD_MORE,
          ordering: `${legacyOrder === "desc" ? "-" : ""}${legacyOrderBy}`,
          search: currentSearchTerm || undefined, // استخدام البحث الممرر
        };
        if (activeLegacyFilter !== null) queryParams.processed = activeLegacyFilter;
        const responseData = await getLegacySubscriptions(queryParams);
        return Array.isArray(responseData) ? responseData : responseData?.data || [];
      } catch (error) {
        console.error("Error fetching more legacy subscriptions:", error);
        if (showSnackbar)
          showSnackbar(
            `Error: ${error.message || "Could not load more legacy subscriptions."}`,
            "error"
          );
        return [];
      }
    },
    [activeLegacyFilter, legacyOrder, legacyOrderBy, showSnackbar]
  );

  // معالج لتغيير فلتر "processed"
  const handleLegacyFilterChange = useCallback(
    (newFilterValue, currentGlobalSearchTerm) => {
      setActiveLegacyFilter(newFilterValue);
      fetchInitialLegacySubscriptions(currentGlobalSearchTerm);
    },
    [fetchInitialLegacySubscriptions]
  );

  // معالج لتغيير الترتيب
  const handleLegacyRequestSort = useCallback(
    (event, property, currentGlobalSearchTerm) => {
      const isAsc = legacyOrderBy === property && legacyOrder === "asc";
      setLegacyOrder(isAsc ? "desc" : "asc");
      setLegacyOrderBy(property);
      fetchInitialLegacySubscriptions(currentGlobalSearchTerm);
    },
    [legacyOrder, legacyOrderBy, fetchInitialLegacySubscriptions]
  );

  return {
    legacyInitialData,
    legacyTotalCount,
    legacyLoadingInitial,
    activeLegacyFilter,
    legacyOrder,
    legacyOrderBy,
    legacyCountForTabDisplay,
    ROWS_PER_PAGE_FOR_LOAD_MORE,
    fetchInitialLegacySubscriptions,
    fetchLegacyCountForTabsManager, // قد تظل مفيدة للتحديثات المستقلة للعدد في التبويب
    handleLoadMoreLegacy,
    handleLegacyFilterChange,
    handleLegacyRequestSort,
    setLegacyInitialData,
  };
}
