'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Home as HomeIcon } from '@mui/icons-material';
import { useProperty } from '@/contexts/PropertyContext';
import { useActiveRooms } from '@/hooks/useRooms';
import { useProperties } from '../hooks/useProperties';
import { toast } from 'react-toastify';

interface MoveTenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCallback?: (data: {
    tenantId: string;
    newRoomId: string;
    electricityReadings: {
      currentRoomReading: number;
      newRoomReading: number;
    };
  }) => Promise<void>;
  tenant?: any;
  isSubmitting?: boolean;
}

export default function MoveTenantForm({
  isOpen,
  onClose,
  onSubmitCallback,
  tenant,
  isSubmitting = false,
}: MoveTenantFormProps) {
  const { selectedProperty } = useProperty();
  const { data: properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { data: rooms, isLoading: roomsLoading } = useActiveRooms(selectedPropertyId);
  
  const [formData, setFormData] = useState({
    newRoomId: '',
    currentRoomReading: 0,
    newRoomReading: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        newRoomId: '',
        currentRoomReading: 0,
        newRoomReading: 0,
      });
      setErrors({});
      setSelectedPropertyId(selectedProperty?.id || '');
    }
  }, [isOpen, selectedProperty?.id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPropertyId) {
      newErrors.propertyId = 'Please select a property';
    }

    if (!formData.newRoomId) {
      newErrors.newRoomId = 'Please select a room';
    }

    if (formData.currentRoomReading < 0) {
      newErrors.currentRoomReading = 'Current room reading cannot be negative';
    }

    if (formData.newRoomReading < 0) {
      newErrors.newRoomReading = 'New room reading cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!tenant?.id) {
      toast.error('Tenant information not available');
      return;
    }

    try {
      if (onSubmitCallback) {
        await onSubmitCallback({
          tenantId: tenant.id,
          newRoomId: formData.newRoomId,
          electricityReadings: {
            currentRoomReading: formData.currentRoomReading,
            newRoomReading: formData.newRoomReading,
          },
        });
      }

      // Reset form
      setFormData({
        newRoomId: '',
        currentRoomReading: 0,
        newRoomReading: 0,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to move tenant:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Filter out current room
  const availableRooms = rooms?.data?.filter(room => room._id !== tenant?.roomId && !room.isOccupied && room.isActive) || [];

  

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={(theme) => ({
        "& .MuiPaper-root": {
          margin: { xs: '0px', md: '32px' },
          width: { xs: '90%', md: '100%' },
        },
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 600px)': {
            maxHeight: '95vh',
          }
        },
      })}
    >
      <DialogTitle
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          pb: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          padding: {xs: "8px 16px", sm: "16px 24px"},
        })}
      >
        <div className="flex items-center gap-3">
          <HomeIcon className="text-blue-500" />
          <p className="md:text-xl text-base font-semibold text-gray-900 dark:text-white">Move Tenant</p>
        </div>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={(theme) => ({
        flex: 1,
        overflow: 'auto',
        padding: {xs: '12px!important', md: '24px'},
        // paddingTop: {xs: '8px!important', md: '24px!important'},
        backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f1f5f9',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? '#6b7280' : '#cbd5e1',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#9ca3af' : '#94a3b8',
          },
        },
      })}>
        <form onSubmit={handleSubmit} className="md:space-y-6 space-y-4">
          {/* Current Room Info */}
          {tenant && (
            <div className="bg-blue-50 dark:bg-blue-900/20 md:p-4 p-2 rounded-xl border border-blue-200 dark:border-blue-800 flex md:grid items-center gap-2">
              <p className="text-base font-medium text-blue-800 dark:text-blue-200 mb-1">Current Room</p>
              <p className="md:text-lg text-base md:font-semibold text-blue-900 dark:text-blue-100">
                {tenant.room.roomNo} - {tenant.room.roomType}
              </p>
            </div>
          )}

          {/* Property Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Select Property *
            </label>
            <FormControl fullWidth error={!!errors.propertyId}>
              <InputLabel>Choose Property</InputLabel>
              <Select
                value={selectedPropertyId || ''}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setFormData(prev => ({ ...prev, newRoomId: '' })); // Reset room selection
                }}
                label="Choose Property"
                sx={(theme) => ({
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    '& fieldset': {
                      borderColor: errors.propertyId 
                        ? '#ef4444' 
                        : theme.palette.mode === 'dark' ? '#4b5563' : '#e2e8f0',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: errors.propertyId 
                        ? '#dc2626' 
                        : theme.palette.mode === 'dark' ? '#6b7280' : '#cbd5e1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: errors.propertyId ? '#dc2626' : '#3b82f6',
                      boxShadow: errors.propertyId 
                        ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                        : '0 0 0 4px rgba(59, 130, 246, 0.2)',
                    },
                  },
                  '& .MuiSelect-select': {
                    color: theme.palette.mode === 'dark' ? '#f9fafb' : '#374151',
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                    '&.Mui-focused': {
                      color: errors.propertyId ? '#ef4444' : '#3b82f6',
                    },
                  },
                })}
              >
                {properties?.map((property: any) => (
                  <MenuItem key={property._id} value={property._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{property.propertyName}</span>
                      <span className="text-sm text-gray-500">{property.propertyAddress}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.propertyId && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.propertyId}
              </p>
            )}
          </div>

          {/* New Room Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Select New Room *
            </label>
            <FormControl fullWidth error={!!errors.newRoomId}>
              <InputLabel>Choose Room</InputLabel>
              <Select
                value={formData.newRoomId || ''}
                onChange={(e) => handleInputChange('newRoomId', e.target.value)}
                label="Choose Room"
                disabled={roomsLoading || !selectedPropertyId}
                sx={(theme) => ({
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    '& fieldset': {
                      borderColor: errors.newRoomId 
                        ? '#ef4444' 
                        : theme.palette.mode === 'dark' ? '#4b5563' : '#e2e8f0',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: errors.newRoomId 
                        ? '#dc2626' 
                        : theme.palette.mode === 'dark' ? '#6b7280' : '#cbd5e1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: errors.newRoomId ? '#dc2626' : '#3b82f6',
                      boxShadow: errors.newRoomId 
                        ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                        : '0 0 0 4px rgba(59, 130, 246, 0.2)',
                    },
                  },
                  '& .MuiSelect-select': {
                    color: theme.palette.mode === 'dark' ? '#f9fafb' : '#374151',
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                    '&.Mui-focused': {
                      color: errors.newRoomId ? '#ef4444' : '#3b82f6',
                    },
                  },
                })}
              >
                {availableRooms.map((room) => (
                  <MenuItem key={room._id} value={room._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{room.roomNo} - {room.roomType}</span>
                      <span className="text-sm text-gray-500">
                        {room.tenants?.length || 0} tenant(s) • ₹{room.property?.electricitySettings?.ratePerUnit || 'N/A'}/unit
                      </span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.newRoomId && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.newRoomId}
              </p>
            )}
            {roomsLoading && selectedPropertyId && (
              <p className="text-sm text-gray-500">Loading available rooms...</p>
            )}
            {!selectedPropertyId && (
              <p className="text-sm text-gray-500">Please select a property first</p>
            )}
          </div>

          {/* Electricity Readings */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2">
            {/* Current Room Electricity Reading */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Current Room Electricity Reading *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-2xl text-slate-500 dark:text-slate-400">⚡</span>
                </div>
                <input
                  type="number"
                  value={formData.currentRoomReading || 0}
                  onChange={(e) => handleInputChange('currentRoomReading', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                    errors.currentRoomReading 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                  }`}
                  placeholder="0"
                  min="0"
                />
              </div>
              {tenant?.room?.currentMeterReading && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Previous reading: {tenant.room.currentMeterReading} units
                </p>
              )}
              {errors.currentRoomReading && (
                <p className="text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.currentRoomReading}
                </p>
              )}
            </div>

            {/* New Room Electricity Reading */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                New Room Electricity Reading *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-2xl text-slate-500 dark:text-slate-400">⚡</span>
                </div>
                <input
                  type="number"
                  value={formData.newRoomReading || 0}
                  onChange={(e) => handleInputChange('newRoomReading', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                    errors.newRoomReading 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                  }`}
                  placeholder="0"
                  min="0"
                />
              </div>
              {formData.newRoomId && availableRooms.find(room => room._id === formData.newRoomId)?.currentMeterReading && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Previous reading: {availableRooms.find(room => room._id === formData.newRoomId)?.currentMeterReading} units
                </p>
              )}
              {errors.newRoomReading && (
                <p className="text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.newRoomReading}
                </p>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      <DialogActions sx={(theme) => ({
        padding: {xs: '12px!important', md: '24px'},
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
        gap: '12px',
        '@media (max-width: 600px)': {
          justifyContent: 'center',
          gap: '8px',
          padding: '16px',
        }
      })}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#374151',
            backgroundColor: 'transparent',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db'}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(75, 85, 99, 0.1)' : 'rgba(107, 114, 128, 0.04)',
              borderColor: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
            },
            '&:disabled': {
              opacity: 0.5,
              color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
              borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
            },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: {xs: '10px 14px', md: '10px 20px'},
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.newRoomId || !formData.currentRoomReading || !formData.newRoomReading}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <HomeIcon />}
          sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#3b82f6' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#1d4ed8',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                : '0 4px 12px rgba(37, 99, 235, 0.3)',
            },
            '&:disabled': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#9ca3af',
              color: theme.palette.mode === 'dark' ? '#6b7280' : '#ffffff',
              boxShadow: 'none',
            },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: {xs: '10px 14px', md: '10px 20px'},
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          })}
        >
          {isSubmitting ? 'Moving Tenant...' : 'Move Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
