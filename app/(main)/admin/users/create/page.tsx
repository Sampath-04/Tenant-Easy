'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserCreationForm from '../../../../components/UserCreationForm';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../../../../../lib/toast-config';
import { AuthGuard, useAuth } from '../../../../../contexts/AuthContext';

function CreateUserPageContent() {
    const { logout } = useAuth();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [createdUser, setCreatedUser] = useState<any>(null);

    const handleSuccess = (user: any) => {
        const userData = user;

        if (userData && userData.name) {
            setCreatedUser(userData);
            setSuccessMessage(`User "${userData.name}" has been created successfully!`);
            const successToast = showSuccessToast(`User "${userData.name}" created successfully!`);
            toast.success(successToast.message, successToast.config);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessMessage('');
        setCreatedUser(null);
    };

    const handleError = (error: string) => {
        const errorToast = showErrorToast(`Failed to create user: ${error}`);
        toast.error(errorToast.message, errorToast.config);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="  mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Easy Tenant
                            </h1>
                        </div>

                        <nav className="flex items-center space-x-4">
                            <Link
                                href="/admin/users"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors"
                            >
                                All Users
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </li>
                        <li>
                            <Link href="/admin/users" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Users
                            </Link>
                        </li>
                        <li>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </li>
                        <li className="text-gray-900 dark:text-white font-medium">Create User</li>
                    </ol>
                </nav>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                                        Success!
                                    </h3>
                                    <p className="text-green-700 dark:text-green-400">
                                        {successMessage}
                                    </p>
                                    {createdUser && (
                                        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm">
                                            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">User Details:</h4>
                                            <ul className="space-y-1 text-green-700 dark:text-green-400">
                                                <li><strong>ID:</strong> {createdUser.id}</li>
                                                <li><strong>Name:</strong> {createdUser.name}</li>
                                                <li><strong>Email:</strong> {createdUser.email}</li>
                                                <li><strong>Role:</strong> {createdUser.role}</li>
                                                <li><strong>Phone:</strong> {createdUser.phone}</li>
                                                <li><strong>Status:</strong> {createdUser.isActive ? 'Active' : 'Inactive'}</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleCloseSuccess}
                                className="flex-shrink-0 ml-4 p-1 cursor-pointer rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                                aria-label="Close success message"
                            >
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Add New User
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Create a new user account for your property management system
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Creation Form */}
                <div className="flex justify-center">
                    <UserCreationForm onSuccess={handleSuccess} onError={handleError} />
                </div>

                {/* Quick Actions */}
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/admin/users"
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">View All Users</span>
                        </Link>

                        <Link
                            href="/admin/properties"
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0H5.5a2.5 2.5 0 010-5H8" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Manage Properties</span>
                        </Link>

                        <Link
                            href="/admin/dashboard"
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Dashboard</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CreateUserPage() {
    return (
        <AuthGuard allowedRoles={['admin']}>
            <CreateUserPageContent />
        </AuthGuard>
    );
}
