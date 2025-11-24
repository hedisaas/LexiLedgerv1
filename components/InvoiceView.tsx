
import React from 'react';
import { TranslationJob, Quote, BusinessProfile } from '../types';
import { Printer, Mail } from 'lucide-react';

interface InvoiceViewProps {
  data: TranslationJob | Quote | null;
  type: 'invoice' | 'quote';
  profile: BusinessProfile;
  onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ data, type, profile, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  // Email Logic
  const handleEmail = () => {
    const subject = `${type === 'quote' ? 'Devis' : 'Facture'} - ${data.id}`;
    const body = `Cher client,\n\nVeuillez trouver ci-joint le document ${data.id}.\n\nCordialement,\n${profile.translatorName}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // TVA Logic (Tunisia 19%)
  // data.priceTotal is HT (Hors Taxe)
  const montantHT = data.priceTotal;
  const tvaRate = 0.19;
  const montantTVA = montantHT * tvaRate;
  const timbreFiscal = type === 'invoice' ? 1.000 : 0; // Stamp only on Invoice
  const totalTTC = montantHT + montantTVA + timbreFiscal;

  const isQuote = type === 'quote';
  const title = isQuote ? 'DEVIS' : 'FACTURE';
  const refPrefix = isQuote ? 'DEV' : 'FAC';
  const dateLabel = isQuote ? "Date d'émission" : "Date de facturation";
  
  // Quote specific validity
  const quoteData = isQuote ? (data as Quote) : null;

  // QR Code Data (Mock URL verification)
  const qrData = encodeURIComponent(`https://lexiledger-verify.com/doc/${data.id}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm overflow-y-auto print:bg-white print:overflow-visible print:static print:h-auto print:w-auto">
      
      {/* Controls - Fixed Header (Always Visible) */}
      <div className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-end gap-3 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none print:hidden">
        <div className="pointer-events-auto flex gap-3">
          <button onClick={handleEmail} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-all transform hover:scale-105">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-all transform hover:scale-105">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button onClick={onClose} className="bg-white text-slate-800 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-slate-100 transition-all transform hover:scale-105">
            Fermer
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="min-h-full flex justify-center items-start p-4 pt-24 pb-20 print:p-0 print:block">
        
        {/* Paper Container */}
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:min-h-0">
          
          {/* Actual Document Content (Targeted by @media print) */}
          <div id="printable-invoice" className="p-12 flex flex-col min-h-[297mm] text-slate-800 font-serif bg-white">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase mb-2">{title}</h1>
                <p className="text-sm text-slate-600 font-sans">Traduction Assermentée</p>
              </div>
              <div className="text-right font-sans text-sm">
                {profile.logo && <img src={profile.logo} alt="Logo" className="h-16 mb-2 ml-auto object-contain" />}
                <h2 className="text-xl font-bold mb-1 text-slate-900">{profile.businessName || "LexiLedger Translations"}</h2>
                <p className="font-semibold text-slate-700 mb-1">{profile.translatorName}</p>
                <p className="text-slate-500">{profile.address || "Adresse non spécifiée"}</p>
                <p className="text-slate-500">MF: {profile.taxId || "N/A"}</p>
                <p className="text-slate-500">{profile.phone}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex justify-between mb-12 font-sans">
              <div className="w-1/2">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Client:</h3>
                <p className="text-lg font-semibold text-slate-900">{data.clientName}</p>
                <p className="text-slate-600 whitespace-pre-wrap">{data.clientInfo}</p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-4">Réf {isQuote ? 'Devis' : 'Facture'}:</span>
                  <span className="font-mono font-medium">{refPrefix}-{data.id.slice(0, 6).toUpperCase()}</span>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-4">{dateLabel}:</span>
                  <span>{data.date}</span>
                </div>
                {isQuote && quoteData?.validUntil && (
                  <div>
                     <span className="text-xs font-bold text-slate-400 uppercase mr-4">Valide jusqu'au:</span>
                     <span className="text-rose-600 font-medium">{quoteData.validUntil}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1">
              <table className="w-full mb-8 font-sans text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-1/2">Désignation</th>
                    <th className="px-4 py-3 text-center">Qté (Pages)</th>
                    <th className="px-4 py-3 text-right">Prix Unit. HT</th>
                    <th className="px-4 py-3 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{data.documentType}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Langues: {data.sourceLang} vers {data.targetLang}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">{data.pageCount}</td>
                    <td className="px-4 py-4 text-right font-mono">
                      {(data.priceTotal / (data.pageCount || 1)).toFixed(3)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold font-mono">
                      {data.priceTotal.toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Totals */}
            <div>
              <div className="flex justify-end border-t border-slate-200 pt-4 mb-8">
                <div className="w-72 font-sans text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-600">Total HT</span>
                    <span className="font-mono">{montantHT.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-medium text-slate-600">TVA (19%)</span>
                    <span className="font-mono">{montantTVA.toFixed(3)} TND</span>
                  </div>
                  {!isQuote && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-600">Timbre Fiscal</span>
                      <span className="font-mono">{timbreFiscal.toFixed(3)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-4 mt-2 bg-slate-50 px-2 rounded">
                    <span className="text-lg font-bold text-slate-900">Total TTC</span>
                    <span className="text-lg font-bold font-mono text-primary-700">{totalTTC.toFixed(3)} TND</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t-2 border-slate-100 pt-6">
                {/* QR Code Section */}
                <div className="flex items-center gap-4">
                   <img src={qrUrl} alt="QR Verify" className="w-20 h-20 border border-slate-200 p-1" />
                   <div className="text-[10px] text-slate-400 font-sans">
                      <p className="uppercase font-bold">Scan to Verify</p>
                      <p>Document ID: {data.id.slice(0, 8)}</p>
                      <p>Digital Signature Valid</p>
                   </div>
                </div>

                <div className="text-center font-sans">
                  {profile.rib && <p className="text-sm text-slate-600 mb-1">RIB: {profile.rib}</p>}
                  <p className="font-medium text-slate-900">{isQuote ? "Devis valable 30 jours." : "Merci de votre confiance."}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;