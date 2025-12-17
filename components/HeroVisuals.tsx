import React from 'react';
import { CheckCircle2, TrendingUp, Sparkles, MessageSquare, FileText, Bell, ShieldCheck, Star } from 'lucide-react';

import { Lang } from '../locales';

interface HeroVisualsProps {
    lang: Lang;
}

const HeroVisuals: React.FC<HeroVisualsProps> = ({ lang }) => {
    const t = {
        en: {
            completed: "Completed",
            contract: "Legal Contract Translation",
            details: "TechCorp International • 12 Pages",
            amount: "Amount",
            deadline: "Deadline",
            today: "Today, 2:00 PM",
            collaborators: "+2 collaborators",
            newRequest: "New Quote Request",
            requestDesc: "\"Need sworn translation for birth certificate...\"",
            review: "Review",
            dismiss: "Dismiss",
            revenue: "Revenue",
            growth: "+12% this week",
            ai: "AI Translation",
            processing: "Processing document...",
            optimizing: "Optimizing...",
            reviewText: "\"Incredible speed and accuracy. The sworn translation was accepted immediately.\""
        },
        fr: {
            completed: "Terminé",
            contract: "Traduction Contrat Légal",
            details: "TechCorp International • 12 Pages",
            amount: "Montant",
            deadline: "Date Limite",
            today: "Aujourd'hui, 14:00",
            collaborators: "+2 collaborateurs",
            newRequest: "Nouvelle Demande",
            requestDesc: "\"Besoin de traduction assermentée pour acte...\"",
            review: "Voir",
            dismiss: "Ignorer",
            revenue: "Revenus",
            growth: "+12% cette semaine",
            ai: "Traduction IA",
            processing: "Traitement en cours...",
            optimizing: "Optimisation...",
            reviewText: "\"Vitesse et précision incroyables. La traduction assermentée a été acceptée immédiatement.\""
        }
    };

    const text = t[lang];

    return (
        <div className="relative w-full max-w-4xl mx-auto mt-10">

            {/* MOBILE VIEW: Unified Dashboard Card */}
            <div className="md:hidden w-full max-w-[340px] mx-auto bg-slate-50 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                {/* Mobile Header */}
                <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">S</div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Welcome back</p>
                            <p className="text-sm font-bold text-slate-900">Sarah M.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-4">

                    {/* 1. Revenue Block */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{text.revenue}</p>
                            <p className="text-lg font-bold text-slate-900">2,450 TND</p>
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> {text.growth}
                            </p>
                        </div>
                        <div className="h-8 flex items-end gap-1">
                            <div className="w-2 bg-emerald-100 h-[40%] rounded-t-sm"></div>
                            <div className="w-2 bg-emerald-100 h-[60%] rounded-t-sm"></div>
                            <div className="w-2 bg-emerald-100 h-[30%] rounded-t-sm"></div>
                            <div className="w-2 bg-emerald-500 h-[100%] rounded-t-sm"></div>
                        </div>
                    </div>

                    {/* 2. Active Job (The Hero Card) */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <FileText className="w-24 h-24 text-slate-900" />
                        </div>

                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase">{text.completed}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-0.5 relative z-10">{text.contract}</h3>
                        <p className="text-xs text-slate-500 mb-3 relative z-10">{text.details}</p>

                        <div className="grid grid-cols-2 gap-2 mb-3 relative z-10">
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-[10px] text-slate-400">{text.amount}</p>
                                <p className="text-xs font-bold text-slate-900">450.000</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-[10px] text-slate-400">{text.deadline}</p>
                                <p className="text-xs font-bold text-slate-900">2:00 PM</p>
                            </div>
                        </div>
                        {/* Collaborators */}
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="flex -space-x-1.5">
                                <div className="w-6 h-6 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-600">JD</div>
                                <div className="w-6 h-6 rounded-full bg-purple-100 border border-white flex items-center justify-center text-[8px] font-bold text-purple-600">AI</div>
                            </div>
                            <span className="text-[10px] text-slate-400">{text.collaborators}</span>
                        </div>
                    </div>

                    {/* 3. AI Status Toast */}
                    <div className="bg-slate-900 rounded-xl p-3 flex items-center gap-3 shadow-lg">
                        <div className="bg-purple-500/20 text-purple-300 p-1.5 rounded-lg shrink-0">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-bold text-white truncate">{text.ai}</p>
                                <span className="text-[10px] text-purple-300">75%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1">
                                <div className="bg-purple-500 h-1 rounded-full w-[75%] animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            {/* DESKTOP VIEW: Origin Floating Layout */}
            <div className="hidden md:block relative w-full h-[500px]">
                {/* Central Card - Project Success */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-80 transform transition-transform hover:scale-105 duration-500 animate-float-slow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wide">{text.completed}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{text.contract}</h3>
                    <p className="text-sm text-slate-500 mb-4">{text.details}</p>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">{text.amount}</span>
                            <span className="font-bold text-slate-900">450.000 TND</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">{text.deadline}</span>
                            <span className="font-medium text-slate-900">{text.today}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">JD</div>
                            <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-600">AI</div>
                        </div>
                        <span className="text-xs text-slate-400">{text.collaborators}</span>
                    </div>
                </div>

                {/* Top Left - New Request Notification */}
                <div className="absolute top-0 left-10 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-64 animate-float-delayed-1">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-full shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{text.newRequest}</p>
                            <p className="text-xs text-slate-500 mt-1">{text.requestDesc}</p>
                            <div className="mt-2 flex gap-2">
                                <button className="text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded">{text.review}</button>
                                <button className="text-[10px] font-bold text-slate-500 px-2 py-1">{text.dismiss}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Right - Revenue Chart Mini */}
                <div className="absolute top-10 right-0 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-56 animate-float-delayed-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">{text.revenue}</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-2">2,450 TND</div>
                    <div className="h-10 flex items-end gap-1">
                        <div className="w-1/5 bg-emerald-100 h-[40%] rounded-t-sm"></div>
                        <div className="w-1/5 bg-emerald-100 h-[60%] rounded-t-sm"></div>
                        <div className="w-1/5 bg-emerald-100 h-[30%] rounded-t-sm"></div>
                        <div className="w-1/5 bg-emerald-100 h-[80%] rounded-t-sm"></div>
                        <div className="w-1/5 bg-emerald-500 h-[100%] rounded-t-sm"></div>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {text.growth}
                    </p>
                </div>

                {/* Bottom Left - AI Processing */}
                <div className="absolute bottom-10 left-10 z-30 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-100 p-4 w-60 animate-float-delayed-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">{text.ai}</p>
                            <p className="text-[10px] text-slate-500">{text.processing}</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                        <div className="bg-purple-600 h-1.5 rounded-full w-[75%] animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{text.optimizing}</span>
                        <span>75%</span>
                    </div>
                </div>

                {/* Bottom Right - Client Review */}
                <div className="absolute bottom-20 right-10 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-64 animate-float-delayed-1">
                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-600 italic mb-3">{text.reviewText}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">S</div>
                        <span className="text-xs font-bold text-slate-900">Sarah M.</span>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            </div>

        </div>
    );
};

export default HeroVisuals;
