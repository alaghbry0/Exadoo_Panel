import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getPayments } from "services/api";
import { format } from "date-fns";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters] = useState({
    page: 1,
    page_size: 20,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // لتخفيف الضغط على الخادم، نقوم بتخزين البيانات مؤقتاً في sessionStorage
        const cacheKey = `payments_${filters.page}_${filters.page_size}_${searchTerm}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setPayments(JSON.parse(cachedData));
        } else {
          const response = await getPayments({ ...filters, search: searchTerm });
          setPayments(response.data);
          sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, searchTerm]);

  // تحديث الأعمدة لتشمل الحقول الجديدة
  const columns = [
    { Header: "Full Name", accessor: "full_name", align: "left" },
    { Header: "Username", accessor: "username", align: "left" },
    { Header: "Telegram ID", accessor: "telegram_id", align: "left" },
    { Header: "Payment Token", accessor: "payment_token", align: "left" },
    { Header: "TX Hash", accessor: "tx_hash", align: "left" },
    { Header: "Amount", accessor: "amount", align: "right" },
    { Header: "Amount Received", accessor: "amount_received", align: "right" },
    { Header: "Payment Method", accessor: "payment_method", align: "left" },
    { Header: "Processed At", accessor: "processed_at", align: "left" },
    { Header: "Error Message", accessor: "error_message", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  // تعديل دالة إنشاء الصفوف لتشمل الحقول الجديدة
  const createRows = (payment) => ({
    full_name: payment.full_name,
    username: payment.username,
    telegram_id: payment.telegram_id,
    payment_token: payment.payment_token,
    tx_hash: payment.tx_hash,
    amount: payment.amount,
    amount_received: payment.amount_received,
    payment_method: payment.payment_method,
    processed_at: payment.processed_at
      ? format(new Date(payment.processed_at), "dd/MM/yyyy HH:mm")
      : "",
    error_message: payment.error_message,
    status: payment.status,
    actions: (
      <Button variant="outlined" size="small" onClick={() => handleView(payment)}>
        View Details
      </Button>
    ),
  });

  const handleView = (payment) => {
    // هنا يمكن فتح نافذة منبثقة لعرض تفاصيل الدفعة بشكل موسع
    console.log("View payment:", payment);
    alert(`عرض تفاصيل الدفعة لـ: ${payment.full_name}`);
  };

  const rows = payments.map(createRows);

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
                  Payments Table
                </MDTypography>
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
                  label="Search Payments"
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
                    <CircularProgress color="primary" />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted
                    entriesPerPage
                    showTotalEntries
                    noEndBorder
                    loading={loading}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default PaymentsTable;
