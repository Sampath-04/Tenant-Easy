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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useCreateNotice } from '@/hooks/useRentRecords';
import { getCurrentDate } from '@/lib/utils/formatters';

interface NoticeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (noticeData?: any) => void;
  tenantName: string;
  roomData: string;
  cycleEndDate: string;
  monthlyRent: number;
  tenantId: string;
}

export default function NoticeForm({
  isOpen,
  onClose,
  onSubmitCallback,
  tenantName,
  roomData,
  cycleEndDate,
  monthlyRent,
  tenantId,
}: NoticeFormProps) {
  const [extraDays, setExtraDays] = useState(0);
  const [cost, setCost] = useState(0);
  const [noticeEndDate, setNoticeEndDate] = useState<Date | null>(null);
  
  const createNoticeMutation = useCreateNotice();
  const isSubmitting = createNoticeMutation.isPending;
  // Calculate extra days when component mounts or cycle end date changes
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
     const cycleEnd = new Date(cycleEndDate);
     const today = getCurrentDate(); // Notice application date
     
     // Calculate default notice end date (30 days from today - notice application date)
     const defaultNoticeEndDate = new Date(today);
     defaultNoticeEndDate.setDate(defaultNoticeEndDate.getDate() + 30);
     
     // Set the notice end date if not already set
     if (!noticeEndDate) {
       setNoticeEndDate(defaultNoticeEndDate);
     }
     
     // Calculate extra days based on selected notice end date
     const calculateExtraDays = () => {
       if (!noticeEndDate) return 0;
       
       const diffTime = noticeEndDate.getTime() - cycleEnd.getTime();
       const extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       return Math.max(0, extraDays);
     };
     
     const calculatedExtraDays = calculateExtraDays();
     setExtraDays(calculatedExtraDays);
     setCost(calculatedExtraDays > 0 ? Math.round((monthlyRent / 30) * calculatedExtraDays) : 0);
  }, [cycleEndDate, monthlyRent, isOpen, noticeEndDate]);

  const handleSubmit = async () => {
    if (!noticeEndDate) {
      console.error('Notice end date is required');
      return;
    }

    try {
      // Create notice
      const result = await createNoticeMutation.mutateAsync({
        tenantId,
        noticeDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        noticeEndsOn: noticeEndDate.toISOString().split('T')[0], // Notice end date in YYYY-MM-DD format
        rent: cost, // Cost for extra days
      });

      // Call onSubmitCallback with notice data if provided
      if (onSubmitCallback) {
        // Create notice data object without _id
        const noticeData = {
          noticeDate: new Date().toISOString(),
          noticeEndsOn: noticeEndDate.toISOString(),
          rent: cost,
          totalAmount: cost
        };
        onSubmitCallback(noticeData);
      }

      // Close the form
      onClose();
    } catch (error) {
      console.error('Failed to create notice:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
        const today = getCurrentDate();
        const defaultNoticeEndDate = new Date(today);
        defaultNoticeEndDate.setDate(defaultNoticeEndDate.getDate() + 30);
        setNoticeEndDate(defaultNoticeEndDate);
        onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6">Apply Notice Period</Typography>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-orange-800 dark:text-orange-300 mb-3">
            Notice Details
          </p>
          <Box className="space-y-2">
            <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Tenant:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {tenantName}
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Room:</Typography>
              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                {roomData}
              </Typography>
            </div>
            </div>
            <div className='flex justify-between'>
                <div className='flex items-center gap-2'>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Cycle End Date:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                    {new Date(cycleEndDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    })}
                </Typography>
                </div>
                <div className='flex items-center gap-2'>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Extra Days:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                    {extraDays > 1 ? `${extraDays} days` : `${extraDays} day`}
                </Typography>
                </div>
            </div>
          </Box>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
           <DatePicker
             label="Notice End Date"
             value={noticeEndDate}
             onChange={(newDate) => {
               setNoticeEndDate(newDate);
             }}
                            slotProps={{
                 textField: {
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   helperText: "30 days from notice application date by default"
                 }
               }}
               minDate={new Date()}
           />
         </LocalizationProvider>

          <TextField
           fullWidth
           label="Extra Days"
           type="number"
           value={extraDays}
           margin="normal"
           variant="outlined"
           helperText={`Days from cycle end date to notice end date`}
           InputProps={{
             readOnly: true,
           }}
         />

         <TextField
           fullWidth
           label="Cost for Extra Days"
           type="number"
           value={cost}
           onChange={(e) => setCost(Number(e.target.value))}
           margin="normal"
           variant="outlined"
           helperText={`Calculated: ₹${Math.round(monthlyRent / 30)} per day`}
         />
      </DialogContent>

      <DialogActions className="flex justify-center gap-4 !p-4 !pt-0">
        <button onClick={handleClose} disabled={isSubmitting} className='border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-[30px] cursor-pointer dark:border-gray-400 dark:text-gray-200'>
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-[30px] text-sm md:text-base !ml-0 cursor-pointer flex items-center justify-center gap-2 dark:text-gray-200"
        >
          {isSubmitting && <CircularProgress size={16} color="inherit" />}
          {isSubmitting ? 'Applying...' : 'Apply Notice'}
        </button>
      </DialogActions>
    </Dialog>
  );
}
