// src/layouts/Users/components/UsersTableToolbar.js
import React from "react";
import { Grid, IconButton, Tooltip, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
// import AddIcon from "@mui/icons-material/Add"; // If you add "Add New User"
// import FilterListIcon from "@mui/icons-material/FilterList"; // For future filters

import MDBox from "components/MDBox";
// import MDButton from "components/MDButton"; // For Add New or Filter buttons

const UsersTableToolbar = ({
  onRefreshClick,
  // onAddNewUserClick, // For future "Add New User" button
  // onFilterChange, // For future filters
  // filters, // For future filters
  loading,
}) => {
  // const [showFilters, setShowFilters] = useState(false); // For future filters

  return (
    <MDBox pt={2} pb={1} px={2} display="flex" justifyContent="flex-end" alignItems="center">
      {/* Future "Add New User" Button
      <MDButton
        variant="gradient"
        color="success"
        onClick={onAddNewUserClick}
        startIcon={<AddIcon />}
        sx={{ mr: 1 }}
      >
        Add New User
      </MDButton>
      */}
      {/* Future Filter Button
      <MDButton
        variant="outlined"
        color="info"
        onClick={() => setShowFilters(!showFilters)}
        startIcon={<FilterListIcon />}
        sx={{ mr: 1 }}
      >
        Filters {showFilters ? "(Hide)" : "(Show)"}
      </MDButton>
      */}
      <Tooltip title="Refresh Data">
        <IconButton onClick={onRefreshClick} color="info" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
        </IconButton>
      </Tooltip>
    </MDBox>
    // <Collapse in={showFilters} timeout="auto" unmountOnExit> ... </Collapse> for filters
  );
};

export default UsersTableToolbar;
