// src/layouts/tables/components/ActiveSubscriptionsTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Box,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  Fade,
  Tooltip,
  IconButton,
  Skeleton,
} from "@mui/material"; // استيراد مكونات MUI اللازمة
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// DataTable قد لا نحتاجه إذا استخدمنا MUI Table مباشرة أو قمنا بتبسيط العرض
// import DataTable from "examples/Tables/DataTable";

import { getSubscriptions, updateSubscription, addSubscription } from "services/api";
import { format } from "date-fns";
import SubscriptionFormModal from "./SubscriptionFormModal";
import ExportModal from "./ExportModal"; // إذا كنت ستستخدمه هنا
import handleExportSubscriptions from "./handleExportSubscriptions"; // إذا كنت ستستخدمه هنا

// دالة تنسيق التاريخ
const formatDate = (dateString, time = true) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), time ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
  } catch (e) {
    return dateString;
  }
};

const headCells = [
  { id: "full_name", label: "Full Name", sortable: true },
  { id: "username", label: "Username", sortable: true },
  { id: "telegram_id", label: "Telegram ID", sortable: true },
  { id: "source", label: "Source", sortable: true }, // ✅ عمود المصدر
  { id: "subscription_plan_name", label: "Plan", sortable: true },
  { id: "subscription_type_name", label: "Type", sortable: true }, // أضفت النوع هنا ليكون واضحًا
  { id: "status", label: "Status", sortable: false }, // الفرز بالحالة يتطلب تعديل بالخادم لـ is_active
  { id: "start_date", label: "Start Date", sortable: true },
  { id: "expiry_date", label: "Expiry Date", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

function ActiveSubscriptionsTab({ subscriptionTypes, isLoadingTypes, initialSearchTerm }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // لحالة الترقيم
  const [page, setPage] = useState(0); // MUI TablePagination يبدأ من 0
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");

  // filters state
  const [filters, setFilters] = useState({
    sort_by: "expiry_date", // تم تغيير القيمة الافتراضية لتناسب الخادم
    sort_order: "desc",
    is_active: null, // null for all, true for active, false for inactive
    subscription_type_id: null, // فلتر نوع الاشتراك
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filter menu state
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // ارجع للصفحة الأولى عند تغيير البحث
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {
        page: page + 1, // API يتوقع الصفحة تبدأ من 1
        page_size: rowsPerPage,
        search: debouncedSearchTerm,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      };
      if (filters.is_active !== null) {
        apiParams.status = filters.is_active ? "active" : "inactive";
      }
      if (filters.subscription_type_id !== null) {
        apiParams.subscription_type_id = filters.subscription_type_id;
      }

      const data = await getSubscriptions(apiParams);
      setSubscriptions(data.items || []);
      setTotalItems(data.total_items || 0);
    } catch (err) {
      setError("Failed to load subscriptions. " + (err.response?.data?.error || err.message));
      setSubscriptions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, filters]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleRefresh = () => {
    setPage(0); // ارجع للصفحة الأولى
    // يمكنك إعادة تعيين الفلاتر الأخرى إذا أردت
    // setFilters({ sort_by: "expiry_date", sort_order: "desc", is_active: null, subscription_type_id: null });
    // setSearchTerm(""); // مسح البحث أيضًا إذا لزم الأمر
    loadSubscriptions(); // سيعيد التحميل بالصفحة 0 والفلاتر الحالية

    // مسح كاش أنواع الاشتراكات إذا كان هناك زر تحديث عام في الصفحة الرئيسية
    // sessionStorage.removeItem(`subscriptionTypes`);
    // fetchTypes(); // إذا كانت دالة fetchTypes معرفة هنا أو يتم استدعاؤها من الأعلى
  };

  const handleSortRequest = (property) => {
    const isAsc = filters.sort_by === property && filters.sort_order === "asc";
    setFilters((prev) => ({ ...prev, sort_by: property, sort_order: isAsc ? "desc" : "asc" }));
    setPage(0);
    setFilterMenuAnchor(null); // أغلق القائمة بعد الاختيار
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Modal handlers
  const handleEdit = (subscription) => {
    setIsEditMode(true);
    // تأكد من أن initialValues تتطابق مع حقول المودال
    // وأن subscription_type_id موجود إذا كان المودال يتوقعه
    const currentSub = subscriptions.find((s) => s.id === subscription.id);
    setModalInitialValues({ ...currentSub, expiry_date: currentSub.expiry_date }); // تأكد من أن expiry_date هو كائن Date إذا لزم الأمر للمودال
    setModalOpen(true);
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setModalInitialValues({});
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = async (formData) => {
    // console.log("Submitting form with data:", formData);
    try {
      if (isEditMode) {
        // تأكد من أن modalInitialValues.id موجود
        const subId =
          modalInitialValues?.id ||
          subscriptions.find(
            (s) => s.telegram_id === formData.telegram_id && s.username === formData.username
          )?.id;
        if (!subId) {
          throw new Error("Subscription ID not found for editing.");
        }
        await updateSubscription(subId, formData);
      } else {
        await addSubscription(formData);
      }
      setModalOpen(false);
      loadSubscriptions(); // أعد تحميل البيانات
    } catch (error) {
      console.error("Error submitting form:", error.response ? error.response.data : error.message);
      alert("Error processing request: " + (error.response?.data?.error || error.message));
    }
  };

  // Filter menu handlers
  const handleFilterClick = (event) => setFilterMenuAnchor(event.currentTarget);
  const handleFilterClose = () => setFilterMenuAnchor(null);

  const handleToggleActiveFilter = (status) => {
    // status can be true, false, or null
    setFilters((prev) => ({ ...prev, is_active: status }));
    setPage(0);
    handleFilterClose();
  };

  const handleTypeFilterChange = (typeId) => {
    setFilters((prev) => ({ ...prev, subscription_type_id: typeId }));
    setPage(0);
    handleFilterClose();
  };

  // إذا كان `subscriptionTypes` لا يزال قيد التحميل من الصفحة الرئيسية
  // if (isLoadingTypes) {
  //   return <MDBox display="flex" justifyContent="center" p={3}><CircularProgress /></MDBox>;
  // }

  // --- تجهيز الأعمدة والصفوف للجدول ---
  // لا حاجة لـ groupedSubscriptions أو createRows المعقد إذا استخدمنا MUI Table مباشرة
  // وبدون تجميع داخل هذا التبويب. إذا كنت لا تزال تريد التجميع، ستحتاج لإعادة التفكير في كيفية العرض مع TablePagination

  return (
    <Paper sx={{ width: "100%", mb: 2, p: 2 }}>
      {" "}
      {/* استخدام Paper كحاوية رئيسية للتبويب */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <TextField
          label="Search (Name, Username, TG ID, Source...)"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: "250px", flexGrow: 1 }}
        />
        <MDBox display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton color="default" onClick={handleRefresh} size="medium">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Options">
            <IconButton color="default" onClick={handleFilterClick} size="medium">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterClose}
            TransitionComponent={Fade}
            PaperProps={{ style: { maxHeight: 300, width: "25ch" } }}
          >
            <MenuItem disabled>
              <MDTypography variant="caption">Sort By:</MDTypography>
            </MenuItem>
            {headCells
              .filter((hc) => hc.sortable)
              .map((hc) => (
                <MenuItem
                  key={`sort-${hc.id}`}
                  onClick={() => handleSortRequest(hc.id)}
                  selected={filters.sort_by === hc.id}
                >
                  {hc.label}{" "}
                  {filters.sort_by === hc.id
                    ? filters.sort_order === "asc"
                      ? " (Asc)"
                      : " (Desc)"
                    : ""}
                </MenuItem>
              ))}
            <MenuItem divider />
            <MenuItem disabled>
              <MDTypography variant="caption">Filter by Status:</MDTypography>
            </MenuItem>
            <MenuItem
              onClick={() => handleToggleActiveFilter(null)}
              selected={filters.is_active === null}
            >
              Show All
            </MenuItem>
            <MenuItem
              onClick={() => handleToggleActiveFilter(true)}
              selected={filters.is_active === true}
            >
              Active Only
            </MenuItem>
            <MenuItem
              onClick={() => handleToggleActiveFilter(false)}
              selected={filters.is_active === false}
            >
              Inactive Only
            </MenuItem>

            {!isLoadingTypes && subscriptionTypes && subscriptionTypes.length > 0 && (
              <>
                <MenuItem divider />
                <MenuItem disabled>
                  <MDTypography variant="caption">Filter by Type:</MDTypography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleTypeFilterChange(null)}
                  selected={filters.subscription_type_id === null}
                >
                  All Types
                </MenuItem>
                {subscriptionTypes.map((type) => (
                  <MenuItem
                    key={type.id}
                    onClick={() => handleTypeFilterChange(type.id)}
                    selected={filters.subscription_type_id === type.id}
                  >
                    {type.name}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
          <MDButton
            variant="gradient"
            color="secondary"
            onClick={() => setExportModalOpen(true)}
            size="small"
          >
            Export
          </MDButton>
          <MDButton variant="gradient" color="success" onClick={handleAdd} size="small">
            Add New
          </MDButton>
        </MDBox>
      </MDBox>
      {loading && subscriptions.length === 0 ? (
        <Box sx={{ p: 3 }}>
          {[...Array(rowsPerPage)].map(
            (
              _,
              i // عرض عدد الهياكل العظمية بناءً على rowsPerPage
            ) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} animation="wave" />
            )
          )}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : subscriptions.length === 0 && !loading ? (
        <MDBox display="flex" justifyContent="center" alignItems="center" py={5}>
          <MDTypography variant="h6" color="textSecondary">
            No active subscriptions found matching your criteria.
          </MDTypography>
        </MDBox>
      ) : (
        <TableContainer>
          <Table stickyHeader aria-label="active subscriptions table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={filters.sort_by === headCell.id ? filters.sort_order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={filters.sort_by === headCell.id}
                        direction={filters.sort_by === headCell.id ? filters.sort_order : "asc"}
                        onClick={() => handleSortRequest(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((row) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.id /* أو مفتاح فريد آخر إذا كان ID ليس فريدًا تمامًا عبر الصفحات */}
                >
                  <TableCell>{row.full_name || "N/A"}</TableCell>
                  <TableCell>{row.username || "N/A"}</TableCell>
                  <TableCell>{row.telegram_id}</TableCell>
                  <TableCell>{row.source || "N/A"}</TableCell>
                  <TableCell>{row.subscription_plan_name || "N/A"}</TableCell>
                  <TableCell>{row.subscription_type_name || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.is_active ? "Active" : "Inactive"}
                      color={row.is_active ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(row.start_date)}</TableCell>
                  <TableCell>{formatDate(row.expiry_date)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Subscription">
                      <IconButton
                        aria-label="edit"
                        color="info"
                        size="small"
                        onClick={() => handleEdit(row)}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* الترقيم */}
      {!loading && totalItems > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      )}
      <SubscriptionFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialValues={modalInitialValues}
        subscriptionTypes={subscriptionTypes} // مررها من props
        isEdit={isEditMode}
      />
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onSubmit={handleExportSubscriptions} // تأكد من أن هذه الدالة جاهزة
        subscriptionTypes={subscriptionTypes}
      />
    </Paper>
  );
}

export default ActiveSubscriptionsTab;
