import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BookMarked,
  History,
  LayoutDashboard,
  MessageSquare,
  FileText,
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
    navigate('/');
  };

  const navLinks = [
    { label: 'হোম', path: '/' },
    { label: 'ক্যাটালগ', path: '/books' },
    { label: 'সংগঠনের ইতিহাস', path: '/history' },
    { label: 'হার্ড কপি ধার করুন', path: '/hard-copy' },
    { label: 'আমাদের সম্পর্কে', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-lg overflow-hidden flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
              <img src="/assets/logo.svg" alt="শিবির লাইব্রেরি লোগো" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-brand-text tracking-tight group-hover:text-primary transition-colors">
                শিবির লাইব্রেরি, <span className="text-primary">UIU থানা</span>
              </span>
              <span className="text-xs font-medium text-primary tracking-widest uppercase">
                শহিদি কাফেলা
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'text-primary bg-primary-soft font-semibold'
                    : 'text-brand-muted hover:text-brand-text hover:bg-gray-100/70'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action / Account Section */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="বিজ্ঞপ্তি"
                  className="p-2.5 rounded-full text-brand-muted hover:text-primary hover:bg-primary-soft transition relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {toBengaliNumber(unreadNotificationCount)}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
                )}
              </div>
            )}

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-brand-border hover:border-primary/50 transition bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">
                    {user?.displayName ? user.displayName.slice(0, 1) : 'U'}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-semibold text-brand-text max-w-[120px] truncate">
                    {user?.displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-card shadow-lg border border-brand-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
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

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-muted" /> ড্যাশবোর্ড
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition"
                    >
                      <UserIcon className="w-4 h-4 text-brand-muted" /> আমার প্রোফাইল
                    </Link>

                    <Link
                      to="/my-requests"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition"
                    >
                      <BookMarked className="w-4 h-4 text-brand-muted" /> আমার ধারসমূহ
                    </Link>

                    <Link
                      to="/my-archive"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-text hover:bg-primary-soft hover:text-primary transition"
                    >
                      <History className="w-4 h-4 text-brand-muted" /> আর্কাইভ
                    </Link>

                    {isAdmin && (
                      <div className="border-t border-brand-border my-1">
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary font-bold hover:bg-primary-soft transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary" /> অ্যাডমিন প্যানেল
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-brand-border my-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> লগআউট
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-primary-soft transition"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition"
                >
                  সাইন আপ
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 focus:outline-none"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-brand-border px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary bg-primary-soft font-semibold'
                    : 'text-brand-text hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Auth Links */}
          {isAuthenticated ? (
            <div className="pt-3 border-t border-brand-border space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-base font-medium text-brand-text hover:bg-gray-50"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-muted" /> ড্যাশবোর্ড
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-base font-medium text-brand-text hover:bg-gray-50"
              >
                <UserIcon className="w-4 h-4 text-brand-muted" /> আমার প্রোফাইল
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-base font-bold text-primary hover:bg-primary-soft"
                >
                  <ShieldCheck className="w-4 h-4 text-primary" /> অ্যাডমিন প্যানেল
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> লগআউট
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-brand-border flex gap-3 px-4">
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
