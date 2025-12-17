-- Ensure the documents bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true,
  10485760, -- 10MB limit
  -- specific mime types or null for all
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'
  ];

-- Ensure policies exist (idempotent due to ON CONFLICT checks usually, but here we use IF NOT EXISTS logic implicitly or drop/create)

-- Drop existing policies to ensure clean state (optional, but safer to re-declare)
DROP POLICY IF EXISTS "Allow public uploads to client-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reading of documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff full access" ON storage.objects;

-- Re-create policies
CREATE POLICY "Allow public uploads to client-uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public reading of documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Allow staff full access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
