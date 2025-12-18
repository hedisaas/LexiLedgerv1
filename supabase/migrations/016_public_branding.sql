-- RPC to allow the Client Portal to fetch business branding (Logo, Name, Contact)
-- This is public info necessary for the portal UI.

DROP FUNCTION IF EXISTS public.get_portal_branding();

CREATE OR REPLACE FUNCTION public.get_portal_branding()
RETURNS TABLE (
  business_name text,
  translator_name text,
  logo text,
  phone text,
  email text,
  address text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return the first business profile found (Single Tenant App Assumption)
  RETURN QUERY
  SELECT 
    b.business_name,
    b.translator_name,
    b.logo,
    b.phone,
    b.email,
    b.address
  FROM public.business_profiles b
  LIMIT 1;
END;
$$;

NOTIFY pgrst, 'reload config';
