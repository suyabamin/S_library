import React from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { FolderTree, Check, Plus } from 'lucide-react';
import { toBengaliNumber } from '../../lib/utils';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, books } = useLibrary();

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-primary" />
            <span>ক্যাটাগরি সমূহ</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            অনলাইন লাইব্রেরিতে অন্তর্ভুক্ত সকল নির্ধারিত সিলেবাস ও বিষয়ভিত্তিক ক্যাটাগরি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = books.filter((b) => b.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-brand-border bg-gray-50/60 hover:bg-white transition card-shadow space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-brand-text">{cat.nameBn}</h3>
                  <span className="text-xs font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                    {toBengaliNumber(count)} টি বই
                  </span>
                </div>
                <p className="text-xs text-brand-muted font-mono">{cat.slug}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1">
                  <Check className="w-3.5 h-3.5" /> সক্রিয় ক্যাটাগরি
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
