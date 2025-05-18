// src/layouts/tables/config/legacy.config.js
import ChecklistIcon from "@mui/icons-material/Checklist";
import DoneIcon from "@mui/icons-material/Done";
import UnpublishedIcon from "@mui/icons-material/Unpublished";

export const BASE_COLUMNS_CONFIG_LEGACY = [
  { Header: "USERNAME", accessor: "username", align: "left" },
  { Header: "SUB TYPE", accessor: "subscription_type_name", align: "left" },
  { Header: "PROCESSED", accessor: "processed", align: "center" },
  { Header: "EXPIRY DATE", accessor: "expiry_date", align: "center" },
  { Header: "CREATED AT", accessor: "start_date", align: "center" },
  // No 'actions' column for legacy by default, but can be added if needed
];

export const LEGACY_PROCESSED_FILTER_OPTIONS = [
  { label: "All", value: null, icon: ChecklistIcon }, // Pass the component, not JSX
  { label: "Processed", value: true, icon: DoneIcon },
  { label: "Not Processed", value: false, icon: UnpublishedIcon },
];
