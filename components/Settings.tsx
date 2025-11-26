
import React, { useState, useRef } from 'react';
import { BusinessProfile, TranslationJob, Expense } from '../types';
import { Save, Upload, Building2, User, MapPin, FileText, Phone, Mail, CreditCard, FileSpreadsheet, Download, UserCog, Plus, Trash2, Edit, Check, X, Eye, EyeOff } from 'lucide-react';
import { useSecretaries } from '../hooks/useSecretaries';
import { Secretary, SecretaryPermissions } from '../types';
import { Lang, translations } from '../locales';

interface SettingsProps {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  jobs: TranslationJob[];
  expenses: Expense[];
  lang: Lang;
  userRole: string;
  user?: any; // Add user prop
}

const Settings: React.FC<SettingsProps> = ({ profile, onSave, jobs, expenses, lang, userRole, user }) => {
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
        <>
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

          <SecretaryManagement user={user} />
        </>
      )}


    </div>
  );
};

// --- Secretary Management Component ---
const SecretaryManagement = ({ user }: { user: any }) => {
  const { secretaries, loading, addSecretary, updateSecretary, deleteSecretary } = useSecretaries(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Secretary>>({
    name: '',
    email: '',
    password: '',
    permissions: {
      canViewDashboard: true,
      canManageTranslations: false,
      canManageClients: false,
      canManageQuotes: false,
      canManageExpenses: false,
      canViewSettings: false
    }
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenModal = (secretary?: Secretary) => {
    if (secretary) {
      setEditingId(secretary.id);
      setFormData({ ...secretary, password: '' }); // Don't show existing password
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        permissions: {
          canViewDashboard: true,
          canManageTranslations: false,
          canManageClients: false,
          canManageQuotes: false,
          canManageExpenses: false,
          canViewSettings: false
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    if (editingId) {
      const updates: any = { ...formData };
      if (!updates.password) delete updates.password; // Don't update password if empty
      await updateSecretary(editingId, updates);
    } else {
      if (!formData.password) {
        alert("Password is required for new accounts");
        return;
      }
      await addSecretary(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this secretary account?")) {
      await deleteSecretary(id);
    }
  };

  const togglePermission = (key: keyof SecretaryPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        [key]: !prev.permissions![key]
      }
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><UserCog className="w-5 h-5 text-primary-600" /> Secretary Accounts</h2>
          <p className="text-sm text-slate-500 mt-1">Manage access for your administrative staff.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Secretary
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading accounts...</div>
        ) : secretaries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No secretary accounts found. Create one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {secretaries.map(sec => (
              <div key={sec.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {sec.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{sec.name}</div>
                    <div className="text-sm text-slate-500">{sec.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(sec)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sec.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Secretary' : 'New Secretary'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="secretary@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>
                <div className="space-y-3">
                  {[
                    { key: 'canViewDashboard', label: 'View Dashboard' },
                    { key: 'canManageTranslations', label: 'Manage Translations' },
                    { key: 'canManageClients', label: 'Manage Clients' },
                    { key: 'canManageQuotes', label: 'Manage Quotes' },
                    { key: 'canManageExpenses', label: 'Manage Expenses' },
                    { key: 'canViewSettings', label: 'View Settings' },
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions![perm.key as keyof SecretaryPermissions] ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {formData.permissions![perm.key as keyof SecretaryPermissions] && <Check className="w-3 h-3" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.permissions![perm.key as keyof SecretaryPermissions]}
                        onChange={() => togglePermission(perm.key as keyof SecretaryPermissions)}
                      />
                      <span className="text-sm text-slate-700 font-medium">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
