// src/layouts/tables/Table.jsx
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton"; // تم الاستبدال هنا
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import DataTable from "examples/Tables/DataTable";
import {
  getSubscriptions,
  getSubscriptionTypes,
  updateSubscription,
  addSubscription,
} from "services/api";
import { format } from "date-fns";
import SubscriptionFormModal from "layouts/tables/components/SubscriptionFormModal";
import ExportModal from "layouts/tables/components/ExportModal";
import handleExportSubscriptions from "layouts/tables/components/handleExportSubscriptions";

function Table() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters] = useState({
    page: 1,
    page_size: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const subs = await getSubscriptions({ ...filters, search: searchTerm });
        setSubscriptions(subs);
        const types = await getSubscriptionTypes();
        setSubscriptionTypes(types);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, searchTerm]);

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
    { Header: "Status", accessor: "status", align: "left" },
    { Header: "Expiry Date", accessor: "expiry_date", align: "left" },
    { Header: "Action", accessor: "action", align: "center" },
  ];

  const createRows = (sub) => ({
    full_name: sub.full_name,
    username: sub.username,
    telegram_id: sub.telegram_id,
    subscription_plan_name: sub.subscription_plan_name,
    status: sub.is_active ? "Active" : "Inactive",
    expiry_date: format(new Date(sub.expiry_date), "dd/MM/yyyy HH:mm"),
    action: (
      <IconButton aria-label="edit" color="info" size="small" onClick={() => handleEdit(sub)}>
        <EditIcon />
      </IconButton>
    ),
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
        setSubscriptions((prev) => [...prev, added]);
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
                  Subscriptions Table
                </MDTypography>
                <MDBox display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleExportModalOpen}
                    size="small"
                  >
                    Export
                  </MDButton>
                  <MDButton variant="gradient" color="info" onClick={handleAdd} size="small">
                    Add New
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox
                p={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <MDInput
                  label="Search Subscriptions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  Object.entries(groupedSubscriptions).map(([typeId, subs]) => {
                    const type = subscriptionTypesMap[typeId];
                    const rows = subs.map(createRows);
                    return (
                      <MDBox key={typeId} mb={4}>
                        <MDBox px={2} pb={1}>
                          <MDTypography variant="h6" fontWeight="bold">
                            {type ? type.name : "Unknown Subscription Type"}
                          </MDTypography>
                        </MDBox>
                        <DataTable
                          table={{ columns, rows }}
                          isSorted
                          entriesPerPage
                          showTotalEntries
                          noEndBorder
                          loading={loading}
                        />
                      </MDBox>
                    );
                  })
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
