// src/layouts/ManagePlans/components/FeaturesInput.jsx
// أو يمكنك تسميته ArrayOfStringsInput.jsx إذا كان ذلك أوضح
import React from "react";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Tooltip from "@mui/material/Tooltip";

// أضف props جديدة: itemLabel, placeholderText
function FeaturesInput({
  value = [], // قيمة افتراضية كمصفوفة فارغة
  onChange,
  itemLabel = "Feature", // قيمة افتراضية لـ itemLabel
  placeholderText = "Enter a feature", // قيمة افتراضية لـ placeholderText
}) {
  const handleAddItem = () => {
    // تأكد أن value هي مصفوفة قبل استخدام spread operator
    const currentValue = Array.isArray(value) ? value : [];
    onChange([...currentValue, ""]);
  };

  const handleRemoveItem = (index) => {
    // تأكد أن value هي مصفوفة
    const currentValue = Array.isArray(value) ? value : [];
    const newValue = currentValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleChangeItem = (index, newValue) => {
    // تأكد أن value هي مصفوفة
    const currentValue = Array.isArray(value) ? value : [];
    const updatedValue = currentValue.map((item, i) => (i === index ? newValue : item));
    onChange(updatedValue);
  };

  // تأكد دائمًا أن value هي مصفوفة عند العرض
  const itemsToRender = Array.isArray(value) ? value : [];

  return (
    <MDBox>
      {itemsToRender.map((item, index) => (
        <MDBox key={index} display="flex" alignItems="center" mb={1}>
          <MDInput
            fullWidth
            label={`${itemLabel} ${index + 1}`} // استخدم itemLabel
            value={item} // كانت feature، تم تغييرها إلى item لتكون عامة
            onChange={(e) => handleChangeItem(index, e.target.value)}
            placeholder={placeholderText} // استخدم placeholderText
            sx={{ mr: 1 }}
            margin="dense" // للحفاظ على التناسق مع بقية الحقول
          />
          {/*
            يمكن إزالة عنصر إذا كانت القائمة تحتوي على عنصر واحد أو أكثر.
            الشرط value.length > 0 يضمن أن زر الحذف يظهر طالما هناك عناصر.
            إذا كنت تريد أن يظل عنصر واحد على الأقل دائمًا، يمكنك تغيير الشرط إلى value.length > 1
          */}
          {itemsToRender.length > 0 && (
            <Tooltip title={`Remove ${itemLabel}`}>
              <IconButton onClick={() => handleRemoveItem(index)} color="error" size="small">
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </MDBox>
      ))}
      <MDButton
        onClick={handleAddItem}
        variant="outlined"
        color="info"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        sx={{ mt: itemsToRender.length > 0 ? 0.5 : 0 }} // مسافة علوية صغيرة إذا كانت هناك عناصر
      >
        Add {itemLabel} {/* استخدم itemLabel */}
      </MDButton>
    </MDBox>
  );
}

export default FeaturesInput;
