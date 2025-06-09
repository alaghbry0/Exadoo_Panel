import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import MDTypography from "components/MDTypography";

function ColorPicker({ label = "Color", value, onChange, disabled = false, ...rest }) {
  return (
    <Box>
      {label && (
        <MDTypography
          variant="caption"
          color="textSecondary"
          fontWeight="regular"
          sx={{ mb: 0.5, display: "block" }}
        >
          {label}
        </MDTypography>
      )}

      <TextField
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: value,
                  borderRadius: "4px",
                  border: "1px solid rgba(0,0,0,0.23)",
                  mr: 1,
                }}
              />
              {value}
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiInputBase-input": {
            paddingTop: "8.5px",
            paddingBottom: "8.5px",
            height: "2.4375em",
            cursor: "pointer",
          },
          "& input[type='color']::-webkit-color-swatch-wrapper": {
            padding: 0,
          },
          "& input[type='color']::-webkit-color-swatch": {
            border: "none",
            borderRadius: "4px",
          },
          "& input[type='color']::-moz-color-swatch": {
            border: "none",
            borderRadius: "4px",
          },
        }}
        {...rest}
      />
    </Box>
  );
}

export default ColorPicker;
