import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { getIncomingTransactions } from "services/api";
import CircularProgress from "@mui/material/CircularProgress";

function IncomingTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters] = useState({
    page: 1,
    page_size: 20,
  });

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let dataToSet = []; // قيمة افتراضية
      try {
        const cacheKey = `incoming_${filters.page}_${filters.page_size}_${searchTerm}`;
        const cachedDataString = sessionStorage.getItem(cacheKey);

        if (cachedDataString) {
          try {
            const parsedCache = JSON.parse(cachedDataString);
            if (Array.isArray(parsedCache)) {
              dataToSet = parsedCache;
            } else {
              console.warn("Cached data is not an array. Will try to refetch.", parsedCache);
              sessionStorage.removeItem(cacheKey); // إزالة البيانات التالفة من الكاش
            }
          } catch (e) {
            console.error("Failed to parse cached data. Removing it.", e);
            sessionStorage.removeItem(cacheKey);
          }
        }

        // إذا لم يتم تحميل البيانات من الكاش (إما لعدم وجودها أو لأنها كانت تالفة)
        if (dataToSet.length === 0 && !cachedDataString) {
          // تحقق أدق: إذا لم يتم تعيين dataToSet من الكاش
          const response = await getIncomingTransactions({ ...filters, search: searchTerm });
          console.log("API Response:", response); // <-- مهم جداً: انظر إلى شكل الـ response

          // تحقق من شكل الـ response هنا. هذا مثال شائع.
          // قد تحتاج إلى تعديل `response.data` إلى `response.items` أو `response.transactions`
          // أو إذا كان `response` هو المصفوفة مباشرة.
          if (response && Array.isArray(response.data)) {
            dataToSet = response.data;
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
          } else if (Array.isArray(response)) {
            // إذا كان الـ response هو المصفوفة نفسها
            dataToSet = response;
            sessionStorage.setItem(cacheKey, JSON.stringify(response));
          } else {
            console.error("API response is not an array or in expected format:", response);
            // dataToSet ستبقى مصفوفة فارغة
          }
        }
      } catch (error) {
        console.error("Error fetching incoming transactions:", error);
        // dataToSet ستبقى مصفوفة فارغة في حالة حدوث خطأ
      } finally {
        setTransactions(dataToSet); // دائماً قم بتعيين transactions (إلى البيانات أو مصفوفة فارغة)
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, searchTerm]); // أضفت filters و searchTerm إلى مصفوفة الاعتماديات

  const columns = [
    { Header: "TX Hash", accessor: "txhash", align: "left" },
    { Header: "Sender Address", accessor: "sender_address", align: "left" },
    { Header: "Amount", accessor: "amount", align: "right" },

    { Header: "Payment Token", accessor: "payment_token", align: "left" }, // أضفت عمود منفصل لـ payment_token إذا كنت تحتاجه
    { Header: "Processed", accessor: "processed", align: "center" },
    { Header: "Received At", accessor: "received_at", align: "left" },
  ];

  // دالة createRows لا تحتاج تغيير، لكن تأكد أن الخصائص موجودة في كل عنصر transaction
  const createRows = (transaction) => ({
    txhash: transaction.txhash,
    sender_address: transaction.sender_address,
    amount: transaction.amount,

    payment_token: transaction.payment_token, // قيمة payment_token
    processed: transaction.processed ? "Yes" : "No",
    received_at: new Date(transaction.received_at).toLocaleString(),
  });

  // استخدام التحقق قبل map كإجراء وقائي إضافي
  const rows = Array.isArray(transactions) ? transactions.map(createRows) : [];

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
                    // loading={loading} // DataTable قد لا يحتاج prop اسمه loading، أو ربما يحتاجه بشكل مختلف
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
