
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TranslationJob, Language, TranslationStatus } from '../types';
import { Plus, Search, Printer, Edit2, Trash2, AlertCircle, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Camera, Upload, X, Sparkles, Copy, FileText, Languages, Save, Maximize2, Eye, Download, Code, LayoutTemplate, RotateCw, RotateCcw, RefreshCw, ZoomIn, ZoomOut, Move, ChevronDown, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, FileDown, Book, Database, BookOpen, CheckCircle, FolderOpen, AlignJustify, List as ListIcon, ListOrdered, Highlighter, Type, Palette } from 'lucide-react';
import { generateSwornTranslation } from '../services/geminiService';
import { findGlossaryMatches, findTMMatches } from '../services/tmService';
import { Lang, translations } from '../locales';
import RegistryView from './RegistryView';
import AITranslationHelper from './AITranslationHelper';
import EmailSuggestionModal from './EmailSuggestionModal';

interface TranslationManagerProps {
  jobs: TranslationJob[];
  onAddJob: (job: TranslationJob) => void;
  onUpdateJob: (job: TranslationJob) => void;
  onDeleteJob: (id: string) => void;
  onPrintInvoice: (job: TranslationJob) => void;
  lang: Lang;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({ jobs, onAddJob, onUpdateJob, onDeleteJob, onPrintInvoice, lang }) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState<TranslationJob | null>(null);
  
  // Completion Workflow
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [pendingCompletionJob, setPendingCompletionJob] = useState<TranslationJob | null>(null);
  const completionFileRef = useRef<HTMLInputElement>(null);
  
  // Registry State
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  
  // Workbench State
  const [workbenchJob, setWorkbenchJob] = useState<TranslationJob | null>(null);
  const [isAiTranslating, setIsAiTranslating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [targetOrientation, setTargetOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoomLevel, setZoomLevel] = useState(0.85); 
  const [tmMatches, setTmMatches] = useState<any[]>([]);
  const [glossaryMatches, setGlossaryMatches] = useState<any[]>([]);
  const [aiEmailSuggestion, setAiEmailSuggestion] = useState<string>('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Editor State & Formatting
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('transparent');

  // Preview Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Extract unique clients for auto-complete
  const uniqueClients = useMemo(() => {
    const clients = new Map();
    jobs.forEach(job => {
      if (!clients.has(job.clientName)) {
        clients.set(job.clientName, job.clientInfo);
      }
    });
    return Array.from(clients.entries());
  }, [jobs]);

  // Form State
  const [formData, setFormData] = useState<Partial<TranslationJob>>({
    date: new Date().toISOString().split('T')[0],
    sourceLang: Language.ENGLISH,
    targetLang: Language.ARABIC,
    status: TranslationStatus.PENDING,
    pageCount: 1,
    priceTotal: 0,
    dueDate: '',
    attachments: [],
    translatedText: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TM & Glossary Lookup ---
  useEffect(() => {
    if (workbenchJob && workbenchJob.translatedText) {
        const gMatches = findGlossaryMatches(workbenchJob.translatedText, 'en-fr');
        setGlossaryMatches(gMatches);
        const tMatches = findTMMatches(workbenchJob.translatedText);
        setTmMatches(tMatches);
    }
  }, [workbenchJob?.translatedText]);

  const handleClientSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const existingInfo = uniqueClients.find(([cName]) => cName === name);
    setFormData(prev => ({
      ...prev,
      clientName: name,
      clientInfo: existingInfo ? existingInfo[1] : prev.clientInfo
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newAttachments: string[] = [];
      
      let processedCount = 0;
      files.forEach(file => {
         if (file.size > 4 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Skip.`);
            processedCount++;
            return;
         }
         const reader = new FileReader();
         reader.onloadend = () => {
            newAttachments.push(reader.result as string);
            processedCount++;
            if (processedCount === files.length) {
               setFormData(prev => ({
                 ...prev,
                 attachments: [...(prev.attachments || []), ...newAttachments]
               }));
            }
         };
         reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobToSave = {
      ...formData,
      id: editingJob ? editingJob.id : crypto.randomUUID(),
    } as TranslationJob;

    // INTERCEPT COMPLETION
    if (jobToSave.status === TranslationStatus.COMPLETED && !jobToSave.finalDocument) {
       setPendingCompletionJob(jobToSave);
       setIsCompletionModalOpen(true);
       return;
    }

    if (editingJob) {
      onUpdateJob(jobToSave);
    } else {
      onAddJob(jobToSave);
    }
    closeForm();
  };

  const handleCompletionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0] && pendingCompletionJob) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
           const finalDoc = reader.result as string;
           const finalJob = { ...pendingCompletionJob, finalDocument: finalDoc };
           
           if (editingJob) onUpdateJob(finalJob);
           else onAddJob(finalJob);

           setIsCompletionModalOpen(false);
           setPendingCompletionJob(null);
           closeForm();
        };
        reader.readAsDataURL(file);
     }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingJob(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      sourceLang: Language.ENGLISH,
      targetLang: Language.ARABIC,
      status: TranslationStatus.PENDING,
      pageCount: 1,
      priceTotal: 0,
      dueDate: '',
      attachments: [],
      translatedText: ''
    });
  };

  const handleEdit = (job: TranslationJob) => {
    setEditingJob(job);
    setFormData(job);
    setIsFormOpen(true);
  };
  
  const handleDownloadFinal = (job: TranslationJob) => {
    if (job.finalDocument) {
       const link = document.createElement('a');
       link.href = job.finalDocument;
       link.download = `${job.clientName}_Final_Translation`;
       link.click();
    } else {
       alert("No final document uploaded.");
    }
  };

  // --- WORKBENCH LOGIC ---
  const openWorkbench = (job: TranslationJob) => {
    setWorkbenchJob({ ...job });
    setRotation(0);
    setTargetOrientation('portrait');
    setZoomLevel(0.85); 
  };

  const closeWorkbench = () => {
    if (workbenchJob && editorRef.current) {
      onUpdateJob({ ...workbenchJob, translatedText: editorRef.current.innerHTML });
    }
    setWorkbenchJob(null);
  };

  const handleWorkbenchSave = () => {
    if (workbenchJob && editorRef.current) {
      const content = editorRef.current.innerHTML;
      setWorkbenchJob({ ...workbenchJob, translatedText: content });
      onUpdateJob({ ...workbenchJob, translatedText: content });
      alert('Translation saved!');
    }
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const downloadAsWord = () => {
    if (!workbenchJob || !editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
                          xmlns:w='urn:schemas-microsoft-com:office:word' 
                          xmlns='http://www.w3.org/TR/REC-html40'>
                          <head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title>
                          <style>
                            body { font-family: 'Times New Roman', serif; }
                            table { border-collapse: collapse; width: 100%; }
                            td, th { border: 1px solid black; padding: 5px; }
                          </style>
                          </head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${workbenchJob.clientName.replace(/\s+/g, '_')}_translation.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const rotateImage = (base64Str: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      if (degrees === 0) return resolve(base64Str);
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Str);
        if (degrees === 90 || degrees === 270 || degrees === -90) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(base64Str);
      setTimeout(() => resolve(base64Str), 2000);
    });
  };

  const triggerWorkbenchAi = async () => {
    if (!workbenchJob || !workbenchJob.attachments || workbenchJob.attachments.length === 0) {
      alert("No document image found to translate.");
      return;
    }
    
    setIsAiTranslating(true);
    try {
      const processedImage = await rotateImage(workbenchJob.attachments[0], rotation);
      const result = await generateSwornTranslation(
        workbenchJob.sourceLang.toString(),
        workbenchJob.targetLang.toString(),
        workbenchJob.documentType,
        processedImage,
        targetOrientation
      );
      
      setWorkbenchJob(prev => prev ? ({ ...prev, translatedText: result }) : null);
      if (editorRef.current) {
        editorRef.current.innerHTML = result;
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAiTranslating(false);
    }
  };

  const getDeadlineStatus = (dueDate?: string, status?: TranslationStatus) => {
    if (!dueDate || status === TranslationStatus.COMPLETED || status === TranslationStatus.PAID) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays < 0) return <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.overdue}</span>;
    if (diffDays <= 2) return <span className="text-amber-500 text-xs font-bold">{t.due} {diffDays} {t.daysLeft}</span>;
    return <span className="text-slate-400 text-xs">{t.due}: {dueDate}</span>;
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString(lang === 'fr' ? 'fr-FR' : 'default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const grid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(<div key={`empty-${i}`} className="bg-slate-50/50 min-h-[80px] border-b border-r border-slate-100"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      // Logic Update: Show job if it has a Due Date matching today, 
      // OR if it has NO Due Date but was Created today.
      const dayJobs = jobs.filter(j => {
         if (j.dueDate === dateStr) return true;
         if (!j.dueDate && j.date === dateStr) return true;
         return false;
      });

      grid.push(
        <div key={day} className={`min-h-[80px] border-b border-r border-slate-100 p-1.5 transition-colors hover:bg-slate-50 flex flex-col ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>{day}</span>
            {dayJobs.length > 0 && <span className="text-[9px] font-bold text-slate-400 uppercase">{dayJobs.length}</span>}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[80px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {dayJobs.map(job => {
               // Style based on status
               let statusStyle = "bg-amber-50 border-amber-100 text-amber-800"; // Pending default
               if (job.status === TranslationStatus.COMPLETED) statusStyle = "bg-emerald-50 border-emerald-100 text-emerald-700 opacity-80";
               if (job.status === TranslationStatus.PAID) statusStyle = "bg-slate-100 border-slate-200 text-slate-500 line-through opacity-60";
               if (job.status === TranslationStatus.CANCELLED) statusStyle = "bg-rose-50 border-rose-100 text-rose-400";

               return (
                 <button key={job.id} onClick={() => handleEdit(job)} title={`${job.clientName} - ${job.status}`} className={`w-full text-left px-1.5 py-1 rounded border text-[10px] leading-tight truncate shadow-sm transition-transform hover:scale-[1.02] ${statusStyle} font-medium`}>
                   {job.clientName}
                 </button>
               );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 w-40 capitalize">{monthName} {year}</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
               <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
               <button onClick={() => setCalendarDate(new Date())} className="px-2 text-xs font-medium text-slate-600 hover:bg-white rounded-md shadow-sm transition">Today</button>
               <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Pending</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Done</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Paid</div>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-slate-800 text-white rounded-t-xl overflow-hidden shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 bg-slate-200 border-l border-slate-200 rounded-b-xl overflow-hidden flex-1 auto-rows-fr">{grid}</div>
      </div>
    );
  };

  const filteredJobs = jobs.filter(job => 
    job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.invoiceNumber && job.invoiceNumber.includes(searchTerm))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const inputClass = "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-400";

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><List className="w-4 h-4" /> {t.list}</button>
          <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><CalendarIcon className="w-4 h-4" /> {t.calendar}</button>
        </div>
        {viewMode === 'list' && (
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
            <input type="text" placeholder={t.searchPlaceholder} className={inputClass} style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setIsRegistryOpen(true)} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"><Book className="w-4 h-4" /> {t.officialRegistry}</button>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> {t.newTranslation}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm relative flex flex-col">
        {viewMode === 'list' ? (
          <div className="h-full overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">{t.dateDue}</th>
                  <th className="px-6 py-4">{t.client}</th>
                  <th className="px-6 py-4 hidden md:table-cell">{t.jobDetails}</th>
                  <th className="px-6 py-4 text-right">{t.amount}</th>
                  <th className="px-6 py-4 text-center">{t.status}</th>
                  <th className="px-6 py-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col"><span className="font-medium text-slate-700">{job.date}</span>{getDeadlineStatus(job.dueDate, job.status)}</div>
                    </td>
                    <td className="px-6 py-4"><div className="font-medium text-slate-900">{job.clientName}</div><div className="text-xs text-slate-400 truncate max-w-[150px]">{job.clientInfo}</div></td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">{job.sourceLang} → {job.targetLang}</span></div>
                      <div className="flex items-center gap-2 text-xs"><span>{job.documentType}</span>{job.attachments?.length ? <button onClick={() => setPreviewImage(job.attachments![0])} className="text-primary-600 hover:text-primary-700 p-1 bg-primary-50 rounded"><Eye className="w-3 h-3"/></button> : null}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">{job.priceTotal.toFixed(3)} TND</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${job.status === TranslationStatus.PAID ? 'bg-emerald-100 text-emerald-800' : job.status === TranslationStatus.PENDING ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{job.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {job.finalDocument && (
                          <button onClick={() => handleDownloadFinal(job)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Download Final"><FileDown className="w-4 h-4"/></button>
                        )}
                        <button onClick={() => openWorkbench(job)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Languages className="w-4 h-4" /></button>
                        <button onClick={() => onPrintInvoice(job)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(job)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete?')) onDeleteJob(job.id)}} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full p-4 bg-slate-50 overflow-hidden flex flex-col">{renderCalendar()}</div>
        )}
      </div>

      {isRegistryOpen && <RegistryView jobs={jobs} onClose={() => setIsRegistryOpen(false)} />}
      
      {/* Completion Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Completed!</h3>
              <p className="text-sm text-slate-500 mb-6">Do you want to upload the final translated document now? This allows you to download it later.</p>
              
              <input type="file" ref={completionFileRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleCompletionUpload} />
              
              <div className="space-y-3">
                <button onClick={() => completionFileRef.current?.click()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Final File
                </button>
                <button onClick={() => {
                   // Save without file
                   if (pendingCompletionJob) {
                      if(editingJob) onUpdateJob(pendingCompletionJob);
                      else onAddJob(pendingCompletionJob);
                   }
                   setIsCompletionModalOpen(false);
                   setPendingCompletionJob(null);
                   closeForm();
                }} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-lg font-medium">
                   Skip & Save
                </button>
              </div>
           </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden p-2">
             <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain" />
             <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white/90 text-slate-900 p-2 rounded-full hover:bg-white transition shadow-md"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {workbenchJob && (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-in fade-in duration-200">
          <style>{`
            /* WORD DOCUMENT STYLING - WORD ALIKE */
            .editor-content {
              font-family: "Times New Roman", Times, serif !important;
              font-size: 12pt;
              line-height: 1.15; /* Word Default */
              color: black;
              /* Simulating Page Break visually repeating every 297mm */
              background-image: linear-gradient(to bottom, transparent 99.8%, #cbd5e1 99.8%, #cbd5e1 100%);
              background-size: 100% 297mm;
            }
            .editor-content h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 12px; text-transform: uppercase; margin-top: 0; }
            .editor-content h2 { font-size: 14pt; font-weight: bold; margin-top: 12px; margin-bottom: 6px; }
            .editor-content p { margin-bottom: 8px; text-align: justify; margin-top: 0; }
            
            /* TABLES - STRICT */
            .editor-content table { 
              width: 100% !important; 
              border-collapse: collapse !important; 
              border: 1px solid black !important;
              margin-bottom: 12px;
              table-layout: fixed; 
            }
            .editor-content td, .editor-content th { 
              border: 1px solid black !important; 
              padding: 4px 6px; 
              vertical-align: top;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }

            @media print {
              .editor-content {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                background: none !important;
              }
            }
          `}</style>
          
          <div className="bg-white px-6 py-3 flex justify-between items-center border-b border-slate-200 shrink-0 shadow-sm z-30">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Languages className="w-5 h-5 text-primary-600" /> {t.editorWorkbench}</h2>
              <p className="text-xs text-slate-500">{workbenchJob.clientName} • {workbenchJob.documentType}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadAsWord} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"><FileDown className="w-4 h-4" /> {t.downloadDoc}</button>
              <button onClick={handleWorkbenchSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"><Save className="w-4 h-4" /> {t.save}</button>
              <button onClick={closeWorkbench} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">{t.close}</button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/3 lg:w-2/5 bg-slate-100 border-r border-slate-200 flex flex-col relative z-10">
               <div className="flex-1 flex flex-col">
                  {/* Source Image */}
                  <div className="h-2/3 relative border-b border-slate-200">
                     <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 p-1.5 rounded-lg shadow-sm backdrop-blur-sm">
                          <button onClick={() => setRotation(r => r - 90)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><RotateCcw className="w-4 h-4" /></button>
                          <button onClick={() => setRotation(r => r + 90)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><RotateCw className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-slate-300 mx-1"></div>
                          <button onClick={() => workbenchJob.attachments && setPreviewImage(workbenchJob.attachments[0])} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Maximize2 className="w-4 h-4" /></button>
                     </div>
                     <div className="w-full h-full overflow-hidden flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                       {workbenchJob.attachments && workbenchJob.attachments.length > 0 ? (
                         <img src={workbenchJob.attachments[0]} alt="Source" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease', maxWidth: '100%', maxHeight: '100%' }} className="object-contain shadow-lg rounded-sm bg-white"/>
                       ) : (
                         <div className="text-center text-slate-400"><FileText className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No document uploaded.</p></div>
                       )}
                     </div>
                  </div>
                  
                  {/* Translation Tools Panel */}
                  <div className="flex-1 bg-white flex flex-col">
                    <div className="p-2 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-500 flex items-center gap-2">
                      <Database className="w-3 h-3" /> {t.tools}
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                       {/* Glossary Matches */}
                       <div>
                         <h4 className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3"/> {t.glossary}</h4>
                         {glossaryMatches.length > 0 ? (
                           <div className="space-y-1">
                             {glossaryMatches.map(term => (
                               <div key={term.id} className="text-xs bg-indigo-50 border border-indigo-100 p-1.5 rounded flex justify-between">
                                 <span className="text-slate-600">{term.source}</span>
                                 <span className="font-bold text-indigo-700">{term.target}</span>
                               </div>
                             ))}
                           </div>
                         ) : <p className="text-xs text-slate-400 italic">{t.noMatches}</p>}
                       </div>

                       {/* TM Matches */}
                       <div>
                         <h4 className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3"/> {t.tmMatches}</h4>
                         {tmMatches.length > 0 ? (
                            <div className="space-y-2">
                              {tmMatches.map(tm => (
                                <div key={tm.id} className="text-xs bg-emerald-50 border border-emerald-100 p-2 rounded cursor-pointer hover:bg-emerald-100" onClick={() => document.execCommand('insertText', false, tm.targetSegment)}>
                                   <p className="text-slate-500 mb-1 line-clamp-2">{tm.sourceSegment}</p>
                                   <p className="font-bold text-emerald-800 border-t border-emerald-200 pt-1">{tm.targetSegment}</p>
                                </div>
                              ))}
                            </div>
                         ) : <p className="text-xs text-slate-400 italic">{t.noMatches}</p>}
                       </div>

                       {/* AI Translation Helper - Always visible */}
                       <div>
                         <AITranslationHelper
                           sourceText={workbenchJob.attachments?.[0] ? "Source document" : undefined}
                           targetText={editorRef.current?.innerText || ''}
                           sourceLang={workbenchJob.sourceLang}
                           targetLang={workbenchJob.targetLang}
                           onSuggestion={(suggestion) => {
                             setAiEmailSuggestion(suggestion);
                             setIsEmailModalOpen(true);
                           }}
                         />
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-slate-200 flex flex-col relative overflow-hidden">
               {/* Enhanced Word-like Toolbar */}
               <div className="border-b border-slate-300 bg-white z-10 shadow-sm">
                  {/* First Row - Font & Size */}
                  <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-2 flex-wrap">
                      {/* Font Family */}
                      <select 
                        value={fontFamily} 
                        onChange={(e) => {
                          setFontFamily(e.target.value);
                          document.execCommand('fontName', false, e.target.value);
                        }}
                        className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Arial">Arial</option>
                        <option value="Calibri">Calibri</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                      </select>

                      {/* Font Size */}
                      <select 
                        value={fontSize}
                        onChange={(e) => {
                          const size = parseInt(e.target.value);
                          setFontSize(size);
                          document.execCommand('fontSize', false, '7');
                          const fontElements = document.querySelectorAll('font[size="7"]');
                          fontElements.forEach(el => {
                            (el as HTMLElement).removeAttribute('size');
                            (el as HTMLElement).style.fontSize = `${size}pt`;
                          });
                        }}
                        className="px-2 py-1 border border-slate-300 rounded text-xs w-16 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="20">20</option>
                        <option value="24">24</option>
                      </select>

                      {/* Text Color */}
                      <div className="flex items-center gap-1 border border-slate-300 rounded p-1">
                        <Type className="w-3.5 h-3.5 text-slate-600" />
                        <input 
                          type="color" 
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            document.execCommand('foreColor', false, e.target.value);
                          }}
                          className="w-6 h-6 cursor-pointer"
                          title="Text color"
                        />
                      </div>

                      {/* Background Color */}
                      <div className="flex items-center gap-1 border border-slate-300 rounded p-1">
                        <Highlighter className="w-3.5 h-3.5 text-slate-600" />
                        <input 
                          type="color" 
                          value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            document.execCommand('hiliteColor', false, e.target.value);
                          }}
                          className="w-6 h-6 cursor-pointer"
                          title="Highlight color"
                        />
                      </div>
                  </div>

                  {/* Second Row - Format ting */}
                  <div className="px-3 py-2 flex items-center gap-2 flex-wrap bg-slate-50">
                      {/* Text Style */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => executeCommand('bold')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('italic')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('underline')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Underline (Ctrl+U)"><Underline className="w-4 h-4" /></button>
                      </div>

                      {/* Alignment */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => executeCommand('justifyLeft')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('justifyCenter')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Center"><AlignCenter className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('justifyRight')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Align Right"><AlignRight className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('justifyFull')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Justify"><AlignJustify className="w-4 h-4" /></button>
                      </div>

                      {/* Lists */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Bullet List"><ListIcon className="w-4 h-4" /></button>
                        <button onClick={() => executeCommand('insertOrderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                      </div>

                      {/* Indentation */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => executeCommand('indent')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs font-bold" title="Increase Indent">→</button>
                        <button onClick={() => executeCommand('outdent')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs font-bold" title="Decrease Indent">←</button>
                      </div>

                      {/* Page Orientation */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-lg gap-1 shadow-sm">
                         <button onClick={() => setTargetOrientation('portrait')} className={`px-2 py-1 rounded text-[10px] font-bold ${targetOrientation === 'portrait' ? 'bg-primary-600 text-white' : 'text-slate-500'}`} title="Portrait">📄</button>
                         <button onClick={() => setTargetOrientation('landscape')} className={`px-2 py-1 rounded text-[10px] font-bold ${targetOrientation === 'landscape' ? 'bg-primary-600 text-white' : 'text-slate-500'}`} title="Landscape">📃</button>
                      </div>

                      {/* Zoom */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                         <button onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))} className="p-1 text-slate-500 hover:bg-slate-100 rounded"><ZoomOut className="w-3.5 h-3.5" /></button>
                         <span className="text-[10px] w-10 text-center font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
                         <button onClick={() => setZoomLevel(Math.min(2.0, zoomLevel + 0.1))} className="p-1 text-slate-500 hover:bg-slate-100 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                      </div>

                      <div className="ml-auto">
                        <button onClick={triggerWorkbenchAi} disabled={isAiTranslating || !workbenchJob.attachments?.length} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-sm">
                          <Sparkles className={`w-3.5 h-3.5 ${isAiTranslating ? 'animate-spin' : ''}`} /> {isAiTranslating ? t.generating : t.autoTranslate}
                        </button>
                      </div>
                  </div>
               </div>
               
               <div className="flex-1 relative overflow-auto bg-slate-200 p-8 flex justify-center items-start">
                 {isAiTranslating && (
                   <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
                      <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                        <p className="font-bold text-slate-800">Translating Document...</p>
                        <p className="text-xs text-slate-500 mt-1">Applying Sworn Translation Standards</p>
                      </div>
                   </div>
                 )}
                 <div className="origin-top transition-transform duration-200 ease-out" style={{ transform: `scale(${zoomLevel})` }}>
                   <div ref={editorRef} contentEditable suppressContentEditableWarning 
                      className={`editor-content bg-white text-slate-900 shadow-xl outline-none p-[20mm] ${targetOrientation === 'landscape' ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'}`} 
                      style={{ height: 'auto' }} 
                      dangerouslySetInnerHTML={{ __html: workbenchJob.translatedText || '<div class="text-slate-300 italic text-center mt-20">Click "Auto-Translate" to generate content...</div>' }} />
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{editingJob ? t.editJob : t.newTranslation}</h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition"><XIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.creationDate}</label><input required type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">{t.dueDateLabel}</label><input type="date" className={inputClass} value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
                <div className="col-span-2 md:col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.clientName}</label><input required list="client-list" type="text" placeholder="e.g., John Doe Corp" className={inputClass} value={formData.clientName || ''} onChange={handleClientSelect} /><datalist id="client-list">{uniqueClients.map(([name]) => (<option key={name} value={name} />))}</datalist></div>
                <div className="col-span-2 md:col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.clientInfo}</label><input type="text" placeholder="Address / Tax ID" className={inputClass} value={formData.clientInfo || ''} onChange={e => setFormData({...formData, clientInfo: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">{t.docType}</label><input required type="text" placeholder="e.g., Marriage Certificate" className={inputClass} value={formData.documentType || ''} onChange={e => setFormData({...formData, documentType: e.target.value})} /></div>
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.sourceLang}</label><select className={inputClass} value={formData.sourceLang} onChange={e => setFormData({...formData, sourceLang: e.target.value})}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.targetLang}</label><select className={inputClass} value={formData.targetLang} onChange={e => setFormData({...formData, targetLang: e.target.value})}>{Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                
                {/* Batch Upload Section */}
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-2">{t.batchUpload}</label>
                   <div className="flex flex-wrap gap-3 mb-2">
                      {formData.attachments && formData.attachments.map((src, idx) => (
                        <div key={idx} className="relative w-24 h-24 group">
                           <img src={src} alt="Attachment" className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm" />
                           <button type="button" onClick={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors bg-slate-50 hover:bg-primary-50">
                         <FolderOpen className="w-5 h-5" />
                         <span className="text-[10px] font-medium mt-1">{t.addPhoto}</span>
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                   </div>
                </div>

                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.pageCount}</label><input type="number" min="1" className={inputClass} value={formData.pageCount} onChange={e => setFormData({...formData, pageCount: parseInt(e.target.value)})} /></div>
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.totalPrice} (TND)</label><div className="relative"><span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">TND</span><input required type="number" min="0" step="0.001" className={`${inputClass} pl-10`} value={formData.priceTotal} onChange={e => setFormData({...formData, priceTotal: parseFloat(e.target.value)})} /></div></div>
                <div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">{t.status}</label><select className={inputClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TranslationStatus})}>{Object.values(TranslationStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">{t.remarks}</label><textarea className={`${inputClass} h-20`} value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})}></textarea></div>
                <input type="submit" className="hidden" />
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">{t.cancel}</button>
              <button onClick={(e) => handleSubmit(e as any)} className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg shadow-sm transition-colors text-sm font-medium">{editingJob ? t.updateJob : t.saveJob}</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Email Suggestion Modal */}
      <EmailSuggestionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailContent={aiEmailSuggestion}
      />
    </div>
  );
};

const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

export default TranslationManager;
