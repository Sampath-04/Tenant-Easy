import { apiClient } from './client';
import { Tenant } from './types';

export interface PropertyDetails {
  electricitySettings: {
    ratePerUnit: number;
  };
  _id: string;
  profile: {
    _id: string;
    businessName: string;
    ownerName: string;
    contactNumber: string;
    email: string;
  };
  propertyName: string;
  propertyAddress: string;
  propertyContactNumber: string;
  rooms: Room[];
  staff: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  occupancyStats: {
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    totalTenants: number;
    totalCapacity: number;
    occupancyRate: string;
  };
}

export interface Room {
  _id: string;
  property: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  tenants: Tenant[];
  amenities: string[];
  currentMeterReading: number;
  isActive: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PropertyDetailsResponse {
  success: boolean;
  data: PropertyDetails;
}

/**
 * Get property details by ID
 */
export async function getPropertyById(propertyId: string): Promise<PropertyDetails> {
  const response = await apiClient.get<PropertyDetailsResponse>(`/properties/${propertyId}`);
  return response.data;
}


// Get basic property data by ID
export interface PropertyBasicData {
  _id: string;
  propertyName: string;
  propertyAddress: string;
}

export interface PropertyBasicResponse {
  success: boolean;
  data: PropertyBasicData;
}

export const getPropertyBasic = async (propertyId: string): Promise<PropertyBasicResponse> => {
  return await apiClient.get(`/properties/${propertyId}/basic`);
};
