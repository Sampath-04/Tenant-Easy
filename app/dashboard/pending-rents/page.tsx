'use client';

import React, { useState, useMemo } from 'react';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { usePendingRents } from '@/hooks/useRentRecords';
import SearchInput from '@/components/ui/SearchInput';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Theme,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  CurrencyRupee as CurrencyIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ElectricBolt as ElectricBoltIcon
} from '@mui/icons-material';
import ElectricityReadingsSection from '@/components/ElectricityReadingsSection';
import RentInfoCard from '@/components/RentInfoCard';
import PaymentCollectionForm from '@/components/PaymentCollectionForm';
import { getCurrentDate } from '@/lib/utils/formatters';

function PendingRentsContent() {
  const { selectedProperty } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRentId, setExpandedRentId] = useState<string | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<any>(null);

  const { data: pendingRentsData, isLoading, error } = usePendingRents(selectedProperty?.id || '');

  const handlePaymentSubmit = (data: any) => {
    setSelectedRentForPayment((prev: any) => ({
      ...prev,
      comments: data.comments,
      paymentProofs: data.paymentProofs,
      paymentStatus: "FULLY_PAID",
    }));
  };

  // Filter rents based on search term
  const filteredRents = useMemo(() => {
    if (!pendingRentsData?.data) return [];
    
    return pendingRentsData.data.filter(rent => 
      rent.tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rent.tenant.tenantNumber.includes(searchTerm) ||
      rent.room.roomNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingRentsData?.data, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const getWhatsAppMessage = (rent: any) => {
    const message = `Hi ${rent.tenant.tenantName}, 

This is a friendly reminder that your rent payment for ${rent.month} is pending.

Details:
• Room: ${rent.room.roomNo}
• Rent: ₹${rent.rent}
• Electricity Bill: ₹${rent.electricityBill}
• Total Amount: ₹${rent.totalAmount}
• Due Date: ${formatDate(rent.dueDate)}

Please make the payment at your earliest convenience. If you have any questions, please contact us.

Thank you!`;

    return encodeURIComponent(message);
  };

  const getWhatsAppLink = (rent: any) => {
    const phoneNumber = rent.tenant.tenantNumber.replace('+', '');
    const message = getWhatsAppMessage(rent);
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  const toggleReadings = (rentId: string) => {
    setExpandedRentId(expandedRentId === rentId ? null : rentId);
  };

  const handleWhatsAppReminder = (rent: any) => {
    if (rent) {
      window.open(getWhatsAppLink(rent), '_blank');
    }
  };

  const handleCollectPayment = (rent: any) => {
    setSelectedRentForPayment(rent);
    setPaymentFormOpen(true);
  };


  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Pending Rents" subtitle="No property selected" />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Property Selected</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Please select a property to view pending rents</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Pending Rents" subtitle="Loading pending rents..." />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading pending rents...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Pending Rents" subtitle="Error loading pending rents" />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Pending Rents</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'Pending rents could not be loaded'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Pending Rents"
        subtitle={`${selectedProperty.name} - Pending Rent Collection`}
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            {/* Summary Cards */}
            {pendingRentsData?.summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(pendingRentsData.summary.totalAmount)}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Total Pending
                        </Typography>
                      </div>
                      <CurrencyIcon className="text-3xl text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {pendingRentsData.summary.overdueCount}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Overdue
                        </Typography>
                      </div>
                      <WarningIcon className="text-3xl text-red-500 dark:text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {pendingRentsData.summary.readyToCollectCount}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Ready to Collect
                        </Typography>
                      </div>
                      <ScheduleIcon className="text-3xl text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {pendingRentsData.count}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Total Records
                        </Typography>
                      </div>
                      <PersonIcon className="text-3xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <SearchInput
                    placeholder="Search by tenant name, phone number, or room number..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FilterIcon className="w-4 h-4" />
                  <span>{filteredRents.length} of {pendingRentsData?.count || 0} records</span>
                </div>
              </div>
            </div>

            {/* Pending Rents List */}
            <div className="space-y-6">
              {filteredRents.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                      No Pending Rents Found
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-500">
                      {searchTerm ? 'No rents match your search criteria.' : 'All rents have been collected!'}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                filteredRents.map((rent) => (
                  <Card 
                    key={rent._id} 
                    sx={{
                      borderRadius: '16px',
                      boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;', 
                    }}
                    className="bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* tenant info, rent status, cycle info container */}
                        <RentInfoCard record={rent} getCurrentDate={getCurrentDate} />

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-fit">
                          <Button
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleCollectPayment(rent)}
                            sx={(theme: Theme) => ({
                              backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
                              borderRadius: '12px',
                              color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                              textTransform: 'none',
                              fontWeight: 600,
                              padding: '8px 16px',
                              boxShadow: theme.palette.mode === 'dark' 
                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
                                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' ? '#047857' : '#059669',
                                boxShadow: theme.palette.mode === 'dark' 
                                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              },
                              transition: 'all 0.2s ease',
                            })}
                            size="small"
                          >
                            Collect
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<WhatsAppIcon />}
                            onClick={() => handleWhatsAppReminder(rent)}
                            sx={(theme: Theme) => ({
                              borderColor: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                              color: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(52, 211, 153, 0.1)' 
                                  : '#d1fae5',
                                borderColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                                color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                              },
                              transition: 'all 0.2s ease',
                            })}
                            size="small"
                          >
                            WhatsApp Reminder
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ElectricBoltIcon />}
                            endIcon={expandedRentId === rent._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => toggleReadings(rent._id)}
                            sx={(theme: Theme) => ({
                              borderColor: theme.palette.mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                              color: theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(139, 92, 246, 0.1)' 
                                  : '#f3f4f6',
                                borderColor: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                color: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                              },
                              transition: 'all 0.2s ease',
                            })}
                            size="small"
                          >
                            {expandedRentId === rent._id ? 'Hide Readings' : 'Show Readings'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    
                    {/* Expandable Electricity Readings Section */}
                    <ElectricityReadingsSection
                      electricityReadings={rent.electricityReadings || []}
                      noticeReadings={rent.notice?.electricityReadings || []}
                      totalElectricityBill={rent.electricityBill}
                      isExpanded={expandedRentId === rent._id}
                    />
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Collection Form */}
      <PaymentCollectionForm
        isOpen={paymentFormOpen}
        onClose={() => {
          setPaymentFormOpen(false);
          setSelectedRentForPayment(null);
        }}
        rentRecord={selectedRentForPayment}
        onSubmitCallback={handlePaymentSubmit}
        setPaymentFormOpen={setPaymentFormOpen}
      />
    </div>
  );
}

export default function PendingRents() {
  return (
    <AuthGuard>
      <PendingRentsContent />
    </AuthGuard>
  );
}
