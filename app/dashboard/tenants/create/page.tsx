'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHOD_OPTIONS } from '@/lib/constants/paymentConstants';
import { useCreateTenant } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import NumberInput from '@/components/ui/NumberInput';
import CustomSelect from '@/components/ui/CustomSelect';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Typography, IconButton, Chip, Theme } from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import FileUploadField from '@/components/ui/FileUploadField';

import { RoomDetail } from '@/lib/api/types';
import { formatDateToYYYYMMDD } from '@/lib/utils/formatters';
import { toast } from 'react-toastify';
import BreadCrumbs from '@/components/ui/BreadCrumbs';



interface CreateTenantRequest {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  monthlyRent: number;
  securityDepositTotal: number;
  securityDepositPaid: number;
  currentReading?: number;
  checkinDate: string; // Changed to match backend expectation
  tenantIdProof?: File;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  rentPaid: number;
  paymentMethod: string;
  paymentProofs?: File[];
}

function CreateTenantContent() {
  const router = useRouter();
  const { selectedProperty } = useProperty();

  // Reusable NumberInput styles with theme support
  const numberInputStyles = (theme: Theme) => ({
    "& .MuiInputBase-root": {
      '& .MuiInputBase-input':{
        padding: "14px",
      },
      borderRadius: "8px", // Override the default 30px to match other inputs
      backgroundColor: theme.palette.mode === "dark" 
        ? "#374151" 
        : "rgba(255,255,255,0.8)",
      color: theme.palette.mode === "dark" ? "white" : "black",
      "&.Mui-focused": {
        borderColor: "#3B82F6",
        border: "2px solid #3B82F6",
      }
    }
  });

  const [formData, setFormData] = useState<CreateTenantRequest>({
    property: selectedProperty?.id || '',
    room: '',
    tenantName: '',
    tenantNumber: '',
    tenantEmail: '',
    monthlyRent: 0,
    securityDepositTotal: 0,
    securityDepositPaid: 0,
    currentReading: 0,
    checkinDate: formatDateToYYYYMMDD(new Date()), // Set default to current date
    tenantIdProof: undefined,
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    rentPaid: 0,
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    paymentProofs: []
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
      const errorToast = showErrorToast('Please select property and room');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    // Validate current reading if check-in date is today
    const today = formatDateToYYYYMMDD(new Date());
    if (formData.checkinDate === today && (!formData.currentReading || formData.currentReading === 0)) {
      const errorToast = showErrorToast('Current meter reading is required when check-in date is today');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    // Validate payment proofs if rent or security is paid
    if ((formData.rentPaid > 0 || formData.securityDepositPaid > 0) && 
        (!formData.paymentProofs || formData.paymentProofs.length === 0)) {
      const errorToast = showErrorToast('Payment proof is required when rent or security deposit is paid');
      toast.error(errorToast.message, errorToast.config);
      return;
    }

    createTenantMutation.mutate(formData, {
      onSuccess: () => {
        const successToast = showSuccessToast('Tenant created successfully!');
        toast.success(successToast.message, successToast.config);
        setTimeout(() => {
          router.push('/dashboard/tenants');
        }, 2000);
      }
    });
  };

  const rooms = roomsData?.data || [];
  const availableRooms = rooms.filter((room: RoomDetail) => !room.isOccupied && room.isActive);

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Tenants', url: '/dashboard/tenants' },
    { label: 'Create Tenant', url: '/dashboard/tenants/create' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Add New Tenant"
        subtitle="Create a new tenant record"
      />
      <div className='px-6 pt-6 flex flex-row justify-between items-center'>
      <BreadCrumbs items={breadcrumbs} /> 
      </div>
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-4 w-[60%] mx-auto">
            <div className="mb-6">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                 New Tenant
               </h1>
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
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                         value={formData.checkinDate ? new Date(formData.checkinDate + 'T00:00:00') : null}
                           onChange={(date) => {
                            handleInputChange('checkinDate', formatDateToYYYYMMDD(date));
                          }}
                         slotProps={{
                           textField: {
                             fullWidth: true,
                             placeholder: "Select check-in date",
                             required: true,
                             sx: (theme) => ({
                                "& .MuiPickersInputBase-root":{
                                  borderRadius: "8px",
                                  backgroundColor: theme.palette.mode === "dark" ? "#374151" : "rgba(255,255,255,0.8)",
                                },
                                "& .MuiPickersSectionList-root":{
                                padding: "14px 4px",
                              },
                               "& .MuiInputBase-root": {
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
                             })
                           },
                         }}
                       />
                     </LocalizationProvider>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Emergency Contact Name
                     </label>
                     <input
                       type="text"
                       value={formData.emergencyContact?.name || ''}
                       onChange={(e) => handleInputChange('emergencyContact', { 
                         ...formData.emergencyContact, 
                         name: e.target.value 
                       })}
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                       placeholder="Enter emergency contact name"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Emergency Contact Phone
                     </label>
                     <input
                       type="text"
                       value={formData.emergencyContact?.phone || ''}
                       onChange={(e) => handleInputChange('emergencyContact', { 
                         ...formData.emergencyContact, 
                         phone: e.target.value 
                       })}
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                       placeholder="Enter emergency contact phone"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Emergency Contact Relation
                     </label>
                     <input
                       type="text"
                       value={formData.emergencyContact?.relation || ''}
                       onChange={(e) => handleInputChange('emergencyContact', { 
                         ...formData.emergencyContact, 
                         relation: e.target.value 
                       })}
                       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                       placeholder="Enter relation (e.g., Father, Mother, Spouse)"
                     />
                   </div>
                   {/* Current Meter Reading - Only show if check-in date is today */}
                   {formData.checkinDate === formatDateToYYYYMMDD(new Date()) && (
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Current Meter Reading *
                       </label>
                          <NumberInput
                          value={formData.currentReading}
                          onChange={(value) => handleInputChange('currentReading', value || 0)}
                          placeholder="Enter current reading"
                          customeStyles={numberInputStyles}
                        />
                     </div>
                   )}
                 </div>
               </div>

               {/* Financial Information */}
               <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                   <CurrencyRupeeIcon className="mr-2"/>
                   Financial Information
                 </h2>
                 <div className="flex flex-col md:flex-row gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Monthly Rent *
                     </label>
                                           <NumberInput
                        value={formData.monthlyRent}
                        onChange={(value) => handleInputChange('monthlyRent', value || 0)}
                        placeholder="Enter monthly rent"
                        customeStyles={numberInputStyles}
                      />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Security Deposit Total *
                     </label>
                        <NumberInput
                        value={formData.securityDepositTotal}
                        onChange={(value) => handleInputChange('securityDepositTotal', value || 0)}
                        placeholder="Enter security deposit total"
                        customeStyles={numberInputStyles}
                        />
                   </div>
                 </div>
               </div>

               {/* Amount Paid Information */}
               <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                   <CurrencyRupeeIcon className="mr-2"/>
                   Amount Paid
                 </h2>
                 <div className="flex flex-col md:flex-row gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Rent Paid
                     </label>
                                           <NumberInput
                        value={formData.rentPaid}
                        onChange={(value) => handleInputChange('rentPaid', value || 0)}
                        placeholder="Enter rent paid"
                        customeStyles={numberInputStyles}
                      />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Security Deposit Paid
                     </label>
                        <NumberInput
                        value={formData.securityDepositPaid}
                        onChange={(value) => handleInputChange('securityDepositPaid', value || 0)}
                        placeholder="Security deposit paid"
                        customeStyles={numberInputStyles}
                      />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Payment Method
                     </label>
                     <CustomSelect
                       value={formData.paymentMethod}
                       onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                       options={PAYMENT_METHOD_OPTIONS}
                       sx={{
                         borderRadius: "8px",
                         width: "160px",
                         "& .MuiSelect-select": {
                           borderRadius: "8px",
                           padding: "14px",
                         }
                       }}
                     />
                   </div>
                 </div>
               </div>

                 {/* Document Uploads - Only show if any amount is paid */}
                {(formData.rentPaid > 0 || formData.securityDepositPaid > 0) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <CloudUploadIcon className="mr-2"/>
                      Document Uploads
                    </h2>
                      <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Payment Proofs *
                       </label>
                        <FileUploadField
                          onFileSelect={(files: File | File[]) => handleInputChange('paymentProofs', files as File[])}
                          accept="image/*"
                          placeholder="Upload payment proofs"
                          multiple={true}
                          selectedFiles={formData.paymentProofs}
                          maxFiles={4}
                        />
                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                         Required when rent or security deposit is paid
                       </p>
                     </div>
                  </div>
                )}
              
              {/* Action Buttons */}
               <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 justify-end">
                 <button
                   onClick={() => router.push('/dashboard/tenants')}
                   className="px-6 py-2 border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 rounded-[30px] cursor-pointer transition-colors duration-200 font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleSubmit}
                   disabled={createTenantMutation.isPending}
                   className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] cursor-pointer text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none w-fit"
                 >
                   {createTenantMutation.isPending ? (
                     <div className="flex items-center justify-center">
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                       Creating...
                     </div>
                   ) : (
                     <div className="flex items-center justify-center">
                       <SaveIcon className="mr-2"/>
                       Create Tenant
                     </div>
                   )}
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
