'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, AuthUser, LoginRequest } from '../lib/api/auth';
import { ApiError } from '../lib/api';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../lib/toast-config';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}


const redirectToDashboard = (user: AuthUser) => {
    switch (user.role) {
        case 'admin':
            return '/admin';
        case 'manager':
            return '/admin';
        case 'owner':
            return '/dashboard';
        case 'tenant':
            return '/tenant';
        default:
            return '/';
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.me();
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
    
      if (response.success && response.user) {
        setUser(response.user);
        
        // Show success toast
        const successToast = showSuccessToast(`Welcome back, ${response.user.name}!`);
        toast.success(successToast.message, successToast.config);
        
        // Add delay before navigation to show toast
        setTimeout(() => {
          // Navigate based on role
          if (response.user.role === 'admin') {
            router.push('/admin');
          } else if (response.user.role === 'manager') {
            router.push('/admin'); // Managers also go to admin dashboard
          } else if (response.user.role === 'owner') {
            console.log("user logged in as owner");
            router.push('/dashboard'); // Fallback to home for now
          } else if (response.user.role === 'tenant') {
            router.push('/tenant'); // Tenant dashboard (to be created)
          } else {
            router.push('/'); // Fallback to home
          }
        }, 1500); // 1.5 second delay to show toast
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof ApiError 
        ? error.getUserMessage() 
        : 'Login failed. Please try again.';
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      
      // Show logout success
      const successToast = showSuccessToast('Logged out successfully');
      toast.success(successToast.message, successToast.config);
      
      // Short delay before navigation
      setTimeout(() => {
        router.push('/login');
      }, 1000); // 1 second delay for logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Avoid global redirect on every page. Only redirect after login or
  // when user is on neutral routes like '/' or '/login'.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (pathname === '/' || pathname === '/login') {
      const redirectPath = redirectToDashboard(user as AuthUser);
      router.replace(redirectPath);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Auto-redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard component
interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'tenant' | 'owner')[];
  fallback?: ReactNode;
}

export function AuthGuard({ children, allowedRoles, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin' || user.role === 'manager') {
          router.push('/admin');
        } else if (user.role === 'owner') {
          router.push('/dashboard');
        } else if (user.role === 'tenant') {
          router.push('/tenant');
        } else {
          router.push('/');
        }
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show fallback or nothing if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Check role permissions
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
