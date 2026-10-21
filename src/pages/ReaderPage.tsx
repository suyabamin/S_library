import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { PdfReader } from '../components/book/PdfReader';

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

  return <PdfReader book={book} />;
};
