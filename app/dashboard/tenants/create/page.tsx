'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useCreateTenant } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { showSuccessToast } from '@/lib/toast-config';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import NumberInput from '@/components/ui/NumberInput';
import CustomSelect from '@/components/ui/CustomSelect';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';

import { RoomDetail } from '@/lib/api/types';

interface CreateTenantRequest {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  monthlyRent: number;
  securityDepositPaid?: number;
  currentReading?: number;
  checkInDate: string;
}

function CreateTenantContent() {
  const router = useRouter();
  const { selectedProperty } = useProperty();

  const [formData, setFormData] = useState<CreateTenantRequest>({
    property: selectedProperty?.id || '',
    room: '',
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: 0,
    securityDepositPaid: 0,
    currentReading: 0,
    checkInDate: ''
  });

  const createTenantMutation = useCreateTenant();

  // Use the useRooms hook to fetch rooms
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms(selectedProperty?.id || '', 1, 1000);

  // Update form data when property changes
  useEffect(() => {
    if (selectedProperty?.id) {
      setFormData(prev => ({ ...prev, property: selectedProperty.id }));
    }
  }, [selectedProperty]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.property || !formData.room) {
      showSuccessToast('Please select property and room');
      return;
    }

    createTenantMutation.mutate(formData, {
      onSuccess: () => {
        showSuccessToast('Tenant created successfully!');
        setTimeout(() => {
          router.push('/dashboard/tenants');
        }, 1000);
      }
    });
  };

  const rooms = roomsData?.data || [];
  const availableRooms = rooms.filter((room: RoomDetail) => !room.isOccupied && room.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Add New Tenant"
        subtitle="Create a new tenant record"
        showBackButton
        backHref="/dashboard"
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                New Tenant
              </h1>
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => router.push('/dashboard/tenants')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 rounded-[30px] cursor-pointer transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createTenantMutation.isPending}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTenantMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SaveIcon className="mr-2"/>
                      Create Tenant
                    </div>
                  )}
                </button>
              </div>
            </div>

            {createTenantMutation.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-red-800 dark:text-red-200">{createTenantMutation.error.message}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Property and Room Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <PersonIcon className="mr-2"/>
                  Property & Room Selection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property *
                    </label>
                                         <input
                       type="text"
                       value={selectedProperty?.name || 'No property selected'}
                       disabled
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                     />
                  </div>
                                     <div>
                     <CustomSelect
                       label="Room *"
                       value={formData.room}
                       onChange={(e) => handleInputChange('room', e.target.value)}
                       options={[
                         { value: '', label: 'Select a room' },
                         ...availableRooms.map((room) => ({
                           value: room._id,
                           label: `Room ${room.roomNo} - ${room.roomType} (₹${room.property.electricitySettings.ratePerUnit}/unit)`
                         }))
                       ]}
                       disabled={isLoadingRooms || availableRooms.length === 0}
                       sx={{
                         borderRadius: "8px",
                         "& .MuiSelect-select": {
                           borderRadius: "8px",
                         }
                       }}
                     />
                     {isLoadingRooms && (
                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Loading rooms...</p>
                     )}
                     {!isLoadingRooms && availableRooms.length === 0 && (
                       <p className="text-sm text-red-500 dark:text-red-400 mt-1">No available rooms found</p>
                     )}
                   </div>
                </div>
              </div>

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
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                       placeholder="Enter tenant's full name"
                     />
                  </div>
                      <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Phone Number *
                     </label>
                     <input
                       type="number"
                       value={formData.tenantNumber}
                       onChange={(e) => handleInputChange('tenantNumber', e.target.value)}
                       required
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
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
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
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
                    <NumberInput
                      value={formData.monthlyRent}
                      onChange={(value) => handleInputChange('monthlyRent', value || 0)}
                      placeholder="Enter monthly rent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Security Deposit Paid
                    </label>
                    <NumberInput
                      value={formData.securityDepositPaid}
                      onChange={(value) => handleInputChange('securityDepositPaid', value || 0)}
                      placeholder="Enter security deposit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Meter Reading
                    </label>
                    <NumberInput
                       value={formData.currentReading}
                       onChange={(value) => handleInputChange('currentReading', value || 0)}
                       placeholder="Enter current reading"
                     />
                  </div>
                </div>
              </div>
              
              {/* Mobile buttons */}
              <div className="flex flex-col md:hidden space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={createTenantMutation.isPending}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Tenant
                </button>
                <button
                  onClick={() => router.push('/dashboard/tenants')}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200"
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

export default function CreateTenant() {
  return (
    <AuthGuard>
      <CreateTenantContent />
    </AuthGuard>
  );
}
