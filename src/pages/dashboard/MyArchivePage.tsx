import React from 'react';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { EmptyState } from '../../components/common/EmptyState';
import { History, BookOpen, CheckCircle } from 'lucide-react';
import { formatBengaliDate } from '../../lib/utils';

export const MyArchivePage: React.FC = () => {
  const { loans } = useLibrary();

  const returnedLoans = loans.filter((l) => l.status === 'returned');

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>আমার ধার আর্কাইভ</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            পূর্বে সম্পন্নকৃত ও সফলভাবে ফেরত দেওয়া বইসমূহের স্থায়ী রেকর্ড
          </p>
        </div>

        {returnedLoans.length === 0 ? (
          <EmptyState
            title="আর্কাইভে কোনো সম্পন্ন রেকর্ড নেই"
            description="আপনার পূর্বে সম্পন্নকৃত কোনো ধারের তথ্য এখনো নথিবদ্ধ হয়নি।"
          />
        ) : (
          <div className="space-y-3">
            {returnedLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-xl border border-brand-border bg-gray-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-12 rounded bg-emerald-100 flex items-center justify-center text-primary font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-text">{loan.bookTitle}</h3>
                    <p className="text-brand-muted">
                      ধার: {loan.borrowDate} • ফেরত: {loan.completedAt ? formatBengaliDate(loan.completedAt) : 'সম্পন্ন'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>উভয় পক্ষ কর্তৃক ফেরত সম্পন্ন</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
