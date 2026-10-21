import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { CategorySidebar } from '../components/book/CategorySidebar';
import { BookGrid } from '../components/book/BookGrid';
import { SearchBar } from '../components/common/SearchBar';
import { ChevronRight, Filter } from 'lucide-react';
import { toBengaliNumber } from '../lib/utils';

export const BooksPage: React.FC = () => {
  const { books, categories } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategorySlug = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active Category
  const activeCategory = useMemo(() => {
    if (selectedCategorySlug === 'all') return { nameBn: 'সবগুলো বই', slug: 'all' };
    if (selectedCategorySlug === 'latest') return { nameBn: 'সর্বশেষ সংযোজিত বই', slug: 'latest' };
    return categories.find((c) => c.slug === selectedCategorySlug) || { nameBn: 'বইসমূহ', slug: 'all' };
  }, [selectedCategorySlug, categories]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Category filter
      if (selectedCategorySlug === 'latest') {
        // filter or sort
      } else if (selectedCategorySlug !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategorySlug);
        if (cat && book.categoryId !== cat.id) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author?.toLowerCase().includes(q);
        const matchesCategory = book.categoryName?.toLowerCase().includes(q);
        return matchesTitle || matchesAuthor || matchesCategory;
      }

      return true;
    });
  }, [books, selectedCategorySlug, searchQuery, categories]);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
    setMobileFilterOpen(false);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q) {
      searchParams.set('q', q);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb matching Reference */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link to="/" className="hover:text-primary transition">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/books" className="hover:text-primary transition">ক্যাটালগ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-primary">{activeCategory.nameBn}</span>
      </nav>

      {/* Main Two-Column Layout matching Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Category Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <CategorySidebar
              activeCategorySlug={selectedCategorySlug}
              onSelectCategory={handleSelectCategory}
            />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Bar with Title and Search */}
          <div className="bg-white rounded-card border border-brand-border p-4 sm:p-6 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text">
                {activeCategory.nameBn}
              </h1>
              <p className="text-xs text-brand-muted mt-1">
                মোট বই: <span className="font-bold text-primary">{toBengaliNumber(filteredBooks.length)}</span> টি
              </p>
            </div>

            <div className="w-full sm:w-72 flex items-center gap-2">
              <div className="flex-1">
                <SearchBar
                  placeholder="বইয়ের নাম দিয়ে খুঁজুন..."
                  defaultValue={searchQuery}
                  onSearch={handleSearch}
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2.5 rounded-lg border border-brand-border bg-gray-50 text-brand-text hover:bg-gray-100"
                aria-label="ক্যাটাগরি ফিল্টার"
              >
                <Filter className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-white rounded-card border border-brand-border p-4 shadow-md">
              <CategorySidebar
                activeCategorySlug={selectedCategorySlug}
                onSelectCategory={handleSelectCategory}
              />
            </div>
          )}

          {/* Book Grid */}
          <BookGrid
            books={filteredBooks}
            showBorrowAction
            emptyTitle="এই ক্যাটাগরিতে কোনো বই পাওয়া যায়নি"
            emptyDescription="অনুগ্রহ করে অন্য কোনো বিষয় বা কি-ওয়ার্ড দিয়ে আবার অনুসন্ধান করুন।"
          />
        </div>
      </div>
    </div>
  );
};
