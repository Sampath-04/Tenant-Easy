import React from 'react';
import { TextField, TextFieldProps, Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';

interface NumberInputProps extends Omit<TextFieldProps, 'variant' | 'type' | 'onChange'> {
  placeholder?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  minWidth?: string;
  customeStyles?: SystemStyleObject | ((theme: Theme) => SystemStyleObject);
}

const NumberInput: React.FC<NumberInputProps> = ({
  placeholder = "Enter amount",
  value = "",
  onChange,
  minWidth = "100px",
  className = '',
  customeStyles,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue ? Number(newValue) : undefined);
    }
  };

  // Show placeholder when value is 0, empty, or undefined
  const displayValue = (value === 0 || value === "" || value === undefined) ? "" : value;

  return (
    <TextField
      type="number"
      variant="outlined"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      className={className}
      sx={(theme: Theme) => ({
        flex: 1,
        minWidth: minWidth,
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px", // Match standard TextField styling
          color: theme.palette.mode === "dark" ? "white" : "black",
          "& fieldset": {
            borderColor: theme.palette.mode === "dark" 
              ? "rgba(75, 85, 99, 1)" 
              : "rgba(209, 213, 219, 1)",
          },
          "&:hover fieldset": {
            borderColor: theme.palette.mode === "dark" 
              ? "rgba(75, 85, 99, 0.8)" 
              : "rgba(209, 213, 219, 0.8)",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: "2px",
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.6)"
            : "rgba(0,0,0,0.5)",
        },
        ...(typeof customeStyles === 'function' ? customeStyles(theme) : customeStyles)
      })}
      {...props}
    />
  );
};

export default NumberInput;
