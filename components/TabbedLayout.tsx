"use client";

import React from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
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
      {value === index && <Box sx={{ padding: "10px" }}>{children}</Box>}
    </div>
  );
}

export default function TabbedLayout({  title,
  tabs,
  currentIndex,
  onTabChangeHref,
  children }: TabbedLayoutProps) {

  return (
    <Box>
      <Box>
        <Typography>
          {title}
        </Typography>

        <Tabs value={currentIndex} aria-label="custom-tab-layout">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              component={Link}
              href={onTabChangeHref(index)}
              sx={{
                textTransform: 'none',
                fontFamily: 'Roboto',
                fontWeight: currentIndex === index ? 600 : 400,
                fontSize: '14px',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((_, index) => (
        <CustomTabPanel key={index} value={currentIndex} index={index}>
          {children}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
