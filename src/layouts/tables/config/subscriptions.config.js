// Example: src/layouts/tables/config/subscriptions.config.js
export const BASE_COLUMNS_CONFIG_SUBS = [
  { Header: "USERNAME", accessor: "username", align: "left" },
  { Header: "NAME", accessor: "full_name", align: "left" },
  { Header: "Telegram ID", accessor: "telegram_id", align: "left", numeric: true },
  { Header: "SUBSCRIPTION TYPE", accessor: "subscription_type_name", align: "left" },
  { Header: "SOURCE", accessor: "source", align: "left" },
  { Header: "STATUS", accessor: "is_active", align: "center" }, // Will be formatted by Cell renderer
  { Header: "EXPIRY DATE", accessor: "expiry_date", align: "center" }, // Will be formatted
  { Header: "PLAN", accessor: "subscription_plan_name", align: "left" }, // Example additional column
  // Add other columns from your 'subscriptions' table that you want to display
];

// INITIAL_FILTERS_SUBS is now effectively managed inside useSubscriptions as initial state for customFilters and tableQueryOptions
// INITIAL_VISIBLE_COLUMNS_SUBS can be used if you implement a column visibility toggle dialog later.
