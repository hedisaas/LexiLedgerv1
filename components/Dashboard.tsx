
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TranslationJob, Expense, TranslationStatus } from '../types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar, Clock, Filter, FileText, Lock } from 'lucide-react';
import { Lang, translations } from '../locales';

interface DashboardProps {
  jobs: TranslationJob[];
  expenses: Expense[];
  lang: Lang;
  userRole: 'admin' | 'secretary';
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ jobs, expenses, lang, userRole }) => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const t = translations[lang];

  // Helper: Get cutoff date based on range
  const getCutoffDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    if (dateRange === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (dateRange === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (dateRange === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return new Date(0); // All time
  };

  // 1. Filter Data based on Range
  const { filteredJobs, filteredExpenses } = useMemo(() => {
    const cutoff = getCutoffDate();
    return {
      filteredJobs: jobs.filter(j => new Date(j.date) >= cutoff),
      filteredExpenses: expenses.filter(e => new Date(e.date) >= cutoff)
    };
  }, [jobs, expenses, dateRange]);

  // 2. Calculate Aggregate Stats
  const stats = useMemo(() => {
    // Revenue = only COMPLETED + PAID jobs
    const totalRevenue = filteredJobs
      .filter(j => j.status === TranslationStatus.COMPLETED || j.status === TranslationStatus.PAID)
      .reduce((acc, job) => acc + job.priceTotal, 0);

    const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Pending = only PENDING jobs (not yet completed)
    const pendingPayments = filteredJobs
      .filter(j => j.status === TranslationStatus.PENDING)
      .reduce((acc, j) => acc + j.priceTotal, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // UPDATED LOGIC: Capture ALL jobs due in the next 7 days, plus overdue
    const upcomingDeadlines = jobs.filter(j => {
      if (!j.dueDate || j.status === TranslationStatus.COMPLETED || j.status === TranslationStatus.PAID) return false;
      const due = new Date(j.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 3600 * 24));
      // Show overdue (negative days) AND anything due within next 7 days
      return days <= 7;
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    return { totalRevenue, totalExpenses, netProfit, pendingPayments, upcomingDeadlines };
  }, [filteredJobs, filteredExpenses, jobs]);

  // 3. Prepare Continuous Daily Chart Data
  const chartData = useMemo(() => {
    if (userRole !== 'admin') return [];

    const dataMap = new Map<string, { date: string, revenue: number, expenses: number }>();

    // Generate all dates in range
    const start = getCutoffDate();
    const end = new Date();
    end.setHours(23, 59, 59, 999); // Include all of today

    let loopStart = start;
    if (dateRange === 'all') {
      const firstJob = jobs.length > 0 ? new Date(Math.min(...jobs.map(j => new Date(j.date).getTime()))) : new Date();
      const firstExp = expenses.length > 0 ? new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))) : new Date();
      loopStart = firstJob < firstExp ? firstJob : firstExp;
      loopStart.setHours(0, 0, 0, 0);
    }

    // Ensure loopStart is valid
    if (isNaN(loopStart.getTime())) loopStart = new Date();

    for (let d = new Date(loopStart); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dataMap.set(key, { date: key, revenue: 0, expenses: 0 });
    }


    filteredJobs
      .filter(job => job.status === TranslationStatus.COMPLETED || job.status === TranslationStatus.PAID)
      .forEach(job => {
        const key = new Date(job.date).toISOString().split('T')[0];
        if (dataMap.has(key)) {
          dataMap.get(key)!.revenue += job.priceTotal;
        }
      });

    filteredExpenses.forEach(exp => {
      const key = new Date(exp.date).toISOString().split('T')[0];
      if (dataMap.has(key)) {
        dataMap.get(key)!.expenses += exp.amount;
      }
    });

    const formatLabel = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
    };

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({ ...item, label: formatLabel(item.date) }));
  }, [filteredJobs, filteredExpenses, dateRange, jobs, expenses, lang, userRole]);

  // 4. Calculate Monthly Tax Breakdown with Net Profit
  const taxData = useMemo(() => {
    if (userRole !== 'admin') return [];

    const months = new Map<string, { month: string, baseHT: number, expenses: number, count: number }>();

    // Process Revenue
    jobs.forEach(job => {
      const date = new Date(job.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

      if (!months.has(key)) {
        months.set(key, { month: label, baseHT: 0, expenses: 0, count: 0 });
      }
      const m = months.get(key)!;
      m.baseHT += job.priceTotal;
      m.count += 1;
    });

    // Process Expenses
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

      if (!months.has(key)) {
        months.set(key, { month: label, baseHT: 0, expenses: 0, count: 0 });
      }
      const m = months.get(key)!;
      m.expenses += exp.amount;
    });

    const keys = Array.from(months.keys()).sort().reverse(); // Descending date
    return keys.map(k => months.get(k)!).slice(0, 12);

  }, [jobs, expenses, lang, userRole]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  const getDateLabel = (r: DateRange) => {
    switch (r) {
      case '7d': return t.last7;
      case '30d': return t.last30;
      case '90d': return t.last90;
      case 'all': return t.allTimeBtn;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-2 font-bold text-slate-700 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          {t.overview}
          {userRole === 'secretary' && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md ml-2">Restricted View</span>}
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {(['7d', '30d', '90d', 'all'] as DateRange[]).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {getDateLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - Only for Admin */}
      {userRole === 'admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.revenue}
            value={`${stats.totalRevenue.toFixed(3)} TND`}
            icon={TrendingUp}
            color="bg-emerald-500 text-emerald-500"
            subtext={dateRange === 'all' ? t.allTime : t.selectedPeriod}
          />
          <StatCard
            title={t.totalExpenses}
            value={`${stats.totalExpenses.toFixed(3)} TND`}
            icon={TrendingDown}
            color="bg-rose-500 text-rose-500"
            subtext={t.fixedVariable}
          />
          <StatCard
            title={t.netProfit}
            value={`${stats.netProfit.toFixed(3)} TND`}
            icon={DollarSign}
            color="bg-blue-500 text-blue-500"
            subtext={`${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}% ${t.margin}`}
          />
          <StatCard
            title={t.pending}
            value={`${stats.pendingPayments.toFixed(3)} TND`}
            icon={Clock}
            color="bg-amber-500 text-amber-500"
            subtext={t.unpaidJobs}
          />
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4 text-blue-800">
          <Lock className="w-5 h-5" />
          <p className="text-sm font-medium">Financial data hidden in Secretary Mode.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line Chart - Admin Only */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">{t.financialTrends}</h3>
            {userRole === 'admin' ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500"></div> {t.revenue}</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> {t.totalExpenses}</span>
              </div>
            ) : null}
          </div>

          {userRole === 'admin' ? (
            <div className="h-80 w-full" style={{ minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickMargin={10}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}
                    formatter={(value: number) => [`${value.toFixed(3)} TND`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    name={t.revenue}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExp)"
                    name={t.totalExpenses}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Lock className="w-10 h-10 mb-2 opacity-20" />
              <p>Charts available for Admin only.</p>
            </div>
          )}
        </div>

        {/* Right Column: Action Items & Deadlines - Available to Both */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" /> {t.priorityActions}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[300px]">
            {stats.upcomingDeadlines.length > 0 ? (
              stats.upcomingDeadlines.map(job => {
                const due = new Date(job.dueDate!);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const dueDay = new Date(due);
                dueDay.setHours(0, 0, 0, 0);
                const diff = Math.ceil((dueDay.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isOverdue = diff < 0;

                return (
                  <div key={job.id} className={`p-4 rounded-xl border-l-4 shadow-sm transition-transform hover:scale-[1.02] ${isOverdue ? 'border-rose-500 bg-rose-50' : 'border-amber-400 bg-amber-50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm truncate">{job.clientName}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isOverdue ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'}`}>
                        {isOverdue ? t.overdue : `${diff} ${t.daysLeft}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">{job.documentType}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.dueDate}</p>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 font-medium">{t.noDeadlines}</p>
                <p className="text-slate-400 text-xs mt-1">{t.caughtUp}</p>
              </div>
            )}

            {/* Collections Summary - Admin Only */}
            {userRole === 'admin' && stats.pendingPayments > 0 && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-600 uppercase font-bold mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> {t.collections}</p>
                <p className="text-sm text-indigo-900">
                  <span className="font-bold">{stats.pendingPayments.toFixed(3)} TND</span> {t.pendingCollection}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Tax & VAT Table - Admin Only */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" /> {t.taxReport}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">{t.month}</th>
                  <th className="px-6 py-4 text-right">{t.baseHT}</th>
                  <th className="px-6 py-4 text-right text-rose-600">{t.collectedVAT}</th>
                  <th className="px-6 py-4 text-right text-blue-600">{t.stamps}</th>
                  <th className="px-6 py-4 text-right font-bold text-emerald-600 bg-emerald-50">{t.netProfit}</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-900">{t.totalTTC}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {taxData.map((row, i) => {
                  const tva = row.baseHT * 0.19;
                  const stamps = row.count * 1.000;
                  const netProfit = row.baseHT - row.expenses;
                  const total = row.baseHT + tva + stamps;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800 capitalize">{row.month}</td>
                      <td className="px-6 py-4 text-right font-mono">{row.baseHT.toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-mono text-rose-600">{tva.toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-mono text-blue-600">{stamps.toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 bg-emerald-50/50">{netProfit.toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-bold font-mono">{total.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
