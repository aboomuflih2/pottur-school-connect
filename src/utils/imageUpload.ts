import { supabase } from '@/integrations/supabase/client';
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
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `board-members/${fileName}`;

  try {
    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading member photo:', error);
    throw new Error('Failed to upload member photo');
  }
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
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting member photo:', error);
    throw new Error('Failed to delete member photo');
  }
};