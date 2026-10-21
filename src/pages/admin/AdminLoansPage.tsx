import React from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatBengaliDate } from '../../lib/utils';

export const AdminLoansPage: React.FC = () => {
  const { loans, confirmAdminReturnReceipt } = useLibrary();

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text">লোন ও রিটার্ন ব্যবস্থাপনা</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            দ্বি-পক্ষীয় নিশ্চিতকরণ (Two-Party Confirmation): পাঠক বই জমা দেওয়ার পর এডমিন কর্তৃক বই গ্রহণ নিশ্চিত করলে স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে কপি যোগ হবে।
          </p>
        </div>

        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">ধারগ্রহীতা</th>
                <th className="p-3">বইয়ের নাম</th>
                <th className="p-3">ধার ও শেষ তারিখ</th>
                <th className="p-3">পাঠক নিশ্চিতকরণ</th>
                <th className="p-3">এডমিন গ্রহণ</th>
                <th className="p-3">সামগ্রিক অবস্থা</th>
                <th className="p-3 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((loan) => {
                const isBorrowerConfirmed = Boolean(loan.borrowerReturnConfirmedAt);
                const isAdminConfirmed = Boolean(loan.adminReturnConfirmedAt);
                const isCompleted = loan.status === 'returned';

                return (
                  <tr key={loan.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3 font-bold text-brand-text">
                      {loan.borrowerName}
                    </td>
                    <td className="p-3 font-semibold text-brand-text">
                      {loan.bookTitle}
                    </td>
                    <td className="p-3 text-brand-muted">
                      {loan.borrowDate} → <span className="font-bold text-amber-800">{loan.dueDate}</span>
                    </td>
                    <td className="p-3">
                      {isBorrowerConfirmed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> নিশ্চিত করেছেন
                        </span>
                      ) : (
                        <span className="text-gray-400">অপেক্ষমান</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isAdminConfirmed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> গ্রহণ সম্পন্ন
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">গ্রহণ বাকি</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          ফেরত সম্পন্ন
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[11px]">
                          সক্রিয় ধার
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!isAdminConfirmed ? (
                        <button
                          onClick={() => confirmAdminReturnReceipt(loan.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition shadow-sm text-[11px] inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> বই গ্রহণ করেছি
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">সংরক্ষিত</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
