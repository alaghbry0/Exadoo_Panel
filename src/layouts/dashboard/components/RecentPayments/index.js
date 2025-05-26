// src/layouts/dashboard/components/RecentPayments/index.js

import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// API Service
import { getRecentPayments } from "services/api.js";

function RecentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  useEffect(() => {
    loadRecentPayments();
  }, []);

  const loadRecentPayments = async () => {
    try {
      setLoading(true);
      const data = await getRecentPayments(10);
      setPayments(data);
    } catch (error) {
      console.error("Error loading recent payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // تحديد لون حالة الدفع
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "canceled":
        return "secondary";
      default:
        return "info";
    }
  };

  // تحديد نص حالة الدفع
  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "pending":
        return "معلق";
      case "failed":
        return "فاشل";
      case "canceled":
        return "ملغي";
      case "underpaid":
        return "مدفوع جزئياً";
      default:
        return status;
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // إعداد بيانات الجدول
  const columns = [
    { Header: "المستخدم", accessor: "user", width: "30%", align: "left" },
    { Header: "المبلغ", accessor: "amount", align: "center" },
    { Header: "الخطة", accessor: "plan", align: "center" },
    { Header: "الحالة", accessor: "status", align: "center" },
    { Header: "التاريخ", accessor: "date", align: "center" },
  ];

  const rows = payments.map((payment) => ({
    user: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDBox ml={0} lineHeight={1}>
          <MDTypography variant="button" fontWeight="medium">
            {payment.full_name || payment.username || `المستخدم ${payment.id}`}
          </MDTypography>
          {payment.username && (
            <MDTypography variant="caption" color="text">
              @{payment.username}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    ),
    amount: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
      </MDTypography>
    ),
    plan: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {payment.plan_name || "غير محدد"}
      </MDTypography>
    ),
    status: (
      <Chip
        label={getStatusText(payment.status)}
        color={getStatusColor(payment.status)}
        size="small"
        variant="filled"
      />
    ),
    date: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatDate(payment.created_at)}
      </MDTypography>
    ),
  }));

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem
        onClick={() => {
          loadRecentPayments();
          closeMenu();
        }}
      >
        تحديث البيانات
      </MenuItem>
      <MenuItem onClick={closeMenu}>عرض جميع المدفوعات</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            المدفوعات الحديثة
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { success } }) => success.main,
                mt: -0.5,
              }}
            >
              payments
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{payments.length}</strong> مدفوعات حديثة
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        {loading ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="button" color="text">
              جاري التحميل...
            </MDTypography>
          </MDBox>
        ) : payments.length === 0 ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="button" color="text">
              لا توجد مدفوعات حديثة
            </MDTypography>
          </MDBox>
        ) : (
          <DataTable
            table={{ columns, rows }}
            showTotalEntries={false}
            isSorted={false}
            noEndBorder
            entriesPerPage={false}
          />
        )}
      </MDBox>
    </Card>
  );
}

export default RecentPayments;
