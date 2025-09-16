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
  Card,
  CardContent,
  Chip,
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
import { PAYMENT_METHOD_OPTIONS } from '@/lib/constants/paymentConstants';

interface ProcessTenantFormProps {
  open: boolean;
  onClose: () => void;
  tenant: any;
  onSubmit: (data: ProcessTenantData) => void;
  isSubmitting: boolean;
}

interface ProcessTenantData {
  currentReading: number;
  remainingSecurity?: number;
  remainingRent?: number;
  paymentMethod?: string;
  paymentProof: File[];
}

export default function ProcessTenantForm({
  open,
  onClose,
  tenant,
  onSubmit,
  isSubmitting
}: ProcessTenantFormProps) {
  const [formData, setFormData] = useState<ProcessTenantData>({
    currentReading: 0,
    remainingSecurity: undefined,
    remainingRent: undefined,
    paymentMethod: '',
    paymentProof: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (formData.paymentProof.length + acceptedFiles.length > 2) {
      alert('You can only upload up to 2 files');
      return;
    }

    setFormData(prev => ({
      ...prev,
      paymentProof: [...prev.paymentProof, ...acceptedFiles]
    }));
  }, [formData.paymentProof.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 2 - formData.paymentProof.length,
    disabled: formData.paymentProof.length >= 2
  });

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentProof: prev.paymentProof.filter((_, i) => i !== index)
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

    if (!formData.currentReading || formData.currentReading <= 0) {
      newErrors.currentReading = 'Current reading is required and must be greater than 0';
    }

    // Payment method is always required
    if (!formData.paymentMethod?.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    const hasRemainingAmount = formData.remainingSecurity || formData.remainingRent;
    
    if (hasRemainingAmount) {
      if (formData.paymentProof.length === 0) {
        newErrors.paymentProof = 'Payment proof is required when there are remaining amounts';
      }
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
      currentReading: 0,
      remainingSecurity: undefined,
      remainingRent: undefined,
      paymentMethod: '',
      paymentProof: [],
    });
    setErrors({});
    onClose();
  };

  const hasRemainingAmount = formData.remainingSecurity || formData.remainingRent;

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
          pb: {xs: 1, md: 2},
          px: {xs: 2},
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
        })}
      >
        <Typography
          sx={(theme: Theme) => ({
            fontWeight: {xs: 500, md: 600},
            fontSize: {xs: '1rem', md: '1.25rem'},
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
          })}
        >
          Process Tenant - {tenant?.tenantName}
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
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          minHeight: 0, // Important for flex child to shrink
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f1f5f9',
            borderRadius: '3px',
          },
          padding: {xs: '12px', md: '24px'},
          paddingTop: {xs: '12px!important', md: '24px!important'},
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
        <Box className="mb-4 md:p-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 mb-3">
            Tenant Information
          </p>
          <Box className="grid grid-cols-2 md:gap-4 gap-2 text-sm">
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

        {/* Payment Status */}
        <Box className="mb-4 md:p-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-300 mb-3">
             Payment Status
          </p>
          <Box className="grid grid-cols-2 md:gap-4 gap-2 text-sm">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Monthly Rent:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(tenant?.monthlyRent)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Security Deposit:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(tenant?.securityDepositTotal)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Rent Paid:</Typography>
              <Typography variant="body1" className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(tenant?.totalOnboardingRentPaid || 0)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Security Paid:</Typography>
              <Typography variant="body1" className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(tenant?.securityDepositPaid || 0)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Rent Pending:</Typography>
              <Typography variant="body1" className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(tenant?.pendingOnboardingRentAmount || 0)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Security Pending:</Typography>
              <Typography variant="body1" className="font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(tenant?.pendingSecurityAmount || 0)}
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Processing Details */}
        <Box className="mt-4 md:p-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-300 mb-3">
            Processing Details
          </p>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <TextField
              fullWidth
              label="Current Electricity Reading *"
              type="number"
              value={formData.currentReading}
              onChange={(e) => handleInputChange('currentReading', Number(e.target.value))}
              error={!!errors.currentReading}
              helperText={errors.currentReading}
              placeholder="Enter current reading"
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
              label="Remaining Security (Optional)"
              type="number"
              value={formData.remainingSecurity || ''}
              onChange={(e) => handleInputChange('remainingSecurity', Number(e.target.value))}
              placeholder="Enter remaining security"
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
              label="Remaining Rent (Optional)"
              type="number"
              value={formData.remainingRent || ''}
              onChange={(e) => handleInputChange('remainingRent', Number(e.target.value))}
              placeholder="Enter remaining rent"
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
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.paymentMethod && (
                <Typography variant="caption" className="text-red-500 mt-1">
                  {errors.paymentMethod}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>

        {/* Payment Proof Upload */}
        {hasRemainingAmount ? (
          <Box className="mt-4">
            <p className='text-gray-600 dark:text-gray-400 text-md mb-2'>
              Payment Proof * - Max 2 files
            </p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : formData.paymentProof.length >= 2
                  ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400">Drop the files here...</p>
              ) : formData.paymentProof.length >= 2 ? (
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

            {errors.paymentProof && (
              <Typography variant="caption" className="text-red-500 mt-1">
                {errors.paymentProof}
              </Typography>
            )}

            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              {formData.paymentProof.length}/2 files selected
            </p>

            {/* File Preview */}
            {formData.paymentProof.length > 0 && (
              <Box className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Files:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.paymentProof.map((file, index) => (
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
        ): null}

        {/* Info Alert */}
        <Alert severity="info" className="mt-4">
          <Typography variant="body2">
            <strong>Note:</strong> Payment method is always required. Payment proof is required only when there are remaining amounts to collect.
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
            px: {xs: 2, md: 3},
            py: {xs: 1, md: 1.5},
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
          disabled={isSubmitting || !formData.currentReading || formData.currentReading <= 0}
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
            color: '#ffffff',
            px: {xs: 2, md: 3},
            py: {xs: 1, md: 1.5},
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
              Processing...
            </>
          ) : (
            'Process Tenant'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
