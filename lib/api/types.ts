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

export interface GetUsersResponse {
  users: User[];
  total: number;
}
