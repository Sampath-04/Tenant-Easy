'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useTenant } from '@/hooks/useTenants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BadgeIcon from '@mui/icons-material/Badge';
import WarningIcon from '@mui/icons-material/Warning';
import RentHistoryTable from '@/components/RentHistoryTable';

function TenantViewContent() {
  const params = useParams();
  const tenantId = params.id as string;

  const [activeTab, setActiveTab] = useState('rent');

  const { data: tenant, isLoading, error: fetchError } = useTenant(tenantId);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Tenant Details"
        subtitle="Loading tenant details..."
        showBackButton
        backHref="/dashboard/tenants"
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

  if (error || !tenant) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Tenant Details"
        subtitle={`Viewing details for ${tenant.tenantName}`}
        showBackButton
        backHref="/dashboard/tenants"
      />

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        {/* Tenant Overview Card */}
        <div className={`${LAYOUT_CLASSES.CARD_CONTAINER} mb-8`}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {tenant.tenantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {tenant.tenantName}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                      {getStatusLabel(tenant.status)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Room {tenant.room.roomNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 text-right">
                <div className="text-2xl text-green-600 dark:text-green-400 font-bold">
                  {formatCurrency(tenant.monthlyRent)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Monthly Rent
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Phone Number
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {tenant.tenantNumber}
                    </div>
                  </div>
                </div>

                {tenant.tenantEmail && (
                  <div className="flex items-center space-x-3">
                    <EmailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tenant.tenantEmail}
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
                      {tenant.property?.propertyName || 'N/A'}
                    </div>
                  </div>
                </div>

                {tenant.currentReading && (
                  <div className="flex items-center space-x-3">
                    <ReceiptIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Current Meter Reading
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tenant.currentReading} units
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CalendarTodayIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Check-in Date
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tenant.checkInDate)}
                    </div>
                  </div>
                </div>

                {tenant.checkOutDate && (
                  <div className="flex items-center space-x-3">
                    <CalendarTodayIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Check-out Date
                      </div>
                      <div className="font-medium text-red-600 dark:text-red-400">
                        {formatDate(tenant.checkOutDate.toISOString())}
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
                      {formatCurrency(tenant.securityDepositPaid || 0)}
                    </div>
                  </div>
                </div>

                {tenant.tenantIdProof && (
                  <div className="flex items-center space-x-3">
                    <BadgeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID Proof Type
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {tenant.tenantIdProof.idType || 'Not provided'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {tenant.notice && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <WarningIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Notice Period
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      {formatDate(tenant.notice.noticeDate.toString())} - {formatDate(tenant.notice.noticeEndsOn.toString())}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs for Details and Rent History */}
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-0">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('rent')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer ${activeTab === 'rent'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <span className="flex items-center">
                    Pending Rents
                    {tenant.pendingRents?.count && tenant.pendingRents.count > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {tenant.pendingRents.count}
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
                records={tenant.pendingRents?.pendingRentRecords || []}
                emptyMessage="No Rent History Found"
                showUnits={true}
              />
            )}

            {activeTab === "completed" && (
              <RentHistoryTable
                records={tenant.recentPayments || []}
                emptyMessage="No Completed Rents Found"
                showUnits={false}
              />
            )}

          </div>
        </div>
      </main>
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
