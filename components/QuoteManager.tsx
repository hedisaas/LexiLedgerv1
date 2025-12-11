
import React, { useState, useEffect } from 'react';
import { Quote, QuoteStatus, Language, TranslationJob, TranslationStatus, QuoteRequest } from '../types';
import { Lang, translations } from '../locales';
import { Plus, Printer, CheckCircle, FileText, Trash2, Edit2, ArrowRight, Inbox, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuoteManagerProps {
  quotes: Quote[];
  onAddQuote: (q: Quote) => void;
  onUpdateQuote: (q: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onConvertToJob: (q: Quote) => void;
  onPrintQuote: (q: Quote) => void;
  lang: Lang;
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ quotes, onAddQuote, onUpdateQuote, onDeleteQuote, onConvertToJob, onPrintQuote, lang }) => {
  const t = translations[lang];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Quote>>({
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    sourceLang: Language.FRENCH,
    targetLang: Language.ARABIC,
    status: QuoteStatus.DRAFT,
    pageCount: 1,
    priceTotal: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
  };

  const handleProcessRequest = (req: QuoteRequest) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: req.client_name,
      clientInfo: req.client_email, // Use email as info for now
      documentType: req.document_type,
      sourceLang: req.source_lang as Language || Language.ENGLISH,
      targetLang: req.target_lang as Language || Language.FRENCH,
      status: QuoteStatus.DRAFT,
      pageCount: 1,
      priceTotal: 0
    });
    setIsFormOpen(true);
    setProcessingRequestId(req.id);
  };

  const handleMarkAsProcessed = async (reqId: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: 'processed' })
      .eq('id', reqId);

    if (error) {
      console.error('Error updating request status:', error);
    } else {
      await fetchRequests(); // Refresh list
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quoteToSave = {
      ...formData,
      id: editingQuote ? editingQuote.id : crypto.randomUUID(),
    } as Quote;

    if (editingQuote) {
      onUpdateQuote(quoteToSave);
    } else {
      onAddQuote(quoteToSave);
      // If this came from a request, mark it as processed
      if (processingRequestId) {
        await handleMarkAsProcessed(processingRequestId);
      }
    }
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuote(null);
    setProcessingRequestId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sourceLang: Language.FRENCH,
      targetLang: Language.ARABIC,
      status: QuoteStatus.DRAFT,
      pageCount: 1,
      priceTotal: 0
    });
  };

  const handleEdit = (q: Quote) => {
    setEditingQuote(q);
    setFormData(q);
    setIsFormOpen(true);
  };

  const inputClass = "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none";

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{t.quotes}</h2>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> {t.newQuote}
        </button>
      </div>

      {/* Pending Requests Section */}
      {requests.length > 0 && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Inbox className="w-5 h-5" /> Pending Quote Requests
          </h3>
          <div className="grid gap-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{req.client_name} <span className="text-slate-400 font-normal text-sm">({req.client_email})</span></div>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">{req.documentType}</span> • {req.source_lang} → {req.target_lang}
                  </div>
                  {req.notes && <div className="text-xs text-slate-500 mt-1 italic">"{req.notes}"</div>}
                </div>
                <div className="flex items-center gap-3">
                  {req.file_path && (
                    <a
                      href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${req.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> View File
                    </a>
                  )}
                  <button
                    onClick={() => handleProcessRequest(req)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition-colors"
                  >
                    Process Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-y-auto h-full">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900 sticky top-0">
              <tr>
                <th className="px-6 py-4">{t.creationDate}</th>
                <th className="px-6 py-4">{t.client}</th>
                <th className="px-6 py-4">{t.jobDetails}</th>
                <th className="px-6 py-4 text-right">{t.amount}</th>
                <th className="px-6 py-4 text-center">{t.status}</th>
                <th className="px-6 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length > 0 ? quotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{q.date}</div>
                    <div className="text-xs text-slate-400">Exp: {q.validUntil}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{q.clientName}</td>
                  <td className="px-6 py-4">{q.documentType}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold">{q.priceTotal.toFixed(3)} TND</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${q.status === QuoteStatus.ACCEPTED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{q.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onPrintQuote(q)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded" title={t.printDevis}><Printer className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(q)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onConvertToJob(q)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded font-bold flex items-center gap-1" title={t.convertJob}><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => onDeleteQuote(q.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No quotes created.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editingQuote ? t.editQuote : t.newQuote}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t.creationDate}</label><input type="date" required className={inputClass} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t.validUntil}</label><input type="date" required className={inputClass} value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t.clientName}</label><input type="text" required className={inputClass} value={formData.clientName || ''} onChange={e => setFormData({ ...formData, clientName: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t.clientInfo}</label><input type="text" className={inputClass} value={formData.clientInfo || ''} onChange={e => setFormData({ ...formData, clientInfo: e.target.value })} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium mb-1">{t.docType}</label><input type="text" required className={inputClass} value={formData.documentType || ''} onChange={e => setFormData({ ...formData, documentType: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t.sourceLang}</label><select className={inputClass} value={formData.sourceLang} onChange={e => setFormData({ ...formData, sourceLang: e.target.value })}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">{t.targetLang}</label><select className={inputClass} value={formData.targetLang} onChange={e => setFormData({ ...formData, targetLang: e.target.value })}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">{t.pageCount}</label><input type="number" min="1" className={inputClass} value={formData.pageCount} onChange={e => setFormData({ ...formData, pageCount: parseInt(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t.totalPrice} (TND)</label><input type="number" step="0.001" className={inputClass} value={formData.priceTotal} onChange={e => setFormData({ ...formData, priceTotal: parseFloat(e.target.value) })} /></div>

              <div className="col-span-2 border-t pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium">{t.saveQuote}</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default QuoteManager;
