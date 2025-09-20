'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useRooms, useUpdateRoom, useRoomList } from '@/hooks/useRooms';
import { RoomCard } from '@/app/components/RoomCard';
import CustomSelect from '@/components/ui/CustomSelect';
import { 
  Button,
  Dialog,
  Pagination,
  Box,
  TextField,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  MeetingRoom as RoomIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import RoomCreationForm from '@/app/components/RoomCreationForm';
import { showSuccessToast } from '@/lib/toast-config';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Show 9 rooms per page
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    roomType: 'all',
    availability: 'all',
    roomId: 'all',
  });

  const { 
    data: roomsData, 
    isLoading, 
    error 
  } = useRooms(selectedProperty?.id || '', currentPage, pageSize, filters);

  // Fetch all rooms for the dropdown
  const { 
    data: allRoomsData, 
    isLoading: isLoadingAllRooms 
  } = useRoomList(selectedProperty?.id || '');

  const updateRoomMutation = useUpdateRoom();

  // Read from URL params on mount
  useEffect(() => {
    setFilters({
      roomType: searchParams.get("roomType") || "all",
      availability: searchParams.get("availability") || "all",
      roomId: searchParams.get("roomId") || "all",
    });
    setCurrentPage(parseInt(searchParams.get("page") || "1"));
    setPageSize(parseInt(searchParams.get("pageSize") || "9"));
  }, []);

  // Write to URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add pagination
    params.set("page", currentPage.toString());
    params.set("pageSize", pageSize.toString());

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });

    // Update the URL (shallow = true to avoid full reload)
    router.push(`/dashboard/rooms?${params.toString()}`);
  }, [filters, currentPage, pageSize, router]);

  const handleRoomUpdate = (roomId: string, updatedData: any) => {
    updateRoomMutation.mutate(
      { roomId, roomData: updatedData },
      {
        onSuccess: () => {
          showSuccessToast('Room updated successfully');
        }
      }
    );
  };

  const handleAddRoom = () => {
    setAddRoomDialogOpen(true);
  };


  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      roomType: 'all',
      availability: 'all',
      roomId: 'all',
    });
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (!selectedProperty && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Rooms" subtitle="Room Management" />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Property Selected</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Please select a property to view rooms</p>
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
        <AppHeader title="Rooms" subtitle="Error loading rooms" />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Rooms</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'Rooms could not be loaded'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const rooms = roomsData?.data || [];

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Rooms', url: '/dashboard/rooms' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Rooms"
        subtitle={`${selectedProperty?.name || ''} - Room Management`}    
      />

      <div  className='relative'>
      
      <div className='md:sticky md:top-22 top-16 z-40 md:px-6 px-4 md:py-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex justify-between items-center'>
          <BreadCrumbs items={breadcrumbs} />
          <div className="flex items-center gap-2">
              {rooms.length > 0 && (
                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={toggleFilters}
                    className={`${showFilters ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    <FilterIcon className={showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                  </IconButton>
                </Tooltip>
              )}
              {rooms.length > 0 && (
                <button
                  onClick={handleAddRoom}
                  className="cursor-pointer hidden md:block bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] text-white px-4 py-2"
                >
                  Add Room
                </button>
              )}
          </div>
        </div>
        <div  className={`overflow-hidden transition-all duration-300 ${
          showFilters ? "block max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="bg-white dark:bg-gray-800 mt-4 rounded-lg md:p-4 p-3 mb-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between md:mb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="px-4 py-1 rounded-[30px] cursor-pointer border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:flex gap-4">
               
               <div className="space-y-2 md:w-[150px]">
                 <CustomSelect
                   label="Room Type"
                   value={filters.roomType}
                   onChange={(e: any) => handleFilterChange('roomType', e.target.value)}
                   options={[
                     { value: 'all', label: 'All Types' },
                     { value: 'single', label: 'Single Room' },
                     { value: 'sharing', label: 'Sharing Room' }
                   ]}
                 />
               </div>

               <div className="space-y-2 md:w-[150px]">
                 <CustomSelect
                   label="Availability"
                   value={filters.availability}
                   onChange={(e: any) => handleFilterChange('availability', e.target.value)}
                   options={[
                     { value: 'all', label: 'All Rooms' },
                     { value: 'available', label: 'Available' },
                     { value: 'occupied', label: 'Occupied' }
                   ]}
                 />
               </div>

               <div className="space-y-2 md:w-[150px]">
                 <CustomSelect
                   label="Specific Room"
                   value={filters.roomId}
                   onChange={(e: any) => handleFilterChange('roomId', e.target.value)}
                   options={[
                     { value: 'all', label: 'All Rooms' },
                     ...(allRoomsData?.data?.map((room) => ({
                       value: room._id,
                       label: `Room ${room.roomNo}`
                     })) || [])
                   ]}
                   disabled={isLoadingAllRooms}
                 />
               </div>
            </div>
          </div>
        </div>
      </div>

        {isLoading ? <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading rooms...</p>
              </div>
            </div>
          </div>
        </main>: 
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER + " px-1 md:px-4"}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="md:p-4 p-3">
              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room._id} className="w-full md:h-[555px]">
                    <RoomCard 
                      room={room} 
                      onRoomUpdate={handleRoomUpdate}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {roomsData?.pagination && roomsData.pagination.totalPages > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mt-8">
                  <TablePagination
                    component="div"
                    count={roomsData.total || 0}
                    page={currentPage - 1} // MUI uses 0-based indexing
                    onPageChange={(_, newPage) => setCurrentPage(newPage + 1)} // Convert back to 1-based
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                      const newPageSize = parseInt(e.target.value, 10);
                      setPageSize(newPageSize);
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    rowsPerPageOptions={[9, 18, 36, 72]}
                    labelRowsPerPage="Rooms per page:"
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

              {/* Empty State */}
              {rooms.length === 0 && (
                <div className="text-center py-12">
                  <RoomIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Rooms Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No rooms have been added to this property yet.
                  </p>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-[30px] cursor-pointer"
                    onClick={handleAddRoom}
                  >
                    Add First Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
        }
      </div>

      {/* Add Room Dialog */}
      <Dialog
        open={addRoomDialogOpen}
        onClose={() => setAddRoomDialogOpen(false)}
        sx={{
            // for mobile view
            "@media (max-width: 768px)":{   
                "& .MuiPaper-elevation":{
                    margin:"16px"
                }
            }
        }}
      >
      <RoomCreationForm onClose={() => setAddRoomDialogOpen(false)} />
      </Dialog>

      {/* mobile view float plus icon in the bottom right */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={handleAddRoom}
          className="bg-gray-500 h-12 w-12 flex items-center justify-center hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] text-white px-4 py-2"
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
}

export default function Rooms() {
  return (
    <AuthGuard allowedRoles={['owner', 'admin']}>
      <RoomsContent />
    </AuthGuard>
  );
}
