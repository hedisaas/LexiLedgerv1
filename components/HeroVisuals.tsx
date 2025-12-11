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
        <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center mt-10">

            {/* Central Card - Project Success */}
            <div className="relative z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-72 md:w-80 transform transition-transform hover:scale-105 duration-500 animate-float-slow">
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
            <div className="absolute top-0 left-4 md:left-10 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-64 animate-float-delayed-1 hidden md:block">
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
            <div className="absolute top-10 right-4 md:right-0 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-56 animate-float-delayed-2 hidden md:block">
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
            <div className="absolute bottom-10 left-0 md:left-10 z-30 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-100 p-4 w-60 animate-float-delayed-3 hidden md:block">
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
            <div className="absolute bottom-20 right-4 md:right-10 z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-64 animate-float-delayed-1 hidden md:block">
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
    );
};

export default HeroVisuals;
