import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { formatDate } from '@/lib/utils/formatters';
import { generateRefundsExcel } from '@/lib/utils/excelExport';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';

interface RefundsExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  startDate: Date | null;
  endDate: Date | null;
  filters: {
    search: string;
    status: string;
  };
  recordCount: number;
  refundsData: any[];
  statistics: any;
}

export default function RefundsExportDialog({
  isOpen,
  onClose,
  propertyId,
  startDate,
  endDate,
  filters,
  recordCount,
  refundsData,
  statistics,
}: RefundsExportDialogProps) {

  const [isExporting, setIsExporting] = useState(false);

  // const handleExport = async () => {
  //   if (!startDate || !endDate) {
  //     return;
  //   }

  //   // Check if date range is more than 2 months
  //   const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
  //   if (diffDays > 60) {
  //     alert('Please select a date range of maximum 2 months (60 days)');
  //     return;
  //   }

  //   setIsExporting(true);

  //   try {
  //     const response = await exportMutation.mutateAsync({
  //       propertyId,
  //       params: {
  //         processedAtFrom: startDate.toISOString().split('T')[0],
  //         processedAtTo: endDate.toISOString().split('T')[0],
  //       },
  //     });

  //     if (response.data && response.data.length > 0) {
  //       // Prepare data for Excel export
  //       const excelData = response.data.map((refund: any) => ({
  //         'Tenant Name': refund.tenant.tenantName,
  //         'Phone Number': refund.tenant.tenantNumber,
  //         'Room Number': refund.room.roomNo,
  //         'Security Deposit': refund.securityDepositPaid,
  //         'Refund Amount': refund.refundAmount,
  //         'Electricity Bill': refund.deductions?.electricityBill || 0,
  //         'Other Deductions': refund.deductions?.otherDeductions || 0,
  //         'Status': refund.status === 'processed' ? 'Processed' : 'Not Processed',
  //         'Notice End Date': formatDate(refund.noticeEndsOn),
  //         'Processed Date': refund.processedAt ? formatDate(refund.processedAt) : '-',
  //         'Transaction ID': refund.processingProof?.transactionId || '-',
  //         'Payment Method': refund.processingProof?.paymentMethod || '-',
  //         'Receipt URL': refund.processingProof?.receiptUrl || '-',
  //         'Notes': refund.processingProof?.notes || '-',
  //         'Electricity Units': refund.deductions?.electricityUnits || 0,
  //         'Processed By': refund.processedBy?.name || '-',
  //         'Created Date': formatDate(refund.createdAt),
  //       }));

  //       // Calculate totals
  //       const totalRefundAmount = response.data.reduce((sum: number, refund: any) => sum + refund.refundAmount, 0);
  //       const totalSecurityDeposit = response.data.reduce((sum: number, refund: any) => sum + refund.securityDepositPaid, 0);
  //       const totalDeductions = response.data.reduce((sum: number, refund: any) => 
  //         sum + (refund.deductions?.electricityBill || 0) + (refund.deductions?.otherDeductions || 0), 0);

  //       // Add summary row
  //       excelData.push({} as any);
  //       excelData.push({
  //         'Tenant Name': 'SUMMARY',
  //         'Phone Number': '',
  //         'Room Number': '',
  //         'Security Deposit': totalSecurityDeposit,
  //         'Refund Amount': totalRefundAmount,
  //         'Electricity Bill': totalDeductions,
  //         'Other Deductions': 0,
  //         'Status': '',
  //         'Notice End Date': '',
  //         'Processed Date': '',
  //         'Transaction ID': '',
  //         'Payment Method': '',
  //         'Receipt URL': '',
  //         'Notes': '',
  //         'Electricity Units': 0,
  //         'Processed By': '',
  //         'Created Date': '',
  //       });

  //       // Create workbook and worksheet
  //       const wb = XLSX.utils.book_new();
  //       const ws = XLSX.utils.json_to_sheet(excelData);

  //       // Set column widths
  //       const columnWidths = [
  //         { wch: 15 }, // Tenant Name
  //         { wch: 15 }, // Phone Number
  //         { wch: 12 }, // Room Number
  //         { wch: 15 }, // Security Deposit
  //         { wch: 15 }, // Refund Amount
  //         { wch: 15 }, // Electricity Bill
  //         { wch: 15 }, // Other Deductions
  //         { wch: 12 }, // Status
  //         { wch: 15 }, // Notice End Date
  //         { wch: 15 }, // Processed Date
  //         { wch: 20 }, // Transaction ID
  //         { wch: 15 }, // Payment Method
  //         { wch: 50 }, // Receipt URL
  //         { wch: 30 }, // Notes
  //         { wch: 15 }, // Electricity Units
  //         { wch: 15 }, // Processed By
  //         { wch: 15 }, // Created Date
  //       ];
  //       ws['!cols'] = columnWidths;

  //       XLSX.utils.book_append_sheet(wb, ws, 'Refunds Export');

  //       // Generate filename
  //       const startDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  //       const endDateStr = endDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  //       const filename = `refunds_export_${startDateStr}_to_${endDateStr}.xlsx`;

  //       // Download file
  //       XLSX.writeFile(wb, filename);

  //       // Show success message
  //       const {message, config} = showSuccessToast(`Export completed! Total refunds: ${response.data.length}, Total amount: ₹${totalRefundAmount.toLocaleString()}`);
  //       toast.success(message, config);
  //     } else {
  //       const {message, config} = showErrorToast('No refunds found for the selected date range');
  //       toast.error(message, config);
  //     }
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExport = async () => {
    if (!refundsData || refundsData.length === 0) {
      const showToasError = showErrorToast('No refunds data available for export');
      toast.error(showToasError.message, showToasError.config);
      return;
    }


    try {
      setIsExporting(true);
      
      // Use the reusable refunds export function
      await generateRefundsExcel(
        refundsData,
        statistics,
        startDate,
        endDate
      );
      
      const showToasSuccess = showSuccessToast('Refunds exported successfully!');
      toast.success(showToasSuccess.message, showToasSuccess.config);
      
      // Reset states
      handleClose();
      setIsExporting(false);
    } catch (error) {
      console.error('Excel generation error:', error);
      const showToasError = showErrorToast('Failed to generate Excel file');
      toast.error(showToasError.message, showToasError.config);
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isExportDisabled = !refundsData || refundsData.length === 0 || isExporting;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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
            color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
          })}
        >
          Export Refunds
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={isExporting}
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
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body1"
            sx={(theme) => ({
              mb: 2,
              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
            })}
          >
            Export the currently filtered refunds to Excel. The export will include all refunds matching your current filters.
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
              Export Summary:
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Date Range
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {startDate && endDate ? `${formatDate(startDate.toISOString())} to ${formatDate(endDate.toISOString())}` : 'All dates'}
                  </Typography>
                </Box>
              
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Search
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {filters.search || 'None'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                    })}
                  >
                    {filters.status || 'All status'}
                  </Typography>
                </Box>
              </Box>

              {/* vertical divider */}
              <div className="h-full w-px bg-gray-200 dark:bg-gray-700"></div>
              
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                      mb: 1,
                      fontWeight: 500,
                    })}
                  >
                    Records Count
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      mb: 2,
                    })}
                  >
                    {recordCount} records
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
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
            onClick={handleClose}
            disabled={isExporting}
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
          onClick={handleExport}
          disabled={isExportDisabled}
          sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#3b82f6' : '#3b82f6',
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
              backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#2563eb',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          })}
        >
            {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Exporting...
            </>
          ) : (
            <>
              <DownloadIcon fontSize="small" />
              Export to Excel
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
