'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useTenant, useUpdateOnboardingPaymentAmount, useMarkTenantAsDeleted } from '@/hooks/useTenants';
import DeleteTenantDialog from '@/components/DeleteTenantDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import RentHistoryTable from '@/app/components/RentHistoryTable';
import NoticeForm from '@/components/NoticeForm';
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box } from '@mui/material';
import { NotificationsActive as NoticeIcon, ExpandMore as ExpandMoreIcon, Edit as EditIcon, Payment as PaymentIcon, Delete as DeleteIcon } from '@mui/icons-material';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import { useTheme } from '@mui/material/styles';

function TenantViewContent() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('rent');
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [localTenant, setLocalTenant] = useState<any>(null);
  const [showOnboardingHistory, setShowOnboardingHistory] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: tenant, isLoading, error: fetchError } = useTenant(tenantId);

  console.log("tenant", tenant);
  const updatePaymentMutation = useUpdateOnboardingPaymentAmount();
  const markTenantAsDeletedMutation = useMarkTenantAsDeleted();
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
      case 'upcoming':
        return 'Upcoming';
      case 'deleted':
        return 'Deleted';
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
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'deleted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleDeleteTenant = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tenant) {
      markTenantAsDeletedMutation.mutate(tenant._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          router.push('/dashboard/tenants');
        }
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
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
    setShowEditDialog(true);
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
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
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
      
      <div className='px-6 pt-6'>
      <BreadCrumbs items={breadcrumbs} />
      </div>

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER + " py-4"}>
        {/* Tenant Overview Card */}
        <div className={`${LAYOUT_CLASSES.CARD_CONTAINER} md:mb-6 mb-4`}>
          <div className="p-2 md:p-3">
            <div className="flex md:flex-row flex-col md:items-center md:justify-between justify-start mb-3">
              <div className="flex items-center md:space-x-4 gap-2 md:gap-0">
                <div className="hidden w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full md:flex items-center justify-center text-white text-xl font-bold">
                  {localTenant.tenantName.charAt(0).toUpperCase()}
                </div>
                <div className='flex flex-row items-center gap-2'>
                  <h1 className="md:text-lg text-base font-bold text-gray-900 dark:text-white ">
                    {localTenant.tenantName}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(localTenant.status)}`}>
                      {getStatusLabel(localTenant.status)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">
                      Room {localTenant.room.roomNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:mt-0 mt-2 md:text-right text-left">
                <div className="text-md md:text-lg text-green-600 dark:text-green-400 font-bold">
                  {formatCurrency(localTenant.monthlyRent)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Monthly Rent
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Phone Number
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {localTenant.tenantNumber}
                  </div>
                </div>

                {localTenant.tenantEmail && (
                  <div className="grid grid-cols-[220px_auto] items-center">
                    <div className='flex items-center gap-2'>
                    <EmailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {localTenant.tenantEmail}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <LocationOnIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Property
                    </div>
                  </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {localTenant.property?.propertyName || 'N/A'}
                    </div>
                </div>

                {localTenant.currentReading > 0 && (
                  <div className="grid grid-cols-[220px_auto] items-center">
                    <div className='flex items-center gap-2'>
                      <ReceiptIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                          Current Meter Reading
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {localTenant.currentReading} units
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <CalendarTodayIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Check-in Date
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatDate(localTenant.checkInDate)}
                  </div>
                </div>

                {localTenant.checkOutDate && (
                  <div className="grid grid-cols-[220px_auto] items-center">
                    <div className='flex items-center gap-2'>
                      <CalendarTodayIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                          Check-out Date
                      </div>
                    </div>
                      <div className="font-medium text-red-600 dark:text-red-400 text-sm">
                        {formatDate((new Date(localTenant.checkOutDate).toISOString()))}
                      </div>
                  </div>
                )}

                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <AccountBalanceWalletIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Security Deposit
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(localTenant.securityDepositTotal || 0)}
                  </div>
                </div>
                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                  <AccountBalanceWalletIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Security Deposit Paid
                      </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(localTenant.securityDepositPaid || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <AttachMoneyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Base Rent
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(localTenant.baseRent || 0)}
                  </div>
                </div>

                {localTenant.foodOpted && (
                  <div className="grid grid-cols-[220px_auto] items-center">
                    <div className='flex items-center gap-2'>
                      <RestaurantIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                          Food Amount
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {formatCurrency(localTenant.foodAmount || 0)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-[220px_auto] items-center">
                  <div className='flex items-center gap-2'>
                    <AttachMoneyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Monthly Rent
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(localTenant.monthlyRent || 0)}
                  </div>
                </div>
            </div>

            <div className='flex md:flex-row flex-col md:items-center md:justify-between justify-start gap-2'>
              {localTenant.notice && (
                <div className="mt-4 p-2 md:px-3 md:py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg w-fit">
                  <div className="flex items-center space-x-3">
                    <WarningIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div className='flex flex-row items-center gap-2'>
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Notice Period:
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        {formatDate(localTenant.notice.noticeDate.toString())} - {formatDate(localTenant.notice.noticeEndsOn.toString())}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Notice Button - Only show for onboarded tenants without notice */}
          
              <div className="grid grid-cols-2 md:flex md:flex-row md:justify-end justify-start gap-4 md:mt-4 mt-3 md:ml-auto">
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
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteTenant}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Delete Tenant
                </Button>

                {localTenant.status === 'onboarded' && !localTenant.notice && localTenant.currentCycle && 
                <Button
                  variant="contained"
                  startIcon={<NoticeIcon />}
                  onClick={handleApplyNotice}
                  disabled={localTenant.previousCyclePaymentStatus === 'NOT_PAID' || localTenant.previousCyclePaymentStatus === 'PARTIALLY_PAID'}
                  sx={{
                    backgroundColor: '#FFC04D',
                    boxShadow: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '6px 12px',
                    '&:hover': {
                      backgroundColor: '#d97706',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Apply Notice
                </Button>}
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
            </div>
                      
            {/* Show More Button for Onboarding Payment History */}
            {localTenant.onboardingPayments && localTenant.onboardingPayments.length > 0 && (
                <div>
                  {/* Onboarding Payment History Accordion */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showOnboardingHistory 
                      ? 'max-h-[1000px] opacity-100 mt-4' 
                      : 'max-h-0 opacity-0'
                  }`}>
                    <Accordion 
                      defaultExpanded
                      sx={{ 
                        boxShadow: 'none',
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1f2937' : '#F5F5F5',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: '16px 0',
                        },
                        '& .MuiAccordionSummary-root':{
                          minHeight:"50px",
                          // borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#9ca3af'}`,
                          background: "transparent",
                          "& .MuiTypography-root":{
                            fontSize: "18px",
                            color: (theme) => theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
                          }
                        },
                        '& .MuiAccordionSummary-content':{
                          margin: '0',
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={(theme) => ({
                          "@media (max-width: 768px)":{
                            minHeight: "50px",
                            "& .MuiTypography-root":{
                              fontSize: "16px !important",
                            }
                          },
                          
                          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#f8fafc',
                          borderRadius: '12px',
                          '&.Mui-expanded': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            "@media (max-width: 768px)":{
                              minHeight: "50px",
                              "& .MuiAccordionSummary-content":{
                                margin: "0",
                              },
                              "& .MuiTypography-root":{
                                fontSize: "16px !important",
                              }
                            },
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f1f5f9',
                          },
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <Typography sx={(theme) => ({ 
                            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937', 
                            fontSize: "18px"
                          })}>
                            Onboarding Payment History
                          </Typography>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: '16px,', paddingTop: '0px'  }}>
                        <div className="space-y-2">
                          {localTenant.onboardingPayments.map((payment: any, index: number) => (
                            <div 
                              key={payment._id || index}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex md:flex-row flex-col md:items-center md:justify-between justify-start mb-3">
                                <div className="flex items-center gap-3">
                                  <Typography variant="subtitle1" sx={(theme) => ({ 
                                    fontWeight: 600, 
                                    color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937'
                                  })}>
                                    {payment.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : 'Onboarding Rent'}
                                  </Typography>
                                  <Chip 
                                    label={payment.isSuccessful ? 'Successful' : payment.isPending ? 'Pending' : 'Failed'}
                                    size="small"
                                    sx={{
                                      backgroundColor: payment.isSuccessful ? '#10b981' : payment.isPending ? '#f59e0b' : '#ef4444',
                                      color: 'white',
                                      fontWeight: 500,
                                      fontSize: '12px',
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                 {editingPayment?._id === payment._id ? (
                                   <div className="flex items-center gap-2">
                                     <Typography variant="h6" sx={(theme) => ({ 
                                       fontWeight: 700, 
                                       color: theme.palette.mode === 'dark' ? '#10b981' : '#059669'
                                     })}>
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
                                   </div>
                                 ) : (
                                   <>
                                     <Typography variant="h6" sx={(theme) => ({ 
                                       fontWeight: 700, 
                                       color: theme.palette.mode === 'dark' ? '#10b981' : '#059669'
                                     })}>
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
                              
                                <div className="grid grid-cols-1 md:flex md:gap-4 gap-2 text-sm items-center">
                                <div className="flex flex-row items-center gap-2">
                                  <Typography variant="body2" sx={(theme) => ({ 
                                    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', 
                                    fontWeight: 500
                                  })}>
                                    Payment Method
                                  </Typography>
                                  <Typography sx={(theme) => ({ 
                                    color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937', 
                                    fontWeight: 600,
                                    fontSize: '14px'
                                  })}>
                                    {payment.method.replace('_', ' ')}
                                  </Typography>
                                </div>
                                {/*  vertical line */}
                                <div className="hidden md:block h-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex flex-row items-center gap-2">
                                  <Typography variant="body2" sx={(theme) => ({ 
                                    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', 
                                    fontWeight: 500
                                  })}>
                                    Payment Date
                                  </Typography>
                                  <Typography sx={(theme) => ({ 
                                    color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937', 
                                    fontWeight: 600,
                                    fontSize: '14px'
                                  })}>
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

      {/* Edit Payment Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: '16px', sm: '32px' },
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            maxHeight: { xs: 'calc(100% - 32px)', sm: '90vh' },
          }
        }}
      >
        <DialogTitle sx={(theme) => ({
          color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#f8fafc',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          padding: { xs: '12px 16px', sm: '16px' },
          fontSize: { xs: '18px', sm: '20px' },
          fontWeight: 600
        })}>
          Edit Payment Amount
        </DialogTitle>
        <DialogContent sx={(theme) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          padding: { xs: '12px 16px', sm: '16px' }
        })}>
          {editingPayment && (
            <div className="space-y-3 md:space-y-4 md:mt-0">
              {/* Payment Details */}
              <div className="grid gap-3 mt-2">
                {/* <Typography sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
                  fontWeight: 600,
                  fontSize: { xs: '14px', sm: '16px' }
                })}>
                  Payment Details
                </Typography> */}
                
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 py-1">
                    <Typography variant="body2" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      fontWeight: 500,
                      fontSize: { xs: '12px', sm: '14px' }
                    })}>
                      Payment Type:
                    </Typography>
                    <Typography sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
                      fontWeight: 600,
                      fontSize: { xs: '13px', sm: '14px' }
                    })}>
                      {editingPayment.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : 'Onboarding Rent'}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 py-1">
                    <Typography variant="body2" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      fontWeight: 500,
                      fontSize: { xs: '12px', sm: '14px' }
                    })}>
                      Payment Method:
                    </Typography>
                    <Typography variant="body1" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
                      fontWeight: 600,
                      fontSize: { xs: '13px', sm: '14px' }
                    })}>
                      {editingPayment.method.replace('_', ' ')}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 py-1">
                    <Typography variant="body2" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      fontWeight: 500,
                      fontSize: { xs: '12px', sm: '14px' }
                    })}>
                      Payment Date:
                    </Typography>
                    <Typography variant="body1" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937',
                      fontWeight: 600,
                      fontSize: { xs: '13px', sm: '14px' }
                    })}>
                      {formatDate(editingPayment.paidAt)}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 py-1">
                    <Typography variant="body2" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      fontWeight: 500,
                      fontSize: { xs: '12px', sm: '14px' }
                    })}>
                      Current Amount:
                    </Typography>
                    <Typography variant="body1" sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                      fontWeight: 700,
                      fontSize: { xs: '14px', sm: '15px' }
                    })}>
                      ₹{editingPayment.amount}
                    </Typography>
                  </div>
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="grid gap-2">
                <Typography variant="body2" sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '14px', sm: '16px' }
                })}>
                  New Amount
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="medium"
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
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontWeight: 600,
                    },
                    "& .MuiInputBase-input": {
                      padding: { xs: '10px 12px', sm: '12px 14px' },
                    },
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    }
                  }}
                  inputProps={{
                    style: { textAlign: 'center' },
                    min: 0,
                    step: 0.01,
                    placeholder: 'Enter new amount'
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={(theme) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#f8fafc',
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          padding: { xs: '12px 16px', sm: '16px 24px' },
          gap: { xs: '8px', sm: '12px' },
          display: "flex",
        })}>
          <Button
            onClick={() => setShowEditDialog(false)}
            disabled={updatePaymentMutation.isPending}
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
              fontSize: { xs: '13px', sm: '14px' },
              padding: { xs: '8px 16px', sm: '10px 20px' },
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              width: { xs: '100%', sm: 'auto' },
            })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePaymentEdit}
            disabled={updatePaymentMutation.isPending}
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
              color: '#ffffff',
              border: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#047857',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                  : '0 4px 12px rgba(5, 150, 105, 0.3)',
              },
              '&:disabled': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#9ca3af',
                color: theme.palette.mode === 'dark' ? '#6b7280' : '#ffffff',
                boxShadow: 'none',
              },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '13px', sm: '14px' },
              padding: { xs: '8px 16px', sm: '10px 20px' },
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: { xs: '100%', sm: 'auto' },
            })}
          >
            {updatePaymentMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Tenant Confirmation Dialog */}
      <DeleteTenantDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        tenant={tenant}
        isDeleting={markTenantAsDeletedMutation.isPending}
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
