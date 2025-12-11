-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  document_type TEXT NOT NULL,
  notes TEXT,
  file_path TEXT, -- Path in storage bucket
  status TEXT DEFAULT 'pending', -- pending, processed, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for Client Portal)
-- Note: In a real production app, we might want some form of captcha or rate limiting
CREATE POLICY "Allow public insert to quote_requests"
ON quote_requests FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins (authenticated) to view and update
CREATE POLICY "Allow staff to view quote_requests"
ON quote_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow staff to update quote_requests"
ON quote_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow staff to delete
CREATE POLICY "Allow staff to delete quote_requests"
ON quote_requests FOR DELETE
TO authenticated
USING (true);
