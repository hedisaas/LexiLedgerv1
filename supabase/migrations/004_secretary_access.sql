-- Create Secretary Access Table
CREATE TABLE secretary_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- Simple hashing/obfuscation for this implementation
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE secretary_access ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view their own secretaries
CREATE POLICY "Admins can view own secretaries" ON secretary_access
  FOR SELECT USING (auth.uid() = created_by);

-- Admins can insert their own secretaries
CREATE POLICY "Admins can insert own secretaries" ON secretary_access
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Admins can update their own secretaries
CREATE POLICY "Admins can update own secretaries" ON secretary_access
  FOR UPDATE USING (auth.uid() = created_by);

-- Admins can delete their own secretaries
CREATE POLICY "Admins can delete own secretaries" ON secretary_access
  FOR DELETE USING (auth.uid() = created_by);

-- Secretaries can view themselves (for login check)
-- Note: This requires a way to bypass RLS or a specific function for login if not using auth.uid()
-- For the custom login flow, we might need a trusted function or just use the admin's client for management
-- and a separate unrestricted query for login (or a specific RPC).

-- Let's add an index for email lookups
CREATE INDEX idx_secretary_email ON secretary_access(email);
