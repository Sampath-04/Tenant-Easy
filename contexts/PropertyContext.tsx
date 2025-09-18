'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PropertyData } from '../lib/api/types';
import { useAuth } from './AuthContext';
import { useProfile } from '../hooks/useProfile';

export interface  Property {
  id: string;
  name: string;
  address: string;
  profile: string;
  totalRooms: number;
  occupiedRooms: number;
  electricitySettings: {
    ratePerUnit: number;
  };
  totalTenants: number;
  pendingRent: number;
  pendingRentCount: number;
  dueRent: number;
  dueRentCount: number;
  pendingOnboardingAmount: number;
  pendingOnboardingCount: number;
  monthlyRevenue: number;
  foodAmount: number;
}

interface PropertyContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property) => void;
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refreshProperties: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Helper function to convert PropertyData to Property using real API data
const convertToProperty = (propertyData: PropertyData, profileId: string): Property => ({
  id: propertyData._id,
  name: propertyData.propertyName,
  address: propertyData.propertyAddress,
  profile: profileId,
  foodAmount: propertyData.foodAmount,
  electricitySettings: propertyData.electricitySettings,
  // Use actual data from API summary
  totalRooms: propertyData.summary.totalRooms,
  occupiedRooms: propertyData.summary.occupiedRooms,
  totalTenants: propertyData.summary.totalTenants,
  pendingRent: propertyData.summary.pendingRentAmount,
  pendingRentCount: propertyData.summary.pendingRentCount,
  dueRent: propertyData.summary.dueRentAmount,
  dueRentCount: propertyData.summary.dueRentCount,
  pendingOnboardingAmount: propertyData.summary.pendingOnboardingAmount,
  pendingOnboardingCount: propertyData.summary.pendingOnboardingCount,
  monthlyRevenue: propertyData.summary.monthlyRevenue,
});

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedProperty, setSelectedPropertyState] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Use the useProfile hook to fetch profiles
  const { data: profilesResponse, isLoading, error: profileError, refetch } = useProfile();

  // Process profiles data when it changes
  useEffect(() => {
    if (!user?.id || !profilesResponse) {
      return;
    }

    
    if (profilesResponse.data && profilesResponse.data.length > 0) {
      // Always pick the first profile from the array
      const firstProfile = profilesResponse.data[0];
      const propertiesData = firstProfile.properties.filter((p: any) => p.isActive);
      
      console.log("propertiesData",propertiesData);
      // Convert to Property format
      const convertedProperties = propertiesData.map((propertyData: PropertyData) => 
        convertToProperty(propertyData, firstProfile._id)
      );
      setProperties(convertedProperties);

      // Set initial property from localStorage or first property
      const savedPropertyId = localStorage.getItem('selectedPropertyId');
      let initialProperty = convertedProperties[0];

      if (savedPropertyId) {
        const savedProperty = convertedProperties.find((p: any) => p.id === savedPropertyId);
        if (savedProperty) {
          initialProperty = savedProperty;
        }
      }

      if (initialProperty) {
        setSelectedPropertyState(initialProperty);
      }
    } else {
      setProperties([]);
      setSelectedPropertyState(null);
    }
  }, [user?.id, profilesResponse]);

  const setSelectedProperty = (property: Property) => {
    setSelectedPropertyState(property);
    localStorage.setItem('selectedPropertyId', property.id);
  };

  const value = {
    selectedProperty,
    setSelectedProperty,
    properties,
    isLoading,
    error: profileError?.message || null,
    refreshProperties: refetch,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
