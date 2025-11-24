import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TranslationJob, 
  Expense, 
  Quote, 
  BusinessProfile,
  GlossaryTerm,
  TMUnit 
} from '../types';
import { User } from '@supabase/supabase-js';

// ============ Translation Jobs ============

export const useTranslationJobs = (user: User | null) => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translation_jobs')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedJobs: TranslationJob[] = (data || []).map(job => ({
        id: job.id,
        date: job.date,
        dueDate: job.due_date,
        clientName: job.client_name,
        clientInfo: job.client_info || '',
        documentType: job.document_type,
        sourceLang: job.source_lang,
        targetLang: job.target_lang,
        pageCount: job.page_count,
        priceTotal: parseFloat(job.price_total),
        status: job.status,
        remarks: job.remarks || '',
        invoiceNumber: job.invoice_number,
        attachments: job.attachments,
        translatedText: job.translated_text,
        templateId: job.template_id,
        finalDocument: job.final_document
      }));

      setJobs(mappedJobs);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (job: Omit<TranslationJob, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('translation_jobs')
        .insert([{
          user_id: user.id,
          date: job.date,
          due_date: job.dueDate,
          client_name: job.clientName,
          client_info: job.clientInfo,
          document_type: job.documentType,
          source_lang: job.sourceLang,
          target_lang: job.targetLang,
          page_count: job.pageCount,
          price_total: job.priceTotal,
          status: job.status,
          remarks: job.remarks,
          invoice_number: job.invoiceNumber,
          attachments: job.attachments,
          translated_text: job.translatedText,
          template_id: job.templateId,
          final_document: job.finalDocument
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding job:', err);
    }
  };

  const updateJob = async (job: TranslationJob) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('translation_jobs')
        .update({
          date: job.date,
          due_date: job.dueDate,
          client_name: job.clientName,
          client_info: job.clientInfo,
          document_type: job.documentType,
          source_lang: job.sourceLang,
          target_lang: job.targetLang,
          page_count: job.pageCount,
          price_total: job.priceTotal,
          status: job.status,
          remarks: job.remarks,
          invoice_number: job.invoiceNumber,
          attachments: job.attachments,
          translated_text: job.translatedText,
          template_id: job.templateId,
          final_document: job.finalDocument
        })
        .eq('id', job.id);

      if (error) throw error;
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating job:', err);
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('translation_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting job:', err);
    }
  };

  return { jobs, loading, error, addJob, updateJob, deleteJob, refetch: fetchJobs };
};

// ============ Expenses ============

export const useExpenses = (user: User | null) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedExpenses: Expense[] = (data || []).map(exp => ({
        id: exp.id,
        date: exp.date,
        description: exp.description,
        amount: parseFloat(exp.amount),
        category: exp.category
      }));

      setExpenses(mappedExpenses);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          date: expense.date,
          description: expense.description,
          amount: expense.amount,
          category: expense.category
        }]);

      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding expense:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting expense:', err);
    }
  };

  return { expenses, loading, error, addExpense, deleteExpense, refetch: fetchExpenses };
};

// ============ Quotes ============

export const useQuotes = (user: User | null) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    fetchQuotes();
  }, [user]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedQuotes: Quote[] = (data || []).map(quote => ({
        id: quote.id,
        date: quote.date,
        validUntil: quote.valid_until,
        clientName: quote.client_name,
        clientInfo: quote.client_info || '',
        documentType: quote.document_type,
        sourceLang: quote.source_lang,
        targetLang: quote.target_lang,
        pageCount: quote.page_count,
        priceTotal: parseFloat(quote.price_total),
        status: quote.status,
        remarks: quote.remarks || ''
      }));

      setQuotes(mappedQuotes);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuote = async (quote: Omit<Quote, 'id'>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{
          user_id: user.id,
          date: quote.date,
          valid_until: quote.validUntil,
          client_name: quote.clientName,
          client_info: quote.clientInfo,
          document_type: quote.documentType,
          source_lang: quote.sourceLang,
          target_lang: quote.targetLang,
          page_count: quote.pageCount,
          price_total: quote.priceTotal,
          status: quote.status,
          remarks: quote.remarks
        }]);

      if (error) throw error;
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding quote:', err);
    }
  };

  const updateQuote = async (quote: Quote) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          date: quote.date,
          valid_until: quote.validUntil,
          client_name: quote.clientName,
          client_info: quote.clientInfo,
          document_type: quote.documentType,
          source_lang: quote.sourceLang,
          target_lang: quote.targetLang,
          page_count: quote.pageCount,
          price_total: quote.priceTotal,
          status: quote.status,
          remarks: quote.remarks
        })
        .eq('id', quote.id);

      if (error) throw error;
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating quote:', err);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting quote:', err);
    }
  };

  return { quotes, loading, error, addQuote, updateQuote, deleteQuote, refetch: fetchQuotes };
};

// ============ Business Profile ============

export const useBusinessProfile = (user: User | null) => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (data) {
        setProfile({
          businessName: data.business_name,
          translatorName: data.translator_name,
          address: data.address || '',
          taxId: data.tax_id || '',
          phone: data.phone || '',
          email: data.email || '',
          logo: data.logo,
          rib: data.rib
        });
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile: BusinessProfile = {
          businessName: "LexiLedger Translations",
          translatorName: "Your Name",
          address: "Your Office Address",
          taxId: "0000000/X/A/M/000",
          phone: "+216 00 000 000",
          email: user.email || "",
          rib: ""
        };
        setProfile(defaultProfile);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newProfile: BusinessProfile) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          business_name: newProfile.businessName,
          translator_name: newProfile.translatorName,
          address: newProfile.address,
          tax_id: newProfile.taxId,
          phone: newProfile.phone,
          email: newProfile.email,
          logo: newProfile.logo,
          rib: newProfile.rib
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      setProfile(newProfile);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving profile:', err);
    }
  };

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
};


