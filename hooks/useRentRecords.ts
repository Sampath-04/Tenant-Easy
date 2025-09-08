import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRentRecordsForProperty, markRentAsPaid, getPendingRents, createNotice, updateNotice, getRentRecordsForExport, getPropertyRentSummary } from '@/lib/api/rentHistory';
import { useProperty } from '@/contexts/PropertyContext';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '@/lib/toast-config';
import { SingleRentRecordResponse } from '@/lib/api/rentHistory';
import { getRentRecordById } from '@/lib/api/rentHistory';

export interface UseRentRecordsParams {
  propertyId: string;
  page?: number;
  limit?: number;
  tenant?: string;
  paymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  search?: string;
  roomNo?: string;
  rentStatus?: "pending" | "due" | "upcoming";
  endDateFrom?: string;
  endDateTo?: string;
  enabled?: boolean;
}

export function useRentRecords({
  propertyId,
  page = 1,
  limit = 10,
  tenant,
  paymentStatus,
  search,
  roomNo,
  rentStatus,
  endDateFrom,
  endDateTo,
  enabled = true,
}: UseRentRecordsParams) {
  return useQuery({
    queryKey: ['rent-records', propertyId, page, limit, tenant, paymentStatus, search, roomNo, rentStatus, endDateFrom, endDateTo],
    queryFn: () => getAllRentRecordsForProperty(
      propertyId,
      page,
      limit,
      tenant,
      paymentStatus,
      search,
      roomNo,
      rentStatus,
      endDateFrom,
      endDateTo
    ),
    enabled: enabled && !!propertyId,
    staleTime: 0, // 5 minutes
    gcTime: 0, // 10 minutes
  });
}

/**
 * Hook to fetch pending rents for a property
 */
export function usePendingRents(propertyId: string) {
  return useQuery({
    queryKey: ['pending-rents', propertyId],
    queryFn: () => getPendingRents(propertyId),
    enabled: !!propertyId && propertyId !== '', // Only run when propertyId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch property rent summary with date range filters
 */
export function usePropertyRentSummary(
  propertyId: string,
  endDateFrom?: string,
  endDateTo?: string,
  paymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
  search?: string,
  roomNo?: string,
  rentStatus?: "pending" | "due" | "upcoming"
) {
  return useQuery({
    queryKey: ['property-rent-summary', propertyId, endDateFrom, endDateTo, paymentStatus, search, roomNo, rentStatus],
    queryFn: () => getPropertyRentSummary(
      propertyId,
      endDateFrom,
      endDateTo,
      paymentStatus,
      search,
      roomNo,
      rentStatus
    ),
    enabled: !!propertyId && propertyId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

interface MarkRentAsPaidData {
  amount: number;
  paidDate: string;
  paymentMethod: string;
  paymentProofs?: File[];
  paidTo: string;
  comments?: string;
}

export function useMarkRentAsPaid() {
  const queryClient = useQueryClient();
  const { selectedProperty } = useProperty();

  return useMutation({
    mutationFn: ({ rentId, data }: { rentId: string; data: MarkRentAsPaidData }) =>
      markRentAsPaid(rentId, data),
    
    onSuccess: () => {
      // Show success toast
      const successToast = showSuccessToast('Payment collected successfully!');
      toast.success(successToast.message, successToast.config);
      
      // Invalidate and refetch pending rents
      if (selectedProperty) {
        queryClient.invalidateQueries({
          queryKey: ['pending-rents', selectedProperty.id]
        });
        
        // Also invalidate rent records if they exist
        queryClient.invalidateQueries({
          queryKey: ['rent-records', selectedProperty.id]
        });

        // Invalidate property rent summary to refresh the summary data
        queryClient.invalidateQueries({
          queryKey: ['property-rent-summary', selectedProperty.id]
        });
      }
    },
    
    onError: (error: any) => {
      console.error('Failed to mark rent as paid:', error);
      
      // Show error toast with user-friendly message
      let errorMessage = 'Failed to collect payment. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
    }
  });
}

interface CreateNoticeData {
  tenantId: string;
  noticeDate: string;
  noticeEndsOn: string;
  extraDays: number;
  extraDaysCost: number;
  amount?: number;
  paidTo?: string;
  comments?: string;
  paymentProof?: File;
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { selectedProperty } = useProperty();

  return useMutation({
    mutationFn: (data: CreateNoticeData) => createNotice(data),
    
    onSuccess: () => {
      // Show success toast
      const successToast = showSuccessToast('Notice created successfully!');
      toast.success(successToast.message, successToast.config);
      
      // Invalidate and refetch pending rents
      if (selectedProperty) {
        queryClient.invalidateQueries({
          queryKey: ['pending-rents', selectedProperty.id]
        });
        
        // Also invalidate rent records if they exist
        queryClient.invalidateQueries({
          queryKey: ['rent-records', selectedProperty.id]
        });
      }
    },
    
    onError: (error: any) => {
      console.error('Failed to create notice:', error);
      
      // Show error toast with user-friendly message
      let errorMessage = 'Failed to create notice. Please try again.';
      
      if (error?.message) {
        // Handle specific error messages
        if (error.message.includes('No rent history found for current cycle')) {
          errorMessage = 'No rent history found for the current cycle. Please ensure rent records exist before applying notice.';
        } else if (error.message.includes('already has an active notice')) {
          errorMessage = 'This tenant already has an active notice period.';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
    }
  });
}

interface UpdateNoticeData {
  tenantId: string;
  noticeDate: string;
  noticeEndsOn: string;
  extraDays: number;
  extraDaysCost: number;
  amount?: number;
  paidTo?: string;
  comments?: string;
  paymentProof?: File;
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  const { selectedProperty } = useProperty();

  return useMutation({
    mutationFn: ({ noticeId, data }: { noticeId: string; data: UpdateNoticeData }) =>
      updateNotice(noticeId, data),
    
    onSuccess: () => {
      // Show success toast
      const successToast = showSuccessToast('Notice updated successfully!');
      toast.success(successToast.message, successToast.config);
      
      // Invalidate and refetch pending rents
      if (selectedProperty) {
        queryClient.invalidateQueries({
          queryKey: ['pending-rents', selectedProperty.id]
        });
        
        // Also invalidate rent records if they exist
        queryClient.invalidateQueries({
          queryKey: ['rent-records', selectedProperty.id]
        });
      }
    },
    
    onError: (error: any) => {
      console.error('Failed to update notice:', error);
      
      // Show error toast with user-friendly message
      let errorMessage = 'Failed to update notice. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
    }
  });
}

/**
 * Hook to fetch rent records for export
 */
export function useRentRecordsForExport(
  propertyId: string,
  startDate: string | null,
  endDate: string | null,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: ['rent-records-export', propertyId, startDate, endDate],
    queryFn: () => getRentRecordsForExport(propertyId, startDate!, endDate!),
    enabled: enabled && !!propertyId && !!startDate && !!endDate,
    staleTime: 0,
    gcTime: 0
  });
}

// Query keys
export const rentRecordKeys = {
  all: ['rentRecord'] as const,
  byId: (rentRecordId: string) => [...rentRecordKeys.all, rentRecordId] as const,
};

// Get rent record by ID
export const useRentRecord = (rentRecordId: string, enabled: boolean = true) => {
  return useQuery<SingleRentRecordResponse>({
    queryKey: rentRecordKeys.byId(rentRecordId),
    queryFn: () => getRentRecordById(rentRecordId),
    enabled: enabled && !!rentRecordId,
    staleTime: 0,
    gcTime: 0,
  });
};