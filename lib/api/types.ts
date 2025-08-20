// API Types for the application

export interface CreateUserRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'tenant' | 'owner';
}

export interface User {
  id: string;
  _id?: string;  // MongoDB ObjectId
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'manager' | 'tenant' | 'owner';
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

// Room interface
export interface Room {
  _id: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
}

// Detailed Room interface for API response
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
  amenities: string[];
  currentMeterReading: number;
  isActive: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
}

export interface Property {
  _id: string;
  propertyName: string;
  propertyAddress: string;
  electricitySettings: {
    ratePerUnit: number;
  };
}

// Tenant related types
export interface Tenant {
  _id: string;
  room: Room;
  property: Property;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  currentReading?: number;
  tenantIdProof?: {
    idType?: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'other';
    idImageUrl?: string;
  };
  monthlyRent: number;
  securityDepositPaid?: number;
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
  recentPayments?:  RentHistory[];
  pendingRents?: {
    pendingRentRecords: RentHistory[];
    totalPending: number;
    count: number;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
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
  summary: {
    totalTenants: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    pendingRentAmount: number;
    dueRentAmount: number;
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

export interface GetUsersResponse {
  users: User[];
  total: number;
}

// Rent History types
export interface RentHistory {
  _id: string;
  tenant: string;
  property: string;
  room: {
    roomNo: string;
  };
  startDate: string;
  endDate: string;
  month: string; // Format: "YYYY-MM"
  rent: number;
  electricityReadings: string[];
  electricityBill: number;
  electricityUnits: number;
  totalAmount: number;
  isPaid: boolean;
  isOverdue?: boolean;
  paidDate?: string;
  daysOverdue?: number;
  dueDate: string;
  transactionRef?: string;
  notice?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentHistoryResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: RentHistory[];
}

export interface GetRentHistoryRequest {
  page?: number;
  limit?: number;
  tenantId?: string;
  propertyId?: string;
  roomId?: string;
  month?: string;
  isPaid?: boolean;
}
