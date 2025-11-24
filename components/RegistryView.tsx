
import React from 'react';
import { TranslationJob, TranslationStatus } from '../types';
import { X, Printer } from 'lucide-react';

interface RegistryViewProps {
  jobs: TranslationJob[];
  onClose: () => void;
}

const RegistryView: React.FC<RegistryViewProps> = ({ jobs, onClose }) => {
  // Filter only completed jobs and sort by date
  const registryJobs = jobs
    .filter(j => j.status === TranslationStatus.COMPLETED || j.status === TranslationStatus.PAID)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm overflow-y-auto print:bg-white print:static print:overflow-visible">
       {/* Header Controls */}
       <div className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-between items-center bg-white/90 backdrop-blur shadow-sm print:hidden">
          <h2 className="text-lg font-bold text-slate-800">Official Registry Preview</h2>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"><Printer className="w-4 h-4" /> Print Registry</button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
       </div>

       {/* Printable Content */}
       <div className="min-h-screen p-8 pt-24 print:p-0 bg-slate-50 flex justify-center">
         <div id="printable-registry" className="bg-white w-full max-w-[297mm] min-h-[210mm] shadow-xl p-10 print:shadow-none print:w-full landscape-print">
            <style>{`
              @media print {
                @page { size: landscape; margin: 10mm; }
                .landscape-print { width: 100% !important; max-width: none !important; box-shadow: none !important; margin: 0 !important; }
                body { -webkit-print-color-adjust: exact; }
              }
            `}</style>

            <div className="text-center mb-8 border-b-2 border-black pb-4">
               <h1 className="text-2xl font-bold uppercase font-serif tracking-widest mb-2">Répertoire Chronologique des Traductions</h1>
               <p className="text-sm font-serif italic">Conformément à la réglementation en vigueur pour les traducteurs assermentés.</p>
            </div>

            <table className="w-full text-sm text-left border-collapse border border-black font-serif">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="border border-black px-2 py-2 text-center w-16">N° Ordre</th>
                   <th className="border border-black px-2 py-2 text-center w-24">Date</th>
                   <th className="border border-black px-2 py-2 w-64">Nom et Prénom du Client</th>
                   <th className="border border-black px-2 py-2">Nature du Document</th>
                   <th className="border border-black px-2 py-2 text-center w-32">Langues</th>
                   <th className="border border-black px-2 py-2 text-center w-20">Nbre Pages</th>
                   <th className="border border-black px-2 py-2 text-right w-32">Montant (TND)</th>
                   <th className="border border-black px-2 py-2 text-center w-40">Observations</th>
                 </tr>
               </thead>
               <tbody>
                 {registryJobs.map((job, index) => (
                   <tr key={job.id}>
                     <td className="border border-black px-2 py-2 text-center font-bold">{new Date(job.date).getFullYear()}-{String(index + 1).padStart(3, '0')}</td>
                     <td className="border border-black px-2 py-2 text-center">{job.date}</td>
                     <td className="border border-black px-2 py-2 font-medium">{job.clientName}</td>
                     <td className="border border-black px-2 py-2">{job.documentType}</td>
                     <td className="border border-black px-2 py-2 text-center text-xs">{job.sourceLang.toString().substring(0,2).toUpperCase()} &rarr; {job.targetLang.toString().substring(0,2).toUpperCase()}</td>
                     <td className="border border-black px-2 py-2 text-center">{job.pageCount}</td>
                     <td className="border border-black px-2 py-2 text-right font-mono">{job.priceTotal.toFixed(3)}</td>
                     <td className="border border-black px-2 py-2 text-xs italic">{job.remarks}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
            
            <div className="mt-8 text-center text-xs text-gray-500 italic">
               Arrêté le présent répertoire à la date du {new Date().toLocaleDateString()} contenant {registryJobs.length} articles.
            </div>
         </div>
       </div>
    </div>
  );
};

export default RegistryView;
