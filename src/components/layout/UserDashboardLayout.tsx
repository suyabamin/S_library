import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  MessageSquare,
  User,
  History,
  Bell,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { toBengaliNumber } from '../../lib/utils';

export const UserDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { unreadNotificationCount } = useLibrary();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'ড্যাশবোর্ড', path: '/dashboard', icon: LayoutDashboard },
    { label: 'আমার বই (ধার)', path: '/my-loans', icon: BookOpen },
    { label: 'পেন্ডিং রিকোয়েস্ট', path: '/my-requests', icon: BookMarked },
    { label: 'চ্যাট', path: '/chat', icon: MessageSquare },
    { label: 'আমার প্রোফাইল', path: '/profile', icon: User },
    { label: 'আর্কাইভ', path: '/my-archive', icon: History },
    {
      label: 'নোটিফিকেশন',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? toBengaliNumber(unreadNotificationCount) : undefined,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow sticky top-24 space-y-4">
            {/* User Mini Profile */}
            <div className="p-3 rounded-xl bg-primary-soft/50 border border-emerald-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {user?.displayName ? user.displayName.slice(0, 1) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-brand-text truncate">{user?.displayName}</h3>
                <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> এডমিন
                  </span>
                )}
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-primary text-white font-bold shadow-sm'
                          : 'text-brand-text hover:bg-gray-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-brand-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
};
