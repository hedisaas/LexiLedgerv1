
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

  // Function to open a clean print window
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Répertoire Chronologique - LexiLedger</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');
            @page { size: landscape; margin: 15mm; }
            body { 
              font-family: 'Merriweather', serif; 
              font-size: 12px; 
              margin: 0; 
              padding: 20px; 
              color: #000;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; }
            .subtitle { font-style: italic; font-size: 14px; color: #444; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
            
            /* Column Widths */
            .col-id { width: 80px; text-align: center; font-weight: bold; }
            .col-date { width: 100px; text-align: center; }
            .col-client { width: 25%; font-weight: bold; }
            .col-type { width: 20%; }
            .col-lang { width: 80px; text-align: center; font-size: 11px; }
            .col-pages { width: 60px; text-align: center; }
            .col-amount { width: 100px; text-align: right; font-family: monospace; font-size: 13px; }
            .col-obs { font-style: italic; font-size: 11px; }

            th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
            tr { page-break-inside: avoid; }
            
            .footer { margin-top: 30px; text-align: center; font-size: 11px; font-style: italic; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            
            /* Hide URL printing in some browsers */
            @media print {
               a[href]:after { content: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Répertoire Chronologique des Traductions</h1>
            <div class="subtitle">Conformément à la réglementation en vigueur pour les traducteurs assermentés.</div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="col-id">N° Ordre</th>
                <th class="col-date">Date</th>
                <th class="col-client">Nom et Prénom du Client</th>
                <th class="col-type">Nature du Document</th>
                <th class="col-lang">Langues</th>
                <th class="col-pages">Pages</th>
                <th class="col-amount">Montant (TND)</th>
                <th class="col-obs">Observations</th>
              </tr>
            </thead>
            <tbody>
              ${registryJobs.map((job, index) => `
                <tr>
                  <td class="col-id">${new Date(job.date).getFullYear()}-${String(index + 1).padStart(3, '0')}</td>
                  <td class="col-date">${job.date}</td>
                  <td class="col-client">${job.clientName}</td>
                  <td class="col-type">${job.documentType}</td>
                  <td class="col-lang">${job.sourceLang.toString().substring(0, 2).toUpperCase()} → ${job.targetLang.toString().substring(0, 2).toUpperCase()}</td>
                  <td class="col-pages">${job.pageCount}</td>
                  <td class="col-amount">${job.priceTotal.toFixed(3)}</td>
                  <td class="col-obs">${job.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Arrêté le présent répertoire à la date du ${new Date().toLocaleDateString()} contenant ${registryJobs.length} articles.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-between items-center bg-white/90 backdrop-blur shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Official Registry Preview</h2>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"><Printer className="w-4 h-4" /> Print / Save PDF</button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
      </div>

      {/* Screen Preview Content (Visual only, no print styles needed here anymore) */}
      <div className="min-h-screen p-8 pt-24 bg-slate-50 flex justify-center">
        <div className="bg-white w-full max-w-[297mm] min-h-[210mm] shadow-xl p-10">

          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase font-serif tracking-widest mb-2">Répertoire Chronologique des Traductions</h1>
            <p className="text-sm font-serif italic">Conformément à la réglementation en vigueur pour les traducteurs assermentés.</p>
          </div>

          <table className="w-full text-sm text-left border-collapse border border-black font-serif">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-2 text-center w-24">N° Ordre</th>
                <th className="border border-black px-2 py-2 text-center w-28">Date</th>
                <th className="border border-black px-2 py-2 w-64">Nom du Client</th>
                <th className="border border-black px-2 py-2">Nature du Document</th>
                <th className="border border-black px-2 py-2 text-center w-24">Langues</th>
                <th className="border border-black px-2 py-2 text-center w-20">Pages</th>
                <th className="border border-black px-2 py-2 text-right w-32">Montant</th>
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
                  <td className="border border-black px-2 py-2 text-center text-xs">{job.sourceLang.toString().substring(0, 2).toUpperCase()} &rarr; {job.targetLang.toString().substring(0, 2).toUpperCase()}</td>
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

