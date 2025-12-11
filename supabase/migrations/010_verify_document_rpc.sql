-- Create the verify_document RPC function for public verification
-- This function allows checking the status of a document (Invoice or Quote) by its UUID
-- It returns limited information suitable for public display (Verification Page)

CREATE OR REPLACE FUNCTION verify_document(doc_id UUID)
RETURNS TABLE (
  document_uuid UUID,
  status TEXT,
  client_name TEXT,
  document_type TEXT,
  date_issued DATE,
  hash TEXT,
  issuer_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypass RLS for public check)
AS $$
BEGIN
  -- Try to find in translation_jobs
  RETURN QUERY
  SELECT 
    tj.id AS document_uuid,
    tj.status::TEXT,
    tj.client_name,
    tj.document_type,
    tj.date AS date_issued,
    md5(tj.id::TEXT || tj.client_name || tj.date::TEXT) AS hash, -- Generate a consistent mock hash
    COALESCE(bp.business_name, bp.translator_name, 'LexiLedger Certified') AS issuer_name
  FROM translation_jobs tj
  LEFT JOIN business_profiles bp ON tj.user_id = bp.user_id
  WHERE tj.id = doc_id
  
  UNION ALL
  
  -- Try to find in quotes
  SELECT 
    q.id AS document_uuid,
    q.status::TEXT,
    q.client_name,
    q.document_type,
    q.date AS date_issued,
    md5(q.id::TEXT || q.client_name || q.date::TEXT) AS hash,
    COALESCE(bp.business_name, bp.translator_name, 'LexiLedger Certified') AS issuer_name
  FROM quotes q
  LEFT JOIN business_profiles bp ON q.user_id = bp.user_id
  WHERE q.id = doc_id;

END;
$$;

-- Grant execute permission to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION verify_document(UUID) TO anon, authenticated, service_role;
