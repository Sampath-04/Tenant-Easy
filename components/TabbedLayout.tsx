"use client";

import React from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
import { LAYOUT_CLASSES } from "@/lib/constants/styles";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface TabData {
  label: string;
  component: React.ReactNode;
}

interface TabbedLayoutProps {
  title: string;
  tabs: TabData[];
  currentIndex: number;
  onTabChangeHref: (index: number) => string;
  children: React.ReactNode;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function TabbedLayout({
  tabs,
  currentIndex,
  onTabChangeHref,
  children }: TabbedLayoutProps) {

  return (
    <Box>
      {/* Tabs Container */}
      <Box 
        sx={(theme) => ({ 
          borderBottom: 1, 
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '0px',
          padding: '0 24px',
        })}
        
      >
        <Tabs 
          value={currentIndex} 
          aria-label="tenant-onboard-payments-tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#3b82f6',
              height: '3px',
              borderRadius: '2px',
            },
            '& .MuiTabs-flexContainer': {
              gap: '8px',
            },
            '& .MuiTabs-list': {
              justifyContent: 'center',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Typography
                  variant="body1"
                  sx={(theme) => ({
                    textTransform: 'none',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontWeight: currentIndex === index ? 600 : 500,
                    fontSize: '14px',
                    color: currentIndex === index 
                      ? theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937'
                      : theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: currentIndex === index 
                        ? theme.palette.mode === 'dark' ? '#f9fafb' : '#1f2937'
                        : theme.palette.mode === 'dark' ? '#d1d5db' : '#374151',
                    },
                  })}
                >
                  {tab.label}
                </Typography>
              }
              component={Link}
              href={onTabChangeHref(index)}
              sx={(theme) => ({
                minHeight: '56px',
                padding: '12px 20px',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: currentIndex === index 
                  ? theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.04)'
                  : 'transparent',
                borderBottom: currentIndex === index ? '3px solid #3b82f6' : '3px solid transparent',
                '&:hover': {
                  backgroundColor: currentIndex === index 
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.25)'
                      : 'rgba(59, 130, 246, 0.08)'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(156, 163, 175, 0.1)'
                      : 'rgba(107, 114, 128, 0.04)',
                  textDecoration: 'none',
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.04)',
                },
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-visible': {
                  outline: '2px solid #3b82f6',
                  outlineOffset: '2px',
                },
              })}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box 
        sx={(theme) => ({ 
          backgroundColor: theme.palette.background.paper,
          borderRadius: '0 0 12px 12px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          minHeight: '200px',
        })}
      >
        {tabs.map((_, index) => (
          <CustomTabPanel key={index} value={currentIndex} index={index}>
            {children}
          </CustomTabPanel>
        ))}
      </Box>
    </Box>
  );
}
