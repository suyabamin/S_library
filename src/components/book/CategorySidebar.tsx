import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Folder, Sparkles, Layers } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { toBengaliNumber } from '../../lib/utils';

interface CategorySidebarProps {
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  activeCategorySlug,
  onSelectCategory,
}) => {
  const { categories, books } = useLibrary();
  const location = useLocation();

  const isAll = !activeCategorySlug || activeCategorySlug === 'all';
  const isLatest = activeCategorySlug === 'latest';

  return (
    <aside className="w-full bg-white rounded-card border border-brand-border p-3 sm:p-4 card-shadow">
      <div className="flex items-center gap-2 pb-3 mb-2 border-b border-brand-border text-brand-text font-bold text-sm">
        <Folder className="w-4 h-4 text-primary" />
        <span>বইয়ের ক্যাটাগরি</span>
      </div>

      <nav className="space-y-1 text-sm">
        {/* All Books shortcut */}
        <button
          onClick={() => onSelectCategory ? onSelectCategory('all') : null}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition font-medium ${
            isAll
              ? 'bg-primary-soft text-primary font-bold'
              : 'text-brand-text hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> সব বই
          </span>
          <span className="text-xs text-brand-muted bg-gray-100 px-2 py-0.5 rounded-full">
            {toBengaliNumber(books.length)}
          </span>
        </button>

        {/* Latest shortcut */}
        <button
          onClick={() => onSelectCategory ? onSelectCategory('latest') : null}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition font-medium ${
            isLatest
              ? 'bg-primary-soft text-primary font-bold'
              : 'text-brand-text hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" /> সর্বশেষ সংযোজিত
          </span>
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
            নতুন
          </span>
        </button>

        <div className="pt-2 pb-1 border-t border-brand-border/60 text-[11px] font-bold text-brand-muted uppercase tracking-wider px-2">
          সিলেবাস ও বিষয়সমূহ
        </div>

        {/* Category list */}
        {categories.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;
          const count = books.filter((b) => b.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory ? onSelectCategory(cat.slug) : null}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                isActive
                  ? 'bg-primary-soft text-primary font-bold'
                  : 'text-brand-text hover:bg-gray-50'
              }`}
            >
              <span className="truncate pr-2">{cat.nameBn}</span>
              {count > 0 && (
                <span className="text-xs text-brand-muted bg-gray-100/80 px-2 py-0.5 rounded-full shrink-0">
                  {toBengaliNumber(count)}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
