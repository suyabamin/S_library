import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { PdfReader } from '../components/book/PdfReader';
import { ExternalLink, BookOpen, ArrowLeft } from 'lucide-react';

export const ReaderPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { getBookById } = useLibrary();

  const book = getBookById(bookId || '');

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-gray-400 mb-6">অনুরোধকৃত বইটি পাওয়া যায়নি বা লিংকটি ভুল।</p>
        <Link
          to="/books"
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
        >
          ক্যাটালগে ফিরে যান
        </Link>
      </div>
    );
  }

  // If this book is linked to an internal book, forward or render that internal book
  if (book.sourceType === 'internal_book' && book.internalBookId) {
    const internal = getBookById(book.internalBookId);
    if (internal) {
      return <PdfReader book={internal} />;
    }
  }

  // If this book is an external webpage, display a graceful landing viewer with an open action
  if (book.sourceType === 'external_page') {
    const targetUrl = book.externalUrl || book.pdfUrl || '';
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-gray-800/80 border border-gray-700 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 inline-block">
              বাহ্যিক ওয়েব রিসোর্স
            </span>
            <h1 className="text-2xl font-bold text-white">{book.title}</h1>
            <p className="text-sm text-gray-400">{book.author || 'লেখক অনুল্লেখিত'}</p>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            এই বইটি মূল প্রকাশনা/অনলাইন রিডিং পোর্টালে সংরক্ষিত আছে। পড়ার জন্য নিচের বাটনে ক্লিক করে সরাসরি ওয়েব পোর্টালে যান।
          </p>

          <div className="space-y-3 pt-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>ওয়েব পোর্টালে বইটি পড়ুন</span>
            </a>

            <Link
              to={`/books/${book.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-700/60 text-gray-300 hover:text-white hover:bg-gray-700 font-semibold text-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>বিস্তারিত তথ্যে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <PdfReader book={book} />;
};
