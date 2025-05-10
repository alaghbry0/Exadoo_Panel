// src/layouts/ManagePlans/components/FeaturesInput.jsx (مثال إذا كان يستخدم Autocomplete)
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox"; // إذا كنت تستخدمه للتغليف

function FeaturesInput({ value, onChange }) {
  // تأكد أن القيمة المدخلة هي دائمًا مصفوفة
  const currentTags = Array.isArray(value) ? value : [];

  return (
    <MDBox>
      {" "}
      {/* يمكنك إزالة هذا إذا لم تكن بحاجة إليه */}
      <Autocomplete
        multiple
        id="features-tags-input"
        options={[]} // اتركها فارغة إذا كنت تسمح بإدخال حر فقط
        value={currentTags} // استخدم القيمة المعالجة
        onChange={(event, newValue) => {
          // newValue ستكون مصفوفة من النصوص
          onChange(
            newValue.map((item) => (typeof item === "string" ? item : item.inputValue || ""))
          ); // معالجة القيم الجديدة
        }}
        freeSolo // يسمح بإدخال قيم غير موجودة في options
        renderTags={(tagValue, getTagProps) => {
          // هذا هو المكان الذي كان يحدث فيه الخطأ
          // تأكد أن tagValue هي مصفوفة قبل استدعاء .map()
          const tagsToRender = Array.isArray(tagValue) ? tagValue : [];
          return tagsToRender.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              key={option + index} // مفتاح أكثر قوة
            />
          ));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined" // أو "standard" أو "filled" حسب تصميمك
            label="Features"
            placeholder="Type a feature and press Enter"
            fullWidth
            margin="dense" // متناسق مع بقية المدخلات
          />
        )}
        sx={{ mt: 1 }}
      />
    </MDBox>
  );
}

export default FeaturesInput;
