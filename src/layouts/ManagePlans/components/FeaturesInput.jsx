// src/components/FeaturesInput.jsx
import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

function FeaturesInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState("");

  return (
    <Autocomplete
      multiple
      freeSolo
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={[]} // لا اقتراحات افتراضية، المستخدم يضيف القيم بنفسه
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Features" placeholder="Type and press Enter" />
      )}
    />
  );
}

export default FeaturesInput;
