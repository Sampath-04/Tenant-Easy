'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { useTemporaryTenants } from '@/hooks/useTenants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { AppHeader } from '@/components/AppHeader';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import CreateTemporaryTenantForm from '@/components/CreateTemporaryTenantForm';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

function TemporaryTenantsContent() {
  const { selectedProperty } = useProperty();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const { 
    data: temporaryTenantsData, 
    isLoading, 
    error, 
    refetch 
  } = useTemporaryTenants(selectedProperty?.id || '');

  const temporaryTenants = temporaryTenantsData?.data?.tenants || [];
  const handleCreateSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Delete tenant:', selectedTenant);
    setDeleteDialogOpen(false);
    setSelectedTenant(null);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Tenants', url: '/dashboard/tenants' },
    { label: 'Temporary Tenants', url: '/dashboard/tenants/temporary' }
  ];

  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <AppHeader title="Temporary Tenants" />
        <div className="p-6 space-y-6">
          <BreadCrumbs items={breadcrumbItems} />
          <div className="flex justify-between items-center">
            <Typography variant="h4" className="text-2xl font-bold text-gray-900 dark:text-white">
              Temporary Tenants
            </Typography>
            <Skeleton variant="rectangular" width={200} height={40} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={200} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={LAYOUT_CLASSES.MAIN_CONTAINER }>
        <AppHeader title="Temporary Tenants" />
        <div className="p-6 space-y-6">
          <BreadCrumbs items={breadcrumbItems} />
          <Alert severity="error">
            Failed to load temporary tenants. Please try again.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={LAYOUT_CLASSES.MAIN_CONTAINER}>
      <AppHeader title="Temporary Tenants" />
      <div className="p-6 space-y-6">
        <BreadCrumbs items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="text-2xl font-bold text-gray-900 dark:text-white">
              Temporary Tenants
            </Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mt-1">
              Manage temporary tenants with daily rent
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Temporary Tenant
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                    Total Temporary Tenants
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold text-gray-900 dark:text-white">
                    {temporaryTenants.length}
                  </Typography>
                </div>
                <PersonIcon className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                    Active Stays
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold text-gray-900 dark:text-white">
                    {temporaryTenants.filter((t: any) => t.checkOutDate && new Date(t.checkOutDate) > new Date()).length}
                  </Typography>
                </div>
                <CalendarIcon className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                    Total Daily Revenue
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(
                      temporaryTenants.reduce((sum, tenant) => {
                        return sum + (tenant.dailyRent || 0);
                      }, 0)
                    )}
                  </Typography>
                </div>
                <MoneyIcon className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants List */}
        {temporaryTenants.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="text-center py-12">
              <PersonIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                No Temporary Tenants
              </Typography>
              <Typography variant="body2" className="text-gray-500 dark:text-gray-500 mb-4">
                Get started by adding your first temporary tenant
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Temporary Tenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <TableContainer component={Paper} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl border border-white/20 dark:border-gray-700/50">
                <Table>
                  <TableHead>
                    <TableRow className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                        Tenant Details
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                        Room
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                        Daily Rent
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                        Food
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                        Stay Duration
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 dark:text-gray-300" align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {temporaryTenants.map((tenant) => (
                      <TableRow key={tenant._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            Room {tenant.room?.roomNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-semibold text-green-700 dark:text-green-400">
                            {formatCurrency(tenant.dailyRent || 0)}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                            per day
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tenant.foodOpted ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-700' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.foodOpted ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                            {tenant.foodOpted ? 'Yes' : 'No'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                            {formatDate(tenant.checkInDate)} - {tenant.checkOutDate ? formatDate(tenant.checkOutDate.toISOString()) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex flex-row space-x-2 justify-end">
                            <IconButton
                              size="small"
                              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                              onClick={() => handleDeleteClick(tenant)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* Mobile Accordion View */}
            <div className="md:hidden space-y-4">
              {temporaryTenants.map((tenant) => (
                <Accordion key={tenant._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/50">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {tenant.tenantName.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex flex-row items-center gap-2'>
                          <Typography variant="subtitle1" className="font-semibold text-gray-900 dark:text-white">
                            {tenant.tenantName}
                          </Typography>
                          <div className="flex items-center gap-4">
                            <Typography variant="body2" className="text-green-700 dark:text-green-400 font-medium">
                              {formatCurrency(tenant.dailyRent || 0)}/day
                            </Typography>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tenant.foodOpted ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.foodOpted ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                              {tenant.foodOpted ? 'Food' : 'No Food'}
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
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Room
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 dark:text-white font-medium">
                            Room {tenant.room?.roomNo}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Check-in
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 dark:text-white">
                            {formatDate(tenant.checkInDate)}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Check-out
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 dark:text-white">
                            {tenant.checkOutDate ? formatDate(tenant.checkOutDate.toString()) : 'N/A'}
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

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(tenant)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </>
        )}

        {/* Create Temporary Tenant Dialog */}
        <CreateTemporaryTenantForm
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle className="flex items-center">
            <WarningIcon className="mr-2 text-red-500" />
            Delete Temporary Tenant
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedTenant?.tenantName}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default function TemporaryTenantsPage() {
  return (
    <AuthGuard allowedRoles={['admin', 'owner']}>
      <TemporaryTenantsContent />
    </AuthGuard>
  );
}
