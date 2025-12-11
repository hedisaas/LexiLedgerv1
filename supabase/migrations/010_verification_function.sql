-- Secure function to verify document details without exposing full table access
-- This function is SECURITY DEFINER to bypass RLS for specific fields
CREATE OR REPLACE FUNCTION verify_document(doc_id uuid)
RETURNS TABLE (
  document_uuid uuid,
  status text,
  client_name text,
  document_type text,
  date_issued date,
  hash text,
  issuer_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_exists boolean;
  v_quote_exists boolean;
  v_issuer text;
BEGIN
  -- Check in translation_jobs
  SELECT EXISTS (SELECT 1 FROM translation_jobs WHERE id = doc_id) INTO v_job_exists;
  
  IF v_job_exists THEN
    SELECT 
      bp.translator_name INTO v_issuer
    FROM translation_jobs tj
    JOIN business_profiles bp ON bp.user_id = tj.user_id
    WHERE tj.id = doc_id;

    RETURN QUERY
    SELECT 
      tj.id,
      tj.status::text,
      tj.client_name,
      tj.document_type,
      tj.date,
      -- Simulate a hash for now (in production this should be a stored column)
      encode(digest(tj.id::text || tj.date::text || tj.price_total::text, 'sha256'), 'hex') as hash,
      COALESCE(v_issuer, 'LexiLedger Certified Translator')
    FROM translation_jobs tj
    WHERE tj.id = doc_id;
    RETURN;
  END IF;

  -- Check in quotes
  SELECT EXISTS (SELECT 1 FROM quotes WHERE id = doc_id) INTO v_quote_exists;
  
  IF v_quote_exists THEN
     SELECT 
      bp.translator_name INTO v_issuer
    FROM quotes q
    JOIN business_profiles bp ON bp.user_id = q.user_id
    WHERE q.id = doc_id;

    RETURN QUERY
    SELECT 
      q.id,
      q.status::text,
      q.client_name,
      q.document_type,
      q.date,
       -- Simulate a hash 
      encode(digest(q.id::text || q.date::text || q.price_total::text, 'sha256'), 'hex') as hash,
      COALESCE(v_issuer, 'LexiLedger Certified Translator')
    FROM quotes q
    WHERE q.id = doc_id;
    RETURN;
  END IF;

  -- Return empty if not found
END;
$$;
