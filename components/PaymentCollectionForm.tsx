'use client';

import React, { useState } from 'react';
import { RentHistory } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface PaymentCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  rentRecord: RentHistory | null;
  onSubmit: (data: {
    rentRecord: RentHistory;
    transactionId?: string;
    comments?: string;
    action: 'collect' | 'collectAndStartNew' | 'collectAndApplyNotice';
  }) => void;
}

export default function PaymentCollectionForm({
  isOpen,
  onClose,
  rentRecord,
  onSubmit
}: PaymentCollectionFormProps) {
  const [transactionId, setTransactionId] = useState('');
  const [comments, setComments] = useState('');
  const [selectedAction, setSelectedAction] = useState<'collect' | 'collectAndStartNew' | 'collectAndApplyNotice'>('collect');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !rentRecord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        rentRecord,
        transactionId: transactionId.trim() || undefined,
        comments: comments.trim() || undefined,
        action: selectedAction
      });
      
      // Reset form
      setTransactionId('');
      setComments('');
      setSelectedAction('collect');
      onClose();
    } catch (error) {
      console.error('Payment collection error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTransactionId('');
      setComments('');
      setSelectedAction('collect');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Collect Payment
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Rent Details */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                  Rent Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Period:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(rentRecord.startDate)} - {formatDate(rentRecord.endDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Room:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rentRecord.room?.roomNo || '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Rent:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecord.rent)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Electricity:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(rentRecord.electricityBill)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(rentRecord.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Action After Payment
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="collect"
                      checked={selectedAction === 'collect'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Collect payment only
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="collectAndStartNew"
                      checked={selectedAction === 'collectAndStartNew'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Collect payment and start new cycle
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="collectAndApplyNotice"
                      checked={selectedAction === 'collectAndApplyNotice'}
                      onChange={(e) => setSelectedAction(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Collect payment and apply notice period
                    </span>
                  </label>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="mb-4">
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Comments */}
              <div className="mb-6">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Collect Payment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
