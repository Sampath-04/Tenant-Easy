'use client';

import { useEffect, useState } from 'react';
import { AuthGuard, useAuth } from '../../../../contexts/AuthContext';
import { useProperty } from '../../../../contexts/PropertyContext';
import { useRecordElectricityReading } from '../../../../hooks/useElectricityReadings';
import { useRooms } from '../../../../hooks/useRooms';
import { AppHeader } from '../../../../components/AppHeader';
import NumberInput from '../../../../components/ui/NumberInput';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ElectricBolt as ElectricBoltIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CustomSelect from '@/components/ui/CustomSelect';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { formatDate, getCurrentDate } from '@/lib/utils/formatters';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

interface RoomReadingState {
  [roomId: string]: {
    meterReading: number;
    isRecorded: boolean;
    isEditing: boolean;
    recordedData?: any;
  };
}

function ElectricityReadingContent() {
  const { user } = useAuth();
  const { selectedProperty } = useProperty();
  const [roomReadings, setRoomReadings] = useState<RoomReadingState>({});
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  const { data: roomsResponse, isLoading: roomsLoading, error: roomsError } = useRooms(
    selectedProperty?.id || '',
    1,
    50,
    {
      roomId: selectedRoomId
    }
  );

  const { data: allRoomsResponse, isLoading: allRoomsLoading, error: allRoomsError } = useRooms(
    selectedProperty?.id || '',
    1,
    1000
  );
  
  const recordReadingMutation = useRecordElectricityReading();

  const handleReadingChange = (roomId: string, value: number) => {
    setRoomReadings(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        meterReading: value,
      }
    }));
  };

  const handleRecordReading = async (roomId: string) => {
    if (!selectedProperty || !user) return;
    const reading = roomReadings[roomId];
    if (!reading || reading.meterReading <= 0) {
      const errorToast = showErrorToast('Please enter a valid meter reading');
      toast.error(errorToast.message, errorToast.config);
      return;
    }
    try {
      const response = await recordReadingMutation.mutateAsync({
        property: selectedProperty.id,
        room: roomId,
        meterReading: reading.meterReading,
        recordedBy: {
          name: user.name || 'Unknown'
        }
      });
      // Update local state to show recorded status
      setRoomReadings(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          isRecorded: true,
          isEditing: false,
          recordedData: response.data
        }
      }));

      const successToast = showSuccessToast('Electricity reading recorded successfully!');
      toast.success(successToast.message, successToast.config);
    } catch (error) {
      console.error('Failed to record reading:', error);
      const errorToast = showErrorToast('Failed to record electricity reading');
      toast.error(errorToast.message, errorToast.config);
    }
  };

  const handleEditReading = (roomId: string) => {
    setRoomReadings(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isEditing: true,
      }
    }));
  };

  const handleSaveEdit = async (roomId: string) => {
    await handleRecordReading(roomId);
  };

  const handleCancelEdit = (roomId: string) => {
    setRoomReadings(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isEditing: false,
      }
    }));
  };

  // Reset selected room when property changes
  useEffect(() => {
    setSelectedRoomId('all');
  }, [selectedProperty?.id]);

  useEffect(() => {
    if (roomsResponse) {
      const rooms = roomsResponse.data;

      // check each room has a recording today if yes initialize the roomReadings with the recorded data
      const roomReadingsObj: RoomReadingState = {};
      
      rooms.forEach(room => {
        const currentDate = getCurrentDate();
        const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const recording = room.electricityReadings?.find((reading: any) => reading.readingDate.split('T')[0] === today);
        if (recording && !recording.isAutoRecorded) {
          
          roomReadingsObj[room._id] = {
            meterReading: recording.meterReading,
            isRecorded: true,
            isEditing: false,
            recordedData: recording
          };
        } else {
          roomReadingsObj[room._id] = {
            meterReading: 0,
            isRecorded: false,
            isEditing: false
          };
        }
      });
      
      setRoomReadings(roomReadingsObj);
    }
  }, [roomsResponse]);

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Electricity Readings" subtitle="Record meter readings for all rooms" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert severity="info">Please select a property to view rooms</Alert>
        </main>
      </div>
    );
  }

  if (roomsLoading || allRoomsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Electricity Readings" subtitle="Record meter readings for all rooms" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <CircularProgress />
          </div>
        </main>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader title="Electricity Readings" subtitle="Record meter readings for all rooms" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert severity="error">Failed to load rooms. Please try again.</Alert>
        </main>
      </div>
    );
  }

  const rooms = roomsResponse?.data || [];

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Electricity Readings', url: '/dashboard/electricity/take-reading' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader title="Electricity Readings" subtitle="Record meter readings for all rooms" />
      <BreadCrumbs items={breadcrumbs} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
    
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-8"> 
            <Card sx={{ borderRadius: '16px', boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px' }}>
            <CardContent>
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                <ElectricBoltIcon className="text-blue-600 dark:text-blue-400" />
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    {selectedProperty.name}
                </Typography>
                </div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                {selectedProperty.address}
                </Typography>
                <div className="mt-3">
                <Chip 
                    label={`${rooms.length} Total Rooms`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                />
                </div>
            </CardContent>
            </Card>

            {/* Summary */}
            {rooms.length > 0 && (
                <Card sx={{ borderRadius: '16px', boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px' }}>
                    <CardContent>
                    <p className="font-semibold text-gray-900 dark:text-white mb-3 text-xl">
                        Summary {selectedRoomId !== 'all' && `- Filtered`}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-2xl">
                            {rooms.length}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {selectedRoomId === 'all' ? 'Total Rooms' : 'Filtered Rooms'}
                        </p>
                        </div>
                        <div className="text-center">
                        <p className="font-bold text-green-600 dark:text-green-400 text-2xl">
                            {Object.values(roomReadings).filter(r => r.isRecorded).length}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Recorded
                        </p>
                        </div>
                        <div className="text-center">
                        <p className="font-bold text-orange-600 dark:text-orange-400 text-2xl">
                            {Object.values(roomReadings).filter(r => !r.isRecorded).length}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pending
                        </p>
                        </div>
                        <div className="text-center">
                        <p className="font-bold text-purple-600 dark:text-purple-400 text-2xl">
                            {rooms.reduce((total, room) => total + (room.tenants?.length || 0), 0)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Total Tenants
                        </p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Rooms List */}
        <div className="space-y-2 md:space-y-4">
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-col gap-2'>
                <p className="font-semibold text-gray-900 dark:text-white text-xl">
                Room Electricity Readings
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Date: {formatDate(getCurrentDate().toISOString())}
                </p>
            </div>
            {/*  room filter */}
            <div className='flex flex-row gap-2 items-center'>
                <CustomSelect
                    options={[
                        { label: 'All Rooms', value: 'all' },
                        ...(allRoomsResponse?.data || []).map((room) => ({
                            label: `Room ${room.roomNo} - ${room.roomType}`,
                        value: room._id
                        }))
                    ]}
                    onChange={(e: any) => {
                        setSelectedRoomId(e.target.value);
                    }}
                    label=""
                    value={selectedRoomId}
                />
            </div>
          </div>

          {rooms.length === 0 ? (
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No rooms found for this property
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                rooms.map((room) => {
                    const roomReading = roomReadings[room._id] || {
                        meterReading: 0,
                        isRecorded: false,
                        isEditing: false
                    };
        
                    return (
                        <Card 
                        key={room._id} 
                        sx={{ 
                            borderRadius: '16px', 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: roomReading.isRecorded ? '2px solid #10b981' : '1px solid gray',
                        }}
                        >
                        <CardContent sx={{height: '100%'}}>
                            <div className="flex flex-col lg:justify-between gap-4 h-full">
                            {/* Room Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                                    Room {room.roomNo}
                                </Typography>
                                <Chip 
                                    label={room.roomType} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderColor: '#3b82f6',
                                    color: '#3b82f6'
                                    }}
                                />
                                {roomReading.isRecorded && (
                                    <Chip 
                                    label="Recorded" 
                                    size="small" 
                                    color="success"
                                    icon={<CheckIcon />}
                                    />
                                )}
                                </div>
        
                                {/* Previous Reading */}
                                <div className="mb-3">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Previous Reading: <span className="font-semibold">{ roomReading.isRecorded ? (room.electricityReadings?.[1]?.meterReading || 0) : room.currentMeterReading || 0}</span>
                                </p>
                                </div>
        
                                {/* Tenants */}
                                {room.tenants && room.tenants.length > 0 && (
                                <div className="mb-3 flex items-center gap-2">
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                                    Tenants:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                    {room.tenants.map((tenant, index) => (
                                        <Chip
                                        key={tenant._id}
                                        label={tenant.tenantName}
                                        size="small"
                                        icon={<PersonIcon />}
                                        variant="outlined"
                                        sx={{ 
                                            backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                            borderColor: '#9ca3af',
                                            color: '#6b7280'
                                        }}
                                        />
                                    ))}
                                    </div>
                                </div>
                                )}
        
                                {/* Recorded Data Display */}
                                {roomReading.isRecorded && roomReading.recordedData && !roomReading.isEditing && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
                                    <p className="text-green-700 dark:text-green-400 font-semibold mb-1">
                                    Reading Recorded Successfully
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Current Reading:</span>
                                        <span className="font-semibold ml-1">{roomReading.recordedData?.meterReading || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Consumption:</span>
                                        <span className="font-semibold ml-1">{roomReading.recordedData?.consumption || 0} units</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Total Tenants:</span>
                                        <span className="font-semibold ml-1">{roomReading.recordedData.totalTenantsPresent || room.tenants?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Cost per Tenant:</span>
                                        <span className="font-semibold ml-1 text-blue-600 dark:text-blue-400">
                                            ₹{roomReading.recordedData.consumptionCostPerTenant || roomReading.recordedData.perTenantCost || 0}
                                        </span>
                                    </div>
                                    </div>
                                </div>
                                )}
                            </div>
        
                            {/* Reading Input and Actions */}
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                {!roomReading.isRecorded || roomReading.isEditing ? (
                                <>
                                    <NumberInput
                                    label="Current Reading"
                                    value={roomReading.meterReading}
                                    onChange={(value) => handleReadingChange(room._id, value || 0)}
                                    placeholder="Enter meter reading"
                                    disabled={recordReadingMutation.isPending}
                                    />
                                    
                                    <div className="flex gap-2">
                                    {roomReading.isEditing ? (
                                        <>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleSaveEdit(room._id)}
                                            disabled={recordReadingMutation.isPending}
                                            sx={{ 
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            backgroundColor: '#10b981',
                                            '&:hover': { backgroundColor: '#059669' }
                                            }}
                                        >
                                            {recordReadingMutation.isPending ? <CircularProgress size={16} /> : 'Save'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleCancelEdit(room._id)}
                                            disabled={recordReadingMutation.isPending}
                                            sx={{ 
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderColor: '#6b7280',
                                            color: '#6b7280'
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        </>
                                    ) : (
                                        <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleRecordReading(room._id)}
                                        disabled={recordReadingMutation.isPending || roomReading.meterReading <= 0}
                                        sx={{ 
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            backgroundColor: '#3b82f6',
                                            '&:hover': { backgroundColor: '#2563eb' }
                                        }}
                                        >
                                        {recordReadingMutation.isPending ? <CircularProgress size={16} /> : 'Record Reading'}
                                        </Button>
                                    )}
                                    </div>
                                </>
                                ) : (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleEditReading(room._id)}
                                    sx={{ 
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    borderColor: '#f59e0b',
                                    color: '#f59e0b',
                                    '&:hover': { 
                                        borderColor: '#d97706',
                                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
                                    }
                                    }}
                                >
                                    Edit Reading
                                </Button>
                                )}
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                    );
                    })
                }
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function ElectricityReadingPage() {
  return (
    <AuthGuard allowedRoles={['owner', 'staff']}>
      <ElectricityReadingContent />
    </AuthGuard>
  );
}
