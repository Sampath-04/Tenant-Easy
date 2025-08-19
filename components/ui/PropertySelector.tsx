'use client';

import { Autocomplete, TextField } from '@mui/material';
import { Property, useProperty } from '../../contexts/PropertyContext';

export function PropertySelector() {
  const { selectedProperty, setSelectedProperty, properties, isLoading, error } = useProperty();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-red-600 dark:text-red-400">Failed to load properties</span>
      </div>
    );
  }

  if (!selectedProperty || properties.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">No properties available</span>
      </div>
    );
  }

  return (
    <Autocomplete
      options={properties}
      getOptionLabel={(option: Property) => option.name}
      value={selectedProperty}
      onChange={(_, value: Property | null) => setSelectedProperty(value as Property)}
      renderInput={(params) => <TextField {...params} label="Property" />}
      disableClearable
      sx={(theme) => ({
        "& .MuiInputBase-root": {
          borderRadius: "30px",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "4px",
          paddingLeft: "10px !important",
          textColor: "#4a5565",
        },
        "& .MuiOutlinedInput-root": {
          padding: "4px",
          width: "180px",
          height: "100%",
        },
      })}
    />
  );
}
