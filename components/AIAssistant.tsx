import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, TrendingUp, AlertCircle } from 'lucide-react';
import { TranslationJob, Expense } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { Lang, translations } from '../locales';

interface AIAssistantProps {
  jobs: TranslationJob[];
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ jobs, expenses, isOpen, onClose, lang }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const t = translations[lang];

  const generateAnalysis = async () => {
    setLoading(true);
    const month = new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'default', { month: 'long' });
    const result = await getFinancialInsights(jobs, expenses, month);
    setInsight(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // Auto-generate on first open if empty
  useEffect(() => {
    if (isOpen && !insight && !loading) {
      generateAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header - Light Theme */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">{t.financialAdvisor}</h2>
            <p className="text-xs text-slate-500">{t.poweredBy}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-slate-400">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
               <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 relative z-10" />
             </div>
             <p className="text-sm font-medium text-slate-600">{t.processing}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Insight Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.execSummary}</span>
              </div>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {insight}
              </div>
            </div>

            {/* Context Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-800 font-medium mb-1">{t.didYouKnow}</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  {t.aiContext}
                </p>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-xs text-slate-400 text-center mt-6">
                Analysis updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button 
          onClick={generateAnalysis} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.processing : t.refreshAnalysis}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;