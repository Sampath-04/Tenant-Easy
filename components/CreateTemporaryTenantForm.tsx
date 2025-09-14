'use client';

import React, { useState, useEffect } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { useRooms } from '@/hooks/useRooms';
import { useCreateTemporaryTenant } from '@/hooks/useTenants';
import { formatDateForAPI } from '@/lib/utils/formatters';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import NumberInput from '@/components/ui/NumberInput';
import CustomSelect from '@/components/ui/CustomSelect';
import FileUploadField from '@/components/ui/FileUploadField';
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
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface CreateTemporaryTenantFormData {
  tenantName: string;
  tenantNumber: string;
  tenantEmail: string;
  property: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  dailyRent: number;
  includeFood: boolean;
  amountPaid: number;
  paymentMethod: string;
  paymentProofs: File[];
}

interface CreateTemporaryTenantFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTemporaryTenantForm({ 
  open, 
  onClose, 
  onSuccess 
}: CreateTemporaryTenantFormProps) {
  const { selectedProperty, properties } = useProperty();
  const { data: roomsData } = useRooms(selectedProperty?.id || '');
  const createTemporaryTenantMutation = useCreateTemporaryTenant();
  
  const rooms = roomsData?.data || [];

  const [formData, setFormData] = useState<CreateTemporaryTenantFormData>({
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    property: selectedProperty?.id || '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    dailyRent: 0,
    includeFood: false,
    amountPaid: 0,
    paymentMethod: 'CASH',
    paymentProofs: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        tenantName: '',
        tenantNumber: '',
        tenantEmail: '',
        property: selectedProperty?.id || '',
        room: '',
        checkInDate: '',
        checkOutDate: '',
        dailyRent: 0,
        includeFood: false,
        amountPaid: 0,
        paymentMethod: 'CASH',
        paymentProofs: [],
      });
      setErrors({});
    }
  }, [open, selectedProperty]);

  // Update rooms when property changes
  useEffect(() => {
    if (formData.property) {
      setFormData(prev => ({ ...prev, room: '' }));
    }
  }, [formData.property]);

  const handleInputChange = (field: keyof CreateTemporaryTenantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = 'Tenant name is required';
    }

    if (!formData.tenantNumber.trim()) {
      newErrors.tenantNumber = 'Phone number is required';
    }

    if (!formData.property) {
      newErrors.property = 'Property is required';
    }

    if (!formData.room) {
      newErrors.room = 'Room is required';
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }

    if (formData.dailyRent <= 0) {
      newErrors.dailyRent = 'Daily rent must be greater than 0';
    }

    if (formData.amountPaid < 0) {
      newErrors.amountPaid = 'Amount paid cannot be negative';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    // Payment proofs required for non-cash payments
    if (formData.paymentMethod !== 'CASH' && formData.paymentProofs.length === 0) {
      newErrors.paymentProofs = 'Payment proof is required for non-cash payments';
    }

    // Check if check-out is after check-in
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate + 'T00:00:00');
      const checkOut = new Date(formData.checkOutDate + 'T00:00:00');
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.tenantName.trim() &&
      formData.tenantNumber.trim() &&
      formData.property &&
      formData.room &&
      formData.checkInDate &&
      formData.checkOutDate &&
      formData.dailyRent > 0 &&
      formData.amountPaid >= 0 &&
      formData.paymentMethod &&
      (formData.paymentMethod === 'CASH' || formData.paymentProofs.length > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      tenantName: formData.tenantName.trim(),
      tenantNumber: formData.tenantNumber.trim(),
      tenantEmail: formData.tenantEmail.trim() || undefined,
      property: formData.property,
      room: formData.room,
      checkInDate: formatDateForAPI(new Date(formData.checkInDate)),
      checkOutDate: formatDateForAPI(new Date(formData.checkOutDate)),
      dailyRent: formData.dailyRent,
      foodRate: selectedPropertyData?.foodAmount || 0,
      foodOpted: formData.includeFood,
      securityDepositTotal: 0,
      securityDepositPaid: 0,
      amountPaid: formData.amountPaid,
      paymentMethod: formData.paymentMethod,
      paymentProofs: formData.paymentProofs,
    };

    createTemporaryTenantMutation.mutate(submitData, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });
  };

  const selectedPropertyData = properties.find(p => p.id === formData.property);
  const availableRooms = rooms.filter((room: any) => room.property === formData.property);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Create Temporary Tenant
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme: any) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Tenant Name"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  error={!!errors.tenantName}
                  helperText={errors.tenantName}
                  required
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  value={formData.tenantNumber}
                  onChange={(e) => handleInputChange('tenantNumber', e.target.value)}
                  error={!!errors.tenantNumber}
                  helperText={errors.tenantNumber}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  fullWidth
                  sx={{ gridColumn: { md: 'span 2' } }}
                />
              </Box>
            </Box>

            {/* Property & Room Selection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Property & Room Selection
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <CustomSelect
                    label="Property"
                    value={formData.property}
                    onChange={(value) => handleInputChange('property', value)}
                    options={properties.map(p => ({ value: p.id, label: p.name }))}
                    required
                  />
                  {errors.property && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.property}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <CustomSelect
                    label="Room"
                    value={formData.room}
                    onChange={(value) => handleInputChange('room', value)}
                    options={availableRooms.map((room: any) => ({ 
                      value: room._id, 
                      label: `Room ${room.roomNo} - ${room.roomType}` 
                    }))}
                    disabled={!formData.property}
                    required
                  />
                  {errors.room && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.room}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Stay Duration */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Stay Duration
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-in Date"
                    value={formData.checkInDate ? new Date(formData.checkInDate) : null}
                    onChange={(date) => handleInputChange('checkInDate', date ? date.toISOString().split('T')[0] : '')}
                    slotProps={{
                      textField: {
                        error: !!errors.checkInDate,
                        helperText: errors.checkInDate,
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-out Date"
                    value={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                    onChange={(date) => handleInputChange('checkOutDate', date ? date.toISOString().split('T')[0] : '')}
                    slotProps={{
                      textField: {
                        error: !!errors.checkOutDate,
                        helperText: errors.checkOutDate,
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {/* Financial Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Financial Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Daily Rent *
                  </Typography>
                  <NumberInput
                    value={formData.dailyRent}
                    onChange={(value) => handleInputChange('dailyRent', value || 0)}
                    placeholder="Enter daily rent"
                  />
                  {errors.dailyRent && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.dailyRent}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Amount Paid
                  </Typography>
                  <NumberInput
                    value={formData.amountPaid}
                    onChange={(value) => handleInputChange('amountPaid', value || 0)}
                    placeholder="Enter amount paid"
                  />
                  {errors.amountPaid && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.amountPaid}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <CustomSelect
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(value) => handleInputChange('paymentMethod', value)}
                    options={[
                      { value: 'CASH', label: 'Cash' },
                      { value: 'UPI', label: 'UPI' },
                      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                      { value: 'CHEQUE', label: 'Cheque' }
                    ]}
                    required
                  />
                  {errors.paymentMethod && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.paymentMethod}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Payment Proofs Upload */}
              {formData.paymentMethod !== 'CASH' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Payment Proofs {formData.paymentMethod !== 'CASH' ? '*' : '(Optional)'}
                  </Typography>
                  <FileUploadField
                    selectedFiles={formData.paymentProofs}
                    onFileSelect={(files: File | File[]) => {
                      const fileArray = Array.isArray(files) ? files : [files];
                      handleInputChange('paymentProofs', fileArray);
                    }}
                    maxFiles={2}
                    accept="image/*,.pdf"
                    placeholder="Upload payment proofs (max 2 files)"
                    multiple={true}
                  />
                  {errors.paymentProofs && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.paymentProofs}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Food Options */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Food Options
              </Typography>
              <Box sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Include Food
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add food charges to daily rent (₹{selectedPropertyData?.foodAmount || 0}/day)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {formData.includeFood ? 'Yes' : 'No'}
                    </Typography>
                    <input
                      type="checkbox"
                      checked={formData.includeFood}
                      onChange={(e) => handleInputChange('includeFood', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </Box>
                </Box>
                
                {/* Final Daily Rent Display */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200',
                  borderRadius: 1,
                  ...(theme => theme.palette.mode === 'dark' && {
                    bgcolor: 'primary.900',
                    borderColor: 'primary.800'
                  })
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Final Daily Rent:
                      </Typography>
                      {formData.includeFood && (
                        <Typography variant="body2" color="text.secondary">
                          Base Rent: ₹{formData.dailyRent} + Food: ₹{selectedPropertyData?.foodAmount || 0}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      ₹{formData.dailyRent + (formData.includeFood ? (selectedPropertyData?.foodAmount || 0) : 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Error Alert */}
          {createTemporaryTenantMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to create temporary tenant. Please try again.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton
              onClick={onClose}
              disabled={createTemporaryTenantMutation.isPending}
              sx={{
                bgcolor: 'grey.100',
                color: 'grey.700',
                '&:hover': { bgcolor: 'grey.200' },
                ...(theme => theme.palette.mode === 'dark' && {
                  bgcolor: 'grey.800',
                  color: 'grey.300',
                  '&:hover': { bgcolor: 'grey.700' }
                })
              }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              type="submit"
              disabled={!isFormValid() || createTemporaryTenantMutation.isPending}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
              }}
            >
              {createTemporaryTenantMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )}
            </IconButton>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
