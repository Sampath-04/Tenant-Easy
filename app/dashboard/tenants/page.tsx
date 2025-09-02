'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AuthGuard } from '../../../contexts/AuthContext';
import { useProperty } from '../../../contexts/PropertyContext';
import { useTenants } from '../../../hooks/useTenants';
import { useActiveRooms } from '../../../hooks/useRooms';
import { useDebounce } from '../../../hooks/useDebounce';
import { TenantFilters } from '../../../lib/api/types';
import { AppHeader } from '../../../components/AppHeader';
import SearchInput from '../../../components/ui/SearchInput';
import CustomSelect from '../../../components/ui/CustomSelect';
import NumberInput from '../../../components/ui/NumberInput';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import DateRangePicker from '../../../components/ui/DateRange';
import { LAYOUT_CLASSES } from '../../../lib/constants/styles';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import { useRouter } from 'next/navigation';

function TenantsContent() {
  const router = useRouter();
  const { selectedProperty } = useProperty();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search state for immediate UI updates
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Filter state - Initialize with selected property
  const [filters, setFilters] = useState<TenantFilters>({
    status: '',
    property: selectedProperty?.id || '',
    room: '',
    search: '',
    isActive: '',
    rentRange: { min: undefined, max: undefined },
    checkInDateRange: { from: '', to: '' },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Update property filter when selected property changes
  useEffect(() => {
    if (selectedProperty?.id && filters.property !== selectedProperty.id) {
      setFilters(prev => ({
        ...prev,
        property: selectedProperty.id,
        room: '' // Reset room when property changes
      }));
      setCurrentPage(1);
    }
  }, [selectedProperty?.id, filters.property]);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch data
  const { data: tenantsData, isLoading, error } = useTenants({
    page: currentPage,
    limit: pageSize,
    filters,
    propertyId: selectedProperty?.id || ''
  });

  // Fetch active rooms for the selected property
  const { data: roomsData } = useActiveRooms(selectedProperty?.id || '');

  // Reset room filter when property changes
  useEffect(() => {
    if (filters.property !== '') {
      setFilters(prev => ({ ...prev, room: '' }));
    }
  }, [filters.property]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFilterChange = (key: keyof TenantFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      property: selectedProperty?.id || '', // Keep current property
      room: '',
      search: '',
      isActive: '',
      rentRange: { min: undefined, max: undefined },
      checkInDateRange: { from: '', to: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  const tenants = tenantsData?.data || [];
  const pagination = tenantsData?.pagination;

  const { error: propertyError } = useProperty();

  
  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Tenants"
          subtitle="Manage your property tenants"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {propertyError ? (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Failed to load properties</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Cannot load tenant data without property information</p>
                </>
              ) : (
                <>
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Loading tenants...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait while we load your property data</p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Tenants', url: '/dashboard/tenants' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <AppHeader
        title="Tenants"
        subtitle={`Manage tenants for ${selectedProperty.name}`}
      />

      <div className='px-6 pt-6 flex flex-row justify-between items-center'>
        <BreadCrumbs items={breadcrumbs} />
        {/* add tenant button */}
        <button 
          onClick={() => router.push('/dashboard/tenants/create')}
          className="md:mt-4 lg:mt-0 text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-[30px] cursor-pointer font-medium transition-colors flex items-center space-x-1 w-fit"
        >
          <span className="hidden md:block">Add Tenant</span>
          <span className="md:hidden">Add Tenant</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-6 pt-4">
        {/* Filters Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 mb-4">
          <div className="flex flex-row justify-between md:flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Filter Tenants
              </h2>
            </div>
            <button
              onClick={clearFilters}
              className="md:mt-4 lg:mt-0 text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-[30px] cursor-pointer font-medium transition-colors flex items-center space-x-1 w-fit"
            >
              <span className="hidden md:block">Clear All Filters</span>
              <span className="md:hidden">Clear Filters</span>
            </button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {/* Search */}
            <div className="space-y-2 self-end">
              <SearchInput
                placeholder="Name, email, or phone..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              />
            </div>
            <div className='flex flex-row gap-4'>
              {/* Status Filter */}
              <div className="space-y-2 w-[140px]">
                <CustomSelect
                  value={filters.status || ''}
                  onChange={(e: any) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'onboarded', label: 'Onboarded' },
                    { value: 'notice_serving', label: 'Notice Period' },
                    { value: 'evicted', label: 'Evicted' }
                  ]}
                />
              </div>

              {/* Room Filter */}
              <div className="space-y-2 w-[180px]">
                <CustomSelect
                  value={filters.room || ''}
                  onChange={(e: any) => handleFilterChange('room', e.target.value)}
                  options={[
                    { value: '', label: 'All Rooms' },
                    ...(Array.isArray(roomsData?.data) ? roomsData.data.map((room: any) => ({
                      value: room._id,
                      label: `Room ${room.roomNo} (${room.roomType})`
                    })) : [])
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters Accordion */}
          <Accordion 
            className="rounded-2xl border border-gray-300 dark:border-gray-700 overflow-hidden"
            sx={{
              '&:before': {
                display: 'none',
              },
              boxShadow: 'none',
              backgroundColor: 'transparent',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              sx={{
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                },
              }}
            >
              <p  className="font-semibold text-gray-700 dark:text-gray-300 flex items-center text-md">
                Advanced Filters
              </p>
            </AccordionSummary>
            <AccordionDetails sx={{
              padding: '16px',
            }} className=" bg-white dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Rent Range
                  </label>
                  <Box display="flex" gap={2}>
                    <NumberInput
                      placeholder="Min Amount"
                      value={filters.rentRange?.min || ""}
                      onChange={(value) =>
                        handleFilterChange("rentRange", {
                          ...filters.rentRange,
                          min: value,
                        })
                      }
                      minWidth="120px"
                    />
                    <NumberInput
                      placeholder="Max Amount"
                      value={filters.rentRange?.max || ""}
                      onChange={(value) =>
                        handleFilterChange("rentRange", {
                          ...filters.rentRange,
                          max: value,
                        })
                      }
                      minWidth="120px"
                    />
                  </Box>
                </div>

                <div className="space-y-2">
                  <DateRangePicker
                    label="Check-in Date Range"
                    value={filters.checkInDateRange || { from: '', to: '' } as any}
                    onChange={(newRange) =>
                      handleFilterChange("checkInDateRange", newRange)
                    }
                  />
                </div>

                <div className='flex flex-row gap-4'>
                  <div className="space-y-2 w-[180px]">
                    <CustomSelect
                      label="Sort By"
                      value={filters.sortBy || 'createdAt'}
                      onChange={(e: any) => handleFilterChange('sortBy', e.target.value)}
                      options={[
                        { value: 'tenantName', label: 'Name' },
                        { value: 'checkInDate', label: 'Check-in Date' },
                        { value: 'monthlyRent', label: 'Monthly Rent' },
                        { value: 'createdAt', label: 'Created Date' }
                      ]}
                    />
                  </div>
                  <div className="space-y-2 w-[140px]">
                    <CustomSelect
                      label="Order"
                      value={filters.sortOrder || 'desc'}
                      onChange={(e: any) => handleFilterChange('sortOrder', e.target.value)}
                      options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Tenants Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading tenants...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait while we fetch the tenants data</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Failed to load tenants</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please try refreshing the page</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No tenants found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your filters or add new tenants</p>
                <Link
                  href="/dashboard/tenants/add"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Tenant
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <TableContainer component={Paper} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl border border-white/20 dark:border-gray-700/50" sx={{
                  height:"460px"
                }}>
                  <Table>
                    <TableHead>
                      <TableRow className="bg-white dark:bg-gray-800 shadow-sm  sticky top-0 z-10">
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          Tenant Details
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          Room
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          Rent
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          Status
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          Checked In
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300" align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tenants.map((tenant) => (
                        <TableRow key={tenant._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {tenant.tenantName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <Typography variant="subtitle2" className="font-semibold text-gray-900 dark:text-white">
                                  {tenant.tenantName}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  {tenant.tenantNumber}
                                </Typography>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                              Room {tenant.room.roomNo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-semibold text-green-700 dark:text-green-400">
                              {formatCurrency(tenant.monthlyRent)}
                            </Typography>
                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                              Deposit: {formatCurrency(tenant.securityDepositPaid || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${tenant.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-700' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${tenant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                              {formatDate(tenant.checkInDate)}
                            </Typography>
                            {tenant.checkOutDate && (
                              <Typography variant="caption" className="text-red-600 dark:text-red-400">
                                Check-out: {formatDate(tenant.checkOutDate)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <div className="flex flex-row space-x-3 justify-end">
                              <Link
                                href={`/dashboard/tenants/${tenant._id}`}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              >
                                View
                              </Link>
                              <Link
                                href={`/dashboard/tenants/${tenant._id}/edit`}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              >
                                Edit
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>

              {/* Mobile Accordion View */}
              <div className="md:hidden">
                {tenants.map((tenant) => (
                  <Accordion key={tenant._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/50" sx={{
                    "&.Mui-expanded": {
                      margin: 0,
                    }
                  }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {tenant.tenantName.charAt(0).toUpperCase()}
                          </div>
                          <div className='flex flex-row items-center gap-2'>
                            <Typography variant="subtitle1" className="font-semibold text-gray-900 dark:text-white">
                              {tenant.tenantName}
                            </Typography>
                            <div className="flex items-center gap-4">
                              <Typography variant="body2" className="text-green-700 dark:text-green-400 font-medium">
                                {formatCurrency(tenant.monthlyRent)}
                              </Typography>
                              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tenant.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {tenant.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className="bg-gray-50/30 dark:bg-gray-700/30">
                      <div className="space-y-4">
                  
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Phone Number
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white font-medium">
                              {tenant.tenantNumber}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider ">
                              Room
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white font-medium">
                              Room {tenant.room.roomNo}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Deposit
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {formatCurrency(tenant.securityDepositPaid || 0)}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Checked In
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {formatDate(tenant.checkInDate)}
                            </Typography>
                          </div>
                        </div>
                        
                        {/* Email (if available) */}
                        {tenant.tenantEmail && (
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Email
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              {tenant.tenantEmail}
                            </Typography>
                          </div>
                        )}
                        
                        {/* Check-out date (if available) */}
                        {tenant.checkOutDate && (
                          <div>
                            <Typography variant="caption" className="text-red-600 dark:text-red-400 uppercase tracking-wider">
                              Check-out Date
                            </Typography>
                            <Typography variant="body2" className="text-red-600 dark:text-red-400">
                              {formatDate(tenant.checkOutDate)}
                            </Typography>
                          </div>
                        )}

                            {/* Action Buttons */}
                        <div className="flex justify-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <Link
                            href={`/dashboard/tenants/${tenant._id}`}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/dashboard/tenants/${tenant._id}/edit`}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            Edit Tenant
                          </Link>
                        </div>
                        
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>

               {/* MUI Pagination */}
               {pagination && pagination.totalPages > 0 && (
                 <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
                   <TablePagination
                     component="div"
                     count={tenantsData?.total || 0}
                     page={currentPage - 1} // MUI uses 0-based indexing
                     onPageChange={(_, newPage) => setCurrentPage(newPage + 1)} // Convert back to 1-based
                     rowsPerPage={pageSize}
                     onRowsPerPageChange={(e) => {
                       const newPageSize = parseInt(e.target.value, 10);
                       setPageSize(newPageSize);
                       setCurrentPage(1); // Reset to first page when changing page size
                     }}
                     rowsPerPageOptions={[10, 25, 50, 100]}
                     labelRowsPerPage="Rows per page:"
                     labelDisplayedRows={({ from, to, count }) =>
                       `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                     }
                     sx={{
                       backgroundColor: 'transparent',
                       '& .MuiTablePagination-toolbar': {
                         padding: '8px',
                       },
                       '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                         color: 'inherit',
                       },
                     }}
                   />
                 </div>
               )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TenantsPage() {
  return (
    <AuthGuard allowedRoles={['owner', 'admin']}>
      <TenantsContent />
    </AuthGuard>
  );
}
