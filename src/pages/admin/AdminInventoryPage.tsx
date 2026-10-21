import React from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { Boxes, BookOpen, Plus, AlertCircle } from 'lucide-react';
import { toBengaliNumber } from '../../lib/utils';

export const AdminInventoryPage: React.FC = () => {
  const { books, updateBook } = useLibrary();

  const handleStockAdjust = (bookId: string, delta: number) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const current = book.availablePhysicalCopies ?? 0;
    const total = book.totalPhysicalCopies ?? current;
    const newAvail = Math.max(0, current + delta);
    const newTotal = Math.max(newAvail, total + delta);

    updateBook(bookId, {
      isPhysicalAvailable: newTotal > 0,
      availablePhysicalCopies: newAvail,
      totalPhysicalCopies: newTotal,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" />
              <span>ফিজিক্যাল ইনভেন্টরি ও কপি স্টক</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              লাইব্রেরির হার্ড কপি বইয়ের বাস্তব সংখ্যা ও উপলব্ধতা সমন্বয় করুন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">বইয়ের নাম</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3">উপলব্ধ কপি</th>
                <th className="p-3">মোট কপি</th>
                <th className="p-3 text-right">স্টক পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3 font-bold text-brand-text">{b.title}</td>
                  <td className="p-3 text-brand-muted">{b.categoryName}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {toBengaliNumber(b.availablePhysicalCopies ?? 0)} টি
                  </td>
                  <td className="p-3 font-mono font-bold text-brand-text">
                    {toBengaliNumber(b.totalPhysicalCopies ?? 0)} টি
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleStockAdjust(b.id, -1)}
                        disabled={(b.availablePhysicalCopies ?? 0) <= 0}
                        className="w-7 h-7 rounded border border-brand-border hover:bg-gray-100 font-bold disabled:opacity-40"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleStockAdjust(b.id, 1)}
                        className="w-7 h-7 rounded bg-primary text-white hover:bg-primary-hover font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
