import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Theme,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface CollectOnboardPendingPaymentsFormProps {
  open: boolean;
  onClose: () => void;
  tenant: any;
  onSubmit: (data: CollectPaymentsData) => void;
  isSubmitting: boolean;
}

interface CollectPaymentsData {
  securityDepositAmount?: number;
  rentAmount?: number;
  paymentMethod?: string;
  paymentProofs: File[];
}

export default function CollectOnboardPendingPaymentsForm({
  open,
  onClose,
  tenant,
  onSubmit,
  isSubmitting
}: CollectOnboardPendingPaymentsFormProps) {
  const [formData, setFormData] = useState<CollectPaymentsData>({
    securityDepositAmount: undefined,
    rentAmount: undefined,
    paymentMethod: '',
    paymentProofs: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (formData.paymentProofs.length + acceptedFiles.length > 4) {
      alert('You can only upload up to 4 files');
      return;
    }

    setFormData(prev => ({
      ...prev,
      paymentProofs: [...prev.paymentProofs, ...acceptedFiles]
    }));
  }, [formData.paymentProofs.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 4 - formData.paymentProofs.length,
    disabled: formData.paymentProofs.length >= 4
  });

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentProofs: prev.paymentProofs.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const hasAmount = formData.securityDepositAmount || formData.rentAmount;
    
    if (!hasAmount) {
      newErrors.general = 'Please enter at least one amount to collect';
    }

    if (hasAmount) {
      if (!formData.paymentMethod?.trim()) {
        newErrors.paymentMethod = 'Payment method is required';
      }
      if (formData.paymentProofs.length === 0) {
        newErrors.paymentProofs = 'Payment proof is required';
      }
    }

    // Validate amounts don't exceed pending amounts
    if (formData.securityDepositAmount && formData.securityDepositAmount > (tenant?.pendingSecurityAmount || 0)) {
      newErrors.securityDepositAmount = `Amount cannot exceed pending security of ${formatCurrency(tenant?.pendingSecurityAmount || 0)}`;
    }

    if (formData.rentAmount && formData.rentAmount > (tenant?.pendingOnboardingRentAmount || 0)) {
      newErrors.rentAmount = `Amount cannot exceed pending rent of ${formatCurrency(tenant?.pendingOnboardingRentAmount || 0)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      securityDepositAmount: undefined,
      rentAmount: undefined,
      paymentMethod: '',
      paymentProofs: [],
    });
    setErrors({});
    onClose();
  };

  const hasAmount = formData.securityDepositAmount || formData.rentAmount;

  if (!open || !tenant) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={(theme: Theme) => ({
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          '@media (max-width: 600px)': {
            margin: '16px',
            width: '100%',
          }
        }
      })}
    >
      <DialogTitle className="flex items-center justify-between">
        <p className="font-semibold text-lg">Collect Pending Payments - {tenant?.tenantName}</p>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {/* Tenant Information */}
        <Box className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Typography variant="subtitle2" className="text-blue-800 dark:text-blue-300 mb-3">
            Tenant Information
          </Typography>
          <Box className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Name:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {tenant?.tenantName}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Phone:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {tenant?.tenantNumber}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Room:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {tenant?.room?.roomNo} ({tenant?.room?.roomType})
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Check-in:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {formatDate(tenant?.checkInDate)}
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Pending Payments Status */}
        <Box className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <Typography variant="subtitle2" className="text-red-800 dark:text-red-300 mb-3">
            Pending Payments
          </Typography>
          <Box className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Security Pending:</Typography>
              <Typography variant="body1" className="font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(tenant?.pendingSecurityAmount || 0)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Rent Pending:</Typography>
              <Typography variant="body1" className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(tenant?.pendingOnboardingRentAmount || 0)}
              </Typography>
            </div>
            <div className="col-span-2">
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Total Pending:</Typography>
              <Typography variant="h6" className="font-bold text-red-600 dark:text-red-400">
                {formatCurrency(tenant?.totalPendingAmount || 0)}
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Collection Details */}
        <Box className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Typography variant="subtitle2" className="text-green-800 dark:text-green-300 mb-3">
            Collection Details
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Security Deposit Amount"
              type="number"
              value={formData.securityDepositAmount || ''}
              onChange={(e) => handleInputChange('securityDepositAmount', Number(e.target.value))}
              error={!!errors.securityDepositAmount}
              helperText={errors.securityDepositAmount || `Max: ${formatCurrency(tenant?.pendingSecurityAmount || 0)}`}
              placeholder="Enter amount to collect"
              variant="outlined"
              sx={(theme: Theme) => ({
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              })}
            />
            <TextField
              fullWidth
              label="Rent Amount"
              type="number"
              value={formData.rentAmount || ''}
              onChange={(e) => handleInputChange('rentAmount', Number(e.target.value))}
              error={!!errors.rentAmount}
              helperText={errors.rentAmount || `Max: ${formatCurrency(tenant?.pendingOnboardingRentAmount || 0)}`}
              placeholder="Enter amount to collect"
              variant="outlined"
              sx={(theme: Theme) => ({
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              })}
            />
            <TextField
              fullWidth
              label="Payment Method *"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod || "e.g., UPI, Cash, Bank Transfer"}
              placeholder="Enter payment method"
              variant="outlined"
              sx={(theme: Theme) => ({
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              })}
            />
          </Box>
        </Box>

        {/* Payment Proof Upload */}
        <Box className="mt-4">
          <p className='text-gray-600 dark:text-gray-400 text-md mb-2'>
            Payment Proof * - Max 4 files
          </p>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : formData.paymentProofs.length >= 4
                ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">Drop the files here...</p>
            ) : formData.paymentProofs.length >= 4 ? (
              <p className="text-gray-500 dark:text-gray-400">Maximum 4 files reached</p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports: JPG, PNG, GIF, BMP, WebP, PDF
                </p>
              </div>
            )}
          </div>

          {errors.paymentProofs && (
            <Typography variant="caption" className="text-red-500 mt-1">
              {errors.paymentProofs}
            </Typography>
          )}

          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            {formData.paymentProofs.length}/4 files selected
          </p>

          {/* File Preview */}
          {formData.paymentProofs.length > 0 && (
            <Box className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Files:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.paymentProofs.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                            PDF
                          </Typography>
                        </div>
                      )}
                    </div>
                    <IconButton
                      onClick={() => removeFile(index)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                      title="Remove file"
                    >
                      <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                    </IconButton>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                    </div>
                  </div>
                ))}
              </div>
            </Box>
          )}
        </Box>

        {/* Error Alert */}
        {errors.general && (
          <Alert severity="error" className="mt-4">
            <Typography variant="body2">
              {errors.general}
            </Typography>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert severity="info" className="mt-4">
          <Typography variant="body2">
            <strong>Note:</strong> You can collect partial amounts. Enter the amount you want to collect for each payment type.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{
        padding: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #e0e0e0',
        gap: '10px',
        '@media (max-width: 600px)': {
          justifyContent: 'center',
          gap: '8px',
        }
      }}>
        <button onClick={handleClose} disabled={isSubmitting} className='hidden md:block border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-[30px] cursor-pointer dark:border-gray-400 dark:text-gray-200'>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !hasAmount}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-[30px] text-sm md:text-base !ml-0 cursor-pointer flex items-center justify-center gap-2 dark:text-gray-200"
        >
          {isSubmitting && <CircularProgress size={16} color="inherit" />}
          {isSubmitting ? 'Collecting...' : 'Collect Payments'}
        </button>
      </DialogActions>
    </Dialog>
  );
}
