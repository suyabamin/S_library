import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, BookMarked, FileText, ExternalLink } from 'lucide-react';
import { Book } from '../../types';
import { toBengaliNumber } from '../../lib/utils';

interface BookCardProps {
  book: Book;
  showBorrowAction?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, showBorrowAction = false }) => {
  return (
    <div className="group bg-white rounded-card border border-brand-border overflow-hidden card-shadow card-shadow-hover flex flex-col h-full">
      {/* Book Cover Image Container */}
      <div className="relative aspect-[3/4] bg-primary-soft/40 overflow-hidden flex items-center justify-center">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="p-6 text-center text-primary-400 flex flex-col items-center">
            <BookOpen className="w-12 h-12 mb-2 opacity-60" />
            <span className="text-xs font-semibold">{book.categoryName || 'বই'}</span>
          </div>
        )}

        {/* Category Pill Tag */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#123047]/80 text-white backdrop-blur-sm">
          {book.categoryName || 'সিলেবাস'}
        </span>

        {/* Physical Stock Badge */}
        {book.isPhysicalAvailable && (
          <span
            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm ${
              (book.availablePhysicalCopies ?? 0) > 0
                ? 'bg-primary/95 text-white'
                : 'bg-rose-600/90 text-white'
            }`}
          >
            {(book.availablePhysicalCopies ?? 0) > 0
              ? `কপি: ${toBengaliNumber(book.availablePhysicalCopies)}`
              : 'স্টক নেই'}
          </span>
        )}
      </div>

      {/* Book Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/books/${book.id}`}
            className="font-bold text-brand-text text-sm sm:text-base line-clamp-1 hover:text-primary transition"
            title={book.title}
          >
            {book.title}
          </Link>
          <p className="text-xs text-brand-muted line-clamp-1 mt-0.5">
            {book.author || 'লেখক অনুল্লেখিত'}
          </p>

          {/* Size / Specs */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
            {book.fileSizeMb && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {toBengaliNumber(book.fileSizeMb)} MB
              </span>
            )}
            {book.pageCount && (
              <span>• {toBengaliNumber(book.pageCount)} পৃষ্ঠা</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-brand-border/60 grid grid-cols-2 gap-1.5 sm:gap-2">
          {book.sourceType === 'external_page' ? (
            <a
              href={book.externalUrl || book.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition text-center shadow-sm min-h-[36px]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> পড়ুন
            </a>
          ) : book.sourceType === 'internal_book' && book.internalBookId ? (
            <Link
              to={`/reader/${book.internalBookId}`}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition text-center shadow-sm min-h-[36px]"
            >
              <BookOpen className="w-3.5 h-3.5" /> পড়ুন
            </Link>
          ) : (
            <Link
              to={`/reader/${book.id}`}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition text-center shadow-sm min-h-[36px]"
            >
              <BookOpen className="w-3.5 h-3.5" /> পড়ুন
            </Link>
          )}

          {showBorrowAction ? (
            <Link
              to={`/borrow/${book.id}`}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-bold text-primary bg-primary-soft hover:bg-primary-soft/80 active:scale-[0.98] border border-primary/20 transition text-center min-h-[36px]"
            >
              <BookMarked className="w-3.5 h-3.5" /> ধার নিন
            </Link>
          ) : book.downloadAllowed ? (
            <a
              href={book.pdfUrl || '#'}
              download={book.downloadAllowed ? `${book.title}.pdf` : undefined}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-semibold text-brand-text bg-gray-100 hover:bg-gray-200 active:scale-[0.98] border border-brand-border transition text-center min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 text-brand-muted" /> ডাউনলোড
            </a>
          ) : (
            <Link
              to={`/books/${book.id}`}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 rounded-lg text-xs font-semibold text-brand-muted bg-gray-50 border border-brand-border active:scale-[0.98] transition text-center min-h-[36px]"
            >
              বিস্তারিত
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
