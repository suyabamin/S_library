import React from 'react';
import { Book } from '../../types';
import { BookCard } from './BookCard';
import { EmptyState } from '../common/EmptyState';

interface BookGridProps {
  books: Book[];
  showBorrowAction?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  showBorrowAction = false,
  emptyTitle,
  emptyDescription,
}) => {
  if (books.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} showBorrowAction={showBorrowAction} />
      ))}
    </div>
  );
};
