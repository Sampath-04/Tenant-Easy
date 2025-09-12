'use client';

import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { AuthGuard } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Sidebar */}
        <DashboardSidebar 
          open={sidebarOpen} 
          onToggle={handleSidebarToggle} 
        />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            backgroundColor: 'background.default',
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: 0,
            ...(sidebarOpen && {
              transition: (theme) =>
                theme.transitions.create('margin', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            }),
          }}
        >
          {/* Content */}
          <Box sx={{ minHeight: '100vh' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
