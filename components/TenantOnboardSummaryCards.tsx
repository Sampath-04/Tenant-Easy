import React from 'react';
import {
  Card,
  CardContent,
  Typography,
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
}

export default function TenantOnboardSummaryCards({ summary, variant = 'pending' }: SummaryCardsProps) {
  const isUpcoming = variant === 'upcoming';
  const isCompleted = variant === 'completed';
  
  if (isCompleted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
          borderRadius: '12px',
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
        }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  {summary.totalTenants}
                </Typography>
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.totalAmountCollected || 0)}
                </Typography>
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.totalSecurityDepositCollected || 0)}
                </Typography>
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.totalOnboardingRentCollected || 0)}
                </Typography>
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
        borderRadius: '12px',
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
      }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                {summary.totalTenants}
              </Typography>
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalPendingAmount || 0)}
              </Typography>
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalSecurityPending || 0)}
              </Typography>
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalRentPending || 0)}
              </Typography>
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
