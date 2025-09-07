'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';

interface Tenant {
  _id: string;
  tenantName: string;
  tenantNumber: string;
  monthlyRent: number;
  checkInDate: string;
}

interface DeleteTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenant: Tenant | null | undefined;
  roomNo?: string; // Optional room number for RoomCard context
  isDeleting: boolean;
}

export default function DeleteTenantDialog({
  open,
  onClose,
  onConfirm,
  tenant,
  roomNo,
  isDeleting,
}: DeleteTenantDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          onClick={onClose} 
          disabled={isDeleting}
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
          This action cannot be undone. The tenant will be permanently removed{roomNo ? ` from ${roomNo}` : ' from the system'}.
        </Alert>
        
        {tenant && (
          <Box>
            <Typography 
              variant="body1" 
              sx={(theme) => ({
                mb: 2,
                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
              })}
            >
              Are you sure you want to delete <strong>{tenant.tenantName}</strong>
              {roomNo ? ` from ${roomNo}` : ''}?
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
                    {tenant.tenantName}
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
                    {tenant.tenantNumber}
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
                    ₹{tenant.monthlyRent}
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
                    {new Date(tenant.checkInDate).toLocaleDateString()}
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
          py: 2, 
          gap: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        })}
      >
        <Button
          onClick={onClose}
          disabled={isDeleting}
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
          onClick={onConfirm}
          disabled={isDeleting}
          sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
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
              backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          })}
        >
          {isDeleting ? (
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
  );
}
