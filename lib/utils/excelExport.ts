import ExcelJS from 'exceljs';
import { formatDate, formatCurrency, formatDateToYYYYMMDD } from './formatters';

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

export const generateRentHistoryExcel = async (
  rentRecords: RentRecord[],
  summary?: RentSummary,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rent Records');

  // Define columns with proper headers and widths
  worksheet.columns = [
    { header: 'Tenant Name', key: 'tenantName', width: 25 },
    { header: 'Phone Number', key: 'phoneNumber', width: 20 },
    { header: 'Room Number', key: 'roomNumber', width: 15 },
    { header: 'Room Type', key: 'roomType', width: 18 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Month', key: 'month', width: 18 },
    { header: 'Rent Amount', key: 'rentAmount', width: 15 },
    { header: 'Electricity Bill', key: 'electricityBill', width: 18 },
    { header: 'Electricity Units', key: 'electricityUnits', width: 18 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Payment Status', key: 'paymentStatus', width: 18 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Total Paid Amount', key: 'totalPaidAmount', width: 20 },
    { header: 'Remaining Amount', key: 'remainingAmount', width: 20 },
    { header: 'Is Overdue', key: 'isOverdue', width: 15 },
    { header: 'Days Overdue', key: 'daysOverdue', width: 15 },
    { header: 'Last Payment Date', key: 'lastPaymentDate', width: 20 },
    { header: 'Previous Cycle Payment Status', key: 'previousCyclePaymentStatus', width: 30 },
    { header: 'Previous Cycle Month', key: 'previousCycleMonth', width: 25 },
    { header: 'Has Notice', key: 'hasNotice', width: 15 },
    { header: 'Notice Status', key: 'noticeStatus', width: 18 },
    { header: 'Notice End Date', key: 'noticeEndDate', width: 20 },
    { header: 'Paid To', key: 'paidTo', width: 25 },
    { header: 'Payment Amount', key: 'paymentAmount', width: 18 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Payment Date', key: 'paymentDate', width: 18 },
    { header: 'Recorded By', key: 'recordedBy', width: 20 },
    { header: 'Payment History', key: 'paymentHistory', width: 60 },
  ];

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background
    };
    cell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: false, // Disable text wrapping for headers
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows
  rentRecords.forEach((record) => {
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

    const row = worksheet.addRow({
      tenantName: record.tenant.tenantName,
      phoneNumber: record.tenant.tenantNumber,
      roomNumber: record.room.roomNo,
      roomType: record.room.roomType,
      startDate: formatDate(record.startDate),
      endDate: formatDate(record.endDate),
      month: record.month,
      rentAmount: record.rent,
      electricityBill: record.electricityBill,
      electricityUnits: record.electricityUnits,
      totalAmount: record.totalAmount,
      paymentStatus: record.paymentStatus,
      dueDate: formatDate(record.dueDate),
      totalPaidAmount: record.totalPaidAmount || 0,
      remainingAmount: record.remainingAmount || 0,
      isOverdue: record.isOverdue ? 'Yes' : 'No',
      daysOverdue: record.daysOverdue,
      lastPaymentDate: record.lastPaymentDate ? formatDate(record.lastPaymentDate) : '',
      previousCyclePaymentStatus: record.previousCyclePaymentStatus,
      previousCycleMonth: record.previousCycleMonth || '',
      hasNotice: record.notice ? 'Yes' : 'No',
      noticeStatus: record.notice ? record.notice.status : '',
      noticeEndDate: record.notice ? formatDate(record.notice.noticeEndsOn) : '',
      paidTo: paidToText,
      paymentAmount: amountText,
      paymentMethod: record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => p.method).join('; ') 
        : '',
      paymentDate: record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => formatDate(p.paidAt)).join('; ') 
        : '',
      recordedBy: record.paymentTransactions && record.paymentTransactions.length > 0 
        ? record.paymentTransactions.map(p => p.recordedBy?.name || 'N/A').join('; ') 
        : '',
      paymentHistory: paymentHistoryText,
    });

    // Style data cells
    row.eachCell((cell, colNumber) => {
      // Special handling for payment history column (last column)
      const isPaymentHistory = colNumber === 29; // Payment History is the 29th column
      
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false,
      };
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });

  // Add summary worksheet if provided
  if (summary) {
    const summaryWorksheet = workbook.addWorksheet('Summary');
    
    summaryWorksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    // Style summary header
    const summaryHeaderRow = summaryWorksheet.getRow(1);
    summaryHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

    // Add summary data
    const summaryData = [
      { metric: 'SUMMARY', value: '' },
      { metric: 'Total Amount', value: formatCurrency(summary.totalAmount || 0) },
      { metric: 'Paid Count', value: summary.paidCount || 0 },
      { metric: 'Pending Count', value: summary.pendingCount || 0 },
      { metric: 'Overdue Count', value: summary.overdueCount || 0 },
      { metric: 'Paid Amount', value: formatCurrency(summary.paidAmount || 0) },
      { metric: 'Pending Amount', value: formatCurrency(summary.pendingAmount || 0) },
      { metric: 'Overdue Amount', value: formatCurrency(summary.overdueAmount || 0) },
    ];

    summaryData.forEach((item) => {
      const row = summaryWorksheet.addRow(item);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    });
  }

  // Generate filename with current date range
  const currentDate = formatDateToYYYYMMDD(new Date()); // Use existing formatter
  
  let fileName: string;
  if (startDate && endDate) {
    // Both dates are selected - use existing formatDate function
    const startDateStr = formatDate(startDate.toISOString());
    const endDateStr = formatDate(endDate.toISOString());
    fileName = `rent-records-(${startDateStr} to ${endDateStr})_${currentDate}.xlsx`;
  } else {
    // No date range selected, use current date only
    fileName = `rent-records-${currentDate}.xlsx`;
  }
  
  // Write the file
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  });
  
  return fileName;
};

// Tenant Analysis Export Function
export const generateTenantAnalysisExcel = async (
  tenantAnalysisData: any[],
  summaryData: any
) => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Create Tenant Analysis sheet
  const analysisSheet = workbook.addWorksheet('Tenant Analysis');
  
  // Define columns for Tenant Analysis
  analysisSheet.columns = [
    { header: 'Tenant Name', key: 'tenantName', width: 25 },
    { header: 'Phone Number', key: 'tenantNumber', width: 18 },
    { header: 'Room No', key: 'roomNo', width: 12 },
    { header: 'Room Type', key: 'roomType', width: 15 },
    { header: 'Monthly Rent', key: 'monthlyRent', width: 18 },
    { header: 'Security Deposit Total', key: 'securityDepositTotal', width: 25 },
    { header: 'Security Deposit Paid', key: 'securityDepositPaid', width: 25 },
    { header: 'Security Deposit Balance', key: 'securityDepositBalance', width: 28 },
    { header: 'Check-in Date', key: 'checkInDate', width: 18 },
    { header: 'Tenure (Months)', key: 'tenureInMonths', width: 18 },
    { header: 'Cycle Start', key: 'cycleStart', width: 18 },
    { header: 'Cycle End', key: 'cycleEnd', width: 18 },
    { header: 'Months with Due', key: 'monthsWithDuePayments', width: 25 },
    { header: 'Total Pending Amount', key: 'totalPendingAmount', width: 25 },
  ];

  // Style the header row for Tenant Analysis
  const analysisHeaderRow = analysisSheet.getRow(1);
  analysisHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background
    };
    cell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows for Tenant Analysis
  tenantAnalysisData.forEach((tenant) => {
    const row = analysisSheet.addRow({
      tenantName: tenant.tenantName,
      tenantNumber: tenant.tenantNumber,
      roomNo: tenant.room.roomNo,
      roomType: tenant.room.roomType,
      monthlyRent: tenant.monthlyRent,
      // security deposit
      securityDepositTotal: tenant.securityDepositTotal,
      securityDepositPaid: tenant.securityDepositPaid,
      securityDepositBalance: tenant.securityDepositBalance,

      checkInDate: formatDate(tenant.checkInDate),
      tenureInMonths: tenant.tenureInMonths,
      cycleStart: formatDate(tenant.cycleStart),
      cycleEnd: formatDate(tenant.cycleEnd),

      monthsWithDuePayments: tenant.monthsWithDuePayments.join(', '),
      totalPendingAmount: tenant.totalPendingAmount,
    });

    // Style data cells
    row.eachCell((cell) => {
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });

  // Create Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Define columns for Summary
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ];

  // Style the header row for Summary
  const summaryHeaderRow = summarySheet.getRow(1);
  summaryHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background
    };
    cell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add summary data
  const summaryRows = [
    { metric: 'Total Active Tenants', value: summaryData.totalActiveTenants },
    { metric: 'Total Security Collected', value: `₹${summaryData.totalSecurityCollected.toLocaleString()}` },
    { metric: 'Total Security Balance', value: `₹${summaryData.totalSecurityBalance.toLocaleString()}` },
    { metric: 'Total Monthly Rent Expected', value: `₹${summaryData.totalMonthlyRentExpected.toLocaleString()}` },
    { metric: 'Total Pending Amount', value: `₹${summaryData.totalPendingAmount.toLocaleString()}` },
    { metric: 'Average Tenure (Months)', value: summaryData.averageTenureMonths },
    { metric: 'Collection Efficiency (%)', value: `${summaryData.collectionEfficiency}%` },
    { metric: 'Tenants with Pending Payments', value: summaryData.tenantsWithPendingPayments },
  ];

  summaryRows.forEach((rowData) => {
    const row = summarySheet.addRow(rowData);
    
    // Style data cells
    row.eachCell((cell) => {
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      
      // Style the metric column
      if (cell.address[0] === 'A') {
        cell.font = { bold: true };
      }
    });
  });

  // Generate filename with current date
  const currentDate = formatDateToYYYYMMDD(new Date());
  const fileName = `tenant-analysis-report-${currentDate}.xlsx`;
  
  // Write the file
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  });
  
  return fileName;
};

// Refunds Export Function
export const generateRefundsExcel = async (
  refundsData: any[],
  statistics: any,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Refunds Report');

  // Define columns with proper headers and widths
  worksheet.columns = [
    { header: 'Tenant Name', key: 'tenantName', width: 25 },
    { header: 'Phone Number', key: 'phoneNumber', width: 20 },
    { header: 'Room Number', key: 'roomNumber', width: 15 },
    { header: 'Security Deposit', key: 'securityDeposit', width: 18 },
    { header: 'Refund Amount', key: 'refundAmount', width: 18 },
    { header: 'Electricity Bill', key: 'electricityBill', width: 18 },
    { header: 'Other Deductions', key: 'otherDeductions', width: 18 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Notice End Date', key: 'noticeEndDate', width: 18 },
    { header: 'Processed Date', key: 'processedDate', width: 18 },
    { header: 'Transaction Ref', key: 'transactionRef', width: 20 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Payment Status', key: 'paymentStatus', width: 18 },
    { header: 'Paid At', key: 'paidAt', width: 18 },
    { header: 'Receipt URL', key: 'receiptUrl', width: 40 },
    { header: 'Comments', key: 'comments', width: 30 },
    { header: 'Electricity Units', key: 'electricityUnits', width: 18 },
    { header: 'Processed By', key: 'processedBy', width: 20 },
    { header: 'Created Date', key: 'createdDate', width: 18 },
  ];

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background
    };
    cell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows
  refundsData.forEach((refund) => {
    const row = worksheet.addRow({
      tenantName: refund.tenant.tenantName,
      phoneNumber: refund.tenant.tenantNumber,
      roomNumber: refund.room.roomNo,
      securityDeposit: refund.securityDepositPaid,
      refundAmount: refund.refundAmount,
      electricityBill: refund.deductions?.electricityBill || 0,
      otherDeductions: refund.deductions?.otherDeductions || 0,
      status: refund.status === 'processed' ? 'Processed' : 'Not Processed',
      noticeEndDate: formatDate(refund.noticeEndsOn),
      processedDate: refund.processedAt ? formatDate(refund.processedAt) : '-',
      transactionRef: refund.paymentTransaction?.transactionRef || '-',
      paymentMethod: refund.paymentTransaction?.method || '-',
      paymentStatus: refund.paymentTransaction?.status || '-',
      paidAt: refund.paymentTransaction?.paidAt ? formatDate(refund.paymentTransaction.paidAt) : '-',
      receiptUrl: refund.paymentTransaction?.paymentProofs?.[0] || '-',
      comments: refund.comments || '-',
      electricityUnits: refund.deductions?.electricityUnits || 0,
      processedBy: refund.processedBy?.name || '-',
      createdDate: formatDate(refund.createdAt),
    });

    // Style data cells
    row.eachCell((cell) => {
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });



  // Add empty row for spacing
  worksheet.addRow([]);

  // Add statistics section as a separate table
  const statisticsStartRow = worksheet.rowCount + 1;
  
  // Add statistics header
  const statisticsHeaderRow = worksheet.addRow(['STATISTICS', '']);
  statisticsHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' } // Blue background
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add statistics data rows
  const statisticsData = [
    { metric: 'Total Refunds', value: statistics?.totalRefunds || 0 },
    { metric: 'Total Amount', value: statistics?.totalAmount || 0 },
    { metric: 'Processed Count', value: statistics?.processedCount || 0 },
    { metric: 'Pending Count', value: statistics?.pendingCount || 0 },
    { metric: 'Processed Amount', value: statistics?.processedAmount || 0 },
    { metric: 'Pending Amount', value: statistics?.pendingAmount || 0 },
  ];

  statisticsData.forEach((item) => {
    const row = worksheet.addRow([item.metric, item.value]);
    
    // Style statistics data rows
    row.eachCell((cell, colNumber) => {
      cell.font = { bold: colNumber === 1 }; // Bold only for metric names
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colNumber === 1 ? 'FFE6F3FF' : 'FFFFFFFF' } // Light blue for metrics, white for values
      };
      cell.alignment = { 
        horizontal: colNumber === 1 ? 'left' : 'right', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });

  // Set column widths for statistics table
  worksheet.getColumn(1).width = 20; // Metric column
  worksheet.getColumn(2).width = 15; // Value column

  // Generate filename with current date range
  const currentDate = formatDateToYYYYMMDD(new Date());
  
  let fileName: string;
  if (startDate && endDate) {
    const startDateStr = formatDate(startDate.toISOString());
    const endDateStr = formatDate(endDate.toISOString());
    fileName = `refunds-report-(${startDateStr} to ${endDateStr})_${currentDate}.xlsx`;
  } else {
    fileName = `refunds-report-${currentDate}.xlsx`;
  }
  
  // Write the file
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  });
  
  return fileName;
};

// Profit-Loss Export Function
export const generateProfitLossExcel = async (
  profitLossData: any[]
) => {

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Profit-Loss Report');

  // Define columns with proper headers and widths
  worksheet.columns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Year', key: 'year', width: 12 },
    { header: 'Total Income', key: 'totalIncome', width: 18 },
    { header: 'Rent Income', key: 'rentIncome', width: 15 },
    { header: 'Other Income', key: 'otherIncome', width: 15 },
    { header: 'Total Expenses', key: 'totalExpenses', width: 18 },
    { header: 'Gross Profit', key: 'grossProfit', width: 18 },
    { header: 'Net Profit', key: 'netProfit', width: 18 },
    { header: 'Profit Margin (%)', key: 'profitMargin', width: 20 },
    { header: 'Expense Ratio (%)', key: 'expenseRatio', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Calculated At', key: 'calculatedAt', width: 18 },
  ];

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background
    };
    cell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows
  profitLossData.forEach((record) => {
    const row = worksheet.addRow({
      month: record.month,
      year: record.year,
      totalIncome: record.income.totalAmount,
      rentIncome: record.income.categoryBreakdown.rent,
      otherIncome: record.income.categoryBreakdown.other,
      totalExpenses: record.expense.totalAmount,
      grossProfit: record.financialSummary.grossProfit,
      netProfit: record.financialSummary.netProfit,
      profitMargin: record.financialSummary.profitMargin,
      expenseRatio: record.financialSummary.expenseRatio,
      status: record.status,
      calculatedAt: formatDate(record.calculatedAt),
    });

    // Style data cells
    row.eachCell((cell) => {
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });

  // Generate filename with current date
  const currentDate = formatDateToYYYYMMDD(new Date());
  const fileName = `profit-loss-report-${currentDate}.xlsx`;
  
  // Write the file
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  });
  
  return fileName;
};
