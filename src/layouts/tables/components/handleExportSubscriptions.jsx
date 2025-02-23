// layouts/tables/components/handleExportSubscriptions.jsx
import axios from "axios";
import * as XLSX from "xlsx";
const API_BASE_URL = "https://exaaadoo-72a1f8b32d36.herokuapp.com";

// دالة للحصول على هيدر التفويض (Authorization) للمشرف
const getAuthHeaders = () => {
  // يمكن أن يكون token محفوظًا في localStorage أو أي طريقة أخرى تعتمدها
  const token = localStorage.getItem("adminToken") || process.env.REACT_APP_ADMIN_TOKEN;

  return {
    Authorization: `Bearer ${token}`,
  };
};
const handleExportSubscriptions = async (exportFilters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscriptions/export`, {
      headers: getAuthHeaders(),
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
