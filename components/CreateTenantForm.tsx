'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCreateTenant } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { useProperty } from '@/contexts/PropertyContext';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { formatDateToYYYYMMDD } from '@/lib/utils/formatters';
import { toast } from 'react-toastify';
import { RoomDetail } from '@/lib/api/types';

interface CreateTenantRequest {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  monthlyRent: number;
  securityDepositPaid?: number;
  currentReading?: number;
  checkInDate: string;
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

  const [formData, setFormData] = useState<CreateTenantRequest>({
    property: selectedProperty?.id || '',
    room: '',
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: 0,
    securityDepositPaid: 0,
    currentReading: 0,
    checkInDate: formatDateToYYYYMMDD(new Date())
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
        securityDepositPaid: 0,
        currentReading: 0,
        checkInDate: formatDateToYYYYMMDD(new Date())
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

    createTenantMutation.mutate(formData, {
      onSuccess: () => {
        const successToast = showSuccessToast('Tenant created successfully!');
        toast.success(successToast.message, successToast.config);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          pb: 2,
        }}
      >
        <Typography variant="h6" className="font-semibold">
          Add New Tenant
        </Typography>
        <IconButton onClick={handleClose} disabled={createTenantMutation.isPending}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Selection */}
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
                    Room {room.roomNo} - {room.roomType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tenant Name */}
            <TextField
              label="Tenant Name *"
              value={formData.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              fullWidth
              disabled={createTenantMutation.isPending}
            />

            {/* Phone Number */}
            <TextField
              label="Phone Number *"
              value={formData.tenantNumber}
              onChange={(e) => handleInputChange('tenantNumber', e.target.value)}
              fullWidth
              disabled={createTenantMutation.isPending}
            />

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
              fullWidth
              disabled={createTenantMutation.isPending}
            />

            {/* Monthly Rent */}
            <TextField
              label="Monthly Rent *"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
              fullWidth
              disabled={createTenantMutation.isPending}
              inputProps={{ min: 0 }}
            />

            {/* Security Deposit */}
            <TextField
              label="Security Deposit"
              type="number"
              value={formData.securityDepositPaid}
              onChange={(e) => handleInputChange('securityDepositPaid', Number(e.target.value))}
              fullWidth
              disabled={createTenantMutation.isPending}
              inputProps={{ min: 0 }}
            />

            {/* Current Reading */}
            <TextField
              label="Current Meter Reading"
              type="number"
              value={formData.currentReading}
              onChange={(e) => handleInputChange('currentReading', Number(e.target.value))}
              fullWidth
              disabled={createTenantMutation.isPending}
              inputProps={{ min: 0 }}
            />

            {/* Check-in Date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in Date *"
                value={new Date(formData.checkInDate + 'T00:00:00')}
                onChange={(newValue) => {
                  if (newValue) {
                    const year = newValue.getFullYear();
                    const month = String(newValue.getMonth() + 1).padStart(2, '0');
                    const day = String(newValue.getDate()).padStart(2, '0');
                    handleInputChange('checkInDate', `${year}-${month}-${day}`);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: createTenantMutation.isPending,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={createTenantMutation.isPending}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-[30px] text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTenantMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-[30px] text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
      </form>
    </Dialog>
  );
}
