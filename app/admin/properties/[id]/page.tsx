'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { usePropertyDetails } from '@/hooks/usePropertyDetails';
import { 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

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
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PropertyDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [tabValue, setTabValue] = useState(0);
  
  // Use React Query to fetch property details
  const { 
    data: property, 
    isLoading: loading, 
    error 
  } = usePropertyDetails(propertyId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Property Details"
          subtitle="Loading property information..."
          showBackButton
          backHref="/admin/properties"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading property details...</p>
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
        <AppHeader
          title="Property Details"
          subtitle="Error loading property"
          showBackButton
          backHref="/admin/properties"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'Property details could not be loaded'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Property Details"
          subtitle="Property not found"
          showBackButton
          backHref="/admin/properties"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Property details could not be loaded</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title={property.propertyName}
        subtitle="Property Management"
        showBackButton
        backHref="/admin/properties"
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md mb-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                    <div className="text-blue-600 mr-3 text-3xl">
                        <i className="fas fa-building"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {property.propertyName}
                        </h2>
                        <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400 text-sm">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {property.propertyAddress}
                        </div>
                    </div>
                    </div>
                    <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                        property.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    >
                    {property.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-b border-gray-200 dark:border-gray-700 py-6">
                    <div>
                    <p className="text-2xl font-bold text-blue-600">
                        {property.occupancyStats.totalRooms}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Total Rooms</p>
                    </div>
                    <div>
                    <p className="text-2xl font-bold text-green-600">
                        {property.occupancyStats.occupiedRooms}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Occupied</p>
                    </div>
                    <div>
                    <p className="text-2xl font-bold text-orange-600">
                        {property.occupancyStats.vacantRooms}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Available</p>
                    </div>
                    <div>
                    <p className="text-2xl font-bold text-purple-600">
                        {property.occupancyStats.occupancyRate}%
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                    </div>
                </div>

                {/* Owner Info */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 space-y-3 md:space-y-0">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <i className="fas fa-user mr-2"></i>
                    Owner: {property.profile.ownerName}
                    </div>
                    <div className="flex items-center space-x-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="fas fa-phone mr-2"></i>
                        {property.profile.contactNumber}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <i className="fas fa-envelope mr-2"></i>
                        {property.profile.email}
                    </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Paper className="shadow-sm">
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                 <Tabs 
                   value={tabValue} 
                   onChange={handleTabChange}
                   className="bg-gray-50 dark:bg-gray-800"
                 >
                   <Tab 
                     label={
                       <div className="flex items-center">
                         <PeopleIcon className="mr-2" />
                         Tenants ({property.occupancyStats.totalTenants})
                       </div>
                     }
                     className="text-gray-700 dark:text-gray-300"
                   />
                   <Tab 
                     label={
                       <div className="flex items-center">
                         <RoomIcon className="mr-2" />
                         Rooms ({property.rooms.length})
                       </div>
                     }
                     className="text-gray-700 dark:text-gray-300"
                   />
                   <Tab 
                     label={
                       <div className="flex items-center">
                         <PersonIcon className="mr-2" />
                         Staff ({property.staff.length})
                       </div>
                     }
                     className="text-gray-700 dark:text-gray-300"
                   />
                 </Tabs>
              </Box>

              {/* Tenants Tab */}
              <TabPanel value={tabValue} index={0}>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Property Tenants
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Tenant
                  </Button>
                </div>

                <TableContainer component={Paper} className="shadow-sm">
                  <Table>
                    <TableHead>
                       <TableRow className="bg-gray-50 dark:bg-gray-800">
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Name</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Contact</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Room No</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Monthly Rent</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Check-in Date</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Status</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {property.rooms.flatMap(room => 
                         room.tenants.map(tenant => ({
                           ...tenant,
                           roomNo: room.roomNo
                         }))
                       ).map((tenant) => (
                         <TableRow key={tenant._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                           <TableCell className="font-medium text-gray-900 dark:text-white">
                             {tenant.tenantName}
                           </TableCell>
                           <TableCell>
                             <div>
                               <div className="text-gray-900 dark:text-white">{tenant.tenantNumber}</div>
                             </div>
                           </TableCell>
                           <TableCell className="font-medium text-gray-900 dark:text-white">
                             {tenant.roomNo}
                           </TableCell>
                           <TableCell className="font-medium text-gray-900 dark:text-white">
                             ₹{tenant.monthlyRent}
                           </TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400">
                             {new Date(tenant.checkInDate).toLocaleDateString()}
                           </TableCell>
                           <TableCell>
                             <div className={`px-3 py-1 text-sm font-medium rounded-full w-24 text-center ${
                                tenant.status === 'onboarded'
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                            }`}>
                                {tenant.status}
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="flex space-x-1">
                               <IconButton size="small" className="text-blue-600">
                                 <EditIcon />
                               </IconButton>
                               <IconButton size="small" className="text-red-600">
                                 <DeleteIcon />
                               </IconButton>
                             </div>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Rooms Tab */}
              <TabPanel value={tabValue} index={1}>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Property Rooms
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Room
                  </Button>
                </div>

                <TableContainer component={Paper} className="shadow-sm">
                  <Table>
                    <TableHead>
                       <TableRow className="bg-gray-50 dark:bg-gray-800">
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Room No</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Type</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Capacity</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Tenants</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Status</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Meter Reading</TableCell>
                         <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableCell>
                       </TableRow>
                     </TableHead>
                            <TableBody>
                                                {property.rooms.map((room) => (
                           <TableRow key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                             <TableCell className="font-medium text-gray-900 dark:text-white">
                               {room.roomNo}
                             </TableCell>
                             <TableCell className="text-gray-600 dark:text-gray-400">
                               {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
                             </TableCell>
                             <TableCell className="text-gray-600 dark:text-gray-400">
                               {room.maxCapacity} person{room.maxCapacity > 1 ? 's' : ''}
                             </TableCell>
                             <TableCell className="text-gray-600 dark:text-gray-400">
                               <div className="flex items-center">
                                 <span className="font-medium text-gray-900 dark:text-white">
                                   {room.tenants.length}
                                 </span>
                                 <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                   / {room.maxCapacity}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell>
                               <Chip
                                 label={room.isOccupied ? 'Occupied' : 'Available'}
                                 color={room.isOccupied ? 'error' : 'success'}
                                 size="small"
                               />
                             </TableCell>
                             <TableCell className="text-gray-600 dark:text-gray-400">
                               {room.currentMeterReading} units
                             </TableCell>
                             <TableCell>
                               <div className="flex space-x-1">
                                 <IconButton size="small" className="text-blue-600">
                                   <EditIcon />
                                 </IconButton>
                                 <IconButton size="small" className="text-red-600">
                                   <DeleteIcon />
                                 </IconButton>
                               </div>
                             </TableCell>
                           </TableRow>
                         ))}
                     </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Staff Tab */}
              <TabPanel value={tabValue} index={2}>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Property Staff
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Staff
                  </Button>
                </div>

                <TableContainer component={Paper} className="shadow-sm">
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Name</TableCell>
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Role</TableCell>
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Contact</TableCell>
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Status</TableCell>
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                                         <TableBody>
                       {property.staff.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400 py-8">
                             No staff members found for this property
                           </TableCell>
                         </TableRow>
                       ) : (
                         property.staff.map((staff: any) => (
                           <TableRow key={staff._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                             <TableCell className="font-medium text-gray-900 dark:text-white">
                               {staff.name}
                             </TableCell>
                             <TableCell className="text-gray-600 dark:text-gray-400">
                               {staff.role}
                             </TableCell>
                             <TableCell>
                               <div>
                                 <div className="text-gray-900 dark:text-white">{staff.phone}</div>
                                 <div className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</div>
                               </div>
                             </TableCell>
                             <TableCell>
                               <Chip
                                 label={staff.status}
                                 color={staff.status === 'active' ? 'success' : 'default'}
                                 size="small"
                               />
                             </TableCell>
                             <TableCell>
                               <div className="flex space-x-1">
                                 <IconButton size="small" className="text-blue-600">
                                   <EditIcon />
                                 </IconButton>
                                 <IconButton size="small" className="text-red-600">
                                   <DeleteIcon />
                                 </IconButton>
                               </div>
                             </TableCell>
                           </TableRow>
                         ))
                       )}
                     </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PropertyDetails() {
  return (
    <AuthGuard>
      <PropertyDetailsContent />
    </AuthGuard>
  );
}
