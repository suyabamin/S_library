import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Clock,
  Bell,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { USER_POSITION_LABELS } from '../../types';
import { formatBengaliDate, toBengaliNumber } from '../../lib/utils';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { requests, loans, notifications, confirmBorrowerReturn } = useLibrary();

  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'return_requested');
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-card border border-brand-border p-6 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2">
              <span>স্বাগতম, {user?.displayName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              আপনার রিডিং এবং লাইব্রেরি সংক্রান্ত তথ্য ও সাম্প্রতিক কার্যক্রম
            </p>
          </div>
          <Link
            to="/hard-copy"
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-sm transition flex items-center gap-1.5"
          >
            <BookMarked className="w-4 h-4" />
            <span>নতুন বই ধার নিন</span>
          </Link>
        </div>

        {/* 4 Stat Cards matching Reference Screen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: মোট বই */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">মোট বই</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-brand-text mt-2 font-mono">
              {toBengaliNumber(loans.length + requests.length)}
            </p>
            <span className="text-[11px] text-emerald-700">লাইব্রেরি রেকর্ড</span>
          </div>

          {/* Card 2: পড়তেছেন বই */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">পড়তেছেন বই</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-2 font-mono">
              {toBengaliNumber(activeLoans.length)}
            </p>
            <span className="text-[11px] text-blue-600">বর্তমানে সক্রিয় ধার</span>
          </div>

          {/* Card 3: রিটার্ন বাকি */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">রিটার্ন বাকি</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">
              {toBengaliNumber(activeLoans.length)}
            </p>
            <span className="text-[11px] text-amber-600">ফেরত দেওয়ার অপেক্ষায়</span>
          </div>

          {/* Card 4: নোটিফিকেশন */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">নোটিফিকেশন</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-2 font-mono">
              {toBengaliNumber(unreadNotifs.length)}
            </p>
            <span className="text-[11px] text-rose-500">অপঠিত বিজ্ঞপ্তি</span>
          </div>
        </div>

        {/* Two-Column Area: Recent Activity & Right Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: সাম্প্রতিক কার্যক্রম */}
          <div className="lg:col-span-2 bg-white rounded-card border border-brand-border p-5 card-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h2 className="font-bold text-base text-brand-text">সাম্প্রতিক কার্যক্রম</h2>
              <Link to="/my-requests" className="text-xs font-bold text-primary hover:underline">
                সবগুলো দেখুন →
              </Link>
            </div>

            {requests.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">এখনো কোনো আবেদন করা হয়নি।</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.slice(0, 4).map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center text-primary">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-brand-text truncate">{req.bookTitle}</h4>
                        <p className="text-xs text-brand-muted">
                          আবেদনের তারিখ: {formatBengaliDate(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.chatId && (
                        <Link
                          to={`/chat/${req.chatId}`}
                          className="px-2.5 py-1 rounded bg-primary-soft text-primary text-xs font-bold hover:bg-emerald-200 transition"
                        >
                          চ্যাট
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Borrowing Cards with Return Button */}
            {activeLoans.length > 0 && (
              <div className="mt-6 pt-4 border-t border-brand-border space-y-3">
                <h3 className="font-bold text-sm text-brand-text">বর্তমানে ধার নেওয়া বই:</h3>
                {activeLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-brand-text">{loan.bookTitle}</h4>
                      <p className="text-xs text-brand-muted mt-0.5">
                        ধার নেওয়ার তারিখ: {loan.borrowDate} • ফেরত দেওয়ার শেষ তারিখ:{' '}
                        <span className="font-bold text-amber-800">{loan.dueDate}</span>
                      </p>
                    </div>

                    {loan.borrowerReturnConfirmedAt ? (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                        ✓ ফেরত আবেদন জমা হয়েছে (এডমিন কনফার্মেশন অপেক্ষমান)
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmBorrowerReturn(loan.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-sm transition flex items-center gap-1.5 shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>বই ফেরত দিয়েছি</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: প্রোফাইল তথ্য matching Reference */}
          <div className="bg-white rounded-card border border-brand-border p-5 card-shadow space-y-4">
            <h3 className="font-bold text-base text-brand-text pb-2 border-b border-brand-border">
              প্রোফাইল তথ্য
            </h3>

            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 rounded-full bg-primary-soft text-primary font-extrabold text-2xl flex items-center justify-center border-2 border-emerald-200 mb-2">
                {user?.displayName ? user.displayName.slice(0, 1) : 'U'}
              </div>
              <h4 className="font-bold text-base text-brand-text">{user?.displayName}</h4>
              <p className="text-xs text-primary font-bold">
                {user?.position ? USER_POSITION_LABELS[user.position] : 'কর্মী'}
                {user?.academicYear ? `, ${user.academicYear}` : ''}
              </p>
            </div>

            <div className="space-y-2.5 text-xs border-t border-brand-border pt-3">
              <div>
                <span className="text-brand-muted block">ইমেইল:</span>
                <span className="font-bold text-brand-text">{user?.email}</span>
              </div>
              <div>
                <span className="text-brand-muted block">মোবাইল:</span>
                <span className="font-bold text-brand-text">{user?.phone || '০১৭১২-XXXXXX'}</span>
              </div>
              <div>
                <span className="text-brand-muted block">ঠিকানা:</span>
                <span className="font-bold text-brand-text">{user?.address || 'ভাটারা, ঢাকা (UIU সংলগ্ন)'}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/profile"
                className="w-full py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition block text-center"
              >
                প্রোফাইল সম্পাদন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};
