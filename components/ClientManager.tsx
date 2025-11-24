
import React, { useMemo, useState } from 'react';
import { TranslationJob, TranslationStatus } from '../types';
import { Lang, translations } from '../locales';
import { Users, Search, FileText, DollarSign, Clock, ChevronRight, MessageCircle } from 'lucide-react';

interface ClientManagerProps {
  jobs: TranslationJob[];
  lang: Lang;
}

interface ClientStats {
  name: string;
  info: string;
  totalSpent: number;
  jobCount: number;
  lastJobDate: string;
  history: TranslationJob[];
}

const ClientManager: React.FC<ClientManagerProps> = ({ jobs, lang }) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientStats | null>(null);

  // Aggregate jobs by client
  const clients = useMemo(() => {
    const clientMap = new Map<string, ClientStats>();

    jobs.forEach(job => {
      const name = job.clientName;
      if (!clientMap.has(name)) {
        clientMap.set(name, {
          name,
          info: job.clientInfo,
          totalSpent: 0,
          jobCount: 0,
          lastJobDate: job.date,
          history: []
        });
      }
      const client = clientMap.get(name)!;
      client.totalSpent += job.priceTotal;
      client.jobCount += 1;
      client.history.push(job);
      if (new Date(job.date) > new Date(client.lastJobDate)) {
        client.lastJobDate = job.date;
      }
      // Update info if latest job has more details
      if (job.clientInfo && job.clientInfo.length > client.info.length) {
         client.info = job.clientInfo;
      }
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [jobs]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // WhatsApp Helper (Mock)
  const openWhatsApp = (name: string) => {
    window.open(`https://wa.me/?text=Hello ${name}, regarding your translation...`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Client List */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] lg:h-auto">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary-600" /> {t.clientList}
          </h2>
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder={t.searchPlaceholder} 
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredClients.length > 0 ? filteredClients.map(client => (
            <button 
              key={client.name}
              onClick={() => setSelectedClient(client)}
              className={`w-full text-left p-3 rounded-lg transition-all border ${selectedClient?.name === client.name ? 'bg-primary-50 border-primary-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold text-sm ${selectedClient?.name === client.name ? 'text-primary-900' : 'text-slate-700'}`}>{client.name}</span>
                <span className="text-xs font-mono font-semibold text-slate-400">{client.totalSpent.toFixed(0)} TND</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-xs text-slate-400">{client.jobCount} {t.jobsCount}</span>
                 <span className="text-[10px] text-slate-300">{client.lastJobDate}</span>
              </div>
            </button>
          )) : (
            <div className="text-center py-8 text-slate-400 text-sm">{t.noClients}</div>
          )}
        </div>
      </div>

      {/* Client Details */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] lg:h-auto">
        {selectedClient ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
               <div className="flex items-start justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
                   <p className="text-slate-500 text-sm mt-1 flex items-center gap-1"><FileText className="w-3 h-3" /> {selectedClient.info || "No details"}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm text-slate-400 uppercase font-bold">{t.totalSpent}</p>
                    <p className="text-2xl font-mono font-bold text-primary-600">{selectedClient.totalSpent.toFixed(3)} <span className="text-sm">TND</span></p>
                    <button onClick={() => openWhatsApp(selectedClient.name)} className="mt-2 text-xs flex items-center gap-1 text-emerald-600 hover:underline font-medium justify-end">
                      <MessageCircle className="w-3 h-3" /> {t.contactWhatsapp}
                    </button>
                 </div>
               </div>
            </div>
            
            <div className="p-4 bg-white border-b border-slate-100">
               <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4" /> {t.clientHistory}</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                   <tr>
                     <th className="px-6 py-3 font-medium">Date</th>
                     <th className="px-6 py-3 font-medium">Document</th>
                     <th className="px-6 py-3 font-medium text-center">Status</th>
                     <th className="px-6 py-3 font-medium text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {selectedClient.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(job => (
                     <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-600">{job.date}</td>
                        <td className="px-6 py-3 text-slate-800 font-medium">{job.documentType}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.status === TranslationStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{job.status}</span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono">{job.priceTotal.toFixed(3)}</td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <Users className="w-16 h-16 mb-4 opacity-20" />
             <p>Select a client to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManager;
