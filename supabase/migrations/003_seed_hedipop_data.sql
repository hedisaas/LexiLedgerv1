-- Seed data for hedipop@gmail.com account
-- This migration adds comprehensive mock data for testing and demonstration purposes
-- 
-- IMPORTANT: This assumes the user hedipop@gmail.com has already been created in Supabase Auth
-- To run this migration:
-- 1. Ensure hedipop@gmail.com account exists in Supabase Auth
-- 2. Run this SQL in the Supabase SQL Editor

-- Get the user ID for hedipop@gmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hedipop@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User hedipop@gmail.com not found. Please create the account first.';
  END IF;

  -- Set user role as admin
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  -- Insert Business Profile
  INSERT INTO business_profiles (
    user_id, business_name, translator_name, address, tax_id, phone, email, rib
  ) VALUES (
    v_user_id,
    'LexiLedger Translation Services',
    'Hedi Pop',
    '123 Avenue Habib Bourguiba, Tunis 1000, Tunisia',
    'TN-1234567-ABC',
    '+216 71 123 456',
    'hedipop@gmail.com',
    'TN59 1000 1234 5678 9012 3456'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    translator_name = EXCLUDED.translator_name,
    address = EXCLUDED.address,
    tax_id = EXCLUDED.tax_id,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    rib = EXCLUDED.rib;

  -- Insert Translation Jobs (diverse set of jobs with different statuses)
  INSERT INTO translation_jobs (
    user_id, date, due_date, client_name, client_info, document_type, 
    source_lang, target_lang, page_count, price_total, status, remarks, invoice_number
  ) VALUES
  -- Paid jobs (older)
  (v_user_id, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '55 days', 
   'Société Tunisienne de Banque', 'Avenue Mohamed V, Tunis\nTax ID: STB-2023-001', 
   'Financial Audit Report', 'French', 'English', 25, 875.00, 'Paid', 
   'Annual financial audit translation', 'INV-2024-001'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE - INTERVAL '50 days',
   'Ahmed Ben Ali', 'CIN: 12345678\nAddress: Sfax, Tunisia', 
   'Birth Certificate', 'Arabic', 'French', 1, 35.00, 'Paid', 
   'Certified translation for immigration', 'INV-2024-002'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '45 days',
   'Global Tech Solutions', 'Zone Industrielle, Ariana\nTax ID: GTS-TN-456', 
   'Software License Agreement', 'English', 'French', 8, 280.00, 'Paid', 
   'Legal document translation', 'INV-2024-003'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '40 days',
   'Fatma Karray', 'Cabinet d''Avocat, Tunis\nPhone: +216 71 234 567', 
   'Court Judgment', 'Arabic', 'English', 5, 175.00, 'Paid', 
   'Urgent legal translation', 'INV-2024-004'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '35 days',
   'University of Carthage', 'Campus Universitaire, Tunis', 
   'Academic Diploma', 'Arabic', 'English', 2, 70.00, 'Paid', 
   'Student diploma for study abroad', 'INV-2024-005'),
  
  -- Completed jobs (awaiting payment)
  (v_user_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days',
   'Startup Tunisia SARL', 'Lac 1, Tunis\nTax ID: STU-2024-789', 
   'Business Pitch Deck', 'English', 'Arabic', 15, 525.00, 'Completed', 
   'Investor presentation translation', 'INV-2024-006'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '20 days',
   'Sami Mebazaa', 'CIN: 87654321\nNabeul, Tunisia', 
   'Driving License', 'Arabic', 'German', 1, 45.00, 'Completed', 
   'For German work permit', 'INV-2024-007'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '15 days',
   'Cabinet Juridique Merai', 'Centre Ville, Tunis\nPhone: +216 71 345 678', 
   'Legal Brief', 'French', 'Arabic', 10, 350.00, 'Completed', 
   'Civil case documentation', 'INV-2024-008'),
  
  -- Pending jobs (in progress)
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '5 days',
   'Tech Solutions International', 'Sfax Technology Park\nTax ID: TSI-2024-321', 
   'Technical Manual', 'English', 'French', 35, 1225.00, 'Pending', 
   'Software documentation - 50 pages estimated', NULL),
  
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '10 days',
   'Amel Tounsi', 'La Marsa, Tunis\nPhone: +216 22 123 456', 
   'Marriage Certificate', 'Arabic', 'English', 1, 35.00, 'Pending', 
   'For visa application', NULL),
  
  (v_user_id, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days',
   'BuildCorp Tunisia', 'Charguia 2, Tunis\nTax ID: BCT-2024-555', 
   'Construction Tender', 'French', 'English', 28, 980.00, 'Pending', 
   'Government tender translation', NULL),
  
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '7 days',
   'MedPharm Industries', 'Ben Arous, Tunisia\nTax ID: MPI-2024-888', 
   'Pharmaceutical Documentation', 'English', 'Arabic', 20, 700.00, 'Pending', 
   'Medical product information', NULL),
  
  -- Recent jobs
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days',
   'New Client Ltd', 'Lac 2, Tunis\nEmail: contact@newclient.tn', 
   'Business Memo', 'English', 'Arabic', 3, 105.00, 'Pending', 
   'Rush job - priority delivery', NULL),
  
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days',
   'Karim Sassi', 'CIN: 11223344\nSousse, Tunisia', 
   'Police Record', 'Arabic', 'French', 1, 30.00, 'Pending', 
   'For French visa application', NULL),
  
  (v_user_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days',
   'Walk-in Client', 'Phone: +216 98 765 432', 
   'ID Card Translation', 'Arabic', 'English', 1, 25.00, 'Pending', 
   'Express service requested', NULL);

  -- Insert Quotes (various statuses)
  INSERT INTO quotes (
    user_id, date, valid_until, client_name, client_info, document_type,
    source_lang, target_lang, page_count, price_total, status, remarks
  ) VALUES
  -- Draft quotes
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
   'International Corp', 'Paris, France\nEmail: contact@intcorp.fr', 
   'Annual Report', 'French', 'English', 45, 1575.00, 'Draft', 
   'Waiting for final page count confirmation'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '27 days',
   'Export Tunisia', 'Tunis Export Zone\nTax ID: EXT-2024-999', 
   'Product Catalog', 'Arabic', 'French', 30, 900.00, 'Draft', 
   'Client requested revision of pricing'),
  
  -- Sent quotes (awaiting response)
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days',
   'MegaCorp International', 'London, UK\nEmail: procurement@megacorp.uk', 
   'Technical Specifications', 'English', 'French', 60, 2100.00, 'Sent', 
   'Sent to procurement department - awaiting approval'),
  
  (v_user_id, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '22 days',
   'Legal Associates SARL', 'Avenue de la Liberté, Tunis\nPhone: +216 71 456 789', 
   'Contract Portfolio', 'French', 'Arabic', 25, 875.00, 'Sent', 
   'Quote sent - client reviewing'),
  
  -- Accepted quotes (ready to convert to jobs)
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '26 days',
   'Education Ministry', 'Government Building, Tunis\nRef: EDU-2024-123', 
   'Educational Materials', 'French', 'Arabic', 50, 1500.00, 'Accepted', 
   'Client accepted - ready to start work'),
  
  -- Rejected quotes
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days',
   'Budget Client', 'Email: budget@client.tn', 
   'Marketing Brochure', 'English', 'French', 10, 350.00, 'Rejected', 
   'Client found cheaper alternative');

  -- Insert Expenses (various categories)
  INSERT INTO expenses (
    user_id, date, category, description, amount
  ) VALUES
  -- Fixed expenses
  (v_user_id, CURRENT_DATE - INTERVAL '60 days', 'Rent (Fixed)', 
   'Office Rent - January 2024', 850.00),
  (v_user_id, CURRENT_DATE - INTERVAL '30 days', 'Rent (Fixed)', 
   'Office Rent - February 2024', 850.00),
  (v_user_id, CURRENT_DATE, 'Rent (Fixed)', 
   'Office Rent - March 2024', 850.00),
  
  (v_user_id, CURRENT_DATE - INTERVAL '55 days', 'Software/Subscriptions (Fixed)', 
   'CAT Tool Subscription - Annual', 299.00),
  (v_user_id, CURRENT_DATE - INTERVAL '45 days', 'Software/Subscriptions (Fixed)', 
   'Cloud Storage - Monthly', 15.00),
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', 'Software/Subscriptions (Fixed)', 
   'Cloud Storage - Monthly', 15.00),
  
  -- Utility bills
  (v_user_id, CURRENT_DATE - INTERVAL '50 days', 'Utility Bills', 
   'Internet Bill - January', 55.00),
  (v_user_id, CURRENT_DATE - INTERVAL '48 days', 'Utility Bills', 
   'STEG Electricity - January', 165.50),
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', 'Utility Bills', 
   'Internet Bill - February', 55.00),
  (v_user_id, CURRENT_DATE - INTERVAL '18 days', 'Utility Bills', 
   'STEG Electricity - February', 178.30),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Utility Bills', 
   'Water Bill - February', 42.00),
  
  -- Office supplies
  (v_user_id, CURRENT_DATE - INTERVAL '52 days', 'Office Supplies', 
   'Paper Ream A4 (5 packs)', 45.00),
  (v_user_id, CURRENT_DATE - INTERVAL '40 days', 'Office Supplies', 
   'Printer Ink Cartridges', 135.00),
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', 'Office Supplies', 
   'Stationery Supplies', 28.50),
  (v_user_id, CURRENT_DATE - INTERVAL '12 days', 'Office Supplies', 
   'Filing Folders and Binders', 32.00),
  
  -- Taxes
  (v_user_id, CURRENT_DATE - INTERVAL '35 days', 'Taxes', 
   'Municipal Tax - Q1 2024', 180.00),
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', 'Taxes', 
   'Professional Tax Payment', 250.00),
  
  -- Other expenses
  (v_user_id, CURRENT_DATE - INTERVAL '42 days', 'Other', 
   'Client Meeting - Coffee & Refreshments', 45.00),
  (v_user_id, CURRENT_DATE - INTERVAL '28 days', 'Other', 
   'Professional Development Book', 65.00),
  (v_user_id, CURRENT_DATE - INTERVAL '14 days', 'Other', 
   'Office Cleaning Service', 80.00),
  (v_user_id, CURRENT_DATE - INTERVAL '7 days', 'Other', 
   'Courier Service - Document Delivery', 25.00),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Other', 
   'Coffee & Snacks for Office', 38.50);

  -- Insert Glossary Terms (translation memory)
  INSERT INTO glossary_terms (
    user_id, source, target, lang_pair
  ) VALUES
  -- English-French legal terms
  (v_user_id, 'plaintiff', 'demandeur', 'en-fr'),
  (v_user_id, 'defendant', 'défendeur', 'en-fr'),
  (v_user_id, 'contract', 'contrat', 'en-fr'),
  (v_user_id, 'agreement', 'accord', 'en-fr'),
  (v_user_id, 'liability', 'responsabilité', 'en-fr'),
  (v_user_id, 'jurisdiction', 'juridiction', 'en-fr'),
  
  -- French-English business terms
  (v_user_id, 'société', 'company', 'fr-en'),
  (v_user_id, 'facture', 'invoice', 'fr-en'),
  (v_user_id, 'devis', 'quote', 'fr-en'),
  (v_user_id, 'bilan', 'balance sheet', 'fr-en'),
  
  -- Arabic-French administrative terms
  (v_user_id, 'شهادة ميلاد', 'certificat de naissance', 'ar-fr'),
  (v_user_id, 'بطاقة تعريف', 'carte d''identité', 'ar-fr'),
  (v_user_id, 'رخصة سياقة', 'permis de conduire', 'ar-fr'),
  (v_user_id, 'شهادة زواج', 'certificat de mariage', 'ar-fr'),
  
  -- Arabic-English administrative terms
  (v_user_id, 'شهادة ميلاد', 'birth certificate', 'ar-en'),
  (v_user_id, 'بطاقة تعريف', 'identity card', 'ar-en'),
  (v_user_id, 'رخصة سياقة', 'driving license', 'ar-en'),
  (v_user_id, 'جواز سفر', 'passport', 'ar-en');

  -- Insert Translation Memory Units
  INSERT INTO tm_units (
    user_id, source_segment, target_segment, lang_pair, timestamp
  ) VALUES
  -- English-French segments
  (v_user_id, 
   'This agreement is made between the parties on the date specified below.',
   'Le présent accord est conclu entre les parties à la date indiquée ci-dessous.',
   'en-fr', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '45 days')::BIGINT),
  
  (v_user_id,
   'All rights reserved under applicable copyright laws.',
   'Tous droits réservés en vertu des lois applicables sur le droit d''auteur.',
   'en-fr', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '40 days')::BIGINT),
  
  (v_user_id,
   'The parties agree to the following terms and conditions.',
   'Les parties conviennent des termes et conditions suivants.',
   'en-fr', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '35 days')::BIGINT),
  
  -- French-English segments
  (v_user_id,
   'Le présent document certifie que les informations ci-dessus sont exactes.',
   'This document certifies that the above information is accurate.',
   'fr-en', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '30 days')::BIGINT),
  
  (v_user_id,
   'Fait à Tunis, le',
   'Done in Tunis, on',
   'fr-en', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '25 days')::BIGINT),
  
  -- Arabic-French segments
  (v_user_id,
   'تشهد هذه الوثيقة أن المعلومات الواردة أعلاه صحيحة',
   'Ce document certifie que les informations ci-dessus sont exactes',
   'ar-fr', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '20 days')::BIGINT),
  
  (v_user_id,
   'صدر بتونس في',
   'Délivré à Tunis le',
   'ar-fr', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '15 days')::BIGINT),
  
  -- Arabic-English segments
  (v_user_id,
   'تشهد هذه الوثيقة أن المعلومات الواردة أعلاه صحيحة',
   'This document certifies that the above information is accurate',
   'ar-en', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '10 days')::BIGINT),
  
  (v_user_id,
   'صدر بتونس في',
   'Issued in Tunis on',
   'ar-en', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '5 days')::BIGINT);

  RAISE NOTICE 'Mock data successfully added for hedipop@gmail.com';
  
END $$;
