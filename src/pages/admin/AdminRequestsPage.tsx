import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { USER_POSITION_LABELS, PICKUP_LOCATION_LABELS, BorrowRequest } from '../../types';
import { formatBengaliDate, toBengaliNumber } from '../../lib/utils';
import { CheckCircle2, XCircle, MessageSquare, BookOpen, Clock, AlertTriangle } from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const { requests, approveBorrowRequest, rejectBorrowRequest, confirmAdminHandover } = useLibrary();
  const [handoverLoadingId, setHandoverLoadingId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingReq, setRejectingReq] = useState<BorrowRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('বর্তমান সেশনের জন্য পর্যাপ্ত কপি উপলব্ধ নেই।');

  const filtered = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const handleApprove = async (id: string) => {
    await approveBorrowRequest(id, 'অনুমোদন দেওয়া হয়েছে। বই সংগ্রহের জন্য প্রস্তুত।');
  };

  const handleConfirmReject = async () => {
    if (!rejectingReq) return;
    await rejectBorrowRequest(rejectingReq.id, rejectReason.trim());
    setRejectingReq(null);
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-text">ধার আবেদনসমূহ পরিচালনা</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              পাঠকদের ফিজিক্যাল বই ধার নেওয়ার আবেদন যাচাই, অনুমোদন অথবা বাতিল করুন
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeFilter === f ? 'bg-white text-primary shadow-sm font-bold' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {f === 'all' && 'সব'}
                {f === 'pending' && 'পেন্ডিং'}
                {f === 'approved' && 'অনুমোদিত'}
                {f === 'rejected' && 'বাতিল'}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">আবেদনকারী</th>
                <th className="p-3">পদবী</th>
                <th className="p-3">বইয়ের নাম</th>
                <th className="p-3">ধার ও ফেরত তারিখ</th>
                <th className="p-3">বই সংগ্রহের স্থান</th>
                <th className="p-3">অবস্থা</th>
                <th className="p-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3 font-bold text-brand-text">
                    <div>{req.borrowerName}</div>
                    <span className="text-[10px] text-brand-muted font-normal">{req.address}</span>
                  </td>
                  <td className="p-3 font-semibold text-emerald-800">
                    {USER_POSITION_LABELS[req.position]}
                  </td>
                  <td className="p-3 font-bold text-brand-text">{req.bookTitle}</td>
                  <td className="p-3 text-brand-muted">
                    {req.borrowDate} → {req.dueDate}
                  </td>
                  <td className="p-3 font-medium text-brand-text">
                    {PICKUP_LOCATION_LABELS[req.pickupLocation]}
                    {req.pickupLocationDetails ? ` (${req.pickupLocationDetails})` : ''}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-3 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-bold hover:bg-primary-hover transition"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => setRejectingReq(req)}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 transition"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {!req.adminHandoverConfirmed ? (
                          <button
                            disabled={handoverLoadingId === req.id}
                            onClick={async () => {
                              setHandoverLoadingId(req.id);
                              await confirmAdminHandover(req.id);
                              setHandoverLoadingId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition"
                          >
                            {handoverLoadingId === req.id ? 'নিশ্চিত হচ্ছে...' : 'হস্তান্তর নিশ্চিত'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                            পাঠকের অপেক্ষমাণ
                          </span>
                        )}
                        {req.chatId && (
                          <Link
                            to={`/chat/${req.chatId}`}
                            className="px-2 py-1 rounded bg-primary-soft text-primary font-bold hover:bg-emerald-200 text-[11px] transition inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> চ্যাট
                          </Link>
                        )}
                      </div>
                    ) : req.status === 'borrowed' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                          ধার সক্রিয়
                        </span>
                        {req.chatId && (
                          <Link
                            to={`/chat/${req.chatId}`}
                            className="px-2 py-1 rounded bg-gray-100 text-brand-text hover:bg-gray-200 text-[11px] transition inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> চ্যাট
                          </Link>
                        )}
                      </div>
                    ) : req.chatId ? (
                      <Link
                        to={`/chat/${req.chatId}`}
                        className="px-2.5 py-1 rounded bg-primary-soft text-primary font-bold hover:bg-emerald-200 text-[11px] transition inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> চ্যাট
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-[11px]">কোনো পদক্ষেপ নেই</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reject Reason Modal */}
        {rejectingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>আবেদন বাতিলের কারণ উল্লেখ করুন</span>
              </div>
              <p className="text-xs text-brand-muted">
                আবেদনকারী: <span className="font-bold text-brand-text">{rejectingReq.borrowerName}</span> • বই: <span className="font-bold text-brand-text">{rejectingReq.bookTitle}</span>
              </p>
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  বাতিলের কারণ (পাঠক নোটিফিকেশনে দেখতে পাবেন)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-brand-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectingReq(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-gray-50"
                >
                  ফিরে যান
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  বাতিল নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};
