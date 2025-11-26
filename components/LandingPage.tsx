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
    TrendingDown,
    DollarSign,
    Clock,
    Filter,
    Activity,
    FileText,
    Check,
    ChevronDown,
    Minus,
    Plus,
    UserCog,
    FolderLock,
    Users
} from 'lucide-react';
import Logo from './Logo';
import FAQAccordion from './FAQAccordion';
import { Lang } from '../locales';
import Dashboard from './Dashboard';
import { TranslationJob, Expense, TranslationStatus, ExpenseCategory, Language } from '../types';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ZoomIn, ZoomOut, RotateCw, RotateCcw, Save, FileDown, Sparkles, Database, BookOpen, RefreshCw, Maximize2 } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    lang: Lang;
    toggleLang: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, lang, toggleLang }) => {
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

    const t = {
        en: {
            features: "Features",
            pricing: "Pricing",
            about: "About",
            login: "Log in",
            startTrial: "Start Free Trial",
            newEngine: "New: AI Translation Engine 2.0",
            heroTitle: "Manage your translations",
            heroTitleHighlight: "like a pro.",
            heroSubtitle: "The all-in-one workspace for sworn translators. Manage translations, invoices, clients, and documents with secretary accounts and secure document vaults - all in one beautiful interface.",
            getStartedFree: "Get Started Free",
            watchDemo: "Watch Demo",
            translationCompleted: "Translation Completed",
            projectLabel: "Project #1284 - Legal Contract",
            revenueUpdated: "Revenue Updated",
            revenueAmount: "+ 450.000 TND received",
            trustedBy: "Trusted by 500+ Sworn Translators",
            everythingTitle: "Everything you need to run your business.",
            everythingSubtitle: "Stop juggling 5 different apps. LexiLedger brings your translations, invoices, clients, and documents into one seamless workflow.",
            feature1Title: "AI-Powered Translation",
            feature1Desc: "Draft documents 10x faster with our specialized legal translation engine.",
            feature2Title: "Smart Invoicing",
            feature2Desc: "Create compliant invoices in one click. Track payments and follow up automatically.",
            feature3Title: "Official Registry",
            feature3Desc: "Automatically maintain your sworn registry. Export for authorities instantly.",
            feature4Title: "Secretary Accounts",
            feature4Desc: "Delegate administrative tasks to your secretary with controlled access. Manage permissions and track all activities.",
            feature5Title: "Document Vault",
            feature5Desc: "Store all client documents securely in the cloud. Organize, search, and access files anytime, anywhere.",
            feature6Title: "Client Portal",
            feature6Desc: "Give clients secure access to their translations and invoices. Reduce emails and improve communication.",
            spotlight: "Feature Spotlight",
            focusTitle: "Focus on translating.",
            focusHighlight: "We handle the rest.",
            focusDesc: "LexiLedger isn't just a tool; it's your personal secretary. From organizing client files to tracking deadlines, we ensure you never miss a beat.",
            list1: "Secretary accounts with role-based permissions",
            list2: "Secure document vault with unlimited storage",
            list3: "Client portal for seamless collaboration",
            list4: "Real-time sync across all devices",
            exploreFeatures: "Explore all features",
            readyTitle: "Ready to upgrade your workflow?",
            readySubtitle: "Join thousands of sworn translators who trust LexiLedger for their daily operations.",
            start14Day: "Start 14-Day Free Trial",
            noCreditCard: "No credit card required. Cancel anytime.",
            faqTitle: "FAQ",
            faqSubtitle: "Frequently Asked Questions",
            faq1Q: "Why choose LexiLedger over other solutions?",
            faq1A: "LexiLedger stands out with its SaaS solution specifically designed for sworn translators, offering complete financial and commercial management features tailored to small businesses. Our platform guarantees data security, ease of use, and unmatched efficiency compared to other alternatives.",
            faq2Q: "How does LexiLedger save me time and money?",
            faq2A: "LexiLedger automates repetitive tasks like invoicing, client tracking, and financial reporting. With AI-powered translation assistance and smart templates, you can complete jobs 10x faster while reducing administrative overhead and human errors.",
            faq3Q: "Is LexiLedger suitable for my specific business sector?",
            faq3A: "Yes! LexiLedger is specifically designed for sworn translators and legal translation professionals. Whether you handle birth certificates, legal contracts, court judgments, or commercial documents, our platform adapts to your workflow.",
            faq4Q: "Can I trust LexiLedger with my sensitive data?",
            faq4A: "Absolutely. We use enterprise-grade encryption, secure cloud backup, and comply with international data protection standards. Your client information and documents are protected with bank-level security. We never share your data with third parties.",
            faq5Q: "How is LexiLedger beneficial for micro-entrepreneurs?",
            faq5A: "LexiLedger eliminates the need for multiple expensive tools. For one affordable subscription, you get invoicing, client management, translation memory, financial analytics, and official registry maintenance - everything a solo translator needs to run a professional business.",
            faq6Q: "Can I manage my business remotely with LexiLedger?",
            faq6A: "Yes! LexiLedger is 100% cloud-based, accessible from any device with an internet connection. Work from your office, home, or while traveling. Your data syncs automatically across all devices in real-time.",
            faq7Q: "Is customer support available when I need help?",
            faq7A: "Yes! We offer comprehensive customer support via email, live chat, and detailed documentation. Our team responds within 24 hours, and we provide onboarding assistance to help you get started quickly.",
            faq8Q: "What happens if I need to cancel my subscription?",
            faq8A: "You can cancel anytime with no penalties or hidden fees. Your data remains accessible for 30 days after cancellation, giving you time to export everything. We also offer a full refund within the first 14 days if you're not satisfied.",
            footerRights: "© 2025 LexiLedger. Crafted with precision."
        },
        fr: {
            features: "Fonctionnalités",
            pricing: "Tarifs",
            about: "À propos",
            login: "Connexion",
            startTrial: "Essai Gratuit",
            newEngine: "Nouveau : Moteur de Traduction IA 2.0",
            heroTitle: "Gérez vos traductions",
            heroTitleHighlight: "comme un pro.",
            heroSubtitle: "L'espace de travail tout-en-un pour les traducteurs assermentés. Gérez traductions, factures, clients et documents avec comptes secrétaires et coffres-forts sécurisés - le tout dans une interface magnifique.",
            getStartedFree: "Commencer Gratuitement",
            watchDemo: "Voir la Démo",
            translationCompleted: "Traduction Terminée",
            projectLabel: "Projet #1284 - Contrat Légal",
            revenueUpdated: "Revenus Mis à Jour",
            revenueAmount: "+ 450,000 TND reçus",
            trustedBy: "Approuvé par 500+ Traducteurs Assermentés",
            everythingTitle: "Tout ce dont vous avez besoin pour gérer votre activité.",
            everythingSubtitle: "Arrêtez de jongler avec 5 applications différentes. LexiLedger rassemble vos traductions, factures, clients et documents dans un flux de travail fluide.",
            feature1Title: "Traduction par IA",
            feature1Desc: "Rédigez des documents 10x plus vite avec notre moteur spécialisé en traduction juridique.",
            feature2Title: "Facturation Intelligente",
            feature2Desc: "Créez des factures conformes en un clic. Suivez les paiements et relancez automatiquement.",
            feature3Title: "Registre Officiel",
            feature3Desc: "Maintenez automatiquement votre registre assermenté. Exportez pour les autorités instantanément.",
            feature4Title: "Comptes Secrétaires",
            feature4Desc: "Déléguez les tâches administratives à votre secrétaire avec accès contrôlé. Gérez les permissions et suivez toutes les activités.",
            feature5Title: "Coffre-fort Documents",
            feature5Desc: "Stockez tous les documents clients en toute sécurité dans le cloud. Organisez, recherchez et accédez aux fichiers à tout moment, n'importe où.",
            feature6Title: "Portail Client",
            feature6Desc: "Donnez aux clients un accès sécurisé à leurs traductions et factures. Réduisez les emails et améliorez la communication.",
            spotlight: "Fonctionnalité en Vedette",
            focusTitle: "Concentrez-vous sur la traduction.",
            focusHighlight: "Nous gérons le reste.",
            focusDesc: "LexiLedger n'est pas juste un outil ; c'est votre secrétaire personnel. De l'organisation des fichiers clients au suivi des délais, nous nous assurons que rien ne vous échappe.",
            list1: "Comptes secrétaires avec permissions par rôle",
            list2: "Coffre-fort documents avec stockage illimité",
            list3: "Portail client pour collaboration fluide",
            list4: "Synchronisation en temps réel sur tous les appareils",
            exploreFeatures: "Explorer toutes les fonctionnalités",
            readyTitle: "Prêt à améliorer votre flux de travail ?",
            readySubtitle: "Rejoignez des milliers de traducteurs assermentés qui font confiance à LexiLedger pour leurs opérations quotidiennes.",
            start14Day: "Démarrer l'Essai Gratuit de 14 Jours",
            noCreditCard: "Pas de carte de crédit requise. Annulez à tout moment.",
            faqTitle: "FAQ",
            faqSubtitle: "Questions Fréquemment Posées",
            faq1Q: "Pourquoi choisir LexiLedger plutôt que d'autres solutions ?",
            faq1A: "LexiLedger se distingue par sa solution SaaS sécurisée et intuitive, offrant des fonctionnalités complètes de gestion financière et commerciale adaptées aux petites entreprises. Notre plateforme garantit la sécurité des données, la facilité d'utilisation et une efficacité inégalée par rapport aux autres alternatives.",
            faq2Q: "Comment LexiLedger m'économise-t-il du temps et de l'argent ?",
            faq2A: "LexiLedger automatise les tâches répétitives comme la facturation, le suivi des clients et les rapports financiers. Avec l'assistance à la traduction par IA et les modèles intelligents, vous pouvez terminer les travaux 10 fois plus vite tout en réduisant les frais administratifs et les erreurs humaines.",
            faq3Q: "LexiLedger convient-il à mon secteur d'activité spécifique ?",
            faq3A: "Oui ! LexiLedger est spécifiquement conçu pour les traducteurs assermentés et les professionnels de la traduction juridique. Que vous traitiez des actes de naissance, des contrats légaux, des jugements ou des documents commerciaux, notre plateforme s'adapte à votre flux de travail.",
            faq4Q: "Puis-je faire confiance à LexiLedger avec mes données sensibles ?",
            faq4A: "Absolument. Nous utilisons un chiffrement de niveau entreprise, une sauvegarde cloud sécurisée et nous respectons les normes internationales de protection des données. Vos informations clients et documents sont protégés avec une sécurité de niveau bancaire. Nous ne partageons jamais vos données avec des tiers.",
            faq5Q: "À quel point LexiLedger Lite est-il convivial pour les micro-entrepreneurs ?",
            faq5A: "LexiLedger élimine le besoin de plusieurs outils coûteux. Pour un seul abonnement abordable, vous obtenez la facturation, la gestion des clients, la mémoire de traduction, l'analyse financière et la maintenance du registre officiel - tout ce dont un traducteur indépendant a besoin pour gérer une entreprise professionnelle.",
            faq6Q: "Puis-je gérer mon entreprise en déplacement avec LexiLedger ?",
            faq6A: "Oui ! LexiLedger est 100% basé sur le cloud, accessible depuis n'importe quel appareil avec une connexion Internet. Travaillez depuis votre bureau, votre domicile ou en voyage. Vos données se synchronisent automatiquement sur tous les appareils en temps réel.",
            faq7Q: "Le support client est-il disponible quand j'ai besoin d'aide ?",
            faq7A: "Oui ! Nous offrons un support client complet par e-mail, chat en direct et documentation détaillée. Notre équipe répond dans les 24 heures, et nous fournissons une assistance à l'intégration pour vous aider à démarrer rapidement.",
            faq8Q: "Que se passe-t-il si je dois annuler mon abonnement ?",
            faq8A: "Vous pouvez annuler à tout moment sans pénalités ni frais cachés. Vos données restent accessibles pendant 30 jours après l'annulation, vous donnant le temps de tout exporter. Nous offrons également un remboursement complet dans les 14 premiers jours si vous n'êtes pas satisfait.",
            footerRights: "© 2025 LexiLedger. Conçu avec précision."
        }
    };

    const text = t[lang];

    // --- MOCK DATA ---
    const today = new Date();
    const getPastDate = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const getFutureDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const mockJobs: TranslationJob[] = [
        { id: '1', date: getPastDate(2), dueDate: getFutureDate(1), clientName: "TechCorp Intl", clientInfo: "Tunis", documentType: "Legal Contract", sourceLang: Language.ENGLISH, targetLang: Language.FRENCH, pageCount: 5, priceTotal: 450, status: TranslationStatus.COMPLETED, remarks: "" },
        { id: '2', date: getPastDate(5), dueDate: getPastDate(1), clientName: "Global Trade SARL", clientInfo: "Sfax", documentType: "Commercial Registry", sourceLang: Language.FRENCH, targetLang: Language.ENGLISH, pageCount: 2, priceTotal: 120, status: TranslationStatus.PAID, remarks: "" },
        { id: '3', date: getPastDate(10), dueDate: getFutureDate(5), clientName: "Cabinet Maître Hedi", clientInfo: "Tunis", documentType: "Court Judgment", sourceLang: Language.ARABIC, targetLang: Language.FRENCH, pageCount: 8, priceTotal: 600, status: TranslationStatus.PENDING, remarks: "" },
        { id: '4', date: getPastDate(15), dueDate: getPastDate(12), clientName: "Individual Client", clientInfo: "Ariana", documentType: "Birth Certificate", sourceLang: Language.ARABIC, targetLang: Language.ENGLISH, pageCount: 1, priceTotal: 40, status: TranslationStatus.PAID, remarks: "" },
        { id: '5', date: getPastDate(20), dueDate: getPastDate(18), clientName: "StartUp Hub", clientInfo: "Sousse", documentType: "Terms of Service", sourceLang: Language.ENGLISH, targetLang: Language.ARABIC, pageCount: 12, priceTotal: 850, status: TranslationStatus.COMPLETED, remarks: "" },
    ];

    const mockExpenses: Expense[] = [
        { id: '1', date: getPastDate(3), description: "Office Rent", amount: 800, category: ExpenseCategory.FIXED_RENT },
        { id: '2', date: getPastDate(12), description: "Internet Bill", amount: 80, category: ExpenseCategory.VARIABLE_BILLS },
        { id: '3', date: getPastDate(25), description: "Paper Supplies", amount: 45, category: ExpenseCategory.VARIABLE_OFFICE },
    ];

    // --- MOCKUP COMPONENTS ---

    const DashboardMockup = () => (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-5xl mx-auto">
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

            {/* Dashboard Screenshot */}
            <div className="p-4 bg-slate-50 overflow-hidden flex justify-center items-start">
                <img
                    src="/dashboard-main-preview.png"
                    alt="LexiLedger Dashboard Preview"
                    className="rounded-lg shadow-xl w-full max-w-6xl hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
            </div>
        </div>
    );

    const WorkbenchPreview = () => (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden w-full">
            <img
                src="/feature-highlight-list.png"
                alt="LexiLedger Feature Spotlight - List View"
                className="w-full h-auto"
            />
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
                        <a href="#features" className="hover:text-teal-600 transition-colors">{text.features}</a>
                        <a href="#pricing" className="hover:text-teal-600 transition-colors">{text.pricing}</a>
                        <a href="#about" className="hover:text-teal-600 transition-colors">{text.about}</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleLang} className="text-slate-600 font-medium hover:text-teal-600 flex items-center gap-1">
                            <Globe className="w-4 h-4" /> {lang.toUpperCase()}
                        </button>
                        <button onClick={onGetStarted} className="text-slate-600 font-medium hover:text-teal-600">{text.login}</button>
                        <button onClick={onGetStarted} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                            {text.startTrial}
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
                        {text.newEngine}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight animate-fade-in-up delay-100">
                        {text.heroTitle} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                            {text.heroTitleHighlight}
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        {text.heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up delay-300">
                        <button onClick={onGetStarted} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                            {text.getStartedFree}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-slate-700" />
                            {text.watchDemo}
                        </button>
                    </div>

                    {/* 3D Dashboard Preview */}
                    <div className="relative max-w-5xl mx-auto perspective-1000 animate-fade-in-up delay-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 bottom-0 h-20" />
                        <DashboardMockup />

                        {/* Floating Elements */}
                        <FloatingCard
                            icon={CheckCircle2}
                            title={text.translationCompleted}
                            subtitle={text.projectLabel}
                            className="hidden md:flex top-10 -left-24 z-20"
                            delay={0}
                        />
                        <FloatingCard
                            icon={TrendingUp}
                            title={text.revenueUpdated}
                            subtitle={text.revenueAmount}
                            className="hidden md:flex bottom-20 -right-16 z-20"
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
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">{text.trustedBy}</p>
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
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">{text.everythingTitle}</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">{text.everythingSubtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: text.feature1Title,
                                desc: text.feature1Desc,
                                color: "bg-amber-100 text-amber-600"
                            },
                            {
                                icon: FileText,
                                title: text.feature2Title,
                                desc: text.feature2Desc,
                                color: "bg-teal-100 text-teal-600"
                            },
                            {
                                icon: ShieldCheck,
                                title: text.feature3Title,
                                desc: text.feature3Desc,
                                color: "bg-blue-100 text-blue-600"
                            },
                            {
                                icon: UserCog,
                                title: text.feature4Title,
                                desc: text.feature4Desc,
                                color: "bg-purple-100 text-purple-600"
                            },
                            {
                                icon: FolderLock,
                                title: text.feature5Title,
                                desc: text.feature5Desc,
                                color: "bg-emerald-100 text-emerald-600"
                            },
                            {
                                icon: Users,
                                title: text.feature6Title,
                                desc: text.feature6Desc,
                                color: "bg-rose-100 text-rose-600"
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
                            <Star className="w-4 h-4" /> {text.spotlight}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {text.focusTitle} <br />
                            <span className="text-teal-400">{text.focusHighlight}</span>
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            {text.focusDesc}
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                text.list1,
                                text.list2,
                                text.list3,
                                text.list4
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
                            {text.exploreFeatures} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <WorkbenchPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{text.faqTitle}</h2>
                        <p className="text-lg text-slate-600">{text.faqSubtitle}</p>
                    </div>

                    <FAQAccordion faqs={[
                        { q: text.faq1Q, a: text.faq1A },
                        { q: text.faq2Q, a: text.faq2A },
                        { q: text.faq3Q, a: text.faq3A },
                        { q: text.faq4Q, a: text.faq4A },
                        { q: text.faq5Q, a: text.faq5A },
                        { q: text.faq6Q, a: text.faq6A },
                        { q: text.faq7Q, a: text.faq7A },
                        { q: text.faq8Q, a: text.faq8A }
                    ]} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
                        {text.readyTitle}
                    </h2>
                    <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                        {text.readySubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={onGetStarted} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            {text.start14Day}
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-slate-500">{text.noCreditCard}</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo />
                    <div className="text-slate-400 text-sm">
                        {text.footerRights}
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
