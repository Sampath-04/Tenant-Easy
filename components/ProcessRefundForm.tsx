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
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  CurrencyRupee as CurrencyIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { Refund } from '@/lib/api/refunds';
import { PAYMENT_METHOD_OPTIONS } from '@/lib/constants/paymentConstants';

interface ProcessRefundFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    transactionId: string;
    receiptUrl?: File;
    paymentMethod: string;
    notes?: string;
  }) => void;
  refund: Refund;
  isSubmitting?: boolean;
}



export default function ProcessRefundForm({
  isOpen,
  onClose,
  onSubmitCallback,
  refund,
  isSubmitting = false,
}: ProcessRefundFormProps) {
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptPreviewUrls, setReceiptPreviewUrls] = useState<string[]>([]);
  const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return { file, previewUrl };
    });
    
    setReceiptFiles(prev => [...prev, ...acceptedFiles]);
    setReceiptPreviewUrls(prev => [...prev, ...newFiles.map(f => f.previewUrl)]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const removeReceipt = (index: number) => {
    if (receiptPreviewUrls[index]) {
      URL.revokeObjectURL(receiptPreviewUrls[index]);
    }
    setReceiptFiles(prev => prev.filter((_, i) => i !== index));
    setReceiptPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      return;
    }

    if (!paymentMethod) {
      return;
    }

    const formData = {
      transactionId: transactionId.trim(),
      paymentMethod,
      notes: notes.trim() || undefined,
      receiptUrl: receiptFiles[0] || undefined,
    };

    onSubmitCallback?.(formData);
  };

  const handleClose = () => {
    // Clean up object URLs
    receiptPreviewUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

    // Reset form
    setTransactionId('');
    setPaymentMethod('');
    setNotes('');
    setReceiptFiles([]);
    setReceiptPreviewUrls([]);

    onClose();
  };

  const isFormValid = transactionId.trim() && paymentMethod;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={(theme) => ({
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
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
            pb: 2,
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
            backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          })}
        >
          <div style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
            <ReceiptIcon sx={{ marginRight: 1 }} className='text-blue-600 dark:text-blue-400' />
              Process Refund
          </div>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={(theme) => ({
          flex: 1,
          overflow: 'auto',
          padding: '24px!important  ',
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Refund Details Section */}
            <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 mb-3 text-md font-bold">
                Refund Details
              </p>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-row items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-md">Tenant:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {refund.tenant.tenantName}
                  </p>
                  </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-md">Phone:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {refund.tenant.tenantNumber}
                  </p>
                  </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-md">Room:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {refund.room.roomNo}
                  </p>
                  </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-md">Notice Ends:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(refund.noticeEndsOn)}
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
                    {formatCurrency(refund.securityDepositPaid)}
                  </p>
                  </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-md">Refund Amount:</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(refund.refundAmount)}
                  </p>
                </div>
              </Box>

              {/* Deductions */}
              {refund.deductions && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                    Deductions Applied:
                  </Typography>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Electricity Bill
                      </Typography>
                      <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(refund.deductions.electricityBill)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Electricity Units
                      </Typography>
                      <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                        {refund.deductions.electricityUnits}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Other Deductions
                      </Typography>
                      <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(refund.deductions.otherDeductions)}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {refund.tenantQrCodeUrl && (
                <div className="mt-4">
                  <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                    Tenant QR Code:
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                    <img
                      src={refund.tenantQrCodeUrl}
                      alt="Tenant QR Code"
                      className="w-32 h-32 object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setIsQrPreviewOpen(true)}
                    />
                  </Box>
                </div>
              )}
            </Box>

            {/* Transaction Details Section */}
            <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 mb-4 font-bold">
                Transaction Details
              </p>

              <Box className="grid grid-cols-2 gap-4">
              {/* Transaction ID */}
              <TextField
                label="Transaction ID *"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                fullWidth
                required
                placeholder="Enter transaction ID or reference number"
                variant="outlined"
                  sx={(theme) => ({
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                      },
                    },
                  })}
              />

                {/* Payment Method */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Payment Method *</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method *"
                    required
                    sx={(theme) => ({
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
                </FormControl>
              </Box>
            </Box>

            {/* Receipt Upload Section */}
            <Box className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 mb-4 font-bold">
                   Receipt Upload (Optional)
              </p>

                 {/* Dropzone */}
                 <div
                   {...getRootProps()}
                   className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                     isDragActive
                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                       : receiptFiles.length > 0
                       ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
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
                  <p className="text-blue-600 dark:text-blue-400">Drop the receipt here...</p>
                   ) : receiptFiles.length > 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Add more receipts or drag & drop</p>
                   ) : (
                     <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                         Drag & drop receipt images or PDFs here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                         Supports: JPG, PNG, PDF
                    </p>
                     </div>
                   )}
                 </div>

              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                   {receiptFiles.length > 0 ? `${receiptFiles.length} receipt(s) selected` : '0 receipts selected'}
              </p>

                 {/* Receipt Previews */}
                 {receiptPreviewUrls.length > 0 && (
                   <Box className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                       Receipt Previews:
                  </p>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {receiptPreviewUrls.map((url, index) => (
                      <div key={index} className="relative  w-[160px] h-[160px]">
                           <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                             {receiptFiles[index]?.type.startsWith('image/') ? (
                               <img
                                 src={url}
                                 alt={`Receipt ${index + 1}`}
                                 className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                 onClick={() => {
                                   setSelectedReceiptIndex(index);
                                   setIsReceiptPreviewOpen(true);
                                 }}
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                 <ReceiptIcon className="text-gray-400 text-3xl" />
                               </div>
                             )}
                           </div>
                           <IconButton
                             onClick={() => removeReceipt(index)}
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
                             title={`Remove receipt ${index + 1}`}
                           >
                             <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                           </IconButton>
                         </div>
                       ))}
                     </div>
                   </Box>
                 )}
            </Box>

              {/* Notes */}
              <TextField
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add any additional notes about this refund..."
                variant="outlined"
              sx={(theme) => ({
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              })}
            />
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
            disabled={!isFormValid || isSubmitting}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PaymentIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
              color: '#ffffff',
              border: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#047857' : '#059669',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(5, 150, 105, 0.3)' 
                  : '0 4px 12px rgba(16, 185, 129, 0.3)',
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
            {isSubmitting ? 'Processing...' : 'Process Refund'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* QR Code Preview Dialog */}
      <Dialog
        open={isQrPreviewOpen}
        onClose={() => setIsQrPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setIsQrPreviewOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ padding: 0, textAlign: 'center' }}>
            <img
              src={refund.tenantQrCodeUrl}
              alt={`QR Code for ${refund.tenant.tenantName}`}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </DialogContent>
        </Box>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={isReceiptPreviewOpen}
        onClose={() => setIsReceiptPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setIsReceiptPreviewOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ padding: 0, textAlign: 'center' }}>
            {receiptFiles[selectedReceiptIndex]?.type.startsWith('image/') ? (
              <img
                src={receiptPreviewUrls[selectedReceiptIndex]}
                alt={`Receipt ${selectedReceiptIndex + 1}`}
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            ) : (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <ReceiptIcon className="mx-auto text-gray-400 text-6xl mb-4" />
                  <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                    PDF Receipt
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 dark:text-gray-500 mt-2">
                    {receiptFiles[selectedReceiptIndex]?.name}
                  </Typography>
                </div>
              </div>
            )}
          </DialogContent>
        </Box>
      </Dialog>

    </>

  )
}
