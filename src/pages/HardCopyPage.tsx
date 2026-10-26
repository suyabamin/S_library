import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/book/BookCard';
import { SearchBar } from '../components/common/SearchBar';
import { BorrowRequestModal } from '../components/borrow/BorrowRequestModal';
import { BookMarked, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';
import { toBengaliNumber } from '../lib/utils';
import { EditableText } from '../context/SiteContentContext';

export const HardCopyPage: React.FC = () => {
  const { books } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);

  const physicalBooks = books.filter((b) => b.isPhysicalAvailable);

  const filtered = physicalBooks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Instructions */}
      <div className="bg-gradient-to-r from-[#0d2a45] via-[#0a3d6b] to-[#00A8DC] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200">
            <BookMarked className="w-3.5 h-3.5" /> ফিজিক্যাল লাইব্রেরি সার্ভিস
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold">
            <EditableText contentKey="hardcopy_banner_title" defaultText="হার্ড কপি ধার করুন" />
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            <EditableText
              contentKey="hardcopy_banner_desc"
              defaultText="আপনার পছন্দের ইসলামিক, সিলেবাস ও একাডেমিক বই সরাসরি লাইব্রেরি থেকে ধার নিতে পারেন। আবেদন অনুমোদনের পর ক্যাম্পাস অথবা থানার বাসা থেকে বইটি হাতে তুলে দেওয়া হবে।"
              multiline
            />
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>অনলাইনে সহজ আবেদন</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>ক্যাম্পাস বা থানার বাসা থেকে রিসিভ</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>১৪ দিনের পাঠের মেয়াদ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card border border-brand-border p-4 sm:p-6 card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-brand-text">উপলব্ধ হার্ড কপি বইসমূহ</h2>
          <p className="text-xs text-brand-muted">
            মোট বই: <span className="font-bold text-primary">{toBengaliNumber(filtered.length)}</span> টি
          </p>
        </div>
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="হার্ড কপি বই খুঁজুন..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} showBorrowAction />
        ))}
      </div>

      {/* Borrow Modal */}
      {selectedBookForBorrow && (
        <BorrowRequestModal
          book={selectedBookForBorrow}
          onClose={() => setSelectedBookForBorrow(null)}
        />
      )}
    </div>
  );
};
