import React from 'react';
import { TranslationJob, TranslationStatus, Expense, Quote } from '../types';
import { Lang, translations } from '../locales';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Plus, ChevronRight, DollarSign } from 'lucide-react';

interface MobileDashboardProps {
    jobs: TranslationJob[];
    expenses: Expense[];
    lang: Lang;
    onNavigate: (tab: string) => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ jobs, expenses, lang, onNavigate }) => {
    const t = translations[lang];

    // --- Metrics ---
    const today = new Date().toISOString().split('T')[0];

    // 1. Revenue Today
    const revenueToday = jobs
        .filter(j => j.date === today && j.status === TranslationStatus.PAID)
        .reduce((sum, j) => sum + j.priceTotal, 0);

    // 2. Due Soon (Next 3 days)
    const dueJobs = jobs
        .filter(j => j.status === TranslationStatus.PENDING) // Pending is effectively in progress
        .sort((a, b) => new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime())
        .slice(0, 3); // Top 3 urgent

    // 3. Pending Invoices (Completed but Unpaid)
    const pendingPaymentCount = jobs.filter(j => j.status === TranslationStatus.COMPLETED).length;

    return (
        <div className="pb-24 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{t.dashboard}</h1>
                <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full uppercase">{t.mobile}</span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">{t.today}</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {revenueToday.toFixed(0)} <span className="text-sm font-normal opacity-80">TND</span>
                    </div>
                </div>

                {/* Pending Card */}
                <div onClick={() => onNavigate('translations')} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:scale-95 transition-transform">
                    <div className="flex items-center gap-2 mb-1 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">{t.unpaidJobs}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {pendingPaymentCount}
                    </div>
                    <div className="text-xs text-slate-400">{t.finishedJobs}</div>
                </div>
            </div>

            {/* Urgent Tasks */}
            <div>
                <div className="flex justify-between items-end mb-3">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-500" /> {t.urgent}
                    </h2>
                    <button onClick={() => onNavigate('translations')} className="text-xs font-bold text-primary-600">{t.viewAll}</button>
                </div>

                <div className="space-y-3">
                    {dueJobs.length > 0 ? dueJobs.map(job => (
                        <div key={job.id} onClick={() => onNavigate('translations')} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between active:bg-slate-50">
                            <div>
                                <div className="font-bold text-slate-900">{job.documentType}</div>
                                <div className="text-xs text-slate-500">{job.clientName} • {job.dueDate || t.noDate}</div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${job.status === TranslationStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                                }`}>
                                {job.status}
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                            {t.noUrgentJobs}
                        </div>
                    )}
                </div>
            </div>

            {/* Recently Added Section */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">{t.recentlyAdded}</h2>
                <div className="space-y-3">
                    {jobs
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3)
                        .map(job => (
                            <div key={job.id} onClick={() => onNavigate('translations')} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{job.documentType}</div>
                                        <div className="text-xs text-slate-500">{job.clientName} • {job.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">{job.priceTotal} TND</div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${job.status === TranslationStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                                        job.status === TranslationStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {job.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">{t.quickActions}</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onNavigate('add_job')} className="bg-primary-50 hover:bg-primary-100 border border-primary-100 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-600">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{t.newTranslation}</span>
                    </button>
                    <button onClick={() => onNavigate('clients')} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{t.clients}</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default MobileDashboard;
