import React from 'react';
import { Link } from 'react-router-dom';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen, Calendar, RotateCcw, CheckCircle2, MessageSquare } from 'lucide-react';

export const MyLoansPage: React.FC = () => {
  const { loans, confirmBorrowerReturn, chatConversations } = useLibrary();
  const { user } = useAuth();

  const myLoans = loans.filter((l) => !user || l.borrowerUid === user.uid);
  const activeLoans = myLoans.filter((l) => l.status === 'active' || l.status === 'return_requested');

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text">আমার সক্রিয় ধার (বই)</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            বর্তমানে আপনার নিকট থাকা বই এবং ফেরত নিশ্চিতকরণ প্রক্রিয়া
          </p>
        </div>

        {activeLoans.length === 0 ? (
          <EmptyState
            title="বর্তমানে কোনো বই ধার নেওয়া নেই"
            description="আপনার কাছে এই মুহূর্তে লাইব্রেরির কোনো সক্রিয় বই নেই।"
            actionLabel="হার্ড কপি ক্যাটালগ দেখুন"
            onAction={() => (window.location.href = '/hard-copy')}
          />
        ) : (
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-5 rounded-xl border border-brand-border bg-emerald-50/30 hover:bg-emerald-50/50 transition card-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-md bg-emerald-950/10 overflow-hidden shrink-0">
                      {loan.bookCover ? (
                        <img src={loan.bookCover} alt={loan.bookTitle} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-primary m-auto mt-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-brand-text">{loan.bookTitle}</h3>
                      <p className="text-xs text-brand-muted mt-0.5">
                        ধার নেওয়ার তারিখ: <span className="font-semibold text-brand-text">{loan.borrowDate}</span>
                      </p>
                      <p className="text-xs text-brand-muted">
                        ফেরত দেওয়ার নির্ধারিত তারিখ: <span className="font-bold text-amber-800">{loan.dueDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Two-Party Handshake Action */}
                  <div className="flex items-center gap-2">
                    {loan.borrowerReturnConfirmedAt ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ফেরত নিশ্চিত করেছেন (এডমিনের গ্রহণ অপেক্ষমান)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => confirmBorrowerReturn(loan.id)}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>বই ফেরত দিয়েছি</span>
                      </button>
                    )}

                    <Link
                      to="/chat"
                      className="p-2 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-text text-xs"
                      title="দায়িত্বশীলের সাথে যোগাযোগ"
                    >
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
