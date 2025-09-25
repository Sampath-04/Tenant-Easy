'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Box,
  Pagination,
  MenuItem,
  Tooltip,
  Skeleton,
  TablePagination,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CurrencyRupee as CurrencyIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useRentRecords, usePropertyRentSummary } from '@/hooks/useRentRecords';
import { useRoomList, useRooms } from '@/hooks/useRooms';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency, formatDateForAPI } from '@/lib/utils/formatters';
import { generateRentHistoryExcel } from '@/lib/utils/excelExport';
import { useProperty } from '@/contexts/PropertyContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import RentRecordsList from '@/app/components/RentRecordsList';
import { showErrorToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';


export default function RentRecordsPage() {
  const { selectedProperty } = useProperty();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    tenant: '',
    paymentStatus: '',
    roomNo: '',
    rentStatus: '', // Add rent status filter
  });

  // Date range filter - no initial filter
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Read from URL params on mount
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      tenant: searchParams.get("tenant") || "",
      paymentStatus: searchParams.get("paymentStatus") || "",
      roomNo: searchParams.get("roomNo") || "",
      rentStatus: searchParams.get("rentStatus") || "",
    });
    setPage(parseInt(searchParams.get("page") || "1"));
    setLimit(parseInt(searchParams.get("limit") || "10"));
    
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    setStartDate(startDateParam ? new Date(startDateParam) : null);
    setEndDate(endDateParam ? new Date(endDateParam) : null);
  }, []);

  // Write to URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add pagination
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Add dates
    if (startDate) {
      params.set("startDate", formatDateForAPI(startDate));
    }
    if (endDate) {
      params.set("endDate", formatDateForAPI(endDate));
    }

    // Update the URL (shallow = true to avoid full reload)
    router.push(`/dashboard/rent-records?${params.toString()}`);
  }, [filters, page, limit, startDate, endDate, router]);

  // Get rent records with filters
  const { data: rentRecordsResponse, isLoading: recordsLoading, error: recordsError } = useRentRecords({
    propertyId: selectedProperty?.id || '',
    page,
    limit,
    tenant: filters.tenant || undefined,
    paymentStatus: filters.paymentStatus === '' ? undefined : filters.paymentStatus as "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
    search: debouncedSearch || undefined,
    roomNo: filters.roomNo || undefined,
    rentStatus: filters.rentStatus === '' ? undefined : filters.rentStatus as "pending" | "due" | "upcoming",
    endDateFrom: startDate ? formatDateForAPI(startDate) : undefined,
    endDateTo: endDate ? formatDateForAPI(endDate) : undefined,
  });

  // Get property rent summary with same date range filters
  const { data: summaryResponse, isLoading: summaryLoading } = usePropertyRentSummary(
    selectedProperty?.id || '',
    startDate ? formatDateForAPI(startDate) : undefined,
    endDate ? formatDateForAPI(endDate) : undefined,
    filters.paymentStatus === '' ? undefined : filters.paymentStatus as "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
    debouncedSearch || undefined,
    filters.roomNo || undefined,
    filters.rentStatus === '' ? undefined : filters.rentStatus as "pending" | "due" | "upcoming",
  );

  // Get rooms for dropdown
  const { data: roomsResponse } = useRoomList(selectedProperty?.id || '');
  const rooms = roomsResponse?.data || [];
  const rentRecords = rentRecordsResponse?.data || [];
  const summary = summaryResponse?.data;

  // Handle export functionality
  const handleExport = async () => {
    if (!rentRecords || rentRecords.length === 0) {
      const showToasError = showErrorToast('No records to export');
      toast.error(showToasError.message, showToasError.config);
      return;
    }

    try {
      setIsExporting(true);

      // Use the reusable rent history export function
      await generateRentHistoryExcel(rentRecords, summary, startDate, endDate);

      // Reset states
      setExportDialogOpen(false);
      setIsExporting(false);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Failed to generate Excel file');
      setIsExporting(false);
    }
  };

  // Filter rents based on search term
  const filteredRents = useMemo(() => {
    if (!rentRecords) return [];

    return rentRecords.filter(rent =>
      rent.tenant.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      rent.tenant.tenantNumber.includes(debouncedSearch)
    );
  }, [rentRecords, debouncedSearch]);


  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
    setPage(1); // Reset to first page when date changes
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
    setPage(1); // Reset to first page when date changes
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tenant: '',
      paymentStatus: '',
      roomNo: '',
      rentStatus: '',
    });
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (recordsError) {
    return (
      <div className="p-6">
        <Alert severity="error">
          Failed to load rent records. Please try again.
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Rent Records', url: '/dashboard/rent-records' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="All Rent Records"
        subtitle={`${selectedProperty?.name || 'Property'} - Complete Rent History`}
      />
      <div className='px-6 md:pt-6 pt-4'>
        <BreadCrumbs items={breadcrumbs} />
      </div>

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER + ' pt-4'}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="md:p-4 p-2">

            {/* Summary Cards */}
            {
              summaryLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 h-[402px] md:h-[142px]">
                  <Skeleton variant="rectangular" sx={{ borderRadius: '12px', width: '100%', height: '100%'}} />
                  <Skeleton variant="rectangular" sx={{ borderRadius: '12px', width: '100%', height: '100%'}} />
                  <Skeleton variant="rectangular" sx={{ borderRadius: '12px', width: '100%', height: '100%'}} />
                  <Skeleton variant="rectangular" sx={{ borderRadius: '12px', width: '100%', height: '100%'}} />
                  <Skeleton variant="rectangular" sx={{ borderRadius: '12px', width: '100%', height: '100%'}} />
                </div>
              ) : (
                (summary || !summaryLoading) && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent sx={{
                        padding: {md: '16px!important', xs: '12px!important'},
                        display: {xs: 'flex', md: 'block'},
                        height: {xs: '100%', md: 'auto'},
                      }}>
                        <div className="flex gap-2 justify-between">
                          <div>
                            <p className="text-gray-900 dark:text-white text-xl md:text-3xl">
                              {formatCurrency(summary?.totalAmount || 0)}
                            </p>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Total Amount
                            </Typography>
                          </div>
                          <CurrencyIcon className="text-3xl text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent sx={{
                        padding: {md: '16px!important', xs: '12px!important'},  
                      }}>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <p className="text-red-600 dark:text-red-400 text-xl md:text-3xl">
                                  {formatCurrency(summary?.overdueAmount || 0)}
                                </p>
                               
                              </div>
                              <WarningIcon className="text-3xl text-red-500 dark:text-red-400 self-start" />
                            </div>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Overdue Amount
                              </Typography>
                            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                              {summary?.overdueCount || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Overdue Count
                            </Typography>
                          </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent sx={{
                        padding: {md: '16px!important', xs: '12px!important'},
                      }}>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <p className="text-green-600 dark:text-green-400 text-xl md:text-3xl">
                                  {formatCurrency(summary?.pendingAmount || 0)}
                                </p>
                                
                              </div>
                              <ScheduleIcon className="text-3xl text-green-600 dark:text-green-400 self-start" />
                            </div>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Pending Amount
                            </Typography>
                            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                              {summary?.pendingCount || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Pending Count
                            </Typography>
                          </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent sx={{
                        padding: {md: '16px!important', xs: '12px!important'},
                      }}>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400 text-xl md:text-3xl">
                                  {formatCurrency(summary?.upcomingAmount || 0)}
                                </p>
                                
                              </div>
                              <ScheduleIcon className="text-3xl text-blue-600 dark:text-blue-400 self-start" />
                            </div>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Upcoming Amount
                            </Typography>
                            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                              {summary?.upcomingCount || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Upcoming Count
                            </Typography>
                          </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent sx={{
                        padding: {md: '16px!important', xs: '12px!important'},
                      }}>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <p className="text-emerald-600 dark:text-emerald-400 text-xl md:text-3xl">
                                  {formatCurrency(summary?.collectedAmount || 0)}
                                </p>
                                
                              </div>
                              <CurrencyIcon className="text-3xl text-emerald-600 dark:text-emerald-400 self-start" />
                            </div>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Collected Amount
                            </Typography>
                            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                              {summary?.collectedCount || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Collected Count
                            </Typography>
                          </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

            {/* Filter Toggle and Export Button */}
            <div className="flex justify-between items-center md:mb-6 mb-4">
              <div className="flex items-center gap-2">
                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={toggleFilters}
                    className={`${showFilters ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'} hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 ease-in-out`}
                  >
                    <FilterIcon className={`${showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} transition-colors duration-200`} />
                  </IconButton>
                </Tooltip>
                
                {showFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 transition-all duration-200 ease-in-out"
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
                size="small"
                sx={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                Export
              </Button>
            </div>

            {/* Search and Filter */}
            <div className={`overflow-hidden transition-all duration-300 ${
              showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg md:p-3 p-2 shadow-sm border border-gray-200 dark:border-gray-700 md:mb-6 mb-4">
                <div className="md:flex grid grid-cols-2 md:flex-row md:gap-4 gap-2 items-center">
                  <div className="flex-1 w-full col-span-2">
                    <TextField
                      fullWidth
                      placeholder="Search by tenant name, phone number..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                      }}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: '12px',
                          padding: '4px 10px',
                          fontSize: {xs: '0.875rem', md: '1rem'},
                        }
                      }}
                    />
                  </div>
                  <div className="w-full md:w-48 col-start-1 rows-start-2">
                    <TextField
                      select
                      fullWidth
                      label="Room"
                      value={filters.roomNo}
                      onChange={(e) => handleFilterChange('roomNo', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Rooms</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room._id} value={room.roomNo}>
                          Room {room.roomNo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  <div className="w-full md:w-48 col-span-2">
                    <TextField
                      select
                      label="Payment Status"
                      value={filters.paymentStatus}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      className="w-full md:w-48"
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Status</em>
                      </MenuItem>
                      <MenuItem value="FULLY_PAID">Fully Paid</MenuItem>
                      <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                      <MenuItem value="NOT_PAID">Not Paid</MenuItem>
                    </TextField>
                  </div>
                  <TextField
                      select
                      label="Rent Status"
                      value={filters.rentStatus}
                      onChange={(e) => handleFilterChange('rentStatus', e.target.value)}
                      className="w-full md:w-48"
                      size="small"
                      sx={{
                        gridRowStart:2,
                        gridColumn: "2/3"
                      }}
                    >
                      <MenuItem value="">
                        <em>All Rent Status</em>
                      </MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="due">Due</MenuItem>
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                  </TextField>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="w-full md:w-48 row-start-4">
                      <DatePicker
                        label="Start Date"
                        value={startDate || null}
                        onChange={handleStartDateChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </div>
                    <div className="w-full md:w-48 row-start-4">
                      <DatePicker
                        label="End Date"
                        value={endDate || null}
                        onChange={handleEndDateChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                </div>
              </div>
            </div>

            {/* Rent Records List */}
            {recordsLoading ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress />
              </div>
            ) : (
              <RentRecordsList
                filteredRents={filteredRents}
              />
            )}

            {/* Pagination */}
            {!recordsLoading && rentRecordsResponse && rentRecordsResponse.pagination.totalPages > 0 && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mt-6">
                <TablePagination
                  component="div"
                  count={rentRecordsResponse.total || 0}
                  page={page - 1} // MUI uses 0-based indexing
                  onPageChange={(_, newPage) => setPage(newPage + 1)} // Convert back to 1-based
                  rowsPerPage={limit}
                  onRowsPerPageChange={(e) => {
                    const newPageSize = parseInt(e.target.value, 10);
                    setLimit(newPageSize);
                    setPage(1); // Reset to first page when changing page size
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
                    "& .MuiInputBase-root":{
                    marginRight:{xs: "4px", md: "16px"}
                    },
                    "& .MuiTablePaginationActions-root":{
                      marginLeft:{xs: "0px", md: "16px"}
                    }
                  }}
                />
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 40px rgba(0, 0, 0, 0.3)'
              : '0 10px 40px rgba(0, 0, 0, 0.1)',
          }
        })}
      >
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            pb: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          })}
        >
          <Typography
            sx={(theme) => ({
              fontWeight: 600,
              fontSize: '1.25rem',
              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
            })}
          >
            Export Rent Records
          </Typography>
          <IconButton
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
          }
        })}
      >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={(theme) => ({
            paddingTop: "24px !important",
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          })}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={(theme) => ({
                mb: 2,
                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
              })}
            >
              Export the currently filtered rent records to Excel. The export will include all records matching your current filters.
            </Typography>

            <Box
              sx={(theme) => ({
                backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f9fafb',
                borderRadius: '8px',
                p: 2.5,
                border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
              })}
            >
              <Typography
                variant="body2"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  mb: 2,
                })}
              >
                Export Summary:
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                        mb: 1,
                        fontWeight: 500,
                      })}
                    >
                      Date Range
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        mb: 2,
                      })}
                    >
                      {startDate && endDate ? `${formatDate(startDate.toISOString())} to ${formatDate(endDate.toISOString())}` : 'All dates'}
                    </Typography>
                  </Box>
                
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Search
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {filters.search || 'None'}
                  </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Payment Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                    })}
                  >
                    {filters.paymentStatus || 'All status'}
                  </Typography>
                  </Box>
                </Box>

                {/* vertical divider */}
                <div className="h-full w-px bg-gray-200 dark:bg-gray-700"></div>
                
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Room
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {filters.roomNo || 'All rooms'}
                  </Typography>
                  
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Rent Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {filters.rentStatus || 'All status'}
                  </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Records Count
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#3b82f6' : '#3b82f6',
                      fontWeight: 600,
                    })}
                  >
                    {rentRecords.length} records
              </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: 3,
            py: 2,
            gap: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          })}
        >
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
              color: '#ffffff',
              px: 3,
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#4b5563',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !rentRecords || rentRecords.length === 0}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#3b82f6' : '#3b82f6',
              color: '#ffffff',
              px: 3,
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#2563eb',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            })}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon fontSize="small" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
