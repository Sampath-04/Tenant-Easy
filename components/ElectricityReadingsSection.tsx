import React from 'react';
import {
    Typography,
    Chip,
} from '@mui/material';
import {
    ElectricBolt as ElectricBoltIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { formatDate } from '@/lib/utils/formatters';
import { ElectricityReadingDetail } from '@/lib/api/rentHistory';

interface ElectricityReadingsSectionProps {
    electricityReadings: ElectricityReadingDetail[];
    noticeReadings?: ElectricityReadingDetail[];
    totalElectricityBill: number;
    isExpanded: boolean;
}

export default function ElectricityReadingsSection({
    electricityReadings,
    noticeReadings = [],
    totalElectricityBill,
    isExpanded,
}: ElectricityReadingsSectionProps) {
    const getAllReadings = () => {
        const readings = [...electricityReadings];
        if (noticeReadings.length > 0) {
            readings.push(...noticeReadings);
        }
        return readings.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
    };

    const allReadings = getAllReadings();
    const hasNoticeReadings = noticeReadings.length > 0;

    if (!isExpanded) {
        return null;
    }

    return (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="md:p-6 p-2">
                <div className="flex items-center gap-2 mb-4">
                    <ElectricBoltIcon className="text-purple-600 dark:text-purple-400" />
                    <Typography className="font-semibold text-gray-900 dark:text-white md:text-xl text-lg">
                        Electricity Readings
                    </Typography>
                    {hasNoticeReadings && (
                        <Chip
                            label="Includes Notice Period"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </div>

                {/* Summary of Cost per Tenant */}
                {allReadings.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Typography variant="body2" className="font-medium text-blue-800 dark:text-blue-300">
                                Cost Summary:
                            </Typography>
                        </div>
                        <div className="grid md:grid-cols-4 md:gap-4 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Total Consumption:</span>
                                <span className="font-semibold ml-1 text-blue-600 dark:text-blue-400">
                                    {allReadings.reduce((total, reading) => total + reading.consumption, 0)} units
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                                <span className="font-semibold ml-1 text-green-600 dark:text-green-400">
                                    ₹{totalElectricityBill}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Avg Tenants Present:</span>
                                <span className="font-semibold ml-1 text-purple-600 dark:text-purple-400">
                                    {Math.round(allReadings.reduce((total, reading) => total + (reading.totalTenantsPresent || 0), 0) / allReadings.length)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Avg Cost per Tenant:</span>
                                <span className="font-semibold ml-1 text-orange-600 dark:text-orange-400">
                                    ₹{Math.round(allReadings.reduce((total, reading) => total + (reading.consumptionCostPerTenant || 0), 0) / allReadings.length)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                <div className="md:space-y-3 space-y-0">
                    <div className='flex w-[300px] md:w-full overflow-x-scroll md:overflow-x-hidden md:flex-col gap-3'>
                        {allReadings.map((reading) => (
                            <div
                                key={reading._id}
                                className={`min-w-[275px] md:min-w-auto md:w-full md:p-4  p-3 rounded-lg border ${noticeReadings.some((r) => r._id === reading._id)
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                <div className="md:flex  md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 md:grid-cols-6 md:gap-4 gap-2">
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Reading Date
                                                </Typography>
                                                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(reading.readingDate)}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Current Reading
                                                </Typography>
                                                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                                    {reading.meterReading} units
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Previous Reading
                                                </Typography>
                                                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                                    {reading.previousReading} units
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Consumption
                                                </Typography>
                                                <Typography variant="body1" className="font-bold text-blue-600 dark:text-blue-400">
                                                    {reading.consumption} units
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Tenants Present
                                                </Typography>
                                                <Typography variant="body1" className="font-medium text-purple-600 dark:text-purple-400">
                                                    {reading.totalTenantsPresent || 0}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                                    Cost per Tenant
                                                </Typography>
                                                <Typography variant="body1" className="font-bold text-green-600 dark:text-green-400">
                                                    ₹{reading.consumptionCostPerTenant || 0}
                                                </Typography>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <PersonIcon className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                                    Recorded by: {reading.recordedBy.name} ({reading.recordedBy.role})
                                                </Typography>
                                            </div>
                                            {noticeReadings.some((r) => r._id === reading._id) && (
                                                <Chip
                                                    label="Notice Period"
                                                    size="small"
                                                    color="warning"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </div>

                                        {reading.notes && (
                                            <div className="mt-2">
                                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400 italic">
                                                    Note: {reading.notes}
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {allReadings.length === 0 && (
                            <div className="text-center md:py-8 py-4">
                                <ElectricBoltIcon className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-2" />
                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                    No electricity readings available for this record
                                </Typography>
                            </div>
                        )}
                    </div>  
                </div>
                
                </div>
            </div>
        </div>
    );
}
