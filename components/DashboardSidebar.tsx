'use client';

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as RefundIcon,
  Add as AddIcon,
  ElectricBolt as ElectricIcon,
  Assessment as AssessmentIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AttachMoney as ExpenseIcon,
  PieChart as PieChartIcon,
  RequestPage as RequestPageIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    id: 'rooms',
    label: 'Rooms',
    icon: <RoomIcon />,
    href: '/dashboard/rooms',
  },
  
  {
    id: 'tenants',
    label: 'Tenants',
    icon: <PeopleIcon />,
    href: '/dashboard/tenants',
  },
  {
    id: 'rents',
    label: 'Rents',
    icon: <PaymentIcon />,
    href: '/dashboard/rent-records',
  },
  {
    id: 'refunds',
    label: 'Refunds',
    icon: <RefundIcon />,
    href: '/dashboard/refunds',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <AssessmentIcon />,
    href: '/dashboard/reports',
  },
  {
    id: 'profit-loss',
    label: 'Profit Loss',
    icon: <PieChartIcon />,
    href: '/dashboard/profit-loss',
  },
  {
    id: 'payment-requests',
    label: 'Payment Requests',
    icon: <RequestPageIcon />,
    href: '/dashboard/payment-requests',
  },
  {
    id: 'onboard-payments',
    label: 'Onboard Payments',
    icon: <PaymentIcon />,
    children: [
      {
        id: 'upcoming',
        label: 'Upcoming',
        icon: <ReceiptIcon />,
        href: '/dashboard/tenant-onboard-payments/upcoming',
      },
      {
        id: 'pending',
        label: 'Pending',
        icon: <ReceiptIcon />,
        href: '/dashboard/tenant-onboard-payments/pending',
      },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: <ExpenseIcon />,
    children: [
      {
        id: 'expenses',
        label: 'Add Expense',
        icon: <AddIcon />,
        href: '/dashboard/expenses',
      },
      {
        id: 'expenses-list',
        label: 'Expenses List',
        icon: <ReceiptIcon />,
        href: '/dashboard/expenses/list',
      },
    ],
  },

];

const actionItems: MenuItem[] = [
  {
    id: 'add-tenant',
    label: 'Add Tenant',
    icon: <AddIcon />,
    href: '/dashboard/tenants/create',
  },
  {
    id: 'electricity-reading',
    label: 'Take Electricity Reading',
    icon: <ElectricIcon />,
    href: '/dashboard/electricity/take-reading',
  },
];

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  open,
  onToggle,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      // Toggle expansion for items with children
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else if (item.href) {
      // Navigate to the href
      router.push(item.href);
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = isItemActive(item);

    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: isActive ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: isActive 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? theme.palette.primary.main : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && (
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: 1,
                  '& .MuiTypography-root': {
                    fontWeight: isActive ? 600 : 400,
                  },
                }}
              />
            )}
            {hasChildren && open && (
              <Box>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {/* Render children if expanded */}
        {hasChildren && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerWidth = open ? 280 : 65;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding:"14px",
          minHeight: 90,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {open && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Easy Tenant
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small" sx={{p:2}}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Main Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{margin: "0"}}>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Action Menu */}
      <Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {open && (
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Actions
            </Typography>
          )}
        </Box>
        <List>
          {actionItems.map(item => {
            const isActive = isItemActive(item);
            return (
              <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => handleItemClick(item)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        opacity: 1,
                        '& .MuiTypography-root': {
                          fontWeight: isActive ? 600 : 400,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};
