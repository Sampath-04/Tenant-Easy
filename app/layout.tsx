import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../components/providers/QueryProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { PropertyProvider } from "../contexts/PropertyContext";
import { BackendStatus } from "../components/BackendStatus";
import { logConfig } from "../lib/config";
import { ToastContainer } from 'react-toastify';
import { toastContainerConfig } from '../lib/toast-config';
import 'react-toastify/dist/ReactToastify.css';
import { Providers as ThemeProvider } from "../components/providers/Themeprovider";
import { MuiThemeProvider } from "../components/providers/MuiThemeProvider";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <PropertyProvider>
              <ThemeProvider>
                <MuiThemeProvider>
                  {children}
                </MuiThemeProvider>
              </ThemeProvider>
              <BackendStatus />
              <ToastContainer {...toastContainerConfig} />
            </PropertyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
