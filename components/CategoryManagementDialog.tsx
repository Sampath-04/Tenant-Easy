'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAddSubcategory,
  useUpdateSubcategory,
  useRemoveSubcategory,
} from '@/hooks/useCategories';

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  onCategoriesUpdated?: () => void;
}

interface EditingState {
  categoryId: string | null;
  subcategoryName: string | null;
  type: 'category' | 'subcategory' | null;
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  open,
  onClose,
  profileId,
  onCategoriesUpdated,
}) => {
  const theme = useTheme();
  const [editing, setEditing] = useState<EditingState>({ categoryId: null, subcategoryName: null, type: null });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingValue, setEditingValue] = useState('');

  // React Query hooks
  const { data: categoriesResponse, isLoading, error } = useCategories(profileId);
  const createCategoryMutation = useCreateCategory(profileId);
  const updateCategoryMutation = useUpdateCategory(profileId);
  const deleteCategoryMutation = useDeleteCategory(profileId);
  const addSubcategoryMutation = useAddSubcategory(profileId);
  const updateSubcategoryMutation = useUpdateSubcategory(profileId);
  const removeSubcategoryMutation = useRemoveSubcategory(profileId);

  const categories = categoriesResponse?.data || [];
  const submitting = createCategoryMutation.isPending || 
                    updateCategoryMutation.isPending || 
                    deleteCategoryMutation.isPending ||
                    addSubcategoryMutation.isPending ||
                    updateSubcategoryMutation.isPending ||
                    removeSubcategoryMutation.isPending;

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    const categoryData = {
      name: newCategoryName.trim().toUpperCase().replace(/\s+/g, '_'),
      subcategories: [],
    };

    createCategoryMutation.mutate(categoryData, {
      onSuccess: () => {
        setNewCategoryName('');
        onCategoriesUpdated?.();
      },
    });
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editingValue.trim()) {
      return;
    }

    const categoryData = {
      name: editingValue.trim().toUpperCase().replace(/\s+/g, '_'),
    };

    updateCategoryMutation.mutate({ categoryId, categoryData }, {
      onSuccess: () => {
        setEditing({ categoryId: null, subcategoryName: null, type: null });
        setEditingValue('');
        onCategoriesUpdated?.();
      },
    });
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    deleteCategoryMutation.mutate(categoryId, {
      onSuccess: () => {
        onCategoriesUpdated?.();
      },
    });
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategoryName.trim()) {
      return;
    }

    const subcategoryData = {
      name: newSubcategoryName.trim().toUpperCase().replace(/\s+/g, '_'),
    };

    addSubcategoryMutation.mutate({ categoryId, subcategoryData }, {
      onSuccess: () => {
        setNewSubcategoryName('');
        onCategoriesUpdated?.();
      },
    });
  };

  const handleUpdateSubcategory = async (categoryId: string, oldName: string) => {
    if (!editingValue.trim()) {
      return;
    }

    const subcategoryData = {
      name: editingValue.trim().toUpperCase().replace(/\s+/g, '_'),
    };

    updateSubcategoryMutation.mutate({ categoryId, oldName, subcategoryData }, {
      onSuccess: () => {
        setEditing({ categoryId: null, subcategoryName: null, type: null });
        setEditingValue('');
        onCategoriesUpdated?.();
      },
    });
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryName: string) => {
    if (!confirm(`Are you sure you want to delete the subcategory "${subcategoryName}"?`)) {
      return;
    }

    removeSubcategoryMutation.mutate({ categoryId, subcategoryName }, {
      onSuccess: () => {
        onCategoriesUpdated?.();
      },
    });
  };

  const startEditing = (categoryId: string, type: 'category' | 'subcategory', subcategoryName?: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (type === 'category' && category) {
      setEditing({ categoryId, subcategoryName: null, type });
      setEditingValue(category.name.replace(/_/g, ' '));
    } else if (type === 'subcategory' && subcategoryName) {
      setEditing({ categoryId, subcategoryName, type });
      setEditingValue(subcategoryName.replace(/_/g, ' '));
    }
  };

  const cancelEditing = () => {
    setEditing({ categoryId: null, subcategoryName: null, type: null });
    setEditingValue('');
  };

  const formatCategoryName = (name: string) => {
    return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
          backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Manage Categories
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: '24px !important', backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Error loading categories'}
          </Alert>
        )}

        {/* Add New Category Section */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            Add New Category
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <Button
              variant="contained"
              onClick={handleCreateCategory}
              disabled={submitting || !newCategoryName.trim()}
              startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>

        {/* Categories List */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {categories.length === 0 ? (
              <Alert severity="info">
                No categories found. Create your first category above.
              </Alert>
            ) : (
              categories.map((category) => (
                <Accordion key={category._id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flexGrow: 1 }}>
                        {formatCategoryName(category.name)}
                      </Typography>
                      <Chip
                        label={`${category.subcategoryCount} subcategories`}
                        size="small"
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(category._id, 'category');
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category._id, category.name);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Edit Category Name */}
                    {editing.categoryId === category._id && editing.type === 'category' ? (
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category._id)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateCategory(category._id)}
                          color="primary"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={cancelEditing}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : null}

                    {/* Add New Subcategory */}
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add new subcategory"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category._id)}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAddSubcategory(category._id)}
                        disabled={submitting || !newSubcategoryName.trim()}
                        startIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                    </Box>

                    {/* Subcategories List */}
                    <List dense>
                      {category.subcategories.map((subcategory, index) => (
                        <React.Fragment key={subcategory}>
                          <ListItem sx={{ px: 0 }}>
                            {editing.categoryId === category._id && 
                             editing.subcategoryName === subcategory && 
                             editing.type === 'subcategory' ? (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateSubcategory(category._id, subcategory)}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateSubcategory(category._id, subcategory)}
                                  color="primary"
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={cancelEditing}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <>
                                <ListItemText primary={formatCategoryName(subcategory)} />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    size="small"
                                    onClick={() => startEditing(category._id, 'subcategory', subcategory)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteSubcategory(category._id, subcategory)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </>
                            )}
                          </ListItem>
                          {index < category.subcategories.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 2, backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff', borderTop: '1px solid', borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '30px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryManagementDialog;
