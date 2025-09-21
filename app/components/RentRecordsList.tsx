import { Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
    PersonOff as PersonOffIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ElectricBolt as ElectricBoltIcon,
    Payment as PaymentIcon,
    WhatsApp as WhatsAppIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import RentHistoryDetails from '@/components/RentHistoryDetails';
import { formatDate, getCurrentDate, getNextMonthRentPeriodFromRecord } from '@/lib/utils/formatters';
import RentInfoCard from '@/components/RentInfoCard';
import PaymentCollectionForm from '@/components/PaymentCollectionForm';
import EvictionForm from '@/components/EvictionForm';
import NoticeForm from '@/components/NoticeForm';
import CancelNoticeDialog from '@/components/CancelNoticeDialog';
import { useState } from 'react';
import { useCancelNotice, useCompleteNotice } from '@/hooks/useNotice';
import { RentHistoryItem } from '@/lib/api/rentHistory';
import { CompleteNoticeData } from '@/lib/api/notice';

export default function RentRecordsList({
    filteredRents,
}: {
    filteredRents: RentHistoryItem[];
}) {
    const [expandedRentId, setExpandedRentId] = useState<string | null>(null);
    const [paymentFormOpen, setPaymentFormOpen] = useState(false);
    const [selectedRentForPayment, setSelectedRentForPayment] = useState<any>(null);
    const [evictionFormOpen, setEvictionFormOpen] = useState(false);
    const [selectedRentForEviction, setSelectedRentForEviction] = useState<any>(null);
    const [noticeFormOpen, setNoticeFormOpen] = useState(false);
    const [selectedRentForNotice, setSelectedRentForNotice] = useState<any>(null);
    const [cancellingNoticeId, setCancellingNoticeId] = useState<string | null>(null);
    const [cancelNoticeDialogOpen, setCancelNoticeDialogOpen] = useState(false);
    const [noticeToCancel, setNoticeToCancel] = useState<any>(null);

    // Complete notice mutation
    const completeNoticeMutation = useCompleteNotice();

    // Cancel notice mutation
    const cancelNoticeMutation = useCancelNotice();

    const toggleReadings = (recordId: string) => {
        setExpandedRentId(expandedRentId === recordId ? null : recordId);
    };

    const handleCollectPayment = (rent: any) => {
        setSelectedRentForPayment(rent);
        setPaymentFormOpen(true);
    };

    const domain = process.env.NEXT_PUBLIC_NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const getWhatsAppMessage = (rent: any) => {
    const paymentLink = `${domain}/tenant-payment?rentRecordId=${rent._id}`;
    const nextMonthPeriod = getNextMonthRentPeriodFromRecord(rent);
    const message = 
`Hi ${rent.tenant.tenantName}, 

This is a friendly reminder that your rent payment to start next cycle from ${formatDate(nextMonthPeriod.startDateString)} to ${formatDate(nextMonthPeriod.endDateString)} is pending.

Details:
• Room: ${rent.room.roomNo}
• Rent: ₹${rent.rent}
• Electricity Bill: ₹${rent.electricityBill}
• Total Amount: ₹${rent.totalAmount}
• Remaining Amount: ₹${rent.remainingAmount}
• Due Date: ${formatDate(rent.dueDate)}

Payment Instructions:
Please request the UPI ID or QR code from the owner/caretaker to complete your payment.

You can complete your payment online using this link:
${paymentLink}

Please make the payment at your earliest convenience. If you have any questions, please contact us.
* If you have already paid the rent, please ignore this message.

Thank you!`;

    return encodeURIComponent(message);
    };

    const handleWhatsAppReminder = (rent: any) => {
        // open whatsapp
        window.open(`https://wa.me/+91${rent.tenant.tenantNumber}?text=${getWhatsAppMessage(rent)}`, '_blank');
    };

    const handleShareReceipt = (rent: any) => {
        if (rent?.tenant?.tenantNumber && rent?.receiptUrl) {
            const message = `Hi ${rent.tenant.tenantName}, your payment has been processed! Here's your receipt: ${rent.receiptUrl}`;
            const whatsappUrl = `https://wa.me/+91${rent.tenant.tenantNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleCompleteEviction = (rent: any) => {
        setSelectedRentForEviction(rent);
        setEvictionFormOpen(true);
    };

    const handleUpdateNotice = (rent: any) => {
        setSelectedRentForNotice(rent);
        setNoticeFormOpen(true);
    };

    const handleCancelNotice = (rent: any) => {
        setNoticeToCancel(rent);
        setCancelNoticeDialogOpen(true);
    };

    const handleConfirmCancelNotice = async () => {
        if (!noticeToCancel?.notice?._id) {
            console.error('No notice ID found for cancellation');
            return;
        }

        try {
            // Set the cancelling notice ID to show loading for this specific record
            setCancellingNoticeId(noticeToCancel.notice._id);

            // Call the cancelNotice API
            await cancelNoticeMutation.mutateAsync(noticeToCancel.notice._id);
            
            // Close the dialog
            setCancelNoticeDialogOpen(false);
            setNoticeToCancel(null);
        } catch (error) {
            console.error('Failed to cancel notice:', error);
            // Error handling is done in the mutation
        } finally {
            // Clear the cancelling notice ID
            setCancellingNoticeId(null);
        }
    };

    const handleCancelNoticeDialog = () => {
        setCancelNoticeDialogOpen(false);
        setNoticeToCancel(null);
    };

    const handlePaymentSubmit = (data: any) => {
        setSelectedRentForPayment((prev: any) => ({
            ...prev,
            comments: data.comments,
            paymentProofs: data.paymentProofs,
            paymentStatus: "FULLY_PAID",
        }));
    };

    const handleEvictionSubmit = async (data: any) => {
        if (!data.rentRecord?.notice?._id) {
            console.error('No notice ID found for eviction');
            return;
        }

        const payload = {
            noticeId: data.rentRecord.notice._id,
            electricityUnit: data.currentElectricityReading,
            tenantQrCode: data.tenantQrCode,
            comments: data.comments,
            otherDeduction: data.otherDeduction || 0,
        } as CompleteNoticeData;

        try {
            // Call the completeNotice API
            await completeNoticeMutation.mutateAsync(payload);

            // Close the eviction form
            setEvictionFormOpen(false);
            setSelectedRentForEviction(null);
        } catch (error) {
            console.error('Failed to complete eviction:', error);
            // Error handling is done in the mutation
        }
    };

    return (
        <div>
            <div className="space-y-6">
                {filteredRents.length === 0 ? (
                    <Card className="bg-white dark:bg-gray-800">
                        <CardContent className="p-8 text-center">
                            <div className="text-gray-400 text-6xl mb-4">💰</div>
                            <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                                No Rent Records Found
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRents.map((record) => (
                        <Card
                            key={record._id}
                            sx={{
                                borderRadius: '16px',
                                boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;',
                            }}
                            className="bg-white dark:bg-gray-800"
                        >
                            <CardContent className="md:p-6 p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between md:gap-4 gap-2">
                                    {/* Rent Info Section */}
                                    <RentInfoCard record={record} getCurrentDate={getCurrentDate} />

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 min-w-fit">
                                        {/* Action buttons for tenants in notice period */}
                                        {record.notice && record.notice.status === 'active' ? (
                                            <>
                                                {/* Show Update Notice if there's remaining amount, otherwise show Complete Eviction */}
                                                {record.notice.remainingAmount > 0 ? (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PaymentIcon />}
                                                        onClick={() => handleUpdateNotice(record)}
                                                        sx={(theme: Theme) => ({
                                                            backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
                                                            borderRadius: '12px',
                                                            color: '#fff',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            padding: '8px 16px',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                                                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.mode === 'dark' ? '#d97706' : '#d97706',
                                                                boxShadow: theme.palette.mode === 'dark'
                                                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        })}
                                                        size="small"
                                                    >
                                                        Update Notice (₹{record.notice.remainingAmount})
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PersonOffIcon />}
                                                        onClick={() => handleCompleteEviction(record)}
                                                        sx={(theme: Theme) => ({
                                                            backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
                                                            borderRadius: '12px',
                                                            color: '#fff',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            padding: '8px 16px',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                                                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
                                                                boxShadow: theme.palette.mode === 'dark'
                                                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        })}
                                                        size="small"
                                                    >
                                                        Complete Eviction
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    startIcon={cancellingNoticeId === record.notice?._id ? <CircularProgress size={16} /> : <CancelIcon />}
                                                    onClick={() => handleCancelNotice(record)}
                                                    disabled={cancellingNoticeId === record.notice?._id}
                                                    sx={(theme: Theme) => ({
                                                        borderColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
                                                        color: theme.palette.mode === 'dark' ? '#fbbf24' : '#f59e0b',
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '8px 16px',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? 'rgba(245, 158, 11, 0.1)'
                                                                : '#fef3c7',
                                                            borderColor: theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706',
                                                            color: theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    })}
                                                    size="small"
                                                >
                                                    {cancellingNoticeId === record.notice?._id ? 'Cancelling...' : 'Cancel Notice'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<ElectricBoltIcon />}
                                                    endIcon={expandedRentId === record._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    onClick={() => toggleReadings(record._id)}
                                                    sx={(theme: Theme) => ({
                                                        borderColor: theme.palette.mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                                                        color: theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6',
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '8px 16px',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? 'rgba(139, 92, 246, 0.1)'
                                                                : '#f3f4f6',
                                                            borderColor: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                            color: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    })}
                                                    size="small"
                                                >
                                                    {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                                                </Button>
                                            </>
                                        ) : record.paymentStatus == "NOT_PAID" || record.paymentStatus == "PARTIALLY_PAID" ? (
                                            <>
                                                {/* Action buttons for regular tenants */}
                                                {getCurrentDate().getTime() > new Date(record.endDate).getTime() && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PaymentIcon />}
                                                        onClick={() => handleCollectPayment(record)}
                                                        sx={(theme: Theme) => ({
                                                            backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
                                                            borderRadius: '12px',
                                                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            padding: '8px 16px',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                                                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.mode === 'dark' ? '#047857' : '#059669',
                                                                boxShadow: theme.palette.mode === 'dark'
                                                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        })}
                                                        size="small"
                                                    >
                                                        Collect
                                                    </Button>
                                                )}
                                                {getCurrentDate().getTime() > new Date(record.endDate).getTime() && (
                                                    <Button
                                                    variant="outlined"
                                                    startIcon={<WhatsAppIcon />}
                                                    onClick={() => handleWhatsAppReminder(record)}
                                                    sx={(theme: Theme) => ({
                                                        borderColor: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                                                        color: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '8px 16px',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? 'rgba(52, 211, 153, 0.1)'
                                                                : '#d1fae5',
                                                            borderColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                                                            color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    })}
                                                    size="small"
                                                >
                                                    WhatsApp Reminder
                                                </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<ElectricBoltIcon />}
                                                    endIcon={expandedRentId === record._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    onClick={() => toggleReadings(record._id)}
                                                    sx={(theme: Theme) => ({
                                                        borderColor: theme.palette.mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                                                        color: theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6',
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '8px 16px',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? 'rgba(139, 92, 246, 0.1)'
                                                                : '#f3f4f6',
                                                            borderColor: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                            color: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    })}
                                                    size="small"
                                                >
                                                    {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                                                </Button>
                                            </>
                                        ) :
                                            <>
                                                {/* Share Receipt button for fully paid records with receipt */}
                                                {record.paymentStatus === "FULLY_PAID" && record.receiptUrl && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<WhatsAppIcon />}
                                                        onClick={() => handleShareReceipt(record)}
                                                        sx={(theme: Theme) => ({
                                                            backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
                                                            borderRadius: '12px',
                                                            color: '#fff',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            padding: '8px 16px',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                                                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.mode === 'dark' ? '#047857' : '#059669',
                                                                boxShadow: theme.palette.mode === 'dark'
                                                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        })}
                                                        size="small"
                                                    >
                                                        Share Receipt
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<ElectricBoltIcon />}
                                                    endIcon={expandedRentId === record._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    onClick={() => toggleReadings(record._id)}
                                                    sx={(theme: Theme) => ({
                                                        borderColor: theme.palette.mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                                                        color: theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6',
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '8px 16px',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? 'rgba(139, 92, 246, 0.1)'
                                                                : '#f3f4f6',
                                                            borderColor: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                            color: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    })}
                                                    size="small"
                                                >
                                                    {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                                                </Button>
                                            </>
                                        }
                                    </div>
                                </div>
                            </CardContent>
                            {/* Rent History Details Section with Payment History and Electricity Readings */}
                            <RentHistoryDetails
                                record={record}
                                isExpanded={expandedRentId === record._id}
                                onToggle={() => toggleReadings(record._id)}
                            />
                        </Card>
                    ))
                )}
            </div>
            {/* Payment Collection Form */}
            <PaymentCollectionForm
                isOpen={paymentFormOpen}
                onClose={() => {
                    setPaymentFormOpen(false);
                    setSelectedRentForPayment(null);
                }}
                onSubmitCallback={handlePaymentSubmit}
                rentRecord={selectedRentForPayment}
                setPaymentFormOpen={setPaymentFormOpen}
            />

            {/* Eviction Form */}
            <EvictionForm
                isOpen={evictionFormOpen}
                onClose={() => setEvictionFormOpen(false)}
                onSubmitCallback={handleEvictionSubmit}
                rentRecord={selectedRentForEviction}
            />

            {/* Notice Form for updating existing notices */}
            <NoticeForm
                isOpen={noticeFormOpen}
                onClose={() => {
                    setNoticeFormOpen(false);
                    setSelectedRentForNotice(null);
                }}
                onSubmitCallback={() => {
                    setNoticeFormOpen(false);
                    setSelectedRentForNotice(null);
                }}
                tenantName={selectedRentForNotice?.tenant?.tenantName || ''}
                roomData={selectedRentForNotice?.room || {}}
                cycleEndDate={selectedRentForNotice?.endDate || ''}
                monthlyRent={selectedRentForNotice?.rent || 0}
                tenantId={selectedRentForNotice?.tenant?._id || ''}
                existingNotice={selectedRentForNotice?.notice || null}
            />

            {/* Cancel Notice Confirmation Dialog */}
            <CancelNoticeDialog
                open={cancelNoticeDialogOpen}
                onClose={handleCancelNoticeDialog}
                onConfirm={handleConfirmCancelNotice}
                noticeToCancel={noticeToCancel}
                isCancelling={cancellingNoticeId === noticeToCancel?.notice?._id}
            />
        </div>
    )
}