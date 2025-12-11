
export enum Language {
  ARABIC = 'Arabic',
  ENGLISH = 'English',
  FRENCH = 'French',
  SPANISH = 'Spanish',
  GERMAN = 'German'
}

export enum TranslationStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  PAID = 'Paid',
  CANCELLED = 'Cancelled'
}

export enum QuoteStatus {
  DRAFT = 'Draft',
  SENT = 'Accepted',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

export interface TranslationJob {
  id: string;
  date: string; // ISO Date string - Creation Date
  dueDate?: string; // ISO Date string - Deadline
  clientName: string;
  clientInfo: string; // Address, Tax ID, etc.
  documentType: string; // e.g., "Birth Certificate", "Contract"
  sourceLang: Language | string;
  targetLang: Language | string;
  pageCount: number;
  priceTotal: number; // Montant HT
  status: TranslationStatus;
  remarks: string;
  invoiceNumber?: string;
  attachments?: string[]; // Array of Base64 strings (Images/PDFs)
  translatedText?: string; // The actual content of the translation
  templateId?: string; // Optional: ID of the specific template used
  finalDocument?: string; // Base64 of the final PDF/Word doc
}

export interface Quote {
  id: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientInfo: string;
  documentType: string;
  sourceLang: Language | string;
  targetLang: Language | string;
  pageCount: number;
  priceTotal: number;
  status: QuoteStatus;
  remarks: string;
}

export enum ExpenseCategory {
  FIXED_RENT = 'Rent (Fixed)',
  FIXED_SUBSCRIPTION = 'Software/Subscriptions (Fixed)',
  VARIABLE_BILLS = 'Utility Bills',
  VARIABLE_OFFICE = 'Office Supplies',
  VARIABLE_TAX = 'Taxes',
  OTHER = 'Other'
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface MonthlyStats {
  month: string; // "Jan 24"
  revenue: number;
  expenses: number;
  profit: number;
}

export interface BusinessProfile {
  businessName: string;
  translatorName: string;
  address: string;
  taxId: string; // Matricule Fiscal
  phone: string;
  email: string;
  logo?: string; // Base64
  rib?: string; // Bank Account Number
}

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
  langPair: string; // e.g. "en-fr"
}

export interface TMUnit {
  id: string;
  sourceSegment: string;
  targetSegment: string;
  langPair: string;
  timestamp: number;
}

export interface SecretaryPermissions {
  canViewDashboard: boolean;
  canManageTranslations: boolean;
  canManageClients: boolean;
  canManageQuotes: boolean;
  canManageExpenses: boolean;
  canViewSettings: boolean;
}

export interface Secretary {
  id: string;
  email: string;
  name: string;
  password?: string;
  permissions: SecretaryPermissions;
  created_at?: string;
}

export interface QuoteRequest {
  id: string;
  client_name: string;
  client_email: string;
  source_lang: string;
  target_lang: string;
  document_type: string;
  notes?: string;
  file_path?: string;
  status: 'pending' | 'processed' | 'rejected';
  created_at: string;
}