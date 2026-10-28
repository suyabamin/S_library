import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useSyllabus } from '../context/SyllabusContext';
import { SyllabusPage } from '../components/syllabus/SyllabusPage';
import { BookGrid } from '../components/book/BookGrid';
import { ChevronRight, Folder, BookOpen } from 'lucide-react';
import { toBengaliNumber } from '../lib/utils';
import { SYLLABUS_CATEGORY_SLUGS } from '../types';

export const CategoryListingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, books, getCategoryBySlug } = useLibrary();
  const { getSyllabusByCategorySlug, loading: syllabusLoading } = useSyllabus();

  const category = getCategoryBySlug(slug || '');
  const isSyllabusCategory = SYLLABUS_CATEGORY_SLUGS.includes(slug as any);
  const syllabus = isSyllabusCategory ? getSyllabusByCategorySlug(slug || '') : undefined;
  const categoryBooks = books.filter((b) => b.categoryId === category?.id);

  if (!category && !isSyllabusCategory) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-text mb-2">ক্যাটাগরি খুঁজে পাওয়া যায়নি</h2>
        <Link
          to="/books"
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
        >
          ক্যাটালগে ফিরে যান
        </Link>
      </div>
    );
  }

  // If this is a syllabus category and syllabus data exists, render Syllabus view
  if (isSyllabusCategory && syllabus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
          <Link to="/" className="hover:text-primary transition">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/books" className="hover:text-primary transition">ক্যাটালগ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-primary">{syllabus.title}</span>
        </nav>

        <SyllabusPage syllabus={syllabus} />

        {/* If there are also books directly attached to this category in the catalog */}
        {categoryBooks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-brand-border space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-brand-text">সংযুক্ত ক্যাটালগ বইসমূহ</h2>
            </div>
            <BookGrid
              books={categoryBooks}
              showBorrowAction
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link to="/" className="hover:text-primary transition">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/books" className="hover:text-primary transition">ক্যাটালগ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-primary">{category?.nameBn || slug}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-brand-text">{category?.nameBn || slug}</h1>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            এই ক্যাটাগরিতে মোট <span className="font-bold text-primary">{toBengaliNumber(categoryBooks.length)}</span> টি বই রয়েছে
          </p>
        </div>

        <Link
          to="/books"
          className="px-4 py-2 rounded-lg border border-brand-border hover:bg-gray-50 text-xs font-semibold text-brand-text"
        >
          সকল বই দেখুন
        </Link>
      </div>

      <BookGrid
        books={categoryBooks}
        showBorrowAction
        emptyTitle="এই ক্যাটাগরিতে এখনো কোনো বই যোগ করা হয়নি"
        emptyDescription="খুব শীঘ্রই এই সিলেবাসের বইসমূহ ডিজিটাল ও ফিজিক্যাল লাইব্রেরিতে উন্মুক্ত করা হবে।"
      />
    </div>
  );
};
