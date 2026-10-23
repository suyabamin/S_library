import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { USER_POSITION_LABELS, PICKUP_LOCATION_LABELS } from '../../types';
import { formatBengaliDate } from '../../lib/utils';
import { BookOpen, Calendar, MapPin, MessageSquare, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Check } from 'lucide-react';

export const BorrowRequestDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { requests, confirmAdminHandover, confirmBorrowerReceipt } = useLibrary();
  const { user, isAdmin } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  const req = requests.find((r) => r.id === requestId);

  if (!req) {
    return (
      <UserDashboardLayout>
        <div className="p-8 text-center bg-white rounded-card border border-brand-border">
          <p className="text-sm text-brand-muted">আবেদনটি খুঁজে পাওয়া যায়নি।</p>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Link to="/my-requests" className="p-1 rounded hover:bg-gray-100 text-brand-muted">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-brand-text">আবেদনের বিস্তারিত বিবরণ</h1>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-brand-border">
            <h3 className="font-bold text-brand-text text-sm border-b pb-2">বই ও ধার সংক্রান্ত তথ্য</h3>
            <div>
              <span className="text-brand-muted block">বইয়ের নাম:</span>
              <span className="font-bold text-brand-text">{req.bookTitle}</span>
            </div>
            <div>
              <span className="text-brand-muted block">ধার নেওয়ার তারিখ:</span>
              <span className="font-semibold text-brand-text">{req.borrowDate}</span>
            </div>
            <div>
              <span className="text-brand-muted block">ফেরত দেওয়ার তারিখ:</span>
              <span className="font-bold text-amber-800">{req.dueDate}</span>
            </div>
            <div>
              <span className="text-brand-muted block">বই সংগ্রহের স্থান:</span>
              <span className="font-semibold text-brand-text">
                {PICKUP_LOCATION_LABELS[req.pickupLocation]}
                {req.pickupLocationDetails ? ` (${req.pickupLocationDetails})` : ''}
              </span>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-brand-border">
            <h3 className="font-bold text-brand-text text-sm border-b pb-2">আবেদনকারী তথ্য</h3>
            <div>
              <span className="text-brand-muted block">নাম:</span>
              <span className="font-bold text-brand-text">{req.borrowerName}</span>
            </div>
            <div>
              <span className="text-brand-muted block">সাংগঠনিক মান:</span>
              <span className="font-semibold text-emerald-800">{USER_POSITION_LABELS[req.position]}</span>
            </div>
            <div>
              <span className="text-brand-muted block">ঠিকানা:</span>
              <span className="font-semibold text-brand-text">{req.address}</span>
            </div>
            <div>
              <span className="text-brand-muted block">আবেদনের সময়:</span>
              <span className="text-brand-text">{formatBengaliDate(req.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Physical Handover & Receipt Confirmation Section */}
        {req.status === 'approved' && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm text-brand-text">
                বই হস্তান্তর ও প্রাপ্তি নিশ্চিতকরণ (উভয় পক্ষের কনফার্মেশন)
              </h3>
            </div>
            <p className="text-xs text-brand-muted">
              বইটি সক্রিয় ধারে যুক্ত করতে এডমিন হস্তান্তর এবং পাঠক প্রাপ্তি উভয় নিশ্চিত করতে হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-muted block">এডমিন হস্তান্তর:</span>
                  <span className="text-xs font-bold text-brand-text">
                    {req.adminHandoverConfirmed ? '✅ সম্পন্ন হয়েছে' : '⏳ অপেক্ষমাণ'}
                  </span>
                </div>
                {isAdmin && !req.adminHandoverConfirmed && (
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      await confirmAdminHandover(req.id);
                      setActionLoading(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    হস্তান্তর নিশ্চিত করুন
                  </button>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-muted block">পাঠক প্রাপ্তি:</span>
                  <span className="text-xs font-bold text-brand-text">
                    {req.borrowerReceivedConfirmed ? '✅ সম্পন্ন হয়েছে' : '⏳ অপেক্ষমাণ'}
                  </span>
                </div>
                {user?.uid === req.borrowerUid && !req.borrowerReceivedConfirmed && (
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      await confirmBorrowerReceipt(req.id);
                      setActionLoading(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition"
                  >
                    বইটি হাতে পেয়েছি
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {req.status === 'borrowed' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">বই হস্তান্তর সফলভাবে সম্পন্ন হয়েছে</h4>
                <p className="text-xs text-emerald-800">বইটি আপনার "আমার সক্রিয় ধার"-এ সংরক্ষিত রয়েছে।</p>
              </div>
            </div>
            <Link
              to="/my-loans"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              সক্রিয় ধার দেখুন
            </Link>
          </div>
        )}

        {req.chatId && (
          <div className="p-4 rounded-xl bg-primary-soft border border-emerald-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-emerald-950">লাইব্রেরি চ্যাট সক্রিয় রয়েছে</h4>
              <p className="text-xs text-brand-muted">দায়িত্বশীল ভাইয়ের সাথে যোগাযোগ করতে চ্যাটে যান।</p>
            </div>
            <Link
              to={`/chat/${req.chatId}`}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> চ্যাট করুন
            </Link>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
