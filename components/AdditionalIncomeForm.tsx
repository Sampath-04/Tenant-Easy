'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon, AttachMoney as MoneyIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useProperty } from '@/contexts/PropertyContext';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { PAYMENT_METHOD_OPTIONS } from '@/lib/constants/paymentConstants';

interface AdditionalIncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    propertyId: string;
    amount: number;
    description: string;
    transactionRef: string;
    paidAt: string;
    paymentMethod: string;
    paymentProofs?: File[];
  }) => Promise<void>;
}

export default function AdditionalIncomeForm({
  isOpen,
  onClose,
  onSubmitCallback,
}: AdditionalIncomeFormProps) {
  const { selectedProperty } = useProperty();
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    transactionRef: '',
    paidAt: new Date(), // Today's date as Date object
    paymentMethod: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofs, setPaymentProofs] = useState<File[]>([]);
  const [proofPreviewUrls, setProofPreviewUrls] = useState<string[]>([]);


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.transactionRef.trim()) {
      newErrors.transactionRef = 'Transaction reference is required';
    }

    if (!formData.paidAt) {
      newErrors.paidAt = 'Payment date is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedProperty?.id) {
      toast.error('Please select a property first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (onSubmitCallback) {
        await onSubmitCallback({
          propertyId: selectedProperty.id,
          amount: formData.amount,
          description: formData.description.trim(),
          transactionRef: formData.transactionRef.trim(),
          paidAt: formData.paidAt.toISOString().split('T')[0],
          paymentMethod: formData.paymentMethod,
          paymentProofs: paymentProofs.length > 0 ? paymentProofs : undefined,
        });
      }

      // Reset form
      setFormData({
        amount: 0,
        description: '',
        transactionRef: '',
        paidAt: new Date(),
        paymentMethod: '',
      });
      setErrors({});
      setPaymentProofs([]);
      setProofPreviewUrls([]);
      onClose();
    } catch (error) {
      console.error('Failed to submit additional income:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Clean up preview URLs
      proofPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPaymentProofs([]);
      setProofPreviewUrls([]);
      onClose();
    }
  };

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (paymentProofs.length + acceptedFiles.length > 2) {
      toast.error('Maximum 2 proof images allowed');
      return;
    }

    const newFiles = [...paymentProofs, ...acceptedFiles];
    setPaymentProofs(newFiles);

    // Create preview URLs
    const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setProofPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [paymentProofs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 2 - paymentProofs.length,
    multiple: false
  });

  const removeProof = (index: number) => {
    const newFiles = paymentProofs.filter((_, i) => i !== index);
    const newUrls = proofPreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL of the removed file
    URL.revokeObjectURL(proofPreviewUrls[index]);
    
    setPaymentProofs(newFiles);
    setProofPreviewUrls(newUrls);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={(theme) => ({
        "& .MuiPaper-root": {
          margin: { xs: '0px', md: '32px' },
          width: { xs: '90%', md: '100%' },
        },
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 600px)': {
            maxHeight: '95vh',
          }
        },
      })}
    >
      <DialogTitle
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          pb: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          padding: {xs: "8px 16px", sm: "16px 24px"},
        })}
      >
        <div className="flex items-center gap-3">
          <MoneyIcon className="text-green-500" />
          <p className="md:text-xl text-base font-semibold text-gray-900 dark:text-white">Add Additional Income</p>
        </div>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={(theme) => ({
        flex: 1,
        overflow: 'auto',
        padding: {xs: '12px', md: '24px'},
        backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
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
      })}>
        <form onSubmit={handleSubmit} className="mt-4 space-y-2 md:space-y-4">
          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-2xl text-slate-500 dark:text-slate-400">₹</span>
              </div>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className={`w-full pl-12 pr-4 md:py-3 py-2 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
                  errors.amount 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-600 focus:border-green-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description *
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 md:py-3 py-2 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 resize-none ${
                  errors.description 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-600 focus:border-green-500'
                }`}
                placeholder="e.g., Additional income - due rent collected"
                rows={2}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.description}
              </p>
            )}
          </div>

          {/* Payment Related Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2 mt-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Payment Method *
              </label>
              <FormControl fullWidth error={!!errors.paymentMethod}>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  displayEmpty
                  className="w-full"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                      '& fieldset': {
                        borderColor: errors.paymentMethod 
                          ? '#ef4444' 
                          : '#e2e8f0',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: errors.paymentMethod 
                          ? '#dc2626' 
                          : '#cbd5e1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.paymentMethod ? '#dc2626' : '#10b981',
                        boxShadow: errors.paymentMethod 
                          ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                          : '0 0 0 4px rgba(16, 185, 129, 0.2)',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select Payment Method</em>
                  </MenuItem>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Payment Date *
              </label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData.paidAt}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleInputChange('paidAt', newValue);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.paidAt,
                      helperText: errors.paidAt,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'transparent',
                          '& fieldset': {
                            borderColor: errors.paidAt 
                              ? '#ef4444' 
                              : '#e2e8f0',
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: errors.paidAt 
                              ? '#dc2626' 
                              : '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: errors.paidAt ? '#dc2626' : '#10b981',
                            boxShadow: errors.paidAt 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                              : '0 0 0 4px rgba(16, 185, 129, 0.2)',
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              {errors.paidAt && (
                <p className="text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.paidAt}
                </p>
              )}
            </div>
          </div>

          {/* Transaction Reference */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Transaction Reference *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.transactionRef}
                onChange={(e) => handleInputChange('transactionRef', e.target.value)}
                className={`w-full px-4 md:py-3 py-2 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
                  errors.transactionRef 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-600 focus:border-green-500'
                }`}
                placeholder="e.g., TXN123456789"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            {errors.transactionRef && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.transactionRef}
              </p>
            )}
          </div>

          {/* Payment Proof Upload */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Payment Proof (Optional)
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Upload payment proof images (maximum 2 files)
            </p>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <input {...getInputProps()} style={{ display: 'none' }} />
              <CloudUploadIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    PNG, JPG, GIF up to 2 files
                  </p>
                </div>
              )}
            </div>

            {/* Preview Images */}
            {proofPreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {proofPreviewUrls.map((url, index) => (
                  <div key={index} className="relative w-36">
                    <img
                      src={url}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeProof(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </DialogContent>

      <DialogActions sx={(theme) => ({
        padding: '20px 24px',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
        gap: '12px',
        '@media (max-width: 600px)': {
          justifyContent: 'center',
          gap: '8px',
          padding: '16px',
        }
      })}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#374151',
            backgroundColor: 'transparent',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db'}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(75, 85, 99, 0.1)' : 'rgba(107, 114, 128, 0.04)',
              borderColor: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
            },
            '&:disabled': {
              opacity: 0.5,
              color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
              borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
            },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: '10px 20px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <MoneyIcon />}
          sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
            color: '#ffffff',
            border: 'none',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#047857',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                : '0 4px 12px rgba(5, 150, 105, 0.3)',
            },
            '&:disabled': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#9ca3af',
              color: theme.palette.mode === 'dark' ? '#6b7280' : '#ffffff',
              boxShadow: 'none',
            },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: '10px 20px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          })}
        >
          {isSubmitting ? 'Recording Income...' : 'Record Income'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
