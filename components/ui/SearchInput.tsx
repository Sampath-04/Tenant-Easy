import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    color: theme.palette.mode === 'dark' ? 'white' : 'black',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(75, 85, 99, 1)' : '1px solid rgba(209, 213, 219, 1)',
    borderRadius: '30px',
  },

  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    borderColor:
      theme.palette.mode === "dark"
        ? "rgb(59, 130, 246)" // Tailwind blue-500 in dark
        : "rgb(37, 99, 235)", // Tailwind blue-600 in light
    borderWidth: "2px",
  },
  
  '& .MuiInputAdornment-root': {
    marginRight: '0px',
  },
  '& .MuiInputBase-input': {
    color: theme.palette.mode === 'dark' ? 'white' : 'black',
    padding:"12px"
  },
  '& .MuiInputBase-input::placeholder': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
  },
}));

interface SearchInputProps extends Omit<TextFieldProps, 'variant'> {
  isDark?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  className = '',
  ...props 
}) => {
  return (
    <StyledTextField
      variant="outlined"
      fullWidth
      className={className}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search className="text-gray-600 dark:text-gray-300" />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default SearchInput;
