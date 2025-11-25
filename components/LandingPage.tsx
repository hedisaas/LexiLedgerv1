import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Play,
    ChevronRight,
    Star,
    ShieldCheck,
    Zap,
    Globe,
    TrendingUp,
    FileText,
    Check
} from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // --- MOCKUP COMPONENTS ---

    const DashboardMockup = () => (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-4xl mx-auto transform transition-transform duration-100"
            style={{
                transform: `perspective(1000px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg)`
            }}>
            {/* Fake Browser Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-400 font-medium bg-white py-1 px-4 rounded-md border border-slate-100 max-w-xs mx-auto">
                    app.lexiledger.com/dashboard
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 grid grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="col-span-1 space-y-4">
                    <div className="h-8 w-32 bg-slate-100 rounded-md animate-pulse" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100" />
                        ))}
                    </div>
                </div>

                {/* Main Area */}
                <div className="col-span-2 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="h-4 w-16 bg-slate-100 rounded mb-2" />
                                <div className="h-8 w-24 bg-teal-50 rounded" />
                            </div>
                        ))}
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-48 flex items-end justify-between gap-2 px-8 pb-4">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-teal-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const FloatingCard = ({ icon: Icon, title, subtitle, className, delay }: any) => (
        <div className={`absolute bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float ${className}`}
            style={{ animationDelay: `${delay}s` }}>
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-sm font-bold text-slate-800">{title}</div>
                <div className="text-xs text-slate-500">{subtitle}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo />
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-teal-600 transition-colors">Pricing</a>
                        <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onGetStarted} className="text-slate-600 font-medium hover:text-teal-600">Log in</button>
                        <button onClick={onGetStarted} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        New: AI Translation Engine 2.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight animate-fade-in-up delay-100">
                        Manage your translations <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                            like a pro.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        The all-in-one workspace for sworn translators. Draft, manage, invoice, and track your business in one beautiful interface.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up delay-300">
                        <button onClick={onGetStarted} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-slate-700" />
                            Watch Demo
                        </button>
                    </div>

                    {/* 3D Dashboard Preview */}
                    <div className="relative max-w-5xl mx-auto perspective-1000 animate-fade-in-up delay-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 bottom-0 h-20" />
                        <DashboardMockup />

                        {/* Floating Elements */}
                        <FloatingCard
                            icon={CheckCircle2}
                            title="Translation Completed"
                            subtitle="Project #1284 - Legal Contract"
                            className="top-10 -left-12 md:-left-24 z-20"
                            delay={0}
                        />
                        <FloatingCard
                            icon={TrendingUp}
                            title="Revenue Updated"
                            subtitle="+ 450.000 TND received"
                            className="bottom-20 -right-4 md:-right-16 z-20"
                            delay={1.5}
                        />
                    </div>
                </div>

                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-teal-50/50 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl" />
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-10 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Trusted by 500+ Sworn Translators</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {['GlobalTrans', 'LegalLingua', 'CertifiedPro', 'SwornNet', 'LexiCorp'].map((name, i) => (
                            <span key={i} className="text-xl font-bold text-slate-600 flex items-center gap-2">
                                <Globe className="w-5 h-5" /> {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to run your business.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Stop juggling 5 different apps. LexiLedger brings your translations, invoices, and clients into one seamless workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "AI-Powered Translation",
                                desc: "Draft documents 10x faster with our specialized legal translation engine.",
                                color: "bg-amber-100 text-amber-600"
                            },
                            {
                                icon: FileText,
                                title: "Smart Invoicing",
                                desc: "Create compliant invoices in one click. Track payments and follow up automatically.",
                                color: "bg-teal-100 text-teal-600"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Official Registry",
                                desc: "Automatically maintain your sworn registry. Export for authorities instantly.",
                                color: "bg-blue-100 text-blue-600"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlight - Split Screen */}
            <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm font-medium mb-6 border border-teal-500/30">
                            <Star className="w-4 h-4" /> Feature Spotlight
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Focus on translating. <br />
                            <span className="text-teal-400">We handle the rest.</span>
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            LexiLedger isn't just a tool; it's your personal secretary. From organizing client files to tracking deadlines, we ensure you never miss a beat.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                "Automatic deadline reminders",
                                "Client portal for secure file sharing",
                                "Real-time financial analytics",
                                "Secure cloud backup"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-200">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button onClick={onGetStarted} className="group flex items-center gap-2 text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                            Explore all features <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] relative">
                                {/* Abstract UI Representation */}
                                <div className="absolute top-0 left-0 w-full h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                </div>
                                <div className="p-8 space-y-6 mt-8">
                                    <div className="flex gap-4">
                                        <div className="w-1/3 h-32 bg-slate-800 rounded-lg animate-pulse" />
                                        <div className="w-2/3 h-32 bg-slate-800 rounded-lg animate-pulse delay-75" />
                                    </div>
                                    <div className="h-40 bg-slate-800 rounded-lg animate-pulse delay-150" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
                        Ready to upgrade your workflow?
                    </h2>
                    <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                        Join thousands of sworn translators who trust LexiLedger for their daily operations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={onGetStarted} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Start 14-Day Free Trial
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-slate-500">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo />
                    <div className="text-slate-400 text-sm">
                        © 2025 LexiLedger. Crafted with precision.
                    </div>
                </div>
            </footer>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
        </div>
    );
};

export default LandingPage;
