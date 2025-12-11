import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TranslationJob, Expense } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

interface AnalyticsProps {
    jobs: TranslationJob[];
    expenses: Expense[];
    lang: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics: React.FC<AnalyticsProps> = ({ jobs, expenses, lang }) => {
    // 1. Monthly Revenue vs Expenses
    const monthlyData = useMemo(() => {
        const data = new Map<string, { name: string, revenue: number, expense: number }>();

        // Process Jobs
        jobs.forEach(job => {
            const date = new Date(job.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!data.has(key)) data.set(key, { name: key, revenue: 0, expense: 0 });
            data.get(key)!.revenue += job.priceTotal;
        });

        // Process Expenses
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!data.has(key)) data.set(key, { name: key, revenue: 0, expense: 0 });
            data.get(key)!.expense += exp.amount;
        });

        return Array.from(data.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [jobs, expenses]);

    // 2. Top Clients
    const topClients = useMemo(() => {
        const clients = new Map<string, number>();
        jobs.forEach(job => {
            clients.set(job.clientName, (clients.get(job.clientName) || 0) + job.priceTotal);
        });
        return Array.from(clients.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [jobs]);

    // 3. Status Distribution
    const statusData = useMemo(() => {
        const statuses = new Map<string, number>();
        jobs.forEach(job => {
            statuses.set(job.status, (statuses.get(job.status) || 0) + 1);
        });
        return Array.from(statuses.entries()).map(([name, value]) => ({ name, value }));
    }, [jobs]);

    // Totals
    const totalRevenue = jobs.reduce((sum, j) => sum + j.priceTotal, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalRevenue - totalExpenses;

    return (
        <div className="space-y-6 p-6 bg-slate-50 min-h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Advanced Analytics</h2>
                <div className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
                        <div className="p-2 bg-emerald-100 rounded-full"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalRevenue.toFixed(2)} <span className="text-sm text-slate-400">TND</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
                        <div className="p-2 bg-rose-100 rounded-full"><TrendingDown className="w-5 h-5 text-rose-600" /></div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalExpenses.toFixed(2)} <span className="text-sm text-slate-400">TND</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Net Profit</h3>
                        <div className="p-2 bg-blue-100 rounded-full"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                    </div>
                    <p className={`text-3xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{profit.toFixed(2)} <span className="text-sm text-slate-400">TND</span></p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue vs Expenses</h3>
                    <div className="h-80" style={{ width: '100%', minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                                <YAxis fontSize={12} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Job Status Distribution</h3>
                    <div className="h-80" style={{ width: '100%', minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Clients Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Top Clients by Revenue</h3>
                    <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Rank</th>
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {topClients.map((client, index) => (
                                <tr key={client.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{client.value.toFixed(2)} TND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
