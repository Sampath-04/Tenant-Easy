'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Theme,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCreateTenant } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { useProperty } from '@/contexts/PropertyContext';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { formatDateToYYYYMMDD } from '@/lib/utils/formatters';
import { toast } from 'react-toastify';
import { RoomDetail } from '@/lib/api/types';
import NumberInput from '@/components/ui/NumberInput';
import CustomSelect from '@/components/ui/CustomSelect';
import FileUploadField from '@/components/ui/FileUploadField';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHOD_OPTIONS } from '@/lib/constants/paymentConstants';

// Form data interface that allows undefined for number fields
interface CreateTenantFormData {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail: string;
  monthlyRent?: number;
  securityDepositTotal?: number;
  securityDepositPaid?: number;
  currentReading?: number;
  checkinDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  rentPaid?: number;
  paymentMethod: string;
  paymentProofs: File[];
  includeFood: boolean;
}


interface CreateTenantFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRoomId?: string;
}

export default function CreateTenantForm({ open, onClose, onSuccess, defaultRoomId }: CreateTenantFormProps) {
  const { selectedProperty } = useProperty();
  const createTenantMutation = useCreateTenant();
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms(selectedProperty?.id || '', 1, 1000);


  const [formData, setFormData] = useState<CreateTenantFormData>({
    property: selectedProperty?.id || '',
    room: '',
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: undefined,
    securityDepositTotal: undefined,
    securityDepositPaid: undefined,
    currentReading: undefined,
    checkinDate: formatDateToYYYYMMDD(new Date()),
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    rentPaid: undefined,
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    paymentProofs: [],
    includeFood: false
  });

  // Update form data when property changes
  useEffect(() => {
    if (selectedProperty?.id) {
      setFormData(prev => ({ ...prev, property: selectedProperty.id }));
    }
  }, [selectedProperty]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        property: selectedProperty?.id || '',
        room: defaultRoomId || '',
        tenantName: '',
        tenantNumber: '',
        tenantEmail: '',
        includeFood: false,
        monthlyRent: undefined,
        securityDepositTotal: undefined,
        securityDepositPaid: undefined,
        currentReading: undefined,
        checkinDate: formatDateToYYYYMMDD(new Date()),
        emergencyContact: {
          name: '',
          phone: '',
          relation: ''
        },
        rentPaid: undefined,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        paymentProofs: []
      });
    }
  }, [open, selectedProperty?.id, defaultRoomId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form validation function
  const isFormValid = () => {
    // Check required fields
    if (!formData.tenantName.trim()) return false;
    if (!formData.tenantNumber.trim()) return false;
    if (!formData.room) return false;
    if (!formData.checkinDate) return false;
    if (!formData.monthlyRent || formData.monthlyRent <= 0) return false;
    if (formData.securityDepositTotal === undefined || formData.securityDepositTotal < 0) return false;

    // Check current reading if check-in date is today
    const today = formatDateToYYYYMMDD(new Date());
    if (formData.checkinDate === today && (formData.currentReading === undefined || formData.currentReading < 0)) {
      return false;
    }

    // Check payment proofs if any amount is paid (except for cash payments)
    if ((formData.rentPaid && formData.rentPaid > 0) || (formData.securityDepositPaid && formData.securityDepositPaid > 0)) {
      if (formData.paymentMethod !== 'CASH' && (!formData.paymentProofs || formData.paymentProofs.length === 0)) {
        return false;
      }
    }

    return true;
  };

  // Validation function for current reading
  const getCurrentReadingValidation = () => {
    if (!formData.room || !formData.currentReading) return null;
    
    const selectedRoom = availableRooms.find((room: RoomDetail) => room._id === formData.room);
    const previousReading = selectedRoom?.currentMeterReading || 0;
    
    if (formData.currentReading < previousReading) {
      return {
        error: true,
        message: `Current reading must be greater than or equal to previous reading (${previousReading})`
      };
    }
    
    return null;
  };


  const handleSubmit = async (e?: React.FormEvent) => {
 
    if (e) {
      e.preventDefault();
    }
    
    if (!formData.property || !formData.room) {
      const errorToast = showErrorToast('Please select property and room');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    if (!formData.tenantName || !formData.tenantNumber || !formData.monthlyRent) {
      const errorToast = showErrorToast('Please fill in all required fields');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    // Validate current reading if check-in date is today
    const today = formatDateToYYYYMMDD(new Date());
    if (formData.checkinDate === today && (!formData.currentReading || formData.currentReading === 0)) {
      const errorToast = showErrorToast('Current meter reading is required when check-in date is today');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    // Validate current reading is greater than or equal to previous reading
    if (formData.checkinDate === today && formData.currentReading && formData.room) {
      const selectedRoom = availableRooms.find((room: RoomDetail) => room._id === formData.room);
      const previousReading = selectedRoom?.currentMeterReading || 0;
      
      if (formData.currentReading < previousReading) {
        const errorToast = showErrorToast(`Current reading (${formData.currentReading}) must be greater than or equal to previous reading (${previousReading})`);
        toast.error(errorToast.message, errorToast.config);
        return;
      }
    }

    // Validate payment proofs if rent or security is paid
    if (((formData.rentPaid || 0) > 0 || (formData.securityDepositPaid || 0) > 0) && 
        (!formData.paymentProofs || formData.paymentProofs.length === 0)) {
      const errorToast = showErrorToast('Payment proof is required when rent or security deposit is paid');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    // Calculate final monthly rent (base rent + food if opted)
    const finalMonthlyRent = (formData.monthlyRent || 0) + (formData.includeFood ? (selectedProperty?.foodAmount || 0) : 0);
    
    // Convert undefined values to 0 for API submission
    const submitData = {
      ...formData,
      monthlyRent: finalMonthlyRent,
      securityDepositTotal: formData.securityDepositTotal || 0,
      securityDepositPaid: formData.securityDepositPaid || 0,
      currentReading: formData.currentReading || 0,
      rentPaid: formData.rentPaid || 0,
      foodOpted: formData.includeFood
    };

    createTenantMutation.mutate(submitData, {
      onSuccess: () => {
        const successToast = showSuccessToast('Tenant created successfully!');
        toast.success(successToast.message, successToast.config);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  const handleClose = () => {
    if (!createTenantMutation.isPending) {
      onClose();
    }
  };

  const rooms = roomsData?.data || [];
  const availableRooms = rooms.filter((room: RoomDetail) => !room.isOccupied && room.isActive);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: (theme: Theme) => ({
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          margin:{xs: '12px', md: '32px'},
          width:{xs: '100%', md: '100%'},
        })
      }}
    >
      <DialogTitle
         sx={(theme: Theme) => ({
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           borderBottom: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
           pb: {xs: '12px', md: '24px'},
           color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
           backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
           position: 'sticky',
           top: 0,
           zIndex: 10,
           padding:{xs: '12px', md: '24px'},
         })}
       >
        <p className="font-semibold text-base md:text-lg">
          Add New Tenant
        </p>
        <IconButton onClick={handleClose} disabled={createTenantMutation.isPending}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={(theme: Theme) => ({ 
           pt: {xs: '12px', md: '24px'},
           pb: {xs: '12px', md: '24px'},
           padding:{xs: '12px', md: '24px'},
           backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
           overflow: 'auto',
           flex: 1,
           '&::-webkit-scrollbar': {
             width: '6px',
           },
           '&::-webkit-scrollbar-track': {
             background: 'transparent',
           },
           '&::-webkit-scrollbar-thumb': {
             background: theme.palette.mode === 'dark' ? '#4A5568' : '#CBD5E0',
             borderRadius: '3px',
           },
           '&::-webkit-scrollbar-thumb:hover': {
             background: theme.palette.mode === 'dark' ? '#718096' : '#A0AEC0',
           },
         })}>
          <div className="space-y-6">
           {/* Room Selection */}
             <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
               <p className="mb-4">Room Selection</p>
              <FormControl fullWidth>
                <InputLabel>Room *</InputLabel>
                <Select
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  label="Room *"
                  disabled={isLoadingRooms || createTenantMutation.isPending}
                >
                  {availableRooms.map((room: RoomDetail) => (
                    <MenuItem key={room._id} value={room._id}>
                      Room {room.roomNo} - {room.roomType} (₹{room.property.electricitySettings.ratePerUnit}/unit)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

              {/* Basic Information */}
             <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
               <p className="mb-4">Basic Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Tenant Name *"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                />

                <TextField
                  label="Phone Number *"
                  value={formData.tenantNumber}
                  onChange={(e) => handleInputChange('tenantNumber', e.target.value)}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                />

                <TextField
                  label="Email"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-in Date *"
                    value={formData.checkinDate ? new Date(formData.checkinDate + 'T00:00:00') : null}
                    onChange={(date) => {
                      handleInputChange('checkinDate', formatDateToYYYYMMDD(date));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        disabled: createTenantMutation.isPending,
                      },
                    }}
                  />
                </LocalizationProvider>

                {/* Emergency Contact Fields */}
                <TextField
                  label="Emergency Contact Name"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleInputChange('emergencyContact', { 
                    ...formData.emergencyContact, 
                    name: e.target.value 
                  })}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                />

                <TextField
                  label="Emergency Contact Phone"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => handleInputChange('emergencyContact', { 
                    ...formData.emergencyContact, 
                    phone: e.target.value 
                  })}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                />

                <TextField
                  label="Emergency Contact Relation"
                  value={formData.emergencyContact?.relation || ''}
                  onChange={(e) => handleInputChange('emergencyContact', { 
                    ...formData.emergencyContact, 
                    relation: e.target.value 
                  })}
                  fullWidth
                  disabled={createTenantMutation.isPending}
                  placeholder="e.g., Father, Mother, Spouse"
                />

                {/* Current Meter Reading - Only show if check-in date is today */}
                {formData.checkinDate === formatDateToYYYYMMDD(new Date()) && (
                  <div>
                    <NumberInput
                      label="Current Meter Reading *"
                      value={formData.currentReading}
                      onChange={(value) => handleInputChange('currentReading', value)}
                      placeholder="Enter current reading"
                      fullWidth
                      disabled={createTenantMutation.isPending}
                      error={getCurrentReadingValidation()?.error || false}
                      helperText={
                        getCurrentReadingValidation()?.message ||
                        (formData.room && availableRooms.find((room: RoomDetail) => room._id === formData.room)?.currentMeterReading !== undefined
                          ? `Previous reading: ${availableRooms.find((room: RoomDetail) => room._id === formData.room)?.currentMeterReading} units`
                          : "Select a room to see the previous reading")
                      }
                    />
                  </div>
                )}
              </div>
            </div>

          {/* Financial Information */}
             <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="mb-4">Financial Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent *
                  </label>
                  <NumberInput
                    value={formData.monthlyRent}
                    onChange={(value) => handleInputChange('monthlyRent', value)}
                    placeholder="Enter monthly rent"
                    fullWidth
                    disabled={createTenantMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit Total *
                  </label>
                  <NumberInput
                    value={formData.securityDepositTotal}
                    onChange={(value) => handleInputChange('securityDepositTotal', value)}
                    placeholder="Enter security deposit total"
                    fullWidth
                    disabled={createTenantMutation.isPending}
                  />
                </div>
              </div>
              
              {/* Food Option Toggle */}
              <div className="mt-6">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Include Food
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add food charges to monthly rent (₹{selectedProperty?.foodAmount || 0}/month)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeFood}
                      onChange={(e) => handleInputChange('includeFood', e.target.checked)}
                      className="sr-only peer"
                      disabled={createTenantMutation.isPending}
                    />
                    <div className="w-11 h-6 bg-gray-200 border border-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 dark:border-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                  </label>
                </div>
                
                {/* Final Rent Amount Display */}
                <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-row items-center gap-2 text-md font-medium text-gray-900 dark:text-white">
                      Final Monthly Rent:
                      {formData.includeFood && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Base Rent: ₹{formData.monthlyRent || 0} + Food: ₹{selectedProperty?.foodAmount || 0}
                    </div>
                  )}
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{(formData.monthlyRent || 0) + (formData.includeFood ? (selectedProperty?.foodAmount || 0) : 0)}
                    </span>
                  </div>
                  
                </div>
              </div>
            </div>

             {/* Amount Paid Information */}
             <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
               <p className="mb-4">Amount Paid</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rent Paid
                  </label>
                  <NumberInput
                    value={formData.rentPaid}
                    onChange={(value) => handleInputChange('rentPaid', value)}
                    placeholder="Enter rent paid"
                    fullWidth
                    disabled={createTenantMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit Paid
                  </label>
                  <NumberInput
                    value={formData.securityDepositPaid}
                    onChange={(value) => handleInputChange('securityDepositPaid', value)}
                    placeholder="Enter security deposit paid"
                    fullWidth
                    disabled={createTenantMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <CustomSelect
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    options={PAYMENT_METHOD_OPTIONS}
                    sx={{
                      borderRadius: "8px",
                      "& .MuiSelect-select": {
                        borderRadius: "8px",
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads - Only show if any amount is paid */}
             <div className={`transition-all duration-300 ease-in-out ${
               ((formData.rentPaid || 0) > 0 || (formData.securityDepositPaid || 0) > 0) 
                 ? 'opacity-100 max-h-screen' 
                 : 'opacity-0 max-h-0 overflow-hidden'
             }`}>
               {((formData.rentPaid || 0) > 0 || (formData.securityDepositPaid || 0) > 0) && (
                 <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                   <p className="mb-4 text-base md:text-lg">Document Uploads</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Proofs *
                    </label>
                    <FileUploadField
                      onFileSelect={(files: File | File[]) => handleInputChange('paymentProofs', files as File[])}
                      accept="image/*"
                      placeholder="Upload payment proofs"
                      multiple={true}
                      selectedFiles={formData.paymentProofs}
                      maxFiles={2}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formData.paymentMethod === 'CASH' 
                        ? 'Optional for cash payments' 
                        : 'Required when rent or security deposit is paid'}
                    </p>
                  </div>
                </div>
               )}
             </div>
          </div>
        </DialogContent>

      </form>
      
      <DialogActions sx={(theme: Theme) => ({ 
           px:{xs: '12px', md: '24px'}, 
           py:{xs: '12px', md: '24px'}, 
           gap: {xs: '8px', md: '24px'},
           backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
           borderTop: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
           flexShrink: 0,
         })}>
          <button
            type="button"
            onClick={handleClose}
            disabled={createTenantMutation.isPending}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-[30px] text-md font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
             type="submit"
             onClick={handleSubmit}
             disabled={createTenantMutation.isPending || !isFormValid()}
             className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-[30px] text-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
           >
            {createTenantMutation.isPending ? (
              <>
                <CircularProgress size={16} color="inherit" />
                Creating...
              </>
            ) : (
              <>
                <SaveIcon fontSize="small" />
                Create Tenant
              </>
            )}
          </button>
      </DialogActions>
    </Dialog>
  );
}
