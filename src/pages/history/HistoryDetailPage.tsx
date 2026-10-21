import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_HISTORY_ARTICLES } from '../../lib/seedData';
import { ChevronRight, Calendar, User, ArrowLeft, ExternalLink, Shield } from 'lucide-react';
import { formatBengaliDate } from '../../lib/utils';

export const HistoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const article = INITIAL_HISTORY_ARTICLES.find(
    (a) => a.slug === slug || a.id === slug
  );

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-text mb-2">প্রতিবেদনটি পাওয়া যায়নি</h2>
        <p className="text-sm text-brand-muted mb-6">অনুরোধকৃত ইতিহাস নিবন্ধটি পাওয়া যায়নি।</p>
        <Link
          to="/history"
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
        >
          ইতিহাস তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const related = INITIAL_HISTORY_ARTICLES.filter((a) => a.id !== article.id);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link to="/" className="hover:text-primary transition">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/history" className="hover:text-primary transition">সংগঠনের ইতিহাস</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-primary truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-10 card-shadow space-y-6">
        {/* Header */}
        <div className="space-y-3 pb-6 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ঐতিহাসিক পর্ব • {article.year}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-text leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {article.eventDate || formatBengaliDate(article.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              {article.authorName || 'শাখা প্রচার ও সাহিত্য পরিষদ'}
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              যাচাইকৃত ঐতিহাসিক প্রামাণ্য দলিল
            </span>
          </div>
        </div>

        {/* Featured Image with Caption */}
        {article.featuredImage && (
          <div className="rounded-2xl overflow-hidden shadow-md border border-brand-border">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto max-h-[460px] object-cover"
            />
            <p className="p-3 bg-gray-50 text-xs text-center text-brand-muted border-t border-brand-border italic">
              চিত্র: {article.title} — UIU থানা শাখার ঐতিহাসিক প্রামাণ্য দৃশ্য
            </p>
          </div>
        )}

        {/* Body Content */}
        <div className="prose max-w-none text-base sm:text-lg text-brand-text leading-relaxed space-y-5 font-bengali">
          {article.body.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Sources / References */}
        {article.sources && article.sources.length > 0 && (
          <div className="pt-6 border-t border-brand-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              তথ্যসূত্র ও দলিল:
            </h4>
            <ul className="space-y-1">
              {article.sources.map((src, i) => (
                <li key={i} className="text-xs text-brand-text flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{src.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="pt-6 space-y-4">
          <h3 className="font-bold text-lg text-brand-text">অন্যান্য ঐতিহাসিক অধ্যায়</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/history/${item.slug}`}
                className="p-4 bg-white rounded-xl border border-brand-border hover:border-primary transition card-shadow space-y-2 block"
              >
                <span className="text-xs font-bold text-primary">{item.year}</span>
                <h4 className="font-bold text-sm text-brand-text">{item.title}</h4>
                <p className="text-xs text-brand-muted line-clamp-2">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
