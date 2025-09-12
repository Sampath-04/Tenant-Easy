// API Types for the application
import { Room } from './properties';
import { RentHistoryItem } from './rentHistory';

export interface CreateUserRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'admin' | 'tenant' | 'owner';
}

export interface User {
  id: string;
  _id?: string;  // MongoDB ObjectId
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'tenant' | 'owner';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;  // MongoDB version key
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

// Detailed Room interface for API response
export interface ElectricityReading {
  _id: string;
  recordedBy: {
    name: string;
    role: string;
  };
  room: string;
  meterReading: number;
  previousReading: number;
  tenantsPresent: {
    _id: string;
    tenantName: string;
  }[];
  consumption: number;
  perTenantCost: number;
  id: string;
  notes: string;
  isAutoRecorded: boolean;
}

export interface RoomDetail {
  _id: string;
  property: {
    electricitySettings: {
      ratePerUnit: number;
    };
    _id: string;
    propertyName: string;
    propertyAddress: string;
  };
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  tenants: any[];
  upcomingTenants: any[];
  amenities: string[];
  currentMeterReading: number;
  isActive: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  electricityReadings: ElectricityReading[];
}

export interface RoomsListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: RoomDetail[];
  summary: {
    totalRooms: number;
    recorded: number;
    pending: number;
    totalTenants: number;
}
}

export interface Property {
  _id: string;
  propertyName: string;
  propertyAddress: string;
  foodAmount: number;
  electricitySettings: {
    ratePerUnit: number;
  };
}

// Tenant related types
interface CycleInfo {
  month: string;
  paymentStatus: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  totalAmount: number;
  dueDate: string;
  startDate?: string;
  endDate: string;
}

export interface Payments{
  _id: string;
  amount: number;
  paymentType: "SECURITY_DEPOSIT" | "ONBOARDING_RENT";
  method: "UPI" | "CASH" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
  paidAt: string;
  isSuccessful: boolean;
  isPending: boolean;
  id: string;
}

export interface Tenant {
  _id: string;
  room: Room;
  property: Property;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  currentReading?: number;
  monthlyRent: number;
  securityDepositTotal?: number;
  securityDepositPaid?: number;
  foodOpted?: boolean;
  baseRent: number; 
  foodAmount: number;
  onboardingPayments: Payments[];
  status: 'onboarded' | 'notice_serving' | 'evicted';
  evictedDate?: Date;
  checkInDate: string;
  checkOutDate?: Date;
  notice: {
    _id: string;
    noticeDate: Date;
    noticeEndsOn: Date;
    rent: number;
    totalAmount: number;
  };
  recentPayments?:  RentHistoryItem[];
  pendingRents?: {
    pendingRentRecords: RentHistoryItem[];
    totalPending: number;
    count: number;
  };
  currentCycle?: CycleInfo;
  previousCyclePaymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  previousCycle?: CycleInfo;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TenantsListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: Tenant[];
}

export interface TenantFilters {
  status?: 'onboarded' | 'notice_serving' | 'evicted' | '';
  property?: string;
  room?: string;
  search?: string; // Search by name, email, or phone
  isActive?: boolean | '';
  rentRange?: {
    min?: number;
    max?: number;
  };
  checkInDateRange?: {
    from?: string;
    to?: string;
  };
  sortBy?: 'tenantName' | 'checkInDate' | 'monthlyRent' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTenantsRequest {
  page?: number;
  limit?: number;
  filters?: TenantFilters;
  propertyId?: string;
}

// Profile and Property types
export interface PropertyData {
  _id: string;
  propertyName: string;
  propertyAddress: string;
  isActive: boolean;
  foodAmount: number;
  summary: {
    totalTenants: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    pendingRentAmount: number;
    pendingRentCount: number;
    dueRentAmount: number;
    dueRentCount: number;
    pendingOnboardingAmount: number;
    pendingOnboardingCount: number;
    pendingSecurityAmount: number;
    pendingRentOnboardingAmount: number;
    monthlyRevenue: number;
  };
}

export interface Profile {
  _id: string;
  owner: string; // Changed from object to string ID
  businessName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  address: string;
  properties: PropertyData[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProfilesResponse {
  success: boolean;
  data: Profile[];
}

// Types for getAllProfiles response
export interface ProfilePropertyData {
  _id: string;
  propertyName: string;
  propertyAddress: string;
  isActive: boolean;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalTenants: number;
  occupancyRate: number;
}

export interface ProfileOwner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  id: string;
}

export interface ProfileWithProperties {
  _id: string;
  owner: ProfileOwner;
  businessName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  address: string;
  properties: ProfilePropertyData[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetAllProfilesResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: ProfileWithProperties[];
}

export interface GetUsersResponse {
  users: User[];
  total: number;
}

// Rent History types - moved to rentHistory.ts

export interface GetRentHistoryRequest {
  page?: number;
  limit?: number;
  tenantId?: string;
  propertyId?: string;
  roomId?: string;
  month?: string;
  paymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
}
