// src/layouts/payments/components/ColumnSelector.jsx

import React, { useState } from "react";
import { Menu, Checkbox, Tooltip, IconButton, useTheme } from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function ColumnSelector({ allColumns, visibleColumns, onVisibilityChange, onSelectAll, onReset }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColumnToggle = (accessor) => {
    onVisibilityChange(accessor);
    // لا نغلق القائمة هنا للسماح بتحديدات متعددة
  };

  const handleSelectAllClick = () => {
    if (onSelectAll) onSelectAll();
  };

  const handleResetClick = () => {
    if (onReset) onReset();
  };

  return (
    <>
      <Tooltip title="تخصيص الأعمدة">
        <IconButton onClick={handleClick} color="info" size="large">
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "column-selector-button" }}
        PaperProps={{
          sx: {
            minWidth: "250px",
            borderRadius: "lg",
            boxShadow: theme.shadows[5],
            overflow: "hidden", // لإخفاء أي تجاوزات من الحواف الدائرية
          },
        }}
      >
        {/* Header */}
        <MDBox p={2} borderBottom={`1px solid ${theme.palette.divider}`}>
          <MDTypography variant="h6" fontWeight="medium">
            تخصيص الأعمدة
          </MDTypography>
        </MDBox>

        {/* Column List */}
        <MDBox p={1} sx={{ maxHeight: 320, overflowY: "auto" }}>
          {allColumns
            .filter((c) => c.Header) // تجاهل الأعمدة بدون عنوان
            .map((column) => (
              <MDBox
                key={column.accessor}
                display="flex"
                alignItems="center"
                onClick={() => handleColumnToggle(column.accessor)}
                sx={{
                  cursor: "pointer",
                  p: 1,
                  borderRadius: "md",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Checkbox
                  checked={!!visibleColumns[column.accessor]}
                  size="small"
                  sx={{ p: 0.5, mr: 1.5 }}
                />
                <MDTypography variant="button" color="text">
                  {column.Header}
                </MDTypography>
              </MDBox>
            ))}
        </MDBox>

        {/* Footer Actions */}
        {(onSelectAll || onReset) && (
          <MDBox
            p={1.5}
            display="flex"
            justifyContent="space-between"
            borderTop={`1px solid ${theme.palette.divider}`}
          >
            {onSelectAll && (
              <MDButton onClick={handleSelectAllClick} size="small" variant="text" color="info">
                تحديد الكل
              </MDButton>
            )}
            {onReset && (
              <MDButton onClick={handleResetClick} size="small" variant="text" color="secondary">
                إعادة تعيين
              </MDButton>
            )}
          </MDBox>
        )}
      </Menu>
    </>
  );
}

export default ColumnSelector;
