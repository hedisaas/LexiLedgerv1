
import React from 'react';
import { TranslationJob, Quote, BusinessProfile } from '../types';
import { Printer, Mail, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { saveAs } from 'file-saver';
import { sendQuoteEmail, sendInvoiceEmail, initEmailService } from '../services/emailService';

// Initialize EmailJS
initEmailService();

interface InvoiceViewProps {
  data: TranslationJob | Quote | null;
  type: 'invoice' | 'quote';
  profile: BusinessProfile;
  onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ data, type, profile, onClose }) => {
  if (!data) return null;

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailAddress, setEmailAddress] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const blob = await pdf(<InvoicePDF data={data} type={type} profile={profile} />).toBlob();
      saveAs(blob, `${type === 'quote' ? 'Devis' : 'Facture'}_${data.clientName}_${data.id.slice(0, 6)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Email Logic
  const handleEmailClick = () => {
    // Try to extract email from client info if possible, or just open empty
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailAddress) return;

    // Sanitize email: remove whitespace and trailing dots
    const cleanEmail = emailAddress.trim().replace(/\.$/, '');

    try {
      setIsSending(true);
      // Generate PDF Blob
      const blob = await pdf(<InvoicePDF data={data} type={type} profile={profile} />).toBlob();

      let result;
      if (type === 'quote') {
        result = await sendQuoteEmail(cleanEmail, data as Quote, profile, blob);
      } else {
        result = await sendInvoiceEmail(cleanEmail, data as TranslationJob, profile, blob);
      }

      if (result.success) {
        alert('Email sent successfully!');
        setIsEmailModalOpen(false);
      } else {
        alert('Failed to send email. Please check console.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email.');
    } finally {
      setIsSending(false);
    }
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
          <button onClick={handleEmailClick} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-all transform hover:scale-105">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGenerating ? 'Génération...' : 'Télécharger PDF'}
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

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-600" /> Send {type === 'quote' ? 'Quote' : 'Invoice'} via Email
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter the client's email address. The PDF will be generated and attached automatically.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
              <strong>Testing Mode:</strong> You can currently only send emails to <u>mycomerveille@gmail.com</u>.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client Email</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || !emailAddress}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;