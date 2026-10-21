import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  BookMarked,
  Calendar,
  MapPin,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Book, UserPosition, PickupLocation, USER_POSITION_LABELS, PICKUP_LOCATION_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { toBengaliNumber } from '../../lib/utils';

interface BorrowRequestModalProps {
  book: Book;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BorrowRequestModal: React.FC<BorrowRequestModalProps> = ({
  book,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { submitBorrowRequest } = useLibrary();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [borrowerName, setBorrowerName] = useState(user?.displayName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [position, setPosition] = useState<UserPosition>(user?.position || 'worker');

  // Dates
  const today = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [borrowDate, setBorrowDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDue);

  // Pickup location
  const [pickupLocation, setPickupLocation] = useState<PickupLocation>('house');
  const [pickupDetails, setPickupDetails] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-card max-w-md w-full p-6 text-center shadow-2xl border border-brand-border animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-brand-text mb-2">লগইন প্রয়োজন</h3>
          <p className="text-sm text-brand-muted mb-6">
            হার্ড কপি বই ধার নেওয়ার জন্য আপনাকে প্রথমে আপনার অ্যাকাউন্টে লগইন করতে হবে।
          </p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-brand-border text-sm font-semibold text-brand-text hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm"
            >
              লগইন করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন');
      return;
    }
    if (!address.trim()) {
      setError('অনুগ্রহ করে আপনার পূর্ণ ঠিকানা প্রদান করুন');
      return;
    }
    if (new Date(dueDate) <= new Date(borrowDate)) {
      setError('ফেরত দেওয়ার তারিখ অবশ্যই ধার নেওয়ার তারিখের পরবর্তী হতে হবে');
      return;
    }
    if (pickupLocation === 'other' && !pickupDetails.trim()) {
      setError('অন্য স্থান নির্বাচন করলে বিস্তারিত স্থান উল্লেখ করতে হবে');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitBorrowRequest({
        bookId: book.id,
        borrowerName: borrowerName.trim(),
        address: address.trim(),
        position,
        borrowDate,
        dueDate,
        pickupLocation,
        pickupLocationDetails: pickupLocation === 'other' ? pickupDetails.trim() : undefined,
      });
      setStep(3);
    } catch (err) {
      setError((err as Error).message || 'আবেদন জমা দিতে সমস্যা হয়েছে');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-brand-border my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-brand-text text-base">হার্ড কপি ধার করুন</h3>
              <p className="text-xs text-brand-muted truncate max-w-[260px]">{book.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-brand-muted hover:text-brand-text hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper matching Reference */}
        <div className="py-4 border-b border-brand-border/60">
          <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ১
              </span>
              তথ্য
            </div>
            <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ২
              </span>
              বিবরণী
            </div>
            <div className={`h-0.5 w-12 ${step === 3 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ৩
              </span>
              সমাপ্তি
            </div>
          </div>
        </div>

        {/* Step 1: Form Fields */}
        {step === 1 && (
          <form onSubmit={handleNextToReview} className="space-y-4 pt-4 text-sm">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="আপনার পূর্ণ নাম"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  পদবী <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as UserPosition)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
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
                ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="মেস / বাসা নম্বর, এলাকা, থানা"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  ধার নেওয়ার তারিখ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  ফেরত দেওয়ার তারিখ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  min={borrowDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                কোথা থেকে বই রিসিভ করবেন? <span className="text-rose-500">*</span>
              </label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value as PickupLocation)}
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
              >
                {(Object.keys(PICKUP_LOCATION_LABELS) as PickupLocation[]).map((loc) => (
                  <option key={loc} value={loc}>
                    {PICKUP_LOCATION_LABELS[loc]}
                  </option>
                ))}
              </select>
            </div>

            {pickupLocation === 'other' && (
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  স্থানের বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupDetails}
                  onChange={(e) => setPickupDetails(e.target.value)}
                  placeholder="যেমন: ক্যাম্পাসের লাইব্রেরির সামনে বা নির্দিষ্ট স্থান"
                  className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
            )}

            <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-semibold text-brand-text hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm"
              >
                পরবর্তী ধাপ →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <div className="pt-4 space-y-4 text-sm">
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 space-y-2">
              <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 text-xs uppercase tracking-wider">
                আবেদনের সারসংক্ষেপ
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-brand-muted">বইয়ের নাম:</span>
                  <p className="font-bold text-brand-text">{book.title}</p>
                </div>
                <div>
                  <span className="text-brand-muted">আবেদনকারী:</span>
                  <p className="font-bold text-brand-text">{borrowerName} ({USER_POSITION_LABELS[position]})</p>
                </div>
                <div>
                  <span className="text-brand-muted">ধার নেওয়ার তারিখ:</span>
                  <p className="font-semibold text-brand-text">{borrowDate}</p>
                </div>
                <div>
                  <span className="text-brand-muted">ফেরতের তারিখ:</span>
                  <p className="font-semibold text-brand-text">{dueDate}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-brand-muted">গ্রহণের স্থান:</span>
                  <p className="font-semibold text-brand-text">
                    {PICKUP_LOCATION_LABELS[pickupLocation]} {pickupDetails ? `(${pickupDetails})` : ''}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-brand-muted">ঠিকানা:</span>
                  <p className="font-semibold text-brand-text">{address}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-brand-muted">
              * আবেদন জমা দেওয়ার পর লাইব্রেরি দায়িত্বশীল এটি যাচাই করে অনুমোদন প্রদান করবেন। অনুমোদনের পর সরাসরি চ্যাটের মাধ্যমে যোগাযোগ করা যাবে।
            </p>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-semibold text-brand-text hover:bg-gray-50"
              >
                ← পরিবর্তন করুন
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm disabled:opacity-50"
              >
                {submitting ? 'জমা হচ্ছে...' : 'রিকোয়েস্ট করুন'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="pt-6 pb-2 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-brand-text">আবেদন সফলভাবে জমা হয়েছে!</h4>
            <p className="text-sm text-brand-muted max-w-sm mx-auto">
              "{book.title}" বইটির জন্য আপনার ধার নেওয়ার আবেদনটি গ্রহণ করা হয়েছে। দায়িত্বশীল ভাই শীঘ্রই এটি যাচাই করে চ্যাটে যোগাযোগ করবেন।
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onSuccess?.();
                  navigate('/dashboard');
                }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm"
              >
                ড্যাশবোর্ডে দেখুন
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-brand-border text-sm font-semibold text-brand-text hover:bg-gray-50"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
