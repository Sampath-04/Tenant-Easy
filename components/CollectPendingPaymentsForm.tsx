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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
    if (formData.paymentProofs.length + acceptedFiles.length > 2) {
      alert('You can only upload up to 2 images');
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
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 2 - formData.paymentProofs.length,
    disabled: formData.paymentProofs.length >= 2
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

  // Form validation function
  const isFormValid = () => {
    const hasAmount = formData.securityDepositAmount || formData.rentAmount;
    
    if (!hasAmount) return false;
    if (!formData.paymentMethod?.trim()) return false;
    
    // Payment proofs are optional for CASH payments
    if (formData.paymentMethod !== 'CASH' && formData.paymentProofs.length === 0) {
      return false;
    }

    // Validate amounts don't exceed pending amounts
    if (formData.securityDepositAmount && formData.securityDepositAmount > (tenant?.pendingSecurityAmount || 0)) {
      return false;
    }

    if (formData.rentAmount && formData.rentAmount > (tenant?.pendingOnboardingRentAmount || 0)) {
      return false;
    }

    return true;
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
      if (formData.paymentMethod !== 'CASH' && formData.paymentProofs.length === 0) {
        newErrors.paymentProofs = 'Payment proof is required for non-cash payments';
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
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          '@media (max-width: 600px)': {
            margin: '16px',
            width: '100%',
            maxHeight: '95vh',
          }
        }
      })}
    >
      <DialogTitle
        sx={(theme: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          pb: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
        })}
      >
        <Typography
          sx={(theme: Theme) => ({
            fontWeight: 600,
            fontSize: '1.25rem',
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
          })}
        >
          Collect Pending Payments - {tenant?.tenantName}
        </Typography>
        <IconButton 
          onClick={handleClose} 
          disabled={isSubmitting}
          sx={(theme: Theme) => ({
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
            }
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        sx={(theme: Theme) => ({
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          minHeight: 0, // Important for flex child to shrink
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f1f5f9',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? '#6b7280' : '#cbd5e1',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#9ca3af' : '#94a3b8',
            },
          },
        })}
      >
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
            <FormControl fullWidth variant="outlined">
              <InputLabel>Payment Method *</InputLabel>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                label="Payment Method *"
                error={!!errors.paymentMethod}
                sx={(theme: Theme) => ({
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? '#3b82f6' : '#2563eb',
                  },
                })}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CHEQUE">Cheque</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
              </Select>
            </FormControl>
            {errors.paymentMethod && (
              <Typography variant="caption" className="text-red-500 mt-1">
                {errors.paymentMethod}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Payment Proof Upload */}
        <Box className="mt-4">
          <p className='text-gray-600 dark:text-gray-400 text-md mb-2'>
            Upload Proofs (Optional) - Max 2 images
          </p>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : formData.paymentProofs.length >= 2
                ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">Drop the images here...</p>
            ) : formData.paymentProofs.length >= 2 ? (
              <p className="text-gray-500 dark:text-gray-400">Maximum 2 images reached</p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports: JPG, PNG, GIF, BMP, WebP
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
            {formData.paymentProofs.length}/2 images selected
          </p>

          {/* Image Previews */}
          {formData.paymentProofs.length > 0 && (
            <Box className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Images:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.paymentProofs.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
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
                      title="Remove image"
                    >
                      <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                    </IconButton>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      Image {index + 1}
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

      <DialogActions
        sx={(theme: Theme) => ({
          px: 2,
          py: 2,
          gap: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        })}
      >
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
            color: '#ffffff',
            px: 3,
            py: 1.5,
            borderRadius: '30px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#4b5563',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid()}
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
            color: '#ffffff',
            px: 3,
            py: 1.5,
            borderRadius: '30px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#4b5563',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          })}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Collecting...
            </>
          ) : (
            'Collect Payments'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
