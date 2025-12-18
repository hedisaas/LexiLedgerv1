-- RPC to allow clients to fetch their own jobs securely
-- Requires valid client_name AND access_code to return data.
-- This bypasses RLS (SECURITY DEFINER) but enforces its own auth check.

CREATE OR REPLACE FUNCTION public.get_client_jobs(p_client_name text, p_access_code text)
RETURNS TABLE (
  id uuid,
  date date,
  due_date date,
  client_name text,
  client_info text,
  document_type text,
  source_lang text,
  target_lang text,
  page_count integer,
  price_total numeric,
  status text,
  remarks text,
  invoice_number text,
  attachments jsonb[],
  translated_text text,
  template_id text,
  final_document text,
  final_documents text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Validate Credentials
  IF NOT EXISTS (
    SELECT 1 FROM public.client_access
    WHERE lower(client_name) = lower(p_client_name)
    AND access_code = p_access_code
  ) THEN
    -- Return empty if auth fails (or raise exception)
    RETURN;
  END IF;

  -- 2. Return Jobs for this client (Case Insensitive Match on Name)
  RETURN QUERY
  SELECT 
    t.id,
    t.date,
    t.due_date,
    t.client_name,
    t.client_info,
    t.document_type,
    t.source_lang,
    t.target_lang,
    t.page_count,
    t.price_total,
    t.status,
    t.remarks,
    t.invoice_number,
    t.attachments,
    t.translated_text,
    t.template_id,
    t.final_document,
    t.final_documents
  FROM public.translation_jobs t
  WHERE lower(t.client_name) = lower(p_client_name)
  ORDER BY t.date DESC;
END;
$$;

NOTIFY pgrst, 'reload config';
