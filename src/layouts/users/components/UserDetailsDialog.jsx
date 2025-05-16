// src/layouts/Users/components/UserDetailsDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Grid,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar,
  useTheme, // Import useTheme to access theme object
} from "@mui/material";
import {
  Close,
  Add,
  ContentCopy,
  PersonOutline,
  PaymentsOutlined,
  SubscriptionsOutlined,
  ErrorOutline, // For error icon
} from "@mui/icons-material";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Helper to format dates
const formatDate = (dateString, time = true) => {
  if (!dateString) return null; // Return null to be handled by DataRow or other components
  try {
    const formatString = time ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd";
    return format(new Date(dateString), formatString, { locale: ar });
  } catch (error) {
    console.warn("Date formatting error:", error);
    return dateString; // Return original if formatting fails
  }
};

// Helper for table cell styles
const getCommonCellStyles = (isHeader = false, theme) => ({
  py: isHeader ? 1.25 : 0.75,
  px: 1.5,
  fontSize: "0.75rem", // Slightly smaller for more data
  borderBottom: `1px solid ${theme.palette.divider}`,
  textAlign: "right",
  whiteSpace: "nowrap",
  "&:first-of-type": {
    paddingRight: 2,
  },
  "&:last-of-type": {
    paddingLeft: 2,
  },
});

// Component to get initials for Avatar
const getInitials = (name) => {
  if (!name) return "?";
  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  return "?";
};

const UserDetailsDialog = ({ open, onClose, user, loading, error, onAddSubscription }) => {
  const theme = useTheme(); // Access theme
  const [copySuccess, setCopySuccess] = useState("");

  const handleCopy = (textToCopy, fieldName) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy.toString()).then(
      () => {
        setCopySuccess(`${fieldName} تم نسخه!`);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setCopySuccess(`فشل نسخ ${fieldName}.`);
      }
    );
  };

  const handleCloseSnackbar = () => {
    setCopySuccess("");
  };

  // Section Wrapper Component
  const SectionWrapper = ({ title, titleIcon, children, ...props }) => (
    <MDBox
      component="section"
      bgColor="transparent" // Or "grey-100" for distinct sections
      borderRadius="lg"
      // shadow="xs" // Removed for a flatter design within the dialog
      p={{ xs: 1, sm: 1.5 }} // Reduced padding slightly
      mb={2}
      sx={{ border: `1px solid ${theme.palette.grey[200]}`, ...props.sx }}
      {...props}
    >
      {title && (
        <MDBox
          display="flex"
          alignItems="center"
          mb={1.5}
          pb={1}
          borderBottom={`1px solid ${theme.palette.divider}`}
        >
          {titleIcon &&
            React.cloneElement(titleIcon, {
              sx: { mr: 1, color: "info.main", fontSize: "1.25rem" },
            })}
          <MDTypography
            variant="h6"
            fontWeight="medium"
            color="textPrimary"
            sx={{ fontSize: "1rem" }}
          >
            {title}
          </MDTypography>
        </MDBox>
      )}
      {children}
    </MDBox>
  );

  // Data Row Component
  const DataRow = ({ label, value, onCopy, copyValue, sx }) => (
    <MDBox display="flex" alignItems="flex-start" py={0.75} sx={sx}>
      <MDTypography
        variant="caption"
        color="textSecondary"
        fontWeight="regular"
        sx={{ minWidth: { xs: "80px", sm: "110px" }, mr: 1.5, lineHeight: 1.8 }}
      >
        {label}:
      </MDTypography>
      <MDBox sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <MDTypography
          variant="button" // Using button for slightly bolder text
          fontWeight="medium"
          color="textPrimary"
          sx={{
            wordBreak: "break-word",
            textAlign: "right", // For RTL consistency of value itself
            lineHeight: 1.8,
          }}
        >
          {value !== null && value !== undefined && value !== "" ? (
            typeof value === "boolean" ? (
              value ? (
                "نعم"
              ) : (
                "لا"
              )
            ) : (
              value
            )
          ) : (
            <MDTypography variant="caption" color="text.disabled">
              غير متوفر
            </MDTypography>
          )}
        </MDTypography>
        {onCopy && value && (typeof value === "string" || typeof value === "number") && (
          <Tooltip title="نسخ" placement="top">
            <IconButton
              size="small"
              onClick={() => onCopy(copyValue || value.toString(), label)}
              sx={{ p: 0.25, ml: 0.5, color: "text.secondary" }}
            >
              <ContentCopy sx={{ fontSize: "0.875rem" }} />
            </IconButton>
          </Tooltip>
        )}
      </MDBox>
    </MDBox>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        dir="rtl"
        PaperProps={{ sx: { maxHeight: "90vh", borderRadius: "md" } }}
      >
        <MuiDialogTitle sx={{ p: 2, m: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="bold" color="dark">
              {" "}
              {/* h6 as in SubscriptionFormModal */}
              تفاصيل المستخدم
            </MDTypography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="إغلاق"
              sx={{ mr: -1.5 }}
            >
              <Close />
            </IconButton>
          </MDBox>
        </MuiDialogTitle>

        <MuiDialogContent
          dividers
          sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: theme.palette.background.default }}
        >
          {loading ? (
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={{ xs: "200px", sm: "300px" }}
            >
              <CircularProgress color="info" size={40} />
              <MDTypography variant="body2" color="textSecondary" ml={2}>
                جاري تحميل البيانات...
              </MDTypography>
            </MDBox>
          ) : error ? (
            <MDBox
              p={3}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
              textAlign="center"
            >
              <ErrorOutline sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <MDTypography color="error" variant="h6" gutterBottom>
                خطأ في تحميل البيانات
              </MDTypography>
              <MDTypography color="text.secondary" variant="body2">
                {typeof error === "string"
                  ? error
                  : "لم نتمكن من جلب تفاصيل المستخدم. يرجى المحاولة مرة أخرى."}
              </MDTypography>
            </MDBox>
          ) : user ? (
            <>
              {/* User Header Info */}
              <MDBox
                display="flex"
                alignItems="center"
                mb={2.5}
                p={2}
                borderRadius="md"
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[900],
                }}
              >
                <MDAvatar
                  src={user.profile_photo_url || undefined}
                  alt={user.full_name || user.username}
                  size="lg"
                  shadow="sm"
                  sx={{ mr: 2, bgcolor: "info.light", color: "info.contrastText" }}
                >
                  {getInitials(
                    user.full_name ||
                      user.username ||
                      (user.telegram_id ? user.telegram_id.toString() : "U")
                  )}
                </MDAvatar>
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium">
                    {user.full_name || "مستخدم غير مسمى"}
                    {user.is_verified && (
                      <Tooltip title="حساب موثق">
                        <CheckCircleOutline
                          sx={{
                            fontSize: "1rem",
                            color: "success.main",
                            ml: 0.5,
                            verticalAlign: "middle",
                          }}
                        />
                      </Tooltip>
                    )}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary">
                    {user.username ? `@${user.username}` : "لا يوجد اسم مستخدم"}
                  </MDTypography>
                  <DataRow
                    label="المعرف"
                    value={user.telegram_id}
                    onCopy={handleCopy}
                    sx={{ py: 0.25, "& .MuiTypography-caption": { minWidth: "40px !important" } }}
                  />
                </MDBox>
              </MDBox>

              <SectionWrapper title="المعلومات الأساسية" titleIcon={<PersonOutline />}>
                <Grid container columnSpacing={{ xs: 0, sm: 2 }} rowSpacing={0}>
                  <Grid item xs={12} md={6}>
                    <DataRow label="تاريخ التسجيل" value={formatDate(user.created_at, true)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DataRow label="آخر ظهور" value={formatDate(user.last_seen_at, true)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DataRow label="لغة المستخدم" value={user.language_code} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DataRow
                      label="الحالة"
                      value={
                        user.is_banned ? (
                          <MDBadge badgeContent="محظور" color="error" size="sm" container />
                        ) : (
                          <MDBadge badgeContent="نشط" color="success" size="sm" container />
                        )
                      }
                    />
                  </Grid>
                  {user.is_banned && user.ban_reason && (
                    <Grid item xs={12}>
                      <DataRow label="سبب الحظر" value={user.ban_reason} />
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <DataRow
                      label="عنوان المحفظة"
                      value={user.wallet_address}
                      onCopy={user.wallet_address ? handleCopy : undefined}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DataRow
                      label="محفظة TON"
                      value={user.ton_wallet_address}
                      onCopy={user.ton_wallet_address ? handleCopy : undefined}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DataRow label="تطبيق المحفظة" value={user.wallet_app} />
                  </Grid>
                </Grid>
              </SectionWrapper>

              <SectionWrapper title="المدفوعات والإحصائيات" titleIcon={<PaymentsOutlined />}>
                <Grid container spacing={2} mb={user.recent_payments?.length > 0 ? 2 : 0}>
                  <Grid item xs={12} sm={6}>
                    <MDBox
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={1.5}
                      borderRadius="md"
                      sx={{ border: `1px solid ${theme.palette.grey[300]}` }}
                    >
                      <MDTypography variant="button" color="textSecondary">
                        إجمالي المدفوعات:{" "}
                      </MDTypography>
                      <MDTypography variant="subtitle2" color="info.main" fontWeight="bold">
                        ${(user.payment_stats?.total_payments || 0).toFixed(2)}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDBox
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={1.5}
                      borderRadius="md"
                      sx={{ border: `1px solid ${theme.palette.grey[300]}` }}
                    >
                      <MDTypography variant="button" color="textSecondary">
                        عدد المدفوعات:{" "}
                      </MDTypography>
                      <MDTypography variant="subtitle2" fontWeight="bold">
                        {user.payment_stats?.payment_count || 0}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>

                {user.recent_payments && user.recent_payments.length > 0 ? (
                  <>
                    <MDTypography
                      variant="overline"
                      color="textSecondary"
                      display="block"
                      mt={2}
                      mb={1}
                    >
                      آخر المدفوعات
                    </MDTypography>
                    <TableContainer
                      component={MDBox}
                      borderRadius="md"
                      sx={{ maxHeight: 280, border: `1px solid ${theme.palette.divider}` }}
                    >
                      <Table size="small" stickyHeader aria-label="جدول المدفوعات الأخيرة">
                        <TableHead sx={{ backgroundColor: theme.palette.grey[200] }}>
                          <TableRow>
                            {["المعرف", "المبلغ", "العملة", "الطريقة", "الحالة", "التاريخ"].map(
                              (header) => (
                                <TableCell
                                  key={header}
                                  sx={{ ...getCommonCellStyles(true, theme), fontWeight: "bold" }}
                                >
                                  {header}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {user.recent_payments.map((payment) => {
                            const amount = parseFloat(payment.amount); // أو Number(payment.amount)
                            return (
                              <TableRow
                                key={payment.id}
                                hover
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                              >
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  {payment.id}
                                </TableCell>
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  {!isNaN(amount)
                                    ? amount.toFixed(2)
                                    : payment.amount === null || payment.amount === undefined
                                    ? "0.00"
                                    : String(payment.amount)}
                                </TableCell>
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  {payment.currency || "USD"}
                                </TableCell>
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  {payment.payment_method}
                                </TableCell>
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  <MDBadge
                                    badgeContent={
                                      payment.status === "completed"
                                        ? "مكتمل"
                                        : payment.status === "pending"
                                        ? "قيد الانتظار"
                                        : payment.status
                                    }
                                    color={
                                      payment.status === "completed"
                                        ? "success"
                                        : payment.status === "pending"
                                        ? "warning"
                                        : "default"
                                    }
                                    size="xs"
                                    container
                                  />
                                </TableCell>
                                <TableCell sx={getCommonCellStyles(false, theme)}>
                                  {formatDate(payment.created_at)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <MDBox py={2} textAlign="center">
                    <MDTypography color="text.disabled" variant="body2">
                      لا توجد مدفوعات مسجلة لهذا المستخدم.
                    </MDTypography>
                  </MDBox>
                )}
              </SectionWrapper>

              <SectionWrapper
                title={`الاشتراكات (${user.subscriptions?.length || 0})`}
                titleIcon={<SubscriptionsOutlined />}
              >
                {user.subscriptions && user.subscriptions.length > 0 ? (
                  <TableContainer
                    component={MDBox}
                    borderRadius="md"
                    sx={{ maxHeight: 280, border: `1px solid ${theme.palette.divider}` }}
                  >
                    <Table size="small" stickyHeader aria-label="جدول الاشتراكات">
                      <TableHead sx={{ backgroundColor: theme.palette.grey[200] }}>
                        <TableRow>
                          {[
                            "المعرف",
                            "النوع",
                            "المصدر",
                            "تاريخ البدء",
                            "تاريخ الانتهاء",
                            "الحالة",
                          ].map((header) => (
                            <TableCell
                              key={header}
                              sx={{ ...getCommonCellStyles(true, theme), fontWeight: "bold" }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {user.subscriptions
                          .sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date))
                          .map((sub) => (
                            <TableRow
                              key={sub.id}
                              hover
                              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                              <TableCell sx={getCommonCellStyles(false, theme)}>{sub.id}</TableCell>
                              <TableCell
                                sx={{
                                  ...getCommonCellStyles(false, theme),
                                  minWidth: "120px",
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                }}
                              >
                                <Tooltip title={sub.subscription_type_name || "غير محدد"}>
                                  <MDTypography variant="caption" display="block">
                                    {sub.subscription_type_name || "غير محدد"}
                                  </MDTypography>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={getCommonCellStyles(false, theme)}>
                                {sub.source || "N/A"}
                              </TableCell>
                              <TableCell sx={getCommonCellStyles(false, theme)}>
                                {formatDate(sub.start_date, false)}
                              </TableCell>
                              <TableCell sx={getCommonCellStyles(false, theme)}>
                                {formatDate(sub.expiry_date, false)}
                              </TableCell>
                              <TableCell sx={getCommonCellStyles(false, theme)}>
                                <MDBadge
                                  badgeContent={sub.is_active ? "نشط" : "منتهي"}
                                  color={sub.is_active ? "success" : "secondary"}
                                  size="xs"
                                  container
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <MDBox py={2} textAlign="center">
                    <MDTypography color="text.disabled" variant="body2">
                      لا توجد اشتراكات لهذا المستخدم.
                    </MDTypography>
                  </MDBox>
                )}
              </SectionWrapper>
            </>
          ) : (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <MDTypography color="text.disabled" variant="h6">
                لا يوجد مستخدم محدد لعرض التفاصيل.
              </MDTypography>
            </MDBox>
          )}
        </MuiDialogContent>

        <MuiDialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800],
          }}
        >
          <MDButton onClick={onClose} color="secondary" variant="text">
            إغلاق
          </MDButton>
          {user && (
            <MDButton
              onClick={onAddSubscription}
              color="info"
              variant="gradient"
              startIcon={<Add />}
            >
              إضافة اشتراك
            </MDButton>
          )}
        </MuiDialogActions>
      </Dialog>

      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={copySuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            textAlign: "center",
          },
        }}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default UserDetailsDialog;
