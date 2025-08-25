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
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRefundsExport } from '@/hooks/useRefunds';
import { formatDate } from '@/lib/utils/formatters';
import * as XLSX from 'xlsx';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';

interface RefundsExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

export default function RefundsExportDialog({
  isOpen,
  onClose,
  propertyId,
}: RefundsExportDialogProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = useRefundsExport();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      return;
    }

    // Check if date range is more than 2 months
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 60) {
      alert('Please select a date range of maximum 2 months (60 days)');
      return;
    }

    setIsExporting(true);

    try {
      const response = await exportMutation.mutateAsync({
        propertyId,
        params: {
          processedAtFrom: startDate.toISOString().split('T')[0],
          processedAtTo: endDate.toISOString().split('T')[0],
        },
      });

      if (response.data && response.data.length > 0) {
        // Prepare data for Excel export
        const excelData = response.data.map((refund: any) => ({
          'Tenant Name': refund.tenant.tenantName,
          'Phone Number': refund.tenant.tenantNumber,
          'Room Number': refund.room.roomNo,
          'Security Deposit': refund.securityDepositPaid,
          'Refund Amount': refund.refundAmount,
          'Electricity Bill': refund.deductions?.electricityBill || 0,
          'Other Deductions': refund.deductions?.otherDeductions || 0,
          'Status': refund.status === 'processed' ? 'Processed' : 'Not Processed',
          'Notice End Date': formatDate(refund.noticeEndsOn),
          'Processed Date': refund.processedAt ? formatDate(refund.processedAt) : '-',
          'Transaction ID': refund.processingProof?.transactionId || '-',
          'Payment Method': refund.processingProof?.paymentMethod || '-',
          'Receipt URL': refund.processingProof?.receiptUrl || '-',
          'Notes': refund.processingProof?.notes || '-',
          'Electricity Units': refund.deductions?.electricityUnits || 0,
          'Processed By': refund.processedBy?.name || '-',
          'Created Date': formatDate(refund.createdAt),
        }));

        // Calculate totals
        const totalRefundAmount = response.data.reduce((sum: number, refund: any) => sum + refund.refundAmount, 0);
        const totalSecurityDeposit = response.data.reduce((sum: number, refund: any) => sum + refund.securityDepositPaid, 0);
        const totalDeductions = response.data.reduce((sum: number, refund: any) => 
          sum + (refund.deductions?.electricityBill || 0) + (refund.deductions?.otherDeductions || 0), 0);

        // Add summary row
        excelData.push({} as any);
        excelData.push({
          'Tenant Name': 'SUMMARY',
          'Phone Number': '',
          'Room Number': '',
          'Security Deposit': totalSecurityDeposit,
          'Refund Amount': totalRefundAmount,
          'Electricity Bill': totalDeductions,
          'Other Deductions': 0,
          'Status': '',
          'Notice End Date': '',
          'Processed Date': '',
          'Transaction ID': '',
          'Payment Method': '',
          'Receipt URL': '',
          'Notes': '',
          'Electricity Units': 0,
          'Processed By': '',
          'Created Date': '',
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = [
          { wch: 15 }, // Tenant Name
          { wch: 15 }, // Phone Number
          { wch: 12 }, // Room Number
          { wch: 15 }, // Security Deposit
          { wch: 15 }, // Refund Amount
          { wch: 15 }, // Electricity Bill
          { wch: 15 }, // Other Deductions
          { wch: 12 }, // Status
          { wch: 15 }, // Notice End Date
          { wch: 15 }, // Processed Date
          { wch: 20 }, // Transaction ID
          { wch: 15 }, // Payment Method
          { wch: 50 }, // Receipt URL
          { wch: 30 }, // Notes
          { wch: 15 }, // Electricity Units
          { wch: 15 }, // Processed By
          { wch: 15 }, // Created Date
        ];
        ws['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Refunds Export');

        // Generate filename
        const startDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        const endDateStr = endDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        const filename = `refunds_export_${startDateStr}_to_${endDateStr}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);

        // Show success message
        const {message, config} = showSuccessToast(`Export completed! Total refunds: ${response.data.length}, Total amount: ₹${totalRefundAmount.toLocaleString()}`);
        toast.success(message, config);
      } else {
        const {message, config} = showErrorToast('No refunds found for the selected date range');
        toast.error(message, config);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  const isExportDisabled = !startDate || !endDate || isExporting;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center gap-3">
          <DownloadIcon className="text-blue-600 dark:text-blue-400" />
          <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
            Export Refunds
          </Typography>
        </div>
        <Button onClick={handleClose} size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent className="p-6">
        <div className="space-y-6">
          <div>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
              Select a date range to export refunds. Maximum range is 2 months (60 days).
            </Typography>
          </div>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                  Start Date *
                </Typography>
                <DatePicker
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Select start date',
                    },
                  }}
                />
              </div>

              <div>
                <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                  End Date *
                </Typography>
                <DatePicker
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Select end date',
                    },
                  }}
                />
              </div>
            </div>
          </LocalizationProvider>

          {exportMutation.isError && (
            <Alert severity="error" className="mt-4">
              {exportMutation.error?.message || 'Failed to export refunds'}
            </Alert>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <Typography variant="subtitle2" className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Export includes:
            </Typography>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Tenant details (name, phone, room)</li>
              <li>• Financial information (security deposit, refund amount)</li>
              <li>• Processing details (transaction ID, payment method, receipt URL)</li>
              <li>• Deductions (electricity bill, units, other deductions)</li>
              <li>• Dates (notice end, processed, created)</li>
              <li>• Summary with totals</li>
            </ul>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="p-6 bg-gray-50 dark:bg-gray-800">
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExportDisabled}
          startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
        >
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
