import React from 'react';
import {
  Select,
  SelectProps,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Theme } from '@mui/material/styles';

interface CustomSelectProps extends Omit<SelectProps, 'variant' | 'onChange' | 'value'> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (event: any) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <FormControl fullWidth className={className}>
      {label && (
        <InputLabel
          sx={(theme: Theme) => ({
            position: 'static',
            transform: 'none',
            marginBottom: '6px',
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.mode === "dark" ? "white" : "black",
          })}
        >
          {label}
        </InputLabel>
      )}
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        sx={(theme: Theme) => ({
          borderRadius: "30px", // rounded corners
          fontSize: "14px",
      
          // background + text
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)" // gray-800/90
              : "rgba(255, 255, 255, 0.9)",
          color: theme.palette.mode === "dark" ? "white" : "black",
      
          // border
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(75, 85, 99, 1)" // gray-600
              : "rgba(209, 213, 219, 1)" // gray-300
          }`,
      
          // padding
          "& .MuiSelect-select": {
            padding: "14px",
            borderRadius: "8px", // needed so text area matches
          },
      
          // focus / hover states
          "&.Mui-focused": {
            borderColor: theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb", // Tailwind blue-500/600
          },
          "&:hover": {
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(156, 163, 175, 0.5)" // gray-400/50
                : "rgba(0, 0, 0, 0.3)", // subtle dark hover in light mode
          },
        })}
        MenuProps={{
          PaperProps: {
            sx: (theme: Theme) => ({
              border: "1px solid rgba(156, 163, 175, 0.2)",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",

              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(31, 41, 55, 0.95)" // gray-800/90
                  : "rgba(255, 255, 255, 0.95)",

              "& .MuiMenuItem-root": {
                color: theme.palette.mode === "dark" ? "white" : "black",
                fontSize: "14px",

                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(156, 163, 175, 0.1)" // gray-400/10
                      : "rgba(0, 0, 0, 0.05)", // light hover
                },

                "&.Mui-selected": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(156, 163, 175, 0.2)" // gray-400/20
                      : "rgba(0, 0, 0, 0.08)", // light selected
                  color: theme.palette.mode === "dark" ? "white" : "black",

                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(156, 163, 175, 0.25)"
                        : "rgba(0, 0, 0, 0.12)",
                  },
                },
              },
            }),
          },
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;

