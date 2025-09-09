import { apiClient } from './client';

export interface Subcategory {
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  subcategories: string[];
  profile: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
  subcategoryCount: number;
  id: string;
}

export interface CreateCategoryRequest {
  name: string;
  subcategories: string[];
}

export interface UpdateCategoryRequest {
  name?: string;
  subcategories?: string[];
}

export interface AddSubcategoryRequest {
  name: string;
}

export interface UpdateSubcategoryRequest {
  name: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

// Get all categories for a profile
export const getCategoriesForProfile = async (profileId: string): Promise<CategoriesResponse> => {
  return await apiClient.get(`/categories/profile/${profileId}`);
};

// Create a new category
export const createCategory = async (profileId: string, categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
  return await apiClient.post(`/categories/profile/${profileId}`, categoryData);
};

// Update a category
export const updateCategory = async (categoryId: string, categoryData: UpdateCategoryRequest, profileId: string): Promise<CategoryResponse> => {
  return await apiClient.put(`/categories/${categoryId}`, {
    updateData: categoryData,
    profileId
  });
};

// Delete a category
export const deleteCategory = async (categoryId: string, profileId: string): Promise<{ success: boolean; message: string }> => {
  return await apiClient.post(`/categories/${categoryId}/delete`, { profileId });
};

// Add subcategory to a category
export const addSubcategory = async (categoryId: string, subcategoryData: AddSubcategoryRequest, profileId: string): Promise<CategoryResponse> => {
  return await apiClient.post(`/categories/${categoryId}/subcategories`, {
    ...subcategoryData,
    profileId
  });
};

// Update subcategory in a category
export const updateSubcategory = async (categoryId: string, subcategoryName: string, subcategoryData: UpdateSubcategoryRequest, profileId: string): Promise<CategoryResponse> => {
  return await apiClient.put(`/categories/${categoryId}/subcategories/${subcategoryName}`, {
    ...subcategoryData,
    profileId
  });
};

// Remove subcategory from a category
export const removeSubcategory = async (categoryId: string, subcategoryName: string, profileId: string): Promise<CategoryResponse> => {
  return await apiClient.post(`/categories/${categoryId}/subcategories/${subcategoryName}/delete`, { profileId });
};

