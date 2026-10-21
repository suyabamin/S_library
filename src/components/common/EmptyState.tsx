import React from 'react';
import { BookX, AlertTriangle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'কোনো তথ্য পাওয়া যায়নি',
  description = 'আপনার অনুরোধকৃত বিষয়ের সাথে মিলে এমন কোনো ফলাফল নেই।',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-card border border-brand-border my-6">
      <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-4">
        {icon || <BookX className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-brand-text mb-1">{title}</h3>
      <p className="text-sm text-brand-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-brand-muted">{message}</p>
    </div>
  );
};
