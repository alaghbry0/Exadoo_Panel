// ./hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import { getUsers, getUserDetails } from "../../../services/api"; // تم تعديل المسار بناءً على إصلاح سابق

export function useUsers(showSnackbar, initialSearchTerm = "") {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableQueryOptions, setTableQueryOptions] = useState({
    page: 1,
    pageSize: 20,
  });
  // هذا searchTerm هو المستخدم داخليًا بواسطة الهوك
  const [internalSearchTerm, setInternalSearchTerm] = useState(initialSearchTerm);

  const [totalRecords, setTotalRecords] = useState(0);
  const [usersCountStat, setUsersCountStat] = useState(0);

  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState(null);

  const fetchData = useCallback(
    async (queryOpts, searchT) => {
      // اسم متغير البحث مختلف لتجنب الالتباس
      setLoading(true);
      setError(null);
      try {
        const paramsToSend = {
          page: queryOpts.page,
          page_size: queryOpts.pageSize,
          search: searchT || undefined, // استخدام searchT
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

        const responseData = await getUsers(paramsToSend);

        if (responseData && typeof responseData.data !== "undefined") {
          // تحقق من وجود data
          setUsersData(responseData.data || []);
          setTotalRecords(responseData.total || 0);
          setUsersCountStat(responseData.users_count || 0);
        } else {
          console.error("[fetchData users] Unexpected API response structure:", responseData);
          if (showSnackbar)
            showSnackbar("Error: Could not parse user data (unexpected structure).", "error");
          setUsersData([]);
          setTotalRecords(0);
          setUsersCountStat(0);
        }
      } catch (err) {
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          "Could not fetch users.";
        setError(message);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
        setUsersData([]);
        setTotalRecords(0);
        setUsersCountStat(0);
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar] // يجب أن يكون showSnackbar موجودًا في قائمة الاعتماديات إذا تم استخدامه
  );

  // Effect لجلب البيانات عند تغيير خيارات الجدول أو مصطلح البحث الداخلي
  useEffect(() => {
    fetchData(tableQueryOptions, internalSearchTerm);
  }, [fetchData, tableQueryOptions, internalSearchTerm]); // الاعتماد على internalSearchTerm

  // دالة لتغيير خيارات الجدول (مثل الصفحة، حجم الصفحة)
  const handleTableQueryOptionsChange = useCallback((newOptions) => {
    setTableQueryOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // دالة لتحديث مصطلح البحث من المكون الأب
  const handleSetSearchTerm = useCallback((newSearchTerm) => {
    setInternalSearchTerm(newSearchTerm); // تحديث المصطلح الداخلي
    setTableQueryOptions((prev) => ({ ...prev, page: 1 })); // إعادة التعيين إلى الصفحة 1 عند البحث الجديد
  }, []);

  // دالة صريحة لإعادة جلب البيانات بالخيارات الحالية
  const refetch = useCallback(() => {
    // هذا سيؤدي إلى تشغيل useEffect أعلاه لأن fetchData هي نفسها
    // ولكن قد ترغب في استدعاء fetchData مباشرة هنا إذا كنت تريد تجنب الاعتماد على useEffect
    // إذا كان fetchData يعتمد على tableQueryOptions و internalSearchTerm فإنه سيستخدم القيم الحالية.
    if (showSnackbar) showSnackbar("Refreshing data...", "info"); // يمكن إضافة رسالة هنا أو في المكون
    fetchData(tableQueryOptions, internalSearchTerm);
  }, [fetchData, tableQueryOptions, internalSearchTerm, showSnackbar]);

  const fetchUserDetailsForDialog = useCallback(
    async (telegramId) => {
      setUserDetailsLoading(true);
      setUserDetailsError(null);
      try {
        const userData = await getUserDetails(telegramId);
        setSelectedUserDetails(userData);
      } catch (err) {
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load user details.";
        setUserDetailsError(message);
        if (showSnackbar) showSnackbar(message, "error");
      } finally {
        setUserDetailsLoading(false);
      }
    },
    [showSnackbar]
  );

  const clearSelectedUserDetails = useCallback(() => {
    setSelectedUserDetails(null);
    setUserDetailsError(null);
  }, []);

  return {
    usersData,
    loading,
    error,
    setError,
    tableQueryOptions,
    setTableQueryOptions: handleTableQueryOptionsChange,
    totalRecords,
    usersCountStat,
    setSearchTerm: handleSetSearchTerm, // تم تمرير الدالة الجديدة
    refetchData: refetch, // <<< دالة جديدة للتحديث
    selectedUserDetails,
    userDetailsLoading,
    userDetailsError,
    fetchUserDetailsForDialog,
    clearSelectedUserDetails,
  };
}
