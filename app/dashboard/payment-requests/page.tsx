'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { usePaymentRequestsByProperty, useApprovePaymentRequest, useRejectPaymentRequest } from '@/hooks/usePaymentRequests';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { toast } from 'react-toastify';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { useRooms } from '@/hooks/useRooms';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

// Payment Requests Management Page
export default function PaymentRequestsPage() {
  const { selectedProperty } = useProperty();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('');
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [approvedRequest, setApprovedRequest] = useState<any>(null);

  // Get rooms for filter dropdown
  const { data: roomsResponse } = useRooms(selectedProperty?.id || '', 1, 100);
  const rooms = roomsResponse?.data || [];

  const filters = {
    status: statusFilter || undefined,
    room: roomFilter || undefined,
  };

  const { data: paymentRequests, isLoading, error } = usePaymentRequestsByProperty(
    selectedProperty?.id || '',
    filters,
    !!selectedProperty?.id
  );

  const approveMutation = useApprovePaymentRequest();
  const rejectMutation = useRejectPaymentRequest();

  const handleApprove = async (requestId: string) => {
    approveMutation.mutate(requestId, {
      onSuccess: (data) => {
        toast.success('Payment request approved successfully!');
        // Find the approved request to get tenant details
        const request = paymentRequests?.find(req => req.id === requestId);
        if (request && data) {
          setApprovedRequest(data);
          setReceiptDialogOpen(true);
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to approve payment request');
      },
    });
  };

  const handleReject = async (requestId: string) => {
    rejectMutation.mutate(requestId, {
      onSuccess: () => {
        toast.success('Payment request rejected successfully!');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to reject payment request');
      },
    });
  };

  const handleViewProof = (proofUrl: string) => {
    setSelectedProof(proofUrl);
    setProofDialogOpen(true);
  };

  const handleCloseProofDialog = () => {
    setProofDialogOpen(false);
    setSelectedProof(null);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setRoomFilter('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
    setApprovedRequest(null);
  };

  const handleShareReceipt = () => {
    if (approvedRequest?.tenant?.tenantNumber && approvedRequest?.rentRecord?.receiptUrl) {
      const message = `Hi ${approvedRequest.tenant.tenantName}, your payment has been approved! Here's your receipt: ${approvedRequest.rentRecord.receiptUrl}`;
      const whatsappUrl = `https://wa.me/+91${approvedRequest.tenant.tenantNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      handleCloseReceiptDialog();
    }
  };

  const handleShareReceiptFromList = (request: any) => {
    if (request?.tenant?.tenantNumber && request?.rentRecord?.receiptUrl) {
      const message = `Hi ${request.tenant.tenantName}, your payment has been approved! Here's your receipt: ${request.rentRecord.receiptUrl}`;
      const whatsappUrl = `https://wa.me/+91${request.tenant.tenantNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Failed to load payment requests
              </h3>
              <div className="mt-2 text-sm text-red-700">
                Please try again later.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Payment Requests', url: '/dashboard/payment-requests' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <AppHeader 
        title="Payment Requests"
        subtitle={`Manage payment requests submitted by tenants`}
      />

    <div className='px-6 pt-6'>
        <BreadCrumbs items={breadcrumbs} />
      </div>

      <div className=' mx-auto px-4 md:px-6 py-4'>
      {/* Filter Toggle and Clear */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Tooltip title="Toggle Filters">
            <IconButton
              onClick={toggleFilters}
              className={`${showFilters ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'} hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 ease-in-out`}
            >
              <FilterIcon className={`${showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} transition-colors duration-200`} />
            </IconButton>
          </Tooltip>
          
          {showFilters && (
            <Button
              onClick={clearFilters}
              variant="outlined"
              size="small"
              className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 transition-all duration-200 ease-in-out"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '6px 12px',
                minWidth: 'auto',
              }}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`overflow-hidden transition-all duration-300 ${
        showFilters ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | '')}
                size="small"
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </div>

            {/* Room Filter */}
            <div className="w-full md:w-48">
              <TextField
                select
                fullWidth
                label="Room"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">
                  <em>All Rooms</em>
                </MenuItem>
                {rooms?.map((room: any) => (
                  <MenuItem key={room._id} value={room._id}>
                    Room {room.roomNo} ({room.roomType})
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </div>
      </div>
      </div>

      {!paymentRequests || paymentRequests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <PaymentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Payment Requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No payment requests have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  mx-auto px-4 md:px-6 py-4">
          {paymentRequests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="p-6 grid h-full grid-rows-[auto_1fr_auto_auto] gap-3">
                {/* Header with Status */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Request #{request.id.slice(-8)}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {/* Request Details */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <PaymentIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Amount: <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(request.amount)}
                      </span>
                    </span>
                  </div>

                  {request.tenant && (
                    <div className="flex items-center gap-2">
                      <PersonIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tenant: <span className="font-semibold text-gray-900 dark:text-white">
                          {request.tenant.tenantName}
                        </span>
                      </span>
                    </div>
                  )}

                  {request.room && (
                    <div className="flex items-center gap-2">
                      <RoomIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Room: <span className="font-semibold text-gray-900 dark:text-white">
                          {request.room.roomNo} ({request.room.roomType})
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted: <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(request.createdAt)}
                      </span>
                    </span>
                  </div>

                </div>

                {/* cycle period */}
                <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cycle period: <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(request.rentRecord?.startDate || '')} to {formatDate(request.rentRecord?.endDate || '')}
                    </span>
                    </span>
                </div>

                <div className="flex gap-2">
                  {request.transactionProofs && request.transactionProofs.length > 0 && (
                    <button
                      onClick={() => handleViewProof(request.transactionProofs[0])}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                    >
                      <VisibilityIcon className="h-4 w-4" />
                      View Proof
                    </button>
                  )}
                  
                  {request.status === 'APPROVED' && request.rentRecord?.receiptUrl && (
                    <button
                      onClick={() => handleShareReceiptFromList(request)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#059669] hover:bg-[#059669] rounded-lg transition-colors duration-200 cursor-pointer"
                      title="Share receipt via WhatsApp"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Share Receipt
                    </button>
                  )}
                </div>

                {/* Approve/Reject Buttons */}
                {request.status === 'PENDING' && (
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-white  dark:bg-[#059669] hover:bg-[#059669] disabled:bg-[#059669] bg-[#10b981] rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-70"
                    >
                      {approveMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-white dark:bg-[#b91c1c] hover:bg-[#b91c1c] disabled:bg-[#b91c1c] bg-[#ef4444] rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-70"
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <CancelIcon className="h-4 w-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proof Image Dialog */}
      <Dialog
        open={proofDialogOpen}
        onClose={handleCloseProofDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">Payment Proof</span>
          <IconButton onClick={handleCloseProofDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedProof && (
            <Box className="flex justify-center items-center">
              <img
                src={selectedProof}
                alt="Payment proof"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Share Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: (theme) => ({
            borderRadius: '20px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '@media (max-width: 600px)': {
              margin: '16px',
              width: '100%',
              maxHeight: '95vh',
            }
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            pb: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          })}
        >
          <Typography
            sx={(theme) => ({
              fontWeight: 600,
              fontSize: '1.25rem',
              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
            })}
          >
            Payment Receipt
          </Typography>
          <IconButton 
            onClick={handleCloseReceiptDialog} 
            size="small"
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
              }
            })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={(theme) => ({
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
            minHeight: 0,
            paddingTop: '10px',
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
          })}
        >
          {approvedRequest && (
            <div className="space-y-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Payment Request Approved!
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tenant:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {approvedRequest.tenant?.tenantName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(approvedRequest.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Room:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Room {approvedRequest.room?.roomNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Share the receipt with the tenant via WhatsApp
                </p>
                <button
                  onClick={handleShareReceipt}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Share Receipt via WhatsApp
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
