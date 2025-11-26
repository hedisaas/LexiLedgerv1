-- Add Job
CREATE OR REPLACE FUNCTION add_secretary_job(sec_id UUID, job_data JSONB)
RETURNS translation_jobs AS $$
DECLARE
  admin_id UUID;
  new_job translation_jobs;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  INSERT INTO translation_jobs (
    user_id, date, due_date, client_name, client_info, document_type, 
    source_lang, target_lang, page_count, price_total, status, remarks, 
    invoice_number, attachments, translated_text, template_id, final_document
  ) VALUES (
    admin_id,
    (job_data->>'date')::date,
    (job_data->>'dueDate')::date,
    job_data->>'clientName',
    job_data->>'clientInfo',
    job_data->>'documentType',
    job_data->>'sourceLang',
    job_data->>'targetLang',
    (job_data->>'pageCount')::int,
    (job_data->>'priceTotal')::decimal,
    (job_data->>'status')::translation_status,
    job_data->>'remarks',
    job_data->>'invoiceNumber',
    ARRAY(SELECT jsonb_array_elements_text(job_data->'attachments')),
    job_data->>'translatedText',
    job_data->>'templateId',
    job_data->>'finalDocument'
  ) RETURNING * INTO new_job;

  RETURN new_job;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Job
CREATE OR REPLACE FUNCTION update_secretary_job(sec_id UUID, job_id UUID, job_data JSONB)
RETURNS translation_jobs AS $$
DECLARE
  admin_id UUID;
  updated_job translation_jobs;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  UPDATE translation_jobs SET
    date = (job_data->>'date')::date,
    due_date = (job_data->>'dueDate')::date,
    client_name = job_data->>'clientName',
    client_info = job_data->>'clientInfo',
    document_type = job_data->>'documentType',
    source_lang = job_data->>'sourceLang',
    target_lang = job_data->>'targetLang',
    page_count = (job_data->>'pageCount')::int,
    price_total = (job_data->>'priceTotal')::decimal,
    status = (job_data->>'status')::translation_status,
    remarks = job_data->>'remarks',
    invoice_number = job_data->>'invoiceNumber',
    attachments = ARRAY(SELECT jsonb_array_elements_text(job_data->'attachments')),
    translated_text = job_data->>'translatedText',
    template_id = job_data->>'templateId',
    final_document = job_data->>'finalDocument',
    updated_at = NOW()
  WHERE id = job_id AND user_id = admin_id
  RETURNING * INTO updated_job;

  RETURN updated_job;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete Job
CREATE OR REPLACE FUNCTION delete_secretary_job(sec_id UUID, job_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  DELETE FROM translation_jobs WHERE id = job_id AND user_id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Expense
CREATE OR REPLACE FUNCTION add_secretary_expense(sec_id UUID, exp_data JSONB)
RETURNS expenses AS $$
DECLARE
  admin_id UUID;
  new_exp expenses;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  INSERT INTO expenses (
    user_id, date, description, amount, category
  ) VALUES (
    admin_id,
    (exp_data->>'date')::date,
    exp_data->>'description',
    (exp_data->>'amount')::decimal,
    (exp_data->>'category')::expense_category
  ) RETURNING * INTO new_exp;

  RETURN new_exp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete Expense
CREATE OR REPLACE FUNCTION delete_secretary_expense(sec_id UUID, exp_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  DELETE FROM expenses WHERE id = exp_id AND user_id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Quote
CREATE OR REPLACE FUNCTION add_secretary_quote(sec_id UUID, quote_data JSONB)
RETURNS quotes AS $$
DECLARE
  admin_id UUID;
  new_quote quotes;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  INSERT INTO quotes (
    user_id, date, valid_until, client_name, client_info, document_type,
    source_lang, target_lang, page_count, price_total, status, remarks
  ) VALUES (
    admin_id,
    (quote_data->>'date')::date,
    (quote_data->>'validUntil')::date,
    quote_data->>'clientName',
    quote_data->>'clientInfo',
    quote_data->>'documentType',
    quote_data->>'sourceLang',
    quote_data->>'targetLang',
    (quote_data->>'pageCount')::int,
    (quote_data->>'priceTotal')::decimal,
    (quote_data->>'status')::quote_status,
    quote_data->>'remarks'
  ) RETURNING * INTO new_quote;

  RETURN new_quote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Quote
CREATE OR REPLACE FUNCTION update_secretary_quote(sec_id UUID, quote_id UUID, quote_data JSONB)
RETURNS quotes AS $$
DECLARE
  admin_id UUID;
  updated_quote quotes;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  UPDATE quotes SET
    date = (quote_data->>'date')::date,
    valid_until = (quote_data->>'validUntil')::date,
    client_name = quote_data->>'clientName',
    client_info = quote_data->>'clientInfo',
    document_type = quote_data->>'documentType',
    source_lang = quote_data->>'sourceLang',
    target_lang = quote_data->>'targetLang',
    page_count = (quote_data->>'pageCount')::int,
    price_total = (quote_data->>'priceTotal')::decimal,
    status = (quote_data->>'status')::quote_status,
    remarks = quote_data->>'remarks',
    updated_at = NOW()
  WHERE id = quote_id AND user_id = admin_id
  RETURNING * INTO updated_quote;

  RETURN updated_quote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete Quote
CREATE OR REPLACE FUNCTION delete_secretary_quote(sec_id UUID, quote_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT created_by INTO admin_id FROM secretary_access WHERE id = sec_id;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Invalid secretary'; END IF;

  DELETE FROM quotes WHERE id = quote_id AND user_id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
