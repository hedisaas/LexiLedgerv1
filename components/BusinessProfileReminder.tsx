import React from 'react';
import { X, AlertCircle, Settings } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileReminderProps {
  profile: BusinessProfile | null;
  onClose: () => void;
  onGoToSettings: () => void;
}

export const BusinessProfileReminder: React.FC<BusinessProfileReminderProps> = ({
  profile,
  onClose,
  onGoToSettings
}) => {
  // Check if profile is incomplete
  const isIncomplete = !profile || 
    !profile.businessName || 
    !profile.translatorName || 
    !profile.address || 
    !profile.taxId || 
    !profile.phone || 
    !profile.email;

  // Don't show if profile is complete
  if (!isIncomplete) return null;

  // Check if user dismissed this before (store in localStorage)
  const dismissed = localStorage.getItem('profile_reminder_dismissed');
  if (dismissed === 'true') return null;

  const handleDismiss = () => {
    localStorage.setItem('profile_reminder_dismissed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Complete Your Profile</h3>
              <p className="text-sm text-white/90">Important information missing</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-700 mb-4">
            Your business profile is incomplete. Please add your business information to:
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
              <span>Generate professional invoices with your details</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
              <span>Display your business information to clients</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
              <span>Ensure compliance with tax requirements</span>
            </li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-amber-800">
              <strong>Missing:</strong> {' '}
              {[
                !profile?.businessName && 'Business Name',
                !profile?.translatorName && 'Your Name',
                !profile?.address && 'Address',
                !profile?.taxId && 'Tax ID',
                !profile?.phone && 'Phone',
                !profile?.email && 'Email'
              ].filter(Boolean).join(', ')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Remind Me Later
            </button>
            <button
              onClick={() => {
                handleDismiss();
                onGoToSettings();
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Complete Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileReminder;

