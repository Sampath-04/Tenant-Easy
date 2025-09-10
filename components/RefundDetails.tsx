import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Link,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { Refund } from '@/lib/api/refunds';
import { Person as PersonIcon } from '@mui/icons-material';

interface RefundDetailsProps {
  refund: Refund;
  isExpanded: boolean;
  onToggle: () => void;
}

const RefundDetails: React.FC<RefundDetailsProps> = ({
  refund,
  isExpanded,
  onToggle,
}) => {
  return (
    <Accordion 
      expanded={isExpanded} 
      onChange={onToggle}
      sx={{
        marginTop: "0",
        "& .MuiAccordion-heading":{
            display: "none"
        }
      }}
    >
      <AccordionSummary />
      
      <AccordionDetails className="p-0">
        <Box>
          {/* Transaction Details Section */}
          {refund.paymentTransaction && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ReceiptIcon className="text-blue-600 dark:text-blue-400" />
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </Typography>
                  <Chip
                    label="Payment Transaction"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </div>

                {/* Transaction Summary */}
                {/* <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Typography variant="body2" className="font-medium text-blue-800 dark:text-blue-300">
                      Transaction Summary:
                    </Typography>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <span className="font-semibold ml-1 text-blue-600 dark:text-blue-400">
                        {refund.paymentTransaction.transactionRef || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-semibold ml-1 text-green-600 dark:text-green-400">
                        {formatCurrency(refund.paymentTransaction.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Method:</span>
                      <span className="font-semibold ml-1 text-purple-600 dark:text-purple-400">
                        {refund.paymentTransaction.method || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-semibold ml-1 text-orange-600 dark:text-orange-400">
                        {refund.paymentTransaction.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div> */}

                {/* Detailed Transaction Information */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                         <div className="flex flex-row justify-between gap-4">
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Transaction ID
                             </Typography>
                             <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                               {refund.paymentTransaction.transactionRef || 'N/A'}
                             </Typography>
                           </div>
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Amount
                             </Typography>
                             <Typography variant="body1" className="font-bold text-green-600 dark:text-green-400">
                               {formatCurrency(refund.paymentTransaction.amount)}
                             </Typography>
                           </div>
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Payment Method
                             </Typography>
                             <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                               {refund.paymentTransaction.method || 'N/A'}
                             </Typography>
                           </div>
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Status
                             </Typography>
                             <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                               {refund.paymentTransaction.status || 'N/A'}
                             </Typography>
                           </div>
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Paid At
                             </Typography>
                             <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                               {refund.paymentTransaction.paidAt ? formatDate(refund.paymentTransaction.paidAt) : 'N/A'}
                             </Typography>
                           </div>
                           <div>
                             <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                               Payment Proofs
                             </Typography>
                             <div>
                               {refund.paymentTransaction.paymentProofs && refund.paymentTransaction.paymentProofs.length > 0 ? (
                                 <div className="flex flex-wrap gap-1">
                                   {refund.paymentTransaction.paymentProofs.map((proof, index) => (
                                     <Link
                                       key={index}
                                       href={proof}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium underline"
                                     >
                                       Proof {index + 1}
                                     </Link>
                                   ))}
                                 </div>
                               ) : (
                                 <Typography variant="body1" className="font-medium text-gray-500 dark:text-gray-400">
                                   No proofs
                                 </Typography>
                               )}
                             </div>
                           </div>
                         </div>

                        <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <PersonIcon className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Recorded by: {refund.createdBy.name} ({refund.createdBy.role})
                            </Typography>
                          </div>
                          <div className="flex gap-2">
                            <Chip
                              label="Refund Transaction"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            {refund.paymentTransaction.isSuccessful && (
                              <Chip
                                label="Successful"
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                            {refund.paymentTransaction.isPending && (
                              <Chip
                                label="Pending"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Transaction Data */}
          {!refund.paymentTransaction && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="p-6">
                <div className="text-center py-8">
                  <ReceiptIcon className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-2" />
                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                    No transaction details available for this refund
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default RefundDetails;
