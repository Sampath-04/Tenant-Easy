'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { useGenerateRentReceiptPDF } from '@/hooks/useRentRecords';
import { AuthGuard } from '@/contexts/AuthContext';

function TestPDFReceiptContent() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePDFMutation = useGenerateRentReceiptPDF();
  
  // Hardcoded rent record ID
  const receiptId = '68c24498fbb184439ee52eea';

  const handleGeneratePDF = async () => {
    setError(null);
    setPdfUrl(null);

    try {
      const pdfBlob = await generatePDFMutation.mutateAsync(receiptId);
      
      // Create object URL for the PDF
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    }
  };

  // Auto-load PDF when component mounts
  React.useEffect(() => {
    handleGeneratePDF();
  }, []);

  const handleClearPDF = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setError(null);
  };

  // Clean up object URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <AppHeader /> */}
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              PDF Receipt Testing & Development
            </h1>
            
            {/* Loading State */}
            {generatePDFMutation.isPending && (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">Loading PDF...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading PDF</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            {pdfUrl && (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      PDF Preview
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Rent Record ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">{receiptId}</code>
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="800px"
                      className="border-0 block"
                      title="PDF Receipt Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Development Notes */}
            <div className="bg-blue-50 dark:bg-blue-900/20 shadow-sm border border-blue-200 dark:border-blue-700 rounded-lg mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Development Notes
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    This page automatically loads a PDF receipt for testing and development
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <strong>Admin Only:</strong> This page is restricted to admin users only
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Hardcoded Rent Record ID: <code className="bg-blue-100 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 px-2 py-1 rounded text-sm font-mono ml-1">{receiptId}</code>
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Endpoint: <code className="bg-blue-100 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 px-2 py-1 rounded text-sm font-mono ml-1">GET /api/rent-history/:id/receipt-pdf</code>
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    PDF loads automatically when the page loads
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TestPDFReceiptPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <TestPDFReceiptContent />
    </AuthGuard>
  );
}
