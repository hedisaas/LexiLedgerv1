
import React, { useState, useRef } from 'react';
import { BusinessProfile, TranslationJob, Expense } from '../types';
import { Save, Upload, Building2, User, MapPin, FileText, Phone, Mail, CreditCard, FileSpreadsheet, Download } from 'lucide-react';
import { Lang, translations } from '../locales';

interface SettingsProps {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  jobs: TranslationJob[];
  expenses: Expense[];
  lang: Lang;
  userRole: 'admin' | 'secretary';
}

const Settings: React.FC<SettingsProps> = ({ profile, onSave, jobs, expenses, lang, userRole }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert("Settings saved successfully!");
  };

  const exportToCSV = (type: 'invoices' | 'expenses') => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Excel

    if (type === 'invoices') {
      csvContent += "Date,Reference,Client,Document,Total HT,TVA (19%),Total TTC,Status\n";
      jobs.forEach(job => {
        const tva = job.priceTotal * 0.19;
        const total = job.priceTotal + tva + 1.000; // + Stamp
        const ref = `FAC-${job.id.slice(0, 6).toUpperCase()}`;
        csvContent += `"${job.date}","${ref}","${job.clientName}","${job.documentType}","${job.priceTotal.toFixed(3)}","${tva.toFixed(3)}","${total.toFixed(3)}","${job.status}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "lexiledger_invoices.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      csvContent += "Date,Description,Category,Amount (TND)\n";
      expenses.forEach(exp => {
        csvContent += `"${exp.date}","${exp.description}","${exp.category}","${exp.amount.toFixed(3)}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "lexiledger_expenses.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const inputClass = "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-400 pl-10";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const iconClass = "absolute left-3 top-2.5 text-slate-400 w-4 h-4";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">{t.profileSettings}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.profileDesc}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Logo Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <span className="text-white text-xs font-medium">{t.uploadLogo}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Company Logo</h3>
                <p className="text-xs text-slate-500 mb-2">Displayed on top of your invoices.</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary-600 text-sm font-medium hover:underline">{t.uploadLogo}</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t.businessName}</label>
                <div className="relative">
                  <Building2 className={iconClass} />
                  <input type="text" className={inputClass} value={formData.businessName} onChange={e => handleChange('businessName', e.target.value)} placeholder="e.g. LexiLedger Translations" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.translatorName}</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input type="text" className={inputClass} value={formData.translatorName} onChange={e => handleChange('translatorName', e.target.value)} placeholder="e.g. Ahmed Ben Ali" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t.address}</label>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input type="text" className={inputClass} value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="e.g. 123 Avenue Habib Bourguiba, Tunis" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.taxId}</label>
                <div className="relative">
                  <FileText className={iconClass} />
                  <input type="text" className={inputClass} value={formData.taxId} onChange={e => handleChange('taxId', e.target.value)} placeholder="e.g. 1234567/X/A/M/000" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.rib}</label>
                <div className="relative">
                  <CreditCard className={iconClass} />
                  <input type="text" className={inputClass} value={formData.rib} onChange={e => handleChange('rib', e.target.value)} placeholder="TN59 ..." />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.phone}</label>
                <div className="relative">
                  <Phone className={iconClass} />
                  <input type="text" className={inputClass} value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+216 71 000 000" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.email}</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input type="email" className={inputClass} value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="contact@example.com" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
                <Save className="w-4 h-4" /> {t.saveSettings}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Accountant Export - Admin Only */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> {t.accountingExport}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.exportDesc}</p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            <button onClick={() => exportToCSV('invoices')} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4 text-emerald-600" /> {t.exportInvoices}
            </button>
            <button onClick={() => exportToCSV('expenses')} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4 text-rose-600" /> {t.exportExpenses}
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default Settings;
