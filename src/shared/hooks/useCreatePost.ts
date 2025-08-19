import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { communityService } from '../services/communityService';
import { CreatePostData, Post } from '../types/community';
import { usePostContext } from '../contexts/PostContext';

interface UseCreatePostOptions {
  onSuccess?: (post: Post) => void;
  onError?: (error: Error) => void;
  autoInvalidate?: boolean;
}

interface CreatePostState {
  isUploading: boolean;
  uploadProgress: number;
  errors: string[];
}

export const useCreatePost = (options: UseCreatePostOptions = {}) => {
  const {
    onSuccess,
    onError,
    autoInvalidate = true
  } = options;

  const queryClient = useQueryClient();
  const postContext = usePostContext();
  const { feedFilter, invalidatePosts } = postContext;

  // Local state for upload progress and errors
  const [createState, setCreateState] = useState<CreatePostState>({
    isUploading: false,
    uploadProgress: 0,
    errors: []
  });

  // Validate post data
  const validatePostData = useCallback((postData: CreatePostData): string[] => {
    const errors: string[] = [];

    if (!postData.content.trim()) {
      errors.push('Content is required');
    }

    if (postData.content.length > 2000) {
      errors.push('Content cannot exceed 2000 characters');
    }

    if (postData.images && postData.images.length > 10) {
      errors.push('Maximum 10 images allowed');
    }

    if (postData.videos && postData.videos.length > 3) {
      errors.push('Maximum 3 videos allowed');
    }

    // Validate file sizes (example: 5MB for images, 50MB for videos)
    if (postData.images) {
      const oversizedImages = postData.images.filter(img => img.size > 5 * 1024 * 1024);
      if (oversizedImages.length > 0) {
        errors.push('Some images exceed 5MB limit');
      }
    }

    if (postData.videos) {
      const oversizedVideos = postData.videos.filter(vid => vid.size > 50 * 1024 * 1024);
      if (oversizedVideos.length > 0) {
        errors.push('Some videos exceed 50MB limit');
      }
    }

    return errors;
  }, []);

  // Upload files with progress simulation
  const uploadFiles = useCallback(async (files: File[], type: 'images' | 'videos') => {
    // Simulate file upload with progress
    const uploadPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            clearInterval(interval);
            // Return mock URL for uploaded file
            resolve(`https://example.com/${type}/${file.name}`);
          }
          
          setCreateState(prev => ({
            ...prev,
            uploadProgress: Math.min(100, prev.uploadProgress + (30 / files.length))
          }));
        }, 100);
      });
    });

    return Promise.all(uploadPromises);
  }, []);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      setCreateState({
        isUploading: true,
        uploadProgress: 0,
        errors: []
      });

      // Validate post data
      const validationErrors = validatePostData(postData);
      if (validationErrors.length > 0) {
        setCreateState(prev => ({ ...prev, errors: validationErrors, isUploading: false }));
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      try {
        // Upload images if any
        if (postData.images && postData.images.length > 0) {
          await uploadFiles(postData.images, 'images');
        }

        // Upload videos if any
        if (postData.videos && postData.videos.length > 0) {
          await uploadFiles(postData.videos, 'videos');
        }

        // Complete upload progress
        setCreateState(prev => ({ ...prev, uploadProgress: 100 }));

        // Create post with uploaded file URLs
        const postDataWithUrls = {
          ...postData,
          images: undefined, // Remove File objects
          videos: undefined, // Remove File objects
          // Note: The community service would handle the URLs differently
          // This is a simplified version for the mock implementation
        };

        const newPost = await communityService.createPost(postDataWithUrls);
        
        setCreateState({
          isUploading: false,
          uploadProgress: 0,
          errors: []
        });

        return newPost;
      } catch (error) {
        setCreateState(prev => ({ 
          ...prev, 
          isUploading: false,
          errors: [error instanceof Error ? error.message : 'Upload failed']
        }));
        throw error;
      }
    },
    onSuccess: (newPost) => {
      // Optimistically add the new post to the cache
      queryClient.setQueryData(['feed', feedFilter], (oldPosts: Post[] | undefined) => {
        return oldPosts ? [newPost, ...oldPosts] : [newPost];
      });

      // Invalidate queries if auto-invalidate is enabled
      if (autoInvalidate) {
        invalidatePosts();
      }

      onSuccess?.(newPost);
    },
    onError: (error: Error) => {
      setCreateState(prev => ({ 
        ...prev, 
        isUploading: false,
        errors: [error.message]
      }));
      onError?.(error);
    }
  });

  // Submit post function
  const submitPost = useCallback(async (postData: CreatePostData) => {
    return createPostMutation.mutateAsync(postData);
  }, [createPostMutation]);

  // Reset state function
  const reset = useCallback(() => {
    setCreateState({
      isUploading: false,
      uploadProgress: 0,
      errors: []
    });
    createPostMutation.reset();
  }, [createPostMutation]);

  // Clear errors function
  const clearErrors = useCallback(() => {
    setCreateState(prev => ({ ...prev, errors: [] }));
  }, []);

  return {
    // Submit function
    submitPost,
    
    // Loading states
    isSubmitting: createPostMutation.isPending || createState.isUploading,
    isUploading: createState.isUploading,
    uploadProgress: createState.uploadProgress,
    
    // Error handling
    isError: createPostMutation.isError || createState.errors.length > 0,
    error: createPostMutation.error,
    errors: createState.errors,
    clearErrors,
    
    // Success state
    isSuccess: createPostMutation.isSuccess,
    data: createPostMutation.data,
    
    // Utilities
    reset,
    validatePostData,
    
    // Raw mutation
    mutation: createPostMutation
  };
};

export default useCreatePost;