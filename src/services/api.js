// services/api.js
import axios from "axios";
console.log(process.env.NEXT_PUBLIC_BACK_URL);
// تأكد من إعداد عنوان الـ API الرئيسي في ملف .env مثلاً
//const API_BASE_URL = "https://exaaadoo-72a1f8b32d36.herokuapp.com";
const API_BASE_URL = "https://exadoo-rxr9.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token") || process.env.REACT_APP_ADMIN_TOKEN;
  const authHeader = `Bearer ${token}`;
  console.log("Full Authorization Header:", authHeader); // ✅ تسجيل الترويسة بالكامل
  return {
    Authorization: authHeader,
  };
};

/** إدارة أنواع الاشتراكات (subscription_types) **/

// جلب قائمة بأنواع الاشتراكات
export const getSubscriptionTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-types`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// جلب تفاصيل نوع اشتراك معين
export const getSubscriptionType = async (typeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/subscription-types/${typeId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// انشاء اشتراك جديد
export const createSubscriptionType = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscription-types`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// تعديل نوع اشتراك موجود
export const updateSubscriptionType = async (typeId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/subscription-types/${typeId}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
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

// حذف خطة اشتراك
export const deleteSubscriptionPlan = async (planId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/subscription-plans/${planId}`, {
      headers: getAuthHeaders(),
    });
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

/**
 * 3. تعديل اشتراك مستخدم
 * ترسل البيانات المراد تحديثها في جسم الطلب (body) على سبيل المثال:
 * { expiry_date: "2025-02-28T00:00:00Z", is_active: false, subscription_plan_id: 2, source: "manual" }
 */
export const updateSubscription = async (subscriptionId, data) => {
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
    throw error;
  }
};

/**
 * 4. إضافة اشتراك جديد
 * ترسل البيانات المطلوبة في جسم الطلب (body) مثل:
 * {
 *    user_id: 123, channel_id: -100123456, telegram_id: 987654321,
 *    expiry_date: "2025-02-28T00:00:00Z", subscription_type_id: 1,
 *    subscription_plan_id: 2, payment_id: "abc123", source: "manual", is_active: true
 * }
 */
export const addSubscription = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/subscriptions`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
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
 * يتم استخدام apiClient بحيث تمر كل الطلبات عبر الـ interceptors.
 */
export const getUsers = () => {
  return apiClient.get("/api/admin/users");
};

export const deleteUser = (email) => {
  return apiClient.delete("/api/admin/remove_user", { data: { email } });
};

export const addUser = (email, displayName, role) => {
  const endpoint = role === "owner" ? "add_owner" : "add_admin";
  return apiClient.post(`/api/admin/${endpoint}`, { email, display_name: displayName });
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
  withCredentials: true, // تم الإضافة: للسماح بإرسال واستقبال ملفات تعريف الارتباط
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
  return axios.get(`${API_BASE_URL}/api/admin/wallet`, { headers: getAuthHeaders() });
};

export const updateWalletAddress = (walletAddress) => {
  return axios.post(`${API_BASE_URL}/api/admin/wallet`, { wallet_address: walletAddress }, { headers: getAuthHeaders() });
};