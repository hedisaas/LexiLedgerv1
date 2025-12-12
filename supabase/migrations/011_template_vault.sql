-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  detected_type TEXT,
  confidence_score FLOAT,
  tags TEXT[],
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Create Policies for document_templates
CREATE POLICY "Users can view their own templates"
  ON document_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON document_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON document_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Storage Bucket Setup (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload their own templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can view their own templates"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own templates"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1] );
