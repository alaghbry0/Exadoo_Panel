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
import InputAdornment from "@mui/material/InputAdornment"; // استيراد InputAdornment
import SearchIcon from "@mui/icons-material/Search"; // استيراد SearchIcon
import CircularProgress from "@mui/material/CircularProgress"; // استيراد CircularProgress

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
        const response = await getPayments({ ...filters, search: searchTerm });
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, searchTerm]);

  const columns = [
    { Header: "Full Name", accessor: "full_name", align: "left" },
    { Header: "Username", accessor: "username", align: "left" },
    { Header: "Telegram ID", accessor: "telegram_id", align: "left" },
    { Header: "TX Hash", accessor: "tx_hash", align: "left" },
    { Header: "User Wallet Address", accessor: "user_wallet_address", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Created At", accessor: "created_at", align: "left" },
    { Header: "Actions", accessor: "actions", align: "center" }, // تغيير Header إلى Actions ليكون أكثر وضوحًا
  ];

  const createRows = (payment) => ({
    full_name: payment.full_name,
    username: payment.username,
    telegram_id: payment.telegram_id,
    tx_hash: payment.tx_hash,
    user_wallet_address: payment.user_wallet_address,
    status: payment.status,
    created_at: format(new Date(payment.created_at), "dd/MM/yyyy HH:mm"),
    // تغيير accessor إلى actions ليتطابق مع Header
    actions: (
      <Button variant="outlined" size="small" onClick={() => handleView(payment)}>
        View Details {/* تغيير النص ليكون أكثر وضوحًا */}
      </Button>
    ),
  });

  const handleView = (payment) => {
    // يمكن فتح نافذة منبثقة لعرض تفاصيل الدفعة
    console.log("View payment:", payment);
    alert(`عرض تفاصيل الدفعة لـ: ${payment.full_name}`); // إضافة تنبيه بسيط كمثال
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
                justifyContent="space-between" // إضافة توزيع العناصر على طول الخط
                alignItems="center" // إضافة محاذاة العناصر عموديًا
              >
                <MDTypography variant="h6" color="white">
                  Payments Table {/* تغيير العنوان ليكون أكثر وضوحًا */}
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
                {" "}
                {/* إضافة flexWrap و gap لتجاوب أفضل */}
                <MDInput
                  label="Search Payments"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  InputProps={{
                    // إضافة InputProps لتحسين حقل البحث
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" /> {/* إضافة أيقونة البحث */}
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>
              <MDBox pt={3}>
                {loading ? ( // إضافة حالة التحميل
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress color="primary" /> {/* استخدام مؤشر تحميل مرئي */}
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
