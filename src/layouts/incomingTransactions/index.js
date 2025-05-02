import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getIncomingTransactions } from "services/api"; // تأكد من تعديل المسار حسب تنظيم ملفاتك
import CircularProgress from "@mui/material/CircularProgress";

function IncomingTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  // إضافة حالة البحث
  const [searchTerm, setSearchTerm] = useState("");
  const [filters] = useState({
    page: 1,
    page_size: 20,
  });

  // دالة لتحديث حالة البحث تُمرر إلى DashboardNavbar
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const cacheKey = `incoming_${filters.page}_${filters.page_size}_${searchTerm}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setTransactions(JSON.parse(cachedData));
        } else {
          const response = await getIncomingTransactions({ ...filters, search: searchTerm });
          setTransactions(response);
          sessionStorage.setItem(cacheKey, JSON.stringify(response));
        }
      } catch (error) {
        console.error("Error fetching incoming transactions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, searchTerm]);

  const columns = [
    { Header: "TX Hash", accessor: "txhash", align: "left" },
    { Header: "Sender Address", accessor: "sender_address", align: "left" },
    { Header: "Amount", accessor: "amount", align: "right" },
    { Header: "Memo", accessor: "payment_token", align: "left" },
    { Header: "Processed", accessor: "processed", align: "center" },
    { Header: "Received At", accessor: "received_at", align: "left" },
  ];

  const createRows = (transaction) => ({
    txhash: transaction.txhash,
    sender_address: transaction.sender_address,
    amount: transaction.amount,
    payment_token: transaction.payment_token,
    processed: transaction.processed ? "Yes" : "No",
    received_at: transaction.received_at,
  });

  const rows = transactions.map(createRows);

  return (
    <DashboardLayout>
      {/* تمرير دالة تحديث البحث إلى DashboardNavbar */}
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
                  Incoming Transactions
                </MDTypography>
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

export default IncomingTransactions;
