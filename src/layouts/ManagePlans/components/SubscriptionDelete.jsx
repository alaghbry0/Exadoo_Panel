import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Icon from "@mui/material/Icon"; // Import Icon for visual enhancements
import { styled } from "@mui/material/styles"; // Import styled for custom styling

// Styled Dialog Title for better visual hierarchy
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  "&.MuiDialogTitle-root": {
    padding: theme.spacing(3), // Increased padding
    textAlign: "center", // Center align the title
    fontWeight: "bold", // Make title bold
    fontSize: "1.5rem", // Increased font size
    color: theme.palette.text.primary, // Use primary text color from theme
  },
}));

// Styled Dialog Content for better readability
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&.MuiDialogContent-root": {
    padding: theme.spacing(3), // Increased padding
    textAlign: "center", // Center align the text
  },
}));

// Styled Dialog Actions for better button alignment and spacing
const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  "&.MuiDialogActions-root": {
    padding: theme.spacing(2, 3, 3, 3), // Adjusted padding for actions
    justifyContent: "center", // Center buttons in the action area
  },
}));

function ConfirmDeleteDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <StyledDialogTitle>Confirm Deletion {/* English Dialog Title */}</StyledDialogTitle>
      <StyledDialogContent>
        <Typography variant="body1" color="textSecondary">
          {" "}
          {/* Use body1 and textSecondary for message */}
          Are you sure you want to delete
          <Typography variant="body1" component="strong" color="error">
            {" "}
            {/* Strong and error color for item name */}
            &nbsp;{itemName}&nbsp;
          </Typography>{" "}
          ? This action cannot be undone.
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
          startIcon={<Icon>cancel</Icon>}
        >
          {" "}
          {/* Cancel Button with Icon */}
          Cancel {/* English Cancel Button Text */}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" endIcon={<Icon>delete</Icon>}>
          {" "}
          {/* Delete Button with Icon and contained variant */}
          Delete {/* English Delete Button Text */}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
