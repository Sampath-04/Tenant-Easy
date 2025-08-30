'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { PropertySelector } from './ui/PropertySelector';
import ThemeToggle from './ui/ThemeSwitcher';
import { LogoutOutlined, Menu as MenuIcon, Close as CloseIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import BreadCrumbs from './ui/BreadCrumbs';
import { getCurrentDate } from '@/lib/utils/formatters';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ 
  title, 
  subtitle,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Block scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="sticky top-0 z-50">
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 py-2 md:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Property Selector - Hidden on mobile */}
            <div className="hidden md:block">
              <PropertySelector />
            </div>
  

            {/* Desktop User Menu - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => logout()}
                className="text-gray-600 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-700 hover:text-gray-900 dark:hover:text-gray-300 font-medium transition-colors rounded-[30px] p-3"
              >
                <LogoutOutlined className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                Logout
              </button>
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {getCurrentDate().toLocaleDateString()}

        {/* Mobile Sidebar */}
        <div 
          className={`md:hidden fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Navigation Links */}
              <nav className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/tenants" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Tenants
                </Link>
                <Link 
                  href="/dashboard/properties" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0H5.5a2.5 2.5 0 010-5H8" />
                  </svg>
                  Properties
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-3 text-gray-800 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
              >
                <LogoutOutlined className="w-4 h-4 mr-2 text-gray-800 dark:text-gray-300" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    </div>
  );
}


