import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { BorrowRequestModal } from '../../components/borrow/BorrowRequestModal';
import { BookCard } from '../../components/book/BookCard';

export const BorrowPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { getBookById } = useLibrary();
  const navigate = useNavigate();

  const book = getBookById(bookId || '');

  if (!book) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-sm text-brand-muted">বইটি খুঁজে পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <BorrowRequestModal
        book={book}
        onClose={() => navigate(-1)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};
