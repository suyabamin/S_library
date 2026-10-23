import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  History,
  ArrowRight,
  Search,
  Sparkles,
  ChevronRight,
  FileText,
  Users,
  Shield,
  Layers,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/book/BookCard';
import { INITIAL_HISTORY_ARTICLES } from '../lib/seedData';
import { toBengaliNumber } from '../lib/utils';
import { EditableText } from '../context/SiteContentContext';

export const HomePage: React.FC = () => {
  const { books, categories } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const latestBooks = books.slice(0, 4);
  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);
  const latestHistory = INITIAL_HISTORY_ARTICLES[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero / Banner Section matching Reference Image */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#032C20] via-[#054331] to-[#087F5B] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-emerald-400">
        {/* Background Texture & Aesthetic Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: "url('/assets/banner-shelf.png')" }}
        />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
            <EditableText contentKey="hero_badge" defaultText="বাংলাদেশ ইসলামী ছাত্রশিবির • UIU থানা শাখা" />
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
              <EditableText contentKey="hero_title" defaultText="শিবির লাইব্রেরি, UIU থানা" />
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-emerald-200 tracking-wider">
              <EditableText contentKey="hero_tagline" defaultText="শহিদি কাফেলা" />
            </p>
          </div>

          {/* Slogan Quote from Reference */}
          <p className="text-base sm:text-xl font-medium text-emerald-100 max-w-2xl mx-auto italic drop-shadow-sm">
            <EditableText contentKey="hero_quote" defaultText="“জ্ঞান হোক সংগ্রামের শক্তি, বই হোক পরিবর্তনের হাতিয়ার”" />
          </p>

          {/* Integrated Search Bar inside Hero */}
          <div className="max-w-xl mx-auto pt-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বইয়ের নাম, লেখক অথবা বিষয় লিখে খুঁজুন..."
                className="w-full pl-6 pr-28 py-3.5 sm:py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>খুঁজুন</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category Shortcuts Strip matching Reference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-brand-border p-3 sm:p-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-primary-soft text-brand-text hover:text-primary font-semibold text-xs sm:text-sm border border-brand-border/60 transition group whitespace-nowrap"
              >
                <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                <span>{cat.nameBn}</span>
              </Link>
            ))}
            <Link
              to="/books"
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition whitespace-nowrap"
            >
              সবগুলো ক্যাটাগরি →
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Prominent Action Cards matching Reference Screen */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: অনলাইন লাইব্রেরি */}
          <Link
            to="/books"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#065A40] to-[#04402D] p-6 sm:p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-emerald-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              <EditableText contentKey="card1_title" defaultText="অনলাইন লাইব্রেরি" />
            </h3>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6">
              <EditableText contentKey="card1_desc" defaultText="বই পড়ুন, জ্ঞান অর্জন করুন এবং নির্ধারিত বইসমূহের পিডিএফ সরাসরি ডাউনলোড করুন।" multiline />
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 group-hover:text-white transition">
              লাইব্রেরি প্রবেশ করুন <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card 2: হার্ড কপি ধার করুন (Prominent) */}
          <Link
            to="/hard-copy"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D5940] to-[#087F5B] p-6 sm:p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-emerald-400/30"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookMarked className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              <EditableText contentKey="card2_title" defaultText="হার্ড কপি ধার করুন" />
            </h3>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6">
              <EditableText contentKey="card2_desc" defaultText="আপনার পছন্দের সিলেবাস ও ইসলামিক বই সরাসরি ক্যাম্পাসে অথবা থানার বাসা থেকে সংগ্রহ করুন।" multiline />
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200 group-hover:text-white transition">
              বইয়ের তালিকা ও আবেদন <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card 3: সংগঠনের ইতিহাস (Prominent) */}
          <Link
            to="/history"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#123E32] to-[#1E3A8A] p-6 sm:p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <History className="w-7 h-7 text-cyan-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              <EditableText contentKey="card3_title" defaultText="সংগঠনের ইতিহাস" />
            </h3>
            <p className="text-cyan-100 text-sm leading-relaxed mb-6">
              <EditableText contentKey="card3_desc" defaultText="UIU শাখা শিবিরের কার্যক্রমের প্রারম্ভিক ইতিহাস, আলোকোজ্জ্বল স্মৃতি ও গৌরবময় পথচলা।" multiline />
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 group-hover:text-white transition">
              ইতিহাস পাঠ করুন <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Section: সর্বশেষ সংযোজিত বই (Latest Books) matching Reference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <EditableText contentKey="sec1_title" defaultText="সর্বশেষ সংযোজিত বই" />
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
              <EditableText contentKey="sec1_sub" defaultText="লাইব্রেরিতে সম্প্রতি যুক্ত হওয়া নতুন বই ও প্রকাশনা" />
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            <span>সবগুলো দেখুন</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {latestBooks.map((book) => (
            <BookCard key={book.id} book={book} showBorrowAction />
          ))}
        </div>
      </section>

      {/* Section: নির্বাচিত সিলেবাস ও ইসলামিক বই (Featured Books) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>নির্বাচিত ও মৌলিক বইসমূহ</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
              কুরআন, হাদিস এবং সিলেবাসের অত্যাবশ্যকীয় মৌলিক সংকলন
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            <span>ক্যাটালগ দেখুন</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} showBorrowAction />
          ))}
        </div>
      </section>

      {/* Section: সংগঠনের ইতিহাস Featured Story */}
      {latestHistory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 card-shadow overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <History className="w-3.5 h-3.5" /> সংগঠনের সোনালী অধ্যায় • {latestHistory.year}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-text">
                  {latestHistory.title}
                </h3>
                <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                  {latestHistory.summary}
                </p>
                <div className="pt-2">
                  <Link
                    to={`/history/${latestHistory.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm transition"
                  >
                    <span>সম্পূর্ণ ইতিহাস পড়ুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden aspect-[16/10] shadow-md border border-brand-border">
                  <img
                    src={latestHistory.featuredImage}
                    alt={latestHistory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
