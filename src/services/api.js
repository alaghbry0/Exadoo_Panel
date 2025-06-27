// services/api.js
import axios from "axios";
console.log(process.env.NEXT_PUBLIC_BACK_URL);
// تأكد من إعداد عنوان الـ API الرئيسي في ملف .env مثلاً

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token") || process.env.REACT_APP_ADMIN_TOKEN;
  const authHeader = `Bearer ${token}`;
  return {
    Authorization: authHeader,
  };
};

/** إدارة أنواع الاشتراكات (subscription_types) **/

export const getSubscriptionData = async () => {
  try {
    // هذه الدالة ستجلب المجموعات، وأنواع الاشتراكات، وخططها دفعة واحدة
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-data`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getSubscriptionData:", error.response?.data || error.message);
    throw error;
  }
};

export const getSubscriptionTypes = async (groupId = null) => {
  // إضافة فلتر اختياري
  try {
    const params = {};
    if (groupId) {
      params.group_id = groupId;
    }
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-types`, {
      headers: getAuthHeaders(),
      params: params, // إضافة البارامترات هنا
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getSubscriptionTypes:", error.response?.data || error.message);
    throw error;
  }
};

export const getSubscriptionType = async (typeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-types/${typeId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getSubscriptionType:", error.response?.data || error.message);
    throw error;
  }
};

export const createSubscriptionType = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscription-types`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - createSubscriptionType:", error.response?.data || error.message);
    throw error;
  }
};

export const updateSubscriptionType = async (typeId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/subscription-types/${typeId}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("API Error - updateSubscriptionType:", error.response?.data || error.message);
    throw error;
  }
};

export const getLatestBatchForSubscriptionType = async (typeId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/messaging-batches/latest-for-type/${typeId}`, // تأكد من تطابق هذا المسار مع الخادم
      { headers: getAuthHeaders() }
    );
    return response.data; // إذا كان الخادم يرجع null عند عدم العثور، هذا جيد
  } catch (error) {
    if (error.response?.status === 404) return null; // جيد
    console.error(
      "API Error - getLatestBatchForSubscriptionType:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ملاحظة: إذا لم ترغب في إضافة المسار أعلاه في الخادم، يمكنك حذفه.
// وسيقوم polling في ManagePlans بجلب الحالة عند الحاجة.

// دالة لجلب تفاصيل مهمة مراسلة محددة
export const getBatchDetails = async (batchId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/messaging-batches/${batchId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getBatchDetails:", error.response?.data || error.message);
    throw error;
  }
};

// دالة لبدء إعادة محاولة لمهمة فاشلة
export const retryMessagingBatch = async (batchId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/messaging-batches/${batchId}/retry`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("API Error - retryMessagingBatch:", error.response?.data || error.message);
    throw error;
  }
};

// === APIs الخاصة بالمجموعات ===

// جلب جميع مجموعات الاشتراكات
export const getGroupedSubscriptionTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-types/grouped`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(
      "API Error - getGroupedSubscriptionTypes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getImageKitSignature = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/imagekit-signature`, {
      headers: getAuthHeaders(),
    });
    return response.data; // يجب أن يحتوي على token, expire, signature
  } catch (error) {
    console.error("API Error - getImageKitSignature:", error.response?.data || error.message);
    throw error;
  }
};

// --- Subscription Groups ---
export const getSubscriptionGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-groups`, {
      headers: getAuthHeaders(),
    });
    return response.data; // يفترض أن تحتوي على subscription_types_count
  } catch (error) {
    console.error("API Error - getSubscriptionGroups:", error.response?.data || error.message);
    throw error;
  }
};

export const getSubscriptionGroup = async (groupId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-groups/${groupId}`, {
      headers: getAuthHeaders(),
    });
    return response.data; // يفترض أن تحتوي على تفاصيل المجموعة وأنواع الاشتراكات داخلها
  } catch (error) {
    console.error("API Error - getSubscriptionGroup:", error.response?.data || error.message);
    throw error;
  }
};

export const createSubscriptionGroup = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscription-groups`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - createSubscriptionGroup:", error.response?.data || error.message);
    throw error;
  }
};

export const updateSubscriptionGroup = async (groupId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/subscription-groups/${groupId}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("API Error - updateSubscriptionGroup:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteSubscriptionGroup = async (groupId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/admin/subscription-groups/${groupId}`,
      { headers: getAuthHeaders() }
    );
    return response.data; // يجب أن يكون رسالة نجاح أو خطأ
  } catch (error) {
    console.error("API Error - deleteSubscriptionGroup:", error.response?.data || error.message);
    throw error;
  }
};

// حذف نوع اشتراك
export const deleteSubscriptionType = async (typeId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/subscription-types/${typeId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/** إدارة خطط الاشتراك (subscription_plans) **/

// جلب جميع                 \خطط الاشتراك، مع خيار التصفية حسب subscription_type_id
export const getSubscriptionPlans = async (subscriptionTypeId = null) => {
  try {
    let url = `${API_BASE_URL}/api/admin/subscription-plans`;
    if (subscriptionTypeId) {
      url += `?subscription_type_id=${subscriptionTypeId}`;
    }
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// جلب تفاصيل خطة اشتراك معينة
export const getSubscriptionPlan = async (planId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-plans/${planId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// إضافة خطة اشتراك جديدة
export const createSubscriptionPlan = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscription-plans`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// تعديل خطة اشتراك موجودة
export const updateSubscriptionPlan = async (planId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/subscription-plans/${planId}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 1. جلب بيانات الاشتراكات مع دعم الفلاتر والتجزئة
 * يمكنك تمرير كائن من الفلاتر مثل:
 * { user_id: "12345", channel_id: "-100123456", status: "active", start_date: "2025-01-01", end_date: "2025-01-31", page: 1, page_size: 20 }
 */
export const getSubscriptions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscriptions`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data; // يجب أن يكون مصفوفة من السجلات
  } catch (error) {
    throw error;
  }
};

/**
 * 2. جلب بيانات الدفعات مع دعم الفلاتر والتجزئة والتقارير المالية
 * يمكنك تمرير كائن من الفلاتر مثل:
 * { status: "completed", user_id: "12345", start_date: "2025-01-01", end_date: "2025-01-31", page: 1, page_size: 20, report: "total_revenue" }
 */
export const getPayments = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/payments`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIncomingTransactions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/incoming-transactions`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addOrRenewSubscriptionAdmin = async (data) => {
  // اسم جديد للدلالة على الإضافة أو التجديد
  try {
    // هذه النقطة تستخدم الآن days_to_add
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscriptions`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error in addOrRenewSubscriptionAdmin:", error.response?.data || error.message);
    throw error;
  }
};

export const updateSubscriptionAdmin = async (subscriptionId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateSubscriptionAdmin:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelSubscriptionAdmin = async (data) => {
  // دالة جديدة للإلغاء
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscriptions/cancel`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error in cancelSubscriptionAdmin:", error.response?.data || error.message);
    throw error;
  }
};
/**
 * تسجيل الدخول باستخدام Google:
 * يُرسل id_token إلى الخادم للحصول على access_token و role.
 */
export const loginWithGoogle = (idToken) => {
  return axios.post(`${API_BASE_URL}/api/auth/login`, { id_token: idToken });
};

/**
 * دالة لحفظ access_token في Local Storage وتعيينه في axios.
 */
export const setAuthToken = (token) => {
  localStorage.setItem("access_token", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

/**
 * استرجاع access_token من Local Storage.
 */
export const getAuthToken = () => localStorage.getItem("access_token");

/**
 * إزالة التوكنات من Local Storage ومن إعدادات axios.
 * تم التعديل: لحذف access_token فقط. Refresh token يتم التعامل معه كـ HTTP-only Cookie.
 */
export const removeAuthToken = () => {
  localStorage.removeItem("access_token");
  delete axios.defaults.headers.common["Authorization"];
};

/**
 * دوال إدارة المستخدمين:
 */
export const getPanelUsers = () => {
  return apiClient.get("/api/admin/users_panel");
};

/**
 * حذف مستخدم بناءً على ID.
 * @param {number} userId - معرف المستخدم المراد حذفه.
 */
export const deletePanelUser = (userId) => {
  return apiClient.delete(`/api/admin/users/${userId}`);
};

export const deleteSubscriptionPlan = (planId) => {
  return apiClient.delete(`/api/admin/subscription-plans/${planId}`);
};

/**
 * إنشاء مستخدم جديد.
 * @param {string} email
 * @param {string} displayName
 * @param {number} roleId - معرف الدور
 */
export const createPanelUser = (email, displayName, roleId) => {
  return apiClient.post("/api/admin/users_panel", {
    email,
    display_name: displayName,
    role_id: parseInt(roleId, 10), // تأكد من أن roleId رقم
  });
};

/**
 * تحديث دور مستخدم محدد.
 * @param {number} userId - معرف المستخدم المراد تحديث دوره.
 * @param {number} roleId - معرف الدور الجديد.
 */
export const updateUserRole = (userId, roleId) => {
  return apiClient.put(`/api/permissions/users/${userId}/role`, {
    role_id: parseInt(roleId, 10), // تأكد من أن roleId رقم
  });
};

/**
 * دوال إدارة الأدوار والصلاحيات
 */
export const getRoles = () => {
  return apiClient.get("/api/permissions/roles");
};

export const getPermissions = () => {
  return apiClient.get("/api/permissions/permissions");
};

export const getRolePermissions = (roleId) => {
  return apiClient.get(`/api/permissions/roles/${roleId}/permissions`);
};

export const updateRolePermissions = (roleId, permissionIds) => {
  return apiClient.put(`/api/permissions/roles/${roleId}/permissions`, {
    permission_ids: permissionIds.map((id) => parseInt(id, 10)), // تأكد أن كل ID رقم
  });
};

export const createRole = (name, description, permissionIds) => {
  return apiClient.post("/api/permissions/roles", {
    name,
    description,
    permission_ids: permissionIds.map((id) => parseInt(id, 10)), // تأكد أن كل ID رقم
  });
};

// (اختياري) حذف دور - ستحتاج إلى endpoint في الخلفية
// export const deleteRole = (roleId) => {
//   return apiClient.delete(`/api/permissions/roles/${roleId}`);
// };

/**
 * دوال صلاحيات المستخدم الحالي وسجل التدقيق
 */
export const getMyPermissions = () => {
  return axios.get(`${API_BASE_URL}/api/permissions/my-permissions`, {
    headers: getAuthHeaders(),
  });
};

export const getAuditLogs = (page = 1, limit = 25) => {
  // حد افتراضي أصغر للعرض الأولي
  return apiClient.get(`/api/permissions/audit-logs?page=${page}&limit=${limit}`);
};

export const getUsers = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * جلب بيانات مستخدم محدد مع تفاصيل الاشتراكات والمدفوعات
 * @param {number} telegramId - معرف المستخدم على تلغرام
 * @returns {Promise<Object>} - بيانات المستخدم التفصيلية
 */
export const getUserDetails = async (telegramId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/users/${telegramId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة تجديد access_token باستخدام refresh_token (المخزن كـ HTTP-only Cookie).
 * تم التعديل:  إرسال طلب فارغ لـ /api/auth/refresh.
 */
export const refreshAuthToken = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    ); // تم التعديل: طلب POST فارغ و withCredentials: true
    const newAccessToken = response.data.access_token;
    localStorage.setItem("access_token", newAccessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token", error);
    removeAuthToken();
    window.location.href = "/authentication/sign-in";
    return null;
  }
};

/**
 * إنشاء axios instance مع Interceptors لتجديد access_token تلقائيًا.
 * تم التعديل: إضافة withCredentials: true للسماح بملفات تعريف الارتباط.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: يضيف Authorization header قبل إرسال الطلب
apiClient.interceptors.request.use(async (config) => {
  let token = getAuthToken();
  if (!token) {
    token = await refreshAuthToken();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: إذا حصلنا على 401 نحاول تجديد التوكن وإعادة إرسال الطلب
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAuthToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const getWalletAddress = () => {
  return axios.get(`${API_BASE_URL}/api/admin/wallet`, {
    headers: getAuthHeaders(),
  });
};

export const updateWalletAddress = (walletData) => {
  return axios.post(
    `${API_BASE_URL}/api/admin/wallet`,
    {
      wallet_address: walletData.wallet_address,
      api_key: walletData.api_key,
    },
    {
      headers: getAuthHeaders(),
    }
  );
};

// API functions with auth headers included

export const fetchChatbotSettings = () => {
  return axios.get(`${API_BASE_URL}/settings`, {
    headers: getAuthHeaders(),
  });
};

// تحديث إعدادات الشات بوت
export const updateChatbotSettings = (settings) => {
  // تأكد من أن faq_questions هي سلسلة نصية عند الإرسال
  const processedSettings = {
    ...settings,
    faq_questions:
      typeof settings.faq_questions === "string"
        ? settings.faq_questions
        : JSON.stringify(settings.faq_questions),
  };

  return axios.post(`${API_BASE_URL}/settings`, processedSettings, {
    headers: getAuthHeaders(),
  });
};
// جلب قائمة عناصر قاعدة المعرفة بناءً على معطيات الاستعلام
export const fetchKnowledgeBase = (params) => {
  return axios.get(`${API_BASE_URL}/knowledge`, {
    headers: getAuthHeaders(),
    params: params,
  });
};

// جلب عنصر معرفة محدد بواسطة المعرف
export const fetchKnowledgeItem = (itemId) => {
  return axios.get(`${API_BASE_URL}/knowledge/${itemId}`, {
    headers: getAuthHeaders(),
  });
};

// إضافة عنصر جديد إلى قاعدة المعرفة
export const addKnowledgeItem = (item) => {
  return axios.post(`${API_BASE_URL}/knowledge`, item, {
    headers: getAuthHeaders(),
  });
};

// تحديث عنصر معرفة موجود
export const updateKnowledgeItem = (itemId, item) => {
  return axios.put(`${API_BASE_URL}/knowledge/${itemId}`, item, {
    headers: getAuthHeaders(),
  });
};

// حذف عنصر من قاعدة المعرفة
export const deleteKnowledgeItem = (itemId) => {
  return axios.delete(`${API_BASE_URL}/knowledge/${itemId}`, {
    headers: getAuthHeaders(),
  });
};

// دالة إعادة بناء embeddings
export const rebuildEmbeddings = async (background = false) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/rebuild-embeddings`,
      { background },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error rebuilding embeddings:", error);
    throw error;
  }
};

export const updateReminderSettings = (data) => {
  return axios.put(`${API_BASE_URL}/api/admin/admin/reminder-settings`, data, {
    headers: getAuthHeaders(),
  });
};

export const fetchReminderSettings = () => {
  return axios.get(`${API_BASE_URL}/api/admin/admin/reminder-settings`, {
    headers: getAuthHeaders(),
  });
};

/**
 * جلب مصادر الاشتراكات المتاحة
 */
export const getSubscriptionSources = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription_sources`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * جلب الاشتراكات المعلقة
 */
export const getPendingSubscriptionsStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/pending_subscriptions/stats`, {
      headers: getAuthHeaders(),
    });
    // يتوقع أن يكون الرد: { pending: X, complete: Y, total_all: Z, ... }
    return response.data;
  } catch (error) {
    console.error("Error fetching pending stats:", error);
    throw error;
  }
};

// getPendingSubscriptions سيستقبل الآن كائنًا يحتوي على data و total_count
export const getPendingSubscriptions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/pending_subscriptions`, {
      headers: getAuthHeaders(),
      params: filters, // status, page, page_size, search
    });
    // response.data هو الآن { data: [...], total_count: N, page: P, page_size: S }
    return response.data;
  } catch (error) {
    console.error("Error fetching pending subscriptions:", error);
    throw error;
  }
};
/**
 * إجراءات على الاشتراكات المعلقة (قبول/رفض)
 */
export const handleSinglePendingSubscriptionAction = async (id) => {
  // لم نعد بحاجة لتمرير 'action' كمعامل
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/pending_subscriptions/${id}/action`,
      { action: "mark_as_complete" }, // إرسال 'mark_as_complete' دائمًا
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleBulkPendingSubscriptionsAction = async (filterCriteria = {}) => {
  // <-- تغيير: تستقبل filterCriteria
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/pending_subscriptions/bulk_action`, // <-- تغيير: المسار الصحيح
      {
        action: "mark_as_complete", // ثابت
        filter: filterCriteria, // <-- تغيير: إرسال فلاتر المعالجة الدفعية
      },
      { headers: getAuthHeaders() }
    );
    // response.data يجب أن يكون الكائن الذي يحتوي على success, message, details
    return response.data;
  } catch (error) {
    console.error("Error in bulk pending subscriptions action:", error); // رسالة خطأ أوضح
    // مهم: إعادة رمي الخطأ مع تفاصيل من الخادم إن أمكن
    if (error.response && error.response.data) {
      throw error.response.data; // يرمي { error: "...", details: {...} } إذا أرسلها الخادم
    }
    throw error; // يرمي الخطأ الأصلي إذا لم يكن هناك رد من الخادم
  }
};

/**
 * جلب الاشتراكات القديمة مع خيارات محسنة للفلترة والفرز
 */
export const getLegacySubscriptions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/legacy_subscriptions`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * جلب إحصائيات الاشتراكات القديمة
 */
export const getLegacySubscriptionStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/legacy_subscriptions/stats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * تحديث حالة معالجة اشتراك قديم
 */
export const updateLegacySubscriptionProcessed = async (id, processed) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/legacy_subscriptions/${id}/processed`,
      { processed },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTermsConditions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/terms-conditions`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update terms and conditions
export const updateTermsConditions = async (termsArray) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/terms-conditions`,
      { terms_array: termsArray },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get public terms and conditions (for users)
export const getPublicTermsConditions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/public/terms-conditions`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportUsersToExcel = async (exportOptions) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/users/export`, exportOptions, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      responseType: "blob", // Important for file download
    });

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Generate filename with current date and time
    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
    const filename = `users_export_${timestamp}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
};

// الحصول على الإحصائيات الأساسية
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// الحصول على بيانات مخطط الإيرادات
export const getRevenueChart = async (period = "7days") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/revenue_chart`, {
      headers: getAuthHeaders(),
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue chart:", error);
    throw error;
  }
};

// الحصول على بيانات مخطط الاشتراكات
export const getSubscriptionsChart = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/subscriptions_chart`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subscriptions chart:", error);
    throw error;
  }
};

// الحصول على النشاطات الحديثة
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/recent_activities`, {
      headers: getAuthHeaders(),
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
};

// الحصول على المدفوعات الحديثة
export const getRecentPayments = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/recent_payments`, {
      headers: getAuthHeaders(),
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    throw error;
  }
};

export const getTargetGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/messaging/target-groups`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getTargetGroups:", error.response?.data || error.message);
    throw error;
  }
};

// لمعاينة عينة من المستخدمين الذين سيتم استهدافهم
export const previewTargetUsers = async (targetGroup, subscriptionTypeId = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/messaging/preview-users`,
      {
        target_group: targetGroup,
        subscription_type_id: subscriptionTypeId,
        limit: 10, // يمكن جعله متغيرًا إذا أردت
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("API Error - previewTargetUsers:", error.response?.data || error.message);
    throw error;
  }
};

// لجلب المتغيرات المتاحة للاستخدام في الرسائل
export const getAvailableVariables = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/messaging/available-variables`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getAvailableVariables:", error.response?.data || error.message);
    throw error;
  }
};

// لبدء مهمة بث جديدة (استخدم المسار المحسن)
export const startBroadcast = async (messageText, targetGroup, subscriptionTypeId = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/messaging/broadcast`, // تأكد من أنه المسار الصحيح والمحسن
      {
        message_text: messageText,
        target_group: targetGroup,
        subscription_type_id: subscriptionTypeId,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("API Error - startBroadcast:", error.response?.data || error.message);
    throw error;
  }
};

// لجلب سجل مهام المراسلة مع التصفح
export const getBroadcastHistory = async (page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/messaging/batches`, {
      params: { page, page_size: pageSize, batch_type: "broadcast" }, // فلترة حسب نوع البث
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getBroadcastHistory:", error.response?.data || error.message);
    throw error;
  }
};

// 1. لبدء مهمة فحص جديدة
export const startChannelAudit = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/channels/audit/start`,
      {}, // لا يوجد body مطلوب هنا
      { headers: getAuthHeaders() }
    );
    return response.data; // سيعيد { message, audit_uuid }
  } catch (error) {
    console.error("API Error - startChannelAudit:", error.response?.data || error.message);
    throw error;
  }
};

// 2. لجلب حالة ونتائج فحص معين
export const getChannelAuditStatus = async (auditUuid) => {
  if (!auditUuid) return; // لا تقم بالطلب إذا لم يكن هناك UUID
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/channels/audit/status/${auditUuid}`,
      { headers: getAuthHeaders() }
    );
    return response.data; // سيعيد { audit_uuid, is_running, results }
  } catch (error) {
    console.error("API Error - getChannelAuditStatus:", error.response?.data || error.message);
    throw error;
  }
};

// 3. لبدء مهمة إزالة المستخدمين لقناة معينة
export const startChannelCleanup = async (auditUuid, channelId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/channels/cleanup/start`,
      {
        audit_uuid: auditUuid,
        channel_id: channelId,
      },
      { headers: getAuthHeaders() }
    );
    return response.data; // سيعيد { message, batch_id }
  } catch (error) {
    console.error("API Error - startChannelCleanup:", error.response?.data || error.message);
    throw error;
  }
};

export const getAuditsHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/channels/audits/history`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getAuditsHistory:", error.response?.data || error.message);
    throw error;
  }
};

export default apiClient;
