-- Add final_documents column to translation_jobs
ALTER TABLE translation_jobs ADD COLUMN IF NOT EXISTS final_documents TEXT[];

-- Migrate existing final_document data to final_documents array
UPDATE translation_jobs 
SET final_documents = ARRAY[final_document] 
WHERE final_document IS NOT NULL AND final_documents IS NULL;

-- Optional: Drop the old column? 
-- Ideally we keep it for backward compatibility for a bit, or we can just ignore it in the app.
-- For now, let's keep it but rely on final_documents in the new code.
