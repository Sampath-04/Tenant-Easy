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
          const successToast = showSuccessToast('Tenant deleted successfully!');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="transition-all duration-300 h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md" sx={{ borderRadius: "20px", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)" }}>
        <CardContent className="p-0 flex flex-col">
          {/* Header */}
          <div className=" p-4 md:pb-4 pb-0">
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
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
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
                  {room.tenants.length}
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
                <span className="font-semibold text-green-600 dark:text-green-400">{room.tenants.length}</span>
                
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
                <Tab label={`Tenants (${room.tenants.length})`} />
                <Tab label={`Readings (${room.electricityReadings?.length || 0})`} />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <div className="min-h-[220px]">
              <TabPanel value={tabValue} index={0}>
                {room.tenants.length > 0 ? (
                  <List dense>
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
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {tenant.tenantName}
                            </span>
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
                          primary={`${reading.meterReading} units (${reading.consumption} consumed)`}
                          secondary={
                            <>
                              <span className="block text-sm text-gray-600 dark:text-gray-400">
                                ₹{reading.consumption * room.property.electricitySettings.ratePerUnit} • {formatDate(reading._id)}
                              </span>
                              <span className="block text-xs text-gray-500">
                                Rate: ₹{room.property.electricitySettings.ratePerUnit}/unit
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
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
            <EditIcon sx={{ marginRight: 1 }} className='text-gray-500 dark:text-gray-400' />
            Edit Room Details
          </div>
          <IconButton onClick={() => setEditDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{
          paddingBottom: 0, 
          paddingTop: 3,
        }}
        >
        {/* Adding gap using marginBottom */}
        <TextField
          label="Room Number"
          value={editForm.roomNo}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, roomNo: e.target.value }))
          }
          fullWidth
          sx={{ mb: 3, mt: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>  
          <Select
            value={editForm.roomType}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, roomType: e.target.value as string }))
            }
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
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <button
          onClick={() => setEditDialogOpen(false)}
          className='bg-gray-500 cursor-pointer hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] text-white px-4 py-2'
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRoom}
         className=' bg-gray-500 cursor-pointer hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[30px] text-white px-4 py-2'
        >
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
       PaperProps={{
         sx: {
           borderRadius: '16px',
           boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
         }
       }}
     >
       <DialogTitle
         sx={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           borderBottom: '1px solid #e5e7eb',
           pb: 2,
         }}
       >
         <Typography variant="h6" className="font-semibold text-red-600">
           Delete Tenant
         </Typography>
         <IconButton onClick={handleCancelDelete} disabled={markTenantAsDeletedMutation.isPending}>
           <CloseIcon />
         </IconButton>
       </DialogTitle>

       <DialogContent sx={{ pt: 3 }}>
         <Alert severity="warning" sx={{ mb: 2 }}>
           This action cannot be undone. The tenant will be permanently removed from the room.
         </Alert>
         
         {tenantToDelete && (
           <Box>
             <Typography variant="body1" className="mb-2">
               Are you sure you want to delete <strong>{tenantToDelete.tenantName}</strong> from Room {room.roomNo}?
             </Typography>
             
             <Box className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-3">
               <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                 <strong>Tenant Details:</strong>
               </Typography>
               <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                 • Name: {tenantToDelete.tenantName}
               </Typography>
               <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                 • Phone: {tenantToDelete.tenantNumber}
               </Typography>
               <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                 • Monthly Rent: ₹{tenantToDelete.monthlyRent}
               </Typography>
               <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                 • Check-in Date: {new Date(tenantToDelete.checkInDate).toLocaleDateString()}
               </Typography>
             </Box>
           </Box>
         )}
       </DialogContent>

       <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
         <Button
           onClick={handleCancelDelete}
           disabled={markTenantAsDeletedMutation.isPending}
           className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-[30px] text-sm font-medium transition-colors disabled:opacity-50"
         >
           Cancel
         </Button>
         <Button
           onClick={handleConfirmDelete}
           disabled={markTenantAsDeletedMutation.isPending}
           className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-[30px] text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
