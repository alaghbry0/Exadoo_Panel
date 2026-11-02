// layouts/tables/components/handleExportSubscriptions.jsx
import * as XLSX from "xlsx";
import { apiClient } from "../../../services/apiClient";

// HARDEN-1 (Exadoo_Panel): كان هذا الملف يبني التفويض من
// localStorage("adminToken") أو process.env.REACT_APP_ADMIN_TOKEN — وكل
// REACT_APP_* يُضمَّن حرفيًا في حزمة المتصفح المنشورة، أي أن التوكن كان
// مكشوفًا لأي زائر للموقع ولأي من نسخ المستودع. كما كان الرابط مُصلّبًا
// على exaado-rxr9.onrender.com خارج apiClient.
// الآن: apiClient المعتمد على JWT (setupInterceptors يرفق Bearer ويجدد
// تلقائيًا عند 401) وعلى REACT_APP_API_BASE_URL من البيئة — لا توكن
// ساكن في الحزمة إطلاقًا. الباكند يتحقق من الـJWT عبر permission_required
// كما في كل مسارات /api/admin.
const handleExportSubscriptions = async (exportFilters) => {
  try {
    const response = await apiClient.get("/api/admin/subscriptions/export", {
      params: exportFilters,
    });
    const data = response.data;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");
    XLSX.writeFile(workbook, "subscriptions_export.xlsx");
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    alert("Error exporting subscriptions");
  }
};

export default handleExportSubscriptions;
