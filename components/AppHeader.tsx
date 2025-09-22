'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { PropertySelector } from './ui/PropertySelector';
import ThemeToggle from './ui/ThemeSwitcher';
import { 
  LogoutOutlined, 
  Menu as MenuIcon, 
  Close as CloseIcon, 
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MenuItem, menuItems, actionItems } from './DashboardSidebar';
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleExpandToggle = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    
    // Exact match
    if (pathname === href) return true;
    
    // For dashboard, only match exact path or direct children (not all sub-routes)
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    
    // For other routes, check if pathname starts with href + '/'
    return pathname.startsWith(href + '/');
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
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 py-2 md:py-3">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center md:h-16 h-12">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                {title}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getCurrentDate().toLocaleDateString()}
                </p>
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

        {/* {getCurrentDate().toLocaleDateString()} */}

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
              {/* Property Selector - Mobile */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Property
                </h3>
                <PropertySelector />
              </div>

              {/* Main Navigation */}
              <nav>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.id}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => handleExpandToggle(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                              expandedItems.includes(item.id)
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="w-5 h-5 mr-3 text-current relative -top-1">
                                {item.icon}
                              </span>
                              <p>{item.label}</p>
                            </div>
                            {expandedItems.includes(item.id) ? (
                              <ExpandLess className="w-5 h-5" />
                            ) : (
                              <ExpandMore className="w-5 h-5" />
                            )}
                          </button>
                          {expandedItems.includes(item.id) && (
                            <div className="ml-8 space-y-1 mt-1">
                              {item.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => child.href && handleNavigate(child.href)}
                                  className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                                    isActive(child.href)
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <span className="w-4 h-4 mr-3 text-current relative -top-1">
                                    {child.icon}
                                  </span>
                                  <p>{child.label}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => item.href && handleNavigate(item.href)}
                          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="w-5 h-5 mr-3 text-current relative -top-1">
                            {item.icon}
                          </span>
                          <p>{item.label}</p>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {actionItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.href && handleNavigate(item.href)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="w-5 h-5 mr-3 text-current">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
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


