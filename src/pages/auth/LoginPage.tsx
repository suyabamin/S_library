import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('ইমেইল অথবা মোবাইল নম্বর লিখুন');
      return;
    }
    if (!password.trim()) {
      setError('পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(emailOrPhone.trim(), password);
      if (emailOrPhone.toLowerCase().includes('admin') && from === '/dashboard') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError((err as Error).message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    await login('admin@shibir.library', 'admin123', 'admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-card shadow-xl border border-brand-border p-8 space-y-6">
        {/* Brand Header matching Reference */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto flex items-center justify-center p-1">
            <img src="/assets/logo.svg" alt="শিবির লাইব্রেরি লোগো" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text">
            শিবির লাইব্রেরি, <span className="text-primary">UIU থানা</span>
          </h2>
          <p className="text-xs text-primary font-bold tracking-widest uppercase">
            শহিদি কাফেলা
          </p>
          <p className="text-xs text-brand-muted pt-1">
            আপনার একাউন্টে প্রবেশ করে বই ধার নেওয়া ও পড়ার সুযোগ নিন
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              ইমেইল অথবা মোবাইল নম্বর
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10"
              />
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10 pr-10"
              />
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-brand-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-brand-border text-primary focus:ring-primary/20"
              />
              <span>মনে রাখুন</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-primary hover:text-primary-hover font-semibold hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>
        </form>

        {/* Quick Admin Test Trigger */}
        <div className="pt-2 text-center">
          <button
            onClick={handleQuickAdminLogin}
            type="button"
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> এডমিন একাউন্টে সরাসরি প্রবেশ করুন
          </button>
        </div>

        <div className="pt-4 border-t border-brand-border text-center text-xs text-brand-muted">
          <span>নতুন একাউন্ট চাই? </span>
          <Link to="/register" className="font-bold text-primary hover:underline">
            সাইন আপ করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
