import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen, MessageSquare, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { PICKUP_LOCATION_LABELS } from '../../types';
import { formatBengaliDate } from '../../lib/utils';

export const MyRequestsPage: React.FC = () => {
  const { requests, confirmBorrowerReceipt } = useLibrary();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const myRequests = requests.filter((r) => !user || r.borrowerUid === user.uid);

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div>
            <h1 className="text-xl font-bold text-brand-text">আমার ধার আবেদনসমূহ</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              হার্ড কপি বইয়ের জন্য আপনার জমাকৃত সকল আবেদন ও বর্তমান অবস্থা
            </p>
          </div>
          <Link
            to="/hard-copy"
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
          >
            + নতুন আবেদন
          </Link>
        </div>

        {myRequests.length === 0 ? (
          <EmptyState
            title="কোনো আবেদন পাওয়া যায়নি"
            description="আপনি এখনো কোনো বইয়ের জন্য আবেদন করেননি।"
            actionLabel="বইয়ের তালিকা দেখুন"
            onAction={() => (window.location.href = '/hard-copy')}
          />
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-xl border border-brand-border bg-gray-50/50 hover:bg-white transition card-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-primary font-bold flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <Link to={`/borrow/request/${req.id}`} className="font-bold text-base text-brand-text hover:text-primary transition">
                        {req.bookTitle}
                      </Link>
                      <p className="text-xs text-brand-muted">
                        আবেদনের সময়: {formatBengaliDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                    {req.chatId && (
                      <Link
                        to={`/chat/${req.chatId}`}
                        className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition flex items-center gap-1 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> চ্যাট করুন
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-brand-border/60 text-xs text-brand-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>ধার: {req.borrowDate} → ফেরত: {req.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>স্থান: {PICKUP_LOCATION_LABELS[req.pickupLocation]}</span>
                  </div>
                  {req.decisionReason && (
                    <div className="sm:col-span-3 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                      <span className="font-bold">এডমিনের মন্তব্য:</span> {req.decisionReason}
                    </div>
                  )}
                </div>

                {/* Handover confirmation bar */}
                {req.status === 'approved' && (
                  <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {req.adminHandoverConfirmed
                          ? '✅ এডমিন বইটি হস্তান্তর করেছেন। আপনি পেয়ে থাকলে নিশ্চিত করুন।'
                          : 'এডমিন কর্তৃক বই হস্তান্তরের অপেক্ষা চলছে...'}
                      </span>
                    </div>
                    {!req.borrowerReceivedConfirmed ? (
                      <button
                        disabled={loadingId === req.id}
                        onClick={async () => {
                          setLoadingId(req.id);
                          await confirmBorrowerReceipt(req.id);
                          setLoadingId(null);
                        }}
                        className="px-3 py-1.5 rounded-md bg-primary text-white font-bold hover:bg-primary-hover transition self-start sm:self-auto shrink-0"
                      >
                        {loadingId === req.id ? 'নিশ্চিত হচ্ছে...' : 'বইটি হাতে পেয়েছি'}
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded">
                        প্রাপ্তি নিশ্চিত (এডমিনের চূড়ান্ত অপেক্ষমাণ)
                      </span>
                    )}
                  </div>
                )}

                {req.status === 'borrowed' && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-medium">বই হস্তান্তর সফল। ধারটি সক্রিয় আছে।</span>
                    <Link to="/my-loans" className="text-primary font-bold hover:underline">
                      সক্রিয় ধার দেখুন →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
