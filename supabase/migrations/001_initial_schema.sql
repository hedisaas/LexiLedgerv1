-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE translation_status AS ENUM ('Pending', 'Completed', 'Paid', 'Cancelled');
CREATE TYPE quote_status AS ENUM ('Draft', 'Sent', 'Accepted', 'Rejected');
CREATE TYPE expense_category AS ENUM (
  'Rent (Fixed)', 
  'Software/Subscriptions (Fixed)', 
  'Utility Bills', 
  'Office Supplies', 
  'Taxes', 
  'Other'
);

-- Business Profiles Table
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  translator_name TEXT NOT NULL,
  address TEXT,
  tax_id TEXT,
  phone TEXT,
  email TEXT,
  logo TEXT, -- Base64 encoded
  rib TEXT, -- Bank Account Number
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Translation Jobs Table
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  due_date DATE,
  client_name TEXT NOT NULL,
  client_info TEXT,
  document_type TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 0,
  price_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status translation_status NOT NULL DEFAULT 'Pending',
  remarks TEXT,
  invoice_number TEXT,
  attachments TEXT[], -- Array of Base64 strings
  translated_text TEXT,
  template_id TEXT,
  final_document TEXT, -- Base64 of final PDF/Word doc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes Table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  valid_until DATE NOT NULL,
  client_name TEXT NOT NULL,
  client_info TEXT,
  document_type TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 0,
  price_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status quote_status NOT NULL DEFAULT 'Draft',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category expense_category NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary Terms Table (for Translation Memory)
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  lang_pair TEXT NOT NULL, -- e.g. "en-fr"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translation Memory Units Table
CREATE TABLE tm_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_segment TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  lang_pair TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table (for admin/secretary/client roles)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'secretary', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Client Access Table (for client portal access to specific jobs)
CREATE TABLE client_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_email)
);

-- Indexes for better query performance
CREATE INDEX idx_translation_jobs_user_id ON translation_jobs(user_id);
CREATE INDEX idx_translation_jobs_date ON translation_jobs(date);
CREATE INDEX idx_translation_jobs_status ON translation_jobs(status);
CREATE INDEX idx_translation_jobs_client_name ON translation_jobs(client_name);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_date ON quotes(date);
CREATE INDEX idx_quotes_status ON quotes(status);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

CREATE INDEX idx_glossary_terms_user_id ON glossary_terms(user_id);
CREATE INDEX idx_glossary_terms_lang_pair ON glossary_terms(lang_pair);

CREATE INDEX idx_tm_units_user_id ON tm_units(user_id);
CREATE INDEX idx_tm_units_lang_pair ON tm_units(lang_pair);

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tm_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_access ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Business Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON business_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Translation Jobs: Users can only access their own jobs
CREATE POLICY "Users can view own jobs" ON translation_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON translation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON translation_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON translation_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Quotes: Users can only access their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses: Users can only access their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Glossary Terms: Users can only access their own terms
CREATE POLICY "Users can view own glossary" ON glossary_terms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glossary" ON glossary_terms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own glossary" ON glossary_terms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own glossary" ON glossary_terms
  FOR DELETE USING (auth.uid() = user_id);

-- TM Units: Users can only access their own translation memory
CREATE POLICY "Users can view own tm_units" ON tm_units
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tm_units" ON tm_units
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tm_units" ON tm_units
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tm_units" ON tm_units
  FOR DELETE USING (auth.uid() = user_id);

-- User Roles: Users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Client Access: Only admins can manage client access
CREATE POLICY "Admins can manage client access" ON client_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_jobs_updated_at BEFORE UPDATE ON translation_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_glossary_terms_updated_at BEFORE UPDATE ON glossary_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tm_units_updated_at BEFORE UPDATE ON tm_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_access_updated_at BEFORE UPDATE ON client_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


