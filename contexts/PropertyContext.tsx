'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProfilesByOwner } from '../lib/api/profiles';
import { PropertyData } from '../lib/api/types';
import { useAuth } from './AuthContext';

export interface Property {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  pendingRent: number;
  dueRent: number;
  monthlyRevenue: number;
}

interface PropertyContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property) => void;
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Helper function to convert PropertyData to Property using real API data
const convertToProperty = (propertyData: PropertyData): Property => ({
  id: propertyData._id,
  name: propertyData.propertyName,
  address: propertyData.propertyAddress,
  // Use actual data from API summary
  totalRooms: propertyData.summary.totalRooms,
  occupiedRooms: propertyData.summary.occupiedRooms,
  totalTenants: propertyData.summary.totalTenants,
  pendingRent: propertyData.summary.pendingRentAmount,
  dueRent: propertyData.summary.dueRentAmount,
  monthlyRevenue: propertyData.summary.monthlyRevenue,
});

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedProperty, setSelectedPropertyState] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from API when user is available
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await getProfilesByOwner();
        
        if (response.data && response.data.length > 0) {
          // Always pick the first profile from the array
          const firstProfile = response.data[0];
          const propertiesData = firstProfile.properties.filter(p => p.isActive);
          
          // Convert to Property format
          const convertedProperties = propertiesData.map(convertToProperty);
          setProperties(convertedProperties);

          // Set initial property from localStorage or first property
          const savedPropertyId = localStorage.getItem('selectedPropertyId');
          let initialProperty = convertedProperties[0];

          if (savedPropertyId) {
            const savedProperty = convertedProperties.find(p => p.id === savedPropertyId);
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
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties');
        setProperties([]);
        setSelectedPropertyState(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [user?.id]);

  const setSelectedProperty = (property: Property) => {
    setSelectedPropertyState(property);
    localStorage.setItem('selectedPropertyId', property.id);
  };

  const value = {
    selectedProperty,
    setSelectedProperty,
    properties,
    isLoading,
    error,
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
