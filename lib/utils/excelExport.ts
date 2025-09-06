import * as XLSX from 'xlsx';
import { formatDate, formatCurrency } from './formatters';

export interface RentRecord {
  tenant: {
    tenantName: string;
    tenantNumber: string;
  };
  room: {
    roomNo: string;
    roomType: string;
  };
  startDate: string;
  endDate: string;
  month: string;
  rent: number;
  electricityBill: number;
  electricityUnits: number;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string;
  totalPaidAmount?: number;
  remainingAmount?: number;
  isOverdue: boolean;
  daysOverdue: number;
  lastPaymentDate?: string;
  previousCyclePaymentStatus?: string;
  previousCycleMonth?: string;
  notice?: {
    status: string;
    noticeEndsOn: string;
  } | null;
  paymentTransactions?: Array<{
    amount: number;
    method: string;
    paidAt: string;
    paymentProofs?: string[];
    metadata?: {
      paidTo?: string;
    };
    recordedBy?: {
      name: string;
    };
  }>;
}

export interface RentSummary {
  totalAmount?: number;
  paidCount?: number;
  pendingCount?: number;
  overdueCount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  overdueAmount?: number;
}

export const generateRentHistoryExcel = (
  rentRecords: RentRecord[],
  summary?: RentSummary,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  // Convert rent records data to Excel format
  const excelData = rentRecords.map((record) => {
    // Process payment history
    let paymentHistoryText = '';
    let paidToText = '';
    let amountText = '';

    if (record.paymentTransactions && record.paymentTransactions.length > 0) {
      const paymentDetails = record.paymentTransactions.map((payment) => {
        const proof = payment.paymentProofs ? payment.paymentProofs.join(', ') : '';
        const paidTo = payment.metadata?.paidTo || payment.recordedBy?.name || 'N/A';
        return `${paidTo} - ${payment.amount || 0} - ${proof}`;
      });
      paymentHistoryText = paymentDetails.join('; ');

      // Separate paidTo and amount for individual columns
      const paidToValues = record.paymentTransactions.map((payment) => 
        payment.metadata?.paidTo || payment.recordedBy?.name || 'N/A'
      );
      const amountValues = record.paymentTransactions.map((payment) => payment.amount || 0);
      paidToText = paidToValues.join('; ');
      amountText = amountValues.join('; ');
    }

    return {
      'Tenant Name': record.tenant.tenantName,
      'Phone Number': record.tenant.tenantNumber,
      'Room Number': record.room.roomNo,
      'Room Type': record.room.roomType,
      'Start Date': formatDate(record.startDate),
      'End Date': formatDate(record.endDate),
      'Month': record.month,
      'Rent Amount': record.rent,
      'Electricity Bill': record.electricityBill,
      'Electricity Units': record.electricityUnits,
      'Total Amount': record.totalAmount,
      'Payment Status': record.paymentStatus,
      'Due Date': formatDate(record.dueDate),
      'Total Paid Amount': record.totalPaidAmount || 0,
      'Remaining Amount': record.remainingAmount || 0,
      'Is Overdue': record.isOverdue ? 'Yes' : 'No',
      'Days Overdue': record.daysOverdue,
      'Last Payment Date': record.lastPaymentDate ? formatDate(record.lastPaymentDate) : '',
      'Previous Cycle Payment Status': record.previousCyclePaymentStatus,
      'Previous Cycle Month': record.previousCycleMonth || '',
      'Has Notice': record.notice ? 'Yes' : 'No',
      'Notice Status': record.notice ? record.notice.status : '',
      'Notice End Date': record.notice ? formatDate(record.notice.noticeEndsOn) : '',
      'Paid To': paidToText,
      'Payment Amount': amountText,
      'Payment Method': record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => p.method).join('; ') 
        : '',
      'Payment Date': record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => formatDate(p.paidAt)).join('; ') 
        : '',
      'Recorded By': record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => p.recordedBy?.name || 'N/A').join('; ') 
        : '',
      'Payment History (PaidTo - Amount - Proof)': paymentHistoryText,
    };
  });

  // Create and download Excel file
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Records');

  // Add summary section at the end
  if (summary) {
    const summaryData = [
      { 'Metric': 'SUMMARY', 'Value': '' },
      { 'Metric': 'Total Amount', 'Value': formatCurrency(summary.totalAmount || 0) },
      { 'Metric': 'Paid Count', 'Value': summary.paidCount || 0 },
      { 'Metric': 'Pending Count', 'Value': summary.pendingCount || 0 },
      { 'Metric': 'Overdue Count', 'Value': summary.overdueCount || 0 },
      { 'Metric': 'Paid Amount', 'Value': formatCurrency(summary.paidAmount || 0) },
      { 'Metric': 'Pending Amount', 'Value': formatCurrency(summary.pendingAmount || 0) },
      { 'Metric': 'Overdue Amount', 'Value': formatCurrency(summary.overdueAmount || 0) },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  }

  // Style the headers with bold font and yellow background
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[headerCell]) {
      worksheet[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFFF00' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  // Set column widths
  const columnWidths = Object.keys(worksheet).filter(key => key.startsWith('!') === false).map(key => {
    const cell = worksheet[key];
    return { wch: Math.max(15, cell.v ? cell.v.toString().length : 10) };
  });
  worksheet['!cols'] = columnWidths;

  // Generate filename with current date range
  const startDateStr = startDate ? startDate.toISOString().split('T')[0] : 'N/A';
  const endDateStr = endDate ? endDate.toISOString().split('T')[0] : 'N/A';
  const fileName = `rent-records-${startDateStr}-to-${endDateStr}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};
