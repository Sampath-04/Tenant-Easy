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
  IconButton,
  Theme,
} from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={(theme: Theme) => ({
        '& .MuiDialog-paper': {
          borderRadius: '8px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }
      })}
    >
      <DialogTitle
        sx={(theme: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          pb: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff',
        })}
      >
        <Typography
          sx={(theme: Theme) => ({
            fontWeight: 600,
            fontSize: '1.125rem',
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <WarningIcon 
            sx={{ 
              mr: 1.5, 
              color: '#ef4444',
              fontSize: '1.25rem'
            }} 
          />
          {title}
        </Typography>
        <IconButton 
          onClick={onClose} 
          disabled={isDeleting}
          size="small"
          sx={(theme: Theme) => ({
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
            }
          })}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        sx={(theme: Theme) => ({
          padding: '0px 24px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff',
        })}
      >
        <Box sx={{ textAlign: 'left', marginTop: '10px' }}>
          <Typography
            variant="body1"
            sx={(theme: Theme) => ({
              color: theme.palette.mode === 'dark' ? '#d1d5db' : '#374151',
              mb: 2,
              lineHeight: 1.5,
            })}
          >
            {message}
          </Typography>
          
          <Box
            sx={(theme: Theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f9fafb',
              borderRadius: '6px',
              padding: '12px',
              border: `1px solid ${theme.palette.mode === 'dark' ? '#4b5563' : '#e5e7eb'}`,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            })}
          >
            <Typography
              variant="body2"
              sx={(theme: Theme) => ({
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                mb: 0.5,
              })}
            >
              Item:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#ef4444',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              "{itemName}"
            </Typography>
          </Box>
        
        </Box>
      </DialogContent>

      <DialogActions
        sx={(theme: Theme) => ({
          px: 3,
          py: 2,
          gap: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff',
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
        })}
      >
        <Button
          onClick={onClose}
          disabled={isDeleting}
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
            color: '#ffffff',
            px: 2.5,
            py: 1,
            borderRadius: '6px',
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
          sx={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            px: 2.5,
            py: 1,
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              backgroundColor: '#dc2626',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          {isDeleting ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
