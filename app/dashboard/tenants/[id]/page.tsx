'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useTenant, useUpdateOnboardingPaymentAmount } from '@/hooks/useTenants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import RentHistoryTable from '@/app/components/RentHistoryTable';
import NoticeForm from '@/components/NoticeForm';
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { NotificationsActive as NoticeIcon, ExpandMore as ExpandMoreIcon, Edit as EditIcon, Payment as PaymentIcon } from '@mui/icons-material';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

function TenantViewContent() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [activeTab, setActiveTab] = useState('rent');
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [localTenant, setLocalTenant] = useState<any>(null);
  const [showOnboardingHistory, setShowOnboardingHistory] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');

  const { data: tenant, isLoading, error: fetchError } = useTenant(tenantId);
  const updatePaymentMutation = useUpdateOnboardingPaymentAmount();
  const error = fetchError?.message;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'onboarded':
        return 'Active';
      case 'notice_serving':
        return 'Notice Period';
      case 'evicted':
        return 'Evicted';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onboarded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'notice_serving':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'evicted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleApplyNotice = () => {
    setShowNoticeForm(true);
  };

  const handleNoticeSubmit = (noticeData?: any) => {
    setShowNoticeForm(false);
    
    // Update tenant notice data if notice was successfully created
    if (noticeData && localTenant) {
      // Update the tenant object with the new notice data
      const updatedTenant = {
        ...localTenant,
        notice: noticeData,
        status: 'notice_serving' // Update status to notice_serving
      };
      
      // Update local tenant state
      setLocalTenant(updatedTenant);
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
  };

  const handleSavePaymentEdit = async () => {
    if (!editingPayment || !editAmount) return;

    try {
      await updatePaymentMutation.mutateAsync({
        paymentId: editingPayment._id,
        data: { amount: editAmount }
      });
      
      // Update local state immediately for better UX
      if (localTenant && localTenant.onboardingPayments) {
        const updatedPayments = localTenant.onboardingPayments.map((payment: any) =>
          payment._id === editingPayment._id 
            ? { ...payment, amount: parseFloat(editAmount) }
            : payment
        );
        
        setLocalTenant({
          ...localTenant,
          onboardingPayments: updatedPayments
        });
      }
      
      setEditingPayment(null);
      setEditAmount('');
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const handleCancelPaymentEdit = () => {
    setEditingPayment(null);
    setEditAmount('');
  };

  useEffect(() => {
    if (tenant) {
      setLocalTenant(tenant);
    }
  }, [tenant]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Tenant Details"
        subtitle="Loading tenant details..."
      />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading tenant details...</p>
        </div>
      </div>
      </div>
    );
  }

  if (error || !localTenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Tenant</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Tenant not found'}
          </p>
          <Link
            href="/dashboard/tenants"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            <ArrowBackIcon className="w-4 h-4 mr-2" />
            Back to Tenants
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Tenants', url: '/dashboard/tenants' },
    { label: localTenant.tenantName || 'Tenant', url: `/dashboard/tenants/${localTenant._id}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Tenant Details"
        subtitle={`Viewing details for ${localTenant.tenantName}`}
      />
      
      <BreadCrumbs items={breadcrumbs} />

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        {/* Tenant Overview Card */}
        <div className={`${LAYOUT_CLASSES.CARD_CONTAINER} mb-8`}>
          <div className="p-4 md:p-6">
            <div className="flex flex-row items-center justify-between mb-6">
              <div className="flex items-center md:space-x-4 gap-2 md:gap-0">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {localTenant.tenantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {localTenant.tenantName}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(localTenant.status)}`}>
                      {getStatusLabel(localTenant.status)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Room {localTenant.room.roomNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-0 text-right">
                <div className="text-lg md:text-2xl text-green-600 dark:text-green-400 font-bold">
                  {formatCurrency(localTenant.monthlyRent)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Monthly Rent
                </div>
              </div>
            </div>

            <hr className="my-4 md:my-6 border-gray-200 dark:border-gray-700" />

            <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Phone Number
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {localTenant.tenantNumber}
                    </div>
                  </div>
                </div>

                {localTenant.tenantEmail && (
                  <div className="flex items-center space-x-3">
                    <EmailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {localTenant.tenantEmail}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <LocationOnIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Property
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {localTenant.property?.propertyName || 'N/A'}
                    </div>
                  </div>
                </div>

                {localTenant.currentReading > 0 && (
                  <div className="flex items-center space-x-3">
                    <ReceiptIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Current Meter Reading
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {localTenant.currentReading} units
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <CalendarTodayIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Check-in Date
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(localTenant.checkInDate)}
                    </div>
                  </div>
                </div>

                {localTenant.checkOutDate && (
                  <div className="flex items-center space-x-3">
                    <CalendarTodayIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Check-out Date
                      </div>
                      <div className="font-medium text-red-600 dark:text-red-400">
                        {formatDate((new Date(localTenant.checkOutDate).toISOString()))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <AccountBalanceWalletIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Security Deposit
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(localTenant.securityDepositTotal || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AccountBalanceWalletIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Security Deposit Paid
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(localTenant.securityDepositPaid || 0)}
                    </div>
                  </div>
                </div>
            </div>

            {localTenant.notice && (
              <div className="mt-6 p-2 md:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <WarningIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Notice Period
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      {formatDate(localTenant.notice.noticeDate.toString())} - {formatDate(localTenant.notice.noticeEndsOn.toString())}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Notice Button - Only show for onboarded tenants without notice */}
        
            <div className="flex justify-end gap-4 mt-4">
              
              {localTenant.status === 'onboarded' && !localTenant.notice && localTenant.currentCycle && <Button
                variant="contained"
                startIcon={<NoticeIcon />}
                onClick={handleApplyNotice}
                disabled={localTenant.previousCyclePaymentStatus === 'NOT_PAID' || localTenant.previousCyclePaymentStatus === 'PARTIALLY_PAID'}
                sx={{
                  backgroundColor: '#FFC04D',
                  boxShadow: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '10px 16px',
                  '&:hover': {
                    backgroundColor: '#d97706',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Apply Notice Period
              </Button>}
              <Button
                variant="outlined"
                onClick={() => router.push(`/dashboard/tenants/${tenantId}/edit`)}
                sx={{
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#4b5563',
                    backgroundColor: 'rgba(107, 114, 128, 0.04)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Edit Tenant
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowOnboardingHistory(!showOnboardingHistory)}
                sx={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {showOnboardingHistory ? 'Hide' : 'Show More'}
              </Button>
            </div>
            
            {/* Show More Button for Onboarding Payment History */}
            {localTenant.onboardingPayments && localTenant.onboardingPayments.length > 0 && (
              <div>
                {/* Onboarding Payment History Accordion */}
                {showOnboardingHistory && (
                  <div className="mt-4">
                    <Accordion 
                      defaultExpanded
                      sx={{ 
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: '16px 0',
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          '&.Mui-expanded': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                          },
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <PaymentIcon sx={{ color: '#3b82f6' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            Onboarding Payment History
                          </Typography>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: '24px' }}>
                        <div className="space-y-4">
                          {localTenant.onboardingPayments.map((payment: any, index: number) => (
                            <div 
                              key={payment._id || index}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                                    {payment.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : 'Onboarding Rent'}
                                  </Typography>
                                  <Chip 
                                    label={payment.isSuccessful ? 'Successful' : payment.isPending ? 'Pending' : 'Failed'}
                                    size="small"
                                    sx={{
                                      backgroundColor: payment.isSuccessful ? '#10b981' : payment.isPending ? '#f59e0b' : '#ef4444',
                                      color: 'white',
                                      fontWeight: 500,
                                    }}
                                  />
                                </div>
                                 <div className="flex items-center gap-2">
                                 {editingPayment?._id === payment._id ? (
                                   <div className="flex items-center gap-2">
                                     <TextField
                                       type="number"
                                       size="small"
                                       value={editAmount}
                                       onChange={(e) => {
                                         const value = e.target.value;
                                         // Only allow positive numbers
                                         if (value === '' || (parseFloat(value) >= 0 && /^\d*\.?\d*$/.test(value))) {
                                           setEditAmount(value);
                                         }
                                       }}
                                       onKeyPress={(e) => {
                                         // Allow only numbers, decimal point, and backspace
                                         if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                                           e.preventDefault();
                                         }
                                         // Prevent multiple decimal points
                                         if (e.key === '.' && editAmount.includes('.')) {
                                           e.preventDefault();
                                         }
                                       }}
                                       sx={{
                                         width: '120px',
                                         '& .MuiInputBase-root': {
                                           fontSize: '1.125rem',
                                           fontWeight: 700,
                                           color: '#059669',
                                         },
                                         '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                           display: 'none',
                                         },
                                         '& input[type=number]': {
                                           MozAppearance: 'textfield',
                                         }
                                       }}
                                       inputProps={{
                                         style: { textAlign: 'right' },
                                         min: 0,
                                         step: 0.01,
                                         placeholder: '0'
                                       }}
                                     />
                                     <IconButton
                                       size="small"
                                       onClick={handleSavePaymentEdit}
                                       disabled={updatePaymentMutation.isPending}
                                       sx={{
                                         color: '#10b981',
                                         '&:hover': {
                                           backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                         }
                                       }}
                                     >
                                       ✓
                                     </IconButton>
                                     <IconButton
                                       size="small"
                                       onClick={handleCancelPaymentEdit}
                                       sx={{
                                         color: '#ef4444',
                                         '&:hover': {
                                           backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                         }
                                       }}
                                     >
                                       ✕
                                     </IconButton>
                                   </div>
                                 ) : (
                                   <>
                                     <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                                       ₹{payment.amount}
                                     </Typography>
                                     <IconButton
                                       size="small"
                                       sx={{
                                         color: '#6b7280',
                                         '&:hover': {
                                           backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                           color: '#3b82f6',
                                         }
                                       }}
                                       onClick={() => handleEditPayment(payment)}
                                     >
                                       <EditIcon />
                                     </IconButton>
                                   </>
                                 )}
                               </div>
                              </div>
                              
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                 <div>
                                   <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                     Payment Method
                                   </Typography>
                                   <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                                     {payment.method.replace('_', ' ')}
                                   </Typography>
                                 </div>
                                 <div>
                                   <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                     Payment Date
                                   </Typography>
                                   <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                                     {formatDate(payment.paidAt)}
                                   </Typography>
                                 </div>
                               </div>
                            </div>
                          ))}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs for Details and Rent History */}
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-0">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center md:justify-start px-6">
                <button
                  onClick={() => setActiveTab('rent')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer ${activeTab === 'rent'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <span className="flex items-center">
                    Pending Rents
                    {localTenant.pendingRents?.count && localTenant.pendingRents.count > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {localTenant.pendingRents.count}
                      </span>
                    )}
                  </span>
                </button>
                {/* completed rents */}
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer ${activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  Completed Rents
                </button>
              </div>
            </div>

            {activeTab === "rent" && (
              <RentHistoryTable
                records={localTenant.pendingRents?.pendingRentRecords || []}
                emptyMessage="No Rent History Found"
                showUnits={true}
              />
            )}

            {activeTab === "completed" && (
              <RentHistoryTable
                records={localTenant.recentPayments || []}
                emptyMessage="No Completed Rents Found"
                showUnits={false}
              />
            )}

          </div>
        </div>
      </main>

      {/* Notice Form */}
      <NoticeForm
        isOpen={showNoticeForm}
        onClose={() => setShowNoticeForm(false)}
        onSubmitCallback={handleNoticeSubmit}
        tenantName={localTenant?.tenantName || ''}
        roomData={`Room ${localTenant?.room?.roomNo || ''}`}
        cycleEndDate={localTenant?.currentCycle?.endDate || ''}
        monthlyRent={localTenant?.monthlyRent || 0}
        tenantId={localTenant?._id || ''}
      />
    </div>
  );
}

export default function TenantView() {
  return (
    <AuthGuard>
      <TenantViewContent />
    </AuthGuard>
  );
}
