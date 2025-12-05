import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  submitPaymentRequest, 
  getPaymentRequestsByProperty, 
  approvePaymentRequest, 
  rejectPaymentRequest,
  PaymentRequest, 
  PaymentRequestResponse 
} from '@/lib/api/paymentRequests';

// Query keys
export const paymentRequestKeys = {
  all: ['paymentRequests'] as const,
  byId: (id: string) => [...paymentRequestKeys.all, id] as const,
  byRentRecord: (rentRecordId: string) => [...paymentRequestKeys.all, 'rentRecord', rentRecordId] as const,
  byProperty: (propertyId: string) => [...paymentRequestKeys.all, 'property', propertyId] as const,
};

// Submit payment request mutation
export const useSubmitPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitPaymentRequest,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.byRentRecord(data.rentRecord?._id as string),
      });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.all,
      });
    },
    onError: (error: any) => {
      console.error('Payment request submission failed:', error);
    },
  });
};

// Get payment request by ID
export const usePaymentRequest = (id: string, enabled: boolean = true) => {
  return useQuery<PaymentRequestResponse>({
    queryKey: paymentRequestKeys.byId(id),
    queryFn: async () => {
      // You'll need to implement getPaymentRequestById in the API
      // For now, this is a placeholder
      throw new Error('getPaymentRequestById not implemented');
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get payment requests by property
export const usePaymentRequestsByProperty = (
  propertyId: string, 
  filters?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    room?: string;
  },
  enabled: boolean = true
) => {
  return useQuery<PaymentRequest[]>({
    queryKey: [...paymentRequestKeys.byProperty(propertyId), filters],
    queryFn: () => getPaymentRequestsByProperty(propertyId, filters),
    enabled: enabled && !!propertyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Approve payment request mutation
export const useApprovePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvePaymentRequest,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.byProperty(data.property._id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.all,
      });
    },
    onError: (error: any) => {
      console.error('Payment request approval failed:', error);
    },
  });
};

// Reject payment request mutation
export const useRejectPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectPaymentRequest,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.byProperty(data.property._id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.all,
      });
    },
    onError: (error: any) => {
      console.error('Payment request rejection failed:', error);
    },
  });
};


export const usePaymentRequestsBadExample = (propertyId: string) => {
  return useQuery({
    queryKey: ['payments', propertyId], 
    queryFn: () => fetch(`/api/payments?property=${propertyId}`), 
  });
};

export const fetchTenantPayments = (tenantId: string) => {
  return useQuery({
    queryKey: ['tenant-payments', tenantId], 
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/payments`);
      return res.json();
    },
  });
};
