import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  BookOpen,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { formatBengaliDate, toBengaliNumber } from '../../lib/utils';
import { NotificationItem } from '../../types';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useLibrary();
  const { user, isAdmin } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const validNotifications = notifications.filter((n) => {
    if (n.recipientUid === 'all') return true;
    if (user && n.recipientUid === user.uid) return true;
    if (isAdmin && (n.recipientUid === 'admin' || n.recipientUid === 'all')) return true;
    return false;
  });

  const filtered = validNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = validNotifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'request_approved':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'due_reminder':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'new_book':
        return <BookOpen className="w-5 h-5 text-teal-600" />;
      case 'request_rejected':
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-2xl border border-brand-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between bg-primary-50/40">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-brand-text text-base">নোটিফিকেশন</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {toBengaliNumber(unreadCount)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              title="সব পড়া হয়েছে হিসেবে চিহ্নিত করুন"
              className="text-xs text-primary hover:text-primary-hover font-semibold px-2 py-1 rounded hover:bg-primary-soft transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> সব পড়া হয়েছে
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-brand-muted hover:text-brand-text hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-brand-border bg-gray-50/70 text-xs font-semibold px-3 pt-2">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 px-3 border-b-2 transition ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          সব ({toBengaliNumber(validNotifications.length)})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2 px-3 border-b-2 transition ${
            filter === 'unread'
              ? 'border-primary text-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          পড়েননি ({toBengaliNumber(unreadCount)})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`pb-2 px-3 border-b-2 transition ${
            filter === 'read'
              ? 'border-primary text-primary'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          পড়েছেন
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-brand-muted">
            <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">কোনো নোটিফিকেশন নেই</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-3.5 flex gap-3 hover:bg-gray-50/80 transition cursor-pointer ${
                !item.read ? 'bg-primary-50/30' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0 p-2 rounded-full bg-white shadow-sm border border-gray-100">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4
                    className={`text-sm truncate ${
                      !item.read ? 'font-bold text-brand-text' : 'font-medium text-gray-700'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-brand-muted line-clamp-2 mt-0.5">{item.body}</p>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {formatBengaliDate(item.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-gray-50 border-t border-brand-border text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          সব নোটিফিকেশন দেখুন →
        </Link>
      </div>
    </div>
  );
};
