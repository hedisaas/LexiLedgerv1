
import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Lang, translations } from '../locales';

interface ExpenseManagerProps {
  expenses: Expense[];
  onAddExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
  lang: Lang;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, onAddExpense, onDeleteExpense, lang }) => {
  const t = translations[lang];
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.OTHER,
    amount: 0,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    onAddExpense({
      id: crypto.randomUUID(),
      date: newExpense.date!,
      category: newExpense.category!,
      description: newExpense.description!,
      amount: parseFloat(newExpense.amount.toString())
    });

    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: ExpenseCategory.OTHER,
      amount: 0,
      description: ''
    });
  };

  const inputClass = "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-400";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Add Expense Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-600" /> {t.addExpense}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.date}</label>
            <input type="date" required className={inputClass}
              value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.category}</label>
            <select className={inputClass}
              value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}>
              {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.description}</label>
            <input type="text" required placeholder="Rent, Paper, Ink..." className={inputClass}
              value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.amount} (TND)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">TND</span>
              <input type="number" required min="0" step="0.001" className={`${inputClass} pl-10`}
                value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })} />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-slate-900/10">
            {t.recordExpense}
          </button>
        </form>
      </div>

      {/* Expense List */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-700">{t.recentExpenses}</h3>
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">{t.date}</th>
                <th className="px-4 py-3 font-medium">{t.description}</th>
                <th className="px-4 py-3 font-medium">{t.category}</th>
                <th className="px-4 py-3 font-medium text-right">{t.amount}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3 text-slate-600">{exp.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{exp.description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                      <Tag className="w-3 h-3" /> {exp.category.split('(')[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600">{exp.amount.toFixed(3)} TND</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDeleteExpense(exp.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">{t.noExpenses}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
