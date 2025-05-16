// src/layouts/Users/hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import { getUsers, getUserDetails } from "../../../services/api";

export function useUsers(showSnackbar) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState(null);

  // جلب بيانات المستخدمين
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
        };

        // تنظيف المعلمات
        const finalParams = { ...queryParams };
        Object.keys(finalParams).forEach((key) => {
          if (
            finalParams[key] === null ||
            finalParams[key] === "" ||
            finalParams[key] === undefined
          ) {
            delete finalParams[key];
          }
        });

        const responseData = await getUsers(finalParams);

        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.hasOwnProperty("data") &&
          responseData.hasOwnProperty("total_count")
        ) {
          const newUsers = responseData.data || [];
          const newTotalCount = responseData.total_count || 0;

          setUsers((prevUsers) => {
            if (!isLoadMore) return newUsers;
            const existingIds = new Set(prevUsers.map((s) => s.id));
            const uniqueNewData = newUsers.filter((s) => !existingIds.has(s.id));
            return [...prevUsers, ...uniqueNewData];
          });

          setTotalUsers(newTotalCount);
          setCurrentPage(pageToFetch);

          const currentDataLength = isLoadMore
            ? users.length + newUsers.filter((u) => !users.find((pu) => pu.id === u.id)).length
            : newUsers.length;
          setHasMoreData(currentDataLength < newTotalCount);
        } else {
          console.error("[fetchData] Unexpected API response structure:", responseData);
          setError("Received unexpected data format from server.");
          if (showSnackbar) showSnackbar("Error: Could not parse user data.", "error");
          if (!isLoadMore) {
            setUsers([]);
            setTotalUsers(0);
          }
          setHasMoreData(false);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        const message = err.response?.data?.error || err.message || "Could not fetch users.";
        setError(`Failed to load users: ${message}`);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
        if (!isLoadMore) {
          setUsers([]);
          setTotalUsers(0);
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
    [rowsPerPage, order, orderBy, showSnackbar, users.length]
  );

  // جلب البيانات الأولية
  const fetchInitialData = useCallback(
    async (currentSearchTerm = "") => {
      await fetchData(1, currentSearchTerm, false);
    },
    [fetchData]
  );

  // معالج لتغيير الترتيب
  const handleRequestSort = useCallback(
    (event, property, currentGlobalSearchTerm) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
      fetchInitialData(currentGlobalSearchTerm);
    },
    [order, orderBy, fetchInitialData]
  );

  // معالج لتغيير عدد الصفوف بالصفحة
  const handleChangeRowsPerPage = useCallback(
    (event, currentGlobalSearchTerm) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      fetchInitialData(currentGlobalSearchTerm);
    },
    [fetchInitialData]
  );

  // معالج لجلب المزيد من البيانات
  const handleLoadMore = useCallback(
    (currentGlobalSearchTerm) => {
      if (!loadingMore && hasMoreData) {
        fetchData(currentPage + 1, currentGlobalSearchTerm, true);
      }
    },
    [loadingMore, hasMoreData, currentPage, fetchData]
  );

  // جلب تفاصيل مستخدم محدد
  const fetchUserDetails = useCallback(
    async (telegramId) => {
      setUserDetailsLoading(true);
      setUserDetailsError(null);
      try {
        const userData = await getUserDetails(telegramId);
        setSelectedUser(userData);
      } catch (err) {
        console.error("Error fetching user details:", err);
        const message = err.response?.data?.error || err.message || "Could not fetch user details.";
        setUserDetailsError(`Failed to load user details: ${message}`);
        if (showSnackbar) showSnackbar(`Error: ${message}`, "error");
      } finally {
        setUserDetailsLoading(false);
      }
    },
    [showSnackbar]
  );

  // مسح تفاصيل المستخدم المحدد
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserDetailsError(null);
  }, []);

  return {
    users,
    loading,
    loadingMore,
    error,
    setError,
    rowsPerPage,
    setRowsPerPage,
    totalUsers,
    order,
    orderBy,
    fetchInitialData,
    handleRequestSort,
    handleChangeRowsPerPage,
    handleLoadMore,
    hasMoreData,
    // تفاصيل المستخدم المحدد
    selectedUser,
    userDetailsLoading,
    userDetailsError,
    fetchUserDetails,
    clearSelectedUser,
  };
}
