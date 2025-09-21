import { ImageUploadResponse } from '@/types/academic';

/**
 * Upload an image to Supabase storage for board member photos
 * @param file - The image file to upload
 * @param bucketName - The storage bucket name (default: 'member-photos')
 * @returns Promise with upload response containing URL and metadata
 */
export const uploadMemberPhoto = async (
  file: File,
  bucketName: string = 'member-photos'
): Promise<ImageUploadResponse> => {
  // Placeholder implementation: integrate with a Django upload endpoint if needed.
  // For now, this function is not implemented because uploads should go through
  // model-specific Django endpoints (e.g., create/update with multipart/form-data).
  throw new Error('uploadMemberPhoto is not implemented for Django backend. Use model-specific endpoints.');
};

/**
 * Delete an image from Supabase storage
 * @param filePath - The file path in storage
 * @param bucketName - The storage bucket name (default: 'member-photos')
 */
export const deleteMemberPhoto = async (
  filePath: string,
  bucketName: string = 'member-photos'
): Promise<void> => {
  // Placeholder implementation: integrate with a Django delete endpoint if needed.
  throw new Error('deleteMemberPhoto is not implemented for Django backend. Use model-specific endpoints.');
};
