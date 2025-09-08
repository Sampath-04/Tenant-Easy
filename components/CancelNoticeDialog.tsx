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
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { formatDate } from '@/lib/utils/formatters';

interface CancelNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noticeToCancel: any;
  isCancelling: boolean;
}

export default function CancelNoticeDialog({
  open,
  onClose,
  onConfirm,
  noticeToCancel,
  isCancelling,
}: CancelNoticeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={(theme) => ({
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 10px 40px rgba(0, 0, 0, 0.3)'
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
        }
      })}
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
          sx={(theme) => ({
            fontWeight: 600,
            fontSize: '1.25rem',
            color: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
          })}
        >
          Cancel Notice Period
        </Typography>
        <Button
          onClick={onClose}
          disabled={isCancelling}
          sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
            }
          })}
        >
          <CloseIcon />
        </Button>
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
          This action will cancel the notice period for the tenant. This action cannot be undone.
        </Alert>

        {noticeToCancel && (
          <Box>
            <Typography
              variant="body1"
              sx={(theme) => ({
                mb: 2,
                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
              })}
            >
              Are you sure you want to cancel the notice period for <strong>{noticeToCancel.tenant?.tenantName}</strong> in <strong>{noticeToCancel.room?.roomNo}</strong>?
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
                Notice Details:
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
                    Notice Date
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {noticeToCancel.notice?.noticeDate ? formatDate(noticeToCancel.notice.noticeDate) : 'N/A'}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Notice Ends
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                    })}
                  >
                    {noticeToCancel.notice?.noticeEndsOn ? formatDate(noticeToCancel.notice.noticeEndsOn) : 'N/A'}
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
                    Tenant Name
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {noticeToCancel.tenant?.tenantName || 'N/A'}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Room Number
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                    })}
                  >
                    {noticeToCancel.room?.roomNo || 'N/A'}
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
          disabled={isCancelling}
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
          disabled={isCancelling}
          sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
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
              backgroundColor: theme.palette.mode === 'dark' ? '#d97706' : '#d97706',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          })}
        >
          {isCancelling ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Cancelling...
            </>
          ) : (
            <>
              <CancelIcon fontSize="small" />
              Cancel Notice
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
