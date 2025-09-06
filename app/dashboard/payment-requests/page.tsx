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

// Payment Requests Management Page
export default function PaymentRequestsPage() {
  const { selectedProperty } = useProperty();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('');
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);

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
      onSuccess: () => {
        toast.success('Payment request approved successfully!');
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

  return (
    <div className="p-6">
      <AppHeader 
        title="Payment Requests"
        subtitle={`Manage payment requests submitted by tenants`}
      />

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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
                </div>

                {/* Approve/Reject Buttons */}
                {request.status === 'PENDING' && (
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-white  dark:bg-[#059669] hover:bg-[#059669] disabled:bg-[#059669] bg-[#10b981] rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-white dark:bg-[#b91c1c] hover:bg-[#b91c1c] disabled:bg-[#b91c1c] bg-[#ef4444] rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <CancelIcon className="h-4 w-4" />
                      Reject
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
    </div>
  );
}
