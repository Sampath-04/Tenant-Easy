import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../components/providers/QueryProvider";
import { BackendStatus } from "../components/BackendStatus";
import { logConfig } from "../lib/config";
import { ToastContainer } from 'react-toastify';
import { toastContainerConfig } from '../lib/toast-config';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy Tenant - Property Management System",
  description: "Modern property management application for tenants, owners, and administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log configuration in development
  if (typeof window !== 'undefined') {
    logConfig();
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <BackendStatus />
          <ToastContainer {...toastContainerConfig} />
        </QueryProvider>
      </body>
    </html>
  );
}
