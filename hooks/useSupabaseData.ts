import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TranslationJob,
  Expense,
  Quote,
  BusinessProfile,
  GlossaryTerm,
  TMUnit,
  Secretary
} from '../types';
import { User } from '@supabase/supabase-js';

// ============ Translation Jobs ============

export const useTranslationJobs = (user: User | null, secretary: Secretary | null = null) => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !secretary) {
      setJobs([]);
      setLoading(false);
      return;
    }
    fetchJobs();
  }, [user, secretary]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let data, error;

      if (secretary) {
        const result = await supabase.rpc('get_secretary_jobs', { sec_id: secretary.id });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('translation_jobs')
          .select('*')
          .order('date', { ascending: false });
        data = result.data;
        error = result.error;
      }

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
        translatedText: job.translated_text,
        templateId: job.template_id,
        finalDocument: job.final_document,
        finalDocuments: job.final_documents || []
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
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageTranslations) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('add_secretary_job', {
          sec_id: secretary.id,
          job_data: job
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
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
            translated_text: job.translatedText,
            template_id: job.templateId,
            final_document: job.finalDocument,
            final_documents: job.finalDocuments
          }])
          .select()
          .single();
        error = dbError;
      }

      if (error) throw error;
      await fetchJobs();

      if (error) throw error;
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding job:', err);
    }
  };

  const updateJob = async (job: TranslationJob) => {
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageTranslations) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('update_secretary_job', {
          sec_id: secretary.id,
          job_id: job.id,
          job_data: job
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
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
            final_document: job.finalDocument,
            final_documents: job.finalDocuments
          })
          .eq('id', job.id);
        error = dbError;
      }

      if (error) throw error;
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating job:', err);
    }
  };

  const deleteJob = async (id: string) => {
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageTranslations) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('delete_secretary_job', {
          sec_id: secretary.id,
          job_id: id
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
          .from('translation_jobs')
          .delete()
          .eq('id', id);
        error = dbError;
      }

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

export const useExpenses = (user: User | null, secretary: Secretary | null = null) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !secretary) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    fetchExpenses();
  }, [user, secretary]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let data, error;

      if (secretary) {
        const result = await supabase.rpc('get_secretary_expenses', { sec_id: secretary.id });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        data = result.data;
        error = result.error;
      }

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
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageExpenses) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('add_secretary_expense', {
          sec_id: secretary.id,
          exp_data: expense
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
          .from('expenses')
          .insert([{
            user_id: user.id,
            date: expense.date,
            description: expense.description,
            amount: expense.amount,
            category: expense.category
          }]);
        error = dbError;
      }

      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding expense:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageExpenses) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('delete_secretary_expense', {
          sec_id: secretary.id,
          exp_id: id
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        error = dbError;
      }

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

export const useQuotes = (user: User | null, secretary: Secretary | null = null) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !secretary) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    fetchQuotes();
  }, [user, secretary]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      let data, error;

      if (secretary) {
        const result = await supabase.rpc('get_secretary_quotes', { sec_id: secretary.id });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('quotes')
          .select('*')
          .order('date', { ascending: false });
        data = result.data;
        error = result.error;
      }

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
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageQuotes) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('add_secretary_quote', {
          sec_id: secretary.id,
          quote_data: quote
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
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
        error = dbError;
      }

      if (error) throw error;
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding quote:', err);
    }
  };

  const updateQuote = async (quote: Quote) => {
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageQuotes) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('update_secretary_quote', {
          sec_id: secretary.id,
          quote_id: quote.id,
          quote_data: quote
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
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
        error = dbError;
      }

      if (error) throw error;
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating quote:', err);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!user && !secretary) return;
    try {
      let error;
      if (secretary) {
        if (!secretary.permissions.canManageQuotes) {
          throw new Error("Permission denied");
        }
        const { error: rpcError } = await supabase.rpc('delete_secretary_quote', {
          sec_id: secretary.id,
          quote_id: id
        });
        error = rpcError;
      } else if (user) {
        const { error: dbError } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);
        error = dbError;
      }

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

export const useBusinessProfile = (user: User | null, secretary: Secretary | null = null) => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !secretary) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user, secretary]);

  const fetchProfile = async () => {
    if (!user && !secretary) return;
    try {
      setLoading(true);
      let data, error;

      if (secretary) {
        const result = await supabase.rpc('get_secretary_profile', { sec_id: secretary.id });
        data = result.data;
        error = result.error;
      } else if (user) {
        const result = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        const profileData = data[0];
        setProfile({
          businessName: profileData.business_name,
          translatorName: profileData.translator_name,
          address: profileData.address || '',
          taxId: profileData.tax_id || '',
          phone: profileData.phone || '',
          email: profileData.email || '',
          logo: profileData.logo,
          rib: profileData.rib
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


