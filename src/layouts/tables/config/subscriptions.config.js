// src/layouts/tables/config/subscriptions.config.js

export const BASE_COLUMNS_CONFIG_SUBS = [
  { Header: "USERNAME", accessor: "username", align: "left" },
  { Header: "NAME", accessor: "full_name", align: "left" },
  { Header: "Telegram ID", accessor: "telegram_id", align: "left" },
  { Header: "TYPE", accessor: "subscription_type_name", align: "left" },
  { Header: "PLAN", accessor: "subscription_plan_name", align: "left" },
  // --- تعديل: استخدام status_label بدلاً من is_active ---
  // --- إضافة: عمود جديد للأيام المتبقية، مع تفعيل الفرز له ---
  { Header: "STATUS", accessor: "status_label", align: "center" },
  { Header: "DAYS LEFT", accessor: "days_remaining", align: "center", sortable: true },
  { Header: "EXPIRY DATE", accessor: "expiry_date", align: "center", sortable: true },
  { Header: "SOURCE", accessor: "source", align: "center" },
];
