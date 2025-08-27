import { apiClient } from './client';

export interface CompleteNoticeData {
  noticeId: string;
  electricityUnit: number;
  tenantQrCode?: File;
  comments?: string;
}

export const completeNotice = async (data: CompleteNoticeData): Promise<{ success: boolean; message: string }> => {

  const formData = new FormData();

  formData.append('electricityUnit', data.electricityUnit.toString());
  if (data.tenantQrCode) {
    formData.append('tenantQrCode', data.tenantQrCode, data.tenantQrCode.name);
  }
  formData.append('comments', data.comments || '');

  const response = await apiClient.post(`/notices/${data.noticeId}/complete`, formData);
  return response as { success: boolean; message: string };
};

export const cancelNotice = async (noticeId: string): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await apiClient.post(`/notices/${noticeId}/cancel`, {});
  return response as { success: boolean; message: string; data: any };
};
