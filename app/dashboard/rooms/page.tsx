'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useRooms, useUpdateRoom, useRoomList } from '@/hooks/useRooms';
import { RoomCard } from '@/app/components/RoomCard';
import { 
  Button,
  Dialog,
  Pagination,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
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
  const { selectedProperty } = useProperty();
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // Show 8 rooms per page (4 per row * 2 rows)
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Rooms" subtitle="Loading rooms..." />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
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
        </main>
      </div>
    );
  }

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
      
      <div className='sticky top-22 z-40 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
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
        {/* Filters Section */}
        <div  className={`overflow-hidden transition-all duration-300 ${
    showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
  }`}>
          <div className="bg-white dark:bg-gray-800 mt-4 rounded-lg p-4 mb-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <Tooltip title="Clear All Filters">
                <IconButton
                  onClick={handleClearFilters}
                  size="small"
                  className="text-gray-500 hover:text-red-500"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Room Type Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={filters.roomType}
                  onChange={(e) => handleFilterChange('roomType', e.target.value)}
                  label="Room Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="single">Single Room</MenuItem>
                  <MenuItem value="sharing">Sharing Room</MenuItem>
                </Select>
              </FormControl>

              {/* Availability Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>Availability</InputLabel>
                <Select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  label="Availability"
                >
                  <MenuItem value="all">All Rooms</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                </Select>
              </FormControl>

              {/* Room Selection Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>Specific Room</InputLabel>
                <Select
                  value={filters.roomId}
                  onChange={(e) => handleFilterChange('roomId', e.target.value)}
                  label="Specific Room"
                  disabled={isLoadingAllRooms}
                >
                  <MenuItem value="all">All Rooms</MenuItem>
                  {allRoomsData?.data?.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      Room {room.roomNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-1 items-center">
                {filters.roomType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {filters.roomType === 'single' ? 'Single Room' : 'Sharing Room'}
                  </span>
                )}
                {filters.availability !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {filters.availability === 'available' ? 'Available' : 'Occupied'}
                  </span>
                )}
                                      {filters.roomId !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {allRoomsData?.data?.find(r => r._id === filters.roomId)?.roomNo ? `Room ${allRoomsData.data.find(r => r._id === filters.roomId)?.roomNo}` : 'Specific Room'}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="md:p-4 p-3">
            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="w-full h-[555px]">
                  <RoomCard 
                    room={room} 
                    onRoomUpdate={handleRoomUpdate}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {roomsData?.pagination && roomsData.pagination.totalPages > 1 && (
              <Box className="flex flex-col items-center mt-8 gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {roomsData.count} of {roomsData.total} rooms
                  {roomsData.pagination.totalPages > 1 && (
                    <span> • Page {currentPage} of {roomsData.pagination.totalPages}</span>
                  )}
                </div>
                
                {/* Pagination Controls */}
                <Pagination
                  count={roomsData.pagination.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '12px',
                      fontWeight: 500,
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#2563eb',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    },
                  }}
                />
              </Box>
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
    <AuthGuard allowedRoles={['owner']}>
      <RoomsContent />
    </AuthGuard>
  );
}
