import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LayoutDashboard, FileText, PieChart, LogOut, Globe, Settings as SettingsIcon, Users, FileSignature, Cloud, Shield, Loader2, Database, TrendingUp } from 'lucide-react';
import { TranslationJob, Expense, Language, TranslationStatus, ExpenseCategory, BusinessProfile, Quote, QuoteStatus, Secretary } from './types';
import Dashboard from './components/Dashboard';
import TranslationManager from './components/TranslationManager';
import ExpenseManager from './components/ExpenseManager';
import InvoiceView from './components/InvoiceView';
import Login from './components/Login';
import Settings from './components/Settings';
import ClientManager from './components/ClientManager';
import QuoteManager from './components/QuoteManager';
import ClientPortal from './components/ClientPortal';
import TranslationMemory from './components/TranslationMemory';
import Logo from './components/Logo';
import LandingPage from './components/LandingPage';
import MobileDashboard from './components/MobileDashboard';
import MobileNav from './components/MobileNav';
import { X, Plus, Clock, DollarSign } from 'lucide-react';
// import Analytics from './components/Analytics';
import VerificationPage from './components/VerificationPage';
import { translations, Lang } from './locales';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { useAuth, useUserRole } from './hooks/useAuth';
import { useTranslationJobs, useExpenses, useQuotes, useBusinessProfile } from './hooks/useSupabaseData';

// --- Navigation Components ---
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1
      ${active
        ? 'bg-primary-50 text-primary-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
    {label}
  </button>
);

const App: React.FC = () => {
  // --- Auth ---
  const { user, loading: authLoading, signOut } = useAuth();
  const { role: userRole, loading: roleLoading } = useUserRole(user);

  // --- Routing (Simple implementation) ---
  const path = window.location.pathname;
  if (path.startsWith('/verify/')) {
    const docId = path.split('/verify/')[1];
    return <VerificationPage docId={docId} />;
  }

  // --- Client Portal State (for non-authenticated client access) ---
  const [clientPortalUser, setClientPortalUser] = useState<string | null>(() => {
    return localStorage.getItem('lexiledger_client') || null;
  });
  const [clientPortalKey, setClientPortalKey] = useState<string | null>(() => {
    return localStorage.getItem('lexiledger_client_key') || null;
  });

  // --- Secretary State ---
  const [secretary, setSecretary] = useState<Secretary | null>(() => {
    const stored = localStorage.getItem('lexiledger_secretary');
    return stored ? JSON.parse(stored) : null;
  });

  // --- Language State ---
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lexiledger_lang') as Lang) || 'en';
  });

  const t = translations[lang];

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'translations' | 'clients' | 'quotes' | 'expenses' | 'resources' | 'settings'>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  // --- Mobile Logic ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Supabase Data Hooks ---
  const {
    jobs,
    loading: jobsLoading,
    addJob,
    updateJob,
    deleteJob
  } = useTranslationJobs(user, secretary);

  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    deleteExpense
  } = useExpenses(user, secretary);

  const {
    quotes,
    loading: quotesLoading,
    addQuote,
    updateQuote,
    deleteQuote
  } = useQuotes(user, secretary);

  const {
    profile: businessProfile,
    loading: profileLoading,
    saveProfile
  } = useBusinessProfile(user, secretary);

  // Invoice Modal State (Shared for Jobs and Quotes)
  const [printDoc, setPrintDoc] = useState<{ data: TranslationJob | Quote, type: 'invoice' | 'quote' } | null>(null);

  // Sync State
  const isSyncing = jobsLoading || expensesLoading || quotesLoading || profileLoading;

  // --- Persistence ---
  useEffect(() => {
    if (clientPortalUser) {
      localStorage.setItem('lexiledger_client', clientPortalUser);
    } else {
      localStorage.removeItem('lexiledger_client');
    }
    if (clientPortalKey) {
      localStorage.setItem('lexiledger_client_key', clientPortalKey);
    } else {
      localStorage.removeItem('lexiledger_client_key');
    }
  }, [clientPortalUser, clientPortalKey]);

  useEffect(() => {
    if (secretary) {
      localStorage.setItem('lexiledger_secretary', JSON.stringify(secretary));
    } else {
      localStorage.removeItem('lexiledger_secretary');
    }
  }, [secretary]);

  useEffect(() => {
    localStorage.setItem('lexiledger_lang', lang);
  }, [lang]);

  // --- Handlers ---
  const handleLogin = (role: 'admin' | 'secretary' | 'client', data?: string) => {
    if (role === 'client' && data) {
      // Data is JSON string { name, code }
      try {
        const { name, code } = JSON.parse(data);
        setClientPortalUser(name);
        setClientPortalKey(code);
      } catch (e) {
        // Fallback for old sessions or raw strings (though verify_client_access should prevent this)
        setClientPortalUser(data);
      }
    } else if (role === 'secretary' && data) {
      const secretaryData: Secretary = JSON.parse(data);
      setSecretary(secretaryData);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('profile_reminder_seen');
    if (user) {
      await signOut();
    } else if (clientPortalUser) {
      setClientPortalUser(null);
      setClientPortalKey(null);
    } else if (secretary) {
      setSecretary(null);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'fr' : 'en');
  };

  const handleAddJob = async (job: Omit<TranslationJob, 'id'>) => {
    await addJob(job);
  };

  const handleUpdateJob = async (updatedJob: TranslationJob) => {
    await updateJob(updatedJob);
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
  };

  const handleAddExpense = async (exp: Omit<Expense, 'id'>) => {
    await addExpense(exp);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  // Quotes Handlers
  const handleAddQuote = async (q: Omit<Quote, 'id'>) => {
    await addQuote(q);
  };

  const handleUpdateQuote = async (q: Quote) => {
    await updateQuote(q);
  };

  const handleDeleteQuote = async (id: string) => {
    await deleteQuote(id);
  };

  const handleConvertToJob = async (q: Quote) => {
    const newJob: Omit<TranslationJob, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      clientName: q.clientName,
      clientInfo: q.clientInfo,
      documentType: q.documentType,
      sourceLang: q.sourceLang,
      targetLang: q.targetLang,
      pageCount: q.pageCount,
      priceTotal: q.priceTotal,
      status: TranslationStatus.PENDING,
      remarks: `Converted from Quote. ${q.remarks}`
    };
    await handleAddJob(newJob);
    await handleUpdateQuote({ ...q, status: QuoteStatus.ACCEPTED });
    alert("Quote converted to Job successfully!");
    setActiveTab('translations');
  };

  // --- RENDER: Loading ---
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // --- RENDER: Login / Landing Page ---
  if (!user && !clientPortalUser && !secretary) {
    if (!showLogin) {
      return <LandingPage onGetStarted={() => setShowLogin(true)} lang={lang} toggleLang={toggleLang} />;
    }

    return (
      <>
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button onClick={() => setShowLogin(false)} className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Back
          </button>
          <button onClick={toggleLang} className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
            <Globe className="w-4 h-4" /> {lang.toUpperCase()}
          </button>
        </div>
        <Login onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  // --- RENDER: Client Portal ---
  if (clientPortalUser) {
    return (
      <>
        <ClientPortal
          clientName={clientPortalUser}
          accessCode={clientPortalKey || ''}
          jobs={[]} // We will self-fetch inside ClientPortal now
          profile={businessProfile || undefined}
          onLogout={handleLogout}
          onPrintInvoice={(job) => setPrintDoc({ data: job, type: 'invoice' })}
          lang={lang}
          setLang={setLang}
        />
        {businessProfile && (
          <InvoiceView
            data={printDoc?.data || null}
            type={printDoc?.type || 'invoice'}
            profile={businessProfile}
            onClose={() => setPrintDoc(null)}
            onMarkAsCompleted={() => {
              if (printDoc?.data && printDoc.type === 'invoice') {
                handleUpdateJob({ ...printDoc.data as TranslationJob, status: TranslationStatus.COMPLETED });
              }
            }}
            lang={lang}
          />
        )}
      </>
    );
  }

  // Determine effective role for UI
  const effectiveRole = secretary ? 'secretary' : userRole;
  const secretaryPermissions = secretary?.permissions;

  // --- RENDER: App Interface (Admin/Secretary) ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <Logo size="medium" />
          <p className="text-xs text-slate-400 mt-2">{t.subtitle}</p>
        </div>

        <nav className="flex-1 p-4">
          {(!secretaryPermissions || secretaryPermissions.canViewDashboard) && (
            <NavItem icon={LayoutDashboard} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          )}
          {/* Analytics Removed and merged into Dashboard */}
          {(!secretaryPermissions || secretaryPermissions.canManageTranslations) && (
            <NavItem icon={FileText} label={t.translations} active={activeTab === 'translations'} onClick={() => setActiveTab('translations')} />
          )}
          {(!secretaryPermissions || secretaryPermissions.canManageClients) && (
            <NavItem icon={Users} label={t.clients} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
          )}
          {(!secretaryPermissions || secretaryPermissions.canManageQuotes) && (
            <NavItem icon={FileSignature} label={t.quotes} active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
          )}
          <NavItem icon={Database} label="Resources" active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} />
          {(!secretaryPermissions || secretaryPermissions.canManageExpenses) && effectiveRole === 'admin' && (
            <NavItem icon={PieChart} label={t.expenses} active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
          )}
          {(!secretaryPermissions || secretaryPermissions.canViewSettings) && (
            <NavItem icon={SettingsIcon} label={t.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="px-2 pb-2 text-xs text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> {t.loggedAs}: <span className="font-bold capitalize text-slate-600">
              {secretary ? `${secretary.name} (${t.secretaryRole})` : (effectiveRole === 'admin' ? t.adminRole : effectiveRole)}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleLang} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors">
              <Globe className="w-3 h-3" /> {lang === 'en' ? 'English' : 'Français'}
            </button>
            <button onClick={handleLogout} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>



      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">

        {/* Header with Cloud Sync Status */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between md:justify-end shrink-0">
          <div className="md:hidden">
            <Logo size="small" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-xs font-medium border border-slate-100">
              <Cloud className={`w-3 h-3 ${isSyncing ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
              <span className="text-slate-500">{isSyncing ? t.syncing : t.synced}</span>
            </div>
            <div className="md:hidden flex gap-2">
              <button onClick={toggleLang} className="text-xs font-bold bg-slate-100 p-2 rounded">{lang.toUpperCase()}</button>
              <button onClick={handleLogout} className="text-rose-500 p-2"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
          {activeTab === 'dashboard' && (!secretaryPermissions || secretaryPermissions.canViewDashboard) && (
            isMobile ? (
              <MobileDashboard
                jobs={jobs}
                expenses={expenses}
                lang={lang}
                onNavigate={(tab) => {
                  if (tab === 'add_job') {
                    // Open Add Form Logic (Usually in TranslationManager)
                    setActiveTab('translations');
                    // We might need a way to auto-open the form, but simply navigating to list is fine for now
                  } else {
                    setActiveTab(tab as any);
                  }
                }}
              />
            ) : (
              <Dashboard jobs={jobs} expenses={expenses} lang={lang} userRole={effectiveRole} />
            )
          )}
          {activeTab === 'translations' && (!secretaryPermissions || secretaryPermissions.canManageTranslations) && (
            <TranslationManager
              jobs={jobs}
              onAddJob={handleAddJob}
              onUpdateJob={handleUpdateJob}
              onDeleteJob={handleDeleteJob}
              onPrintInvoice={(job) => setPrintDoc({ data: job, type: 'invoice' })}
              lang={lang}
            />
          )}
          {activeTab === 'clients' && (!secretaryPermissions || secretaryPermissions.canManageClients) && (
            <ClientManager jobs={jobs} lang={lang} />
          )}
          {activeTab === 'quotes' && (!secretaryPermissions || secretaryPermissions.canManageQuotes) && (
            <QuoteManager
              quotes={quotes}
              onAddQuote={handleAddQuote}
              onUpdateQuote={handleUpdateQuote}
              onDeleteQuote={handleDeleteQuote}
              onConvertToJob={handleConvertToJob}
              onPrintQuote={(q) => setPrintDoc({ data: q, type: 'quote' })}
              lang={lang}
            />
          )}
          {activeTab === 'resources' && (
            <TranslationMemory lang={lang} />
          )}
          {activeTab === 'expenses' && (!secretaryPermissions || secretaryPermissions.canManageExpenses) && effectiveRole === 'admin' && (
            <ExpenseManager
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              lang={lang}
            />
          )}
          {activeTab === 'settings' && businessProfile && (!secretaryPermissions || secretaryPermissions.canViewSettings) && (
            <Settings
              profile={businessProfile}
              onSave={saveProfile}
              jobs={jobs}
              expenses={expenses}
              lang={lang}
              userRole={effectiveRole || 'admin'}
              user={user}
            />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      {
        user && !clientPortalUser && (
          <>
            <MobileNav
              activeTab={activeTab}
              onNavigate={(tab) => {
                if (tab === 'add_job') {
                  setActiveTab('translations');
                  // Optionally trigger "IsFormOpen" via context or prop if we had it lifted
                } else {
                  setActiveTab(tab as any);
                }
              }}
              onOpenMenu={() => setIsMobileMenuOpen(true)}
            />

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm text-white p-6 animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setActiveTab('quotes'); setIsMobileMenuOpen(false); }} className="p-4 bg-white/5 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10">
                    <FileText className="w-8 h-8 text-amber-400" />
                    <span className="font-bold">Quotes</span>
                  </button>
                  <button onClick={() => { setActiveTab('expenses'); setIsMobileMenuOpen(false); }} className="p-4 bg-white/5 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10">
                    <DollarSign className="w-8 h-8 text-rose-400" />
                    <span className="font-bold">Expenses</span>
                  </button>
                  <button onClick={() => { setActiveTab('resources'); setIsMobileMenuOpen(false); }} className="p-4 bg-white/5 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10">
                    <Database className="w-8 h-8 text-blue-400" />
                    <span className="font-bold">Archives</span>
                  </button>
                  <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className="p-4 bg-white/5 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10">
                    <SettingsIcon className="w-8 h-8 text-slate-400" />
                    <span className="font-bold">Settings</span>
                  </button>
                </div>

                <div className="mt-12">
                  <button onClick={handleLogout} className="w-full py-4 bg-rose-600 rounded-xl font-bold flex items-center justify-center gap-2">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </>
        )
      }

      {/* Overlays */}
      {
        businessProfile && (
          <InvoiceView
            data={printDoc?.data || null}
            type={printDoc?.type || 'invoice'}
            profile={businessProfile}
            onClose={() => setPrintDoc(null)}
            onMarkAsCompleted={() => {
              if (printDoc?.data && printDoc.type === 'invoice') {
                handleUpdateJob({ ...printDoc.data as TranslationJob, status: TranslationStatus.COMPLETED });
              }
            }}
            lang={lang}
          />
        )
      }

      {/* Global Modals */}
      <ProfileCompletionModal
        profile={businessProfile}
        onNavigateToSettings={() => setActiveTab('settings')}
      />

    </div >
  );
};

export default App;
