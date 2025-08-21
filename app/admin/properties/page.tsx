'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import { getAllProfiles } from '@/lib/api/profiles';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ProfilePropertyData } from '@/lib/api/types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


function PropertiesContent() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("profiles", profiles);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await getAllProfiles();
        console.log('Profiles Response:', response);
        setProfiles(response);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to fetch profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Manage Properties"
          subtitle="View and manage all properties"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading properties...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Manage Properties"
          subtitle="View and manage all properties"
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Properties</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Manage Properties"
        subtitle="View and manage all properties"
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Properties Overview
              </h1>
            </div>

            {profiles && (
              <div className="space-y-6">

                {profiles && profiles.length > 0 ? (
                  <div className="space-y-6">
                        {profiles.map((owner: any) => (
                           <Accordion key={owner._id} className="mb-4 rounded-xl shadow">
                           <AccordionSummary
                             expandIcon={<ExpandMoreIcon />}
                             className="bg-gray-100 dark:bg-gray-800 rounded-t-xl"
                           >
                             <div>
                               <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                 {owner.businessName}
                               </h2>
                               <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Owner: {owner.ownerName} | Contact: {owner.contactNumber}
                               </p>
                             </div>
                           </AccordionSummary>
                           <AccordionDetails className="bg-white dark:bg-gray-900 rounded-b-xl">
                             {owner.properties.length === 0 ? (
                               <p className="text-gray-500">No properties added yet.</p>
                             ) : (
                               <div className="overflow-x-auto">
                                 <table className="w-full border-collapse">
                                   <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
                                     <tr>
                                        <th className="p-3 text-left font-semibold">Property Name</th>
                                        <th className="p-3 text-left font-semibold">Address</th>
                                        <th className="p-3 text-center font-semibold">Total Rooms</th>
                                        <th className="p-3 text-center font-semibold">Occupied</th>
                                        <th className="p-3 text-center font-semibold">Available</th>
                                        <th className="p-3 text-center font-semibold">Tenants</th>
                                        <th className="p-3 text-center font-semibold">Occupancy</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                     </tr>
                                   </thead>
                                   <tbody>
                                     {owner.properties.map((property: ProfilePropertyData, idx: number) => (
                                       <tr
                                         key={property._id}
                                         className={`text-sm ${
                                           idx % 2 === 0
                                             ? "bg-white dark:bg-gray-900"
                                             : "bg-gray-50 dark:bg-gray-800"
                                         } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                                       >
                                         <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                                           {property.propertyName}
                                         </td>
                                         <td className="p-3 text-gray-600 dark:text-gray-400">
                                           {property.propertyAddress}
                                         </td>
                                         <td className="p-3 text-center">{property.totalRooms}</td>
                                         <td className="p-3 text-center">{property.occupiedRooms}</td>
                                         <td className="p-3 text-center">{property.availableRooms}</td>
                                         <td className="p-3 text-center">{property.totalTenants}</td>
                                         <td className="p-3 text-center">{property.occupancyRate}%</td>
                                                                                   <td className="p-3 text-center">
                                            {property.isActive ? (
                                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-100">
                                                Active
                                              </span>
                                            ) : (
                                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                                Inactive
                                              </span>
                                            )}
                                          </td>
                                          <td className="p-3 text-center">
                                            <button
                                              onClick={() => {
                                                router.push(`/admin/properties/${property._id}`);
                                              }}
                                              className="px-3 cursor-pointer py-1 text-xs font-medium rounded-full transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                              View Details
                                            </button>
                                          </td>
                                       </tr>
                                     ))}
                                   </tbody>
                                 </table>
                               </div>
                             )}
                           </AccordionDetails>
                         </Accordion>
                        ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🏢</div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No Properties Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      No properties have been added yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Properties() {
  return (
    <AuthGuard>
      <PropertiesContent />
    </AuthGuard>
  );
}
