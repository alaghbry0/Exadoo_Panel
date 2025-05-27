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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 700,
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
  maxHeight: "90vh",
  overflowY: "auto",
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

  const currentPageTable = useMemo(() => currentPageApi - 1, [currentPageApi]);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchData = useCallback(
    async (page, pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAuditLogs(page, pageSize);
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
    [showSnackbar]
  );

  useEffect(() => {
    fetchData(currentPageApi, pageSizeApi);
  }, [currentPageApi, pageSizeApi, fetchData]);

  const handleRefresh = () => {
    fetchData(currentPageApi, pageSizeApi);
    showSnackbar("تم تحديث بيانات سجل التدقيق بنجاح", "success");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenModal = (detailsObject) => {
    let parsedDetails = detailsObject;
    if (typeof detailsObject === "string") {
      try {
        parsedDetails = JSON.parse(detailsObject);
      } catch (e) {
        parsedDetails = detailsObject;
      }
    }
    setModalContent(parsedDetails);
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

  const renderDetailsSnippet = (details) => {
    // تم إزالة 'action' لأنه غير مستخدم هنا
    if (details === null || details === undefined) return "-";
    let detailsObj = details;
    if (typeof details === "string") {
      try {
        detailsObj = JSON.parse(details);
      } catch (e) {
        return (
          <MDTypography variant="caption" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {String(details).substring(0, 50)}
            {String(details).length > 50 ? "..." : ""}
          </MDTypography>
        );
      }
    }
    if (typeof detailsObj !== "object" || detailsObj === null) {
      return String(detailsObj).substring(0, 50) + (String(detailsObj).length > 50 ? "..." : "");
    }
    const keys = Object.keys(detailsObj);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstValue = String(detailsObj[firstKey]);
      return (
        <MDTypography variant="caption" noWrap>
          <strong>{firstKey}:</strong> {firstValue.substring(0, 30)}
          {firstValue.length > 30 ? "..." : ""}
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
        width: "15%",
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
        Header: "التفاصيل",
        accessor: "details",
        Cell: ({ row }) => {
          const log = row.original;
          return (
            <MDBox sx={{ maxWidth: 250, overflow: "hidden" }}>
              {renderDetailsSnippet(log.details)}{" "}
              {/* تم إزالة log.action لأنه غير مستخدم في renderDetailsSnippet */}
              <Link
                component="button"
                variant="caption"
                onClick={() => handleOpenModal(log.details)}
                sx={{ fontSize: "0.7rem", mt: 0.5, display: "block", textAlign: "right" }}
              >
                عرض التفاصيل الكاملة
              </Link>
            </MDBox>
          );
        },
        width: "25%",
      },
      { Header: "IP", accessor: "ip_address", Cell: ({ value }) => renderCellContent(value) },
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
        width: "15%",
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
        {" "}
        {/* تم تعديل الـ padding العلوي ليناسب عدم وجود Navbar */}
        <Grid container spacing={3}>
          {" "}
          {/* يمكن تعديل spacing إذا لزم الأمر */}
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} sx={{ position: "relative" }}>
                {loading && auditLogsData.length > 0 && (
                  <MDBox
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                      borderRadius: "inherit",
                    }}
                  >
                    <CircularProgress color="info" />
                  </MDBox>
                )}
                {loading && auditLogsData.length === 0 && !error && (
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    minHeight="300px"
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
                    minHeight="300px"
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
                    minHeight="300px"
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
                {typeof modalContent === "object"
                  ? JSON.stringify(modalContent, null, 2)
                  : String(modalContent)}
              </pre>
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}

export default AuditLogSection;
