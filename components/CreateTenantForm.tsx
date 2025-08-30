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



interface CreateTenantRequest {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  monthlyRent: number;
  securityDepositTotal: number;
  securityDepositPaid: number;
  currentReading?: number;
  checkinDate: string;
  tenantIdProof?: File;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  rentPaid: number;
  paymentMethod: string;
  paymentProofs?: File[];
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

  // Reusable NumberInput styles with theme support
  const numberInputStyles = (theme: Theme) => ({
    "& .MuiInputBase-root": {
      borderRadius: "8px", // Override the default 30px to match other inputs
      backgroundColor: theme.palette.mode === "dark" 
        ? "rgba(55, 65, 81, 0.8)" 
        : "rgba(255, 255, 255, 0.8)",
      color: theme.palette.mode === "dark" ? "white" : "black",
      border: theme.palette.mode === "dark" 
        ? "1px solid #4a5565" 
        : "1px solid #d1d5db",
      "&.Mui-focused": {
        borderColor: "#3B82F6",
        border: "2px solid #3B82F6",
      }
    }
  });

  const [formData, setFormData] = useState<CreateTenantRequest>({
    property: selectedProperty?.id || '',
    room: '',
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: 0,
    securityDepositTotal: 0,
    securityDepositPaid: 0,
    currentReading: 0,
    checkinDate: formatDateToYYYYMMDD(new Date()),
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    rentPaid: 0,
    paymentMethod: 'CASH',
    paymentProofs: []
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
        monthlyRent: 0,
        securityDepositTotal: 0,
        securityDepositPaid: 0,
        currentReading: 0,
        checkinDate: formatDateToYYYYMMDD(new Date()),
        emergencyContact: {
          name: '',
          phone: '',
          relation: ''
        },
        rentPaid: 0,
        paymentMethod: 'CASH',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Validate payment proofs if rent or security is paid
    if ((formData.rentPaid > 0 || formData.securityDepositPaid > 0) && 
        (!formData.paymentProofs || formData.paymentProofs.length === 0)) {
      const errorToast = showErrorToast('Payment proof is required when rent or security deposit is paid');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    createTenantMutation.mutate(formData, {
      onSuccess: () => {
        const successToast = showSuccessToast('Tenant created successfully!');
        toast.success(successToast.message, successToast.config);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error) => {
        const errorToast = showErrorToast('Failed to create tenant');
        toast.error(errorToast.message, errorToast.config);
      }
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: (theme: Theme) => ({
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
        })
      }}
    >
      <DialogTitle
         sx={(theme: Theme) => ({
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           borderBottom: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
           pb: 2,
           color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
           backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
           position: 'sticky',
           top: 0,
           zIndex: 10,
         })}
       >
        <p className="font-semibold text-lg">
          Add New Tenant
        </p>
        <IconButton onClick={handleClose} disabled={createTenantMutation.isPending}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <DialogContent sx={(theme: Theme) => ({ 
           pt: 3,
           backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
         })}>
          <div className="space-y-6">
           {/* Room Selection */}
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
               <Typography variant="h6" className="mb-4">Room Selection</Typography>
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
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
               <Typography variant="h6" className="mb-4">Basic Information</Typography>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Meter Reading *
                    </label>
                    <NumberInput
                      value={formData.currentReading}
                      onChange={(value) => handleInputChange('currentReading', value || 0)}
                      placeholder="Enter current reading"
                      customeStyles={numberInputStyles}
                    />
                  </div>
                )}
              </div>
            </div>

                         {/* Financial Information */}
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
               <Typography variant="h6" className="mb-4">Financial Information</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent *
                  </label>
                  <NumberInput
                    value={formData.monthlyRent}
                    onChange={(value) => handleInputChange('monthlyRent', value || 0)}
                    placeholder="Enter monthly rent"
                    customeStyles={numberInputStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit Total *
                  </label>
                  <NumberInput
                    value={formData.securityDepositTotal}
                    onChange={(value) => handleInputChange('securityDepositTotal', value || 0)}
                    placeholder="Enter security deposit total"
                    customeStyles={numberInputStyles}
                  />
                </div>
              </div>
            </div>

                         {/* Amount Paid Information */}
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
               <Typography variant="h6" className="mb-4">Amount Paid</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rent Paid
                  </label>
                  <NumberInput
                    value={formData.rentPaid}
                    onChange={(value) => handleInputChange('rentPaid', value || 0)}
                    placeholder="Enter rent paid"
                    customeStyles={numberInputStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit Paid
                  </label>
                  <NumberInput
                    value={formData.securityDepositPaid}
                    onChange={(value) => handleInputChange('securityDepositPaid', value || 0)}
                    placeholder="Enter security deposit paid"
                    customeStyles={numberInputStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <CustomSelect
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    options={[
                      { value: 'CASH', label: 'Cash' },
                      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                      { value: 'UPI', label: 'UPI' },
                      { value: 'CHEQUE', label: 'Cheque' },
                      { value: 'CARD', label: 'Card' },
                    ]}
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
             {(formData.rentPaid > 0 || formData.securityDepositPaid > 0) && (
               <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                 <Typography variant="h6" className="mb-4">Document Uploads</Typography>
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
                    maxFiles={4}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Required when rent or security deposit is paid
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>

      </form>
      
      <DialogActions sx={(theme: Theme) => ({ 
           px: 3, 
           py: 2, 
           gap: 2,
           backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
           position: 'sticky',
           bottom: 0,
           zIndex: 10,
           borderTop: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
           boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
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
             type="button"
             onClick={handleSubmit}
             disabled={createTenantMutation.isPending}
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
