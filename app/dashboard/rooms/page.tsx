'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useRooms, useUpdateRoom } from '@/hooks/useRooms';
import { RoomCard } from '@/components/RoomCard';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  MeetingRoom as RoomIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import RoomCreationForm from '@/app/components/RoomCreationForm';
import { toast } from 'react-toastify';

function RoomsContent() {
  const { selectedProperty } = useProperty();
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);

  const { 
    data: roomsData, 
    isLoading, 
    error 
  } = useRooms(selectedProperty?.id || '', 1, 50);

  const updateRoomMutation = useUpdateRoom();

  const handleRoomUpdate = (roomId: string, updatedData: any) => {
    updateRoomMutation.mutate(
      { roomId, roomData: updatedData },
      {
        onSuccess: () => {
          toast.success('Room updated successfully');
        }
      }
    );
  };

  const handleAddRoom = () => {
    setAddRoomDialogOpen(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Rooms"
        subtitle={`${selectedProperty?.name || ''} - Room Management`}
        showBackButton
        backHref="/dashboard"
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="md:p-6 p-3">
            {/* Header */}
            <div className="flex md:flex-row flex-col justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage rooms, tenants, and electricity readings
                </p>
              </div>
              <button
                onClick={handleAddRoom}
                className="cursor-pointer hidden md:block bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] text-white px-4 py-2"
              >
                Add Room
              </button>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="w-full h-[575px]">
                  <RoomCard 
                    room={room} 
                    onRoomUpdate={handleRoomUpdate}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {rooms.length === 0 && (
              <div className="text-center py-12">
                <RoomIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Rooms Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No rooms have been added to this property yet.
                </p>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddRoom}
                >
                  Add First Room
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

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
