'use client';

import React, { useState, useEffect } from 'react';
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
import { Close as CloseIcon, PersonOff as PersonOffIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface EvictionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    tenantId: string;
    currentElectricityReading: number;
    refundableAmount: number;
    comments?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const ratePerUnit = 10; // Adjust this based on your electricity rate
    const totalCurrentElectricityCost = Math.max(0, unitsConsumed * ratePerUnit);

    // Calculate per-tenant electricity cost
    const numberOfTenants = rentRecord.room?.tenants?.length || 1;
    const perTenantElectricityCost = totalCurrentElectricityCost / numberOfTenants;

    // Calculate refundable amount
    const totalCharges = totalElectricityPaid + perTenantElectricityCost;
    const refundable = Math.max(0, securityDeposit - totalCharges);
    
    setRefundableAmount(refundable);
  }, [currentElectricityReading, rentRecord]);

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
        });
      }

      // Reset form
      setCurrentElectricityReading(0);
      setComments('');
      onClose();
    } catch (error) {
      console.error('Failed to submit eviction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentElectricityReading(0);
      setComments('');
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
          '@media (max-width: 600px)': {
            margin: '16px',
            width: '100%',
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
      
      <DialogContent>
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
          <p className="text-gray-800 dark:text-gray-300 mb-3 text-md font-bold">
            Final Electricity Reading
          </p>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-md">
                Last Reading: {lastReading} units
              </p>
              <TextField
                fullWidth
                label="Current Reading (units)"
                type="number"
                value={currentElectricityReading}
                onChange={(e) => setCurrentElectricityReading(Number(e.target.value))}
                placeholder="Enter current meter reading"
                variant="outlined"
                sx={(theme: Theme) => ({
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                })}
              />
            </div>
              <div className="flex flex-col justify-center">
               <p className="text-gray-600 dark:text-gray-400 mb-1 text-md">
                 Units Consumed:
               </p>
               <p className="font-bold text-amber-600 dark:text-amber-400">
                 {Math.max(0, currentElectricityReading - lastReading)} units
               </p>
               <p className="text-gray-600 dark:text-gray-400 mt-2 text-md">
                 Total Cost: {formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * 10))}
               </p>
               <p className="text-gray-600 dark:text-gray-400 text-md">
                 Per Tenant: {formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * 10 / numberOfTenants))}
               </p>
             </div>
          </Box>
        </Box>

                 {/* Refundable Amount */}
         <Box className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
           <Typography variant="subtitle2" className="text-purple-800 dark:text-purple-300 mb-3">
             Refund Calculation
           </Typography>
           <Box className="text-center">
             <Typography variant="h4" className="font-bold text-purple-600 dark:text-purple-400 mb-2">
               {formatCurrency(refundableAmount)}
             </Typography>
             <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
               Refundable Amount
             </Typography>
             
             {/* Calculation Breakdown */}
             <Box className="text-left bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
               <Typography variant="body2" className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Calculation Breakdown:
               </Typography>
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
                   <span className="font-medium">-{formatCurrency(Math.max(0, (currentElectricityReading - lastReading) * 8 / numberOfTenants))}</span>
                 </div>
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
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          variant="outlined"
          className="border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-[30px] cursor-pointer dark:border-gray-400 dark:text-gray-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || currentElectricityReading <= 0}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonOffIcon />}
          sx={{
            backgroundColor: '#dc2626',
            borderRadius: '12px',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            padding: '12px 24px',
            '&:hover': {
              backgroundColor: '#b91c1c',
            },
            '&:disabled': {
              backgroundColor: '#9ca3af',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? 'Processing...' : 'Complete Eviction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
