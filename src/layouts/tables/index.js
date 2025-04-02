// src/layouts/tables/Table.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import DataTable from "examples/Tables/DataTable";
import {
  getSubscriptions,
  getSubscriptionTypes,
  updateSubscription,
  addSubscription,
  // تم إزالة deleteSubscription
} from "services/api";
import { format } from "date-fns";
import SubscriptionFormModal from "layouts/tables/components/SubscriptionFormModal";
import ExportModal from "layouts/tables/components/ExportModal";
import handleExportSubscriptions from "layouts/tables/components/handleExportSubscriptions";

function Table() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc",
    active_only: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState(null);
  const observer = useRef();

  // دالة استقبال تغييرات البحث من DashboardNavbar
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setSubscriptions([]);
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasMore(true);
  };

  const lastElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreSubscriptions();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  const loadMoreSubscriptions = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const fetchSubscriptions = useCallback(async () => {
    const { page, page_size } = filters;
    const isInitialLoad = page === 1;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        ...filters,
        search: searchTerm,
        subscription_type_id: activeTypeFilter,
      };

      const newSubscriptions = await getSubscriptions(params);

      if (isInitialLoad) {
        setSubscriptions(newSubscriptions);
      } else {
        if (newSubscriptions.length === 0) {
          setHasMore(false);
        } else {
          setSubscriptions((prev) => [...prev, ...newSubscriptions]);
        }
      }

      if (newSubscriptions.length < page_size) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, searchTerm, activeTypeFilter]);

  const fetchSubscriptionTypes = useCallback(async () => {
    try {
      const typesCacheKey = `subscriptionTypes`;
      let types = sessionStorage.getItem(typesCacheKey);
      if (types) {
        types = JSON.parse(types);
      } else {
        types = await getSubscriptionTypes();
        sessionStorage.setItem(typesCacheKey, JSON.stringify(types));
      }
      setSubscriptionTypes(types);
    } catch (error) {
      console.error("Error fetching subscription types:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionTypes();
  }, [fetchSubscriptionTypes]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleRefresh = () => {
    // مسح التخزين المؤقت
    sessionStorage.removeItem(`subscriptionTypes`);

    // إعادة تعيين الحالة وجلب البيانات
    setSubscriptions([]);
    setFilters({
      page: 1,
      page_size: 10,
      sort_by: "created_at",
      sort_order: "desc",
      active_only: false,
    });
    setHasMore(true);
    setActiveTypeFilter(null);

    fetchSubscriptionTypes();
    fetchSubscriptions();
  };

  const subscriptionTypesMap = subscriptionTypes.reduce((acc, type) => {
    acc[type.id] = type;
    return acc;
  }, {});

  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    const typeId = sub.subscription_type_id;
    if (!acc[typeId]) acc[typeId] = [];
    acc[typeId].push(sub);
    return acc;
  }, {});

  const columns = [
    { Header: "Full Name", accessor: "full_name", align: "left" },
    { Header: "Username", accessor: "username", align: "left" },
    { Header: "Telegram ID", accessor: "telegram_id", align: "left" },
    { Header: "Subscription Plan", accessor: "subscription_plan_name", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Expiry Date", accessor: "expiry_date", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const createRows = (sub, index, arr) => ({
    full_name: sub.full_name,
    username: sub.username,
    telegram_id: sub.telegram_id,
    subscription_plan_name: sub.subscription_plan_name,
    status: (
      <Chip
        label={sub.is_active ? "Active" : "Inactive"}
        color={sub.is_active ? "success" : "error"}
        size="small"
      />
    ),
    expiry_date: format(new Date(sub.expiry_date), "dd/MM/yyyy HH:mm"),
    actions: (
      <MDBox display="flex" justifyContent="center">
        <Tooltip title="Edit Subscription">
          <IconButton
            aria-label="edit"
            color="info"
            size="small"
            onClick={() => handleEdit(sub)}
            sx={{ mr: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {/* تمت إزالة أي أزرار أو وظائف تتعلق بالحذف */}
      </MDBox>
    ),
    ref: index === arr.length - 1 ? lastElementRef : null,
  });

  const handleEdit = (subscription) => {
    setIsEditMode(true);
    setModalInitialValues(subscription);
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
    try {
      if (isEditMode) {
        const updated = await updateSubscription(modalInitialValues.id, formData);
        setSubscriptions((prev) => prev.map((sub) => (sub.id === updated.id ? updated : sub)));
      } else {
        const added = await addSubscription(formData);
        setSubscriptions((prev) => [added, ...prev]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("حدث خطأ أثناء معالجة العملية");
    }
  };

  const handleExportModalOpen = () => {
    setExportModalOpen(true);
  };

  const handleExportModalClose = () => {
    setExportModalOpen(false);
  };

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleTypeFilter = (typeId) => {
    setActiveTypeFilter(activeTypeFilter === typeId ? null : typeId);
    setFilterMenuAnchor(null);
    setSubscriptions([]);
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasMore(true);
  };

  const handleToggleActiveOnly = () => {
    setFilters((prev) => ({ ...prev, active_only: !prev.active_only, page: 1 }));
    setSubscriptions([]);
    setHasMore(true);
    setFilterMenuAnchor(null);
  };

  const handleSortChange = (sortField) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortField,
      sort_order: prev.sort_by === sortField && prev.sort_order === "desc" ? "asc" : "desc",
      page: 1,
    }));
    setSubscriptions([]);
    setHasMore(true);
    setFilterMenuAnchor(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar onSearchChange={handleSearchChange} />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Subscriptions Management
                </MDTypography>
                <MDBox display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                  <Tooltip title="Refresh Data">
                    <IconButton color="white" onClick={handleRefresh} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Filter Options">
                    <IconButton color="white" onClick={handleFilterClick} size="small">
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={filterMenuAnchor}
                    open={Boolean(filterMenuAnchor)}
                    onClose={handleFilterClose}
                    TransitionComponent={Fade}
                  >
                    <MenuItem onClick={handleToggleActiveOnly}>
                      {filters.active_only ? "Show All Subscriptions" : "Show Active Only"}
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange("expiry_date")}>
                      Sort by{" "}
                      {filters.sort_by === "expiry_date" && filters.sort_order === "desc"
                        ? "Oldest"
                        : "Latest"}{" "}
                      Expiry
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange("created_at")}>
                      Sort by{" "}
                      {filters.sort_by === "created_at" && filters.sort_order === "desc"
                        ? "Oldest"
                        : "Latest"}{" "}
                      Created
                    </MenuItem>
                    {subscriptionTypes.map((type) => (
                      <MenuItem
                        key={type.id}
                        onClick={() => handleTypeFilter(type.id)}
                        selected={activeTypeFilter === type.id}
                      >
                        {activeTypeFilter === type.id ? `✓ ${type.name}` : type.name}
                      </MenuItem>
                    ))}
                  </Menu>
                  <MDButton
                    variant="gradient"
                    color="secondary"
                    onClick={handleExportModalOpen}
                    size="small"
                  >
                    Export
                  </MDButton>
                  <MDButton variant="gradient" color="success" onClick={handleAdd} size="small">
                    Add New
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {loading && subscriptions.length === 0 ? (
                  <MDBox display="flex" flexDirection="column" gap={2} p={3}>
                    {[...Array(5)].map((_, i) => (
                      <MDBox key={i}>
                        <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                        <Skeleton variant="rectangular" height={200} />
                      </MDBox>
                    ))}
                  </MDBox>
                ) : subscriptions.length === 0 ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" py={8}>
                    <MDTypography variant="h5" color="text">
                      No subscriptions found
                    </MDTypography>
                  </MDBox>
                ) : (
                  <>
                    {activeTypeFilter ? (
                      <MDBox mb={4}>
                        <MDBox
                          px={2}
                          pb={1}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <MDTypography variant="h6" fontWeight="bold">
                            {subscriptionTypesMap[activeTypeFilter]?.name ||
                              "Filtered Subscriptions"}
                          </MDTypography>
                          <Chip
                            label="Clear Filter"
                            color="info"
                            size="small"
                            onClick={() => handleTypeFilter(null)}
                            sx={{ cursor: "pointer" }}
                          />
                        </MDBox>
                        <DataTable
                          table={{
                            columns,
                            rows: subscriptions.map((sub, i, arr) => createRows(sub, i, arr)),
                          }}
                          isSorted={false}
                          entriesPerPage={false}
                          showTotalEntries={false}
                          noEndBorder
                        />
                      </MDBox>
                    ) : (
                      Object.entries(groupedSubscriptions).map(([typeId, subs]) => {
                        const type = subscriptionTypesMap[typeId];
                        const rows = subs.map((sub, i, arr) => createRows(sub, i, arr));
                        return (
                          <MDBox key={typeId} mb={4}>
                            <MDBox px={2} pb={1}>
                              <MDTypography variant="h6" fontWeight="bold">
                                {type ? type.name : "Unknown Subscription Type"}
                              </MDTypography>
                            </MDBox>
                            <DataTable
                              table={{ columns, rows }}
                              isSorted={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder
                            />
                          </MDBox>
                        );
                      })
                    )}

                    {loadingMore && (
                      <MDBox display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={30} />
                      </MDBox>
                    )}

                    {!hasMore && subscriptions.length > 0 && (
                      <MDBox textAlign="center" py={2}>
                        <MDTypography variant="body2" color="text">
                          No more subscriptions to load
                        </MDTypography>
                      </MDBox>
                    )}
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <SubscriptionFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialValues={modalInitialValues}
        subscriptionTypes={subscriptionTypes}
        isEdit={isEditMode}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={handleExportModalClose}
        onSubmit={handleExportSubscriptions}
        subscriptionTypes={subscriptionTypes}
      />
    </DashboardLayout>
  );
}

export default Table;
