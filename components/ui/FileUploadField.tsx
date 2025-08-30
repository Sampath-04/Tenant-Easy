'use client';

import React, { useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface FileUploadFieldProps {
  onFileSelect: (files: File | File[]) => void;
  accept: string;
  placeholder: string;
  multiple?: boolean;
  selectedFiles?: File[];
  maxFiles?: number;
}

export default function FileUploadField({ 
  onFileSelect, 
  accept, 
  placeholder, 
  multiple = false, 
  selectedFiles = [], 
  maxFiles = 4 
}: FileUploadFieldProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      // Append new files to existing ones, respecting max limit
      const currentFiles = selectedFiles || [];
      const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
      onFileSelect(newFiles);
    } else {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, multiple, selectedFiles, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      const [type, ext] = curr.trim().split('/');
      if (ext) {
        acc[type] = [ext];
      } else {
        acc[curr.trim()] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
    disabled: selectedFiles && selectedFiles.length >= maxFiles
  });

  const removeFile = (index: number) => {
    if (multiple && selectedFiles) {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      onFileSelect(newFiles);
    }
  };

  const currentFileCount = selectedFiles ? selectedFiles.length : 0;
  const isMaxReached = currentFileCount >= maxFiles;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : isMaxReached
            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400">Drop the files here...</p>
        ) : isMaxReached ? (
          <p className="text-gray-500 dark:text-gray-400">Maximum {maxFiles} files reached</p>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: JPG, PNG, GIF, BMP, WebP
            </p>
          </div>
        )}
      </div>

      <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
        {currentFileCount}/{maxFiles} files selected
      </p>

      {/* Image Previews */}
      {selectedFiles && selectedFiles.length > 0 && (
        <Box className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Selected Files:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group w-[160px] h-[160px]">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <IconButton
                  onClick={() => removeFile(index)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  title="Remove file"
                >
                  <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                </IconButton>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}
    </div>
  );
}
