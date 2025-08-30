'use client';

import { AppHeader } from '@/components/AppHeader';
import TabbedLayout from '@/components/TabbedLayout';
import { usePathname } from 'next/navigation';
import { useProperty } from '@/contexts/PropertyContext';
const tabRoutes = [
    { label: 'Upcoming', path: '/dashboard/tenant-onboard-payments/upcoming' },
    { label: 'Pending', path: '/dashboard/tenant-onboard-payments/pending' },
    { label: 'Completed', path: '/dashboard/tenant-onboard-payments/completed' },
];

export default function TenantOnboardPaymentsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { selectedProperty } = useProperty();
    const currentTabIndex = tabRoutes.findIndex((tab) =>
        pathname?.startsWith(tab.path)
    );

    const safeTabIndex = currentTabIndex === -1 ? 0 : currentTabIndex;

    const tabs = tabRoutes.map((tab) => ({
        label: tab.label,
        component: <></>,
    }));

    return (
        <div> 
        <AppHeader
        title="Upcoming Tenants"
        subtitle={`${selectedProperty?.name || 'Property'} - Future Check-ins`}
        />
        <TabbedLayout
            title="Tenant Onboard Payments"
            tabs={tabs}
            currentIndex={safeTabIndex}
            onTabChangeHref={(index: number) => tabRoutes[index].path}
        >
            {children}
        </TabbedLayout>
        </div>
    );
}
