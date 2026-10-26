import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BookMarked,
  History,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { NotificationDropdown } from './NotificationDropdown';
import { toBengaliNumber } from '../../lib/utils';

export const SiteHeader: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadNotificationCount } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'হোম', path: '/' },
    { label: 'ক্যাটালগ', path: '/books' },
    { label: 'সংগঠনের ইতিহাস', path: '/history' },
    { label: 'হার্ড কপি', path: '/hard-copy' },
    { label: 'সম্পর্কে', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Main header row — fixed height, no overflow */}
        <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-3">

          {/* Logo & Brand — shrinks on mobile */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none shrink-0 mr-auto lg:mr-0"
            style={{ minWidth: 0 }}
          >
            <img
              src="/assets/logo.webp"
              alt="শিবির লাইব্রেরি, UIU থানা"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 rounded"
              loading="eager"
            />
            <div className="hidden xs:flex flex-col min-w-0">
              <span className="text-sm sm:text-base md:text-lg font-bold text-brand-text tracking-tight group-hover:text-primary transition-colors leading-tight truncate">
                শিবির লাইব্রেরি, <span className="text-primary">UIU থানা</span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-primary tracking-widest hidden sm:block">
                শহিদি কাফেলা
              </span>
            </div>
            {/* On very small screens, show just the short title next to logo */}
            <span className="xs:hidden text-sm font-bold text-brand-text truncate max-w-[140px] group-hover:text-primary transition-colors">
              শিবির লাইব্রেরি
            </span>
          </Link>

          {/* Desktop Navigation — only on large screens */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-4">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 xl:px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive(item.path)
                    ? 'text-primary bg-primary-soft font-semibold'
                    : 'text-brand-muted hover:text-brand-text hover:bg-gray-100/70'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-4 shrink-0">
            {/* Notification Bell — only for authenticated users */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }}
                  aria-label="বিজ্ঞপ্তি"
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-brand-muted hover:text-primary hover:bg-primary-soft transition relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {toBengaliNumber(unreadNotificationCount)}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
                )}
              </div>
            )}

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pl-2 sm:pl-2.5 rounded-full border border-brand-border hover:border-primary/50 transition bg-white"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    {user?.displayName ? user.displayName.slice(0, 1) : 'U'}
                  </div>
                  <span className="hidden md:inline-block text-xs sm:text-sm font-semibold text-brand-text max-w-[90px] xl:max-w-[120px] truncate">
                    {user?.displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-card shadow-lg border border-brand-border py-2 z-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-brand-border">
                      <p className="text-sm font-bold text-brand-text truncate">{user?.displayName}</p>
                      <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> লাইব্রেরি এডমিন
                        </span>
                      )}
                    </div>

                    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition">
                      <LayoutDashboard className="w-4 h-4 text-brand-muted shrink-0" /> ড্যাশবোর্ড
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition">
                      <UserIcon className="w-4 h-4 text-brand-muted shrink-0" /> আমার প্রোফাইল
                    </Link>
                    <Link to="/my-requests" className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition">
                      <BookMarked className="w-4 h-4 text-brand-muted shrink-0" /> আমার ধারসমূহ
                    </Link>
                    <Link to="/my-archive" className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition">
                      <History className="w-4 h-4 text-brand-muted shrink-0" /> আর্কাইভ
                    </Link>

                    {isAdmin && (
                      <div className="border-t border-brand-border my-1">
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary font-bold hover:bg-primary-soft transition">
                          <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> অ্যাডমিন প্যানেল
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-brand-border my-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" /> লগআউট
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-primary hover:bg-primary-soft transition whitespace-nowrap"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition whitespace-nowrap"
                >
                  সাইন আপ
                </Link>
              </div>
            )}

            {/* Mobile Hamburger — only on < lg */}
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setUserMenuOpen(false); setNotificationsOpen(false); }}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 focus:outline-none shrink-0"
              aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-brand-border px-4 pt-2 pb-5 space-y-1 shadow-md">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium ${
                isActive(item.path)
                  ? 'text-primary bg-primary-soft font-semibold'
                  : 'text-brand-text hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Auth Section */}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-brand-border space-y-1">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-brand-text hover:bg-gray-50">
                <LayoutDashboard className="w-4 h-4 text-brand-muted shrink-0" /> ড্যাশবোর্ড
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-brand-text hover:bg-gray-50">
                <UserIcon className="w-4 h-4 text-brand-muted shrink-0" /> আমার প্রোফাইল
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold text-primary hover:bg-primary-soft">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> অ্যাডমিন প্যানেল
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" /> লগআউট
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-brand-border flex gap-3 px-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold text-primary border border-primary hover:bg-primary-soft transition"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition"
              >
                সাইন আপ
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
