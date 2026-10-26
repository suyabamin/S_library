import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { SearchBar } from '../../components/common/SearchBar';
import { BookOpen, Edit, Trash2, Plus, Download, FileText, Check } from 'lucide-react';
import { toBengaliNumber } from '../../lib/utils';

export const AdminBooksPage: React.FC = () => {
  const { books, deleteBook } = useLibrary();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = books.filter((b) => {
    if (selectedCategory !== 'all' && b.categoryId !== selectedCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);
  });

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-text">ডিজিটাল বই ব্যবস্থাপনা</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              লাইব্রেরিতে মোট <span className="font-bold text-primary">{toBengaliNumber(books.length)}</span> টি বই সংরক্ষিত আছে
            </p>
          </div>
          <Link
            to="/admin/books/new"
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" /> নতুন বই যোগ করুন
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="w-full sm:w-80">
          <SearchBar placeholder="বইয়ের নাম দিয়ে খুঁজুন..." onSearch={setSearch} />
        </div>

        {/* Table of Books */}
        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">প্রচ্ছদ ও নাম</th>
                <th className="p-3">লেখক</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3">ফিজিক্যাল স্টক</th>
                <th className="p-3">ডাউনলোড</th>
                <th className="p-3 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-primary m-auto mt-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/books/${book.id}`} className="font-bold text-brand-text hover:text-primary transition line-clamp-1">
                          {book.title}
                        </Link>
                        <span className="text-[10px] text-brand-muted">{book.fileSizeMb ? `${toBengaliNumber(book.fileSizeMb)} MB` : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-brand-muted">{book.author || 'অনুল্লেখিত'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-100">
                      {book.categoryName || 'সিলেবাস'}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-brand-text">
                    {toBengaliNumber(book.availablePhysicalCopies ?? 0)} / {toBengaliNumber(book.totalPhysicalCopies ?? 0)}
                  </td>
                  <td className="p-3">
                    {book.downloadAllowed ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> উন্মুক্ত
                      </span>
                    ) : (
                      <span className="text-gray-400">সংরক্ষিত</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/reader/${book.id}`}
                        className="p-1.5 rounded hover:bg-emerald-50 text-primary"
                        title="অনলাইনে পড়ুন"
                      >
                        <BookOpen className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/books/${book.id}/edit`}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${book.title}" বইটি লাইব্রেরি থেকে মুছে ফেলতে চান?`)) {
                            deleteBook(book.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
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
