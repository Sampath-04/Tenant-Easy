import { apiClient } from './client';
import { Room } from './properties';

export interface ElectricityReadingRequest {
  property: string;
  room: string;
  meterReading: number;
  recordedBy: {
    name: string;
  };
}

export interface ElectricityReadingResponse {
  success: boolean;
  message: string;
  data: {
    property: any;
    room: {
      _id: string;
      roomNo: string;
      roomType: string;
      tenants: string[];
    };
    meterReading: number;
    previousReading: number;
    tenantsPresent: string[];
    readingDate: string;
    recordedBy: {
      name: string;
      role: string;
    };
    isProcessed: boolean;
    _id: string;
    belongsTo: Array<{
      collectionName: string;
      id: string;
    }>;
    createdAt: string;
    updatedAt: string;
    consumption: number;
    __v: number;
    perTenantCost: number;
    id: string;
  };
}

export interface RoomsResponse {
  success: boolean;
  data: Room[];
}

export async function recordElectricityReading(data: ElectricityReadingRequest): Promise<ElectricityReadingResponse> {
  return apiClient.post<ElectricityReadingResponse>('/electricity-readings/', data);
}


