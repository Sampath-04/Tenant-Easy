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

  return (
    <TextField
      type="number"
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={className}
      sx={(theme: Theme) => ({
        flex: 1,
        minWidth: minWidth,
        "& .MuiInputBase-root": {
          borderRadius: "30px",
          height: "48px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(55, 65, 81, 0.8)" // gray-700/80
              : "rgba(255, 255, 255, 0.8)",
          color: theme.palette.mode === "dark" ? "white" : "black",
          border: `1px solid ${theme.palette.mode === "dark"
            ? "rgba(75, 85, 99, 1)" // gray-600
            : "rgba(209, 213, 219, 1)" // gray-300
            }`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease-in-out",
        },
        "& .MuiInputBase-input": {
          padding: "12px 14px",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none", // already handled above
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(156, 163, 175, 0.6)"
              : "rgba(0, 0, 0, 0.3)",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 3px ${theme.palette.mode === "dark"
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.2)"
            }`,
        },
        "& .MuiInputBase-input::placeholder": {
          color:
            theme.palette.mode === "dark"
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
