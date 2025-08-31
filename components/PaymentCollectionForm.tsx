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
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { RentHistoryItem } from '@/lib/api/rentHistory';
import { formatCurrency, formatDate, getCurrentDate } from '@/lib/utils/formatters';
import NoticeForm from './NoticeForm';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMarkRentAsPaid } from '@/hooks/useRentRecords';
import { showErrorToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';

interface PaymentCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  rentRecord: RentHistoryItem | null;
  onSubmitCallback?: (data: {
    rentRecord: RentHistoryItem;
    comments?: string;
    paymentProofs?: File[];
  }) => void;
  setPaymentFormOpen: (value: boolean) => void;
}

export default function PaymentCollectionForm({
  isOpen,
  onClose,
  rentRecord,
  onSubmitCallback,
  setPaymentFormOpen
}: PaymentCollectionFormProps) {
  const [comments, setComments] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [isCollectingStartNew, setIsCollectingStartNew] = useState(false);
  const [isCollectingApplyNotice, setIsCollectingApplyNotice] = useState(false);
  const [cycleEndDate, setCycleEndDate] = useState<string>(rentRecord?.endDate || '');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState<string>('');

  // Initialize amount when rentRecord is available
  useEffect(() => {
    if (rentRecord) {
      if (rentRecord.paymentStatus === "PARTIALLY_PAID" && rentRecord.paymentTransactions?.length > 0) {
        // Calculate total amount paid so far
        const totalPaid = rentRecord.paymentTransactions.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
        // Set remaining amount
        setAmount(Math.max(0, (rentRecord.totalAmount || 0) - totalPaid));
      } else {
        setAmount(rentRecord.totalAmount || 0);
      }
    }
  }, [rentRecord]);

  const markRentAsPaidMutation = useMarkRentAsPaid();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (selectedImages.length + acceptedFiles.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }

    const newImages = [...selectedImages, ...acceptedFiles];
    setSelectedImages(newImages);

    // Create preview URLs for new files
    const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [selectedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 4 - selectedImages.length,
    disabled: selectedImages.length >= 4
  });

  if (!isOpen || !rentRecord) return null;

  const handleClose = () => {
    if (!isCollectingStartNew && !isCollectingApplyNotice) {
      // Clean up object URLs to prevent memory leaks
      imagePreviewUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
      
      setComments('');
      setSelectedImages([]);
      setImagePreviewUrls([]);
      // Reset amount based on payment status
      if (rentRecord?.paymentStatus === "PARTIALLY_PAID" && rentRecord?.paymentTransactions?.length > 0) {
        const totalPaid = rentRecord.paymentTransactions.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
        setAmount(Math.max(0, (rentRecord.totalAmount || 0) - totalPaid));
      } else {
        setAmount(rentRecord?.totalAmount || 0);
      }
      setPaidTo('');
      setShowNoticeForm(false);
      onClose();
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleCollectAndStartNew = async () => {
    try {
      setIsCollectingStartNew(true);
      if(amount <= 0 || !paidTo.trim()) {
        const errorToast = showErrorToast("Please enter the amount and paid to");
        toast.error(errorToast.message, errorToast.config);
        return;
      }
      await markRentAsPaidMutation.mutateAsync({
        rentId: rentRecord._id,
        data: {
          amount: amount,
          paidDate: getCurrentDate().toISOString().split('T')[0],
          paymentProofs: selectedImages.length > 0 ? selectedImages : undefined,
          paidTo: paidTo.trim(),
          comments: comments.trim() || undefined,
        }
      });
      
      // Clean up object URLs
      imagePreviewUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });

      onSubmitCallback?.({
        rentRecord: rentRecord,
        comments: comments.trim() || undefined,
        paymentProofs: selectedImages.length > 0 ? selectedImages : undefined
      });
      
      // Reset form and close
      setComments('');
      setSelectedImages([]);
      setImagePreviewUrls([]);
      // Reset amount based on payment status
      if (rentRecord?.paymentStatus === "PARTIALLY_PAID" && rentRecord?.paymentTransactions?.length > 0) {
        const totalPaid = rentRecord.paymentTransactions.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
        setAmount(Math.max(0, (rentRecord.totalAmount || 0) - totalPaid));
      } else {
        setAmount(rentRecord?.totalAmount || 0);
      }
      setPaidTo('');
      onClose();
    } catch (error) {
      console.error('Failed to mark rent as paid:', error);
    } finally {
      setIsCollectingStartNew(false);
    }
  };

  const handleCollectAndApplyNotice = async () => {
    try {
      if(amount <= 0 || !paidTo.trim()) {
        const errorToast = showErrorToast('Please enter the amount and paid to');
        toast.error(errorToast.message, errorToast.config);
        return;
      }
      setIsCollectingApplyNotice(true);
      // Step 1: Mark rent as paid first
     if(rentRecord.paymentStatus !== "FULLY_PAID") {
        await markRentAsPaidMutation.mutateAsync({
        rentId: rentRecord._id,
        data: {
          amount: amount,
          paidDate: getCurrentDate().toISOString().split('T')[0],
          paymentProofs: selectedImages.length > 0 ? selectedImages : undefined,
          paidTo: paidTo.trim(),
          comments: comments.trim() || undefined,
        }
      });

      onSubmitCallback?.({
        rentRecord: rentRecord,
        comments: comments.trim() || undefined,
        paymentProofs: selectedImages.length > 0 ? selectedImages : undefined
      });
    }
    
    const nextMonthCycleEndDate = new Date(rentRecord.endDate);
    nextMonthCycleEndDate.setMonth(nextMonthCycleEndDate.getMonth() + 1);
    setCycleEndDate(nextMonthCycleEndDate.toISOString().split('T')[0]);

      // Step 2: Open notice form after successful payment collection
      setShowNoticeForm(true);
    } catch (error) {

    } finally {
      setIsCollectingApplyNotice(false);
    }
  };

  const handleNoticeSubmit = () => {
    // Clean up object URLs
    imagePreviewUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    // Reset form and close
    setComments('');
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setShowNoticeForm(false);
    setPaymentFormOpen(false);
  };

  return (
    <>
      {/* Main Payment Collection Dialog */}
      <Dialog 
        open={isOpen && !showNoticeForm} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx= {(theme: Theme) => ({
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
          <p className="font-semibold text-lg">Collect Payment</p>
          <IconButton onClick={handleClose} disabled={isCollectingStartNew || isCollectingApplyNotice}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
              {/* Rent Details */}
          <Box className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Typography variant="subtitle2" className="text-blue-800 dark:text-blue-300 mb-3">
                  Rent Details
            </Typography>
            <Box className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Period:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                      {formatDate(rentRecord.startDate)} - {formatDate(rentRecord.endDate)}
                </Typography>
                  </div>
                  <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Room:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                      {rentRecord.room?.roomNo || '-'}
                </Typography>
                  </div>
                  <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Rent:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecord.rent)}
                </Typography>
                  </div>
                  <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Electricity:</Typography>
                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecord.electricityBill)}
                </Typography>
                  </div>
                  <div className="col-span-2">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">Total Amount:</Typography>
                <Typography variant="h6" className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(rentRecord.totalAmount)}
                </Typography>
                    </div>
            </Box>
            
            {/* Partially Paid Details */}
            {rentRecord?.paymentStatus === "PARTIALLY_PAID" && rentRecord?.paymentTransactions?.length > 0 && (
              <Box className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Typography variant="subtitle2" className="text-amber-800 dark:text-amber-300 mb-2">
                  Previous Payments
                </Typography>
                <div className="space-y-2">
                  {rentRecord.paymentTransactions.map((payment: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Payment {index + 1} - {payment.paidDate ? formatDate(payment.paidDate) : 'Unknown Date'}
                        </Typography>
                        {payment.paidTo && (
                          <Typography variant="body2" className="text-gray-500 dark:text-gray-500 text-xs">
                            Paid to: {payment.paidTo}
                          </Typography>
                        )}
                      </div>
                      <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount || 0)}
                      </Typography>
                    </div>
                  ))}
                  <div className="border-t border-amber-200 dark:border-amber-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <Typography variant="body2" className="text-amber-800 dark:text-amber-300 font-medium">
                        Total Paid:
                      </Typography>
                      <Typography variant="body2" className="font-bold text-amber-800 dark:text-amber-300">
                        {formatCurrency(rentRecord.paymentTransactions.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0))}
                      </Typography>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Remaining Amount:
                      </Typography>
                      <Typography variant="body2" className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(Math.max(0, (rentRecord.totalAmount || 0) - rentRecord.paymentTransactions.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)))}
                      </Typography>
                  </div>
                </div>
              </div>
              </Box>
            )}
          </Box>

          {/* Payment Details */}
          <Box className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Typography variant="subtitle2" className="text-green-800 dark:text-green-300 mb-3">
              Payment Details
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount to be paid"
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
                label="Paid To"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Enter recipient name"
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

        {/* Image Upload */}
          <Box className="mt-4">
            <p className='text-gray-600 dark:text-gray-400 text-md mb-2'>
              Upload Proofs (Optional) - Max 4 images
            </p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : selectedImages.length >= 4
                  ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400">Drop the images here...</p>
              ) : selectedImages.length >= 4 ? (
                <p className="text-gray-500 dark:text-gray-400">Maximum 4 images reached</p>
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

            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              {selectedImages.length}/4 images selected
            </p>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <Box className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Images:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 ">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                />
              </div>
                      <IconButton
                        onClick={() => removeImage(index)}
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


              {/* Comments */}
          <TextField
            fullWidth
            label="Comments (Optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional notes or comments"
            margin="normal"
            variant="outlined"
            multiline
            rows={1}
            sx= {(theme: Theme) => ({
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? '#B3B3B3' : 'rgba(0, 0, 0, 0.23)',
                  },
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
          <button onClick={handleClose} disabled={isCollectingStartNew || isCollectingApplyNotice} className='hidden md:block border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-[30px] cursor-pointer dark:border-gray-400 dark:text-gray-200'>
                Cancel
              </button>
              <button
            onClick={handleCollectAndStartNew}
            disabled={isCollectingStartNew || isCollectingApplyNotice || amount <= 0 }
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-[30px] text-sm md:text-base !ml-0 cursor-pointer flex items-center justify-center gap-2 dark:text-gray-200"
          >
            {isCollectingStartNew && <CircularProgress size={16} color="inherit" />}
            {rentRecord?.paymentStatus === "PARTIALLY_PAID" ? "Collect" : "Collect - Start New"}
          </button>
          {/*  show only if the amount user paid + amount is >= rentRecord?.totalAmount */}
          {rentRecord?.totalAmount <= amount + (rentRecord?.paymentTransactions?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0) && <button 
            onClick={handleCollectAndApplyNotice}
            disabled={isCollectingStartNew || isCollectingApplyNotice || amount <= 0}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-[30px] text-sm md:text-base !ml-0 cursor-pointer flex items-center justify-center gap-2 dark:text-gray-200"
          >
            {isCollectingApplyNotice && <CircularProgress size={16} color="inherit" />}
            Collect - Apply Notice
              </button>}
        </DialogActions>
      </Dialog>

      {/* Notice Form Dialog */}
      <NoticeForm
        isOpen={showNoticeForm}
        onClose={() => {
          handleClose()
        }}
        onSubmitCallback={handleNoticeSubmit}
        tenantName={rentRecord?.tenant.tenantName || ''}
        roomData={`Room ${rentRecord?.room.roomNo || ''}`}
        cycleEndDate={cycleEndDate}
        monthlyRent={rentRecord?.rent || 0}
        tenantId={rentRecord?.tenant._id || ''}
      />
    </>
  );
}
