import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import { styled } from "@mui/material/styles";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
// Styled components لتحسين تنسيق العناوين والمحتوى والإجراءات
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  "&.MuiDialogTitle-root": {
    padding: theme.spacing(3),
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: theme.palette.text.primary,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&.MuiDialogContent-root": {
    padding: theme.spacing(3),
    textAlign: "center",
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  "&.MuiDialogActions-root": {
    padding: theme.spacing(2, 3, 3, 3),
    justifyContent: "center",
  },
}));

function ConfirmDeleteDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        <MDTypography variant="h5" fontWeight="bold">
          Confirm Deletion
        </MDTypography>
      </StyledDialogTitle>
      <StyledDialogContent>
        <MDTypography variant="body1" color="text">
          Are you sure you want to delete{" "}
          <MDTypography component="span" variant="body1" color="error" fontWeight="bold">
            {itemName}
          </MDTypography>{" "}
          ? This action cannot be undone.
        </MDTypography>
      </StyledDialogContent>
      <StyledDialogActions>
        <MDButton
          variant="outlined"
          color="primary"
          onClick={onClose}
          startIcon={<Icon>cancel</Icon>}
        >
          Cancel
        </MDButton>
        <MDButton
          variant="contained"
          color="error"
          onClick={onConfirm}
          endIcon={<Icon>delete</Icon>}
        >
          Delete
        </MDButton>
      </StyledDialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
