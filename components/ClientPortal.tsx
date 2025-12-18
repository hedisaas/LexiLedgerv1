
import React from 'react';
import { TranslationJob, TranslationStatus, BusinessProfile } from '../types';
import { Lang, translations } from '../locales';
import { LogOut, Download, FileText, CheckCircle, Clock, Globe, Plus, Upload, Loader2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientPortalProps {
   clientName: string;
   clientName: string;
   accessCode: string;
   jobs: TranslationJob[]; // Kept for backward compat but largely unused now
   profile?: BusinessProfile;
   onLogout: () => void;
   onPrintInvoice: (job: TranslationJob) => void;
   lang: Lang;
   setLang: (lang: Lang) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ clientName, accessCode, jobs: initialJobs, profile, onLogout, onPrintInvoice, lang, setLang }) => {
   const t = translations[lang];
   const [activeTab, setActiveTab] = React.useState<'documents' | 'request'>('documents');

   // Request Form State
   const [requestForm, setRequestForm] = React.useState({
      email: '',
      documentType: '',
      sourceLang: 'English',
      targetLang: 'French',
      notes: ''
   });
   const [requestFile, setRequestFile] = React.useState<File | null>(null);
   const [isSubmitting, setIsSubmitting] = React.useState(false);

   // Fetch Client Jobs specific to this user (Secure RPC)
   const [clientJobs, setClientJobs] = React.useState<TranslationJob[]>([]);
   const [loadingJobs, setLoadingJobs] = React.useState(true);

   React.useEffect(() => {
      const fetchMyJobs = async () => {
         setLoadingJobs(true);
         try {
            const { data, error } = await supabase.rpc('get_client_jobs', {
               p_client_name: clientName,
               p_access_code: accessCode
            });
            if (error) throw error;

            // Map RPC result to TranslationJob
            const mappedJobs: TranslationJob[] = (data || []).map((job: any) => ({
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
               finalDocument: job.final_document,
               finalDocuments: job.final_documents || []
            }));
            setClientJobs(mappedJobs);
         } catch (err) {
            console.error("Error fetching client jobs:", err);
            // Fallback to props if any (mostly empty)
            setClientJobs(initialJobs.filter(j => j.clientName.toLowerCase() === clientName.toLowerCase()));
         } finally {
            setLoadingJobs(false);
         }
      };

      if (clientName && accessCode) {
         fetchMyJobs();
      } else {
         setLoadingJobs(false); // No Credentials
      }
   }, [clientName, accessCode, initialJobs]);

   const handleRequestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!requestFile) {
         alert("Please upload a document.");
         return;
      }

      try {
         setIsSubmitting(true);

         // Upload file to Supabase Storage
         const fileExt = requestFile.name.split('.').pop();
         const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `client-uploads/${fileName}`;

         const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, requestFile);

         if (uploadError) throw uploadError;

         // Insert into quote_requests table
         const { error: dbError } = await supabase
            .from('quote_requests')
            .insert({
               client_name: clientName,
               client_email: requestForm.email,
               source_lang: requestForm.sourceLang,
               target_lang: requestForm.targetLang,
               document_type: requestForm.documentType,
               notes: requestForm.notes,
               file_path: filePath,
               status: 'pending'
            });

         if (dbError) throw dbError;

         alert("Quote request submitted successfully! We will contact you shortly.");

         // Reset form
         setRequestForm({
            email: '',
            documentType: '',
            sourceLang: 'English',
            targetLang: 'French',
            notes: ''
         });
         setRequestFile(null);
         setActiveTab('documents');

      } catch (error: any) {
         console.error('Error submitting request:', error);
         alert(`Error: ${error.message}`);
      } finally {
         setIsSubmitting(false);
      }
   };

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
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
               <div>
                  <h2 className="text-3xl font-bold mb-2">{t.welcomeClient}, {clientName}!</h2>
                  <p className="text-slate-300">{t.clientPortalDesc}</p>
               </div>
               <div className="text-left md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm w-full md:w-auto">
                  <p className="text-xs text-slate-300 uppercase font-bold tracking-wider">Translator Contact</p>
                  <p className="font-medium text-lg">{profile?.translatorName || 'LexiLedger'}</p>
                  <p className="text-sm text-slate-300">{profile?.phone || ''}</p>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
               <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === 'documents' ? 'bg-white text-primary-600 ring-2 ring-primary-100' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
               >
                  <FileText className="w-4 h-4" /> {t.myDocuments}
               </button>
               <button
                  onClick={() => setActiveTab('request')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === 'request' ? 'bg-white text-primary-600 ring-2 ring-primary-100' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
               >
                  <Plus className="w-4 h-4" /> Request New Quote
               </button>
            </div>

            {activeTab === 'documents' ? (
               /* Documents List */
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
            ) : (
               /* Request Quote Form */
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="p-6 border-b border-slate-100 bg-slate-50">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary-600" /> Request New Translation
                     </h3>
                  </div>
                  <div className="p-8">
                     <form onSubmit={handleRequestSubmit} className="space-y-6 max-w-2xl mx-auto">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                           <input
                              type="email"
                              placeholder="e.g. contact@company.com"
                              value={requestForm.email}
                              onChange={e => setRequestForm({ ...requestForm, email: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              required
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Source Language</label>
                              <select
                                 value={requestForm.sourceLang}
                                 onChange={e => setRequestForm({ ...requestForm, sourceLang: e.target.value })}
                                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              >
                                 <option>English</option>
                                 <option>French</option>
                                 <option>Arabic</option>
                                 <option>German</option>
                                 <option>Italian</option>
                                 <option>Spanish</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
                              <select
                                 value={requestForm.targetLang}
                                 onChange={e => setRequestForm({ ...requestForm, targetLang: e.target.value })}
                                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              >
                                 <option>French</option>
                                 <option>English</option>
                                 <option>Arabic</option>
                                 <option>German</option>
                                 <option>Italian</option>
                                 <option>Spanish</option>
                              </select>
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                           <input
                              type="text"
                              placeholder="e.g. Birth Certificate, Contract, Diploma"
                              value={requestForm.documentType}
                              onChange={e => setRequestForm({ ...requestForm, documentType: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">Upload Document</label>
                           <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                              <input
                                 type="file"
                                 onChange={e => setRequestFile(e.target.files ? e.target.files[0] : null)}
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                 accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.heic"
                              />
                              <div className="flex flex-col items-center gap-2">
                                 <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-6 h-6" />
                                 </div>
                                 {requestFile ? (
                                    <p className="font-medium text-primary-600">{requestFile.name}</p>
                                 ) : (
                                    <>
                                       <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                                       <p className="text-xs text-slate-400">PDF, Word, Excel, Images (Max 10MB)</p>
                                    </>
                                 )}
                              </div>
                           </div>

                           <div className="mt-3 flex justify-center">
                              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                                 <Camera className="w-4 h-4" />
                                 Take Photo with Camera
                                 <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={e => setRequestFile(e.target.files ? e.target.files[0] : null)}
                                    className="hidden"
                                 />
                              </label>
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                           <textarea
                              rows={3}
                              value={requestForm.notes}
                              onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="Any specific instructions..."
                           />
                        </div>

                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                           {isSubmitting ? 'Submitting Request...' : 'Submit Quote Request'}
                        </button>
                     </form>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ClientPortal;
