// AuditLogSection.js
import React, { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { getAuditLogs } from "services/api";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Modal from "@mui/material/Modal";
import MDButton from "components/MDButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const modalStyle = {
  /* ... كما لديك ... */
};

const INITIAL_PAGE_SIZE_AUDIT = 10;

function AuditLogSection() {
  const [auditLogsData, setAuditLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPageApi, setCurrentPageApi] = useState(1);
  const [pageSizeApi, setPageSizeApi] = useState(INITIAL_PAGE_SIZE_AUDIT);

  // --- فلاتر ---
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [resourceIdFilter, setResourceIdFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [hasChangedFilter, setHasChangedFilter] = useState(""); // "", "true", "false"

  const currentPageTable = useMemo(() => currentPageApi - 1, [currentPageApi]);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const buildFiltersObj = () => {
    const f = {};
    if (userEmailFilter) f.user_email = userEmailFilter;
    if (actionFilter) f.action = actionFilter;
    if (resourceFilter) f.resource = resourceFilter;
    if (resourceIdFilter) f.resource_id = resourceIdFilter;
    if (fromDateFilter) f.from_date = fromDateFilter;
    if (toDateFilter) f.to_date = toDateFilter;
    if (hasChangedFilter) f.has_changed_fields = hasChangedFilter;
    return f;
  };

  const fetchData = useCallback(
    async (page, pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const filters = buildFiltersObj();
        const response = await getAuditLogs(page, pageSize, filters);
        if (response && response.data) {
          setAuditLogsData(response.data.logs || []);
          setTotalRecords(response.data.pagination?.total || 0);
        } else {
          showSnackbar("لم يتم استلام بيانات صحيحة من الخادم", "warning");
          setAuditLogsData([]);
          setTotalRecords(0);
        }
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          "فشل في تحميل سجلات التدقيق.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        setAuditLogsData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [
      showSnackbar,
      userEmailFilter,
      actionFilter,
      resourceFilter,
      resourceIdFilter,
      fromDateFilter,
      toDateFilter,
      hasChangedFilter,
    ]
  );

  useEffect(() => {
    fetchData(currentPageApi, pageSizeApi);
  }, [currentPageApi, pageSizeApi, fetchData]);

  const handleSearch = () => {
    setCurrentPageApi(1);
    fetchData(1, pageSizeApi);
  };

  const handleClearFilters = () => {
    setUserEmailFilter("");
    setActionFilter("");
    setResourceFilter("");
    setResourceIdFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    setHasChangedFilter("");
    setCurrentPageApi(1);
    fetchData(1, pageSizeApi);
  };

  const handleRefresh = () => {
    fetchData(currentPageApi, pageSizeApi);
    showSnackbar("تم تحديث بيانات سجل التدقيق بنجاح", "success");
  };

  const handleOpenModal = (detailsObject, fullUrl = null, before = null, after = null) => {
    // إذا كان detailsObject عبارة عن مقتطف أو كائن يشير إلى رابط خارجي، نحاول جلبه عند الحاجة
    let parsedDetails = detailsObject;
    if (typeof detailsObject === "string") {
      try {
        parsedDetails = JSON.parse(detailsObject);
      } catch (e) {
        parsedDetails = detailsObject;
      }
    }
    setModalContent({ details: parsedDetails, external_url: fullUrl, before, after });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent(null);
  };

  const handlePageChange = (newPageTable) => {
    setCurrentPageApi(newPageTable + 1);
  };

  const handleEntriesPerPageChange = (newPageSize) => {
    setPageSizeApi(newPageSize);
    setCurrentPageApi(1);
  };

  const renderCellContent = (content, placeholder = "-") => content || placeholder;

  // snippet for details - unchanged mostly, but show external link
  const renderDetailsSnippet = (details) => {
    if (details === null || details === undefined) return "-";
    let detailsObj = details;
    if (typeof details === "string") {
      try {
        detailsObj = JSON.parse(details);
      } catch (e) {
        return (
          <MDTypography variant="caption" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {String(details).substring(0, 80)}
            {String(details).length > 80 ? "..." : ""}
          </MDTypography>
        );
      }
    }
    if (typeof detailsObj !== "object" || detailsObj === null) {
      return String(detailsObj).substring(0, 80) + (String(detailsObj).length > 80 ? "..." : "");
    }
    // external link case
    if (detailsObj._external_link) {
      return (
        <MDTypography variant="caption" noWrap>
          External JSON:{" "}
          <Link
            component="button"
            variant="caption"
            onClick={() => handleOpenModal(detailsObj, detailsObj._external_link)}
          >
            فتح الملف
          </Link>
        </MDTypography>
      );
    }
    const keys = Object.keys(detailsObj);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstValue = String(detailsObj[firstKey]);
      return (
        <MDTypography variant="caption" noWrap>
          <strong>{firstKey}:</strong> {firstValue.substring(0, 40)}
          {firstValue.length > 40 ? "..." : ""}
        </MDTypography>
      );
    }
    return <MDTypography variant="caption">لا يوجد تفاصيل مقتضبة</MDTypography>;
  };

  const tableColumns = useMemo(
    () => [
      {
        Header: "الوقت والتاريخ",
        accessor: "created_at",
        Cell: ({ value }) =>
          value
            ? new Date(value).toLocaleString("ar-EG", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "-",
        width: "14%",
      },
      {
        Header: "المستخدم",
        accessor: "user_display_identifier",
        Cell: ({ value }) => renderCellContent(value),
      },
      {
        Header: "الإجراء",
        accessor: "action",
        Cell: ({ value }) => (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {renderCellContent(value)}
          </MDTypography>
        ),
      },
      { Header: "المورد", accessor: "resource", Cell: ({ value }) => renderCellContent(value) },
      {
        Header: "معرف المورد",
        accessor: "resource_id",
        Cell: ({ value }) => renderCellContent(value),
      },
      {
        Header: "التغييرات",
        accessor: "changed_summary",
        Cell: ({ value }) => (
          <MDTypography
            variant="caption"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 220,
            }}
          >
            {value || "-"}
          </MDTypography>
        ),
        width: "20%",
      },
      {
        Header: "التفاصيل",
        accessor: "details",
        Cell: ({ row }) => {
          const log = row.original;
          return (
            <MDBox sx={{ maxWidth: 260, overflow: "hidden" }}>
              {renderDetailsSnippet(log.details)}{" "}
              <Link
                component="button"
                variant="caption"
                onClick={() =>
                  handleOpenModal(log.details, log.external_url, log.before, log.after)
                }
                sx={{ fontSize: "0.7rem", mt: 0.5, display: "block", textAlign: "right" }}
              >
                عرض التفاصيل الكاملة
              </Link>
            </MDBox>
          );
        },
        width: "24%",
      },
      {
        Header: "IP",
        accessor: "ip_address",
        Cell: ({ value }) => renderCellContent(value),
        width: "8%",
      },
      {
        Header: "User Agent",
        accessor: "user_agent",
        Cell: ({ value }) =>
          value ? (
            <Tooltip title={value} placement="top-start">
              <MDTypography
                variant="caption"
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "150px",
                }}
              >
                {value}
              </MDTypography>
            </Tooltip>
          ) : (
            "-"
          ),
        width: "12%",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const tableRows = useMemo(() => {
    if (!Array.isArray(auditLogsData)) return [];
    return auditLogsData;
  }, [auditLogsData]);

  const pageCount = Math.ceil(totalRecords / pageSizeApi);

  return (
    <Fragment>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
          <Grid item xs={12} md={10}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <TextField
                label="بريد المستخدم"
                value={userEmailFilter}
                onChange={(e) => setUserEmailFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="الإجراء"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="المورد"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="معرّف المورد"
                value={resourceIdFilter}
                onChange={(e) => setResourceIdFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="من تاريخ (YYYY-MM-DD)"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="إلى تاريخ (YYYY-MM-DD)"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                size="small"
              />
              <TextField
                label="Has Changes (true/false)"
                value={hasChangedFilter}
                onChange={(e) => setHasChangedFilter(e.target.value)}
                size="small"
              />
              <Button variant="contained" color="info" onClick={handleSearch}>
                بحث
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
                مسح
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: "right" }}>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} sx={{ position: "relative" }}>
                {loading && auditLogsData.length === 0 && !error && (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="200px"
                  >
                    <CircularProgress color="info" />
                    <MDTypography variant="body2" color="text" ml={2}>
                      جارِ تحميل السجلات...
                    </MDTypography>
                  </MDBox>
                )}
                {!loading && error && (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="200px"
                  >
                    <MDTypography variant="h6" color="error">
                      {error}
                    </MDTypography>
                  </MDBox>
                )}
                {!loading && !error && auditLogsData.length === 0 && (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="200px"
                  >
                    <MDTypography variant="h6" color="textSecondary">
                      لا توجد سجلات تدقيق لعرضها.
                    </MDTypography>
                  </MDBox>
                )}
                {!loading && !error && auditLogsData.length > 0 && (
                  <DataTable
                    table={{ columns: tableColumns, rows: tableRows }}
                    isSorted={false}
                    entriesPerPage={{ defaultValue: pageSizeApi, options: [10, 25, 50, 100] }}
                    showTotalEntries={totalRecords > 0 && tableRows.length > 0}
                    noEndBorder
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "info" }}
                    manualPagination
                    pageCount={pageCount > 0 ? pageCount : 1}
                    page={currentPageTable}
                    onPageChange={handlePageChange}
                    onEntriesPerPageChange={handleEntriesPerPageChange}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="details-modal-title">
        <MDBox sx={modalStyle}>
          <MDTypography id="details-modal-title" variant="h6" component="h2" mb={2}>
            التفاصيل الكاملة للسجل
          </MDTypography>
          {modalContent && (
            <MDBox
              sx={{
                background: "#f8f9fa",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "calc(90vh - 150px)",
                overflowY: "auto",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  fontSize: "0.85rem",
                  margin: 0,
                  textAlign: "left",
                  direction: "ltr",
                }}
              >
                {modalContent.external_url
                  ? `البيانات مخزّنة خارجيًا: ${modalContent.external_url}\n\n` +
                    (modalContent.details && typeof modalContent.details === "object"
                      ? JSON.stringify(modalContent.details, null, 2)
                      : String(modalContent.details))
                  : modalContent.details && typeof modalContent.details === "object"
                  ? JSON.stringify(modalContent.details, null, 2)
                  : String(modalContent.details)}
              </pre>
              {modalContent.external_url && (
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <MDButton
                    component="a"
                    href={modalContent.external_url}
                    target="_blank"
                    rel="noreferrer"
                    variant="contained"
                  >
                    فتح الملف الخارجي
                  </MDButton>
                </Box>
              )}
            </MDBox>
          )}
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton onClick={handleCloseModal} variant="contained" color="info">
              إغلاق
            </MDButton>
          </MDBox>
        </MDBox>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}

export default AuditLogSection;
