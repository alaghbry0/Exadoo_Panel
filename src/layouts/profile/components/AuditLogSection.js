// AuditLogSection.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Tooltip,
  Card,
  Link,
  Modal,
  // IconButton, // يمكنك إضافته إذا احتجت أيقونة بجانب "عرض المزيد"
} from "@mui/material";
// import VisibilityIcon from '@mui/icons-material/Visibility'; // أيقونة اختيارية
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // لاستخدام MDButton في Modal
import { getAuditLogs } from "services/api";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 700, // زيادة عرض Modal قليلاً
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  borderRadius: "8px", // إضافة استدارة للحواف
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 }, // padding متجاوب
  maxHeight: "90vh",
  overflowY: "auto",
};

function AuditLogSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState(null); // محتوى Modal سيكون كائنًا

  const handleOpenModal = (detailsObject) => {
    setModalContent(detailsObject); // مرر الكائن المحلل
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent(null);
  };

  const fetchLogsCallback = useCallback(async (currentPage, currentLimit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAuditLogs(currentPage + 1, currentLimit);
      setLogs(response.data.logs || []);
      setTotalLogs(response.data.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      const errorMessage =
        err.response?.data?.error || "فشل في تحميل سجلات التدقيق. يرجى المحاولة مرة أخرى.";
      setError(errorMessage);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogsCallback(page, rowsPerPage);
  }, [page, rowsPerPage, fetchLogsCallback]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderCellContent = (content) => content || "-";

  // دالة لعرض تفاصيل السجل بشكل مخصص
  const renderCustomDetails = (detailsObject, action) => {
    if (!detailsObject || typeof detailsObject !== "object") {
      // إذا لم يكن كائنًا، أو كان null/undefined، اعرضه كنص خام (أو JSON إذا أمكن)
      try {
        return (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "0.8rem",
              margin: 0,
            }}
          >
            {JSON.stringify(detailsObject, null, 2)}
          </pre>
        );
      } catch {
        return <MDTypography variant="caption">{String(detailsObject)}</MDTypography>;
      }
    }

    const elements = [];
    // يمكنك التوسع هنا بناءً على قيم 'action' المختلفة
    switch (action) {
      case "UPDATE_ROLE_PERMISSIONS":
      case "CREATE_ROLE":
        if (detailsObject.role_name) {
          elements.push(
            <MDTypography key="role_name" variant="caption" display="block">
              <strong>الدور:</strong> {detailsObject.role_name}
            </MDTypography>
          );
        }
        if (detailsObject.description && action === "CREATE_ROLE") {
          elements.push(
            <MDTypography key="desc" variant="caption" display="block">
              <strong>الوصف:</strong> {detailsObject.description}
            </MDTypography>
          );
        }
        if (detailsObject.permissions_count !== undefined) {
          elements.push(
            <MDTypography key="perm_count" variant="caption" display="block">
              <strong>عدد الصلاحيات:</strong> {detailsObject.permissions_count}
            </MDTypography>
          );
        }
        // يمكنك اختيار عدم عرض قائمة permission_ids الطويلة هنا مباشرة في الجدول
        break;
      case "UPDATE_USER_ROLE":
        if (detailsObject.target_user_email) {
          elements.push(
            <MDTypography key="target_user" variant="caption" display="block">
              <strong>المستخدم المستهدف:</strong> {detailsObject.target_user_email}
            </MDTypography>
          );
        }
        if (detailsObject.new_role_name) {
          elements.push(
            <MDTypography key="new_role" variant="caption" display="block">
              <strong>الدور الجديد:</strong> {detailsObject.new_role_name}
            </MDTypography>
          );
        }
        if (detailsObject.previous_role_id !== undefined) {
          elements.push(
            <MDTypography key="prev_role_id" variant="caption" display="block">
              <strong>معرف الدور السابق:</strong> {detailsObject.previous_role_id}
            </MDTypography>
          );
        }
        break;
      case "UNAUTHORIZED_ACCESS_ATTEMPT":
      case "UNAUTHORIZED_OWNER_ACCESS_ATTEMPT":
      case "UNAUTHORIZED_ASSIGN_OWNER_ROLE_ATTEMPT":
      case "UNAUTHORIZED_MODIFY_OWNER_ROLE_ATTEMPT":
        if (detailsObject.required_permission) {
          elements.push(
            <MDTypography key="req_perm" variant="caption" display="block" color="error">
              <strong>الصلاحية المطلوبة:</strong> {detailsObject.required_permission}
            </MDTypography>
          );
        }
        if (detailsObject.endpoint) {
          elements.push(
            <MDTypography key="endpoint" variant="caption" display="block">
              <strong>نقطة النهاية:</strong> {detailsObject.endpoint}
            </MDTypography>
          );
        }
        if (detailsObject.target_user_email) {
          elements.push(
            <MDTypography key="ua_target_user" variant="caption" display="block">
              <strong>المستخدم المستهدف (محاولة):</strong> {detailsObject.target_user_email}
            </MDTypography>
          );
        }
        if (detailsObject.attempted_role_name) {
          elements.push(
            <MDTypography key="ua_attempted_role" variant="caption" display="block">
              <strong>الدور (محاولة):</strong> {detailsObject.attempted_role_name}
            </MDTypography>
          );
        }
        break;
      default:
        // إجراء غير معروف، اعرض أول بضعة أزواج key-value أو JSON خام مقتطع
        const keys = Object.keys(detailsObject);
        if (keys.length > 0) {
          keys.slice(0, 2).forEach((key) => {
            // عرض أول مفتاحين فقط
            elements.push(
              <MDTypography
                key={key}
                variant="caption"
                display="block"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                <strong>{key}:</strong> {String(detailsObject[key]).substring(0, 30)}
                {String(detailsObject[key]).length > 30 ? "..." : ""}
              </MDTypography>
            );
          });
          if (keys.length > 2) {
            elements.push(
              <MDTypography key="more" variant="caption" display="block">
                ...
              </MDTypography>
            );
          }
        } else {
          return <MDTypography variant="caption">- (فارغ)</MDTypography>;
        }
    }
    return <MDBox sx={{ maxHeight: "70px", overflowY: "auto", pr: 1 }}>{elements}</MDBox>;
  };

  // الدالة التي يتم استدعاؤها من خلية الجدول
  const renderDetailsCell = (logDetails, logAction) => {
    if (logDetails === null || logDetails === undefined) {
      return "-";
    }

    let detailsObject = null;
    if (typeof logDetails === "object") {
      detailsObject = logDetails;
    } else if (typeof logDetails === "string") {
      try {
        detailsObject = JSON.parse(logDetails);
      } catch (e) {
        // إذا فشل التحليل، اعرض السلسلة الأصلية (قد تكون نصًا عاديًا وليس JSON)
        return (
          <MDTypography variant="caption" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {logDetails}
          </MDTypography>
        );
      }
    } else {
      return <MDTypography variant="caption">{String(logDetails)}</MDTypography>;
    }

    // إذا لم يتمكن من التحويل إلى كائن لسبب ما
    if (!detailsObject) return <MDTypography variant="caption">- (بيانات غير صالحة)</MDTypography>;

    return (
      <>
        {renderCustomDetails(detailsObject, logAction)}
        <Link
          component="button"
          variant="body2"
          onClick={() => handleOpenModal(detailsObject)}
          sx={{ fontSize: "0.75rem", mt: 0.5, display: "inline-block" }}
        >
          عرض التفاصيل الكاملة
        </Link>
      </>
    );
  };

  return (
    <MDBox pt={3} pb={3}>
      <MDTypography variant="h5" fontWeight="medium" mb={3}>
        سجل تدقيق النظام
      </MDTypography>

      {loading && (
        <MDBox display="flex" justifyContent="center" alignItems="center" p={5}>
          <CircularProgress size={30} />
          <MDTypography variant="body2" color="text" ml={2}>
            جارِ تحميل السجلات...
          </MDTypography>
        </MDBox>
      )}

      {!loading && error && (
        <MDBox p={3} sx={{ textAlign: "center" }}>
          <MDTypography color="error" variant="body2">
            {error}
          </MDTypography>
        </MDBox>
      )}

      {!loading && !error && logs.length === 0 && (
        <MDBox p={3} sx={{ textAlign: "center" }}>
          <MDTypography color="text" variant="body2">
            لا توجد سجلات لعرضها.
          </MDTypography>
        </MDBox>
      )}

      {!loading && !error && logs.length > 0 && (
        <Card sx={{ boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" }}>
          {" "}
          {/* ظل أخف */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "inherit" }}>
            <Table sx={{ minWidth: 750 }} aria-label="audit logs table">
              <TableHead sx={{ display: "table-header-group", backgroundColor: "action.hover" }}>
                {" "}
                {/* لون خلفية مختلف قليلاً */}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2, whiteSpace: "nowrap" }}>
                    الوقت والتاريخ
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2 }}>المستخدم</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2 }}>الإجراء</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2 }}>المورد</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2, whiteSpace: "nowrap" }}>
                    معرف المورد
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2, minWidth: "300px" }}>
                    التفاصيل
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2 }}>IP</TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 1.5, px: 2, minWidth: "180px" }}>
                    User Agent
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    hover
                    key={log.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ py: 1, px: 2, whiteSpace: "nowrap" }}
                    >
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("ar-EG", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 2 }}>
                      {renderCellContent(log.user_display_identifier)}
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 2 }}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {renderCellContent(log.action)}
                      </MDTypography>
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 2 }}>{renderCellContent(log.resource)}</TableCell>
                    <TableCell sx={{ py: 1, px: 2 }}>
                      {renderCellContent(log.resource_id)}
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 2, verticalAlign: "top" }}>
                      {renderDetailsCell(log.details, log.action)}
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 2 }}>{renderCellContent(log.ip_address)}</TableCell>
                    <TableCell sx={{ py: 1, px: 2, verticalAlign: "top" }}>
                      {log.user_agent ? (
                        <Tooltip title={log.user_agent} placement="top-start">
                          <MDTypography
                            variant="caption"
                            sx={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3, // زيادة عدد الأسطر قليلاً
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "180px",
                              lineHeight: 1.3,
                            }}
                          >
                            {log.user_agent}
                          </MDTypography>
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalLogs}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="سجلات لكل صفحة:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
            sx={{
              borderTop: "1px solid rgba(224, 224, 224, 1)",
              ".MuiTablePagination-toolbar": { pl: 1, pr: 1 },
            }}
          />
        </Card>
      )}

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
              {/* يمكنك عرض المحتوى المخصص هنا أيضًا أو JSON الخام */}
              {/* مثال: عرض JSON الخام في Modal */}
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                {typeof modalContent === "object"
                  ? JSON.stringify(modalContent, null, 2)
                  : String(modalContent)}
              </pre>
              {/* مثال: عرض مخصص في Modal (يتطلب تمرير 'action' أيضًا أو هيكلة modalContent بشكل مختلف) */}
              {/* {renderCustomDetails(modalContent, 'UNKNOWN_ACTION_IN_MODAL')} */}
            </MDBox>
          )}
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton onClick={handleCloseModal} variant="contained" color="info">
              {" "}
              {/* استخدام MDButton */}
              إغلاق
            </MDButton>
          </MDBox>
        </MDBox>
      </Modal>
    </MDBox>
  );
}

export default AuditLogSection;
