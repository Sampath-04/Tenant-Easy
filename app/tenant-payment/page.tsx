'use client';

import React, { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Divider,
  useTheme,
  Button,
} from '@mui/material';
import Image from 'next/image';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRentRecord } from '@/hooks/useRentRecords';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { useSubmitPaymentRequest } from '@/hooks/usePaymentRequests';
import { toast } from 'react-toastify';

export default function TenantPaymentPage() {
  const searchParams = useSearchParams();
  const rentRecordId = searchParams.get('rentRecordId');
  
  // Payment request form state
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query hooks
  const submitPaymentRequestMutation = useSubmitPaymentRequest();
  
  // Commented out form-related state and functions
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [searchEnabled, setSearchEnabled] = useState(false);

  // const { data: tenantHistoryResponse, isLoading, error, refetch } = useTenantHistory(
  //   '', // roomNo not needed anymore
  //   phoneNumber,
  //   propertyId || undefined,
  //   searchEnabled
  // );

  const { data: rentRecordResponse, error } = useRentRecord(
    rentRecordId || '',
    !!rentRecordId
  );

  // Commented out form handlers
  // const handleSearch = () => {
  //   if (phoneNumber.trim()) {
  //     setSearchEnabled(true);
  //     refetch();
  //   }
  // };

  // const handleReset = () => {
  //   setPhoneNumber('');
  //   setSearchEnabled(false);
  // };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
        return 'success';
      case 'PARTIALLY_PAID':
        return 'warning';
      case 'NOT_PAID':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'PARTIALLY_PAID':
        return <WarningIcon className="h-4 w-4" />;
      case 'NOT_PAID':
        return <ScheduleIcon className="h-4 w-4" />;
      default:
        return <PaymentIcon className="h-4 w-4" />;
    }
  };

  const hasPendingPayments = rentRecordResponse?.data?.paymentStatus === 'NOT_PAID' || 
    rentRecordResponse?.data?.paymentStatus === 'PARTIALLY_PAID';
  
  const hasPaymentRequest = rentRecordResponse?.data?.paymentRequests && rentRecordResponse.data.paymentRequests.length > 0 
    ? rentRecordResponse.data.paymentRequests[0] 
    : null;

  // Download QR code function
  const handleDownloadQRCode = async () => {
    if (!rentRecordResponse?.data?.property?.paymentInfo?.qrCodeLink) return;
    
    try {
      const response = await fetch(rentRecordResponse.data.property.paymentInfo.qrCodeLink);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-qr-code-${rentRecordResponse.data.month}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  // Handle payment request submission
  const handlePaymentRequestSubmit = async () => {
    if (!rentRecordId || !paymentProof) {
      toast.error('Please upload a payment proof image');
      return;
    }

    if (!rentRecordResponse?.data?.remainingAmount || rentRecordResponse.data.remainingAmount <= 0) {
      toast.error('No pending amount to pay');
      return;
    }

    submitPaymentRequestMutation.mutate({
      rentRecord: rentRecordId,
      amount: rentRecordResponse.data.remainingAmount,
      paymentProofs: paymentProof,
    }, {
      onSuccess: (data) => {
        toast.success('Payment request submitted successfully!');
        // Reset form
        setPaymentProof(null);
      },
      onError: (error: any) => {
        console.error('Error submitting payment request:', error);
        toast.error(error?.message || 'Failed to submit payment request. Please try again.');
      },
    });
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPaymentProof(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setPaymentProof(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rent Record Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Viewing rent record details for the specified tenant
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Information */}
        {rentRecordResponse?.data?.property && (
          <Card className="mb-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BusinessIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                  Property Information
                </Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                    Property Name
                  </Typography>
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    {rentRecordResponse.data.property.propertyName}
                  </Typography>
                </div>
                <div>
                  <div className="flex items-start gap-2">
                    <LocationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                        Address
                      </Typography>
                      <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                        {rentRecordResponse.data.property.propertyAddress}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" className="mb-6">
            Failed to fetch rent record details. Please check the rent record ID in the URL.
          </Alert>
        )}

        {/* Tenant Information */}
        {rentRecordResponse?.data?.tenant && (
          <Card className="mb-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <PersonIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                  Tenant Information
                </Typography>
              </div>
              <div className="flex gap-6">
                <div>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                    Tenant Name
                  </Typography>
                  <Typography className="font-semibold text-gray-900 dark:text-white">
                    {rentRecordResponse.data.tenant.tenantName}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                    Phone Number
                  </Typography>
                  <Typography className="font-semibold text-gray-900 dark:text-white text-sm">
                    {rentRecordResponse.data.tenant.tenantNumber}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                    Room Number
                  </Typography>
                  <Typography className="font-semibold text-gray-900 dark:text-white text-sm">
                    {rentRecordResponse.data.room.roomNo} ({rentRecordResponse.data.room.roomType})
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code for Pending Payments */}
        {hasPendingPayments && !hasPaymentRequest && (
          <Card className="mb-6 shadow-lg border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <QrCodeIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <p  className="font-semibold text-orange-900 dark:text-orange-100 text-lg">
                  Payment QR Code
                </p>
              </div>
              <p className="text-orange-800 dark:text-orange-200 text-sm mb-4">  
                Please scan or download the QR code below to pay your rent.
              </p>
              
              {/* QR Code Image with proper styling */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Image 
                    src={rentRecordResponse.data.property.paymentInfo.qrCodeLink} 
                    alt="Payment QR Code" 
                    width={200} 
                    height={200}
                    className="rounded-lg border-2 border-orange-300 dark:border-orange-600 shadow-lg bg-white p-2"
                    priority={true}
                  />
                  {/* Decorative border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-orange-400/30 pointer-events-none"></div>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-center mb-6">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQRCode}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  sx={{
                    borderColor: 'rgb(251 146 60)',
                    color: 'rgb(194 65 12)',
                    '&:hover': {
                      borderColor: 'rgb(251 146 60)',
                      backgroundColor: 'rgb(255 247 237)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgb(194 65 12)',
                    },
                    '@media (prefers-color-scheme: dark)': {
                      borderColor: 'rgb(234 88 12)',
                      color: 'rgb(253 186 116)',
                      '&:hover': {
                        borderColor: 'rgb(234 88 12)',
                        backgroundColor: 'rgba(234 88 12 / 0.1)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgb(253 186 116)',
                      },
                    },
                  }}
                >
                  Download QR Code
                </Button>
              </div>

              {/* Payment Amount Display */}
              <div className="p-3 bg-orange-100 dark:bg-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700">
                <Typography variant="body2" className="text-orange-900 dark:text-orange-100 font-medium">
                  Pending Amount: {formatCurrency(rentRecordResponse?.data?.remainingAmount || 0)}
                </Typography>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Payment Request Form */}
        {hasPendingPayments && !hasPaymentRequest && !submitPaymentRequestMutation.isSuccess && (
          <Card className="mb-6 shadow-lg border border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <SendIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  Submit Payment Request
                </h3>
              </div>

              <div className="space-y-6">
                {/* Payment Amount Display */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Payment Amount</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(rentRecordResponse?.data?.remainingAmount || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                      <PaymentIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    This is the pending amount for {formatDate(rentRecordResponse?.data?.startDate)} to {formatDate(rentRecordResponse?.data?.endDate)}
                  </p>
                </div>

                {/* Drag and Drop Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Payment Proof (Image)
                  </label>
                  
                  {!paymentProof ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105'
                          : 'border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-full ${
                          isDragOver 
                            ? 'bg-blue-200 dark:bg-blue-800' 
                            : 'bg-blue-100 dark:bg-blue-800/50'
                        }`}>
                          <CloudUploadIcon className={`h-8 w-8 ${
                            isDragOver 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-blue-500 dark:text-blue-400'
                          }`} />
                        </div>
                        
                        <div>
                          <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                            {isDragOver ? 'Drop your image here' : 'Upload Payment Proof'}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            Drag and drop an image, or click to browse
                          </p>
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                            Supports: JPG, PNG, GIF (Max 10MB)
                          </p>
                        </div>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-green-300 dark:border-green-600 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                            <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100">
                              {paymentProof.name}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-300">
                              {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-2 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg transition-colors duration-200"
                        >
                          <CloseIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </button>
                      </div>
                      
                      {/* Image Preview Grid */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-green-200 dark:border-green-700 bg-green-100 dark:bg-green-800/50 flex items-center justify-center h-[160px]">
                            {paymentProof.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(paymentProof)}
                                alt="Payment proof preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-2">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  {paymentProof.type.includes('pdf') ? 'PDF' : 'File'}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                            {paymentProof.name.length > 20 ? paymentProof.name.substring(0, 17) + '...' : paymentProof.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handlePaymentRequestSubmit}
                  disabled={submitPaymentRequestMutation.isPending || !paymentProof}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    submitPaymentRequestMutation.isPending || !paymentProof
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {submitPaymentRequestMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <SendIcon className="h-5 w-5" />
                      <span>Submit Payment Request</span>
                    </div>
                  )}
                </button>

                {/* Progress Bar */}
                {submitPaymentRequestMutation.isPending && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Request Status from Rent Record */}
        {hasPaymentRequest && (
          <Card className="mb-6 shadow-lg border border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Payment Request Status
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Request ID</p>
                    <p className="font-medium text-green-900 dark:text-green-100">{hasPaymentRequest.id}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Amount</p>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {formatCurrency(hasPaymentRequest.amount)}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Status</p>
                    <Chip
                      label={hasPaymentRequest.status}
                      color={hasPaymentRequest.status === 'PENDING' ? 'warning' : 
                             hasPaymentRequest.status === 'APPROVED' ? 'success' : 'error'}
                      size="small"
                    />
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Submitted</p>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {formatDate(hasPaymentRequest.createdAt)}
                    </p>
                  </div>
                </div>

                {hasPaymentRequest.transactionProofs && hasPaymentRequest.transactionProofs.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                      Uploaded Proof
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hasPaymentRequest.transactionProofs.map((proof: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => window.open(proof, '_blank')}
                          className="px-4 py-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                        >
                          View Proof {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Request Status from New Submission */}
        {submitPaymentRequestMutation.isSuccess && submitPaymentRequestMutation.data && (
          <Card className="mb-6 shadow-lg border border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Payment Request Submitted
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Request ID</p>
                    <p className="font-medium text-green-900 dark:text-green-100">{submitPaymentRequestMutation.data.id}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Amount</p>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {formatCurrency(submitPaymentRequestMutation.data.amount)}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Status</p>
                    <Chip
                      label={submitPaymentRequestMutation.data.status}
                      color={submitPaymentRequestMutation.data.status === 'PENDING' ? 'warning' : 
                             submitPaymentRequestMutation.data.status === 'APPROVED' ? 'success' : 'error'}
                      size="small"
                    />
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Submitted</p>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {formatDate(submitPaymentRequestMutation.data.createdAt)}
                    </p>
                  </div>
                </div>

                {submitPaymentRequestMutation.data.transactionProofs && submitPaymentRequestMutation.data.transactionProofs.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                      Uploaded Proof
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {submitPaymentRequestMutation.data.transactionProofs.map((proof, index) => (
                        <button
                          key={index}
                          onClick={() => window.open(proof, '_blank')}
                          className="px-4 py-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                        >
                          View Proof {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rent Record Details */}
        {rentRecordResponse?.data && (
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                  Rent Record Details
                </Typography>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Cycle period
                    </Typography>
                    <Typography className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(rentRecordResponse.data.startDate)} to {formatDate(rentRecordResponse.data.endDate)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Total Amount
                    </Typography>
                    <Typography className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(rentRecordResponse.data.totalAmount)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Payment Status
                    </Typography>
                    <Chip
                      icon={getPaymentStatusIcon(rentRecordResponse.data.paymentStatus)}
                      label={rentRecordResponse.data.paymentStatus.replace('_', ' ')}
                      color={getPaymentStatusColor(rentRecordResponse.data.paymentStatus) as any}
                      size="small"
                    />
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Due Date
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                      {formatDate(rentRecordResponse.data.dueDate)}
                    </Typography>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Rent Amount
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecordResponse.data.rent)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Electricity Bill
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecordResponse.data.electricityBill)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                      Paid Amount
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecordResponse.data.totalPaidAmount || 0)}
                    </Typography>
                  </div>
                </div>

                {rentRecordResponse.data.remainingAmount && rentRecordResponse.data.remainingAmount > 0 && (
                  <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Typography variant="body2" className="text-red-800 dark:text-red-200 font-medium">
                      Remaining Amount: {formatCurrency(rentRecordResponse.data.remainingAmount)}
                    </Typography>
                  </div>
                )}

                {rentRecordResponse.data.isOverdue && (
                  <div className="mt-4 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Typography variant="body2" className="text-orange-800 dark:text-orange-200 font-medium">
                      Overdue by {rentRecordResponse.data.daysOverdue} days
                    </Typography>
                  </div>
                )}

                {rentRecordResponse.data.paymentTransactions && rentRecordResponse.data.paymentTransactions.length > 0 && (
                  <div className="mt-4">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-2">
                      Payment History:
                    </Typography>
                    <div className="space-y-2">
                      {rentRecordResponse.data.paymentTransactions.map((payment) => (
                        <div key={payment._id} className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(payment.paidAt)} - {formatCurrency(payment.amount)} ({payment.method})
                          {payment.metadata?.paidTo && ` - Paid to ${payment.metadata.paidTo}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!rentRecordId && (
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography className="text-gray-900 dark:text-white mb-2">
                No Rent Record ID Provided
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Please provide a valid rent record ID in the URL parameters.
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
