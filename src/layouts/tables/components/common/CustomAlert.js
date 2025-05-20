// src/layouts/tables/components/common/CustomAlert.js
import React, { forwardRef } from "react";
import MuiAlert from "@mui/material/Alert";

const CustomAlert = forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default CustomAlert;
