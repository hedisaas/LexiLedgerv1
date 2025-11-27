-- Fix secretary login by adding a secure login function that bypasses RLS
-- This function allows checking secretary credentials without exposing all data

CREATE OR REPLACE FUNCTION authenticate_secretary(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.email,
    s.name,
    s.permissions,
    s.created_at
  FROM secretary_access s
  WHERE s.email = p_email
    AND s.password = p_password;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION authenticate_secretary(TEXT, TEXT) TO anon, authenticated;
