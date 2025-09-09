import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getCategoriesForProfile,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory,
  updateSubcategory,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  AddSubcategoryRequest,
  UpdateSubcategoryRequest,
} from '@/lib/api/categories';

// Query key factory
export const categoryKeys = {
  all: ['categories'] as const,
  byProfile: (profileId: string) => [...categoryKeys.all, 'profile', profileId] as const,
};

// Hook to fetch categories for a profile
export const useCategories = (profileId: string) => {
  return useQuery({
    queryKey: categoryKeys.byProfile(profileId),
    queryFn: () => getCategoriesForProfile(profileId),
    enabled: !!profileId,
    staleTime: 0, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new category
export const useCreateCategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryRequest) => 
      createCategory(profileId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    },
  });
};

// Hook to update a category
export const useUpdateCategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, categoryData }: { 
      categoryId: string; 
      categoryData: UpdateCategoryRequest 
    }) => updateCategory(categoryId, categoryData, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    },
  });
};

// Hook to delete a category
export const useDeleteCategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    },
  });
};

// Hook to add a subcategory
export const useAddSubcategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, subcategoryData }: { 
      categoryId: string; 
      subcategoryData: AddSubcategoryRequest 
    }) => addSubcategory(categoryId, subcategoryData, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Subcategory added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    },
  });
};

// Hook to update a subcategory
export const useUpdateSubcategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, oldName, subcategoryData }: { 
      categoryId: string; 
      oldName: string; 
      subcategoryData: UpdateSubcategoryRequest 
    }) => updateSubcategory(categoryId, oldName, subcategoryData, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Subcategory updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating subcategory:', error);
      toast.error('Failed to update subcategory');
    },
  });
};

// Hook to remove a subcategory
export const useRemoveSubcategory = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, subcategoryName }: { 
      categoryId: string; 
      subcategoryName: string 
    }) => removeSubcategory(categoryId, subcategoryName, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.byProfile(profileId) 
      });
      toast.success('Subcategory deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    },
  });
};
