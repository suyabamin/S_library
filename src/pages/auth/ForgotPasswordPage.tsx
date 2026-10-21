import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-card shadow-xl border border-brand-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-brand-text">পাসওয়ার্ড পুনরুদ্ধার</h2>
          <p className="text-xs text-brand-muted">
            আপনার নিবন্ধিত ইমেইল ঠিকানা দিলে আমরা পাসওয়ার্ড রিসেট লিংক পাঠাব
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-brand-text">
              একটি পাসওয়ার্ড রিসেট লিংক <span className="font-bold">{email}</span> ঠিকানায় পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> লগইনে ফিরে যান
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                ইমেইল ঠিকানা
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

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm transition"
            >
              রিসেট লিংক পাঠান
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-primary transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> লগইনে ফিরে যান
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
