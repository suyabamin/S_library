import React, { useState } from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { Settings, Shield, HardDrive, Bell, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [defaultLoanDays, setDefaultLoanDays] = useState(14);
  const [maxBooksPerUser, setMaxBooksPerUser] = useState(2);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>সিস্টেম ও লাইব্রেরি সেটিংস</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            ধার প্রদানের সময়সীমা, ক্লাউডফ্লেয়ার R2 স্টোরেজ এবং রিমাইন্ডার নীতি
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে।</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs max-w-2xl">
          {/* Section: Lending Rules */}
          <div className="space-y-4 p-5 rounded-xl border border-brand-border bg-gray-50/50">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>বই ধার দেওয়ার নিয়মাবলী</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-brand-text mb-1">
                  সর্বোচ্চ ধার নেওয়ার দিন (ডিফল্ট)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={defaultLoanDays}
                  onChange={(e) => setDefaultLoanDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-brand-border bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">
                  একক পাঠকের সর্বোচ্চ ধার বই
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={maxBooksPerUser}
                  onChange={(e) => setMaxBooksPerUser(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-brand-border bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Cloudflare R2 Info */}
          <div className="space-y-3 p-5 rounded-xl border border-brand-border bg-gray-50/50">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-primary" />
              <span>Cloudflare R2 অবজেক্ট স্টোরেজ স্থিতি</span>
            </h3>
            <p className="text-brand-muted">
              পিডিএফ ও কভার চিত্রসমূহ ক্লাউডফ্লেয়ার R2 প্রাইভেট বাকেটে সংরক্ষিত হচ্ছে।
            </p>
            <div className="p-3 bg-white rounded-lg border border-brand-border font-mono text-[11px] text-emerald-800 flex items-center justify-between">
              <span>R2 Bucket: shibir-library-bucket</span>
              <span className="font-bold text-emerald-600">● সক্রিয়</span>
            </div>
          </div>

          {/* Section: Scheduled Reminders */}
          <div className="space-y-3 p-5 rounded-xl border border-brand-border bg-gray-50/50">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>স্বয়ংক্রিয় রিটার্ন রিমাইন্ডার জব</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-brand-text">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="rounded border-brand-border text-primary"
              />
              <span>৩ দিন, ১ দিন এবং নির্ধারিত দিনে স্বয়ংক্রিয় নোটিফিকেশন চালু রাখুন</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};
