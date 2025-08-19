import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.02)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${
        isDark
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.15)"
      }`,
      transition: "all 0.2s ease-in-out",

      "&:hover": {
        backgroundColor: isDark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.05)",
        borderColor: isDark
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(0, 0, 0, 0.3)",
      },

      "&.Mui-focused": {
        backgroundColor: isDark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.06)",
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${
          isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.1)"
        }`,
      },

      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },

      "& .MuiInputBase-input": {
        padding: "12px 16px",
        fontSize: "14px",
        color: theme.palette.text.primary,
        fontWeight: 500,

        "&::placeholder": {
          color: theme.palette.text.secondary,
          opacity: 1,
        },
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: "14px",
      fontWeight: 600,
      color: theme.palette.text.secondary,
      marginBottom: "6px",

      "&.Mui-focused": {
        color: theme.palette.text.primary,
      },
    },
  };
});

interface CustomInputProps extends Omit<TextFieldProps, "variant"> {}

const CustomInput: React.FC<CustomInputProps> = ({
  className = "",
  ...props
}) => {
  return (
    <StyledTextField
      variant="outlined"
      fullWidth
      className={className}
      {...props}
    />
  );
};

export default CustomInput;
