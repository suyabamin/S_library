import React, { useState } from 'react';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { NotificationItem } from '../../types';
import { formatBengaliDate, toBengaliNumber } from '../../lib/utils';
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Check,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useLibrary();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <UserDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <span>নোটিফিকেশন সেন্টার</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              বইয়ের অনুমোদন, চ্যাট বার্তা ও ফেরত সংক্রান্ত স্বয়ংক্রিয় নোটিফিকেশন
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-primary font-bold hover:bg-primary-soft px-3 py-1.5 rounded-lg border border-primary/20 transition flex items-center gap-1.5 self-start"
            >
              <Check className="w-4 h-4" /> সব পড়া হয়েছে চিহ্নিত করুন
            </button>
          )}
        </div>

        {/* Tabs matching Reference Screen */}
        <div className="flex border-b border-brand-border text-xs font-semibold gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              filter === 'all'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            সব ({toBengaliNumber(notifications.length)})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              filter === 'unread'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            পড়েননি ({toBengaliNumber(unreadCount)})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              filter === 'read'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            পড়েছেন
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-brand-muted">
              <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">এই ক্যাটাগরিতে কোনো বিজ্ঞপ্তি নেই</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`p-4 rounded-xl border border-brand-border flex items-start gap-4 transition cursor-pointer ${
                  !item.read ? 'bg-primary-50/40 border-primary/30' : 'bg-gray-50/50 hover:bg-white'
                }`}
              >
                <div className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm ${!item.read ? 'font-bold text-brand-text' : 'font-medium text-gray-700'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {formatBengaliDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">{item.body}</p>
                </div>
                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
};
