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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
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
        PaperProps={{
          sx: {
            borderRadius: '12px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-3">
            <ReceiptIcon className="text-blue-600 dark:text-blue-400" />
            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
              Process Refund
            </Typography>
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Refund Details Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <Typography variant="h6" className="font-semibold mb-4 text-gray-900 dark:text-white">
                Refund Details
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tenant Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PersonIcon className="text-gray-400" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Tenant: {refund.tenant.tenantName}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="text-gray-400" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Phone: {refund.tenant.tenantNumber}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <HomeIcon className="text-gray-400" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Room: {refund.room.roomNo}
                    </Typography>
                  </div>
                </div>

                {/* Refund Amount Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CurrencyIcon className="text-gray-400" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Security Deposit: {formatCurrency(refund.securityDepositPaid)}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyIcon className="text-amber-600" />
                    <Typography variant="body1" className="font-semibold text-amber-600 dark:text-amber-400">
                      Refund Amount: {formatCurrency(refund.refundAmount)}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Notice Ends: {formatDate(refund.noticeEndsOn)}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              {refund.deductions && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
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
            </div>

            {/* Transaction Details Section */}
            <div className="grid grid-cols-1 gap-2">
              <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                Transaction Details
              </Typography>

              {/* Transaction ID */}
              <TextField
                label="Transaction ID *"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                fullWidth
                required
                placeholder="Enter transaction ID or reference number"
                variant="outlined"
                sx={{
                  marginBottom: '10px',
                }}
              />

              {/* Payment Method */}
              <TextField
                label="Payment Method *"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                fullWidth
                required
                placeholder="e.g., Cash, Bank Transfer, UPI, Cheque, Online Payment"
                variant="outlined"
              />

                             {/* Receipt Upload */}
               <div>
                 <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                   Receipt Upload (Optional)
                 </Typography>

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
                 >
                   <input {...getInputProps()} />
                   <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                   {isDragActive ? (
                     <Typography variant="body2" className="text-blue-600 dark:text-blue-400">
                       Drop the receipt here...
                     </Typography>
                   ) : receiptFiles.length > 0 ? (
                     <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                       Add more receipts or drag & drop
                     </Typography>
                   ) : (
                     <div>
                       <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-2">
                         Drag & drop receipt images or PDFs here, or click to select
                       </Typography>
                       <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                         Supports: JPG, PNG, PDF
                       </Typography>
                     </div>
                   )}
                 </div>

                 <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-2 block">
                   {receiptFiles.length > 0 ? `${receiptFiles.length} receipt(s) selected` : '0 receipts selected'}
                 </Typography>

                 {/* Receipt Previews */}
                 {receiptPreviewUrls.length > 0 && (
                   <Box className="mt-4">
                     <Typography variant="subtitle2" className="font-medium mb-3 text-gray-900 dark:text-white">
                       Receipt Previews:
                     </Typography>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {receiptPreviewUrls.map((url, index) => (
                         <div key={index} className="relative">
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
               </div>

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
              />
            </div>
          </form>
        </DialogContent>

        <DialogActions className="p-6 bg-gray-50 dark:bg-gray-800">
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <PaymentIcon />}
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
