// src/services/api.js

import { apiClient } from "./apiClient";

// =================================================================
// SECTION: إدارة الاشتراكات (الأنواع، المجموعات، الخطط)
// =================================================================

/** إدارة أنواع الاشتراكات (subscription_types) **/
export const getSubscriptionData = async () => {
  const response = await apiClient.get("/api/admin/subscription-data");
  return response.data;
};

export const getSubscriptionTypes = async (groupId = null) => {
  const params = groupId ? { group_id: groupId } : {};
  const response = await apiClient.get("/api/admin/subscription-types", { params });
  return response.data;
};

export const getSubscriptionType = async (typeId) => {
  const response = await apiClient.get(`/api/admin/subscription-types/${typeId}`);
  return response.data;
};

export const createSubscriptionType = (data) =>
  apiClient.post("/api/admin/subscription-types", data);

export const updateSubscriptionType = (typeId, data) =>
  apiClient.put(`/api/admin/subscription-types/${typeId}`, data);

export const deleteSubscriptionType = (typeId) =>
  apiClient.delete(`/api/admin/subscription-types/${typeId}`);

/** إدارة مجموعات الاشتراكات (subscription_groups) **/
export const getGroupedSubscriptionTypes = async () => {
  const response = await apiClient.get("/api/admin/subscription-types/grouped");
  return response.data;
};

export const getSubscriptionGroups = async () => {
  const response = await apiClient.get("/api/admin/subscription-groups");
  return response.data;
};

export const getSubscriptionGroup = async (groupId) => {
  const response = await apiClient.get(`/api/admin/subscription-groups/${groupId}`);
  return response.data;
};

export const createSubscriptionGroup = (data) =>
  apiClient.post("/api/admin/subscription-groups", data);

export const updateSubscriptionGroup = (groupId, data) =>
  apiClient.put(`/api/admin/subscription-groups/${groupId}`, data);

export const deleteSubscriptionGroup = (groupId) =>
  apiClient.delete(`/api/admin/subscription-groups/${groupId}`);

/** إدارة خطط الاشتراك (subscription_plans) **/
export const getSubscriptionPlans = async (subscriptionTypeId = null) => {
  const params = subscriptionTypeId ? { subscription_type_id: subscriptionTypeId } : {};
  const response = await apiClient.get("/api/admin/subscription-plans", { params });
  return response.data;
};

export const getSubscriptionPlan = async (planId) => {
  const response = await apiClient.get(`/api/admin/subscription-plans/${planId}`);
  return response.data;
};

export const createSubscriptionPlan = (data) =>
  apiClient.post("/api/admin/subscription-plans", data);

export const updateSubscriptionPlan = (planId, data) =>
  apiClient.put(`/api/admin/subscription-plans/${planId}`, data);

export const deleteSubscriptionPlan = (planId) =>
  apiClient.delete(`/api/admin/subscription-plans/${planId}`);

/** إدارة الخصومات (Discounts) **/
export const getDiscounts = async () => {
  const response = await apiClient.get("/api/admin/discounts");
  return response.data;
};

export const createDiscount = (data) => apiClient.post("/api/admin/discounts", data);

export const updateDiscount = (id, data) => apiClient.put(`/api/admin/discounts/${id}`, data);

export const deleteDiscount = (
  id // يمكنك إضافة هذا لاحقاً في الخادم
) => apiClient.delete(`/api/admin/discounts/${id}`);

export const applyDiscountToExisting = (id) =>
  apiClient.post(`/api/admin/discounts/${id}/apply-to-existing`);

export const addDiscountToUser = (telegramId, data) =>
  apiClient.post(`/api/admin/users/${telegramId}/discounts`, data);

// =================================================================
// SECTION: إدارة المستخدمين والأدوار والصلاحيات
// =================================================================

/** إدارة المستخدمين **/
export const getUsers = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/users", { params: filters });
  return response.data;
};

export const getUserDetails = async (telegramId) => {
  const response = await apiClient.get(`/api/admin/users/${telegramId}`);
  return response.data;
};

export const getPanelUsers = () => apiClient.get("/api/admin/users_panel");

// تعديل الدالة لتقبل كل البيانات
export const createPanelUser = (userData) => apiClient.post("/api/admin/users_panel", userData);

// إضافة دالة جديدة للتحديث
export const updatePanelUser = (userId, userData) =>
  apiClient.put(`/api/admin/users_panel/${userId}`, userData);

export const deletePanelUser = (userId) => apiClient.delete(`/api/admin/users/${userId}`);

/** إدارة الأدوار والصلاحيات **/
export const updateUserRole = (userId, roleId) =>
  apiClient.put(`/api/permissions/users/${userId}/role`, {
    role_id: parseInt(roleId, 10),
  });

export const getRoles = () => apiClient.get("/api/permissions/roles");

export const getPermissions = () => apiClient.get("/api/permissions/permissions");

export const getRolePermissions = (roleId) =>
  apiClient.get(`/api/permissions/roles/${roleId}/permissions`);

export const updateRolePermissions = (roleId, permissionIds) =>
  apiClient.put(`/api/permissions/roles/${roleId}/permissions`, {
    permission_ids: permissionIds.map((id) => parseInt(id, 10)),
  });

export const createRole = (name, description, permissionIds) =>
  apiClient.post("/api/permissions/roles", {
    name,
    description,
    permission_ids: permissionIds.map((id) => parseInt(id, 10)),
  });

/** صلاحيات المستخدم الحالي وسجل التدقيق **/
export const getMyPermissions = () => apiClient.get("/api/permissions/my-permissions");

export const getAuditLogs = (page = 1, limit = 25) =>
  apiClient.get(`/api/permissions/audit-logs?page=${page}&limit=${limit}`);

// =================================================================
// SECTION: إدارة الاشتراكات، الدفعات، والمعاملات
// =================================================================

export const getSubscriptions = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/subscriptions", { params: filters });
  return response.data;
};

export const getPayments = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/payments", { params: filters });
  return response.data;
};

// ===== Subscription Metadata API for Filters =====
export const getPaymentsMeta = async () => {
  const response = await apiClient.get("/api/admin/payments/meta");
  return response.data;
};

export const retryPaymentRenewal = async (paymentId) => {
  const response = await apiClient.post(`/api/admin/payments/${paymentId}/retry-renewal`);
  return response.data;
};

export const getIncomingTransactions = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/incoming-transactions", { params: filters });
  return response.data;
};

export const addOrRenewSubscriptionAdmin = (data) =>
  apiClient.post("/api/admin/subscriptions", data);

export const updateSubscriptionAdmin = (subscriptionId, data) =>
  apiClient.put(`/api/admin/subscriptions/${subscriptionId}`, data);

export const cancelSubscriptionAdmin = (data) =>
  apiClient.post("/api/admin/subscriptions/cancel", data);

// ===== Subscription History API =====
export const getSubscriptionHistory = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/subscription-history", { params: filters });
  return response.data;
};

// ===== Subscription Analytics API =====
export const getSubscriptionAnalytics = async (filters = {}) => {
  // filters يمكن أن تحتوي على start_date و end_date
  const response = await apiClient.get("/api/admin/subscriptions/analytics", { params: filters });
  return response.data;
};

// ===== Subscription Metadata API for Filters =====
export const getSubscriptionsMeta = async () => {
  const response = await apiClient.get("/api/admin/subscriptions/meta");
  return response.data;
};

// =================================================================
// SECTION: لوحة التحكم (Dashboard)
// =================================================================

export const getDashboardStats = async () => {
  const response = await apiClient.get("/api/admin/dashboard/stats");
  return response.data;
};

export const getRevenueChart = async (period = "7days") => {
  const response = await apiClient.get("/api/admin/dashboard/revenue_chart", {
    params: { period },
  });
  return response.data;
};

export const getSubscriptionsChart = async () => {
  const response = await apiClient.get("/api/admin/dashboard/subscriptions_chart");
  return response.data;
};

export const getRecentActivities = async (limit = 10) => {
  const response = await apiClient.get("/api/admin/dashboard/recent_activities", {
    params: { limit },
  });
  return response.data;
};

export const getRecentPayments = async (limit = 10) => {
  const response = await apiClient.get("/api/admin/dashboard/recent_payments", {
    params: { limit },
  });
  return response.data;
};

// =================================================================
// SECTION: المراسلة والبث (Messaging & Broadcast)
// =================================================================

export const getLatestBatchForSubscriptionType = async (typeId) => {
  try {
    const response = await apiClient.get(`/api/admin/messaging-batches/latest-for-type/${typeId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null; // Handle 404 gracefully
    throw error;
  }
};

export const getBatchDetails = async (batchId) => {
  const response = await apiClient.get(`/api/admin/messaging-batches/${batchId}`);
  return response.data;
};

export const retryMessagingBatch = async (batchId) => {
  const response = await apiClient.post(`/api/admin/messaging-batches/${batchId}/retry`, {});
  return response.data;
};

export const getTargetGroups = async () => {
  const response = await apiClient.get("/api/admin/messaging/target-groups");
  return response.data;
};

export const previewTargetUsers = async (targetGroup, subscriptionTypeId = null) => {
  const response = await apiClient.post("/api/admin/messaging/preview-users", {
    target_group: targetGroup,
    subscription_type_id: subscriptionTypeId,
    limit: 10,
  });
  return response.data;
};

export const getAvailableVariables = async () => {
  const response = await apiClient.get("/api/admin/messaging/available-variables");
  return response.data;
};

export const startBroadcast = async (messageText, targetGroup, subscriptionTypeId = null) => {
  const response = await apiClient.post("/api/admin/messaging/broadcast", {
    message_text: messageText,
    target_group: targetGroup,
    subscription_type_id: subscriptionTypeId,
  });
  return response.data;
};

export const getBroadcastHistory = async (page = 1, pageSize = 10) => {
  const response = await apiClient.get("/api/admin/messaging/batches", {
    params: { page, page_size: pageSize, batch_type: "broadcast" },
  });
  return response.data;
};

// =================================================================
// SECTION: فحص القنوات (Channel Audit)
// =================================================================

export const startChannelAudit = async () => {
  const response = await apiClient.post("/api/admin/channels/audit/start", {});
  return response.data;
};

export const getChannelAuditStatus = async (auditUuid) => {
  if (!auditUuid) return null;
  const response = await apiClient.get(`/api/admin/channels/audit/status/${auditUuid}`);
  return response.data;
};

export const startChannelCleanup = async (auditUuid, channelId) => {
  const response = await apiClient.post("/api/admin/channels/cleanup/start", {
    audit_uuid: auditUuid,
    channel_id: channelId,
  });
  return response.data;
};

export const getAuditsHistory = async () => {
  const response = await apiClient.get("/api/admin/channels/audits/history");
  return response.data;
};

export const getRemovableUsers = async (auditUuid, channelId) => {
  const response = await apiClient.get(
    `/api/admin/channels/audit/removable_users/${auditUuid}/${channelId}`
  );
  return response.data;
};

// =================================================================
// SECTION: إدارة الاشتراكات المعلقة والقديمة
// =================================================================

export const getSubscriptionSources = async () => {
  const response = await apiClient.get("/api/admin/subscription_sources");
  return response.data;
};

export const getPendingSubscriptionsStats = async () => {
  const response = await apiClient.get("/api/admin/pending_subscriptions/stats");
  return response.data;
};

export const getPendingSubscriptions = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/pending_subscriptions", { params: filters });
  return response.data;
};

export const handleSinglePendingSubscriptionAction = async (id) => {
  const response = await apiClient.post(`/api/admin/pending_subscriptions/${id}/action`, {
    action: "mark_as_complete",
  });
  return response.data;
};

export const handleBulkPendingSubscriptionsAction = async (filterCriteria = {}) => {
  const response = await apiClient.post("/api/admin/pending_subscriptions/bulk_action", {
    action: "mark_as_complete",
    filter: filterCriteria,
  });
  return response.data;
};

export const getLegacySubscriptions = async (filters = {}) => {
  const response = await apiClient.get("/api/admin/legacy_subscriptions", { params: filters });
  return response.data;
};

export const getLegacySubscriptionStats = async () => {
  const response = await apiClient.get("/api/admin/legacy_subscriptions/stats");
  return response.data;
};

export const updateLegacySubscriptionProcessed = async (id, processed) => {
  const response = await apiClient.put(`/api/admin/legacy_subscriptions/${id}/processed`, {
    processed,
  });
  return response.data;
};

// =================================================================
// SECTION: قاعدة المعرفة والشات بوت (Knowledge Base & Chatbot)
// =================================================================

export const fetchChatbotSettings = () => apiClient.get("/settings");

export const updateChatbotSettings = (settings) => {
  const processedSettings = {
    ...settings,
    faq_questions:
      typeof settings.faq_questions === "string"
        ? settings.faq_questions
        : JSON.stringify(settings.faq_questions),
  };
  return apiClient.post("/settings", processedSettings);
};

export const fetchKnowledgeBase = (params) => apiClient.get("/knowledge", { params });

export const fetchKnowledgeItem = (itemId) => apiClient.get(`/knowledge/${itemId}`);

export const addKnowledgeItem = (item) => apiClient.post("/knowledge", item);

export const updateKnowledgeItem = (itemId, item) => apiClient.put(`/knowledge/${itemId}`, item);

export const deleteKnowledgeItem = (itemId) => apiClient.delete(`/knowledge/${itemId}`);

export const rebuildEmbeddings = async (background = false) => {
  const response = await apiClient.post("/rebuild-embeddings", { background });
  return response.data;
};

// =================================================================
// SECTION: إعدادات متنوعة (Misc Settings)
// =================================================================

export const getImageKitSignature = async () => {
  const response = await apiClient.get("/api/admin/imagekit-signature");
  return response.data;
};

export const getWalletAddress = () => apiClient.get("/api/admin/wallet");

export const updateWalletAddress = (walletData) => apiClient.post("/api/admin/wallet", walletData);

export const updateReminderSettings = (data) =>
  apiClient.put("/api/admin/admin/reminder-settings", data);

export const fetchReminderSettings = () => apiClient.get("/api/admin/admin/reminder-settings");

export const getTermsConditions = async () => {
  const response = await apiClient.get("/api/admin/terms-conditions");
  return response.data;
};

export const updateTermsConditions = async (termsArray) => {
  const response = await apiClient.post("/api/admin/terms-conditions", { terms_array: termsArray });
  return response.data;
};

export const getPublicTermsConditions = async () => {
  const response = await apiClient.get("/api/public/terms-conditions");
  return response.data;
};

export const exportUsersToExcel = async (exportOptions) => {
  const response = await apiClient.post("/api/admin/users/export", exportOptions, {
    responseType: "blob", // Important for file download
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

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

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
