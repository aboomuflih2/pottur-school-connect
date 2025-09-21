import { djangoAPI } from '@/lib/django-api';
import { ImageUploadResponse } from '@/types/academic';

/**
 * Upload an image to the Django backend
 * @param file - The image file to upload
 * @returns Promise with upload response containing URL and metadata
 */
export const uploadImage = async (
  file: File
): Promise<ImageUploadResponse> => {
  try {
    // @ts-ignore
    const response = await djangoAPI.uploadFile(file);
    return {
      // @ts-ignore
      url: response.file,
      // @ts-ignore
      path: response.id, // Using the id as the path for deletion
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from the Django backend
 * @param fileId - The file id
 */
export const deleteImage = async (
  fileId: string
): Promise<void> => {
  try {
    await djangoAPI.deleteFile(fileId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};