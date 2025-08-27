import React from 'react';
import {
  Typography,
  Chip,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';

interface RentInfoCardProps {
  record: any;
  getCurrentDate: () => Date;
}

export default function RentInfoCard({ record, getCurrentDate }: RentInfoCardProps) {

  // Calculate extra days for notice period
  const calculateExtraDays = () => {
    if (!record.notice) return 0;
    const endDate = new Date(record.endDate);
    const noticeEndDate = new Date(record.notice.noticeEndsOn);
    const diffTime = noticeEndDate.getTime() - endDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const extraDays = calculateExtraDays();

  const getStatusChip = (record: any) => {
    // Completed notice - show evicted status
    if (record.notice && record.notice.status === 'completed') {
      return (
        <Chip
          label="Evicted"
          color="error"
          size="small"
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
            '& .MuiChip-label': {
              padding: '0 6px',
            },
          })}
          icon={<PersonOffIcon />}
        />
      );
    }

    // Active notice period - show notice status
    if (record.notice && record.notice.status === 'active') {
      return (
        <Chip
          label="Notice Period"
          color="warning"
          size="small"
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#fbbf24',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
            '& .MuiChip-label': {
              padding: '0 6px',
            },
          })}
          icon={<WarningIcon />}
        />
      );
    }

    if(record.paymentStatus === "FULLY_PAID") {
      return (
        <Chip
          label="Paid"
          color="success"
          size="small"
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
          })}
          icon={<CheckCircleIcon />}
        />
      );
    }
    if(record.paymentStatus === "PARTIALLY_PAID") {
      return (
        <Chip
          label="Partially Paid"
          color="warning"
          size="small"
          sx={(theme: Theme) => ({  
            backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#fbbf24',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
          })} 
          icon={<CheckCircleIcon />}
        />
      );
    }
    // Ready to Collect chip
    if (!record.isOverdue && record.endDate < getCurrentDate().toISOString()) {
      return (
        <Chip
          label="Ready to Collect"
          color="success"
          size="small"
          sx={(theme: Theme) => ({    
            backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
            '& .MuiChip-label': {
              padding: '0 6px',
            },
          })}
        />
      );
    }

    // upcoming chip, if the current date is less than the end date
    if (record.endDate > getCurrentDate().toISOString()) {
      return (
        <Chip
          label="Upcoming"
          color="warning"
          size="small"
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#fbbf24',
            // light gray for dark mode
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
            '& .MuiChip-label': {
              padding: '0 6px',
            },
          })}
        />
      );
    }

    // Overdue chip with detailed styling
    if (record.isOverdue && !record.notice) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`${record.daysOverdue} days overdue`}
          sx={(theme: Theme) => ({
            padding: '14px',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(220, 38, 38, 0.15)' 
              : '#fef2f2',
            color: theme.palette.mode === 'dark' 
              ? '#fca5a5' 
              : '#dc2626',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(220, 38, 38, 0.3)' 
              : '1px solid #fecaca',
            '& .MuiChip-icon': {
              color: theme.palette.mode === 'dark' 
                ? '#fca5a5' 
                : '#dc2626',
            },
          })}
          size="small"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex-1">
      {/* Tenant and Room Info */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <PersonIcon className="text-gray-400 dark:text-gray-500" />
          <Typography variant="body1" className="font-semibold text-gray-600 dark:text-gray-400">
            {record.tenant.tenantName}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <PhoneIcon className="text-gray-400 dark:text-gray-500" />
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            {record.tenant.tenantNumber}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <HomeIcon className="text-gray-400 dark:text-gray-500" />
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            Room {record.room.roomNo}
          </Typography>
        </div>
        {/* Status Chip */}
        {getStatusChip(record)}
        <p>current date: {getCurrentDate().toISOString().split('T')[0]}</p>
      </div>

      {/* Cycle and Rent Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Year and Current Cycle Information */}
        <div className="space-y-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Current Cycle
            </Typography>
            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
              {formatDate(record.startDate)} - {formatDate(record.endDate)}
            </Typography>
          </div>
    
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Current Cycle Electricity
            </Typography>
            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
              {record.notice && record.notice.status === 'active' 
                ? `${formatCurrency(record.electricityBill)} + ${formatCurrency(record.notice.electricityBill || 0)} (notice)`
                : formatCurrency(record.electricityBill)
              }
            </Typography>
          </div>
          {/* Show Total Amount only if not in notice period */}
          {!record.notice || record.notice.status !== 'active' && (
             <div>
               <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                 Total Amount
               </Typography>
               <Typography variant="body1" className="font-bold text-amber-600 dark:text-amber-400">
                 {formatCurrency(record.totalAmount)}
               </Typography>
             </div>
           )}
          {
            record.notice && (
              <div>
                 <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                   Extra Days
                 </Typography>
                 <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                   {extraDays > 1 ? `${extraDays} days` : `${extraDays} day`}
                 </Typography>
               </div>
            )
          }
        </div>
         <div className="space-y-4">
           <div>
             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
               Current Cycle Rent
             </Typography>
             <div className="flex items-center gap-2">
               <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                 {formatCurrency(record.rent)}
               </Typography>
               <Chip
                  label={`${record.previousCyclePaymentStatus === "FULLY_PAID" ? 'Paid' : record.previousCyclePaymentStatus === "PARTIALLY_PAID" ? 'Partially Paid' : 'Not Paid'}`}
                  size="small"
                  sx={(theme: Theme) => ({
                    backgroundColor: record.previousCyclePaymentStatus === "FULLY_PAID" 
                      ? theme.palette.mode === 'dark' ? '#059669' : '#10b981' 
                      : record.previousCyclePaymentStatus === "PARTIALLY_PAID" 
                      ? theme.palette.mode === 'dark' ? '#f59e0b' : '#fbbf24' 
                      : theme.palette.mode === 'dark' ? '#fca5a5' : '#dc2626',
                    color: '#fff',
                    fontSize: '0.75rem',
                    height: '20px',
                    '& .MuiChip-label': {
                      padding: '0 6px',
                    },
                    '& .MuiChip-icon': {
                      color: 'white'
                    },
                  })}
                  icon={<CheckCircleIcon />}
                />
             </div>
           </div>
           <div>
             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
               Next Cycle Rent
             </Typography>
             <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
               {record.notice && record.notice.status === 'active' ? '₹0' : formatCurrency(record.rent)}
             </Typography>
           </div>
           
           {/* Extra Days Information for Notice Period */}
           {record.notice && (
             <>
               <div>
                 <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                   Cost for Extra Days
                 </Typography>
                 <div className="flex items-center gap-2">
                 <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                   {formatCurrency(record.notice.rent || 0)} 
                 </Typography>
                 <Chip 
                   label={record.notice.paymentStatus?.replace('_', ' ').charAt(0).toUpperCase() + record.notice.paymentStatus?.replace('_', ' ').slice(1).toLowerCase() || 'NOT_PAID'} 
                   size="small"
                   color={
                     record.notice.paymentStatus === 'FULLY_PAID' ? 'success' :
                     record.notice.paymentStatus === 'PARTIALLY_PAID' ? 'warning' : 'error'
                   }
                   variant="outlined"
                 />
                 </div>
                
               </div>
             </>
           )}
         </div>
      </div>

      {/* Due Date and notice period status */}
      <div className="flex items-center gap-6">
        {/* Show Due Date only if not in notice period */}
        {record.paymentStatus === "NOT_PAID" || record.paymentStatus === "PARTIALLY_PAID" && (
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Due Date:
            </Typography>
            <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
              {formatDate(record.dueDate)}
            </Typography>
          </div>
        )}
        
        {/* Notice Period Status */}
        {record.notice && record.notice.status === 'active' && (
          <div className="flex items-center gap-2">
            <Chip
              label={`Notice Period - Ends ${formatDate(record.notice.noticeEndsOn)}`}
              sx={(theme: Theme) => ({
                padding: '14px',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : '#fef3c7',
                color: theme.palette.mode === 'dark' 
                  ? '#fbbf24' 
                  : '#d97706',
                border: theme.palette.mode === 'dark' 
                  ? '1px solid rgba(245, 158, 11, 0.3)' 
                  : '1px solid #fed7aa',
                '& .MuiChip-icon': {
                  color: theme.palette.mode === 'dark' 
                    ? '#fbbf24' 
                    : '#d97706',
                },
              })}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
}
