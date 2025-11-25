import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { BusinessProfile } from '../types';

interface ProfileCompletionModalProps {
    profile: BusinessProfile | null;
    onNavigateToSettings: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ profile, onNavigateToSettings }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (profile) {
            // Check if profile has default or empty values
            const isDefault =
                profile.businessName === "LexiLedger Translations" ||
                profile.translatorName === "Your Name" ||
                profile.address === "Your Office Address" ||
                profile.taxId === "0000000/X/A/M/000" ||
                profile.phone === "+216 00 000 000";

            if (isDefault) {
                // Check if we've already shown it this session
                const hasSeen = sessionStorage.getItem('profile_reminder_seen');
                if (!hasSeen) {
                    setIsOpen(true);
                }
            }
        }
    }, [profile]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('profile_reminder_seen', 'true');
    };

    const handleAction = () => {
        handleClose();
        onNavigateToSettings();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-900">Complete Your Profile</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Your business profile still has default values. Please update your information to ensure your invoices and quotes are correct.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-white">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Remind Me Later
                        </button>
                        <button
                            onClick={handleAction}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm shadow-amber-200 flex items-center gap-2 transition-all hover:translate-x-1"
                        >
                            Go to Settings <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
