
import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Briefcase, UserCog, Loader2 } from 'lucide-react';
import { Lang, translations } from '../locales';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

interface LoginProps {
  onLogin: (role: 'admin' | 'secretary' | 'client', clientName?: string) => void;
  lang: Lang;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang }) => {
  const [mode, setMode] = useState<'staff' | 'client'>('staff');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [translatorName, setTranslatorName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'secretary'>('admin');
  const [clientName, setClientName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (mode === 'staff') {
      try {
        if (isSignUp) {
          // Sign up new user
          const { data, error } = await signUp(email, password, {
            translator_name: translatorName,
            role: selectedRole
          });
          
          if (error) {
            setError(error.message);
          } else {
            setError('Account created! Please check your email to verify your account, then sign in.');
            setIsSignUp(false);
          }
        } else {
          // Sign in existing user
          const { data, error } = await signIn(email, password);
          
          if (error) {
            setError(error.message);
          } else if (data.user) {
            // The useAuth hook will handle setting the user state
            // The role will be determined in App.tsx
          }
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      }
    } else {
      // Mock client auth: Any name + code '1234'
      if (clientName.length > 2 && accessCode === '1234') {
        onLogin('client', clientName);
      } else {
        setError("Invalid access code (Try: 1234)");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <Logo size="medium" variant="icon" />
            </div>
          </div>
          <Logo size="medium" variant="text" className="text-white justify-center flex mb-2" />
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setMode('staff')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'staff' ? 'bg-white text-slate-900 border-b-2 border-primary-600' : 'bg-slate-50 text-slate-400'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Staff Login
          </button>
          <button 
            onClick={() => setMode('client')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'client' ? 'bg-white text-slate-900 border-b-2 border-primary-600' : 'bg-slate-50 text-slate-400'}`}
          >
            <Briefcase className="w-4 h-4" /> {t.clientLogin}
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {mode === 'staff' ? (
              <>
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          required
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                          placeholder="Your full name"
                          value={translatorName}
                          onChange={(e) => setTranslatorName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'secretary')}
                        className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 transition-colors"
                      >
                        <option value="admin">Admin (Full Access)</option>
                        <option value="secretary">Secretary (Limited Access)</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.password}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                      placeholder="•••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="text-xs text-center">
                  {isSignUp ? (
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Already have an account? Sign in
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Don't have an account? Sign up
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.clientName}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                      placeholder="e.g. Ahmed Ben Ali"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.accessCode}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                      placeholder="1234"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 disabled:shadow-none disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> 
                  {mode === 'staff' ? (isSignUp ? 'Creating Account...' : 'Signing In...') : 'Logging In...'}
                </>
              ) : (
                <>
                  {mode === 'staff' ? (isSignUp ? 'Create Account' : t.signIn) : t.signIn}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
