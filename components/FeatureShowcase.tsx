import React, { useState } from 'react';
import {
    LayoutDashboard,
    Languages,
    FileText,
    Users,
    Settings,
    Globe,
    Briefcase,
    Receipt
} from 'lucide-react';
import Dashboard from './Dashboard';
import TranslationManager from './TranslationManager';
import QuoteManager from './QuoteManager';
import ClientPortal from './ClientPortal';
import { TranslationJob, Quote, BusinessProfile, TranslationStatus, Language, QuoteStatus, Expense, ExpenseCategory } from '../types';
import { Lang } from '../locales';

interface FeatureShowcaseProps {
    lang: Lang;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'translations' | 'quotes' | 'portal'>('dashboard');

    // --- MOCK DATA ---
    const today = new Date();
    const getPastDate = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const getFutureDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const mockProfile: BusinessProfile = {
        businessName: "LexiLedger Translations",
        translatorName: "Sarra Ben Ali",
        address: "123 Avenue Habib Bourguiba, Tunis",
        taxId: "1234567/A/M/000",
        phone: "+216 71 000 000",
        email: "contact@lexiledger.com"
    };

    const isFr = lang === 'fr';

    const mockJobs: TranslationJob[] = [
        { id: '1', date: getPastDate(2), dueDate: getFutureDate(1), clientName: "TechCorp Intl", clientInfo: "Tunis", documentType: isFr ? "Contrat Légal" : "Legal Contract", sourceLang: Language.ENGLISH, targetLang: Language.FRENCH, pageCount: 5, priceTotal: 450, status: TranslationStatus.COMPLETED, remarks: "" },
        { id: '2', date: getPastDate(5), dueDate: getPastDate(1), clientName: "Global Trade SARL", clientInfo: "Sfax", documentType: isFr ? "Registre de Commerce" : "Commercial Registry", sourceLang: Language.FRENCH, targetLang: Language.ENGLISH, pageCount: 2, priceTotal: 120, status: TranslationStatus.PAID, remarks: "" },
        { id: '3', date: getPastDate(10), dueDate: getFutureDate(5), clientName: "Cabinet Maître Hedi", clientInfo: "Tunis", documentType: isFr ? "Jugement Tribunal" : "Court Judgment", sourceLang: Language.ARABIC, targetLang: Language.FRENCH, pageCount: 8, priceTotal: 600, status: TranslationStatus.PENDING, remarks: "" },
    ];

    const mockQuotes: Quote[] = [
        { id: '1', date: getPastDate(1), validUntil: getFutureDate(29), clientName: "New Client SA", clientInfo: "Ariana", documentType: isFr ? "Proposition Projet" : "Project Proposal", sourceLang: Language.FRENCH, targetLang: Language.ENGLISH, pageCount: 10, priceTotal: 500, status: QuoteStatus.DRAFT, remarks: "" },
        { id: '2', date: getPastDate(5), validUntil: getFutureDate(25), clientName: "StartUp Hub", clientInfo: "Sousse", documentType: isFr ? "Conditions de Service" : "Terms of Service", sourceLang: Language.ENGLISH, targetLang: Language.ARABIC, pageCount: 12, priceTotal: 850, status: QuoteStatus.ACCEPTED, remarks: "" },
    ];

    const mockExpenses: Expense[] = [
        { id: '1', date: getPastDate(3), description: isFr ? "Loyer Bureau" : "Office Rent", amount: 800, category: ExpenseCategory.FIXED_RENT },
        { id: '2', date: getPastDate(12), description: isFr ? "Facture Internet" : "Internet Bill", amount: 80, category: ExpenseCategory.VARIABLE_BILLS },
    ];

    const mockStats = {
        revenue: 4500,
        pendingJobs: 3,
        completedJobs: 12,
        expenses: 880
    };

    const mockRecentActivity = [
        { id: '1', type: 'job_created', description: 'New job created for TechCorp', date: getPastDate(0) },
        { id: '2', type: 'payment_received', description: 'Payment received from Global Trade', date: getPastDate(1) },
    ];

    const mockUpcomingDeadlines = [
        { id: '1', clientName: 'TechCorp Intl', documentType: 'Legal Contract', dueDate: getFutureDate(1) },
    ];

    // Mock Handlers
    const noOp = () => alert("This is a demo preview. Sign up to use this feature!");

    const tabs = [
        { id: 'dashboard', label: isFr ? 'Tableau de bord' : 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'translations', label: isFr ? 'Traductions' : 'Translations', icon: Languages, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'quotes', label: isFr ? 'Devis & Factures' : 'Quotes & Invoices', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'portal', label: isFr ? 'Portail Client' : 'Client Portal', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs Header */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 min-w-[120px] group ${isActive
                                ? 'bg-white shadow-xl scale-110 ring-2 ring-primary-100'
                                : 'bg-slate-50 hover:bg-white hover:shadow-lg hover:-translate-y-1'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isActive ? `${tab.bg} ${tab.color}` : 'bg-slate-200 text-slate-500 group-hover:bg-slate-100'
                                }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Browser Window Container */}
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/10">
                {/* Browser Toolbar */}
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-4 border-b border-slate-700">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 bg-slate-900/50 rounded-lg px-4 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-2 border border-slate-700/50">
                        <Globe className="w-3 h-3" />
                        <span className="opacity-50">https://</span>
                        <span className="text-white">app.lexiledger.com</span>
                        <span className="opacity-50">/{activeTab}</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-slate-50 h-[600px] overflow-hidden relative isolate">
                    {/* Render Active Component */}
                    <div className="absolute inset-0 overflow-auto">
                        {activeTab === 'dashboard' && (
                            <div className="p-6 h-full">
                                <Dashboard
                                    jobs={mockJobs}
                                    expenses={mockExpenses}
                                    lang={lang}
                                    userRole="admin"
                                />
                            </div>
                        )}

                        {activeTab === 'translations' && (
                            <div className="p-6 h-full bg-white">
                                <TranslationManager
                                    jobs={mockJobs}
                                    onAddJob={noOp}
                                    onUpdateJob={noOp}
                                    onDeleteJob={noOp}
                                    onPrintInvoice={noOp}
                                    lang={lang}
                                />
                            </div>
                        )}

                        {activeTab === 'quotes' && (
                            <div className="p-6 h-full bg-white">
                                <QuoteManager
                                    quotes={mockQuotes}
                                    onAddQuote={noOp}
                                    onUpdateQuote={noOp}
                                    onDeleteQuote={noOp}
                                    onConvertToJob={noOp}
                                    onPrintQuote={noOp}
                                    lang={lang}
                                />
                            </div>
                        )}

                        {activeTab === 'portal' && (
                            <div className="h-full bg-slate-50">
                                <ClientPortal
                                    clientName="TechCorp Intl"
                                    jobs={mockJobs}
                                    profile={mockProfile}
                                    onLogout={noOp}
                                    onPrintInvoice={noOp}
                                    lang={lang}
                                    setLang={noOp}
                                />
                            </div>
                        )}
                    </div>

                    {/* Overlay for "Demo Mode" interaction hint */}
                    <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
                        <div className="bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {isFr ? 'Aperçu Interactif en Direct' : 'Live Interactive Preview'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureShowcase;
