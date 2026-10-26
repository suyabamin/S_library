import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_HISTORY_ARTICLES } from '../../lib/seedData';
import { History, Calendar, ArrowRight, BookOpen, Image as ImageIcon, FileText } from 'lucide-react';
import { formatBengaliDate } from '../../lib/utils';

export const HistoryListingPage: React.FC = () => {
  const [articles] = useState(INITIAL_HISTORY_ARTICLES);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filtered = articles.filter((a) => {
    if (selectedYear === 'all') return true;
    return a.year === selectedYear;
  });

  const featured = articles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d2a45] via-[#0a3d6b] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-cyan-200">
            <History className="w-3.5 h-3.5" /> আলোকোজ্জ্বল স্মৃতি ও গৌরবময় ইতিহাস
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">সংগঠনের ইতিহাস</h1>
          <p className="text-sm sm:text-base text-cyan-100 leading-relaxed">
            ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি (UIU) ক্যাম্পাসে ইসলামী ছাত্রশিবিরের সূচনালগ্ন থেকে শুরু করে দাওয়াতি ও ছাত্রকল্যাণমূলক কার্যক্রমের প্রামাণ্য ইতিহাস।
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout matching Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter / Timeline Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-card border border-brand-border p-4 card-shadow space-y-2">
            <h3 className="font-bold text-sm text-brand-text pb-2 border-b border-brand-border flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span>ঐতিহাসিক কালক্রম</span>
            </h3>
            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setSelectedYear('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedYear === 'all'
                    ? 'bg-primary text-white'
                    : 'text-brand-text hover:bg-gray-100'
                }`}
              >
                সকল পর্ব
              </button>
              {['২০১৮', '২০২১', '২০২৩'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                    selectedYear === yr
                      ? 'bg-primary text-white'
                      : 'text-brand-text hover:bg-gray-100'
                  }`}
                >
                  <span>বর্ষ {yr}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Article List */}
        <main className="lg:col-span-3 space-y-6">
          {/* Featured Top Article Banner */}
          {featured && selectedYear === 'all' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden card-shadow">
              <div className="relative aspect-[21/9] bg-gray-900 overflow-hidden">
                <img
                  src={featured.featuredImage}
                  alt={featured.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                    বিশেষ প্রচ্ছদ প্রতিবেদন • {featured.year}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold">{featured.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-200 mt-2 line-clamp-2">
                    {featured.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Article Cards */}
          <div className="space-y-4">
            {filtered.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-card border border-brand-border p-5 sm:p-6 card-shadow card-shadow-hover flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="w-full sm:w-48 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-brand-border">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary">
                      {article.year}
                    </span>
                    <span className="text-xs text-brand-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.eventDate || formatBengaliDate(article.createdAt)}
                    </span>
                  </div>

                  <Link
                    to={`/history/${article.slug}`}
                    className="block font-bold text-lg text-brand-text hover:text-primary transition"
                  >
                    {article.title}
                  </Link>

                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={`/history/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:underline"
                    >
                      <span>সম্পূর্ণ পড়ুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
