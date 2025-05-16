// src/layouts/tables/services/api.js
// ... (إعادة تصدير الدوال الأخرى كما هي)
export {
  getSubscriptions,
  getSubscriptionTypes,
  addSubscription,
  updateSubscription,
  getSubscriptionSources,
  getPendingSubscriptions,
  // handlePendingSubscriptionAction, // <<< تأكد من إزالة القديم أو تعديله
  handleSinglePendingSubscriptionAction, // <<< تأكد من إعادة تصدير هذا
  handleBulkPendingSubscriptionsAction, // <<< تأكد من إعادة تصدير هذا
  getLegacySubscriptions,
  getPendingSubscriptionsStats,
} from "../../../services/api";
