'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AMENITY_OPTIONS, getAmenityIcon, ROOM_TYPE_OPTIONS } from '@/lib/constants/roomConstants';
import CreateTenantForm from '@/components/CreateTenantForm';
import { useMarkTenantAsDeleted } from '@/hooks/useTenants';
import { showSuccessToast } from '@/lib/toast-config';

interface RoomCardProps {
  room: any;
  onRoomUpdate?: (roomId: string, updatedData: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`room-tabpanel-${index}`}
      aria-labelledby={`room-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function RoomCard({ room, onRoomUpdate }: RoomCardProps) {

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [createTenantFormOpen, setCreateTenantFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);
  
  const markTenantAsDeletedMutation = useMarkTenantAsDeleted();
  const [editForm, setEditForm] = useState({
    roomNo: room.roomNo,
    roomType: room.roomType,
    maxCapacity: room.maxCapacity || 2,
    amenities: room.amenities || []
  });

  const handleEditRoom = () => {
    setEditForm({
      roomNo: room.roomNo,
      roomType: room.roomType,
      maxCapacity: room.maxCapacity || 2,
      amenities: room.amenities || []
    });
    setEditDialogOpen(true);
  };

  const handleSaveRoom = () => {
    if (onRoomUpdate) {
      onRoomUpdate(room._id, editForm);
    }
    setEditDialogOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteTenant = (tenant: any) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tenantToDelete) {
      markTenantAsDeletedMutation.mutate(tenantToDelete._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTenantToDelete(null);
        }
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTenantToDelete(null);
  };

  return (
    <>
      <Card className="transition-all duration-300 h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md" sx={{ borderRadius: "20px", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)" }}>
        <CardContent className="p-0 flex flex-col">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <RoomIcon className="text-gray-500 dark:text-gray-400 mr-3 text-3xl" />
                <div>
                  <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
                    Room {room.roomNo}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} Room
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`font-medium shadow-sm rounded-full px-2 py-1 text-sm ${room.isOccupied ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                  {room.isOccupied ? 'Occupied' : 'Available'}
                </div>
                {!room.isOccupied && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateTenantFormOpen(true)}
                    size="small"
                    sx={{
                      backgroundColor: '#059669',
                      '&:hover': {
                        backgroundColor: '#059669',
                      },
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      padding: '4px 12px',
                      minWidth: 'auto',
                    }}
                  >
                    Add Tenant
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={handleEditRoom}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                  title="Edit Room Details"
                >
                  <EditIcon />
                </IconButton>
              </div>
            </div>

            {/* Room Stats - Desktop Only */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center p-4 bg-gradient-to-tr from-blue-50 to-blue-100 dark:from-blue-900/80 dark:to-blue-900/10 rounded-xl shadow-sm">
                <Typography variant="h6" className="font-bold text-blue-700 dark:text-blue-400">
                  {room.maxCapacity}
                </Typography>
                <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                  Max Capacity
                </Typography>
              </div>
              <div className="flex flex-col items-center p-4 bg-gradient-to-tr from-green-50 to-green-100 dark:from-green-900/80 dark:to-green-900/10 rounded-xl shadow-sm">
                <Typography variant="h6" className="font-bold text-green-700 dark:text-green-400 ">
                  {room.tenants.length + (room.upcomingTenants?.length || 0)}
                </Typography>
                <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                  Tenants
                </Typography>
              </div>
              <div className="flex flex-col items-center p-4 bg-gradient-to-tr from-yellow-50 to-yellow-100 dark:from-yellow-900/80 dark:to-yellow-900/10 rounded-xl shadow-sm">
                <Typography variant="h6" className="font-bold text-yellow-700 dark:text-yellow-400">
                  {room.currentMeterReading}
                </Typography>
                <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                  Current Reading
                </Typography>
              </div>
            </div>

            {/* Mobile Stats - Compact */}
            <div className="md:hidden flex justify-between items-center mb-4 text-sm">
              <div className="flex items-center gap-1">
              <span className="text-gray-500">Capacity: </span> 
                <span className="font-semibold text-blue-600 dark:text-blue-400">{room.maxCapacity}</span>
               
              </div>
              <div className="flex items-center gap-1">
              <span className="text-gray-500">Tenants: </span> 
                <span className="font-semibold text-green-600 dark:text-green-400">{room.tenants.length + (room.upcomingTenants?.length || 0)}</span>
                
              </div>
              <div className="flex items-center gap-1">
              <span className="text-gray-500">Reading: </span> 
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{room.currentMeterReading}</span>
                
              </div>
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-1  gap-2">
              <Typography variant="subtitle2" className="font-semibold text-gray-900 dark:text-white mb-2">
                Amenities
              </Typography>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity: string) => (
                  <Chip
                    key={amenity}
                    icon={getAmenityIcon(amenity)}
                    label={amenity.replace('_', ' ').toUpperCase()}
                    size="small"
                    variant="outlined"
                    className="rounded-full text-xs font-medium"
                    sx={{
                      backgroundColor: theme => theme.palette.mode === "dark" 
                        ? "rgba(59, 130, 246, 0.1)" 
                        : "#f8fafc",
                      color: theme => theme.palette.mode === "dark" 
                        ? "#93c5fd" 
                        : "#475569",
                      border: theme => theme.palette.mode === "dark" 
                        ? "1px solid rgba(59, 130, 246, 0.3)" 
                        : "1px solid #e2e8f0",
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: theme => theme.palette.mode === "dark" 
                          ? "rgba(59, 130, 246, 0.2)" 
                          : "#f1f5f9",
                        border: theme => theme.palette.mode === "dark" 
                          ? "1px solid rgba(59, 130, 246, 0.5)" 
                          : "1px solid #cbd5e1",
                      },
                      "& .MuiChip-icon": {
                        color: theme => theme.palette.mode === "dark" 
                          ? "#93c5fd" 
                          : "#64748b",
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="room details tabs"
                variant="fullWidth"
                TabIndicatorProps={{ style: { backgroundColor: "#2563eb", height: "3px", borderRadius: "2px" } }}
              >
                <Tab label={`Tenants (${room.tenants.length + (room.upcomingTenants?.length || 0)})`} />
                <Tab label={`Readings (${room.electricityReadings?.length || 0})`} />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <div className="min-h-[220px]">
              <TabPanel value={tabValue} index={0}>
                {(room.tenants.length > 0 || (room.upcomingTenants?.length || 0) > 0) ? (
                  <List dense>
                    {/* Current Tenants */}
                    {room.tenants.map((tenant: any) => (
                      <ListItem
                        key={tenant._id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <ListItemIcon>
                          <PeopleIcon className="text-blue-500" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {tenant.tenantName}
                              </span>
                              <Chip 
                                label="Current" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            </div>
                          }
                          secondary={
                            <>
                              <span className="block text-sm text-gray-600 dark:text-gray-400">
                                ₹{tenant.monthlyRent} • {tenant.tenantNumber}
                              </span>
                              <span className="block text-xs text-gray-500">
                                Check-in: {new Date(tenant.checkInDate).toLocaleDateString()}
                              </span>
                            </>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTenant(tenant)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Tenant"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                    
                    {/* Upcoming Tenants */}
                    {room.upcomingTenants?.map((tenant: any) => (
                      <ListItem
                        key={tenant._id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <ListItemIcon>
                          <PeopleIcon className="text-orange-500" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {tenant.tenantName}
                              </span>
                              <Chip 
                                label="Upcoming" 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            </div>
                          }
                          secondary={
                            <>
                              <span className="block text-sm text-gray-600 dark:text-gray-400">
                                ₹{tenant.monthlyRent} • {tenant.tenantNumber}
                              </span>
                              <span className="block text-xs text-gray-500">
                                Check-in: {new Date(tenant.checkInDate).toLocaleDateString()}
                              </span>
                            </>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTenant(tenant)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Tenant"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <PeopleIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                      No tenants assigned
                    </Typography>
                  </div>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {room.electricityReadings?.length > 0 ? (
                  <List dense>
                    {room.electricityReadings.map((reading: any) => (
                      <ListItem
                        key={reading._id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <ListItemIcon>
                          <HistoryIcon className="text-yellow-600" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${reading.meterReading} units (${reading.meterReading - reading.previousReading} consumed)`}
                          secondary={
                            <>
                              <span className="block text-sm text-gray-600 dark:text-gray-400">
                                ₹{((reading.meterReading - reading.previousReading) * room.property.electricitySettings.ratePerUnit).toFixed(2)} • {new Date(reading.readingDate).toLocaleDateString()}
                              </span>
                              <span className="block text-xs text-gray-500">
                                Rate: ₹{room.property.electricitySettings.ratePerUnit}/unit • Recorded by: {reading.recordedBy?.name || 'System'}
                              </span>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <HistoryIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                      No electricity readings recorded
                    </Typography>
                  </div>
                )}
              </TabPanel>
            </div>
          </div>
        </CardContent>
      </Card>

{/* edit room details dialog */}
    <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: (theme) => ({
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            })
          }
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
            pb: 2,
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
            backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          })}
        >
          <div style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
            <EditIcon sx={{ marginRight: 1 }} className='text-gray-500 dark:text-gray-400' />
            Edit Room Details
          </div>
          <IconButton onClick={() => setEditDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={(theme) => ({ 
           paddingTop: "24px !important",
           paddingBottom: "24px !important",
           backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#f8fafc',
           overflow: 'auto',
           flex: 1,
           '&::-webkit-scrollbar': {
             width: '6px',
           },
           '&::-webkit-scrollbar-track': {
             background: 'transparent',
           },
           '&::-webkit-scrollbar-thumb': {
             background: theme.palette.mode === 'dark' ? '#4A5568' : '#CBD5E0',
             borderRadius: '3px',
           },
           '&::-webkit-scrollbar-thumb:hover': {
             background: theme.palette.mode === 'dark' ? '#718096' : '#A0AEC0',
           },
         })}
        >
        <div className="space-y-6">
          {/* Room Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="mb-4">Room Information</p>
            <div className="space-y-4 grid grid-cols-2 gap-4">
              <TextField
                label="Room Number"
                value={editForm.roomNo}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, roomNo: e.target.value }))
                }
                fullWidth
              />

              <FormControl fullWidth>  
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={editForm.roomType}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, roomType: e.target.value as string }))
                  }
                  label="Room Type"
                >
                  {ROOM_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Max Capacity"
                type="number"
                value={editForm.maxCapacity}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, maxCapacity: Number(e.target.value) }))
                }
                fullWidth
                inputProps={{ min: 1, max: 10 }}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="mb-4">Amenities</p>
            <FormControl fullWidth>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={editForm.amenities}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, amenities: e.target.value as string[] }))
                }
                input={<OutlinedInput label="Amenities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip
                        key={value}
                        label={value.replace("_", " ").toUpperCase()}
                        size="small"
                        sx={{ borderRadius: "8px" }}
                      />
                    ))}
                  </Box>
                )}
              >
                {AMENITY_OPTIONS.map((amenity) => (
                  <MenuItem key={amenity.value} value={amenity.value}>
                    <Checkbox checked={editForm.amenities.indexOf(amenity.value) > -1} />
                    {amenity.icon}
                    <span style={{ marginLeft: 8 }}>{amenity.label}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={(theme) => ({ 
           px: 3, 
           py: 2, 
           gap: 2,
           backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
           borderTop: theme.palette.mode === 'dark' ? '1px solid #4A5568' : '1px solid #e5e7eb',
           flexShrink: 0,
         })}>
        <button
          onClick={() => setEditDialogOpen(false)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-[30px] text-md font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRoom}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-[30px] text-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <SaveIcon fontSize="small" />
          Save Changes
        </button>
      </DialogActions>
    </Dialog >

      {/* Create Tenant Form */}
     <CreateTenantForm
       open={createTenantFormOpen}
       onClose={() => setCreateTenantFormOpen(false)}
       onSuccess={() => {
         // The room card will automatically update when the tenant is created
         // due to the query invalidation in the useCreateTenant hook
       }}
       defaultRoomId={room._id}
     />

     {/* Delete Tenant Confirmation Dialog */}
     <Dialog
       open={deleteDialogOpen}
       onClose={handleCancelDelete}
       maxWidth="sm"
       fullWidth
       slotProps={{
         paper: {
           sx: (theme) => ({
             borderRadius: '16px',
             backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
             boxShadow: theme.palette.mode === 'dark' 
               ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
               : '0 10px 40px rgba(0, 0, 0, 0.1)',
           })
         }
       }}
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
           variant="h6" 
           sx={(theme) => ({
             fontWeight: 600,
             color: theme.palette.mode === 'dark' ? '#f87171' : '#ef4444',
           })}
         >
           Delete Tenant
         </Typography>
         <IconButton 
           onClick={handleCancelDelete} 
           disabled={markTenantAsDeletedMutation.isPending}
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
           paddingTop:"24px !important",
           backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
         })}
       >
         <Alert 
           severity="warning" 
           sx={(theme) => ({
             mb: 2,
             backgroundColor: theme.palette.mode === 'dark' ? '#451a03' : '#fef3c7',
             color: theme.palette.mode === 'dark' ? '#fbbf24' : '#92400e',
             border: theme.palette.mode === 'dark' ? '1px solid #451a03' : '1px solid #fde68a',
             '& .MuiAlert-icon': {
               color: theme.palette.mode === 'dark' ? '#fbbf24' : '#f59e0b',
             }
           })}
         >
           This action cannot be undone. The tenant will be permanently removed from the room.
         </Alert>
         
         {tenantToDelete && (
           <Box>
             <Typography 
               variant="body1" 
               sx={(theme) => ({
                 mb: 2,
                 color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
               })}
             >
               Are you sure you want to delete <strong>{tenantToDelete.tenantName}</strong> from Room {room.roomNo}?
             </Typography>
             
             <Box 
               sx={(theme) => ({
                 backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f9fafb',
                 borderRadius: '8px',
                 p: 2.5,
                 mt: 3,
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
                 Tenant Details:
               </Typography>
               
               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                 <Box>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                       mb: 1,
                       fontWeight: 500,
                     })}
                   >
                     Name
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                       mb: 2,
                     })}
                   >
                     {tenantToDelete.tenantName}
                   </Typography>
                   
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                       mb: 1,
                       fontWeight: 500,
                     })}
                   >
                     Phone
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                     })}
                   >
                     {tenantToDelete.tenantNumber}
                   </Typography>
                 </Box>
                 
                 <Box>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                       mb: 1,
                       fontWeight: 500,
                     })}
                   >
                     Monthly Rent
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                       mb: 2,
                     })}
                   >
                     ₹{tenantToDelete.monthlyRent}
                   </Typography>
                   
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                       mb: 1,
                       fontWeight: 500,
                     })}
                   >
                     Check-in Date
                   </Typography>
                   <Typography 
                     variant="body2" 
                     sx={(theme) => ({
                       color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                     })}
                   >
                     {new Date(tenantToDelete.checkInDate).toLocaleDateString()}
                   </Typography>
                 </Box>
               </Box>
             </Box>
           </Box>
         )}
       </DialogContent>

       <DialogActions 
         sx={(theme) => ({
           px: 3, 
           pb: 3, 
           gap: 2,
           backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
           borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
         })}
       >
         <Button
           onClick={handleCancelDelete}
           disabled={markTenantAsDeletedMutation.isPending}
           sx={(theme) => ({
             backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
             color: '#ffffff',
             px: 3,
             py: 1.5,
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
           onClick={handleConfirmDelete}
           disabled={markTenantAsDeletedMutation.isPending}
           sx={(theme) => ({
             backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
             color: '#ffffff',
             px: 3,
             py: 1.5,
             borderRadius: '30px',
             fontSize: '0.875rem',
             fontWeight: 500,
             textTransform: 'none',
             transition: 'all 0.2s ease',
             display: 'flex',
             alignItems: 'center',
             gap: 1,
             '&:hover': {
               backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
             },
             '&:disabled': {
               opacity: 0.5,
             }
           })}
         >
           {markTenantAsDeletedMutation.isPending ? (
             <>
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               Deleting...
             </>
           ) : (
             <>
               <DeleteIcon fontSize="small" />
               Delete Tenant
             </>
           )}
         </Button>
       </DialogActions>
     </Dialog>
     </>
   );
 }
