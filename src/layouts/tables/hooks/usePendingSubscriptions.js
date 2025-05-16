// src/layouts/tables/hooks/usePendingSubscriptions.js
import { useState, useEffect, useCallback } from "react";
import {
  getPendingSubscriptions,
  getPendingSubscriptionsStats,
  handleSinglePendingSubscriptionAction,
  handleBulkPendingSubscriptionsAction,
} from "../services/api";

export function usePendingSubscriptions(
  showSnackbar,
  refreshPrimarySubscriptions,
  refreshLegacyTabCount,
  refreshActiveSubscriptionsCount // افترض أنك ستمررها من Tables.jsx إذا لزم الأمر
) {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [pendingPage, setPendingPage] = useState(0); // الصفحة تبدأ من 0 لـ MUI, لكن API قد يتوقع 1
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(20);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingStats, setPendingStats] = useState({ pending: 0, complete: 0, total_all: 0 });
  const [currentPendingFilter, setCurrentPendingFilter] = useState("pending"); // status filter
  // لا حاجة لـ pendingSearchTerm هنا

  const [bulkProcessingLoading, setBulkProcessingLoading] = useState(false);
  const [bulkProcessResult, setBulkProcessResult] = useState(null);
  const [bulkResultModalOpen, setBulkResultModalOpen] = useState(false);

  // جلب إحصائيات pending (عادة لا تعتمد على البحث)
  const fetchPendingStats = useCallback(async () => {
    try {
      const statsData = await getPendingSubscriptionsStats(); // افترض أن هذه لا تأخذ معاملات بحث
      setPendingStats(statsData || { pending: 0, complete: 0, total_all: 0 });
    } catch (err) {
      console.error("Error fetching pending subscriptions stats:", err);
    }
  }, []);

  // دالة جلب بيانات جدول pending (تقبل البحث)
  const fetchPendingSubscriptionsData = useCallback(
    async (currentSearchTerm = "") => {
      setPendingLoading(true);
      try {
        const queryParams = {
          page: pendingPage + 1, // API يتوقع الصفحة تبدأ من 1
          page_size: pendingRowsPerPage,
          status: currentPendingFilter === "all" ? undefined : currentPendingFilter,
          search: currentSearchTerm || undefined, // استخدام البحث الممرر
        };
        const responseData = await getPendingSubscriptions(queryParams);
        setPendingSubscriptions(responseData.data || []);
        setPendingTotal(responseData.total_count || 0);
      } catch (err) {
        console.error("Error fetching pending subscriptions:", err);
        if (showSnackbar)
          showSnackbar(
            `Error: ${err.message || "Could not fetch pending subscriptions."}`,
            "error"
          );
        setPendingSubscriptions([]);
        setPendingTotal(0);
      } finally {
        setPendingLoading(false);
      }
    },
    [currentPendingFilter, pendingPage, pendingRowsPerPage, showSnackbar] // pendingSearchTerm أزيل
  );

  // useEffect لجلب الإحصائيات عند تحميل الهوك (مرة واحدة أو عند الحاجة)
  // fetchPendingSubscriptionsData سيتم استدعاؤها من `Tables.jsx`
  useEffect(() => {
    fetchPendingStats();
  }, [fetchPendingStats]);

  // معالج لتغيير فلتر الحالة (pending, complete, all)
  const handlePendingFilterChange = useCallback(
    (newFilterStatus, currentGlobalSearchTerm) => {
      setCurrentPendingFilter(newFilterStatus);
      setPendingPage(0); // إعادة تعيين الصفحة عند تغيير الفلتر
      fetchPendingSubscriptionsData(currentGlobalSearchTerm); // جلب البيانات بالفلتر والبحث الجديدين
    },
    [fetchPendingSubscriptionsData]
  );

  // معالج لتغيير الصفحة الحالية
  const handlePendingPageChange = useCallback(
    (event, newPage, currentGlobalSearchTerm) => {
      // newPage من MUI TablePagination (0-indexed)
      setPendingPage(newPage);
      fetchPendingSubscriptionsData(currentGlobalSearchTerm);
    },
    [fetchPendingSubscriptionsData]
  );

  // معالج لتغيير عدد الصفوف بالصفحة
  const handlePendingRowsPerPageChange = useCallback(
    (event, currentGlobalSearchTerm) => {
      setPendingRowsPerPage(parseInt(event.target.value, 10));
      setPendingPage(0); // إعادة تعيين الصفحة عند تغيير عدد الصفوف
      fetchPendingSubscriptionsData(currentGlobalSearchTerm);
    },
    [fetchPendingSubscriptionsData]
  );

  // معالج لتمييز اشتراك فردي كمكتمل
  const handleMarkPendingComplete = useCallback(
    async (id, currentGlobalSearchTerm) => {
      try {
        const result = await handleSinglePendingSubscriptionAction(id);
        if (result.success) {
          if (showSnackbar)
            showSnackbar(result.message || "Subscription processed successfully!", "success");
          // إعادة تحميل البيانات للتبويبات المتأثرة مع البحث الحالي
          await fetchPendingSubscriptionsData(currentGlobalSearchTerm);
          await fetchPendingStats(); // الإحصائيات قد تتغير
          if (refreshPrimarySubscriptions)
            await refreshPrimarySubscriptions(currentGlobalSearchTerm);
          if (refreshLegacyTabCount)
            await refreshLegacyTabCount(undefined, currentGlobalSearchTerm);
          if (refreshActiveSubscriptionsCount)
            await refreshActiveSubscriptionsCount(currentGlobalSearchTerm); // إذا كانت دالة التحديث تقبل البحث
        } else {
          if (showSnackbar)
            showSnackbar(result.error || "Failed to process subscription.", "error");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Error processing subscription";
        if (showSnackbar) showSnackbar(errorMessage, "error");
      }
    },
    [
      showSnackbar,
      fetchPendingSubscriptionsData,
      fetchPendingStats,
      refreshPrimarySubscriptions,
      refreshLegacyTabCount,
      refreshActiveSubscriptionsCount,
    ]
  );

  // معالج للمعالجة الدفعية للاشتراكات المعلقة
  const handleBulkProcessPending = useCallback(
    async (currentGlobalSearchTerm) => {
      // قد يتم استخدام البحث لتحديد المجموعة المستهدفة
      setBulkProcessingLoading(true);
      setBulkProcessResult(null);
      try {
        const filterCriteriaForBulk = {
          // search: currentGlobalSearchTerm || undefined, // إذا كانت المعالجة الدفعية ستعتمد على البحث
        };
        const result = await handleBulkPendingSubscriptionsAction(filterCriteriaForBulk);
        setBulkProcessResult(result);
        setBulkResultModalOpen(true);

        if (showSnackbar) {
          const message = result.message || "Bulk processing completed.";
          const severity =
            result.details?.failed_bot_or_db_updates > 0 || result.error ? "warning" : "success";
          showSnackbar(message, severity);
        }

        // إعادة تحميل البيانات للتبويبات المتأثرة مع البحث الحالي
        await fetchPendingSubscriptionsData(currentGlobalSearchTerm);
        await fetchPendingStats();
        if (refreshPrimarySubscriptions) await refreshPrimarySubscriptions(currentGlobalSearchTerm);
        if (refreshLegacyTabCount) await refreshLegacyTabCount(undefined, currentGlobalSearchTerm);
        if (refreshActiveSubscriptionsCount)
          await refreshActiveSubscriptionsCount(currentGlobalSearchTerm);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Bulk processing failed.";
        if (showSnackbar) showSnackbar(errorMessage, "error");
        setBulkProcessResult({ error: errorMessage, details: err.response?.data?.details });
        setBulkResultModalOpen(true);
      } finally {
        setBulkProcessingLoading(false);
      }
    },
    [
      showSnackbar,
      fetchPendingSubscriptionsData,
      fetchPendingStats,
      refreshPrimarySubscriptions,
      refreshLegacyTabCount,
      refreshActiveSubscriptionsCount,
    ]
  );

  const handleCloseBulkResultModal = useCallback(() => {
    setBulkResultModalOpen(false);
  }, []);

  return {
    pendingSubscriptions,
    pendingPage,
    setPendingPage, // مهم لإعادة التعيين من Tables.jsx إذا لزم الأمر
    pendingRowsPerPage,
    setPendingRowsPerPage, // مهم لإعادة التعيين من Tables.jsx إذا لزم الأمر
    pendingTotal,
    pendingLoading,
    pendingStats,
    currentPendingFilter,
    // pendingSearchTerm, // أزيل
    fetchPendingStats,
    fetchPendingSubscriptionsData, // دالة رئيسية للتحميل/إعادة التحميل
    handlePendingFilterChange,
    // handlePendingSearchChange, // أزيل
    handlePendingPageChange,
    handlePendingRowsPerPageChange,
    handleMarkPendingComplete,
    bulkProcessingLoading,
    bulkProcessResult,
    bulkResultModalOpen,
    handleBulkProcessPending,
    handleCloseBulkResultModal,
  };
}
