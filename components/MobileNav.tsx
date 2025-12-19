import React from 'react';
import { Home, FileText, Plus, Users, Menu } from 'lucide-react';

interface MobileNavProps {
    activeTab: string;
    onNavigate: (tab: string) => void;
    onOpenMenu: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onNavigate, onOpenMenu }) => {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'translations', icon: FileText, label: 'Jobs' },
        { id: 'add_job', icon: Plus, label: 'Add', isAction: true }, // Special styling for Add
        { id: 'clients', icon: Users, label: 'Clients' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe z-[100] flex justify-between items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${item.isAction
                        ? '-mt-8'
                        : activeTab === item.id ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    {item.isAction ? (
                        <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-200 mb-1 transform active:scale-95 transition-transform">
                            <item.icon className="w-7 h-7" />
                        </div>
                    ) : (
                        <>
                            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </>
                    )}
                </button>
            ))}

            {/* Menu Item (Always last) */}
            <button
                onClick={onOpenMenu}
                className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${activeTab === 'menu' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Menu className="w-6 h-6" />
                <span className="text-[10px] font-bold">Menu</span>
            </button>
        </div>
    );
};

export default MobileNav;
