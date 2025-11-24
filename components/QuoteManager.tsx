
import React, { useState } from 'react';
import { Quote, QuoteStatus, Language, TranslationJob, TranslationStatus } from '../types';
import { Lang, translations } from '../locales';
import { Plus, Printer, CheckCircle, FileText, Trash2, Edit2, ArrowRight } from 'lucide-react';

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
  const [formData, setFormData] = useState<Partial<Quote>>({
     date: new Date().toISOString().split('T')[0],
     validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
     sourceLang: Language.FRENCH,
     targetLang: Language.ARABIC,
     status: QuoteStatus.DRAFT,
     pageCount: 1,
     priceTotal: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteToSave = {
      ...formData,
      id: editingQuote ? editingQuote.id : crypto.randomUUID(),
    } as Quote;

    if (editingQuote) {
      onUpdateQuote(quoteToSave);
    } else {
      onAddQuote(quoteToSave);
    }
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuote(null);
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
                         <button onClick={() => onPrintQuote(q)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded" title={t.printDevis}><Printer className="w-4 h-4"/></button>
                         <button onClick={() => handleEdit(q)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Edit2 className="w-4 h-4"/></button>
                         <button onClick={() => onConvertToJob(q)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded font-bold flex items-center gap-1" title={t.convertJob}><CheckCircle className="w-4 h-4" /></button>
                         <button onClick={() => onDeleteQuote(q.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4"/></button>
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
                <div><label className="block text-sm font-medium mb-1">{t.creationDate}</label><input type="date" required className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">{t.validUntil}</label><input type="date" required className={inputClass} value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">{t.clientName}</label><input type="text" required className={inputClass} value={formData.clientName || ''} onChange={e => setFormData({...formData, clientName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">{t.clientInfo}</label><input type="text" className={inputClass} value={formData.clientInfo || ''} onChange={e => setFormData({...formData, clientInfo: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">{t.docType}</label><input type="text" required className={inputClass} value={formData.documentType || ''} onChange={e => setFormData({...formData, documentType: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">{t.sourceLang}</label><select className={inputClass} value={formData.sourceLang} onChange={e => setFormData({...formData, sourceLang: e.target.value})}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">{t.targetLang}</label><select className={inputClass} value={formData.targetLang} onChange={e => setFormData({...formData, targetLang: e.target.value})}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">{t.pageCount}</label><input type="number" min="1" className={inputClass} value={formData.pageCount} onChange={e => setFormData({...formData, pageCount: parseInt(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium mb-1">{t.totalPrice} (TND)</label><input type="number" step="0.001" className={inputClass} value={formData.priceTotal} onChange={e => setFormData({...formData, priceTotal: parseFloat(e.target.value)})} /></div>
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
