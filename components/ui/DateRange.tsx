"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

type DateRange = {
  from: string | null;
  to: string | null;
};

interface DateRangePickerProps {
  label?: string;
  value: DateRange;
  onChange: (newValue: DateRange) => void;
}

const formatDate = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = "Date Range",
  value,
  onChange,
}) => {
  const handleChange = (key: "from" | "to", newValue: Date | null) => {
    onChange({
      ...value,
      [key]: newValue ? newValue.toISOString().split("T")[0] : null,
    });
  };

  const commonSx = (theme: any) => ({
    "& .MuiSvgIcon-root": {
      color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
    },
    "& .MuiPickersInputBase-root": {
      borderRadius: "30px",
      padding: "0px 20px",
      height: "48px",
      backgroundColor: theme.palette.mode === "dark" ? "rgba(55,65,81,0.8)" : "rgba(255,255,255,0.8)",
      "@media (max-width: 768px)": {
        padding: "0px 10px",
        fontSize: "14px",
      },
    },
    "& .MuiPickersSectionList-root": {
      "@media (max-width: 768px)": {
        maxWidth: "80px",
      },
    },
    "& .MuiInputAdornment-root":{
      "@media (max-width: 768px)": {
        marginLeft: "-2px"
      }
    },
    "& .MuiInputBase-root": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(55,65,81,0.8)" // gray-700/80
          : "rgba(255,255,255,0.8)",
      color: theme.palette.mode === "dark" ? "white" : "black",
      border: `1px solid ${
        theme.palette.mode === "dark"
          ? "rgba(75,85,99,1)" // gray-600
          : "rgba(229,231,235,1)" // gray-200
      }`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "all 0.2s ease-in-out",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(156,163,175,0.6)"
          : "rgba(0,0,0,0.3)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${
        theme.palette.mode === "dark"
          ? "rgba(59,130,246,0.4)"
          : "rgba(59,130,246,0.2)"
      }`,
    },
    "& .MuiInputBase-input::placeholder": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.6)"
          : "rgba(0,0,0,0.5)",
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="body2"
          sx={(theme) => ({
            fontWeight: 600,
            color: theme.palette.mode === "dark" ? "#D1D5DB" : "#374151",
          })}
        >
          {label}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <DatePicker
            value={value.from ? new Date(value.from) : null}
            onChange={(date) =>
              handleChange("from", date ? new Date(formatDate(date)) : null)
            }
            slotProps={{
              textField: {
                fullWidth: true,
                placeholder: "From", 
                sx: commonSx,
              },
            }}
          />

          <DatePicker
            value={value.to ? new Date(value.to) : null}
            onChange={(date) =>
              handleChange("to", date ? new Date(formatDate(date)) : null)
            }
            slotProps={{
              textField: {
                fullWidth: true,
                placeholder: "To",
                sx: commonSx,
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
