-- Optional: Seed data for testing
-- This file can be run after creating your account to populate sample data
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- You can find your user ID by running:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Example Translation Jobs (replace 'YOUR_USER_ID' with your actual user ID)
/*
INSERT INTO translation_jobs (user_id, date, client_name, client_info, document_type, source_lang, target_lang, page_count, price_total, status, remarks) VALUES
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '28 days', 'Société Tunisienne de Banque', 'Siège, Tunis', 'Financial Audit', 'French', 'English', 12, 450.00, 'Completed', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '25 days', 'Ahmed Ben Ali', 'CIN 12345678', 'Birth Certificate', 'Arabic', 'French', 1, 30.00, 'Paid', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '22 days', 'Global Tech', 'Ariana', 'Contract', 'English', 'French', 5, 150.00, 'Completed', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '20 days', 'Fatma Karray', 'Avocat', 'Judgment', 'Arabic', 'English', 3, 90.00, 'Paid', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '18 days', 'University of Carthage', 'Admin', 'Diploma', 'Arabic', 'English', 1, 35.00, 'Completed', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '15 days', 'Startup Tunisia', 'Lac 1', 'Pitch Deck', 'English', 'Arabic', 10, 300.00, 'Pending', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '12 days', 'Sami Mebazaa', 'Perso', 'Driving License', 'Arabic', 'German', 1, 40.00, 'Paid', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '10 days', 'Cabinet Merai', 'Centre Ville', 'Legal Brief', 'French', 'Arabic', 6, 180.00, 'Completed', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '7 days', 'Tech Solutions', 'Sfax', 'Manual', 'English', 'French', 20, 600.00, 'Pending', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '5 days', 'Amel Tounsi', 'Marsa', 'Marriage Certificate', 'Arabic', 'English', 1, 35.00, 'Completed', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '3 days', 'BuildCorp', 'Charguia', 'Tender', 'French', 'English', 15, 500.00, 'Pending', ''),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 'New Client Ltd', 'Lac 2', 'Memo', 'English', 'Arabic', 2, 60.00, 'Pending', 'Rush job'),
('YOUR_USER_ID', CURRENT_DATE, 'Walk-in Client', '-', 'ID Card', 'Arabic', 'French', 1, 25.00, 'Pending', '');

-- Example Expenses
INSERT INTO expenses (user_id, date, category, description, amount) VALUES
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '29 days', 'Rent (Fixed)', 'Office Rent', 800.00),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '25 days', 'Office Supplies', 'Paper Ream (A4)', 12.50),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '20 days', 'Utility Bills', 'Internet Bill', 45.00),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '15 days', 'Office Supplies', 'Ink Cartridges', 120.00),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '10 days', 'Utility Bills', 'STEG Electricity', 145.50),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '5 days', 'Other', 'Coffee & Snacks', 35.00),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 'Taxes', 'Municipal Tax', 50.00);

-- Example Quote
INSERT INTO quotes (user_id, date, valid_until, client_name, client_info, document_type, source_lang, target_lang, page_count, price_total, status, remarks) VALUES
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days', 'MegaCorp Int', 'Paris, France', 'Technical Specification', 'English', 'French', 50, 1200.00, 'Sent', 'Pending approval');
*/

-- To use this seed data:
-- 1. Sign up and verify your account in the app
-- 2. Get your user ID by running: SELECT id FROM auth.users WHERE email = 'your@email.com';
-- 3. Replace all instances of 'YOUR_USER_ID' in this file with your actual user ID
-- 4. Uncomment the INSERT statements above (remove /* and */)
-- 5. Run this SQL in the Supabase SQL Editor


