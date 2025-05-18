// src/layouts/tables/config/pending.config.js
import ListAltIcon from "@mui/icons-material/ListAlt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const BASE_COLUMNS_CONFIG_PENDING = [
  { Header: "USER ID", accessor: "telegram_id", align: "left" },
  { Header: "NAME", accessor: "full_name", align: "left" },
  { Header: "USERNAME", accessor: "username", align: "left" },
  { Header: "SUB TYPE", accessor: "subscription_type_name", align: "left" },
  { Header: "FOUND AT", accessor: "found_at", align: "center" },
  { Header: "STATUS", accessor: "status", align: "center" },
  // Actions column will be added in Tables/index.js
];

export const PENDING_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All", icon: ListAltIcon },
  { value: "pending", label: "Pending", icon: PendingActionsIcon },
  { value: "complete", label: "Complete", icon: CheckCircleIcon },
];
