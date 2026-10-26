import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Download,
  BookMarked,
  FileText,
  Calendar,
  Share2,
  ChevronRight,
  Shield,
  Layers,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { BorrowRequestModal } from '../components/borrow/BorrowRequestModal';
import { BookCard } from '../components/book/BookCard';
import { toBengaliNumber } from '../lib/utils';
import { storageService } from '../lib/storage';

export const BookDetailsPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { getBookById, books } = useLibrary();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const book = getBookById(bookId || '');

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-text mb-2">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-brand-muted mb-6">অনুরোধকৃত বইটি লাইব্রেরি ডাটাবেজে উপস্থিত নেই।</p>
        <Link
          to="/books"
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
        >
          ক্যাটালগে ফিরে যান
        </Link>
      </div>
    );
  }

  const relatedBooks = books
    .filter((b) => b.categoryId === book.categoryId && b.id !== book.id)
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link to="/" className="hover:text-primary transition">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/books" className="hover:text-primary transition">ক্যাটালগ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-primary truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Book Profile Card */}
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-8 card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Cover Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-brand-border bg-primary-soft/40">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-primary-400 p-6 text-center">
                  <BookOpen className="w-16 h-16 mb-2 opacity-50" />
                  <span className="text-xs font-bold">{book.categoryName}</span>
                </div>
              )}
            </div>

            {/* Quick Share */}
            <button
              onClick={handleShare}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-primary transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'লিংক কপি হয়েছে!' : 'বন্ধুদের সাথে শেয়ার করুন'}</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-2">
                <Layers className="w-3.5 h-3.5" /> {book.categoryName || 'সিলেবাস'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
                {book.title}
              </h1>
              <p className="text-base text-brand-muted mt-1 font-medium">
                লেখক: <span className="text-brand-text font-bold">{book.author || 'অনুল্লেখিত'}</span>
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-brand-border text-xs">
              <div>
                <span className="text-brand-muted block">প্রকাশনী:</span>
                <span className="font-bold text-brand-text">{book.publicationInfo || 'ইসলামিক প্রকাশনী'}</span>
              </div>
              <div>
                <span className="text-brand-muted block">ভাষা:</span>
                <span className="font-bold text-brand-text">{book.language || 'বাংলা'}</span>
              </div>
              <div>
                <span className="text-brand-muted block">পৃষ্ঠা সংখ্যা:</span>
                <span className="font-bold text-brand-text">
                  {book.pageCount ? toBengaliNumber(book.pageCount) : 'অজানা'}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block">ফাইল সাইজ:</span>
                <span className="font-bold text-brand-text">
                  {book.fileSizeMb ? `${toBengaliNumber(book.fileSizeMb)} MB` : 'অজানা'}
                </span>
              </div>
            </div>

            {/* Physical Availability Notice */}
            <div className="p-4 rounded-xl bg-primary-soft/60 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#123047] flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-primary" />
                  <span>ফিজিক্যাল হার্ড কপি স্টক:</span>
                  <span className="text-primary bg-white px-2.5 py-0.5 rounded-full border border-primary/20 text-xs font-semibold">
                    {(book.availablePhysicalCopies ?? 0) > 0
                      ? `${toBengaliNumber(book.availablePhysicalCopies)} টি কপি উপলব্ধ`
                      : 'বর্তমানে স্টকে নেই'}
                  </span>
                </h4>
                <p className="text-xs text-brand-muted mt-1">
                  ক্যাম্পাস অথবা থানার বাসা থেকে সরাসরি বই সংগ্রহ করতে পারবেন।
                </p>
              </div>

              <button
                onClick={() => setBorrowModalOpen(true)}
                disabled={(book.availablePhysicalCopies ?? 0) <= 0}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                হার্ড কপি ধার নিন
              </button>
            </div>

            {/* Action Buttons for Digital Reading */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/reader/${book.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-md transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>অনলাইনে পড়ুন</span>
              </Link>

              {book.downloadAllowed ? (
                <a
                  href={storageService.resolveUrl(book.pdfUrl) || '#'}
                  download={`${book.title}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-border bg-gray-50 hover:bg-gray-100 text-brand-text font-bold text-sm transition"
                >
                  <Download className="w-4 h-4 text-brand-muted" />
                  <span>পিডিএফ ডাউনলোড</span>
                </a>
              ) : (
                <span className="text-xs text-brand-muted bg-gray-100 px-3 py-2 rounded-lg">
                  * এই বইটির ডাউনলোড সংরক্ষিত
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4">
              <h3 className="font-bold text-base text-brand-text">বই পরিচিতি ও বিবরণ:</h3>
              <p className="text-brand-muted text-sm leading-relaxed whitespace-pre-wrap">
                {book.description || 'বইটির কোনো বিস্তারিত বিবরণ এখনো যুক্ত করা হয়নি।'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-lg sm:text-xl font-bold text-brand-text">
            একই ক্যাটাগরির অন্যান্য বই
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedBooks.map((rel) => (
              <BookCard key={rel.id} book={rel} showBorrowAction />
            ))}
          </div>
        </section>
      )}

      {/* Borrow Request Modal */}
      {borrowModalOpen && (
        <BorrowRequestModal
          book={book}
          onClose={() => setBorrowModalOpen(false)}
        />
      )}
    </div>
  );
};
