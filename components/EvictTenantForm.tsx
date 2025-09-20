'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Theme,
  Alert,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, PersonOff as PersonOffIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useDropzone } from 'react-dropzone';

interface EvictTenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    electricityUnit: number;
    amount: number;
    comments?: string;
    tenantQrCode?: File;
  }) => Promise<void>;
  tenant: any;
  isSubmitting?: boolean;
}

export default function EvictTenantForm({
  isOpen,
  onClose,
  onSubmitCallback,
  tenant,
  isSubmitting = false,
}: EvictTenantFormProps) {
  const [currentElectricityReading, setCurrentElectricityReading] = useState<number>(0);
  const [otherDeduction, setOtherDeduction] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [securityRemaining, setSecurityRemaining] = useState<number>(0);
  const [tenantQrCode, setTenantQrCode] = useState<File | null>(null);
  const [qrCodePreviewUrl, setQrCodePreviewUrl] = useState<string | null>(null);
  const [pendingRents, setPendingRents] = useState<number>(0);

  // Initialize form values when form opens or tenant changes
  useEffect(() => {
    if (!tenant || !isOpen) return;

    // Get pending rents total amount
    const pendingRentsTotal = tenant.pendingRents?.totalPending || 0;
    
    let adjustedPendingRents = pendingRentsTotal;
    if (tenant.currentCycle && tenant.currentCycle.month) {
      // Find the current cycle record in pending rents
      const currentCycleRecord = tenant.pendingRents?.pendingRentRecords?.find(
        (record: any) => record.month === tenant.currentCycle.month
      );
      
      // If current cycle record exists, deduct monthly rent from it
      if (currentCycleRecord) {
        const monthlyRent = tenant.monthlyRent || 0;
        adjustedPendingRents = Math.max(0, pendingRentsTotal - monthlyRent);
      }
    }
    
    // Reset all form fields to initial values
    setPendingRents(adjustedPendingRents);
    setCurrentElectricityReading(0);
    setOtherDeduction(0);
    setComments('');
    setSecurityRemaining(0);
    setTenantQrCode(null);
    setQrCodePreviewUrl(null);
  }, [tenant, isOpen]);

  // Calculate dues when form data changes
  useEffect(() => {
    if (!tenant) return;

    // Get current electricity reading from tenant doc
    const currentReadingFromTenant = tenant.currentReading || 0;
    
    // Calculate electricity cost for the difference
    const electricityDifference = Math.max(0, currentElectricityReading - currentReadingFromTenant);
    const ratePerUnit = tenant.property?.electricitySettings?.ratePerUnit || 0;
    const totalElectricityCost = electricityDifference * ratePerUnit;
    const numberOfTenants = tenant.room?.tenants?.length || 1;
    const electricityCost = totalElectricityCost / numberOfTenants;
    
    // Calculate security remaining
    const securityPaid = tenant.securityDepositPaid || 0;
    const totalDeductions = Math.round((pendingRents + electricityCost + otherDeduction) * 100) / 100;
    const remaining = Math.round((securityPaid - totalDeductions) * 100) / 100;
    
    setSecurityRemaining(remaining);
  }, [currentElectricityReading, otherDeduction, pendingRents, tenant, isOpen]);

  const handleSubmit = async () => {
    if (!tenant?._id) return;

    try {
      // Call the callback with eviction data
      if (onSubmitCallback) {
        await onSubmitCallback({
          electricityUnit: currentElectricityReading,
          amount: securityRemaining,
          comments: comments.trim() || undefined,
          tenantQrCode: tenantQrCode || undefined,
        });
      }

      // Reset form
      setCurrentElectricityReading(0);
      setOtherDeduction(0);
      setComments('');
      setSecurityRemaining(0);
      setPendingRents(0);
      setTenantQrCode(null);
      setQrCodePreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit eviction:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
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
    if (qrCodePreviewUrl) {
      URL.revokeObjectURL(qrCodePreviewUrl);
    }
    setTenantQrCode(null);
    setQrCodePreviewUrl(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      if (qrCodePreviewUrl) {
        URL.revokeObjectURL(qrCodePreviewUrl);
      }
      setTenantQrCode(null);
      setQrCodePreviewUrl(null);
      onClose();
    }
  };

  if (!isOpen || !tenant) return null;

  const currentReadingFromTenant = tenant.currentReading || 0;
  const pendingRentsTotal = tenant.pendingRents?.totalPending || 0;
  
  // Only deduct monthly rent from current cycle record if it exists
  let adjustedPendingRents = pendingRentsTotal;
  if (tenant.currentCycle && tenant.currentCycle.month) {
    // Find the current cycle record in pending rents
    const currentCycleRecord = tenant.pendingRents?.pendingRentRecords?.find(
      (record: any) => record.month === tenant.currentCycle.month
    );
    
    // If current cycle record exists, deduct monthly rent from it
    if (currentCycleRecord) {
      const monthlyRent = tenant.monthlyRent || 0;
      adjustedPendingRents = Math.max(0, pendingRentsTotal - monthlyRent);
    }
  }
  
  const ratePerUnit = tenant.property?.electricitySettings?.ratePerUnit || 0;
  const electricityDifference = Math.max(0, currentElectricityReading - currentReadingFromTenant);
  const totalElectricityCost = electricityDifference * ratePerUnit;
  
  // Calculate per-tenant electricity cost based on number of tenants in the room
  const numberOfTenants = tenant.room?.tenants?.length || 1;
  const electricityCost = totalElectricityCost / numberOfTenants;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={(theme: Theme) => ({
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
          <PersonOffIcon className="text-red-500" />
          <p className="text-xl font-semibold text-gray-900 dark:text-white">Evict Tenant</p>
        </div>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={(theme: Theme) => ({
        flex: 1,
        overflow: 'auto',
        padding: {xs: '8px', md: '24px'},
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
        <Box className="mt-4 md:mb-6 mb-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-300 mb-3 text-md font-bold">
            Tenant Details
          </p>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Name:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.tenantName || '-'}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Room:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.room?.roomNo || '-'}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Phone:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.tenantNumber || '-'}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-600 dark:text-gray-400 text-md">Property:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.property?.propertyName || '-'}
              </p>
            </div>
          </Box>
        </Box>

        {/* Pending Rents Summary */}
        <Box className="md:mb-6 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 mb-4 font-bold">
            Pending Rents Summary
          </p>
          
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Section */}
            <Box className="flex flex-col space-y-4">
              <TextField
                fullWidth
                label="Pending Rents (₹)"
                type="number"
                value={pendingRents}
                onChange={(e) => setPendingRents(Number(e.target.value))}
                placeholder="Enter pending rents amount"
                variant="outlined"
                helperText="Total pending rent amount to be collected from tenant"
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
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Count:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {tenant.pendingRents?.count || 0} records
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Impact on Security:
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(pendingRents)}
                </span>
              </div>
            </Box>
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
              {/* <div className="flex items-center justify-between md:p-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Current Reading in Tenant Doc:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold md:text-base text-sm">
                  {currentReadingFromTenant} units
                </span>
              </div> */}
              
              <TextField
                fullWidth
                label="Final Reading (units)"
                type="number"
                value={currentElectricityReading}
                onChange={(e) => setCurrentElectricityReading(Number(e.target.value))}
                placeholder="Enter final meter reading"
                variant="outlined"
                error={currentElectricityReading > 0 && currentElectricityReading < currentReadingFromTenant}
                helperText={currentElectricityReading > 0 && currentElectricityReading < currentReadingFromTenant ? 
                  `Final reading cannot be less than the current reading (${currentReadingFromTenant} units)` : 
                  `Current reading in tenant document: ${currentReadingFromTenant} units`}
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
                  {electricityDifference.toFixed(2)} units
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Rate per Unit:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ₹{ratePerUnit}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Electricity Cost: {tenant.room?.tenants?.length || 1} tenant
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(electricityCost)}
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
                  Impact on Dues:
                </span>
                <span className={`font-semibold ${otherDeduction > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {otherDeduction > 0 ? `+${formatCurrency(otherDeduction)}` : 'No impact'}
                </span>
              </div>
            </Box>
          </Box>
        </Box>

        {/* Security Remaining */}
        <Box className="md:mb-6 mb-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-300 md:mb-4 mb-2 font-bold">
            Security Deposit Remaining
          </p>
          
          <Box className="text-center mb-4">
            <p className={`font-bold md:text-2xl text-xl mb-2 ${securityRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(Math.abs(securityRemaining))}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {securityRemaining >= 0 ? 'Amount to be refunded' : 'Additional amount owed'}
            </p>
            
            {/* Negative amount message */}
            {securityRemaining < 0 && (
              <Alert severity="warning"  sx={{width: '100% !important'}}>
                <p className="text-sm">
                  <strong>Note:</strong> This amount will be added to your expense list. 
                  To adjust the loss, use the <strong>Additional Income</strong> option in your dashboard.
                </p>
              </Alert>
            )}
          </Box>
          
          {/* Calculation Breakdown */}
          <Box className="text-left bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calculation Breakdown:
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Security Deposit Paid:</span>
                <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(tenant.securityDepositPaid || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pending Rents:</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(pendingRents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Electricity Cost:</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(electricityCost)}</span>
              </div>
              {otherDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Other Deduction:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(otherDeduction)}</span>
                </div>
              )}
              <Divider className="my-2" />
              <div className="flex justify-between font-bold">
                <span className="text-gray-700 dark:text-gray-300">Security Remaining:</span>
                <span className={securityRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {formatCurrency(securityRemaining)}
                </span>
              </div>
            </div>
          </Box>
        </Box>

        {/* QR Code Upload - Only show if security remaining > 0 */}
        {securityRemaining > 0 && (
          <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-gray-800 dark:text-gray-300 mb-3">
              Upload Tenant QR Code
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
        )}

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
          disabled={isSubmitting || currentElectricityReading <= 0 || currentElectricityReading < currentReadingFromTenant}
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
          {isSubmitting ? 'Processing...' : 'Evict Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
