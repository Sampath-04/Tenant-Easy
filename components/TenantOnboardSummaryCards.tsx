import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
} from '@mui/material';
import {
  Person as PersonIcon,
  CurrencyRupee as CurrencyIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { formatCurrency } from '@/lib/utils/formatters';

interface SummaryData {
  totalTenants: number;
  totalPendingAmount?: number;
  totalSecurityPending?: number;
  totalRentPending?: number;
  totalSecurityDepositCollected?: number;
  totalOnboardingRentCollected?: number;
  totalAmountCollected?: number;
}

interface SummaryCardsProps {
  summary: SummaryData;
  variant?: 'pending' | 'upcoming' | 'completed';
  loading?: boolean;
}

export default function TenantOnboardSummaryCards({ summary, variant = 'pending', loading = false }: SummaryCardsProps) {
  const isUpcoming = variant === 'upcoming';
  const isCompleted = variant === 'completed';

  // Show skeleton loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
      </div>
    );
  }

  
  if (isCompleted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
          borderRadius: '12px',
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
        }}>
          <CardContent sx={{
            padding: '16px!important',
            height: "140px"
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white text-3xl">
                  {summary.totalTenants}
                </p>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Total Tenants
                </Typography>
              </div>
              <PersonIcon className="text-3xl text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
          borderRadius: '12px',
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
        }}>
          <CardContent sx={{
            padding: '16px!important',
            height: "140px"
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white text-3xl">
                  {formatCurrency(summary.totalAmountCollected || 0)}
                </p>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Total Collected
                </Typography>
              </div>
              <CheckCircleIcon className="text-3xl text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
          borderRadius: '12px',
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
        }}>
          <CardContent sx={{
            padding: '16px!important',
            height: "140px"
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white text-3xl">
                  {formatCurrency(summary.totalSecurityDepositCollected || 0)}
                </p>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Security Collected
                </Typography>
              </div>
              <CurrencyIcon className="text-3xl text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
          borderRadius: '12px',
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
        }}>
          <CardContent sx={{
            padding: '16px!important',
            height: "140px"
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white text-3xl">
                  {formatCurrency(summary.totalOnboardingRentCollected || 0)}
                </p>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Rent Collected
                </Typography>
              </div>
              <CurrencyIcon className="text-3xl text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
        borderRadius: '12px',
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
      }}>
        <CardContent sx={{
          padding: '16px!important',
          height: "140px"
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white text-3xl">
                {summary.totalTenants}
              </p>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Total Tenants
              </Typography>
            </div>
            <PersonIcon className="text-3xl text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
        borderRadius: '12px',
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
      }}>
        <CardContent sx={{
          padding: '16px!important',
          height: "140px"
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white text-3xl">
                {formatCurrency(summary.totalPendingAmount || 0)}
              </p>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Total Pending
              </Typography>
            </div>
            <CurrencyIcon className="text-3xl text-amber-600 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
        borderRadius: '12px',
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
      }}>
        <CardContent sx={{
          padding: '16px!important',
          height: "140px"
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white text-3xl">
                {formatCurrency(summary.totalSecurityPending || 0)}
              </p>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Security Pending
              </Typography>
            </div>
            {isUpcoming ? (
              <ScheduleIcon className="text-3xl text-orange-500 dark:text-orange-400" />
            ) : (
              <WarningIcon className="text-3xl text-red-500 dark:text-red-400" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
        borderRadius: '12px',
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
      }}>
        <CardContent sx={{
          padding: '16px!important',
          height: "140px"
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white text-3xl">
                {formatCurrency(summary.totalRentPending || 0)}
              </p>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Rent Pending
              </Typography>
            </div>
            <CurrencyIcon className="text-3xl text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
