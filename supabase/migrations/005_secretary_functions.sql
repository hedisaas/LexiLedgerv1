-- Function to get jobs for a secretary
CREATE OR REPLACE FUNCTION get_secretary_jobs(sec_id UUID)
RETURNS SETOF translation_jobs AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM translation_jobs WHERE user_id = admin_id ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expenses for a secretary
CREATE OR REPLACE FUNCTION get_secretary_expenses(sec_id UUID)
RETURNS SETOF expenses AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM expenses WHERE user_id = admin_id ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quotes for a secretary
CREATE OR REPLACE FUNCTION get_secretary_quotes(sec_id UUID)
RETURNS SETOF quotes AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM quotes WHERE user_id = admin_id ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business profile for a secretary
CREATE OR REPLACE FUNCTION get_secretary_profile(sec_id UUID)
RETURNS SETOF business_profiles AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM business_profiles WHERE user_id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
