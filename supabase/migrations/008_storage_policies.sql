-- Create a storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public uploads to the 'client-uploads' folder
-- This is necessary because clients are unauthenticated in the portal
CREATE POLICY "Allow public uploads to client-uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'client-uploads');

-- Policy to allow public reading of documents (for download)
CREATE POLICY "Allow public reading of documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy to allow authenticated users (admins/secretaries) to do everything
CREATE POLICY "Allow staff full access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
