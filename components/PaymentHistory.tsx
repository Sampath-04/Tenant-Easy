import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Link,
  Alert,
} from '@mui/material';
import { Receipt as ReceiptIcon, Person as PersonIcon } from '@mui/icons-material';
import { Payment } from '../lib/api/rentHistory';
import { formatCurrency } from '../lib/utils/formatters';

interface PaymentHistoryProps {
  rentPayments: Payment[];
  noticePayments: Payment[];
  totalPaidAmount: number;
  remainingAmount: number;
  totalAmount: number;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  rentPayments,
  noticePayments,
  totalPaidAmount,
  remainingAmount,
  totalAmount,
}) => {
  // Combine both payment arrays and sort by date
  const allPayments = [...rentPayments, ...noticePayments].sort((a, b) => 
    new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  const totalPaymentCount = rentPayments.length + noticePayments.length;

  return (
    <Box className="space-y-4 mt-4">
      {totalPaymentCount === 0 ? (
        <Alert severity="info" className="rounded-lg">
          No payment history available.
        </Alert>
      ) : (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="md:p-6 p-3">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptIcon className="text-green-600 dark:text-green-400" />
              <Typography className="font-semibold text-gray-900 dark:text-white md:text-xl text-lg">
                Payment History
              </Typography>
              <Chip
                label={`${totalPaymentCount} payments`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              {(rentPayments.length > 0 && noticePayments.length > 0) && (
                <Chip
                  label="Rent + Notice"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </div>

            {/* Payment Summary */}
            <div className="md:mb-4 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className=" flex items-center gap-2 mb-2">
                <Typography variant="body2" className="font-medium text-blue-800 dark:text-blue-300">
                  Payment Summary:
                </Typography>
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <span className="font-semibold ml-1 text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-semibold ml-1 text-green-600 dark:text-green-400">
                    {formatCurrency(totalPaidAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className="font-semibold ml-1 text-red-600 dark:text-red-400">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Payment Count:</span>
                  <span className="font-semibold ml-1 text-purple-600 dark:text-purple-400">
                    {totalPaymentCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className='flex w-[270px] md:w-full overflow-x-scroll md:overflow-x-hidden md:flex-col md:gap-3 gap-2'>
              {allPayments.map((payment, index) => {
                // Determine if this payment is from notice or rent history
                const isFromNotice = noticePayments.some(np => np._id === payment._id);
                const isFromRent = rentPayments.some(rp => rp._id === payment._id);
                
                return (
                  <div
                    key={payment._id}
                    className={`min-w-[250px] md:min-w-auto md:w-full md:p-4 p-3 rounded-lg border ${
                      isFromNotice 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:flex md:flex-row flex-col md:gap-24 gap-2">
                          <div>
                            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                              Payment Date
                            </Typography>
                            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                              {new Date(payment.paidAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                              Amount
                            </Typography>
                            <Typography variant="body1" className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(payment.amount)}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                              Paid To
                            </Typography>
                            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                              {payment.metadata.paidTo}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                              Payment Proof
                            </Typography>
                            <div>
                              {payment.paymentProofs && payment.paymentProofs.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {payment.paymentProofs.map((proof, proofIndex) => (
                                    <Link
                                      key={proofIndex}
                                      href={proof}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium underline"
                                    >
                                      Proof {proofIndex + 1}
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 md:flex items-center md:gap-4 gap-2 grid">
                          <div className="flex items-center gap-2">
                            <PersonIcon className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Recorded by: {payment.recordedBy.name} ({payment.recordedBy.role})
                            </Typography>
                          </div>
                          <div className="flex gap-2">
                            <Chip
                              label={`Payment #${index + 1}`}
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            {isFromNotice && (
                              <Chip
                                label="Notice Period"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                            {isFromRent && (
                              <Chip
                                label="Rent Payment"
                                size="small"
                                color="primary"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div> 

              {totalPaymentCount === 0 && (
                <div className="text-center py-8">
                  <ReceiptIcon className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-2" />
                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                    No payment history available for this record
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default PaymentHistory;
