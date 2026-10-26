import React from 'react';
import { Link } from 'react-router-dom';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { formatBengaliDate, toBengaliNumber } from '../../lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const { books, requests, loans, approveBorrowRequest, rejectBorrowRequest } = useLibrary();

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'return_requested');

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-card border border-brand-border p-6 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">
              অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              শিবির লাইব্রেরি UIU থানা শাখার সার্বিক পরিচালনা ও নিয়ন্ত্রণ কেন্দ্র
            </p>
          </div>
          <Link
            to="/admin/books/new"
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-sm transition"
          >
            + নতুন বই যোগ করুন
          </Link>
        </div>

        {/* 4 Stat Cards matching Reference Screen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: মোট বই */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">মোট বই</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-brand-text mt-2 font-mono">
              {toBengaliNumber(books.length)}
            </p>
            <span className="text-[11px] text-blue-600">ডিজিটাল ক্যাটালগ</span>
          </div>

          {/* Card 2: জমা অনুরোধ */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">জমা অনুরোধ</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">
              {toBengaliNumber(pendingRequests.length)}
            </p>
            <span className="text-[11px] text-amber-600">যাচাইয়ের অপেক্ষায়</span>
          </div>

          {/* Card 3: ধার অনুমোদন */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">ধার অনুমোদন</span>
              <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary mt-2 font-mono">
              {toBengaliNumber(approvedRequests.length)}
            </p>
            <span className="text-[11px] text-primary">অনুমোদিত আবেদন</span>
          </div>

          {/* Card 4: রিটার্ন বাকি */}
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-muted">রিটার্ন বাকি</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-2 font-mono">
              {toBengaliNumber(activeLoans.length)}
            </p>
            <span className="text-[11px] text-rose-500">গ্রাহকের কাছে আছে</span>
          </div>
        </div>

        {/* Statistical Chart Section matching Reference */}
        <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-brand-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>বই ধার হওয়ার পরিসংখ্যান</span>
              </h3>
              <p className="text-xs text-brand-muted">বিগত মাসের রিডিং ও ঋণ বিশ্লেষণ</p>
            </div>
            <span className="text-xs bg-primary-soft text-primary font-bold px-3 py-1 rounded-full">
              চলতি সেশন
            </span>
          </div>

          {/* Real responsive SVG Area Chart */}
          <div className="w-full h-48 sm:h-56 pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A8DC" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00A8DC" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#E5E7EB" strokeDasharray="3 3" />
              {/* Filled Area */}
              <path
                d="M 10 120 Q 80 110, 150 60 T 300 40 T 420 80 T 490 20 L 490 140 L 10 140 Z"
                fill="url(#chartGrad)"
              />
              {/* Polyline */}
              <path
                d="M 10 120 Q 80 110, 150 60 T 300 40 T 420 80 T 490 20"
                fill="none"
                stroke="#00A8DC"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Data Points */}
              <circle cx="150" cy="60" r="4.5" fill="#00A8DC" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="300" cy="40" r="4.5" fill="#00A8DC" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="490" cy="20" r="4.5" fill="#00A8DC" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[11px] text-gray-400 pt-2 px-2">
              <span>জানুয়ারি</span>
              <span>ফেব্রুয়ারি</span>
              <span>মার্চ</span>
              <span>এপ্রিল</span>
              <span>মে</span>
              <span>জুন</span>
            </div>
          </div>
        </div>

        {/* Recent Requests Table matching Reference */}
        <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="font-bold text-base text-brand-text">সাম্প্রতিক আবেদন ও অনুমোদন</h3>
            <Link to="/admin/requests" className="text-xs font-bold text-primary hover:underline">
              সকল আবেদন দেখুন →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                <tr>
                  <th className="p-3">পাঠক</th>
                  <th className="p-3">বইয়ের নাম</th>
                  <th className="p-3">ধার ও ফেরত</th>
                  <th className="p-3">অবস্থা</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3 font-bold text-brand-text">
                      <div>{req.borrowerName}</div>
                      <span className="text-[10px] text-brand-muted font-normal">{req.address}</span>
                    </td>
                    <td className="p-3 font-semibold text-brand-text">
                      {req.bookTitle}
                    </td>
                    <td className="p-3 text-brand-muted">
                      {req.borrowDate} → {req.dueDate}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-3 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveBorrowRequest(req.id)}
                            className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-bold hover:bg-primary-hover transition"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => rejectBorrowRequest(req.id, 'স্টক সীমাবদ্ধতা')}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 transition"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : req.chatId ? (
                        <Link
                          to={`/chat/${req.chatId}`}
                          className="px-2.5 py-1 rounded bg-primary-soft text-primary font-bold hover:bg-emerald-200 text-[11px] transition inline-block"
                        >
                          চ্যাটে যান
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-[11px]">সম্পন্ন</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
