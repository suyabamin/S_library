import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderTree,
  Boxes,
  ClipboardList,
  RotateCcw,
  Users,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { toBengaliNumber } from '../../lib/utils';

export const AdminDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { requests } = useLibrary();
  const navigate = useNavigate();

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const adminMenu = [
    { label: 'ড্যাশবোর্ড', path: '/admin', icon: LayoutDashboard },
    { label: 'ডিজিটাল বই ব্যবস্থাপনা', path: '/admin/books', icon: BookOpen },
    { label: 'নতুন বই যোগ করুন', path: '/admin/books/new', icon: PlusCircle },
    { label: 'ক্যাটাগরি সমূহ', path: '/admin/categories', icon: FolderTree },
    { label: 'ফিজিক্যাল ইনভেন্টরি', path: '/admin/inventory', icon: Boxes },
    {
      label: 'ধার আবেদন সমূহ',
      path: '/admin/requests',
      icon: ClipboardList,
      badge: pendingCount > 0 ? toBengaliNumber(pendingCount) : undefined,
    },
    { label: 'লোন ও রিটার্ন কনফার্ম', path: '/admin/loans', icon: RotateCcw },
    { label: 'ব্যবহারকারী তালিকা', path: '/admin/users', icon: Users },
    { label: 'সংগঠনের ইতিহাস CMS', path: '/admin/history', icon: ScrollText },
    { label: 'সিস্টেম সেটিংস', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#123047] text-white border-b border-[#0d2338] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src="/assets/logo.webp" alt="শিবির লাইব্রেরি, UIU থানা" className="w-8 h-8 object-contain" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs sm:text-sm text-blue-100 group-hover:text-white transition truncate">
                  শিবির লাইব্রেরি অ্যাডমিন
                </span>
                <span className="text-[10px] text-blue-300 font-semibold tracking-wider hidden sm:block">
                  UIU থানা শাখা
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="text-xs text-blue-300 hover:text-white flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 transition whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> মূল সাইট
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/20">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/80 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.displayName ? user.displayName.slice(0, 1) : 'A'}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.displayName || 'এডমিন'}</p>
                <p className="text-[10px] text-blue-300">লাইব্রেরি দায়িত্বশীল</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-card border border-brand-border p-4 card-shadow sticky top-24 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">এডমিন কন্ট্রোল</h4>
                  <p className="text-[11px] text-amber-700">সুরক্ষিত প্রশাসনিক অঞ্চল</p>
                </div>
              </div>

              <nav className="space-y-1">
                {adminMenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin'}
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
                        <span className="truncate">{item.label}</span>
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
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>এডমিন লগআউট</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Admin Content Area */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
};
