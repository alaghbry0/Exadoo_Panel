// src/layouts/Users/components/UserDetailsDialog.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  useTheme,
  Paper, // For table container
  Box, // For flexible layouts
  Chip, // For status badges
} from "@mui/material";
import {
  Close,
  Add,
  ContentCopy,
  PersonOutline,
  PaymentsOutlined,
  SubscriptionsOutlined,
  ErrorOutline,
  CheckCircleOutline,
  CalendarToday, // For date icon
  AttachMoney, // For amount icon
  CreditCard, // For payment method icon
  VerifiedUser, // For status icon
  Category, // For type icon
  Source, // For source icon
} from "@mui/icons-material";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge"; // Keep for overall status badge if needed

// Helper to format dates
const formatDate = (dateString, time = true) => {
  if (!dateString) return "N/A";
  try {
    const formatString = time ? "P p" : "P"; // P for localized date, p for localized time
    return format(new Date(dateString), formatString, { locale: ar });
  } catch (error) {
    console.warn("Date formatting error:", error);
    return dateString;
  }
};

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

// --- بداية: مكون MiniTable لتحسين عرض الجداول ---
const MiniTable = ({ columns, data, emptyMessage = "لا توجد بيانات لعرضها." }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <MDBox py={3} textAlign="center">
        <MDTypography variant="body2" color="textSecondary">
          {emptyMessage}
        </MDTypography>
      </MDBox>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden", // For rounded corners on table
        mt: 1,
      }}
    >
      <MDBox
        sx={{
          display: "grid",
          gridTemplateColumns: columns.map((col) => col.width || "1fr").join(" "),
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800],
          position: "sticky", // Make header sticky
          top: 0, // Stick to the top of its scroll container
          zIndex: 1, // Ensure it's above the content
        }}
      >
        {columns.map((col) => (
          <MDTypography
            key={col.accessor}
            variant="caption"
            fontWeight="bold"
            color="textPrimary"
            p={1.5}
            sx={{
              textAlign: col.align || "right",
              borderLeft:
                col.accessor !== columns[0].accessor
                  ? `1px solid ${theme.palette.divider}`
                  : "none",
            }}
          >
            {col.Header}
          </MDTypography>
        ))}
      </MDBox>
      <MDBox sx={{ maxHeight: 280, overflowY: "auto" }}>
        {data.map((row, rowIndex) => (
          <MDBox
            key={rowIndex}
            sx={{
              display: "grid",
              gridTemplateColumns: columns.map((col) => col.width || "1fr").join(" "),
              borderBottom:
                rowIndex < data.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {columns.map((col) => (
              <MDTypography
                key={col.accessor}
                variant="caption"
                color="textSecondary"
                p={1.5}
                sx={{
                  textAlign: col.align || "right",
                  borderLeft:
                    col.accessor !== columns[0].accessor
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  display: "flex", // For centering content if needed
                  alignItems: "center", // For centering content if needed
                  justifyContent:
                    col.align === "center"
                      ? "center"
                      : col.align === "left"
                      ? "flex-start"
                      : "flex-end",
                }}
              >
                {col.Cell
                  ? col.Cell({ value: row[col.accessor], row: { original: row } })
                  : row[col.accessor] ?? "N/A"}
              </MDTypography>
            ))}
          </MDBox>
        ))}
      </MDBox>
    </Paper>
  );
};
// --- نهاية: مكون MiniTable ---

const UserDetailsDialog = ({ open, onClose, user, loading, error, onAddSubscription }) => {
  const theme = useTheme();
  const [copySuccess, setCopySuccess] = useState("");

  const handleCopy = (textToCopy, fieldName) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy.toString()).then(
      () => setCopySuccess(`${fieldName} تم نسخه!`),
      (err) => {
        console.error("Could not copy text: ", err);
        setCopySuccess(`فشل نسخ ${fieldName}.`);
      }
    );
  };

  const handleCloseSnackbar = () => setCopySuccess("");

  // --- بداية: تعريف الأعمدة للجداول ---
  const paymentColumns = useMemo(
    () => [
      { Header: "المعرف", accessor: "id", align: "right", width: "0.5fr" },
      {
        Header: "المبلغ",
        accessor: "amount",
        align: "center",
        width: "0.8fr",
        Cell: ({ value }) => {
          const amount = parseFloat(value);
          return !isNaN(amount)
            ? `$${amount.toFixed(2)}`
            : value === null || value === undefined
            ? "$0.00"
            : String(value);
        },
      },
      {
        Header: "العملة",
        accessor: "currency",
        align: "center",
        width: "0.7fr",
        Cell: ({ value }) => value || "USD",
      },
      { Header: "الطريقة", accessor: "payment_method", align: "center" },
      {
        Header: "الحالة",
        accessor: "status",
        align: "center",
        Cell: ({ value }) => (
          <Chip
            label={value === "completed" ? "مكتمل" : value === "pending" ? "قيد الانتظار" : value}
            color={value === "completed" ? "success" : value === "pending" ? "warning" : "default"}
            size="small"
            sx={{ fontSize: "0.65rem", height: "20px", padding: "0 4px" }}
          />
        ),
      },
      {
        Header: "التاريخ",
        accessor: "created_at",
        align: "left",
        width: "1.2fr",
        Cell: ({ value }) => formatDate(value, true),
      },
    ],
    []
  );

  const subscriptionColumns = useMemo(
    () => [
      { Header: "المعرف", accessor: "id", align: "right", width: "0.5fr" },
      {
        Header: "النوع",
        accessor: "subscription_type_name",
        align: "right",
        width: "1.5fr",
        Cell: ({ value }) => (
          <Tooltip title={value || "غير محدد"} placement="top">
            <MDTypography
              variant="caption"
              display="block"
              sx={{
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value || "غير محدد"}
            </MDTypography>
          </Tooltip>
        ),
      },
      {
        Header: "المصدر",
        accessor: "source",
        align: "center",
        Cell: ({ value }) => value || "N/A",
      },
      {
        Header: "تاريخ البدء",
        accessor: "start_date",
        align: "center",
        width: "1fr",
        Cell: ({ value }) => formatDate(value, false),
      },
      {
        Header: "تاريخ الانتهاء",
        accessor: "expiry_date",
        align: "center",
        width: "1fr",
        Cell: ({ value }) => formatDate(value, false),
      },
      {
        Header: "الحالة",
        accessor: "is_active",
        align: "center",
        width: "0.7fr",
        Cell: ({ value }) => (
          <Chip
            label={value ? "نشط" : "منتهي"}
            color={value ? "success" : "error"}
            size="small"
            sx={{ fontSize: "0.65rem", height: "20px", padding: "0 4px" }}
          />
        ),
      },
    ],
    []
  );
  // --- نهاية: تعريف الأعمدة للجداول ---

  // Section Wrapper Component
  const SectionWrapper = ({ title, titleIcon, children, noBorder = false, ...props }) => (
    <MDBox
      component="section"
      bgColor="transparent"
      borderRadius="lg"
      p={{ xs: 1.5, sm: 2 }}
      mb={2.5} // Increased margin bottom
      sx={{
        border: noBorder ? "none" : `1px solid ${theme.palette.divider}`,
        ...props.sx,
      }}
      {...props}
    >
      {title && (
        <MDBox
          display="flex"
          alignItems="center"
          mb={1.5} // Adjusted margin
          pb={titleIcon ? 1 : 0.5} // Adjust padding based on icon presence
          borderBottom={titleIcon ? `1px solid ${theme.palette.divider}` : "none"}
        >
          {titleIcon &&
            React.cloneElement(titleIcon, {
              sx: { mr: 1, color: "info.main", fontSize: "1.3rem" }, // Slightly larger icon
            })}
          <MDTypography variant="h6" fontWeight="medium" color="textPrimary">
            {title}
          </MDTypography>
        </MDBox>
      )}
      {children}
    </MDBox>
  );

  // Data Row Component - Refined for better alignment and readability
  const DataRow = ({ label, value, onCopy, copyValue, sx, valueVariant = "body2" }) => (
    <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" py={0.85} sx={sx}>
      <MDTypography
        variant="caption"
        color="textSecondary"
        fontWeight="regular" // Changed from bold
        sx={{ minWidth: { xs: "90px", sm: "120px" }, mr: 1, lineHeight: 1.6 }}
      >
        {label}:
      </MDTypography>
      <MDBox
        sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}
      >
        <MDTypography
          variant={valueVariant}
          fontWeight="regular" // Changed from medium
          color="textPrimary"
          sx={{
            wordBreak: "break-all", // Allow long words to break
            textAlign: "right",
            lineHeight: 1.6,
            whiteSpace: typeof value === "string" && value.length > 50 ? "normal" : "nowrap", // Allow wrapping for long strings
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value !== null && value !== undefined && value !== "" ? (
            typeof value === "boolean" ? (
              <Chip
                label={value ? "نعم" : "لا"}
                size="small"
                color={value ? "success" : "default"}
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            ) : (
              value
            )
          ) : (
            <MDTypography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
              غير متوفر
            </MDTypography>
          )}
        </MDTypography>
        {onCopy && value && (typeof value === "string" || typeof value === "number") && (
          <Tooltip title="نسخ" placement="top">
            <IconButton
              size="small"
              onClick={() => onCopy(copyValue || value.toString(), label)}
              sx={{ p: 0.25, mr: -0.5, ml: 0.5, color: "text.secondary", opacity: 0.7 }}
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
        PaperProps={{ sx: { maxHeight: "95vh", borderRadius: "lg", overflowY: "hidden" } }} // borderRadius lg
      >
        <MuiDialogTitle
          sx={{
            p: 2,
            m: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="bold" color="dark">
              {" "}
              {/* h5 for more prominence */}
              تفاصيل المستخدم
            </MDTypography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="إغلاق"
              sx={{ mr: -1 }} // Adjusted margin
            >
              <Close />
            </IconButton>
          </MDBox>
        </MuiDialogTitle>

        <MuiDialogContent
          dividers={false} // Remove internal dividers, use SectionWrapper border
          sx={{
            p: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.default, // Lighter background
            overflowY: "auto", // Ensure content itself is scrollable
          }}
        >
          {loading ? (
            <MDBox
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              minHeight="300px"
            >
              <CircularProgress color="info" size={40} />
              <MDTypography variant="body1" color="textSecondary" mt={2}>
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
              <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
              <MDTypography color="error" variant="h6" gutterBottom>
                خطأ في تحميل البيانات
              </MDTypography>
              <MDTypography color="textSecondary" variant="body2">
                {typeof error === "string" ? error : "لم نتمكن من جلب تفاصيل المستخدم."}
              </MDTypography>
              <MDButton variant="outlined" color="info" onClick={onClose} sx={{ mt: 2 }}>
                إغلاق
              </MDButton>
            </MDBox>
          ) : user ? (
            <Box>
              {" "}
              {/* Changed from <> to Box to allow sx if needed */}
              {/* User Header Info */}
              <MDBox
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }} // Stack on small screens
                alignItems={{ xs: "center", sm: "flex-start" }}
                textAlign={{ xs: "center", sm: "right" }} // Text align for header
                mb={3}
                p={2}
                borderRadius="lg" // Use 'lg' from theme
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                  color: theme.palette.info.contrastText,
                  boxShadow: theme.shadows[3],
                }}
              >
                <MDAvatar
                  src={user.profile_photo_url || undefined}
                  alt={user.full_name || user.username}
                  size="xl" // Larger avatar
                  shadow="md"
                  sx={{
                    mr: { sm: 2.5 }, // Margin right on sm and up
                    mb: { xs: 1.5, sm: 0 }, // Margin bottom on xs only
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: `2px solid ${theme.palette.info.contrastText}`,
                  }}
                >
                  {getInitials(
                    user.full_name ||
                      user.username ||
                      (user.telegram_id ? user.telegram_id.toString() : "U")
                  )}
                </MDAvatar>
                <MDBox flexGrow={1} mt={{ xs: 1, sm: 0.5 }}>
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: "inherit" }}
                  >
                    {user.full_name || "مستخدم غير مسمى"}
                    {user.is_verified && (
                      <Tooltip title="حساب موثق">
                        <CheckCircleOutline
                          sx={{
                            fontSize: "1.2rem",
                            color: theme.palette.success.light, // Brighter green
                            ml: 0.75,
                            verticalAlign: "middle",
                          }}
                        />
                      </Tooltip>
                    )}
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    sx={{ opacity: 0.8, color: "inherit" }}
                    gutterBottom
                  >
                    {user.username ? `@${user.username}` : "لا يوجد اسم مستخدم"}
                  </MDTypography>
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent={{ xs: "center", sm: "flex-start" }}
                    mt={0.5}
                  >
                    <MDTypography variant="caption" sx={{ color: "inherit", opacity: 0.9 }}>
                      المعرف: {user.telegram_id}
                    </MDTypography>
                    <Tooltip title="نسخ المعرف" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(user.telegram_id.toString(), "معرف المستخدم")}
                        sx={{ p: 0.25, mr: -0.5, ml: 0.5, color: "inherit", opacity: 0.7 }}
                      >
                        <ContentCopy sx={{ fontSize: "0.875rem" }} />
                      </IconButton>
                    </Tooltip>
                  </MDBox>
                </MDBox>
              </MDBox>
              <SectionWrapper title="المعلومات الأساسية" titleIcon={<PersonOutline />}>
                <Grid container columnSpacing={{ xs: 1, sm: 2.5 }} rowSpacing={{ xs: 0, sm: 0.5 }}>
                  {" "}
                  {/* Reduced row spacing */}
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
                        <Chip
                          label={user.is_banned ? "محظور" : "نشط"}
                          color={user.is_banned ? "error" : "success"}
                          size="small"
                          icon={
                            user.is_banned ? (
                              <ErrorOutline fontSize="inherit" />
                            ) : (
                              <CheckCircleOutline fontSize="inherit" />
                            )
                          }
                          sx={{ height: 22, fontSize: "0.75rem", padding: "0 6px" }}
                        />
                      }
                    />
                  </Grid>
                  {user.is_banned && user.ban_reason && (
                    <Grid item xs={12}>
                      <DataRow
                        label="سبب الحظر"
                        value={user.ban_reason}
                        sx={{ "& .MuiTypography-body2": { whiteSpace: "normal" } }}
                      />
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
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "md",
                      }}
                    >
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="button" color="textSecondary">
                          إجمالي المدفوعات:
                        </MDTypography>
                        <MDTypography variant="h6" color="info.main" fontWeight="bold">
                          ${(user.payment_stats?.total_payments || 0).toFixed(2)}
                        </MDTypography>
                      </MDBox>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "md",
                      }}
                    >
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="button" color="textSecondary">
                          عدد المدفوعات:
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold">
                          {user.payment_stats?.payment_count || 0}
                        </MDTypography>
                      </MDBox>
                    </Paper>
                  </Grid>
                </Grid>
                <MDTypography
                  variant="subtitle2"
                  color="textSecondary"
                  display="block"
                  mt={2.5}
                  mb={1}
                  fontWeight="medium"
                >
                  آخر المدفوعات
                </MDTypography>
                <MiniTable
                  columns={paymentColumns}
                  data={user.recent_payments || []}
                  emptyMessage="لا توجد مدفوعات مسجلة لهذا المستخدم."
                />
              </SectionWrapper>
              <SectionWrapper
                title={`الاشتراكات (${user.subscriptions?.length || 0})`}
                titleIcon={<SubscriptionsOutlined />}
              >
                <MiniTable
                  columns={subscriptionColumns}
                  data={(user.subscriptions || []).sort(
                    (a, b) => new Date(b.expiry_date) - new Date(a.expiry_date)
                  )}
                  emptyMessage="لا توجد اشتراكات لهذا المستخدم."
                />
              </SectionWrapper>
            </Box>
          ) : (
            <MDBox
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <PersonOutline sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
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
            backgroundColor: theme.palette.background.paper, // Consistent background
            display: "flex",
            justifyContent: "space-between", // Space out buttons
          }}
        >
          <MDButton onClick={onClose} color="secondary" variant="text">
            إغلاق
          </MDButton>
          {user &&
            !loading &&
            !error && ( // Only show if user data is loaded and no error
              <MDButton
                onClick={onAddSubscription}
                color="info"
                variant="gradient"
                startIcon={<Add />}
                sx={{ boxShadow: theme.shadows[2], "&:hover": { boxShadow: theme.shadows[4] } }}
              >
                إضافة اشتراك
              </MDButton>
            )}
        </MuiDialogActions>
      </Dialog>

      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2500} // Slightly longer
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: theme.palette.success.main, // Use theme color
            color: theme.palette.success.contrastText,
            textAlign: "center",
            borderRadius: "sm", // Rounded snackbar
            boxShadow: theme.shadows[3],
          },
        }}
        // message={copySuccess} // Removed to use Alert for icon
      >
        <MDBox display="flex" alignItems="center" color="white">
          <CheckCircleOutline sx={{ mr: 1, fontSize: "1.2rem" }} />
          <MDTypography variant="button" fontWeight="medium" color="inherit">
            {copySuccess}
          </MDTypography>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
            sx={{ ml: 2 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </MDBox>
      </Snackbar>
    </>
  );
};

export default UserDetailsDialog;
