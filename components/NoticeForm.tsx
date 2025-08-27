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
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useCreateNotice, useUpdateNotice } from '@/hooks/useRentRecords';
import { getCurrentDate } from '@/lib/utils/formatters';
import { useDropzone } from 'react-dropzone';

interface NoticeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (noticeData?: any) => void;
  tenantName: string;
  roomData: any;
  cycleEndDate: string;
  monthlyRent: number;
  tenantId: string;
  existingNotice?: any;
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
  existingNotice,
}: NoticeFormProps) {
  const [extraDays, setExtraDays] = useState(0);
  const [cost, setCost] = useState(0);
  const [noticeEndDate, setNoticeEndDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState(0);
  const [paidTo, setPaidTo] = useState('');
  const [comments, setComments] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreviewUrl, setPaymentProofPreviewUrl] = useState<string | null>(null);
  
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const isSubmitting = createNoticeMutation.isPending || updateNoticeMutation.isPending;

  // Dropzone for payment proof
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPaymentProof(file);
      
      // Clean up previous preview URL if it exists
      if (paymentProofPreviewUrl) {
        URL.revokeObjectURL(paymentProofPreviewUrl);
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      console.log("previewUrl", previewUrl);
      setPaymentProofPreviewUrl(previewUrl);
    }
  }, [paymentProofPreviewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (paymentProofPreviewUrl) {
        URL.revokeObjectURL(paymentProofPreviewUrl);
      }
    };
  }, []); // Remove dependency to prevent premature cleanup

  // Additional cleanup when component unmounts or dialog closes
  useEffect(() => {
    if (!isOpen && paymentProofPreviewUrl) {
      URL.revokeObjectURL(paymentProofPreviewUrl);
      setPaymentProofPreviewUrl(null);
    }
  }, [isOpen]);

  // Populate form with existing notice data if provided
  useEffect(() => {
    if (existingNotice && isOpen) {
      setExtraDays(existingNotice.extraDays || 0);
      setCost(existingNotice.extraDaysCost || 0);
      setNoticeEndDate(existingNotice.noticeEndsOn ? new Date(existingNotice.noticeEndsOn) : null);
      // For existing notices, we don't pre-fill the payment fields as they are for new payments
      setAmount(0);
      setPaidTo('');
      setComments('');
      setPaymentProof(null);
      // Clear any existing preview URL
      if (paymentProofPreviewUrl) {
        URL.revokeObjectURL(paymentProofPreviewUrl);
        setPaymentProofPreviewUrl(null);
      }
    }
  }, [existingNotice, isOpen]); // Remove paymentProofPreviewUrl dependency

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

    // Validate payment amount
    const maxAmount = existingNotice ? (existingNotice.remainingAmount || cost) : cost;
    if (amount > maxAmount) {
      console.error(`Payment amount cannot exceed ${existingNotice ? 'the remaining amount' : 'the extra days cost'}`);
      return;
    }

    try {
      if (existingNotice) {
        // Update existing notice
        const result = await updateNoticeMutation.mutateAsync({
          noticeId: existingNotice._id,
          data: {
            tenantId,
            noticeDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            noticeEndsOn: noticeEndDate.toISOString().split('T')[0], // Notice end date in YYYY-MM-DD format
            extraDays,
            extraDaysCost: cost,
            amount: amount,
            paidTo: paidTo.trim() || undefined,
            comments: comments.trim() || undefined,
            paymentProof: paymentProof || undefined,
          }
        });
      } else {
        // Create new notice
        const result = await createNoticeMutation.mutateAsync({
          tenantId,
          noticeDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          noticeEndsOn: noticeEndDate.toISOString().split('T')[0], // Notice end date in YYYY-MM-DD format
          extraDays,
          extraDaysCost: cost,
          amount: amount > 0 ? amount : undefined,
          paidTo: paidTo.trim() || undefined,
          comments: comments.trim() || undefined,
          paymentProof: paymentProof || undefined,
        });
      }

      // Call onSubmitCallback with notice data if provided
      if (onSubmitCallback) {
        // Create notice data object without _id
        const noticeData = {
          noticeDate: new Date().toISOString(),
          noticeEndsOn: noticeEndDate.toISOString(),
          extraDaysCost: cost,
          amount,
          totalAmount: 0
        };
        onSubmitCallback(noticeData);
      }

      // Close the form
      onClose();
    } catch (error) {
      console.error('Failed to create/update notice:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
        const today = getCurrentDate();
        const defaultNoticeEndDate = new Date(today);
        defaultNoticeEndDate.setDate(defaultNoticeEndDate.getDate() + 30);
        setNoticeEndDate(defaultNoticeEndDate);
        setAmount(0);
        setPaidTo('');
        setComments('');
        setPaymentProof(null);
        if (paymentProofPreviewUrl) {
          URL.revokeObjectURL(paymentProofPreviewUrl);
          setPaymentProofPreviewUrl(null);
        }
        onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '680px',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6">
          {existingNotice ? 'Update Notice Period' : 'Apply Notice Period'}
        </Typography>
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
                {typeof roomData === 'string' ? roomData : roomData?.roomNo || 'N/A'}
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

            {/* Payment History Section for existing notices */}
        {existingNotice && existingNotice.payments && existingNotice.payments.length > 0 && (
          <Box className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-300 mb-3 font-medium">
              Payment History
            </p>
            <Box className="space-y-3">
              {existingNotice.payments.map((payment: any, index: number) => (
                <Box key={index} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                        ₹{payment.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Paid To:</span>
                      <span className="font-medium ml-1">{payment.paidTo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="font-medium ml-1">
                        {new Date(payment.paidDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {/* <div>
                      <span className="text-gray-600 dark:text-gray-400">Comments:</span>
                      <span className="font-medium ml-1">{payment.comments || '-'}</span>
                    </div> */}
                  </div>
                </Box>
              ))}
              <Box className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-600">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-800 dark:text-yellow-300 font-medium">Total Paid:</span>
                  <span className="font-bold text-yellow-800 dark:text-yellow-300">
                    ₹{existingNotice.totalPaidAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-yellow-800 dark:text-yellow-300 font-medium">Remaining Amount:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    ₹{existingNotice.remainingAmount?.toLocaleString()}
                  </span>
                </div>
              </Box>
            </Box>
          </Box>
        )}

         {/* Payment Section */}
         {cost > 0 && (
           <Accordion className="mt-6" sx={{ 
             '&:before': { display: 'none' },
             boxShadow: 'none',
             border: '1px solid #e5e7eb',
             borderRadius: '8px',
             '&.Mui-expanded': {
               margin: '24px 0',
             }
           }}>
             <AccordionSummary
               expandIcon={<ExpandMoreIcon />}
               sx= {theme  => ({
                 '&.Mui-expanded': {
                  //  minHeight: '48px',
                 }
               })}
               className="dark:bg-blue-900/20 dark:border-gray-700"
             >
               <p className="font-medium text-blue-900 dark:text-blue-100">
                 {existingNotice ? 'Additional Payment Details (Optional)' : 'Payment Details (Optional)'}
               </p>
             </AccordionSummary>
             <AccordionDetails className="p-4">
             <div className="space-y-4">
                 <TextField
                   fullWidth
                   label="Payment Amount"
                   type="number"
                   value={amount}
                   onChange={(e) => setAmount(Number(e.target.value))}
                   margin="normal"
                   variant="outlined"
                   helperText={existingNotice ? `Maximum: ₹${existingNotice.remainingAmount || cost}` : `Maximum: ₹${cost}`}
                   InputProps={{
                     inputProps: { max: existingNotice ? (existingNotice.remainingAmount || cost) : cost }
                   }}
                 />

                 <TextField
                   fullWidth
                   label="Paid To"
                   value={paidTo}
                   onChange={(e) => setPaidTo(e.target.value)}
                   margin="normal"
                   variant="outlined"
                   placeholder="Enter recipient name"
                 />

                 <TextField
                   fullWidth
                   label="Comments"
                   value={comments}
                   onChange={(e) => setComments(e.target.value)}
                   margin="normal"
                   variant="outlined"
                   multiline
                   rows={2}
                   placeholder="Any additional notes..."
                 />

                 {/* Payment Proof Upload */}
                 <div>
                   <p className="text-gray-600 dark:text-gray-400 mb-2">
                     Payment Proof (Optional)
                   </p>
                   
                   {!paymentProof ? (
                     <div
                       {...getRootProps()}
                       className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                         isDragActive
                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                           : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                       }`}
                     >
                       <input {...getInputProps()} />
                       <CloudUploadIcon className="text-4xl text-gray-400 mb-2" />
                       <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                         {isDragActive
                           ? 'Drop the file here...'
                           : 'Drag & drop a file here, or click to select'}
                       </Typography>
                       <Typography variant="caption" className="text-gray-500 dark:text-gray-500">
                         Supports: JPG, PNG, GIF, PDF
                       </Typography>
                     </div>
                   ) : (
                     <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                                                    <Typography variant="body2" className="font-medium">
                           {paymentProof.name}
                         </Typography>
                         <Chip label={`${(paymentProof.size / 1024).toFixed(1)} KB`} size="small" />
                         </div>
                         <IconButton
                           size="small"
                           onClick={() => {
                             setPaymentProof(null);
                             if (paymentProofPreviewUrl) {
                               URL.revokeObjectURL(paymentProofPreviewUrl);
                               setPaymentProofPreviewUrl(null);
                             }
                           }}
                         >
                           <DeleteIcon />
                         </IconButton>
                       </div>
                       
                       {paymentProofPreviewUrl && paymentProof.type.startsWith('image/') && (
                         <Box className="mt-3">
                           <img
                             src={paymentProofPreviewUrl}
                             alt="Payment proof preview"
                             className="max-w-full h-32 object-contain rounded border"
                             onError={(e) => {
                               console.warn('Failed to load image preview');
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                         </Box>
                       )}
                     </div>
                   )}
                 </div>

                 {amount > 0 && (
                   <Alert severity="info" className="mt-4">
                     <Typography variant="body2">
                       Payment Amount: ₹{amount.toLocaleString()}
                       {amount < cost && (
                         <span className="block text-sm text-gray-600">
                           Remaining: ₹{(cost - amount).toLocaleString()}
                         </span>
                       )}
                     </Typography>
                   </Alert>
                 )}
               </div>
             </AccordionDetails>
           </Accordion>
         )}
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
          {isSubmitting ? (existingNotice ? 'Updating...' : 'Applying...') : (existingNotice ? 'Update Notice' : 'Apply Notice')}
        </button>
      </DialogActions>
    </Dialog>
  );
}
