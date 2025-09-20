import { apiClient } from './client';

interface MoveTenantData {
  tenantId: string;
  newRoomId: string;
  electricityReadings: {
    currentRoomReading: number;
    newRoomReading: number;
  };
}

export async function moveTenant(data: MoveTenantData): Promise<{ success: boolean; message: string }> {
  return apiClient.patch(`/tenants/${data.tenantId}/move-room`, {
    newRoomId: data.newRoomId,
    electricityReadings: data.electricityReadings,
  });
}
