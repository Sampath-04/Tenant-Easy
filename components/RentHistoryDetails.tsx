import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { RentHistoryItem } from '../lib/api/rentHistory';
import PaymentHistory from './PaymentHistory';
import ElectricityReadingsSection from './ElectricityReadingsSection';

interface RentHistoryDetailsProps {
  record: RentHistoryItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const RentHistoryDetails: React.FC<RentHistoryDetailsProps> = ({
  record,
  isExpanded,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
      <AccordionSummary
      />
      
      <AccordionDetails className="p-0">
        <Box>
          {/* Tabs */}
          <Box sx={{ borderColor: 'divider',}}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: '48px',
                },
                '& .Mui-selected': {
                  color: '#1d4ed8',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              <Tab 
                // icon={<ReceiptIcon />} 
                label="Payment History" 
                iconPosition="start"
                sx={{ 
                  '& .MuiTab-iconWrapper': {
                    marginRight: '8px',
                  }
                }}
              />
              <Tab 
                // icon={<ElectricMeterIcon />} 
                label="Electricity Readings" 
                iconPosition="start"
                sx={{ 
                  '& .MuiTab-iconWrapper': {
                    marginRight: '8px',
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box>
             {activeTab === 0 && (
               <PaymentHistory
                 rentPayments={record.paymentTransactions || []}
                 noticePayments={record.notice?.payments || []}
                 totalPaidAmount={
                   record.notice 
                     ? record.notice.totalPaidAmount || 0
                     : record.paymentTransactions?.reduce((sum, payment) => sum + payment.amount, 0) || 0
                 }
                 remainingAmount={
                   record.notice 
                     ? record.notice.remainingAmount || 0
                     : record.totalAmount - (record.paymentTransactions?.reduce((sum, payment) => sum + payment.amount, 0) || 0)
                 }
                 totalAmount={
                   record.notice 
                     ? record.notice.totalAmount || 0
                     : record.totalAmount
                 }
               />
             )}
             
             {activeTab === 1 && (
               <ElectricityReadingsSection
                 electricityReadings={record.electricityReadings || []}
                 noticeReadings={record.notice?.electricityReadings || []}
                 totalElectricityBill={record.notice?.electricityBill ? record.electricityBill + record.notice.electricityBill : record.electricityBill}
                 isExpanded={true}
               />
             )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default RentHistoryDetails;
