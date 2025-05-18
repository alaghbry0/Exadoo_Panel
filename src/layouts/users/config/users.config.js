// src/layouts/Users/config/users.config.js
export const BASE_COLUMNS_CONFIG_USERS = [
  { Header: "ID", accessor: "id", align: "left", width: 80 },
  { Header: "TELEGRAM ID", accessor: "telegram_id", align: "left", width: 130 },
  { Header: "USERNAME", accessor: "username", align: "left", width: 150 },
  { Header: "FULL NAME", accessor: "full_name", align: "left", width: 180 },
  { Header: "SUBS", accessor: "subscription_count", align: "center", width: 80 },
  { Header: "ACTIVE SUBS", accessor: "active_subscription_count", align: "center", width: 100 },
  // Wallet columns can be added here if needed by default
  // { Header: "WALLET", accessor: "wallet_address", align: "left", width: 150 },
  // Actions column will be added in Users/index.js
];
