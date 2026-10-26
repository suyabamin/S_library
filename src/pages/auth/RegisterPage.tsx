import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserPosition, USER_POSITION_LABELS } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<UserPosition>('worker');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('নাম লিখুন');
    if (!email.trim()) return setError('ইমেইল লিখুন');
    if (!phone.trim()) return setError('মোবাইল নম্বর লিখুন');
    if (password.length < 6) return setError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
    if (password !== confirmPassword) return setError('পাসওয়ার্ড দুটি মেলেনি');

    setLoading(true);
    setError(null);
    try {
      await register(name.trim(), email.trim(), phone.trim(), password, position);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'নিবন্ধন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-card shadow-xl border border-brand-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto flex items-center justify-center p-1">
            <img src="/assets/logo.webp" alt="শিবির লাইব্রেরি লোগো" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text">
            নতুন একাউন্ট নিবন্ধন
          </h2>
          <p className="text-xs text-primary font-bold tracking-widest uppercase">
            শিবির লাইব্রেরি, UIU থানা
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
              পূর্ণ নাম <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10"
              />
              <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              ইমেইল <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10"
              />
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              মোবাইল নম্বর <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712xxxxxx"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10"
              />
              <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              পদবী <span className="text-rose-500">*</span>
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as UserPosition)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
            >
              {(Object.keys(USER_POSITION_LABELS) as UserPosition[]).map((pos) => (
                <option key={pos} value={pos}>
                  {USER_POSITION_LABELS[pos]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              পাসওয়ার্ড <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="নূন্যতম ৬ অক্ষর"
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

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="আবার পাসওয়ার্ড লিখুন"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pl-10"
              />
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'নিবন্ধন হচ্ছে...' : 'সাইন আপ করুন'}
          </button>
        </form>

        <div className="pt-4 border-t border-brand-border text-center text-xs text-brand-muted">
          <span>ইতিমধ্যে একাউন্ট আছে? </span>
          <Link to="/login" className="font-bold text-primary hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
