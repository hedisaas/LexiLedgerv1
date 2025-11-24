import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useDocumentStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadDocument = async (
    file: File,
    jobId: string,
    type: 'source' | 'translation' | 'attachment'
  ): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${jobId}/${type}_${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setProgress(percent);
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setProgress(100);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteDocument = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const getDocumentUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const listDocuments = async (jobId: string): Promise<string[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.storage
        .from('documents')
        .list(`${user.id}/${jobId}`);

      if (error) throw error;
      return data?.map(file => file.name) || [];
    } catch (error) {
      console.error('List error:', error);
      return [];
    }
  };

  return {
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    listDocuments,
    uploading,
    progress
  };
};

