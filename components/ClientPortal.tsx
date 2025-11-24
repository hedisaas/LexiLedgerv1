
import React from 'react';
import { TranslationJob, TranslationStatus, BusinessProfile } from '../types';
import { Lang, translations } from '../locales';
import { LogOut, Download, FileText, CheckCircle, Clock, Globe } from 'lucide-react';

interface ClientPortalProps {
  clientName: string;
  jobs: TranslationJob[];
  profile: BusinessProfile;
  onLogout: () => void;
  onPrintInvoice: (job: TranslationJob) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ clientName, jobs, profile, onLogout, onPrintInvoice, lang, setLang }) => {
  const t = translations[lang];
  
  // Filter jobs for this client
  const clientJobs = jobs.filter(j => j.clientName.toLowerCase() === clientName.toLowerCase());

  const handleDownloadFile = (job: TranslationJob) => {
    if (job.finalDocument) {
      const link = document.createElement('a');
      link.href = job.finalDocument;
      link.download = `Translation_${job.documentType}.pdf`; // Assuming PDF/Doc
      link.click();
    } else {
      alert("File not ready yet.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <div>
               <h1 className="font-bold text-lg text-slate-900 leading-none">LexiLedger</h1>
               <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Client Portal</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 transition-colors">
               <Globe className="w-3 h-3" /> {lang}
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 text-rose-600 font-medium hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors">
               <LogOut className="w-4 h-4" /> Logout
            </button>
         </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
         {/* Welcome Header */}
         <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl mb-8 flex justify-between items-end">
            <div>
               <h2 className="text-3xl font-bold mb-2">{t.welcomeClient}, {clientName}!</h2>
               <p className="text-slate-300">{t.clientPortalDesc}</p>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm">
               <p className="text-xs text-slate-300 uppercase font-bold tracking-wider">Translator Contact</p>
               <p className="font-medium text-lg">{profile.translatorName}</p>
               <p className="text-sm text-slate-300">{profile.phone}</p>
            </div>
         </div>

         {/* Documents List */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" /> {t.myDocuments}
               </h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Document</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {clientJobs.length > 0 ? clientJobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-slate-600">{job.date}</td>
                           <td className="px-6 py-4 font-medium text-slate-900">{job.documentType}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${job.status === TranslationStatus.COMPLETED || job.status === TranslationStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {job.status === TranslationStatus.COMPLETED || job.status === TranslationStatus.PAID ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                 {job.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3">
                                 {job.finalDocument && (
                                    <button onClick={() => handleDownloadFile(job)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
                                       <Download className="w-3 h-3" /> {t.downloadFile}
                                    </button>
                                 )}
                                 <button onClick={() => onPrintInvoice(job)} className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium text-xs bg-slate-100 px-3 py-1.5 rounded-md transition-colors">
                                    <FileText className="w-3 h-3" /> {t.downloadInvoice}
                                 </button>
                              </div>
                           </td>
                        </tr>
                     )) : (
                        <tr><td colSpan={4} className="text-center py-12 text-slate-400 italic">No documents found.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ClientPortal;
