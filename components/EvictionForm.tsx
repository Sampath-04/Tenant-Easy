'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Close as CloseIcon, PersonOff as PersonOffIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useDropzone } from 'react-dropzone';

interface EvictionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    tenantId: string;
    currentElectricityReading: number;
    refundableAmount: number;
    comments?: string;
    otherDeduction?: number;
    tenantQrCode?: File;
    rentRecord: any;
  }) => void;
  rentRecord: any;
}

export default function EvictionForm({
  isOpen,
  onClose,
  onSubmitCallback,
  rentRecord,
}: EvictionFormProps) {
  const [currentElectricityReading, setCurrentElectricityReading] = useState<number>(rentRecord?.room?.currentMeterReading || 0);
  const [refundableAmount, setRefundableAmount] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [otherDeduction, setOtherDeduction] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantQrCode, setTenantQrCode] = useState<File | null>(null);
  const [qrCodePreviewUrl, setQrCodePreviewUrl] = useState<string | null>(null);
  const perUnitCost = 10;
  // Calculate refundable amount when current reading changes
  useEffect(() => {
    if (!rentRecord) return;

    const securityDeposit = rentRecord.tenant?.securityDepositPaid || 0;
    const currentCycleElectricity = rentRecord.electricityBill || 0;
    const noticeElectricity = rentRecord.notice?.electricityBill || 0;
    const totalElectricityPaid = currentCycleElectricity + noticeElectricity;

    // Use currentMeterReading from room info as last reading
    const lastReading = rentRecord.room?.currentMeterReading || 0;
    const unitsConsumed = currentElectricityReading - lastReading;
    const totalCurrentElectricityCost = Math.max(0, unitsConsumed * perUnitCost);

    // Calculate per-tenant electricity cost
    const numberOfTenants = rentRecord.room?.tenants?.length || 1;
    const perTenantElectricityCost = totalCurrentElectricityCost / numberOfTenants;

    // Calculate refundable amount
    const totalCharges = totalElectricityPaid + perTenantElectricityCost + otherDeduction;
    const refundable = securityDeposit - totalCharges;
    
    setRefundableAmount(refundable);
  }, [currentElectricityReading, rentRecord, otherDeduction]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]; // Only take the first file
      setTenantQrCode(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setQrCodePreviewUrl(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const removeQrCode = () => {
    // Revoke the object URL to free memory
    if (qrCodePreviewUrl) {
      URL.revokeObjectURL(qrCodePreviewUrl);
    }
    
    setTenantQrCode(null);
    setQrCodePreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!rentRecord?.tenant?._id) return;

    try {
      setIsSubmitting(true);
      
      // Call the callback with eviction data
      if (onSubmitCallback) {
        await onSubmitCallback({
          tenantId: rentRecord.tenant._id,
          currentElectricityReading,
          refundableAmount,
          comments: comments.trim() || undefined,
          otherDeduction: otherDeduction > 0 ? otherDeduction : undefined,
          tenantQrCode: tenantQrCode || undefined,
          rentRecord: rentRecord,
        });
      }

      // Clean up object URL
      if (qrCodePreviewUrl) {
        URL.revokeObjectURL(qrCodePreviewUrl);
      }

      // Reset form
      setCurrentElectricityReading(0);
      setComments('');
      setTenantQrCode(null);
      setQrCodePreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit eviction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Clean up object URL
      if (qrCodePreviewUrl) {
        URL.revokeObjectURL(qrCodePreviewUrl);
      }
      
      setCurrentElectricityReading(0);
      setComments('');
      setTenantQrCode(null);
      setQrCodePreviewUrl(null);
      onClose();
    }
  };

  if (!isOpen || !rentRecord) return null;

  const securityDeposit = rentRecord.tenant?.securityDepositPaid || 0;
  const currentCycleElectricity = rentRecord.electricityBill || 0;
  const noticeElectricity = rentRecord.notice?.electricityBill || 0;
  const totalElectricity = currentCycleElectricity + noticeElectricity;
  const lastReading = rentRecord.room?.currentMeterReading || 0;
  
  const numberOfTenants = rentRecord.room?.tenants?.length || 1;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={(theme: Theme) => ({
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 600px)': {
            margin: '16px',
            width: '100%',
            maxHeight: '95vh',
          }
        }
      })}
    >
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PersonOffIcon className="text-red-500" />
          <Typography variant="h6" className="font-semibold">Complete Eviction</Typography>
        </div>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={(theme: Theme) => ({
        flex: 1,
        overflow: 'auto',
        padding: '24px',
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
        {/* Tenant Details */}
        <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-300 mb-3 text-md font-bold">
            Tenant Details
          </p>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Name:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rentRecord.tenant?.tenantName || '-'}
              </p>
            </div>
                <div className="flex flex-row items-center gap-2">
               <p className="text-gray-600 dark:text-gray-400 text-md">Room:</p>
               <p className="font-medium text-gray-900 dark:text-white">
                 {rentRecord.room?.roomNo || '-'} ({numberOfTenants} tenant{numberOfTenants > 1 ? 's' : ''})
               </p>
             </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Phone:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rentRecord.tenant?.tenantNumber || '-'}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Period:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(rentRecord.startDate)} - {formatDate(rentRecord.endDate)}
              </p>
            </div>
          </Box>
        </Box>

        {/* Financial Details */}
        <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-300 mb-3 text-md font-bold">
            Financial Summary
          </p>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Security Deposit:</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(securityDeposit)}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Current Cycle Electricity:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(currentCycleElectricity)}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Notice Period Electricity:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(noticeElectricity)}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Total Electricity:</p>
              <p className="font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(totalElectricity)}
              </p>
            </div>
          </Box>
        </Box>

        {/* Current Electricity Reading */}
          <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-gray-800 dark:text-gray-300 mb-4 font-bold">
            Final Electricity Reading
          </p>
          
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Section */}
            <Box className="flex flex-col space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Last Reading:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {lastReading} units
                </span>
              </div>
              
              <TextField
                fullWidth
                label="Current Reading (units)"
                type="number"
                value={currentElectricityReading}
                onChange={(e) => setCurrentElectricityReading(Number(e.target.value))}
                placeholder="Enter current meter reading"
                variant="outlined"
                error={currentElectricityReading > 0 && currentElectricityReading < lastReading}
                helperText={currentElectricityReading > 0 && currentElectricityReading < lastReading ? 
                  `Current reading cannot be less than the last reading (${lastReading} units)` : ''}
                sx={(theme: Theme) => ({
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                })}
              />
            </Box>

            {/* Right Column - Calculations Section */}
            <Box className="flex flex-col space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Units Consumed:
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">
                  {Math.max(0, currentElectricityReading - lastReading)} units
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Cost:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * perUnitCost))}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Per Tenant:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * perUnitCost / numberOfTenants))}
                </span>
              </div>
            </Box>
          </Box>
        </Box>

        {/* Other Deduction */}
        <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-300 mb-4 font-bold">
            Other Deduction
          </p>
          
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Section */}
            <Box className="flex flex-col space-y-4">
              <TextField
                fullWidth
                label="Other Deduction (₹)"
                type="number"
                value={otherDeduction}
                onChange={(e) => setOtherDeduction(Number(e.target.value))}
                placeholder="Enter any other deduction amount"
                variant="outlined"
                helperText="Any additional deductions (e.g., damages, penalties, etc.)"
                sx={(theme: Theme) => ({
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                })}
              />
            </Box>

            {/* Right Column - Display Section */}
            <Box className="flex flex-col space-y-3">
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Impact on Refund:
                </span>
                <span className={`font-semibold ${otherDeduction > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {otherDeduction > 0 ? `-${formatCurrency(otherDeduction)}` : 'No impact'}
                </span>
              </div>
            </Box>
          </Box>
        </Box>

          {/* Refundable Amount */}
         <Box className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
           <p className="text-purple-800 dark:text-purple-300">
             Refund Calculation
           </p>
           <Box className="text-center">
             <p className="font-bold text-purple-600 dark:text-purple-400 mb-2 text-lg">
               {formatCurrency(refundableAmount)}
             </p>
             <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
               Refundable Amount
             </Typography>
             
             {/* Calculation Breakdown */}
             <Box className="text-left bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
               <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Calculation Breakdown:
               </p>
               <div className="space-y-1 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-400">Security Deposit:</span>
                   <span className="font-medium">+{formatCurrency(securityDeposit)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-400">Current Cycle Electricity:</span>
                   <span className="font-medium">-{formatCurrency(currentCycleElectricity)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-400">Notice Period Electricity:</span>
                   <span className="font-medium">-{formatCurrency(noticeElectricity)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-400">Final Reading Cost (Per Tenant):</span>
                   <span className="font-medium">-{formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * perUnitCost / numberOfTenants))}</span>
                 </div>
                 {otherDeduction > 0 && (
                   <div className="flex justify-between">
                     <span className="text-gray-600 dark:text-gray-400">Other Deduction:</span>
                     <span className="font-medium">-{formatCurrency(otherDeduction)}</span>
                   </div>
                 )}
                 <hr className="my-2 border-gray-300 dark:border-gray-600" />
                 <div className="flex justify-between font-bold">
                   <span className="text-gray-700 dark:text-gray-300">Refundable Amount:</span>
                   <span className={refundableAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                     {formatCurrency(refundableAmount)}
                   </span>
                 </div>
               </div>
             </Box>
             
             {refundableAmount < 0 && (
               <Alert severity="warning" className="mt-3">
                 Additional charges may apply. Tenant owes: {formatCurrency(Math.abs(refundableAmount))}
               </Alert>
             )}
           </Box>
         </Box>

        {/* Tenant QR Code Upload */}
        <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-300 mb-3">
            Upload Tenant QR Code (Optional)
          </p>
          
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : tenantQrCode
                ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
            }`}
            style={{ 
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <input {...getInputProps()} style={{ display: 'none' }} />
            <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">Drop the QR code image here...</p>
            ) : tenantQrCode ? (
              <p className="text-gray-500 dark:text-gray-400">QR code image selected</p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop QR code image here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports: JPG, PNG, GIF, BMP, WebP
                </p>
              </div>
            )}
          </div>

          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            {tenantQrCode ? '1/1 image selected' : '0/1 image selected'}
          </p>

          {/* QR Code Preview */}
          {qrCodePreviewUrl && (
            <Box className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                QR Code Preview:
              </p>
              <div className="relative inline-block">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 w-32 h-32">
                  <img
                    src={qrCodePreviewUrl}
                    alt="QR Code Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <IconButton
                  onClick={removeQrCode}
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
                  title="Remove QR code"
                >
                  <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                </IconButton>
              </div>
            </Box>
          )}
        </Box>

        {/* Comments */}
        <TextField
          fullWidth
          label="Comments (Optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any additional notes about the eviction"
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
          sx={(theme: Theme) => ({
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
          })}
        />
      </DialogContent>

      <DialogActions sx={(theme: Theme) => ({
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
          sx={(theme: Theme) => ({
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
          disabled={isSubmitting || currentElectricityReading <= 0 || currentElectricityReading < lastReading}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonOffIcon />}
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
            color: '#ffffff',
            border: 'none',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
                : '0 4px 12px rgba(239, 68, 68, 0.3)',
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
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            'Complete Eviction'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
