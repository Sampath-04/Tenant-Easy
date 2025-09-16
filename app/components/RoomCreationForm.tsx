import React, { useState } from "react";
import {
  Checkbox,
  Chip,
  Switch,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Box
} from "@mui/material";
import {
  MeetingRoom as RoomIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  LocalHotel as BedIcon,
  Balcony as BalconyIcon,
  Kitchen as KitchenIcon,
  LocalParking as ParkingIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Tv as TvIcon
} from "@mui/icons-material";
import { useCreateRoom } from "@/hooks/useRooms";
import { useProperty } from "@/contexts/PropertyContext";

export const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'WiFi', icon: <WifiIcon fontSize="small" /> },
  { value: 'tv', label: 'TV', icon: <TvIcon fontSize="small" /> },
  { value: 'ac', label: 'AC', icon: <AcIcon fontSize="small" /> },
  { value: 'attached_bathroom', label: 'Attached Bathroom', icon: <BedIcon fontSize="small" /> },
  { value: 'balcony', label: 'Balcony', icon: <BalconyIcon fontSize="small" /> },
  { value: 'kitchen', label: 'Kitchen', icon: <KitchenIcon fontSize="small" /> },
];

export const ROOM_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Room' },
  { value: 'sharing', label: 'Sharing Room' },
];

interface RoomCreationFormProps {
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  isPending?: boolean;
  error?: any;
}

export default function AddRoomForm({ onClose, onSubmit, isPending = false, error }: RoomCreationFormProps) {
  const createRoomMutation = useCreateRoom();
  const { selectedProperty } = useProperty();

  const [formData, setFormData] = useState({
    property: selectedProperty?.id || '',
    roomNo: "",
    roomType: "sharing",
    maxCapacity: 2,
    amenities: ["ac", "attached_bathroom", "wifi", "balcony", 'tv'],
    currentMeterReading: 0,
    isActive: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Form validation function
  const isFormValid = () => {
    // Check required fields
    if (!formData.roomNo.trim()) return false;
    if (!formData.roomType) return false;
    if (!formData.maxCapacity || formData.maxCapacity < 1 || formData.maxCapacity > 10) return false;
    if (!formData.amenities || formData.amenities.length === 0) return false;
    if (formData.currentMeterReading === undefined || formData.currentMeterReading < 0) return false;
    
    return true;
  };

  const handleButtonSubmit = () => {

    // Use the mutation if no onSubmit prop is provided
    if (onSubmit) {
      onSubmit(formData);
    } else {
      createRoomMutation.mutate(formData, {
        onSuccess: () => {
          onClose?.();
        }
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between md:p-4 p-2">
          <h1 className="md:text-xl text-lg font-bold text-gray-900 dark:text-white">
            New Room
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <div className="md:p-6 p-4">
         {(error || createRoomMutation.error) && (
           <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
             <div className="flex">
               <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div className="text-red-800 dark:text-red-200">
                 {error?.message || createRoomMutation.error?.message || 'An error occurred'}
               </div>
             </div>
           </div>
         )}

        <form className="md:space-y-8 space-y-4">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:p-6 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <HomeIcon className="mr-2"/>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.roomNo}
                  onChange={(e) => handleInputChange('roomNo', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="Enter room number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Type *
                </label>
                <Autocomplete
                  options={ROOM_TYPE_OPTIONS}
                  value={ROOM_TYPE_OPTIONS.find(type => type.value === formData.roomType)}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      handleInputChange('roomType', newValue.value);
                    }
                  }}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Room Type"
                      placeholder="Select room type"
                      
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <BedIcon sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#4b5563',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#6b7280',
                      },
                    },
                    '& .MuiFormLabel-root':{
                        display: 'none',
                    },
                    '& .MuiAutocomplete-popupIndicator': {
                      color: '#6b7280',
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                      color: '#6b7280',
                    },
                    '& .MuiAutocomplete-option': {
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#e5e7eb',
                      },
                    },
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', Number(e.target.value))}
                  required
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="Enter max capacity"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Status
                </label>
                <div className="flex items-center h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                  <Switch
                    checked={true}
                    disabled
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#3b82f6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#3b82f6'
                      },
                      '& .MuiSwitch-switchBase.Mui-disabled': {
                        color: '#3b82f6',
                      },
                      '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                        backgroundColor: '#3b82f6',
                        opacity: 0.7,
                      }
                    }}
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </div>
              </div> */}
            </div>
          </div>

            {/* Amenities */}
           <div className="bg-white dark:bg-gray-800 rounded-lg md:p-6 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
             <h2 className="md:text-xl text-lg font-semibold text-gray-900 dark:text-white md:mb-6 mb-4 flex items-center">
               <SettingsIcon className="mr-2"/>
               Amenities
             </h2>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Available Amenities
               </label>
               
               {/* Desktop View - Checkbox Grid */}
               <div className="hidden md:grid grid-cols-3 gap-4">
                 {AMENITY_OPTIONS.map((amenity) => (
                   <label
                     key={amenity.value}
                     htmlFor={`${amenity.value}-checkbox`}
                     className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors duration-200"
                   >
                     <Checkbox
                       id={`${amenity.value}-checkbox`}
                       checked={formData.amenities.includes(amenity.value)}
                       onChange={(e) => {
                         if (e.target.checked) {
                           handleInputChange('amenities', [...formData.amenities, amenity.value]);
                         } else {
                           handleInputChange('amenities', formData.amenities.filter(a => a !== amenity.value));
                         }
                       }}
                       sx={{
                         color: '#6b7280',
                         '&.Mui-checked': {
                           color: '#3b82f6'
                         }
                       }}
                     />
                     <div className="flex items-center ml-2">
                       {amenity.icon}
                       <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                         {amenity.label}
                       </span>
                     </div>
                   </label>
                 ))}
               </div>

               {/* Mobile View - MUI Select */}
               <div className="md:hidden">
                 <FormControl fullWidth sx={{ mb: 3 }}>
                   <InputLabel>Amenities</InputLabel>
                   <Select
                     multiple
                     value={formData.amenities}
                     onChange={(e) =>
                       handleInputChange('amenities', e.target.value as string[])
                     }
                     input={<OutlinedInput />}
                     renderValue={(selected) => (
                       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                         {selected.map((value: string) => (
                           <Chip
                             key={value}
                             label={value.replace("_", " ").toUpperCase()}
                             size="small"
                             sx={{ borderRadius: "8px" }}
                           />
                         ))}
                       </Box>
                     )}
                   >
                     {AMENITY_OPTIONS.map((amenity) => (
                       <MenuItem key={amenity.value} value={amenity.value}>
                         <Checkbox checked={formData.amenities.indexOf(amenity.value) > -1} />
                         {amenity.icon}
                         <span style={{ marginLeft: 8 }}>{amenity.label}</span>
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </div>
             </div>
           </div>

          {/* Meter Readings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:p-6 p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="md:text-xl text-lg font-semibold text-gray-900 dark:text-white md:mb-6 mb-4 flex items-center">
              <RoomIcon className="mr-2"/>
              Meter Readings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Meter Reading *
                </label>
                <input
                  type="number"
                  value={formData.currentMeterReading === undefined ? '' : formData.currentMeterReading}
                  onChange={(e) => handleInputChange('currentMeterReading', Number(e.target.value))}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="Enter current reading"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-end space-x-3 md:p-4 p-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 rounded-[30px] cursor-pointer transition-colors duration-200"
            >
              Cancel
            </button>
          )}
                     <button
             onClick={handleButtonSubmit}
             disabled={isPending || createRoomMutation.isPending || !isFormValid()}
             className="px-6 py-2  bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {(isPending || createRoomMutation.isPending) ? (
               <div className="flex items-center">
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                 Creating...
               </div>
             ) : (
               <div className="flex items-center">
                 <SaveIcon className="mr-2"/>
                 Save Changes
               </div>
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
