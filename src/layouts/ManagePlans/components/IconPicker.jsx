import React from "react";
import MDInput from "components/MDInput";
import { InputAdornment } from "@mui/material";
import Icon from "@mui/material/Icon";

function IconPicker({
  label = "Icon Name",
  value,
  onChange,
  disabled = false,
  placeholder = "e.g., category, trending_up",
  ...rest
}) {
  return (
    <MDInput
      label={label}
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      variant="outlined"
      placeholder={placeholder}
      InputProps={{
        startAdornment: value ? (
          <InputAdornment position="start">
            <Icon>{value}</Icon>
          </InputAdornment>
        ) : null,
      }}
      {...rest}
    />
  );
}

export default IconPicker;
