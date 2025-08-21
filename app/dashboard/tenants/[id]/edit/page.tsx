'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useTenant, useUpdateTenant } from '@/hooks/useTenants';
import { showSuccessToast } from '@/lib/toast-config';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import NumberInput from '@/components/ui/NumberInput';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';

interface TenantFormData {
  tenantName: string;
  tenantNumber: string;
  tenantEmail: string;
  monthlyRent: number;
  securityDepositPaid: number;
  checkInDate: string;
}

function TenantEditContent() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [formData, setFormData] = useState<TenantFormData>({
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: 0,
    securityDepositPaid: 0,
    checkInDate: ''
  });

  const { data: tenant, isLoading, error: fetchError } = useTenant(tenantId);

  // Populate form data when tenant data is loaded
  React.useEffect(() => {
    if (tenant) {
      setFormData({
        tenantName: tenant.tenantName || '',
        tenantNumber: tenant.tenantNumber || '',
        tenantEmail: tenant.tenantEmail || '',
        monthlyRent: tenant.monthlyRent || 0,
        securityDepositPaid: tenant.securityDepositPaid || 0,
        checkInDate: tenant.checkInDate ? tenant.checkInDate.split('T')[0] : '',
      });
    }
  }, [tenant]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTenantMutation = useUpdateTenant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantMutation.mutate(
      { id: tenantId, data: formData },
      {
        onSuccess: () => {
          showSuccessToast('Tenant updated successfully!');
          // Navigate back to tenant view after successful update
          setTimeout(() => {
            router.push(`/dashboard/tenants/${tenantId}`);
          }, 1000);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (fetchError && !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Tenant</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{fetchError.message}</p>
          <Link
            href="/dashboard/tenants"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tenants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Edit Tenant"
        subtitle={`Editing details for ${tenant?.tenantName || 'Tenant'}`}
        showBackButton
        backHref={`/dashboard/tenants`}
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tenant Information
              </h1>
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => router.push(`/dashboard/tenants/${tenantId}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 rounded-[30px] cursor-pointer transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={updateTenantMutation.isPending}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTenantMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SaveIcon className="mr-2"/>
                      Save Changes
                    </div>
                  )}
                </button>
              </div>
            </div>

            {updateTenantMutation.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-red-800 dark:text-red-200">{updateTenantMutation.error.message}</div>
                </div>
              </div>
            )}

            {updateTenantMutation.isSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-green-800 dark:text-green-200">Tenant updated successfully!</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <PersonIcon className="mr-2"/>
                    Basic Information
                  </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tenant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.tenantName}
                      onChange={(e) => handleInputChange('tenantName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter tenant's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.tenantNumber}
                      onChange={(e) => handleInputChange('tenantNumber', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.tenantEmail}
                      onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check-in Date *
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={formData.checkInDate ? new Date(formData.checkInDate) : null}
                        onChange={(date) => handleInputChange('checkInDate', date ? date.toISOString().split('T')[0] : '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: "Select check-in date",
                            required: true,
                            sx: {
                              "& .MuiInputBase-root": {
                                borderRadius: "8px",
                                height: "48px",
                                color: "white",
                                backgroundColor: "rgba(55, 65, 81, 0.8)",
                                border: "1px solid rgba(229,231,235,1)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                transition: "all 0.2s ease-in-out",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0,0,0,0.3)",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#3b82f6",
                                boxShadow: "0 0 0 3px rgba(59,130,246,0.2)",
                              },
                            }
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CurrencyRupeeIcon className="mr-2"/>
                  Financial Information
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Rent *
                    </label>
                    <div className="relative">
                      <NumberInput
                        value={formData.monthlyRent}
                        onChange={(value) => handleInputChange('monthlyRent', value || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Security Deposit Paid
                    </label>
                    <div className="relative">
                      <NumberInput
                        value={formData.securityDepositPaid}
                        onChange={(value) => handleInputChange('securityDepositPaid', value || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* cancle and save for mobile */}
              <div className="flex flex-col md:hidden space-y-4">
               
                <button
                  onClick={handleSubmit}
                  disabled={updateTenantMutation.isPending}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => router.push(`/dashboard/tenants/${tenantId}`)}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TenantEdit() {
  return (
    <AuthGuard>
      <TenantEditContent />
    </AuthGuard>
  );
}
