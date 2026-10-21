import React, { useState } from 'react';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { UserPosition, USER_POSITION_LABELS } from '../../types';
import { CheckCircle2, User, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || '৩য় বর্ষ');
  const [address, setAddress] = useState(user?.address || '');
  const [position, setPosition] = useState<UserPosition>(user?.position || 'member');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      phone,
      academicYear,
      address,
      position,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-8 card-shadow space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text">আমার প্রোফাইল</h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            আপনার ব্যক্তিগত তথ্য এবং লাইব্রেরি যোগাযোগ বিবরণ আপডেট রাখুন
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                পূর্ণ নাম
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                ইমেইল (পরিবর্তনযোগ্য নয়)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712xxxxxx"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                শিক্ষা বর্ষ / ডিপার্টমেন্ট
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="যেমন: ৩য় বর্ষ, সিএসই"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                সাংগঠনিক মান / পদবী
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
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              বর্তমান ঠিকানা (বই হস্তান্তরের জন্য)
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="মেস বা বাসার ঠিকানা, এলাকা, থানা"
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm transition"
            >
              তথ্য আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </UserDashboardLayout>
  );
};
